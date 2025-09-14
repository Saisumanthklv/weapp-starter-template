// src/plugin/index.js
// 第三方插件及其初始化配置（复用统一日志系统）

const config = require('../config/index.js')
const debugConfig = require('../config/debug.js')

/**
 * 插件管理器
 */
class PluginManager {
  constructor(logger) {
    this.plugins = new Map()
    this.hooks = new Map()
    // 支持传入整个 logger 模块或仅实例
    this.loggerModule = logger
    this.createCategoryLogger = logger && logger.createCategoryLogger ? logger.createCategoryLogger : null
    // 管理器自身的分类日志器（PLUGIN 类别）
    this.coreLogger = this.createCategoryLogger
      ? this.createCategoryLogger('PLUGIN')
      : { info: console.info.bind(console), warn: console.warn.bind(console), error: console.error.bind(console) }
  }

  /**
   * 注册插件
   * @param {string} name 插件名称
   * @param {Object} plugin 插件对象
   */
  register(name, plugin) {
    // 为插件注入一个带有正确分类的logger
    plugin.logger = this.createCategoryLogger
      ? this.createCategoryLogger(plugin.category || name.toUpperCase())
      : this.coreLogger

    if (this.plugins.has(name)) {
      plugin.logger.warn(`插件 ${name} 已存在，将被覆盖`)
    }

    this.plugins.set(name, plugin)
    
    // 初始化插件
    if (plugin.init && typeof plugin.init === 'function') {
      try {
        plugin.init()
        plugin.logger.info(`插件 ${name} 注册成功`)
      } catch (error) {
        plugin.logger.error(`插件 ${name} 初始化失败`, error)
      }
    }
  }

  /**
   * 获取插件
   * @param {string} name 插件名称
   */
  get(name) {
    return this.plugins.get(name)
  }

  /**
   * 卸载插件
   * @param {string} name 插件名称
   */
  unregister(name) {
    const plugin = this.plugins.get(name)
    if (plugin) {
      // 销毁插件
      if (plugin.destroy && typeof plugin.destroy === 'function') {
        try {
          plugin.destroy()
          this.coreLogger.info(`插件 ${name} 卸载成功`)
        } catch (error) {
          this.coreLogger.error(`插件 ${name} 销毁失败`, error)
        }
      }
      this.plugins.delete(name)
    }
  }

  /**
   * 注册钩子
   * @param {string} hookName 钩子名称
   * @param {Function} callback 回调函数
   */
  addHook(hookName, callback) {
    if (!this.hooks.has(hookName)) {
      this.hooks.set(hookName, [])
    }
    this.hooks.get(hookName).push(callback)
  }

  /**
   * 触发钩子
   * @param {string} hookName 钩子名称
   * @param {*} data 传递的数据
   */
  async triggerHook(hookName, data) {
    const callbacks = this.hooks.get(hookName)
    if (callbacks && callbacks.length > 0) {
      for (const callback of callbacks) {
        try {
          await callback(data)
        } catch (error) {
          this.coreLogger.error(`钩子 ${hookName} 执行失败`, error)
        }
      }
    }
  }
}

const wxPayPlugin = {
  name: 'wxPay',
  category: 'PAY', // 定义分类，由管理器注入logger
  
  init() {
    this.logger.info('微信支付插件初始化')
    // 支付节流控制
    this._lastPayTs = 0
    this._minInterval = Number(debugConfig?.payment?.minInterval) || 1500 // ms，二次点击保护
    this._paying = false
    // 二次确认默认开启（可由调用方传参关闭）
    this._confirmEnabled = debugConfig?.payment?.confirmEnabled !== false
  },

  /**
   * 发起支付
   * @param {Object} paymentData 支付数据
   */
  async requestPayment(paymentData) {
    this.logger.info('发起支付请求', paymentData)

    // 节流：防止重复点击
    const now = Date.now()
    if (this._paying || now - this._lastPayTs < this._minInterval) {
      this.logger.warn('支付请求过于频繁，已拦截')
      return Promise.reject({ errMsg: 'requestPayment:throttled' })
    }

    // 二次确认
    if (this._confirmEnabled && paymentData.__confirm__ !== false) {
      const confirm = await new Promise((resolve) => {
        wx.showModal({
          title: '确认支付',
          content: '是否立即发起支付？',
          confirmText: '支付',
          cancelText: '取消',
          success: (res) => resolve(res.confirm),
          fail: () => resolve(false)
        })
      })
      if (!confirm) {
        this.logger.warn('用户取消二次确认，未发起支付')
        return Promise.reject({ errMsg: 'requestPayment:cancel' })
      }
    }

    this._paying = true
    this._lastPayTs = now

    return new Promise((resolve, reject) => {
      wx.requestPayment({
        ...paymentData,
        success: (res) => {
          this.logger.info('支付成功', res)
          pluginManager.triggerHook('payment:success', res)
          resolve(res)
        },
        fail: (err) => {
          this.logger.error('支付失败', err)
          pluginManager.triggerHook('payment:fail', err)
          reject(err)
        },
        complete: () => {
          this._paying = false
        }
      })
    })
  },

  /**
   * 查询支付结果
   * @param {string} orderId 订单ID
   */
  async queryPayment(orderId) {
    this.logger.info('查询支付结果', { orderId })
    const { api } = require('../services/api.js')
    return await api.get(`/payment/query/${orderId}`)
  },

  destroy() {
    this.logger.info('微信支付插件销毁')
  }
}

/**
 * 分享插件
 */
const sharePlugin = {
  name: 'share',
  category: 'SHARE',
  
  init() {
    this.logger.info('分享插件初始化')
    // 默认分享卡片策略与全局默认参数
    this._defaultStrategy = (currentPage) => {
      const route = currentPage?.route || '/src/pages/home/index'
      return {
        title: '分享标题',
        path: `/${route}`.replace(/^\/+/, '/'),
        imageUrl: ''
      }
    }
    this._globalDefaults = {
      title: '',
      path: '',
      imageUrl: ''
    }
    // 应用调试配置
    if (debugConfig?.share?.globalDefaults) {
      this._globalDefaults = { ...this._globalDefaults, ...debugConfig.share.globalDefaults }
    }
    this._enableDefaultStrategy = debugConfig?.share?.enableDefaultStrategy !== false
  },

  /**
   * 设置分享信息
   * @param {Object} shareInfo 分享信息
   */
  setShareInfo(shareInfo) {
    const pages = getCurrentPages()
    const currentPage = pages[pages.length - 1]
    
    if (currentPage) {
      currentPage.onShareAppMessage = () => {
        // 合并默认卡片策略
        const base = this._enableDefaultStrategy ? this._defaultStrategy(currentPage) : {}
        const merged = {
          ...base,
          ...this._globalDefaults,
          ...shareInfo
        }
        this.logger.info('分享给朋友', merged)
        pluginManager.triggerHook('share:appMessage', merged)
        return merged
      }

      currentPage.onShareTimeline = () => {
        const base = this._enableDefaultStrategy ? this._defaultStrategy(currentPage) : {}
        const merged = {
          ...base,
          ...this._globalDefaults,
          ...shareInfo
        }
        this.logger.info('分享到朋友圈', merged)
        pluginManager.triggerHook('share:timeline', merged)
        // 朋友圈不支持 path
        return {
          title: merged.title,
          imageUrl: merged.imageUrl
        }
      }
    }
  },

  /**
   * 设置全局默认分享卡片参数
   */
  setGlobalDefaults(defaults = {}) {
    this._globalDefaults = {
      ...this._globalDefaults,
      ...defaults
    }
  },

  /**
   * 设置默认分享卡片生成策略
   * @param {(currentPage: any) => ({title: string, path?: string, imageUrl?: string})} strategy 
   */
  setDefaultStrategy(strategy) {
    if (typeof strategy === 'function') {
      this._defaultStrategy = strategy
    } else {
      this.logger.warn('setDefaultStrategy 需要函数类型，已忽略')
    }
  },

  destroy() {
    this.logger.info('分享插件销毁')
  }
}


/**
 * 错误监控插件
 */
const errorMonitorPlugin = {
  name: 'errorMonitor',
  category: 'ERROR',
  
  init() {
    this.logger.info('错误监控插件初始化')
    // 错误上报队列与退避控制
    this._queue = []
    this._sending = false
    this._maxRetries = 5
    this._baseDelay = 500 // ms
    this._maxDelay = 8000 // ms
    this.setupErrorHandlers()
  },

  /**
   * 设置错误处理器
   */
  setupErrorHandlers() {
    // 监听小程序错误
    wx.onError((error) => {
      this.logger.error('小程序错误', error)
      this.reportError('app_error', error)
    })

    // 监听未处理的Promise拒绝
    wx.onUnhandledRejection((res) => {
      this.logger.error('未处理的Promise拒绝', res.reason)
      this.reportError('unhandled_rejection', res.reason)
    })
  },

  /**
   * 上报错误
   * @param {string} type 错误类型
   * @param {*} error 错误信息
   */
  async reportError(type, error) {
    const payload = {
      type,
      message: error?.message || String(error),
      stack: error?.stack || '',
      timestamp: Date.now(),
      page: this.getCurrentPage(),
      userAgent: wx.getSystemInfoSync(),
      __retry: 0
    }
    // 入队并尝试发送
    this._queue.push(payload)
    this._drainQueue()
  },

  async _drainQueue() {
    if (this._sending) return
    this._sending = true
    while (this._queue.length > 0) {
      const item = this._queue[0]
      try {
        const { api } = require('../services/api.js')
        await api.post('/error/report', {
          type: item.type,
          message: item.message,
          stack: item.stack,
          timestamp: item.timestamp,
          page: item.page,
          userAgent: item.userAgent
        })
        pluginManager.triggerHook('error:reported', item)
        this.logger.info('错误上报成功', { type: item.type, at: item.timestamp })
        this._queue.shift()
      } catch (err) {
        item.__retry = (item.__retry || 0) + 1
        if (item.__retry > this._maxRetries) {
          this.logger.error('错误上报重试次数达到上限，丢弃', { type: item.type, message: item.message })
          this._queue.shift()
          continue
        }
        const delay = Math.min(this._baseDelay * Math.pow(2, item.__retry - 1), this._maxDelay)
        this.logger.warn('错误上报失败，准备重试', { retry: item.__retry, delay })
        await new Promise((r) => setTimeout(r, delay))
      }
    }
    this._sending = false
  },

  /**
   * 获取当前页面
   */
  getCurrentPage() {
    const pages = getCurrentPages()
    return pages.length > 0 ? pages[pages.length - 1].route : 'unknown'
  },

  destroy() {
    this.logger.info('错误监控插件销毁')
  }
}


let pluginManager;

/**
 * 初始化所有插件
 * @param {object} loggerInstance - 主logger实例
 */
const initializePlugins = (loggerInstance) => {
  if (pluginManager) {
    // 已初始化时给出警告
    try {
      const warnLogger = pluginManager && pluginManager.coreLogger
        ? pluginManager.coreLogger
        : { warn: console.warn.bind(console) }
      warnLogger.warn('插件系统已初始化，请勿重复调用')
    } catch (e) {}
    return pluginManager;
  }

  pluginManager = new PluginManager(loggerInstance);

  // 注册所有插件
  pluginManager.register('wxPay', wxPayPlugin)
  pluginManager.register('share', sharePlugin)
  pluginManager.register('errorMonitor', errorMonitorPlugin)
  
  return pluginManager;
}

module.exports = {
  initializePlugins,
  // 单独导出插件定义，以便在其他地方可能需要引用
  wxPayPlugin,
  sharePlugin,
  errorMonitorPlugin,
}
