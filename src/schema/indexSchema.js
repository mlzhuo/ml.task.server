const mongoose = require('../db/db')
const Schema = mongoose.Schema

const userSchema = new Schema({
  name: { type: String },
  password: { type: String },
  date: { type: Date }
})

const eventSchema = new Schema({
  title: { type: String },
  description: { type: String, default: '暂无描述' },
  date: { type: Date },
  level: { type: Number, default: 0 },
  user_id: { type: String }
})

const taskSchema = new Schema({
  content: { type: String },
  date: { type: Date },
  edit_time: { type: Date, default: new Date('1970-01-01').toISOString() },
  state: { type: Number, default: 0 },
  level: { type: Number, default: 0 },
  event_id: { type: String }
})

module.exports = {
  userModel: mongoose.model('User', userSchema),
  eventModel: mongoose.model('Event', eventSchema),
  taskModel: mongoose.model('Task', taskSchema)
}
