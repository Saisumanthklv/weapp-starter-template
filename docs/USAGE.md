# 使用指南

## 🚀 快速开始

### 1. 项目初始化

```bash
# 克隆项目
git clone https://github.com/your-username/weapp-starter-template.git
cd weapp-starter-template

# 安装依赖（可选，用于测试）
yarn install
```

### 2. 微信开发者工具配置

1. 打开微信开发者工具
2. 选择"导入项目"
3. 选择项目目录
4. 填写 AppID（测试号或正式 AppID）
5. 点击"导入"

### 3. 项目配置

#### 环境配置
编辑 `src/config/env.js`：

```javascript
module.exports = {
  development: {
    apiBaseUrl: 'https://your-dev-api.com',
    debug: true
  },
  production: {
    apiBaseUrl: 'https://your-api.com',
    debug: false
  }
}
```

#### 应用信息配置
编辑 `app.json`：

```json
{
  "pages": [
    "src/pages/home/index",
    "src/pages/login/index",
    "src/pages/profile/index"
  ],
  "window": {
    "navigationBarTitleText": "你的应用名称"
  }
}
```

## 📱 核心功能使用

### 登录系统

#### 微信一键登录
```javascript
const { auth } = require('../src/services/index.js')

// 获取微信登录凭证
wx.login({
  success: async (res) => {
    const result = await auth.wxLogin({
      code: res.code
    })
    console.log('登录成功', result)
  }
})
```

#### 手机号验证登录
```javascript
const { auth } = require('../src/services/index.js')

// 发送验证码
await auth.sendSmsCode({ phone: '13800138000', type: 'login' })

// 验证登录
const result = await auth.phoneLogin({
  phone: '13800138000',
  code: '123456'
})
```

### 网络请求

#### 基础请求
```javascript
const { api } = require('../src/services/api.js')

// GET 请求
const profile = await api.get('/user/info')

// POST 请求
const result = await api.post('/auth/phone-login', {
  phone: '13800138000',
  code: '123456'
})
```

#### 带认证的请求
```javascript
// 自动添加 token 到请求头
const profile = await api.get('/user/info')
```

### 文件上传

```javascript
const { upload } = require('../src/services/index.js')

// 选择并上传图片
wx.chooseImage({
  count: 1,
  success: async (res) => {
    const result = await upload.uploadImage(res.tempFilePaths[0])
    console.log('上传成功', result.url)
  }
})
```

### 支付功能（插件）

插件在应用启动时自动初始化，当前未对外导出 `pluginManager`，因此不提供直接调用支付示例。后续可根据需要开放对外 API。

### 分享功能（插件）

分享插件已自动初始化。当前不提供直接调用分享实例的示例。

### 统计分析

```javascript
const { trackPageView, trackEvent } = require('/src/utils/analytics.js')

Page({
  onLoad() {
    // 页面访问统计
    trackPageView('/src/pages/product/detail', {
      product_id: '123',
      source: 'search'
    })
  },

  onButtonClick() {
    // 事件统计
    trackEvent('button_click', {
      button_name: 'add_to_cart',
      product_id: '123'
    })
  }
})
```

## 📝 日志和调试

### 使用日志系统

```javascript
const { createCategoryLogger } = require('../utils/logger.js')

Page({
  logger: createCategoryLogger('HOME_PAGE'),

  onLoad() {
    this.logger.info('页面加载开始')
  },

  async onApiCall() {
    try {
      this.logger.info('开始API调用')
      const result = await api.get('/data')
      this.logger.info('API调用成功', result)
    } catch (error) {
      this.logger.error('API调用失败', error)
    }
  }
})
```

 

 

## 🗄️ 状态管理

### 全局状态

```javascript
const { store, storeHelpers } = require('../src/store/index.js')

// 设置用户信息
storeHelpers.setUserInfo({
  id: 123,
  name: '张三',
  avatar: 'https://example.com/avatar.jpg'
})

// 获取用户信息
const userInfo = store.getState('userInfo')
```

### 页面状态同步

```javascript
Page({
  data: {
    userInfo: null
  },

  onLoad() {
    // 监听状态变化
    store.subscribe('userInfo', (userInfo) => {
      this.setData({ userInfo })
    })

    // 获取初始状态
    this.setData({
      userInfo: store.getState('userInfo')
    })
  }
})
```

 

## 📦 项目部署

### 1. 代码上传

1. 在微信开发者工具中点击"上传"
2. 填写版本号和项目备注
3. 点击"上传"

### 2. 提交审核

1. 登录微信公众平台
2. 进入"版本管理"
3. 选择要提交的版本
4. 填写审核信息
5. 提交审核

### 3. 发布上线

审核通过后：
1. 在"版本管理"中找到审核通过的版本
2. 点击"发布"
3. 确认发布

## 🔧 自定义开发

### 添加新页面

1. 在 `src/pages/` 下创建页面目录
2. 创建页面文件：`index.js`, `index.wxml`, `index.wxss`, `index.json`
3. 在 `app.json` 中添加页面路径

### 添加新API模块

1. 在 `src/services/modules/` 下创建模块文件
2. 导出API函数
3. 在 `src/services/index.js` 中导入并导出

### 添加新工具函数

1. 在 `src/utils/` 下创建工具文件
2. 导出工具函数
3. 在需要的地方导入使用

### 添加新组件

1. 在 `src/components/` 下创建组件目录
2. 创建组件文件
3. 在页面的 `index.json` 中注册组件

## ❓ 常见问题

### Q: 如何修改API基础URL？
A: 编辑 `src/config/env.js` 文件中的 `apiBaseUrl` 配置。

### Q: 如何添加新的官方插件？
A: 在 `app.json` 的 `plugins` 字段中添加插件配置，然后在代码中使用 `requirePlugin()` 引入。

### Q: 如何自定义日志分类？
A: 使用 `createCategoryLogger('YOUR_CATEGORY')` 创建新的分类日志器。

### Q: 如何禁用某些工具功能？
A: 在 `src/utils/tools.js` 中注释或删除不需要的工具，或在 `src/app-init.js` 中选择性初始化。

### Q: 测试失败怎么办？
A: 检查微信开发者工具CLI路径配置，确保项目路径正确，查看测试日志定位问题。
