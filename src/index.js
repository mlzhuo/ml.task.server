var app = require('./app')
var http = require('http')
const YAML = require('yamljs')

YAML.load(process.cwd() + '/tasks.conf', function(config) {
  if (config) {
    service_port = config.service_port
    app.set('port', service_port)
    server = http.createServer(app)
    server.listen(service_port, function() {
      console.log(`[${new Date().toISOString()}] SUCCESS App listening on port ${service_port}`)
    })
  }
})
