var mongoose = require('mongoose')
const { host, port, user, pwd, dbName } = global.config.mongodb
const dbUrl = `mongodb://${user}:${pwd}@${host}:${port}/${dbName}`
mongoose.connect(dbUrl, { useNewUrlParser: true, useFindAndModify: false })
mongoose.Promise = global.Promise
global.ObjectId = mongoose.Types.ObjectId
const db = mongoose.connection
db.on('connected', function() {
  console.log(
    `[${new Date().toLocaleString()}] SUCCESS Mongoose connection open to mongodb://${host}:${port}/${dbName}`
  )
})
db.on('error', function(err) {
  console.log(
    `[${new Date().toLocaleString()}] ERROR Mongoose connection error ${err}`
  )
})
db.on('disconnected', function() {
  console.log(
    `[${new Date().toLocaleString()}] DISCONNECTED Mongoose connection disconnected`
  )
})
module.exports = mongoose
