// src/config/env.js
// 环境变量配置文件

// API 接口地址配置
const API_BASE_URLS = {
  development: 'https://dev-api.example.com',
  staging: 'https://staging-api.example.com', 
  production: 'https://api.example.com'
}

// 第三方服务配置
const THIRD_PARTY_CONFIGS = {
  development: {
    // 微信支付商户号
    mchId: 'dev_mch_id',
    // 地图服务密钥
    mapKey: 'dev_map_key',
    // 统计服务配置
    analyticsKey: 'dev_analytics_key'
  },
  staging: {
    mchId: 'staging_mch_id',
    mapKey: 'staging_map_key',
    analyticsKey: 'staging_analytics_key'
  },
  production: {
    mchId: 'prod_mch_id',
    mapKey: 'prod_map_key',
    analyticsKey: 'prod_analytics_key'
  }
}

// 功能开关配置
const FEATURE_FLAGS = {
  development: {
    enableDebugPanel: true,
    enableMockData: true,
    enablePerformanceMonitor: true,
    enableErrorReporting: false
  },
  staging: {
    enableDebugPanel: true,
    enableMockData: false,
    enablePerformanceMonitor: true,
    enableErrorReporting: true
  },
  production: {
    enableDebugPanel: false,
    enableMockData: false,
    enablePerformanceMonitor: false,
    enableErrorReporting: true
  }
}

// 业务配置
const BUSINESS_CONFIGS = {
  // 分页配置
  pagination: {
    defaultPageSize: 20,
    maxPageSize: 100
  },
  // 上传配置
  upload: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif'],
    maxFiles: 9
  },
  // 缓存配置
  cache: {
    userInfoExpire: 24 * 60 * 60 * 1000, // 24小时
    apiCacheExpire: 5 * 60 * 1000, // 5分钟
    staticResourceExpire: 7 * 24 * 60 * 60 * 1000 // 7天
  }
}

module.exports = {
  API_BASE_URLS,
  THIRD_PARTY_CONFIGS,
  FEATURE_FLAGS,
  BUSINESS_CONFIGS
}
