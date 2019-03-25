#!/usr/bin/env node
const chalk = require('chalk')
const clear = require('clear')
const figlet = require('figlet')
const redis = require('redis')
let express = require('express')
let app = express()
let router = express.Router() // eslint-disable-line new-cap
let bodyParser = require('body-parser')
app.use(bodyParser.json())
app.use('/', router)

const conf = require('rc')('ghtoredis', {
  // defaults
  redisHost: 'localhost',
  redisPort: 6379,
  redisPassword: null,
  queueName: 'github',
  webPort: 7766
})

let client = createRedisClient()

client.on('error', function(err) {
  console.log('redis connect error: ' + err)
})

router.post('/github', function(req, res) {

  const ghEvent = {}
  ghEvent.id = req.headers['x-github-delivery']
  ghEvent.event = req.headers['x-github-event']
  ghEvent.payload = req.body

  client.rpush(conf.queueName, JSON.stringify(ghEvent))

  console.log(chalk.green('--> ' + ghEvent.id + ' ' + ghEvent.event))
  let ok = {'response': 'ok'}
  res.json(ok)
})

clear()
console.log(chalk.red(figlet.textSync('github to redis', {horizontalLayout: 'full'})))
console.log(chalk.red('Redis Host: ' + conf.redisHost))
console.log(chalk.red('Redis Port: ' + conf.redisPort))
console.log(chalk.red('Queue Name: ' + conf.queueName))
console.log(chalk.red('Web Port: ' + conf.webPort))

app.listen(conf.webPort, function() {
  console.log(chalk.yellow('Listening on port: ' + conf.webPort))
})

function createRedisClient() {
  if (conf.redisPassword != null) {
    return redis.createClient({host: conf.redisHost, 
                               port: conf.redisPort, 
                               password: conf.redisPassword})
  } else {
    return redis.createClient({host: conf.redisHost, 
                               port: conf.redisPort})
  }
}