var createError = require('http-errors')
var express = require('express')
var path = require('path')
var cookieParser = require('cookie-parser')
var logger = require('morgan')
const bodyParser = require('body-parser')
const schedule = require('node-schedule')
const { getAccessToken, sendMessageEachDay } = require('./utils/wxUtils')
const { clearInvalidPunchState, clearInvalidCountdownState } = require('./model/indexModel')
var indexRouter = require('./routes/index')
var app = express()
app.all('*', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header(
    'Access-Control-Allow-Headers',
    'Content-Type,Content-Length, Authorization, Accept,X-Requested-With'
  )
  res.header('Access-Control-Allow-Methods', 'PUT,POST,GET,DELETE,OPTIONS')
  res.header('X-Powered-By', ' 3.2.1')
  res.header('Content-Type', 'application/json;charset=utf-8')
  if (req.method == 'OPTIONS') {
    res.send(200)
  } else {
    next()
  }
})
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())

app.use('/api', indexRouter)

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404))
})

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  res.status(err.status || 500)
  res.json({
    message: err.message,
    error: err
  })
})

// 每两个小时更新 access_token
getAccessToken()
setInterval(getAccessToken, 7150 * 1000)

const scheduleTask = () => {
  // 每天18:30 推送消息
  schedule.scheduleJob('0 30 18 * * *', () => {
    sendMessageEachDay()
  })
  schedule.scheduleJob('0 0 01 * * *', () => {
    // 每天定时清理非法打卡状态, 非法倒计时状态
    clearInvalidPunchState()
    clearInvalidCountdownState()
  })
}
scheduleTask()

module.exports = app
