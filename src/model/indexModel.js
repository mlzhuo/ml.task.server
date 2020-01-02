const request = require('request')
const {
  userModel,
  eventModel,
  taskModel,
  logModel,
  versionModel,
  punchModel,
  countdownModel,
  configModel,
  werunModel
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
    const { priTmplId } = global.config
    request(
      `https://api.weixin.qq.com/sns/jscode2session?appid=${AppID}&secret=${AppSecret}&js_code=${code}&grant_type=authorization_code`,
      async (error, response, body) => {
        if (!error && response.statusCode == 200) {
          const { session_key, openid } = JSON.parse(body)
          if (!global.session_key) {
            global.session_key = {}
          }
          global.session_key[openid] = session_key
          delete req.body.code
          const last_date = new Date().toISOString()
          const user = await userModel.findOne({ openid })
          if (user) {
            userModel.findOneAndUpdate(
              { openid },
              { ...req.body, last_date },
              { new: true },
              (err, doc) => {
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
                  data: { _id, openid, priTmplId },
                  message: '登录成功'
                })
              }
            )
          } else {
            userModel.findOneAndUpdate(
              { openid },
              {
                ...req.body,
                date: last_date,
                last_date
              },
              { new: true, upsert: true },
              (err, doc) => {
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
                  data: { _id, openid, priTmplId },
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

  // version
  findAllVersion: async (req, res) => {
    const { limit } = req.query
    const result = await versionModel
      .find({ $or: [{ delete: { $exists: false } }, { delete: 0 }] })
      .sort({ date: -1 })
    const data = limit ? result.slice(0, limit) : result
    responseData({ res, result, data })
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
      if (currentDate === start_date && !today) {
        noOkDays = 0
      }
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
    const { start_date, end_date } = req.body
    delete req.body.start_date
    delete req.body.end_date
    const obj = {
      date,
      edit_time,
      start_date: new Date(start_date + ' 00:00:00').toISOString(),
      end_date: new Date(end_date + ' 23:59:59').toISOString(),
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
        new Date(today).getTime() < new Date(punch.start_date).getTime() ||
        new Date(today).getTime() > new Date(punch.end_date).getTime() ||
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
      const newPunchHistory = {
        ...punchHistory,
        [today]: new Date().toISOString()
      }
      const result = await punchModel.findOneAndUpdate(
        { _id: punch_id },
        {
          punchHistory: newPunchHistory,
          edit_time
        },
        { new: true }
      )
      const punchDaysLen =
        (new Date(punch.end_date).getTime() +
          1000 -
          new Date(punch.start_date).getTime()) /
        (24 * 3600 * 1000)
      if (Object.keys(newPunchHistory).length === punchDaysLen) {
        await punchModel.updateOne({ _id: punch_id }, { state: 1 })
      }
      responseData({ res, result, data: result, message: '打卡成功' })
    } else {
      const result = await punchModel.findOneAndUpdate(
        { _id: punch_id },
        {
          start_date: new Date(start_date + ' 00:00:00').toISOString(),
          end_date: new Date(end_date + ' 23:59:59').toISOString(),
          name,
          description,
          edit_time
        },
        { new: true }
      )
      const punchDaysLen =
        (new Date(result.end_date).getTime() +
          1000 -
          new Date(result.start_date).getTime()) /
        (24 * 3600 * 1000)
      if (Object.keys(result.punchHistory).length === punchDaysLen) {
        await punchModel.updateOne({ _id: punch_id }, { state: 1 })
      }
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
  clearInvalidPunchState: async (req, res) => {
    const date = new Date()
    punchModel.updateMany({ end_date: { $lte: date } }, { state: 1 })
  },

  // countdown
  findAllCountdown: async (req, res) => {
    const { user_id } = req.params
    const result = await countdownModel
      .find({ user_id, $or: [{ delete: { $exists: false } }, { delete: 0 }] })
      .sort({ date: -1 })
    responseData({ res, result, data: result })
  },
  addCountdown: async (req, res) => {
    const date = new Date().toISOString()
    const { target_date, description, name, user_id } = req.body
    delete req.body.target_date
    const result = await countdownModel.create({
      description,
      name,
      user_id,
      target_date: new Date(target_date).toISOString(),
      date,
      edit_time: date
    })
    responseData({ res, result, data: result, message: '添加成功' })
  },
  editCountdown: async (req, res) => {
    const edit_time = new Date().toISOString()
    const { countdown_id, target_date, name, description } = req.body
    let state = 0
    if (new Date(target_date).getTime() <= new Date().getTime()) {
      state = 1
    }
    const result = await countdownModel.findOneAndUpdate(
      { _id: countdown_id },
      { target_date, name, description, edit_time, state }
    )
    responseData({ res, result, data: result, message: '编辑成功' })
  },
  delCountdown: async (req, res) => {
    const { countdown_id } = req.params
    const result = await countdownModel.updateOne(
      { _id: countdown_id },
      { delete: 1 }
    )
    responseData({ res, result, message: '删除成功' })
  },
  findCountdownById: async (req, res) => {
    const { countdown_id } = req.params
    const result = await countdownModel.findOne({
      _id: countdown_id,
      $or: [{ delete: { $exists: false } }, { delete: 0 }]
    })
    responseData({ res, result, data: result })
  },
  clearInvalidCountdownState: async (req, res) => {
    const date = new Date()
    countdownModel.updateMany({ target_date: { $lte: date } }, { state: 1 })
  },

  // werun
  weRun: async (req, res) => {
    const { signature, rawData, encryptedData, iv, openid, user_id } = req.body
    const sessionKey =
      (global.session_key && global.session_key[openid]) || null
    const { getCurrentWeRunData } = require('../utils/wxUtils')
    const currentWeRunData = await getCurrentWeRunData({
      signature,
      rawData,
      encryptedData,
      iv,
      openid,
      sessionKey
    })
    if (currentWeRunData) {
      currentWeRunData.stepInfoList.forEach(v => {
        werunModel.updateOne(
          { date: new Date(v.timestamp * 1000).toISOString() },
          {
            date: new Date(v.timestamp * 1000).toISOString(),
            step: v.step,
            user_id
          },
          { new: true, upsert: true },
          (err, doc) => {}
        )
      })
    }

    const day = new Date().getDate()
    const week = new Date().getDay()
    const year = new Date().getFullYear()
    const month = new Date().getMonth() + 1
    const years = await werunModel.aggregate([
      // { $project: { date: { $substr: ['$date', 0, 4] }, step: 1 } },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y',
              date: { $add: ['$date', 8 * 3600000] }
            }
          },
          step: { $sum: '$step' }
        }
      },
      { $sort: { _id: -1 } }
    ])
    const monthResult = await werunModel
      .find({}, 'date step')
      .sort({ date: -1 })
      .limit(day)
    let weekResult = await werunModel
      .find({}, 'date step')
      .sort({ date: -1 })
      .limit(week === 0 ? 7 : week)
    const yearStep = years[0].step
    const monthStep = monthResult.reduce((p, e) => p + e.step, 0)
    const weekStep = weekResult.reduce((p, e) => p + e.step, 0)
    const dayStep = monthResult[0].step

    responseData({
      res,
      result: 1,
      data: {
        yearStep,
        monthStep,
        weekStep,
        dayStep,
        years
      }
    })
  },
  weRunEachYear: async (req, res) => {
    const { year } = req.params
    const yearResult = await werunModel.aggregate([
      {
        $match: {
          date: {
            $gte: new Date(`${year}-01-01 00:00:00`),
            $lte: new Date(`${year}-12-31 23:59:59`)
          }
        }
      },
      // { $project: { date: { $substr: ['$date', 5, 2] }, step: 1 } },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%m',
              date: { $add: ['$date', 8 * 3600000] }
            }
          },
          step: { $sum: '$step' }
        }
      },
      { $sort: { _id: -1 } }
    ])

    responseData({
      res,
      result: 1,
      data: yearResult
    })
  },
  weRunEachMonth: async (req, res) => {
    const { year, month } = req.params
    const endDay = formatYMD(new Date(year, month, 0))
    const yearResult = await werunModel.aggregate([
      {
        $match: {
          date: {
            $gte: new Date(`${year}-${month}-01 00:00:00`),
            $lte: new Date(`${endDay} 23:59:59`)
          }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%d',
              date: { $add: ['$date', 8 * 3600000] }
            }
          },
          step: { $sum: '$step' }
        }
      },
      { $sort: { _id: -1 } }
    ])

    responseData({
      res,
      result: 1,
      data: yearResult
    })
  },

  // tools data overview
  toolsDataOverview: async (req, res) => {
    const { user_id } = req.params
    const punchIsActive = await punchModel.find({
      user_id,
      state: 0,
      $or: [{ delete: { $exists: false } }, { delete: 0 }]
    })
    const today = formatYMD(new Date())
    let isPunch = 0
    punchIsActive.forEach(v => {
      const { punchHistory } = v
      if (
        new Date().getTime() >= new Date(v.start_date).getTime() &&
        new Date().getTime() <= new Date(v.end_date).getTime() &&
        punchHistory[today]
      ) {
        isPunch++
      }
    })
    const punchObj = {
      isActive: punchIsActive.length,
      todayIsDone: isPunch
    }
    responseData({
      res,
      result: 1,
      data: {
        punch: punchObj
      }
    })
  }
}
