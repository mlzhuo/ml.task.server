# 日常管理小程序开发文档

[TOC]

# 文档说明

- 文档内的所有24位 id 都脱敏化处理，统一为随机24位字符串 **2mahjr8kv3bz501f479sp6tg**；

- NodeJS版本为10.13.0，其他版本暂未测试；

- mongoDB版本为4.2.1；

- 数据库中存储的日期均为ISODate格式。

  

# 数据库设计

## users

> 用户。

| _id                                  | openid                   | last_date                | date                     |
| ------------------------------------ | ------------------------ | ------------------------ | ------------------------ |
| ObjectId("2mahjr8kv3bz501f479sp6tg") | 2mahjr8kv3bz501f479sp6tg | 2019-11-13T02:37:46.518Z | 2019-11-13T02:37:46.518Z |



## events

> 分类。

| _id                                  | title    | level | date                     | edit_time                | description          | user_id                  | delete |
| ------------------------------------ | -------- | ----- | ------------------------ | ------------------------ | -------------------- | ------------------------ | ------ |
| ObjectId("2mahjr8kv3bz501f479sp6tg") | 开发任务 | 0     | 2019-11-13T02:37:46.518Z | 2019-11-13T02:37:46.518Z | 开发的一些任务记录。 | 2mahjr8kv3bz501f479sp6tg | 0      |



## tasks

> 记录。

| _id                                  | content                  | level | state | date                     | edit_time                | event_id                 | delete |
| :----------------------------------- | ------------------------ | ----- | ----- | ------------------------ | :----------------------- | ------------------------ | ------ |
| ObjectId("2mahjr8kv3bz501f479sp6tg") | 今天补充了一部分开发文档 | 0     | 0     | 2019-11-13T02:37:46.518Z | 2019-11-13T02:37:46.518Z | 2mahjr8kv3bz501f479sp6tg | 0      |



## punches

> 打卡。

| _id                                  | name         | description          | state | start_date               | end_date                 | date                     | edit_time                | punchHistory | user_id                  | delete |
| ------------------------------------ | ------------ | -------------------- | ----- | ------------------------ | ------------------------ | ------------------------ | ------------------------ | ------------ | ------------------------ | ------ |
| ObjectId("2mahjr8kv3bz501f479sp6tg") | 坚持吃个早饭 | 坚持一下，保个狗命。 | 0     | 2019-11-26T16:00:00.000Z | 2019-11-26T16:00:00.000Z | 2019-11-13T02:37:46.518Z | 2019-11-13T02:37:46.518Z |              | 2mahjr8kv3bz501f479sp6tg | 0      |



## countdowns

> 倒计时。

| _id                                  | name | target_date              | description        | state | date                     | edit_time                | user_id                  | delete |
| ------------------------------------ | ---- | ------------------------ | ------------------ | ----- | ------------------------ | ------------------------ | ------------------------ | ------ |
| ObjectId("2mahjr8kv3bz501f479sp6tg") | 回家 | 2019-11-26T16:00:00.000Z | 距离回家没几天了。 | 0     | 2019-11-13T02:37:46.518Z | 2019-11-13T02:37:46.518Z | 2mahjr8kv3bz501f479sp6tg | 0      |



## weruns

> 微信运动。

| _id                                  | date                     | step  | user_id                  |
| ------------------------------------ | ------------------------ | ----- | ------------------------ |
| ObjectId("2mahjr8kv3bz501f479sp6tg") | 2019-11-05T16:00:00.000Z | 99800 | 2mahjr8kv3bz501f479sp6tg |



## versions

> 版本。

| _id                                  | version | description | date                     | public | delete |
| ------------------------------------ | ------- | ----------- | ------------------------ | ------ | ------ |
| ObjectId("2mahjr8kv3bz501f479sp6tg") | 1.0.0   | 基础版本。  | 2019-11-13T02:37:46.518Z | 1      | 0      |



## configs

> 彩蛋。

| _id                                  | date                     | description | config                                                       |
| ------------------------------------ | ------------------------ | ----------- | ------------------------------------------------------------ |
| ObjectId("2mahjr8kv3bz501f479sp6tg") | 2019-11-13T02:37:46.518Z | 万圣节。    | {        "login" : {            "bg_url" : "",            "btn_url" : "https://file.myserver.net.cn/task/halloween.gif",            "btn_text" : "不给糖就捣蛋"        }    } |



## logs

> 日志记录。

- type：日志类别
  - login
  - send_message
  - clear_punch_state
  - clear_countdown_state
  - access_token
  - add_event
  - add_task
  - add_countdown
  - werun

| _id                                  | type  | date                     | openid                   | user_id                  | user_name | description |
| ------------------------------------ | ----- | ------------------------ | ------------------------ | ------------------------ | --------- | ----------- |
| ObjectId("2mahjr8kv3bz501f479sp6tg") | login | 2019-11-13T02:37:46.518Z | 2mahjr8kv3bz501f479sp6tg | 2mahjr8kv3bz501f479sp6tg | 张三      | ok          |



# 小程序API

## 微信推送

> 微信配置推送服务器校验。[微信小程序推送消息配置](https://developers.weixin.qq.com/miniprogram/dev/framework/server-ability/message-push.html)

- GET
- /wxmessage



## 登录

> 调用微信登录获取code凭证，之后通过登录接口发送至服务器。

- POST

- /login

- 参数

  - code：【String】调用微信登录返回的code
  
- 参数示例

  ```json
  {
      "code": "0115RtCQ1wv483aKdEEQ16WoCQ15RaC6"
  }
  ```
  
- 请求示例

  ```js
  http://192.168.4.112:3001/api/login
  ```

- 返回值

  ```json
  {
      "state": true,
      "data": {
          "_id": "5d35915efe04043db0d994bd",
          "openid": "oax145IVFS0SGwFWCfkCHUX_eOXg",
          "priTmplId": [//订阅消息模版ID
              "bHoQ2YVnFGfkbJcIVLm63Iekv0t7D4zkItlX6_KvEwk"
          ]
      },
      "message": "登录成功"
  }
  ```
  



## 版本

### 历史版本

> 获取历史版信息。

- GET

- /version

- 参数

  - limit：【Number】版本更新记录数量。（可选）

- 参数示例

  - 无

- 请求示例

  ```js
  http://192.168.4.113:3001/api/version
  http://192.168.4.113:3001/api/version?limit=10
  ```

- 返回值

  ```json
  {
      "state": true,
      "data": [
          {
              "_id": "2mahjr8kv3bz501f479sp6tg",
              "version": "1.0.0",
              "description": "基础功能事件，记录操作完成。",
              "date": "2019-09-11T07:42:19.619Z",
              "__v": 0
          }
      ],
      "message": "success"
  }
  ```

  

### 发布版本

> 发布新版本号，描述。

- POST

- /version

- 参数

  - version：【String】版本号
  - description：【String】版本更新日志

- 参数示例

  ```json
  {
      "version": "1.0.0",
      "description": "基础功能事件，记录操作完成。"
  }
  ```

- 请求示例

  ```js
  http://192.168.4.112:3001/api/version
  ```

- 返回值

  ```json
  {
      "state": true,
      "data": {
          "_id": "2mahjr8kv3bz501f479sp6tg",
          "version": "1.0.0",
          "description": "基础功能事件，记录操作完成。",
          "date": "2019-09-11T07:42:19.619Z",
          "__v": 0
      },
      "message": "发布成功"
  }
  ```




### 编辑版本

> 编辑已发布版本。可以根据原版本号或者版本id编辑。

- PUT

- /version

- 参数

  - version：【String】原版本号
  - version_id：【String】原版本ID
  - newVersion：【String】新版本号
  - description：【String】版本更新日志

- 参数示例

  ```json
  // version 和 version_id 任选其一
  // 参数中只需要包含更改的字段
  {
      "version": "1.0.0",
      "version_id": "2mahjr8kv3bz501f479sp6tg",
      "newVersion":"1.0.1",
      "description": "基础功能事件，记录操作完成。"
  }
  ```

- 请求示例

  ```js
  http://192.168.4.112:3001/api/version
  ```

- 返回值

  ```json
  {
      "state": true,
      "data": {
          "_id": "2mahjr8kv3bz501f479sp6tg",
          "version": "1.0.0",
          "description": "基础功能事件，记录操作完成。",
          "date": "2019-09-11T07:42:19.619Z",
          "__v": 0
      },
      "message": "发布成功"
  }
  ```



### 根据版本ID获取版本

> 获取指定版本。可以根据版本号或者版本id获取。

- GET

- /version/:version_info

- 参数

  - version_info：【String】版本号或者版本ID

- 参数示例

  - 无

- 请求示例

  ```js
  http://192.168.4.113:3001/api/version/2mahjr8kv3bz501f479sp6tg
  http://192.168.4.113:3001/api/version/1.0.0
  ```

- 返回值

  ```json
  {
      "state": true,
      "data": [
          {
              "_id": "2mahjr8kv3bz501f479sp6tg",
              "version": "1.0.0",
              "description": "基础功能事件，记录操作完成。",
              "date": "2019-09-11T07:42:19.619Z",
              "__v": 0
          }
      ],
      "message": "success"
  }
  ```



### 删除版本

> 删除版本。可以根据版本号或者版本id删除。

- DELETE

- /version/:version_info

- 参数

  - version_info：【String】版本号或者版本ID

- 参数示例

  - 无

- 请求示例

  ```js
  http://192.168.4.113:3001/api/version/2mahjr8kv3bz501f479sp6tg
  http://192.168.4.113:3001/api/version/1.0.0
  ```

- 返回值

  ```json
  {
      "state": true,
      "data": null,
      "message": "删除成功"
  }
  ```



## 彩蛋

### 添加配置

> 添加特定日期页面配置信息。目前仅支持登录页。

- POST

- /config

- 参数

  - date：【String】 彩蛋触发日期，YYYY-MM-DD
  - config：【Object】 彩蛋配置
    - login：【Object】配置页面
      - bg_url：【String】登录页顶部banner图片地址
      - btn_url：【String】登录按钮图片地址
      - btn_text：【String】登录按钮文字
  - description

- 参数示例

  ```json
  {
    "date": "2019-10-23",
    "config": {
      "login": {
        "bg_url": "http://192.168.4.113/ml-task-logo.png",
        "btn_url": "http://192.168.4.113/ml-task-logo.png",
        "btn_text": "登录"
      }
    },
    "description": "description"
  }
  ```

- 请求示例

  ```js
  http://192.168.4.113:3001/api/config
  ```

- 返回值

  ```json
  {
      "state": true,
      "data": {
          "_id": "2mahjr8kv3bz501f479sp6tg",
          "date": "2019-10-23T00:00:00.000Z",
          "config": {
              "login": {
                "bg_url": "http://192.168.4.113/ml-task-logo.png",
                "btn_url": "http://192.168.4.113/ml-task-logo.png",
                "btn_text": "登录"
              }
          },
          "description": "description",
          "__v": 0
      },
      "message": "操作成功"
  }
  ```

  

### 获取配置

> 获取当前日期配置信息。彩蛋，设置登录页的背景图，按钮图，登录文字。

- GET

- /config

- 参数

  - 无

- 参数示例

  - 无

- 请求示例

  ```js
  http://192.168.4.113:3001/api/config
  ```

- 返回值

  ```json
  {
      "state": true,
    	"data": {
          "_id": "2mahjr8kv3bz501f479sp6tg",
          "date": "2019-10-23T00:00:00.000Z",
          "description": "description",
          "config": {
              "login": {
                "bg_url": "http://192.168.4.113/ml-task-logo.png",
                "btn_url": "http://192.168.4.113/ml-task-logo.png",
                "btn_text": "登录"
              }
          },
          "__v": 0
      },
      "message": "success"
  }
  ```

  

## 分类

### 分类列表

> 获取所有分类。

- GET

- /:user_id/events

- 参数

  - user_id：【String】用户ID

- 参数示例

  - 无

- 请求示例

  ```js
  http://192.168.4.112:3001/api/2mahjr8kv3bz501f479sp6tg/events
  ```

- 返回值

  ```json
  {
      "state": true,
      "data": [
          {
              "description": "治治拖延症吧。",
              "level": 1,
              "_id": "2mahjr8kv3bz501f479sp6tg",
              "title": "拖延症",
              "user_id": "2mahjr8kv3bz501f479sp6tg",
              "date": "2019-07-30T14:44:58.739Z",
              "edit_time": "2019-08-11T04:47:44.611Z",
              "__v": 0
          },
          {
              "description": "开发测试数据。",
              "level": 0,
              "_id": "2mahjr8kv3bz501f479sp6tg",
              "title": "Debug",
              "user_id": "2mahjr8kv3bz501f479sp6tg",
              "date": "2019-08-05T09:03:28.064Z",
              "edit_time": "2019-08-12T11:38:08.444Z",
              "__v": 0
          }
      ],
      "message": "success"
  }
  ```




### 添加分类

> 添加分类。

- POST

- /:user_id/events

- 参数

  - title：【String】分类名称
  - description：【String】分类描述
  - level：【Number】是否优先，默认否（0）
  - user_id：【String】用户ID

- 参数示例

  ```json
  {
      "description": "测试添加分类",
      "level": 0,
      "title": "测试分类",
      "user_id": "2mahjr8kv3bz501f479sp6tg"
  }
  ```

- 请求示例

  ```js
  http://192.168.4.112:3001/api/2mahjr8kv3bz501f479sp6tg/events
  ```

- 返回值

  ```json
  {
      "state": true,
      "data": {
          "description": "测试添加分类",
          "level": 0,
          "_id": "2mahjr8kv3bz501f479sp6tg",
          "title": "测试分类",
          "user_id": "2mahjr8kv3bz501f479sp6tg",
          "date": "2019-10-23T02:58:46.805Z",
          "edit_time": "2019-10-23T02:58:46.805Z",
          "__v": 0
      },
      "message": "添加成功"
  }
  ```

  

### 编辑分类

> 编辑分类。

- PUT

- /:user_id/events

- 参数

  - title：【String】分类名称
  - description：【String】分类描述
  - level：【Number】是否优先，默认否（0）
  - event_id：【String】分类ID
  
- 参数示例

  ```json
  {
      "description": "测试添加分类",
      "level": 0,
      "title": "测试分类",
      "event_id": "2mahjr8kv3bz501f479sp6tg"
  }
  ```

- 请求示例

  ```js
  http://192.168.4.113:3001/api/2mahjr8kv3bz501f479sp6tg/events
  ```

- 返回值

  ```json
  {
      "state": true,
      "data": {
          "description": "测试添加分类",
          "level": 0,
          "_id": "2mahjr8kv3bz501f479sp6tg",
        "title": "测试分类",
          "user_id": "2mahjr8kv3bz501f479sp6tg",
          "date": "2019-10-23T02:57:14.543Z",
          "edit_time": "2019-10-23T02:59:13.827Z",
          "__v": 0
      },
      "message": "操作成功"
  }
  ```
  
  

### 根据分类ID获取分类

>  根据分类id获取分类详情

- GET

- /:user_id/events/:event_id

- 参数

  - user_id：【String】用户ID
  - event_id：【String】分类ID
  
- 参数示例

  - 无

- 请求示例

  ```js
  http://192.168.4.112:3001/api/2mahjr8kv3bz501f479sp6tg/events/2mahjr8kv3bz501f479sp6tg
  ```

- 返回值

  ```json
  {
      "state": true,
      "data": {
          "description": "日常管理小程序。",
          "level": 0,
          "_id": "2mahjr8kv3bz501f479sp6tg",
          "title": "ML.TASK",
          "user_id": "2mahjr8kv3bz501f479sp6tg",
          "date": "2019-07-23T03:48:03.744Z",
          "__v": 0,
          "edit_time": "2019-08-06T06:53:33.935Z"
      },
      "message": "success"
  }
  ```




### 删除分类

> 删除分类

- DELETE

- /:user_id/events/:event_id

- 参数

  - user_id：【String】用户ID
  - event_id：【String】分类ID

- 参数示例

  - 无

- 请求示例

  ```js
  http://192.168.4.112:3001/api/2mahjr8kv3bz501f479sp6tg/events/2mahjr8kv3bz501f479sp6tg
  ```

- 返回值

  ```json
  {
      "state": true,
      "data": null,
      "message": "删除成功"
  }
  ```



### 分类统计

> 统计每个分类中，记录的完成数以及总数。

- GET

- /:user_id/statistics

- 参数

  - user_id：【String】用户ID

- 参数示例

  - 无

- 请求示例

  ```js
  http://192.168.4.112:3001/api/2mahjr8kv3bz501f479sp6tg/statistics
  ```

- 返回值

  ```json
  {
      "state": true,
      "data": {
          "2mahjr8kv3bz501f479sp6tg": {
              "isDone": 5,
              "all": 6
          },
          "2mahjr8kv3bz501f479sp6tg": {
              "isDone": 19,
              "all": 23
          },
          "2mahjr8kv3bz501f479sp6tg": {
              "isDone": 7,
              "all": 7
          }
      },
      "message": "success"
  }
  ```

  

## 记录

### 记录列表

> 获取事件下的记录。

- GET

- /:event_id/tasks

- 参数

  - event_id：【String】分类ID

- 参数示例

  - 无

- 请求示例

  ```js
  http://192.168.4.112:3001/api/2mahjr8kv3bz501f479sp6tg/tasks
  ```

- 返回值

  ```json
  {
      "state": true,
      "data": [
          {
              "state": 1,
              "level": 0,
              "_id": "2mahjr8kv3bz501f479sp6tg",
              "event_id": "2mahjr8kv3bz501f479sp6tg",
              "content": "请求超时处理，请求优化。",
              "date": "2019-08-03T03:02:34.169Z",
              "edit_time": "2019-08-06T06:53:33.935Z",
              "__v": 0
          },
          {
              "state": 1,
              "level": 0,
              "_id": "2mahjr8kv3bz501f479sp6tg",
              "event_id": "2mahjr8kv3bz501f479sp6tg",
              "content": "添加每个事件的记录完成数与全部记录数的统计显示。",
              "date": "2019-08-03T00:53:23.792Z",
              "edit_time": "2019-08-03T03:02:39.291Z",
              "__v": 0
          }
      ],
      "message": "success"
  }
  ```

  

### 添加记录

> 添加记录。

- POST

- /:event_id/tasks

- 参数

  - content： 【String】记录内容
  - event_id：【String】 事件ID
  - level：【Number】是否优先，默认否（0）

- 参数示例

  ```json
  {
      "level": 0,
      "event_id": "2mahjr8kv3bz501f479sp6tg",
      "content": "测试添加记录。"
  }
  ```

- 请求示例

  ```js
  http://192.168.4.112:3001/api/2mahjr8kv3bz501f479sp6tg/tasks
  ```

- 返回值

  ```json
  {
      "state": true,
      "data": {
          "state": 0,
          "level": 0,
          "_id": "2mahjr8kv3bz501f479sp6tg",
          "event_id": "2mahjr8kv3bz501f479sp6tg",
          "content": "测试添加记录。",
          "date": "2019-08-16T01:54:24.194Z",
          "edit_time": "2019-08-16T01:54:24.194Z",
          "__v": 0
      },
      "message": "添加成功"
  }
  ```

  

### 编辑记录

> 编辑记录。

- PUT

- /:event_id/tasks

- 参数

  - content：【String】 记录内容
  - level： 【Number】是否优先
  - task_id：【String】 记录ID
  
- 参数示例

  ```json
  {
      "level": 0,
      "content": "测试添加记录。",
      "task_id": "2mahjr8kv3bz501f479sp6tg"
  }
  ```

- 请求示例

  ```js
  http://192.168.4.112:3001/api/2mahjr8kv3bz501f479sp6tg/tasks
  ```

- 返回值

  ```json
  {
      "state": true,
      "data": {
          "state": 0,
          "level": 0,
          "_id": "2mahjr8kv3bz501f479sp6tg",
        "event_id": "2mahjr8kv3bz501f479sp6tg",
          "content": "测试添加记录",
          "date": "2019-09-05T02:32:39.379Z",
          "edit_time": "2019-09-05T02:32:39.379Z",
          "__v": 0
      },
      "message": "操作成功"
  }
  ```
  



### 确认记录

> 确认完成记录。

- PUT

- /:event_id/tasks

- 参数

  - state：【Number】确认记录为完成状态。
  - task_id：【String】 记录ID

- 参数示例

  ```json
  {
  	"state": 1,
      "task_id": "2mahjr8kv3bz501f479sp6tg"
  }
  ```

- 请求示例

  ```js
  http://192.168.4.112:3001/api/2mahjr8kv3bz501f479sp6tg/tasks
  ```

- 返回值

  ```json
  {
      "state": true,
      "data": {
          "state": 1,
          "level": 0,
          "_id": "2mahjr8kv3bz501f479sp6tg",
          "event_id": "2mahjr8kv3bz501f479sp6tg",
          "content": "更新API文档。",
          "date": "2019-10-23T03:13:04.853Z",
          "edit_time": "2019-10-23T03:17:46.203Z",
          "__v": 0
      },
      "message": "操作成功"
  }
  ```



### 根据记录ID获取记录

> 根据记录id获取记录详情。

- GET

- /:event_id/tasks/:task_id

- 参数

  - event_id：【String】分类ID
  - task_id：【String】记录ID
  
- 参数示例

  - 无

- 请求示例

  ```js
  http://192.168.4.112:3001/api/2mahjr8kv3bz501f479sp6tg/tasks/2mahjr8kv3bz501f479sp6tg
  ```

- 返回值

  ```json
  {
      "state": true,
      "data": {
          "state": 0,
          "level": 0,
          "_id": "2mahjr8kv3bz501f479sp6tg",
          "event_id": "2mahjr8kv3bz501f479sp6tg",
          "content": "测试",
          "date": "2019-08-16T02:19:07.590Z",
          "edit_time": "2019-08-16T02:19:07.590Z",
          "__v": 0
      },
      "message": "success"
  }
  ```

### 删除记录

> 删除记录

- DELETE

- /:event_id/tasks/:task_id

- 参数

  - event_id：【String】分类ID
  - task_id：【String】记录ID

- 参数示例

  - 无

- 示例

  ```js
  http://192.168.4.112:3001/api/2mahjr8kv3bz501f479sp6tg/tasks/2mahjr8kv3bz501f479sp6tg
  ```

- 返回值

  ```json
  {
      "state": true,
      "data": null,
      "message": "删除成功"
  }
  ```
  



## 工具页数据概览

### 数据概览

> 工具页内的各个工具的数据概览。

- GET

- /:user_id/tools_data_overview

- 参数

  - user_id：【String】用户ID

- 参数示例

  - 无

- 请求示例

  ```js
  http://192.168.4.113:3001/api/2mahjr8kv3bz501f479sp6tg/tools_data_overview
  ```

- 返回值

  ```json
  {
      "state": true,
      "data": {
          "punch": {
              "isActive": 1,
              "toadyIsDone": 0
          },
          "countdown": {
              "isActive": 1,
              "mostResent":{
                  "state":0,
                "_id":"2mahjr8kv3bz501f479sp6tg",
                  "description":"我是一只小小鸟",
                  "name":"倒计时785",
                  "user_id":"2mahjr8kv3bz501f479sp6tg",
                  "target_date":"2020-03-27T17:01:00.000Z",
                  "date":"2020-03-27T12:57:40.957Z",
                  "edit_time":"2020-03-27T12:57:40.957Z"
              }
          }
      },
      "message": "success"
  }
  ```
  
  

## 打卡

### 打卡列表

> 获取所有打卡。

- GET

- /:user_id/punch

- 参数

  - user_id：【String】用户ID

- 参数示例

  - 无

- 请求示例

  ```js
  http://192.168.4.113:3001/api/2mahjr8kv3bz501f479sp6tg/punch
  ```

- 返回值

  ```json
  {
      "state": true,
    "data": [
          {
              "state": 0,
              "_id": "2mahjr8kv3bz501f479sp6tg",
              "date": "2019-10-22T01:56:16.994Z",
              "edit_time": "2019-10-22T01:56:19.582Z",
              "user_id": "2mahjr8kv3bz501f479sp6tg",
              "name": "测试",
              "description": "",
              "start_date": "2019-10-22",
              "end_date": "2019-10-31",
              "__v": 0,
              "punchHistory": {
                  "2019-10-22": "2019-10-22T01:56:19.585Z"
              },
              "allDays": 10,
              "okDays": 1,
              "noOkDays": null,
              "today": false
          }
      ],
      "message": "success"
  }
  ```
  
  

### 添加打卡

> 添加打卡。

- POST

- /:user_id/punch

- 参数
  - user_id：【String】 用户ID
  - name：【String】 打卡名称
  - start_date：【String】 打卡开始日期，YYYY-MM-DD
  - end_date：【String】 打卡结束日期，YYYY-MM-DD
  - description：【String】 打卡说明

- 参数示例

  ```json
  {
      "description": "打卡双十一。",
      "end_date": "2019-11-11",
      "name": "双十一快来了",
      "start_date": "2019-10-23",
      "user_id": "2mahjr8kv3bz501f479sp6tg"
  }
  ```

- 请求示例

  ```js
  http://192.168.4.113:3001/api/2mahjr8kv3bz501f479sp6tg/punch
  ```

- 返回值

  ```json
  {
      "state": true,
    "data": {
          "state": 0,
          "_id": "2mahjr8kv3bz501f479sp6tg",
          "date": "2019-10-23T02:31:43.099Z",
          "edit_time": "2019-10-23T02:31:43.099Z",
          "description": "打卡双十一。",
          "end_date": "2019-11-11T00:00:00.000Z",
          "name": "双十一快来了",
          "start_date": "2019-10-23T00:00:00.000Z",
          "user_id": "2mahjr8kv3bz501f479sp6tg",
          "__v": 0
      },
      "message": "添加成功"
  }
  ```
  
  

### 编辑打卡

> 编辑打卡。

- PUT

- /:user_id/punch

- 参数
  - punch_id：【String】 打卡ID
  - name：【String】 打卡名称
  - start_date：【String】 打卡开始日期，YYYY-MM-DD
  - end_date：【String】 打卡结束日期，YYYY-MM-DD
  - description：【String】 打卡说明
  
- 参数示例

  ```json
  {
      "description": "打卡双十一。",
      "end_date": "2019-11-11",
      "name": "双十一快来了",
      "start_date": "2019-10-23",
      "punch_id": "2mahjr8kv3bz501f479sp6tg"
  }
  ```

- 请求示例

  ```js
  http://192.168.4.113:3001/api/2mahjr8kv3bz501f479sp6tg/punch
  ```

- 返回值

  ```json
  {
      "state": true,
      "data": {
          "state": 0,
          "_id": "2mahjr8kv3bz501f479sp6tg",
          "date": "2019-10-23T02:30:46.664Z",
          "edit_time": "2019-10-23T02:41:24.526Z",
          "user_id": "2mahjr8kv3bz501f479sp6tg",
          "name": "双十一快来了。",
          "description": "打卡双十一。",
          "start_date": "2019-10-23T00:00:00.000Z",
          "end_date": "2019-11-11T00:00:00.000Z",
          "__v": 0
      },
      "message": "编辑成功"
  }
  ```



### 每日打卡

> 每日打卡。

- PUT

- /:user_id/punch

- 参数

  - punch_id：【String】 打卡ID
  - today：【String】 每日打卡日期，YYYY-MM-DD

- 参数示例

  ```json
  {
      "today": "2019-10-23",
      "punch_id": "2mahjr8kv3bz501f479sp6tg"
  }
  ```

- 请求示例

  ```js
  http://192.168.4.113:3001/api/2mahjr8kv3bz501f479sp6tg/punch
  ```

- 返回值

  ```json
  {
      "state": true,
      "data": {
          "state": 0,
          "_id": "2mahjr8kv3bz501f479sp6tg",
          "date": "2019-10-23T02:30:46.664Z",
          "edit_time": "2019-10-23T03:38:13.740Z",
          "user_id": "2mahjr8kv3bz501f479sp6tg",
          "name": "双十一快来了",
          "description": "打卡双十一。",
          "start_date": "2019-10-23T00:00:00.000Z",
          "end_date": "2019-11-11T00:00:00.000Z",
          "__v": 0,
          "punchHistory": {
              "2019-10-23": "2019-10-23T03:38:13.800Z"
          }
      },
      "message": "打卡成功"
  }
  ```

  

### 根据打卡ID获取打卡

> 删除打卡。

- GET

- /:user_id/punch/:punch_id

- 参数

  - user_id：【String】用户ID
  - punch_id：【String】打卡ID

- 参数示例

  - 无

- 请求示例

  ```js
  http://192.168.4.113:3001/api/2mahjr8kv3bz501f479sp6tg/punch/2mahjr8kv3bz501f479sp6tg
  ```

- 返回值

  ```json
  {
      "state": true,
      "data": {
          "state": 0,
          "_id": "2mahjr8kv3bz501f479sp6tg",
          "date": "2019-10-23T02:30:46.664Z",
          "edit_time": "2019-10-23T03:38:13.740Z",
          "user_id": "2mahjr8kv3bz501f479sp6tg",
          "name": "双十一快来了",
          "description": "打卡双十一。",
          "start_date": "2019-10-23T00:00:00.000Z",
          "end_date": "2019-11-11T00:00:00.000Z",
          "__v": 0,
          "punchHistory": {
              "2019-10-23": "2019-10-23T03:38:13.800Z"
          }
      },
      "message": "success"
  }
  ```

  

### 删除打卡

> 删除打卡。

- DELETE

- /:user_id/punch/:punch_id

- 参数

  - user_id：【String】用户ID
  - punch_id：【String】打卡ID

- 参数示例

  - 无

- 请求示例

  ```js
  http://192.168.4.113:3001/api/2mahjr8kv3bz501f479sp6tg/punch/2mahjr8kv3bz501f479sp6tg
  ```

- 返回值

  ```json
  {
      "state": true,
      "data": null,
      "message": "删除成功"
  }
  ```
  
  

## 倒计时

### 倒计时列表

> 获取所有倒计时。

- GET

- /:user_id/countdown

- 参数

  - user_id：【String】用户ID

- 参数示例

  - 无

- 请求示例

  ```js
  http://192.168.4.113:3001/api/2mahjr8kv3bz501f479sp6tg/countdown
  ```

- 返回值

  ```json
  {
      "state": true,
      "data": [
          {
              "state": 0,
              "_id": "2mahjr8kv3bz501f479sp6tg",
              "target_date": "2019-10-30T16:00:00.000Z",
              "name": "倒计时",
              "description": "测试添加倒计时api",
              "user_id": "2mahjr8kv3bz501f479sp6tg",
              "date": "2019-10-24T06:38:52.636Z",
              "edit_time": "2019-10-24T06:38:52.636Z",
              "__v": 0
          }
      ],
      "message": "success"
  }
  ```

  

### 添加倒计时

> 添加倒计时。

- POST

- /:user_id/countdown

- 参数

  - name： 【String】倒计时名称
  - user_id：【String】 用户ID
  - description：【String】倒计时描述
  - target_date：【String】倒计时目标日期  YYYY-MM-DD HH:mm:ss

- 参数示例

  ```json
  {
      "target_date": "2019-10-31 00:00:00",
      "name": "倒计时",
      "description": "测试添加倒计时api",
      "user_id": "2mahjr8kv3bz501f479sp6tg"
  }
  ```

- 请求示例

  ```js
  http://192.168.4.113:3001/api/2mahjr8kv3bz501f479sp6tg/countdown
  ```

- 返回值

  ```json
  {
      "state": true,
      "data": {
          "state": 0,
          "_id": "2mahjr8kv3bz501f479sp6tg",
          "target_date": "2019-10-30T16:00:00.000Z",
          "name": "倒计时",
          "description": "测试添加倒计时api",
          "user_id": "2mahjr8kv3bz501f479sp6tg",
          "date": "2019-10-24T06:38:52.636Z",
          "edit_time": "2019-10-24T06:38:52.636Z",
          "__v": 0
      },
      "message": "添加成功"
  }
  ```

  

### 编辑倒计时

> 编辑倒计时。

- PUT

- /:user_id/countdown

- 参数

  - name： 【String】倒计时名称
  - countdown_id：【String】 倒计时ID
  - description：【String】倒计时描述
  - target_date：【String】倒计时目标日期  YYYY-MM-DD HH:mm:ss

- 参数示例

  ```json
  {
      "target_date": "2019-10-31 00:00:00",
      "name": "倒计时",
      "description": "测试添加倒计时api",
      "countdown_id": "2mahjr8kv3bz501f479sp6tg"
  }
  ```

- 请求示例

  ```js
  http://192.168.4.113:3001/api/2mahjr8kv3bz501f479sp6tg/countdown
  ```

- 返回值

  ```json
  {
      "state": true,
      "data": {
          "state": 0,
          "_id": "2mahjr8kv3bz501f479sp6tg",
          "target_date": "2019-10-30T16:00:00.000Z",
          "name": "倒计时",
          "description": "测试添加倒计时api",
          "user_id": "2mahjr8kv3bz501f479sp6tg",
          "date": "2019-10-24T06:38:52.636Z",
          "edit_time": "2019-10-24T06:38:52.636Z",
          "__v": 0
      },
      "message": "添加成功"
  }
  ```



### 根据倒计时ID获取倒计时

> 删除倒计时。

- GET

- /:user_id/countdown/:countdown_id

- 参数

  - user_id：【String】用户ID
  - countdown_id：【String】倒计时ID

- 参数示例

  - 无

- 请求示例

  ```js
  http://192.168.4.113:3001/api/2mahjr8kv3bz501f479sp6tg/countdown/2mahjr8kv3bz501f479sp6tg
  ```

- 返回值

  ```json
  {
      "state": true,
      "data": {
          "state": 0,
          "_id": "2mahjr8kv3bz501f479sp6tg",
          "target_date": "2019-10-30T16:00:00.000Z",
          "name": "倒计时",
          "description": "测试添加倒计时api",
          "user_id": "2mahjr8kv3bz501f479sp6tg",
          "date": "2019-10-24T06:59:58.186Z",
          "edit_time": "2019-10-24T06:59:58.186Z",
          "__v": 0
      },
      "message": "success"
  }
  ```

  

### 删除倒计时

> 删除倒计时。

- DELETE

- /:user_id/countdown/:countdown_id

- 参数

  - user_id：【String】用户ID
  - countdown_id：【String】倒计时ID

- 参数示例

  - 无

- 请求示例

  ```js
  http://192.168.4.113:3001/api/2mahjr8kv3bz501f479sp6tg/countdown/2mahjr8kv3bz501f479sp6tg
  ```

- 返回值

  ```json
  {
      "state": true,
      "data": null,
      "message": "删除成功"
  }
  ```

  

## 微信运动报告

###   实时运动数据

> 获取最新的数据，包括今年，本月，本周和今天，同时从微信服务器获取最近30天的数据存入数据库。

- POST

- /:user_id/werun

- 参数

  - user_id：【String】 用户ID
  - openid：【String】
  - signature：【String】签名
  - rawData：【String】用于签名的个人信息字符串
  - encryptedData：【String】 包括敏感数据在内的完整用户信息的加密数据，详细见[加密数据解密算法](https://developers.weixin.qq.com/miniprogram/dev/framework/open-ability/signature.html) 
  - iv：【String】 加密算法的初始向量，详细见[加密数据解密算法](https://developers.weixin.qq.com/miniprogram/dev/framework/open-ability/signature.html) 

- 参数示例

  ```json
  {
      "user_id": "2mahjr8kv3bz501f479sp6tg",
      "encryptedData":"2mIXG9P5TUdeUgB+v2SL7P1FINAuvQn2XqiT6zU0gykje6pFq32k7CgjnKjYMlVmbVhAMLD9yt6cvQWprOSMjncXhtzWzNsNCB9RepFJRuH/YSoy13mG8fX3nitV5XCcyzrZ+Y0dWvR24rF9TsmP+7BGK2ofBZW67C2woZtr3UDFBobo6Co+cObdkhUEcOSI9n10ps9IQCjC8wGrLA6vj5eKwVbhnDkmFSkLglpMQRH2kQqJ/yuNeRPMbX5fk7D4kN/9OpAgm5NvYsPgq+TUp/cFDgJSUujT7+GjkWoxEMohefApEtHz12DfHNxanag4qCIgtpfJ3W1nY9Kb/Y0qU8TrvZgJicI03vu2vH2C6yoHvS/pjOxxA5CAItHCZC6fZKuizU5BM8x0QQpmZSMwKmNTMhZbeTO2tjxZa39FmVuZWs9XnEgCNZYG82VydlrLkdmo32NMc1OdrMnXIGbwdoUVHSHQDvq77N/iAIeUvGIjqUgGyhWzzCmDM7jg3Ql7PVbSI7Kpyr44VhzmgmYbZuOKhIoUFrTLdIyDa6BvaGNVLuwl4SM3OucjeAuMxUyLDzYGKjGhA0FsKTGuPqrfRd3WA2/AbU9nLv/xdzbUPF2bBEaCYt+FmzRk31F3VLcYAJ",
      "iv": "t0O2b8Ui0f8wQJiolL6ovw==",
      "openid": "oax145TV5A9GG9FWFfkCVUX_aQGY",
      "signature": "d0ff0284dce73551a95492777849b18a64128ac2",
      "rawData": "{\"nickName\":\"MRR\",\"gender\":1,\"language\":\"zh_CN\",\"city\":\"\",\"province\":\"\",\"country\":\"China\",\"avatarUrl\":\"https://wx.qlogo.cn/mmopen/vi_32/Q0j4TwGTfTLKFV8SLR3FIercxkX5BemljLMylEC89xXRc1iaL6fd5ialOUydNcost6aZhfrKxnysOQqukw9Vw/132\"}"
  }
  ```

- 请求示例

  ```js
  http://192.168.4.113:3001/api/2mahjr8kv3bz501f479sp6tg/werun
  ```

- 返回值

  ```json
  {
      "state": true,
      "data": {
          "yearStep": 386785,
          "monthStep": 109677,
          "weekStep": 52627,
          "dayStep": 947,
          "years": [
              {
                  "_id": "2019",
                  "step": 386785
              },
              {
                  "_id": "2018",
                  "step": 300
              }
        ]
      },
      "message": "success"
  }
  ```
  
  

### 年份运动数据

> 获取指定年份的运动数据。

- GET

- /:user_id/werun/:year

- 参数

  - user_id：【String】 用户ID
  - year：【Number】年份

- 参数示例

  - 无

- 请求示例

  ```js
  http://192.168.4.113:3001/api/2mahjr8kv3bz501f479sp6tg/werun/2019
  ```

- 返回值

  ```json
  {
      "state": true,
      "data": [
          {
              "_id": "12",
              "step": 109677
          },
          {
              "_id": "11",
              "step": 277108
          }
      ],
      "message": "success"
  }
  ```

  

### 月份运动数据

> 获取指定月份的运动数据。

- GET

- /:user_id/werun/:year/:month

- 参数

  - user_id：【String】 用户ID
  - year：【Number】年份
  - month：【Number】月份

- 参数示例

  - 无

- 请求示例

  ```js
  http://192.168.4.113:3001/api/2mahjr8kv3bz501f479sp6tg/werun/2019/12
  ```

- 返回值

  ```json
  {
      "state": true,
      "data": [
          {
              "_id": "03",
              "step": 9400
          },
          {
              "_id": "02",
              "step": 10395
          },
          {
              "_id": "01",
              "step": 4005
          }
      ],
      "message": "success"
  }
  ```

  

