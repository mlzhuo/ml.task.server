const request = require('request')
const jsSHA = require('jssha')
const { AppID, AppSecret, TemplateId, Token, EncodingAESKey } = global.config
const { ApiResponse } = require('../utils/apiUtils')

const getAccessToken = () => {
  request(
    `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${AppID}&secret=${AppSecret}`,
    function(error, response, body) {
      if (!error && response.statusCode == 200) {
        const { access_token, expires_in } = JSON.parse(body)
        global.tempAccessToken = {
          access_token,
          expires_in
        }
        getTemplateLibraryById(access_token)
      }
    }
  )
}

const getTemplateLibraryById = access_token => {
  request.post(
    {
      url: `https://api.weixin.qq.com/cgi-bin/wxopen/template/library/get?access_token=${access_token}`,
      body: JSON.stringify({ id: TemplateId })
    },
    (error, response, body) => {
      if (!error && response.statusCode == 200) {
        console.log(JSON.parse(body))
      }
    }
  )
}

const checkSignature = (req, res) => {
  const { signature, timestamp, nonce } = req.query
  let str = `nonce=${nonce}&server_token=${Token}&timestamp=${timestamp}`
  const shaObj = new jsSHA(str, 'TEXT')
  const signatureTemp = shaObj.getHash('SHA-1', 'HEX')
  if (signatureTemp === signature) {
    res.json(true)
  } else {
    res.json(false)
  }
}

module.exports = {
  getAccessToken,
  getTemplateLibraryById,
  checkSignature
}
