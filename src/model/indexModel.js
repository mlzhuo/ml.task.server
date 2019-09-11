const request = require('request')
const {
  userModel,
  eventModel,
  taskModel,
  logModel
} = require('../schema/indexSchema')
const { ApiResponse } = require('../utils/apiUtils')
const { AppID, AppSecret } = global.config

const insertLog = ({ user_id, user_name, openid, type, description }) => {
  let doc = {
    user_id,
    user_name,
    openid,
    type,
    description: description || 'ok',
    date: new Date().toISOString()
  }
  logModel.create(doc)
}

module.exports = {
  insertLog,
  login: async (req, res) => {
    const { code } = req.body
    request(
      `https://api.weixin.qq.com/sns/jscode2session?appid=${AppID}&secret=${AppSecret}&js_code=${code}&grant_type=authorization_code`,
      async (error, response, body) => {
        if (!error && response.statusCode == 200) {
          const openid = JSON.parse(body).openid
          delete req.body.code
          const last_date = new Date().toISOString()
          const user = await userModel.findOne({ openid })
          const devToolFormId = 'the formId is a mock one'
          const formIdFromResBody = req.body.formId
          const flag = formIdFromResBody !== devToolFormId
          if (user) {
            const isNewUser =
              new Date(user.date).getDate() === new Date(last_date).getDate()
            let formIds
            if (user.formId) {
              let formIdFromUser = user.formId.split(',')
              flag && formIdFromUser.push(formIdFromResBody)
              formIds = formIdFromUser.slice(-7).join(',')
            } else {
              if (flag) {
                formIds = formIdFromResBody
              }
            }
            delete req.body.formId
            userModel.findOneAndUpdate(
              { openid },
              { ...req.body, last_date, formId: formIds, isNewUser },
              (err, doc) => {
                flag &&
                  insertLog({
                    user_id: doc._id,
                    user_name: doc.nickName,
                    openid: doc.openid,
                    type: 'login',
                    description: err
                  })
                res.json(
                  ApiResponse({ state: true, data: doc, message: '登录成功' })
                )
              }
            )
          } else {
            if (!flag) {
              delete req.body.formId
            }
            userModel.findOneAndUpdate(
              { openid },
              {
                ...req.body,
                formId: '',
                date: last_date,
                last_date,
                isNewUser: true
              },
              { new: true, upsert: true },
              (err, doc) => {
                flag &&
                  insertLog({
                    user_id: doc._id,
                    user_name: doc.nickName,
                    openid: doc.openid,
                    type: 'login',
                    description: err
                  })
                res.json(
                  ApiResponse({ state: true, data: doc, message: '登录成功' })
                )
              }
            )
          }
        } else {
          insertLog({
            type: 'login',
            description: error
          })
        }
      }
    )
  },
  findEventsByUserId: async (req, res) => {
    const { user_id } = req.params
    const result = await eventModel
      .find({ user_id })
      .sort({ level: -1, edit_time: -1, date: -1 })
    result &&
      res.json(
        ApiResponse({
          state: true,
          data: result
        })
      )
  },
  findEventByEventId: async (req, res) => {
    const { user_id, event_id } = req.params
    const result = await eventModel.findOne({ user_id, _id: event_id })
    result &&
      res.json(
        ApiResponse({
          state: true,
          data: result
        })
      )
  },
  addEvents: async (req, res) => {
    const date = new Date().toISOString()
    const edit_time = date
    const result = await eventModel.create({ ...req.body, date, edit_time })
    result &&
      res.json(
        ApiResponse({
          state: true,
          data: result,
          message: '添加成功'
        })
      )
  },
  editEvents: async (req, res) => {
    const edit_time = new Date().toISOString()
    const { event_id, title, description, level } = req.body
    const doc = title ? { title, description, level, edit_time } : { edit_time }
    const _id = global.ObjectId(event_id)
    const result = await eventModel.updateOne({ _id }, doc)
    result &&
      res.json(
        ApiResponse({
          state: true,
          message: '操作成功'
        })
      )
  },
  eventStatistics: async (req, res) => {
    const { user_id } = req.params
    const allEvents = await eventModel.find({ user_id })
    let tasks = allEvents.map(async event => {
      return {
        event_id: event._id,
        data: await taskModel.find({ event_id: event._id })
      }
    })
    let tasksResult = await Promise.all([...tasks])
    let tasksStatisticObj = {}
    tasksResult.forEach(eachEventTasks => {
      const { event_id, data } = eachEventTasks
      if (data.length === 0) {
        tasksStatisticObj[event_id] = {
          isDone: 0,
          all: 0
        }
      } else {
        const isDone = data.filter(v => v.state === 1).length
        tasksStatisticObj[event_id] = {
          isDone,
          all: data.length
        }
      }
    })
    res.json(
      ApiResponse({
        state: true,
        data: tasksStatisticObj
      })
    )
  },
  findTasksByEventId: async (req, res) => {
    const { event_id } = req.params
    const result = await taskModel
      .find({ event_id })
      .sort({ date: -1, state: -1, level: -1 })
    result &&
      res.json(
        ApiResponse({
          state: true,
          data: result
        })
      )
  },
  findTaskByTaskId: async (req, res) => {
    const { task_id } = req.params
    const result = await taskModel.findOne({ _id: task_id })
    result &&
      res.json(
        ApiResponse({
          state: true,
          data: result
        })
      )
  },
  addTask: async (req, res) => {
    const date = new Date().toISOString()
    const edit_time = date
    const { content, level, event_id } = req.body
    const result = await taskModel.create({
      event_id,
      content,
      level,
      date,
      edit_time
    })
    await eventModel.updateOne({ _id: event_id }, { edit_time })
    result &&
      res.json(
        ApiResponse({
          state: true,
          data: result,
          message: '添加成功'
        })
      )
  },
  editTask: async (req, res) => {
    const edit_time = new Date().toISOString()
    const { state, task_id, content, level, event_id } = req.body
    const _id = global.ObjectId(task_id)
    const doc = state ? { state, edit_time } : { edit_time, content, level }
    const result = await taskModel.updateOne({ _id }, doc)
    await eventModel.updateOne({ _id: event_id }, { edit_time })
    result &&
      res.json(
        ApiResponse({
          state: true,
          message: '操作成功'
        })
      )
  }
}
