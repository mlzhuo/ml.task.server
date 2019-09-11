const express = require('express')
const router = express.Router()
const indexModel = require('../model/indexModel')
const { checkSignature } = require('../utils/wxUtils')
router.post('/login', (req, res) => {
  indexModel.login(req, res)
})

// event

router.get('/:user_id/events', (req, res) => {
  indexModel.findEventsByUserId(req, res)
})
router.post('/:user_id/events', (req, res) => {
  indexModel.addEvents(req, res)
})
router.put('/:user_id/events', (req, res) => {
  indexModel.editEvents(req, res)
})
router.get('/:user_id/events/:event_id', (req, res) => {
  indexModel.findEventByEventId(req, res)
})
router.get('/:user_id/statistics', (req, res) => {
  indexModel.eventStatistics(req, res)
})

// task

router.get('/:event_id/tasks', (req, res) => {
  indexModel.findTasksByEventId(req, res)
})
router.post('/:event_id/tasks', (req, res) => {
  indexModel.addTask(req, res)
})
router.put('/:event_id/tasks', (req, res) => {
  indexModel.editTask(req, res)
})
router.get('/:event_id/tasks/:task_id', (req, res) => {
  indexModel.findTaskByTaskId(req, res)
})

// wx push

router.get('/wxmessage', (req, res) => {
  checkSignature(req, res)
})

// version

router.get('/version', (req, res) => {
  indexModel.findAllVersion(req, res)
})

router.post('/version', (req, res) => {
  indexModel.releaseNewVersion(req, res)
})

module.exports = router
