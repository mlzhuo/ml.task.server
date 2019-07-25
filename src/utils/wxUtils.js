const request = require('request')
const jsSHA = require('jssha')
const { AppID, AppSecret, Token, EncodingAESKey } = global.config
const { ApiResponse } = require('../utils/apiUtils')
const { userModel, eventModel, taskModel } = require('../schema/indexSchema')

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

const sendMessage = async (touser, form_id, kValue1, kValue2) => {
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
        console.log(body)
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
  const date = new Date()
  const today = new Date(
    date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate()
  )
  const start = new Date(today.getTime() - 7 * 24 * 3600 * 1000)
  return await taskModel
    .find({ event_id, state: 0, date: { $gte: start } })
    .sort({ date: -1 })
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
  taskResult.forEach((v, i) => {
    taskResult[i] = v.filter(t => t.length > 0)
    let tasksNames = []
    let eventsNames = []
    taskResult[i].forEach(v => {
      const tempEvent = userEvents.find(vv => {
        return vv.find(vvv => {
          return vvv._id == v[0].event_id
        })
      })
      eventsNames.push(tempEvent.find(vv => vv._id == v[0].event_id).title)
      tasksNames.push(v[0].content)
    })
    tasksNames.reverse()
    eventsNames.reverse()
    const tempkValue1 =
      eventsNames.length === 0
        ? '最近的事情都完成了呢 😄'
        : eventsNames.length > 3
        ? `还有${eventsNames.slice(0, 3).join('，')}等${
            eventsNames.length
          }件事没有做完哦`
        : `还有${eventsNames.join('，')}等${eventsNames.length}件事没有做完哦`
    const tempkValue2 =
      tasksNames.length === 0
        ? '👀'
        : tasksNames.length > 5
        ? tasksNames.slice(0, 5).join('\r\n')
        : tasksNames.join('\r\n')
    const { openid, formId } = users[i]
    sendMessage(openid, formId, tempkValue1, tempkValue2)
  })
}

module.exports = {
  checkSignature,
  getAccessToken,
  sendMessageEachDay
}
