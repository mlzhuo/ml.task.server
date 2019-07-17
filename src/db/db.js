var mongoose = require('mongoose')
const YAML = require('yamljs')
YAML.load(process.cwd() + '/tasks.conf', function(config) {
  if (config) {
    const { host, port, user, pwd, dbName } = config.mongodb
    const dbUrl = `mongodb://${user}:${pwd}@${host}:${port}/${dbName}`
    mongoose.connect(dbUrl, { useNewUrlParser: true })
    mongoose.Promise = global.Promise
    global.ObjectId = mongoose.Types.ObjectId
    const db = mongoose.connection
    db.on('connected', function() {
      console.log(
        `[${new Date().toISOString()}] SUCCESS Mongoose connection open to mongodb://${host}:${port}/${dbName}`
      )
    })
    db.on('error', function(err) {
      console.log(
        `[${new Date().toISOString()}] ERROR Mongoose connection error  ${err}`
      )
    })
    db.on('disconnected', function() {
      console.log(
        `[${new Date().toISOString()}] DISCONNECTED Mongoose connection disconnected`
      )
    })
  }
})
module.exports = mongoose
