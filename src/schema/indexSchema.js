const mongoose = require('../db/db')
const Schema = mongoose.Schema

const userSchema = new Schema({
  date: { type: Date },
  last_date: { type: Date },
  openid: { type: String },
  formId: { type: String },
  nickName: { type: String },
  gender: { type: Number },
  language: { type: String },
  city: { type: String },
  province: { type: String },
  country: { type: String },
  avatarUrl: { type: String },
  isNewUser: { type: Boolean }
})

const eventSchema = new Schema({
  title: { type: String },
  description: { type: String, default: '暂无描述' },
  date: { type: Date },
  edit_time: { type: Date },
  level: { type: Number, default: 0 },
  user_id: { type: String }
})

const taskSchema = new Schema({
  content: { type: String },
  date: { type: Date },
  edit_time: { type: Date },
  state: { type: Number, default: 0 },
  level: { type: Number, default: 0 },
  event_id: { type: String }
})

const logSchema = new Schema({
  description: { type: String },
  user_id: { type: String },
  user_name: { type: String },
  openid: { type: String },
  type: { type: String },
  date: { type: Date }
})

module.exports = {
  userModel: mongoose.model('User', userSchema),
  eventModel: mongoose.model('Event', eventSchema),
  taskModel: mongoose.model('Task', taskSchema),
  logModel: mongoose.model('Log', logSchema)
}
