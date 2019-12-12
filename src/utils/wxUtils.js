const request = require('request')
const jsSHA = require('jssha')
const { AppID, AppSecret, Token } = global.config
const { responseData } = require('../utils/apiUtils')
const { userModel, eventModel, taskModel } = require('../schema/indexSchema')
const { insertLog } = require('../model/indexModel')
const WXBizDataCrypt = require('./WXBizDataCrypt')

const checkSignature = (req, res) => {
  const { signature, timestamp, nonce, echostr } = req.query
  let tempArr = [timestamp, nonce, Token]
  tempArr.sort()
  const shaObj = new jsSHA(tempArr.join(''), 'TEXT')
  const signatureTemp = shaObj.getHash('SHA-1', 'HEX')
  if (signatureTemp === signature) {
    res.send(echostr)
  } else {
    responseData({ res })
  }
}

const getAccessToken = () => {
  request(
    `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${AppID}&secret=${AppSecret}`,
    async function(error, response, body) {
      if (!error && response.statusCode == 200) {
        const { access_token } = JSON.parse(body)
        global.config.access_token = access_token
        const template = await getTemplate(access_token)
        const priTmplId = template.map(v => v.priTmplId)
        global.config.priTmplId = priTmplId
      } else {
        insertLog({ type: 'access_token', description: error })
      }
    }
  )
}

const getTemplate = access_token => {
  return new Promise((resolve, reject) => {
    request(
      {
        url: `https://api.weixin.qq.com/wxaapi/newtmpl/gettemplate?access_token=${access_token}`,
        method: 'GET',
        json: true,
        headers: {
          'content-type': 'application/json'
        }
      },
      (error, response, body) => {
        if (!error && response.statusCode == 200) {
          resolve(body.data)
        }
        reject(error)
      }
    )
  })
}

// const getTemplateCategory = access_token => {
//   return new Promise((resolve, reject) => {
//     request(
//       {
//         url: `https://api.weixin.qq.com/wxaapi/newtmpl/getcategory?access_token=${access_token}`,
//         method: 'GET',
//         json: true,
//         headers: {
//           'content-type': 'application/json'
//         }
//       },
//       (error, response, body) => {
//         if (!error && response.statusCode == 200) {
//           resolve(body.data)
//         }
//         reject(error)
//       }
//     )
//   })
// }

// const getPubTemplateTitles = (access_token, ids, start, limit) => {
//   start = start || 0
//   limit = limit || 1
//   return new Promise((resolve, reject) => {
//     request(
//       {
//         url: `https://api.weixin.qq.com/wxaapi/newtmpl/getpubtemplatetitles?access_token=${access_token}&ids=${ids}&start=${start}&limit=${limit}`,
//         method: 'GET',
//         json: true,
//         headers: {
//           'content-type': 'application/json'
//         }
//       },
//       (error, response, body) => {
//         if (!error && response.statusCode == 200) {
//           resolve(body.data)
//         }
//         reject(error)
//       }
//     )
//   })
// }

// const getPubTemplateKeywords = (access_token, tid) => {
//   return new Promise((resolve, reject) => {
//     request(
//       {
//         url: `https://api.weixin.qq.com/wxaapi/newtmpl/getpubtemplatekeywords?access_token=${access_token}&tid=${tid}`,
//         method: 'GET',
//         json: true,
//         headers: {
//           'content-type': 'application/json'
//         }
//       },
//       (error, response, body) => {
//         if (!error && response.statusCode == 200) {
//           resolve(body.data)
//         }
//         reject(error)
//       }
//     )
//   })
// }

const sendMessage = (touser, template_id, kValue1, kValue2) => {
  const { access_token } = global.config
  const body = {
    touser,
    template_id,
    page: 'pages/index/main',
    data: {
      thing2: {
        value: kValue1
      },
      thing4: {
        value: kValue2
      }
    }
  }
  request(
    {
      url: `https://api.weixin.qq.com/cgi-bin/message/subscribe/send?access_token=${access_token}`,
      method: 'POST',
      json: true,
      headers: {
        'content-type': 'application/json'
      },
      body
    },
    (error, response, body) => {
      if (!error && response.statusCode == 200) {
        console.log(body.errmsg)
        // insertLog({
        //   openid: touser,
        //   type: 'send_message',
        //   description: body.errmsg
        // })
      }
    }
  )
}

const getEvents = async user_id => {
  return await eventModel
    .find({ user_id, $or: [{ delete: { $exists: false } }, { delete: 0 }] })
    .sort({ level: -1, edit_time: -1, date: -1 })
}

const getTasks = async event_id => {
  return await taskModel
    .find({
      event_id,
      state: 0,
      $or: [{ delete: { $exists: false } }, { delete: 0 }]
    })
    .sort({ date: -1, level: -1 })
}

const sendMessageEachDay = async () => {
  const { access_token } = global.config
  const template = await getTemplate(access_token)
  const priTmplId = template.map(v => v.priTmplId).join(',')
  const users = await userModel.find({ openid: { $ne: null } })
  let eventsPromiseArr = users.map(user => {
    return getEvents(user._id)
  })
  let userEvents = await Promise.all(eventsPromiseArr)
  let tasksPromiseArr = userEvents.map(event => {
    return event.map(item => {
      return getTasks(item._id)
    })
  })
  let userTasks = tasksPromiseArr.map(async task => {
    return await Promise.all([...task])
  })
  let taskResult = await Promise.all([...userTasks])
  taskResult.forEach((eachUserTasks, i) => {
    taskResult[i] = eachUserTasks.filter(t => t.length > 0)
    let tasksContents = []
    let eventsNames = []
    taskResult[i].forEach(eachEventTasks => {
      eventsNames.push(
        userEvents[i].find(event => event._id == eachEventTasks[0].event_id)
          .title
      )
      tasksContents = tasksContents.concat(
        eachEventTasks.map(task => task.content)
      )
    })
    const tempkValue1 =
      eventsNames.length === 0
        ? '最近的事情都完成了呢。😄'
        : `${
            eventsNames[0].length > 10
              ? eventsNames[0].slice(0, 10)
              : eventsNames[0]
          }等${eventsNames.length}个分类`
    const tempkValue2 =
      tasksContents.length === 0
        ? '继续保持，加油！'
        : `${
            tasksContents[0].length > 5
              ? tasksContents[0].slice(0, 5) + '...'
              : tasksContents[0]
          }等${tasksContents.length}条记录未完成。`
    const { openid } = users[i]
    sendMessage(openid, priTmplId, tempkValue1, tempkValue2)
  })
}

const getCurrentWeRunData = ({
  signature,
  rawData,
  encryptedData,
  iv,
  openid,
  sessionKey
}) => {
  return new Promise((resolve, reject) => {
    const signature2 = new jsSHA(rawData + sessionKey, 'TEXT').getHash(
      'SHA-1',
      'HEX'
    )
    if (signature === signature2) {
      const pc = new WXBizDataCrypt(AppID, sessionKey)
      const data = pc.decryptData(encryptedData, iv)
      resolve(data)
    } else {
      reject(null)
    }
  })
}

module.exports = {
  checkSignature,
  getAccessToken,
  sendMessageEachDay,
  getCurrentWeRunData
}
