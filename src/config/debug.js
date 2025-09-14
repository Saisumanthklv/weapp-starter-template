// src/config/debug.js
// 调试工具配置文件

module.exports = {
  // 调试工具总开关
  enabled: true,

  // 环境配置 - 只在指定环境启用
  enabledEnvironments: ['develop', 'trial'], // 'develop', 'trial', 'release'

  

  

  // 支付（wxPay）配置
  payment: {
    confirmEnabled: true, // 是否启用二次确认
    minInterval: 1500, // 二次点击节流最小间隔(ms)
  },

  // 分享（share）配置
  share: {
    // 全局默认卡片参数（与页面入参合并）
    globalDefaults: {
      title: '',
      path: '',
      imageUrl: '',
    },
    // 是否启用默认卡片生成策略（基于当前页面生成）
    enableDefaultStrategy: true,
  },
};
