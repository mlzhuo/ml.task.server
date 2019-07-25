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
          userModel.findOneAndUpdate(
            { openid },
            req.body,
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
      .sort({ level: -1, date: -1 })
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
    const result = await eventModel.create({ ...req.body, date })
    result &&
      res.json(
        ApiResponse({
          state: true,
          data: result,
          message: '添加成功'
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
    const result = await taskModel.create({ ...req.body, date })
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
    const { state, task_id, content, level } = req.body
    const _id = global.ObjectId(task_id)
    const doc = state ? { state, edit_time } : { edit_time, content, level }
    const result = await taskModel.updateOne({ _id }, doc)
    result &&
      res.json(
        ApiResponse({
          state: true,
          message: '操作成功'
        })
      )
  }
}
