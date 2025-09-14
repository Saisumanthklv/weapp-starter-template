# API 使用指南

## 📡 网络请求 API

### 基础用法（网络请求）

```javascript
const { api } = require('../src/services/api.js')

// GET 请求
const profile = await api.get('/user/info')

// POST 请求
const login = await api.post('/auth/phone-login', {
  phone: '13800138000',
  code: '123456'
})

// PUT 请求
const updated = await api.put('/user/info', {
  nickname: '新昵称'
})

// DELETE 请求
await api.delete('/users/logout')
```

### 模块化 API（推荐）

```javascript
const { auth, user, upload } = require('../src/services/index.js')

// 认证相关
await auth.wxLogin({ code: 'wx_code' })
await auth.sendSmsCode({ phone: '13800138000', type: 'login' })
await auth.phoneLogin({ phone: '13800138000', code: '123456' })
await auth.bindPhone({ encryptedData: '...', iv: '...' })

// 用户相关
await user.getUserInfo()
await user.updateUserInfo({ nickname: '新昵称' })
await user.getUserSettings()
await user.updateUserSettings({ theme: 'dark' })

// 文件上传
await upload.uploadImage('temp://xxx.jpg')
await upload.uploadFile('temp://xxx.pdf', { biz: 'contract' })
```

## 🛠️ 工具与插件

### 插件（支付 / 分享 / 错误监控）

插件会在应用启动时通过 `initializePlugins` 自动初始化，当前未对外导出 `pluginManager` 供直接调用。如需业务内调用插件能力，请在后续版本中开放访问器或封装对外 API。

### 分享（插件）

分享插件已自动初始化，示例代码见 README。当前不提供直接调用 `share` 实例的示例。

### 统计（utils）

```javascript
const { analytics, trackPageView, trackEvent } = require('/src/utils/analytics.js')

// 页面访问统计
trackPageView('/src/pages/home/index', { source: 'tab' })

// 事件统计
trackEvent('button_click', { button_name: 'login' })
```

### 错误监控（插件）

错误监控插件已自动初始化。当前不提供对外直接调用实例的方法示例。

## 🔧 调试配置

调试配置位于 `src/config/debug.js`，可按需开启/关闭功能：

```javascript
// src/config/debug.js（节选）
module.exports = {
  enabled: true,
  enabledEnvironments: ['develop', 'trial'],
  
  // 支付（wxPay）配置
  payment: {
    confirmEnabled: true, // 是否启用二次确认
    minInterval: 1500     // 二次点击节流最小间隔(ms)
  },

  // 分享（share）配置
  share: {
    globalDefaults: { title: '', path: '', imageUrl: '' },
    enableDefaultStrategy: true
  }
}
```

## 📝 日志系统

### 基础用法

```javascript
const { logger, createCategoryLogger } = require('../src/utils/logger.js')

// 使用默认日志器
logger.info('应用启动')
logger.warn('网络连接不稳定')
logger.error('登录失败', new Error('invalid'))

// 创建分类日志器
const apiLogger = createCategoryLogger('API')
apiLogger.info('请求开始', { url: '/user/info' })
apiLogger.error('请求失败', { status: 500 })
```

> 说明：本项目未提供“日志查看器组件”，请通过开发者工具控制台查看日志或使用导出能力。

## 🗄️ 状态管理

### 基础用法

```javascript
const { store, storeHelpers } = require('../src/store/index.js')

// 获取状态（顶层键）
const userInfo = store.getState('userInfo')
const isLoggedIn = store.getState('isLoggedIn')

// 设置状态
store.setState('userInfo', { name: '张三', id: 123 })
store.setState('loading', true)

// 使用辅助函数
storeHelpers.setUserInfo({ name: '张三' })
storeHelpers.setNetworkStatus('online')
storeHelpers.pushPage('/src/pages/detail/index')
```

### 页面中使用

```javascript
Page({
  data: {
    userInfo: null
  },

  onLoad() {
    // 监听状态变化
    const unsubscribe = store.subscribe('userInfo', (userInfo) => {
      this.setData({ userInfo })
    })

    // 获取初始状态
    this.setData({ userInfo: store.getState('userInfo') })
  }
})
```

## 🔧 配置

主要配置位于：

- `src/config/index.js`：当前环境、生效的 `apiBaseUrl`、`timeout`、`debug` 等
- `src/config/debug.js`：调试与监控开关
- `src/config/env.js`：各环境的预置常量集合（可选使用）

