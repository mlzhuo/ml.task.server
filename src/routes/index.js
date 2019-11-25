const express = require('express')
const router = express.Router()
const indexModel = require('../model/indexModel')
const { checkSignature } = require('../utils/wxUtils')

// login
router.post('/login', (req, res) => {
  indexModel.login(req, res)
})

// version
router.get('/version', (req, res) => {
  indexModel.findAllVersion(req, res)
})
router.post('/version', (req, res) => {
  indexModel.releaseNewVersion(req, res)
})
router.put('/version', (req, res) => {
  indexModel.editVersion(req, res)
})
router.delete('/version/:version_info', (req, res) => {
  indexModel.delVersion(req, res)
})
router.get('/version/:version_info', (req, res) => {
  indexModel.findVersion(req, res)
})

// wx push
router.get('/wxmessage', (req, res) => {
  checkSignature(req, res)
})

// colorful eggs
router.get('/config', (req, res) => {
  indexModel.getColorfulEggs(req, res)
})
router.post('/config', (req, res) => {
  indexModel.addColorfulEggs(req, res)
})

// event
router.get('/:user_id/events', (req, res) => {
  indexModel.findAllEventsByUserId(req, res)
})
router.post('/:user_id/events', (req, res) => {
  indexModel.addEvents(req, res)
})
router.put('/:user_id/events', (req, res) => {
  indexModel.editEvents(req, res)
})
router.delete('/:user_id/events/:event_id', (req, res) => {
  indexModel.delEvent(req, res)
})
router.get('/:user_id/events/:event_id', (req, res) => {
  indexModel.findEventByEventId(req, res)
})
router.get('/:user_id/statistics', (req, res) => {
  indexModel.eventStatistics(req, res)
})

// task
router.get('/:event_id/tasks', (req, res) => {
  indexModel.findAllTasksByEventId(req, res)
})
router.post('/:event_id/tasks', (req, res) => {
  indexModel.addTask(req, res)
})
router.put('/:event_id/tasks', (req, res) => {
  indexModel.editTask(req, res)
})
router.delete('/:event_id/tasks/:task_id', (req, res) => {
  indexModel.delTask(req, res)
})
router.get('/:event_id/tasks/:task_id', (req, res) => {
  indexModel.findTaskByTaskId(req, res)
})

// punch
router.get('/:user_id/punch', (req, res) => {
  indexModel.findAllPunch(req, res)
})
router.post('/:user_id/punch', (req, res) => {
  indexModel.addPunch(req, res)
})
router.put('/:user_id/punch', (req, res) => {
  indexModel.editPunch(req, res)
})
router.delete('/:user_id/punch/:punch_id', (req, res) => {
  indexModel.delPunch(req, res)
})
router.get('/:user_id/punch/:punch_id', (req, res) => {
  indexModel.findPunchById(req, res)
})

// countdown
router.get('/:user_id/countdown', (req, res) => {
  indexModel.findAllCountdown(req, res)
})
router.post('/:user_id/countdown', (req, res) => {
  indexModel.addCountdown(req, res)
})
router.put('/:user_id/countdown', (req, res) => {
  indexModel.editCountdown(req, res)
})
router.delete('/:user_id/countdown/:countdown_id', (req, res) => {
  indexModel.delCountdown(req, res)
})
router.get('/:user_id/countdown/:countdown_id', (req, res) => {
  indexModel.findCountdownById(req, res)
})

// tools data overview
router.get('/:user_id/tools_data_overview', (req, res) => {
  indexModel.toolsDataOverview(req, res)
})

module.exports = router
