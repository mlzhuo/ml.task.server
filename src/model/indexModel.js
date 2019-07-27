const request = require('request')
const { userModel, eventModel, taskModel } = require('../schema/indexSchema')
const { ApiResponse } = require('../utils/apiUtils')
const { AppID, AppSecret } = global.config

module.exports = {
  login: async (req, res) => {
    const { code } = req.body
    request(
      `https://api.weixin.qq.com/sns/jscode2session?appid=${AppID}&secret=${AppSecret}&js_code=${code}&grant_type=authorization_code`,
      async (error, response, body) => {
        if (!error && response.statusCode == 200) {
          const openid = JSON.parse(body).openid
          delete req.body.code
          const last_date = new Date().toISOString()
          userModel.findOneAndUpdate(
            { openid },
            { ...req.body, last_date },
            { new: true, upsert: true },
            (err, doc) => {
              res.json(
                ApiResponse({ state: true, data: doc, message: '登录成功' })
              )
            }
          )
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
  findTasksByEventId: async (req, res) => {
    const { event_id } = req.params
    const result = await taskModel
      .find({ event_id })
      .sort({ level: -1, date: -1, state: -1 })
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
