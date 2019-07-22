const assert = require('assert')
const { userModel, eventModel, taskModel } = require('../schema/indexSchema')
const { ApiResponse } = require('../utils/apiUtils')

module.exports = {
  // login: (req, res) => {
  //   userModel.findOne({ ...req.body }, (err, doc) => {
  //     if (err) {
  //       assert.equal(null, err)
  //     }
  //     if (doc) {
  //       if (doc.password === req.body.password) {
  //         res.json(
  //           ApiResponse({
  //             state: true,
  //             data: doc,
  //             message: '登录成功'
  //           })
  //         )
  //       } else {
  //         res.json(
  //           ApiResponse({
  //             state: false,
  //             message: '密码不正确'
  //           })
  //         )
  //       }
  //     } else {
  //       res.json(
  //         ApiResponse({
  //           state: false,
  //           message: '用户不存在'
  //         })
  //       )
  //     }
  //   })
  // },
  login: (req, res) => {
    const { name, password } = req.body
    userModel.find({ name }, (err, docs) => {
      if (err) {
        assert.equal(null, err)
      }
      if (docs) {
        let index = docs.findIndex(v => v.password === password)
        if (index !== -1) {
          res.json(
            ApiResponse({
              state: true,
              data: docs[index],
              message: '登录成功'
            })
          )
        } else {
          res.json(
            ApiResponse({
              state: false,
              message: '密码不正确'
            })
          )
        }
      } else {
        res.json(
          ApiResponse({
            state: false,
            message: '用户不存在'
          })
        )
      }
    })
  },
  register: (req, res) => {
    const date = new Date().toISOString()
    userModel.findOne({ ...req.body }, (err, doc) => {
      if (err) {
        assert.equal(null, err)
      }
      if (doc) {
        res.json(
          ApiResponse({
            state: false,
            message: '账号已存在，请登录'
          })
        )
      } else {
        userModel.create({ ...req.body, date }, (err, doc) => {
          if (err) {
            assert.equal(null, err)
          }
          res.json(
            ApiResponse({
              state: true,
              data: doc,
              message: '注册成功，自动登录中'
            })
          )
        })
      }
    })
  },
  findEventsByUserId: (req, res) => {
    const { user_id } = req.params
    eventModel
      .find({ user_id }, (err, docs) => {
        if (err) {
          assert.equal(null, err)
        }
        res.json(
          ApiResponse({
            state: true,
            data: docs
          })
        )
      })
      .sort({ level: -1, date: -1 })
  },
  addEvents: (req, res) => {
    const date = new Date().toISOString()
    eventModel.create({ ...req.body, date }, (err, doc) => {
      if (err) {
        assert.equal(null, err)
      }
      res.json(
        ApiResponse({
          state: true,
          data: doc,
          message: '添加成功'
        })
      )
    })
  },
  findTasksByEventId: (req, res) => {
    const { event_id } = req.params
    taskModel
      .find({ event_id }, (err, docs) => {
        if (err) {
          assert.equal(null, err)
        }
        res.json(
          ApiResponse({
            state: true,
            data: docs
          })
        )
      })
      .sort({ date: -1, state: -1, level: -1 })
  },
  findTaskByTaskId: (req, res) => {
    const { task_id } = req.params
    taskModel.findOne({ _id: task_id }, (err, doc) => {
      if (err) {
        assert.equal(null, err)
      }
      res.json(
        ApiResponse({
          state: true,
          data: doc
        })
      )
    })
  },
  addTask: (req, res) => {
    const date = new Date().toISOString()
    taskModel.create({ ...req.body, date }, (err, doc) => {
      if (err) {
        assert.equal(null, err)
      }
      res.json(
        ApiResponse({
          state: true,
          data: doc,
          message: '添加成功'
        })
      )
    })
  },
  editTask: (req, res) => {
    const edit_time = new Date().toISOString()
    const task_id = global.ObjectId(req.body.task_id)
    taskModel.updateOne(
      { _id: task_id },
      { ...req.body, edit_time },
      (err, doc) => {
        if (err) {
          assert.equal(null, err)
        }
        res.json(
          ApiResponse({
            state: true,
            message: '操作成功'
          })
        )
      }
    )
  }
}
