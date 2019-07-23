const assert = require('assert')
const { userModel, eventModel, taskModel } = require('../schema/indexSchema')
const { ApiResponse } = require('../utils/apiUtils')

module.exports = {
  login: async (req, res) => {
    const { name, password } = req.body
    const result = await userModel.find({ name })
    let state = true
    let data = []
    let message = ''
    if (result.length > 0) {
      let index = result.findIndex(v => v.password === password)
      if (index !== -1) {
        data = result[index]
        message = '登录成功'
      } else {
        state = false
        message = '密码不正确'
      }
    } else {
      state = false
      message = '用户不存在'
    }
    res.json(ApiResponse({ state, data, message }))
  },
  register: async (req, res) => {
    const date = new Date().toISOString()
    const result = await userModel.findOne({ ...req.body })
    let state = true
    let data = []
    let message = ''
    if (result) {
      state = false
      message = '账号已存在，请登录'
    } else {
      const createResult = userModel.create({ ...req.body, date })
      if (createResult) {
        data = createResult
        message = '注册成功，自动登录中'
      } else {
        state = false
        message = '注册失败，请重试'
      }
    }
    res.json(ApiResponse({ state, data, message }))
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
