const request = require('request')
const jsSHA = require('jssha')
const { AppID, AppSecret, Token } = global.config
const { ApiResponse } = require('../utils/apiUtils')
const { userModel, eventModel, taskModel } = require('../schema/indexSchema')
const { insertLog } = require('../model/indexModel')

const checkSignature = (req, res) => {
  const { signature, timestamp, nonce, echostr } = req.query
  let tempArr = [timestamp, nonce, Token]
  tempArr.sort()
  const shaObj = new jsSHA(tempArr.join(''), 'TEXT')
  const signatureTemp = shaObj.getHash('SHA-1', 'HEX')
  if (signatureTemp === signature) {
    res.send(echostr)
  } else {
    res.json(
      ApiResponse({
        state: false,
        message: 'error'
      })
    )
  }
}

const getAccessToken = () => {
  request(
    `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${AppID}&secret=${AppSecret}`,
    function(error, response, body) {
      if (!error && response.statusCode == 200) {
        const { access_token } = JSON.parse(body)
        global.config.access_token = access_token
        getTemplateLibraryList(access_token)
      } else {
        insertLog({ type: 'access_token', description: error })
      }
    }
  )
}

const getTemplateLibraryList = access_token => {
  request(
    {
      url: `https://api.weixin.qq.com/cgi-bin/wxopen/template/list?access_token=${access_token}`,
      method: 'POST',
      json: true,
      headers: {
        'content-type': 'application/json'
      },
      body: {
        offset: 0,
        count: 1
      }
    },
    (error, response, body) => {
      if (!error && response.statusCode == 200) {
        global.config.template = body.list[0]
      }
    }
  )
}

const sendMessage = async (touser, form_id, kValue1, kValue2, callback) => {
  const { access_token, template } = global.config
  const template_id = template.template_id
  const body = {
    touser,
    template_id,
    page: 'pages/login/main',
    form_id,
    data: {
      keyword1: {
        value: kValue1
      },
      keyword2: {
        value: kValue2
      }
    }
  }
  request(
    {
      url: `https://api.weixin.qq.com/cgi-bin/message/wxopen/template/send?access_token=${access_token}`,
      method: 'POST',
      json: true,
      headers: {
        'content-type': 'application/json'
      },
      body
    },
    (error, response, body) => {
      if (!error && response.statusCode == 200) {
        insertLog({
          openid: touser,
          type: 'send_message',
          description: body.errmsg
        })
        callback && callback()
      }
    }
  )
}

const getEvents = async user_id => {
  return await eventModel
    .find({
      user_id
    })
    .sort({ date: -1 })
}

const getTasks = async event_id => {
  return await taskModel.find({ event_id, state: 0 }).sort({ date: -1 })
}

const sendMessageEachDay = async () => {
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
        : `${eventsNames.join('，')}等${eventsNames.length}个分类中的${
            tasksContents.length
          }条记录尚未确认。`
    const tempkValue2 =
      tasksContents.length === 0
        ? '继续保持，加油！'
        : tasksContents.map((v, i) => i + 1 + '.' + v).join('\r\n')
    const { openid, formId } = users[i]
    if (formId && formId.split(',').length > 0) {
      const formid = formId.split(',')[0]
      sendMessage(openid, formid, tempkValue1, tempkValue2, () => {
        const lastFormIds = formId.split(',').slice(1)
        userModel.findOneAndUpdate(
          { openid },
          { formId: lastFormIds.join(',') },
          (err, doc) => {
            if (err) {
              console.log('err', err)
            }
          }
        )
      })
    }
  })
}

module.exports = {
  checkSignature,
  getAccessToken,
  sendMessageEachDay
}
