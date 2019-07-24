const http = require('http')
const YAML = require('yamljs')
const config = YAML.load(process.cwd() + '/tasks.conf')
global.config = config
const { service_port } = config
const app = require('./app')
app.set('port', service_port)
server = http.createServer(app)
server.listen(service_port, function() {
  console.log(
    `[${new Date().toLocaleString()}] SUCCESS App listening on port ${service_port}`
  )
})
