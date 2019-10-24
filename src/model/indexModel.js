const request = require('request')
const {
  userModel,
  eventModel,
  taskModel,
  logModel,
  versionModel,
  punchModel,
  countdownModel,
  configModel
} = require('../schema/indexSchema')
const { responseData } = require('../utils/apiUtils')
const { formatYMD } = require('../utils/index')
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
  // login
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
              { ...req.body, last_date, formId: formIds },
              { new: true },
              (err, doc) => {
                flag &&
                  insertLog({
                    user_id: doc._id,
                    user_name: doc.nickName,
                    openid: doc.openid,
                    type: 'login',
                    description: err
                  })
                const { _id, openid } = doc
                responseData({
                  res,
                  result: true,
                  data: { _id, openid },
                  message: '登录成功'
                })
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
                last_date
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
                const { _id, openid } = doc
                responseData({
                  res,
                  result: true,
                  data: { _id, openid },
                  message: '登录成功'
                })
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

  // event
  findAllEventsByUserId: async (req, res) => {
    const { user_id } = req.params
    const result = await eventModel
      .find({ user_id, $or: [{ delete: { $exists: false } }, { delete: 0 }] })
      .sort({ level: -1, edit_time: -1, date: -1 })
    responseData({ res, result, data: result })
  },
  findEventByEventId: async (req, res) => {
    const { user_id, event_id } = req.params
    const result = await eventModel.findOne({ user_id, _id: event_id })
    responseData({ res, result, data: result })
  },
  addEvents: async (req, res) => {
    const date = new Date().toISOString()
    const edit_time = date
    const result = await eventModel.create({ ...req.body, date, edit_time })
    responseData({ res, result, data: result, message: '添加成功' })
  },
  editEvents: async (req, res) => {
    const edit_time = new Date().toISOString()
    const { event_id, title, description, level } = req.body
    const doc = { title, description, level, edit_time }
    const result = await eventModel.findOneAndUpdate({ _id: event_id }, doc, {
      new: true
    })
    responseData({ res, result, data: result, message: '操作成功' })
  },
  delEvent: async (req, res) => {
    const { event_id } = req.params
    const result = await eventModel.updateOne({ _id: event_id }, { delete: 1 })
    responseData({ res, result, message: '删除成功' })
  },
  eventStatistics: async (req, res) => {
    const { user_id } = req.params
    const allEvents = await eventModel.find({
      user_id,
      $or: [{ delete: { $exists: false } }, { delete: 0 }]
    })
    let tasks = allEvents.map(async event => {
      return {
        event_id: event._id,
        data: await taskModel.find({
          event_id: event._id,
          $or: [{ delete: { $exists: false } }, { delete: 0 }]
        })
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
    responseData({ res, result: tasksStatisticObj, data: tasksStatisticObj })
  },

  // task
  findAllTasksByEventId: async (req, res) => {
    const { event_id } = req.params
    const result = await taskModel
      .find({ event_id, $or: [{ delete: { $exists: false } }, { delete: 0 }] })
      .sort({ date: -1, state: -1, level: -1 })
    responseData({ res, result, data: result })
  },
  findTaskByTaskId: async (req, res) => {
    const { task_id } = req.params
    const result = await taskModel.findOne({ _id: task_id })
    responseData({ res, result, data: result })
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
    responseData({ res, result, data: result, message: '添加成功' })
  },
  editTask: async (req, res) => {
    const edit_time = new Date().toISOString()
    const { state, task_id, content, level, event_id } = req.body
    const doc = state ? { state: 1, edit_time } : { edit_time, content, level }
    const result = await taskModel.findOneAndUpdate({ _id: task_id }, doc, {
      new: true
    })
    await eventModel.updateOne({ _id: event_id }, { edit_time })
    responseData({ res, result, data: result, message: '操作成功' })
  },
  delTask: async (req, res) => {
    const { task_id } = req.params
    const result = await taskModel.updateOne({ _id: task_id }, { delete: 1 })
    responseData({ res, result, message: '删除成功' })
  },

  // version
  findAllVersion: async (req, res) => {
    const result = await versionModel
      .find({ $or: [{ delete: { $exists: false } }, { delete: 0 }] })
      .sort({ date: -1 })
    responseData({ res, result, data: result })
  },
  releaseNewVersion: async (req, res) => {
    const date = new Date().toISOString()
    const result = await versionModel.create({ ...req.body, date })
    responseData({ res, result, data: result, message: '发布成功' })
  },
  editVersion: async (req, res) => {
    const edit_time = new Date().toISOString()
    const { version_id, version, newVersion, description } = req.body
    let obj = version_id ? { _id: version_id } : { version }
    let doc = { edit_time }
    if (newVersion) {
      doc.version = newVersion
    }
    if (description) {
      doc.description = description
    }
    const result = await versionModel.findOneAndUpdate(
      { ...obj },
      { ...doc },
      { new: true }
    )
    responseData({ res, result, data: result, message: '编辑成功' })
  },
  findVersion: async (req, res) => {
    const { version_info } = req.params
    const reg = new RegExp(/^[a-zA-Z0-9]{24}$/)
    let obj = reg.test(version_info)
      ? { _id: version_info }
      : { version: version_info }
    const result = await versionModel.findOne({
      ...obj,
      $or: [{ delete: { $exists: false } }, { delete: 0 }]
    })
    responseData({ res, result, data: result })
  },
  delVersion: async (req, res) => {
    const { version_info } = req.params
    const reg = new RegExp(/^[a-zA-Z0-9]{24}$/)
    let obj = reg.test(version_info)
      ? { _id: version_info }
      : { version: version_info }
    const result = await versionModel.updateOne({ ...obj }, { delete: 1 })
    responseData({ res, result, message: '删除成功' })
  },

  // punch
  findAllPunch: async (req, res) => {
    const { user_id } = req.params
    const result = await punchModel
      .find({ user_id, $or: [{ delete: { $exists: false } }, { delete: 0 }] })
      .sort({ state: 1, date: -1 })
    let data = []
    result.forEach(v => {
      const currentDate = formatYMD(new Date())
      const start_date = formatYMD(new Date(v.start_date))
      const end_date = formatYMD(new Date(v.end_date))
      const allDays =
        (new Date(end_date).getTime() - new Date(start_date).getTime()) /
          (24 * 3600 * 1000) +
        1
      const okDays = v.punchHistory ? Object.keys(v.punchHistory).length : 0
      const calcEndDate =
        new Date(end_date).getTime() > new Date(currentDate).getTime()
          ? currentDate
          : end_date
      let noOkDays =
        (new Date(calcEndDate).getTime() - new Date(start_date).getTime()) /
          (24 * 3600 * 1000) -
        okDays +
        1
      noOkDays = noOkDays <= 0 ? 0 : noOkDays
      const today = v.punchHistory
        ? Object.keys(v.punchHistory).indexOf(currentDate) !== -1
          ? true
          : false
        : false
      data.push({
        ...v._doc,
        allDays,
        okDays,
        noOkDays,
        today,
        start_date,
        end_date
      })
    })
    responseData({ res, result, data })
  },
  addPunch: async (req, res) => {
    const date = new Date().toISOString()
    const edit_time = date
    const obj = {
      date,
      edit_time,
      ...req.body
    }
    const result = await punchModel.create(obj)
    responseData({ res, result, data: result, message: '添加成功' })
  },
  editPunch: async (req, res) => {
    const edit_time = new Date().toISOString()
    const {
      punch_id,
      today,
      start_date,
      end_date,
      name,
      description
    } = req.body
    const punch = await punchModel.findOne({ _id: punch_id })
    if (today) {
      if (
        new Date(today).getTime() < new Date(punch.start_date) ||
        new Date(today).getTime() > new Date(punch.end_date) ||
        today !== formatYMD(new Date())
      ) {
        responseData({ res, result: true, message: '注意打卡时间' })
        return
      }
      const punchHistory = punch.punchHistory || {}
      if (punchHistory[today]) {
        responseData({ res, result: true, message: '已经打过卡了' })
        return
      }
      const result = await punchModel.findOneAndUpdate(
        { _id: punch_id },
        {
          punchHistory: {
            ...punchHistory,
            [today]: new Date().toISOString()
          },
          edit_time
        },
        { new: true }
      )
      const punchDaysLen =
        (new Date(punch.end_date).getTime() -
          new Date(punch.start_date).getTime()) /
        (24 * 3600 * 1000)
      if (Object.keys(punchHistory).length === punchDaysLen) {
        await punchModel.updateOne({ _id: punch_id }, { state: 1 })
      }
      responseData({ res, result, data: result, message: '打卡成功' })
    } else {
      const result = await punchModel.findOneAndUpdate(
        { _id: punch_id },
        { start_date, end_date, name, description, edit_time },
        { new: true }
      )
      responseData({ res, result, data: result, message: '编辑成功' })
    }
  },
  delPunch: async (req, res) => {
    const { punch_id } = req.params
    const result = await punchModel.updateOne({ _id: punch_id }, { delete: 1 })
    responseData({ res, result, message: '删除成功' })
  },
  findPunchById: async (req, res) => {
    const { punch_id } = req.params
    const result = await punchModel.findOne({
      _id: punch_id,
      $or: [{ delete: { $exists: false } }, { delete: 0 }]
    })
    responseData({ res, result, data: result })
  },

  // colorful eggs
  getColorfulEggs: async (req, res) => {
    const date = new Date(formatYMD(new Date()))
    const result = await configModel.findOne({ date })
    responseData({ res, result, data: result })
  },
  addColorfulEggs: async (req, res) => {
    const { date, config, description } = req.body
    const dateFormat = formatYMD(new Date(date))
    const result = await configModel.create({
      date: dateFormat,
      config,
      description
    })
    responseData({ res, result, data: result, message: '操作成功' })
  }
}
