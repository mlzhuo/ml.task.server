const mongoose = require('../db/db')
const Schema = mongoose.Schema

const userSchema = new Schema({
  date: { type: Date },
  last_date: { type: Date },
  openid: { type: String },
  nickName: { type: String },
  gender: { type: Number },
  language: { type: String },
  city: { type: String },
  province: { type: String },
  country: { type: String },
  avatarUrl: { type: String }
})

const eventSchema = new Schema({
  title: { type: String },
  description: { type: String },
  date: { type: Date },
  edit_time: { type: Date },
  level: { type: Number, default: 0 },
  user_id: { type: String },
  delete: { type: Number }
})

const taskSchema = new Schema({
  content: { type: String },
  date: { type: Date },
  edit_time: { type: Date },
  state: { type: Number, default: 0 },
  level: { type: Number, default: 0 },
  event_id: { type: String },
  delete: { type: Number }
})

const logSchema = new Schema({
  description: { type: String },
  user_id: { type: String },
  openid: { type: String },
  type: { type: String },
  date: { type: Date }
})

const versionSchema = new Schema({
  version: { type: String },
  description: { type: String },
  date: { type: Date },
  edit_time: { type: Date },
  delete: { type: Number },
  public: { type: Number, default: 1 }
})

const punchSchema = new Schema({
  date: { type: Date },
  edit_time: { type: Date },
  state: { type: Number, default: 0 },
  start_date: { type: Date },
  end_date: { type: Date },
  name: { type: String },
  description: { type: String },
  user_id: { type: String },
  punchHistory: { type: Object, default: {} },
  delete: { type: Number }
})

const countdownSchema = new Schema({
  date: { type: Date },
  edit_time: { type: Date },
  state: { type: Number, default: 0 },
  target_date: { type: Date },
  name: { type: String },
  description: { type: String },
  user_id: { type: String },
  delete: { type: Number }
})

const configSchema = new Schema({
  date: { type: Date },
  description: { type: String },
  config: { type: Object }
})

const werunSchema = new Schema({
  date: { type: Date },
  step: { type: Number },
  user_id: { type: String }
})

module.exports = {
  userModel: mongoose.model('User', userSchema),
  eventModel: mongoose.model('Event', eventSchema),
  taskModel: mongoose.model('Task', taskSchema),
  logModel: mongoose.model('Log', logSchema),
  versionModel: mongoose.model('Version', versionSchema),
  punchModel: mongoose.model('Punch', punchSchema),
  countdownModel: mongoose.model('Countdown', countdownSchema),
  configModel: mongoose.model('Config', configSchema),
  werunModel: mongoose.model('Werun', werunSchema)
}
