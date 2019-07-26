const mongoose = require('../db/db')
const Schema = mongoose.Schema

const userSchema = new Schema({
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

module.exports = {
  userModel: mongoose.model('User', userSchema),
  eventModel: mongoose.model('Event', eventSchema),
  taskModel: mongoose.model('Task', taskSchema)
}
