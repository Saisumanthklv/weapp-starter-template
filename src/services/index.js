// src/services/index.js
// API统一入口文件

// 导入各模块API
const user = require('./modules/user.js')
const auth = require('./modules/auth.js')
const upload = require('./modules/upload.js')

// 统一导出
module.exports = {
  user,
  auth,
  upload
}
