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

const sendMessage = async (touser, kValue1, kValue2) => {
  const { access_token, template } = global.config
  const template_id = template.template_id
  const body = {
    touser,
    template_id,
    page: 'pages/login/main',
    data: {
      keyword1: {
        value: '1'
      },
      keyword2: {
        value: '2'
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

const sendMessageEachDay = async () => {
  const users = await userModel.find({ openid: { $ne: null } })
  // const tasks = await taskModel.find({}).sort({ date: -1 })
  users.forEach(v => {
    const { openid } = v
    sendMessage(openid)
  })
}

module.exports = {
  checkSignature,
  getAccessToken,
  sendMessageEachDay
}
