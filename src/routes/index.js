const express = require('express')
const router = express.Router()
const indexModel = require('../model/indexModel')
const { checkSignature } = require('../utils/wxUtils')
router.post('/login', (req, res) => {
  indexModel.login(req, res)
})
router.get('/events/:user_id', (req, res) => {
  indexModel.findEventsByUserId(req, res)
})
router.post('/events/add', (req, res) => {
  indexModel.addEvents(req, res)
})
router.get('/events/:event_id/tasks', (req, res) => {
  indexModel.findTasksByEventId(req, res)
})
router.get('/tasks/:task_id', (req, res) => {
  indexModel.findTaskByTaskId(req, res)
})
router.post('/tasks/add', (req, res) => {
  indexModel.addTask(req, res)
})
router.post('/tasks/edit', (req, res) => {
  indexModel.editTask(req, res)
})
router.get('/wxmessage', (req, res) => {
  checkSignature(req, res)
})
module.exports = router
