# WeApp Starter Template

🚀 一个开箱即用的微信小程序启动模板，提供项目基础架构、登录认证、日志系统、插件初始化、网络请求封装、轻量状态管理与基础统计等核心能力。

## ✨ 核心特性

- 开箱即用的目录与初始化流程
- 登录能力：微信登录、手机号验证码登录、微信手机号快捷登录
- 日志系统：分类日志、上下文查看（前后日志）、导出最近日志
- 插件初始化：支付、分享、错误监控（自动初始化，非直接导出实例）
- 网络请求封装：请求/响应拦截、统一错误处理、附加设备信息
- 轻量状态管理：顶层键值 + 订阅 + 便捷方法
- 统计工具：页面访问与事件统计（已在 `App` 启动阶段挂载 `wx.$track*`）

## 📁 项目结构

```
src/
├── pages/                     # 页面
│   ├── login/                 # 登录页
│   ├── home/                  # 首页
│   └── profile/               # 个人中心
├── subpackages/
│   └── user/
│       └── settings/          # 设置页（分包）
├── services/                  # 网络请求服务
│   ├── api.js                 # 核心 API 封装（get/post/put/delete/upload）
│   ├── index.js               # API 统一出口（auth/user/upload 等）
│   └── modules/               # 业务模块（按需扩展）
├── utils/
│   ├── index.js               # 通用工具（日期/字符串/对象/存储/防抖/节流等）
│   ├── logger.js              # 增强日志系统
│   └── analytics.js           # 统计工具
├── config/
│   ├── index.js               # 环境生效配置（apiBaseUrl/timeout/debug...）
│   ├── env.js                 # 环境常量集合（可选使用）
│   └── debug.js               # 调试与监控开关
├── store/
│   └── index.js               # 轻量状态管理与便捷方法
├── plugin/
│   └── index.js               # 插件系统（wxPay/share/errorMonitor）
├── hooks/
│   └── index.js               # 自定义 Hooks（按需扩展）
├── mixins/
│   └── index.js               # 通用混入（按需扩展）
├── theme/
│   └── index.js               # 主题与样式变量
├── constants/
│   └── index.js               # 常量
└── components/                # 组件（当前为空，可自行扩展）
```

## 🚀 快速开始

### 1. 克隆项目
```bash
git clone https://github.com/your-username/weapp-starter-template.git
cd weapp-starter-template
```

### 2. 环境准备
- 安装 [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)
- 注册小程序账号并获取 AppID

### 3. 项目配置
1. 在微信开发者工具中导入项目
2. 修改 `project.config.json` 中的 `appid`
3. 更新 `src/config/env.js` 中的API地址和第三方服务配置

### 4. 开始开发
- 在开发者工具中点击“编译”
- 使用真机调试
- 查看控制台日志（项目未提供日志查看器组件）

## 🧩 核心功能

### 组件系统
项目未内置业务组件。已在 `app.json` 集成 `@vant/weapp`，可直接使用。

### 状态管理
- 轻量级状态管理系统
- 支持状态订阅和中间件
- 提供便捷的状态操作方法

### 网络请求
- 统一 API 请求封装（`src/services/api.js`）
- 请求/响应拦截、HTTP/业务错误处理
- 自动附加 Token 与设备信息；提供上传封装

### 工具函数
- 日期时间处理
- 表单验证
- 存储管理

## 📱 页面说明

### 主包页面
- **登录页** (`/src/pages/login/index`): 多种登录方式的统一入口
- **首页** (`/src/pages/home/index`): 应用主页面
- **我的** (`/src/pages/profile/index`): 用户个人中心

### 子包页面
- **设置** (`/src/subpackages/user/settings/index`): 用户设置页面

## 🛠 开发指南

### 使用组件
直接使用 `@vant/weapp` 组件（详见 `app.json` 的 `usingComponents` 配置）。

### 使用状态管理
```javascript
const { storeHelpers } = require('/src/store/index.js')

// 设置用户信息
storeHelpers.setUserInfo(userInfo)

// 获取用户信息
const userInfo = storeHelpers.store.getState('userInfo')

// 监听状态变化
storeHelpers.store.subscribe('userInfo', (newValue, oldValue) => {
  console.log('用户信息更新', newValue)
})
```

### 🔐 登录系统使用

```javascript
const { auth } = require('/src/services/index.js')

// 1) 微信一键登录
await auth.wxLogin({ code: 'wx_login_code' })

// 2) 手机号验证码登录
await auth.sendSmsCode({ phone: '13800138000', type: 'login' })
await auth.phoneLogin({ phone: '13800138000', code: '123456' })

// 3) 微信手机号快捷登录
await auth.bindPhone({ encryptedData: '...', iv: '...' })
```

### 📊 日志系统

```javascript
const { logger, apiLogger, authLogger } = require('/src/utils/logger.js')

apiLogger.info('API请求开始', { url: '/user/info', method: 'GET' })
authLogger.error('登录失败', { error: 'invalid_code' })

// 常用能力
const recent = logger.getRecent(50)
const context = logger.getLogContext(recent[0]?.id, 5)
const exported = logger.exportRecent(100)
```

### 🔌 插件系统

插件（支付、分享、错误监控）在应用启动时由 `initializePlugins` 自动初始化，当前未导出 `pluginManager` 供直接调用。支付/分享等能力示例以演示为主，如需业务调用，可在后续版本中增加访问器或对外 API。

#### 注意事项与扩展（示例说明）

- __wxPay（支付）__
  - 默认启用“二次确认”。如需跳过可在参数中传入 `__confirm__: false`。
  - 内置节流保护：最小触发间隔 1500ms，重复点击会返回 `{ errMsg: 'requestPayment:throttled' }`。
  - 示例：
    ```javascript
    const wxPay = pluginManager.get('wxPay')
    await wxPay.requestPayment({
      timeStamp, nonceStr, package: prepayId, signType, paySign,
      __confirm__: false // 跳过二次确认
    })
    ```

// 分享示例与对外 API 需依据后续导出策略再行开放

- __errorMonitor（错误监控）__
  - 内置上报队列与指数退避重试：失败后按 0.5s、1s、2s、4s、8s（封顶）重试，最多 5 次。
  - 手动上报示例：
    ```javascript
    const errorMonitor = pluginManager.get('errorMonitor')
    try {
      throw new Error('demo error')
    } catch (e) {
      errorMonitor.reportError('manual_error', e)
    }
    ```

### 🎯 模块化 API 使用

```javascript
// 方式1: 直接使用模块化API
const { user, auth, upload } = require('/src/services/index.js')

// 获取用户信息
const userInfo = await user.getUserInfo()

// 上传文件
const uploadResult = await upload.uploadImage('/temp/image.jpg')

// 方式2: 使用Hooks进行状态管理
const { useRequest } = require('/src/hooks/index.js')

Page({
  onLoad() {
    const { requestWithLoading } = useRequest()
    
    // 带加载状态的请求
    this.loadData = async () => {
      try {
        const data = await requestWithLoading(
          () => user.getUserInfo(),
          { loadingText: '加载用户信息...' }
        )
        this.setData({ userInfo: data })
      } catch (error) {
        wx.showToast({ title: error.message, icon: 'none' })
      }
    }
  }
})
```

### 使用混入（可选）
```javascript
const { baseMixin, listMixin } = require('/src/mixins/index.js')

Page({
  // 使用混入
  ...baseMixin,
  ...listMixin,
  
  data: {
    // 页面数据
  },
  
  // 实现列表混入需要的方法
  async fetchList(params) {
    return await task.getList(params)
  }
})
```

### 使用 Hooks（可选）
```javascript
const { useUserInfo, useRequest } = require('/src/hooks/index.js')

// 在页面中使用
Page({
  onLoad() {
    const { getUserInfo, isLoggedIn } = useUserInfo()
    const { get, post } = useRequest()
    
    if (isLoggedIn()) {
      const userInfo = getUserInfo()
      console.log('当前用户', userInfo)
    }
  }
})
```

## 🎨 主题定制（可选）

框架提供了主题系统，可定制颜色、字体、间距等：

```javascript
const { generateThemeVars } = require('/src/theme/index.js')

// 自定义主题
const customTheme = generateThemeVars({
  colors: {
    primary: '#ff6b6b',
    secondary: '#4ecdc4'
  }
})
```

## 🔧 配置说明

### 环境配置
在 `src/config/env.js` 中配置不同环境的参数：
- API接口地址
- 第三方服务密钥
- 功能开关
- 业务配置

### 常量定义
在 `src/constants/index.js` 中定义项目常量：
- HTTP状态码
- 业务状态码
- 页面路径
- 存储键名

## 📦 插件系统

内置插件：支付、分享、错误监控（自动初始化）。对外直接调用接口将视后续需求开放。

## 🚦 建议

1. 合理使用全局状态，避免过度共享
2. 统一网络错误处理，必要时使用缓存
3. 按需分包与懒加载以优化首屏
4. 根据团队规范接入 ESLint/Prettier（本模板未内置）

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交Issue和Pull Request来改进这个框架。

---

注意：这是一个演示框架，请根据实际业务进行裁剪与扩展。
