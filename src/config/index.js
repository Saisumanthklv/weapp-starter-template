// src/config/index.js
// 环境配置管理

// 获取当前环境
const getEnv = () => {
  // 可以通过编译时环境变量或其他方式判断环境
  // 这里暂时使用简单的判断逻辑
  const accountInfo = wx.getAccountInfoSync()
  const envVersion = accountInfo.miniProgram.envVersion
  
  if (envVersion === 'develop') {
    return 'development'
  } else if (envVersion === 'trial') {
    return 'staging'
  } else {
    return 'production'
  }
}

// 环境配置
const configs = {
  development: {
    // 开发环境配置 - #TODO: 替换为实际的API地址
    apiBaseUrl: 'https://dev-api.example.com',
    debug: true,
    logLevel: 'debug',
    timeout: 10000,
    enableMock: true
  },
  staging: {
    // 测试环境配置 - #TODO: 替换为实际的API地址
    apiBaseUrl: 'https://staging-api.example.com',
    debug: true,
    logLevel: 'info',
    timeout: 15000,
    enableMock: false
  },
  production: {
    // 生产环境配置 - #TODO: 替换为实际的API地址
    apiBaseUrl: 'https://api.example.com',
    debug: false,
    logLevel: 'error',
    timeout: 20000,
    enableMock: false
  }
}

// 当前环境
const currentEnv = getEnv()

// 导出当前环境的配置
const config = {
  ...configs[currentEnv],
  env: currentEnv,
  version: '1.0.0'
}

// 通用配置
config.storage = {
  userInfo: 'userInfo',
  token: 'token',
  settings: 'settings'
}

config.pages = {
  home: '/src/pages/home/index',
  tasks: '/src/pages/tasks/index',
  order: '/src/pages/order/index',
  profile: '/src/pages/profile/index',
  product: '/src/subpackages/product/index',
  settings: '/src/subpackages/user/settings/index'
}

module.exports = config
