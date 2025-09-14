// src/utils/logger.js
// 增强版日志系统，解决小程序调试痛点

/**
 * 日志级别
 */
const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  FATAL: 4 // 新增致命错误级别，用于触发立即上报
}

/**
 * 日志分类
 */
const LOG_CATEGORIES = {
  API: 'API',
  UI: 'UI',
  DATA: 'DATA',
  AUTH: 'AUTH',
  PAY: 'PAY',
  SHARE: 'SHARE',
  STORAGE: 'STORAGE',
  NETWORK: 'NETWORK',
  PERFORMANCE: 'PERFORMANCE',
  USER: 'USER',
  ANALYTICS: 'ANALYTICS',
  PLUGIN: 'PLUGIN',
  ERROR: 'ERROR'
}

/**
 * 增强版Logger类
 */
class Logger {
  constructor() {
    this.logs = []
    this.maxLogs = 500 // 优化：减少内存占用，因为主要依赖上报
    this.sessionId = this.generateSessionId()
    this.startTime = Date.now()
    this.userId = null // 用户标识

    // --- 默认配置 ---
    this.config = {
      level: LOG_LEVELS.DEBUG,
      enabledCategories: new Set(Object.values(LOG_CATEGORIES)),
      uploadUrl: '', // 远程上报地址
      uploadTriggerLevel: LOG_LEVELS.ERROR, // 触发自动上报的级别
      uploadDebounceTime: 5000 // 上报防抖时间 (ms)
    }

    this.uploadTimeout = null
    this.init()
  }

  init() {
    // 尝试从缓存中获取用户ID
    this.userId = wx.getStorageSync('userId') || null
  }

  /**
   * 从服务器获取动态配置（示例）
   */
  async fetchRemoteConfig() {
    try {
      const res = await wx.request({ url: 'https://your-server.com/log-config' })
      if (res.statusCode === 200 && res.data) {
        this.updateConfig(res.data)
      }
    } catch (error) {
      console.error('Failed to fetch remote log config:', error)
    }
  }

  /**
   * 更新配置
   */
  updateConfig(newConfig) {
    if (newConfig.level !== undefined) {
      this.config.level = newConfig.level
    }
    if (newConfig.enabledCategories) {
      this.config.enabledCategories = new Set(newConfig.enabledCategories)
    }
    if (newConfig.uploadUrl) {
      this.config.uploadUrl = newConfig.uploadUrl
    }
    // ...可以更新更多配置
    console.log('Logger config updated.')
  }

  /**
   * 设置用户ID
   */
  setUser(userId) {
    this.userId = userId
    wx.setStorageSync('userId', userId) // 持久化
  }

  /**
   * 生成会话ID
   */
  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
  }

  /**
   * 格式化时间戳
   */
  formatTimestamp(timestamp) {
    const date = new Date(timestamp)
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}.${date.getMilliseconds().toString().padStart(3, '0')}`
  }

  /**
   * 获取调用栈信息（优化版）
   */
  getStackTrace() {
    try {
      const stack = new Error().stack
      if (!stack) return null

      const lines = stack.split('\n')
      // 从第3行开始查找，跳过Error和getStackTrace本身的调用
      for (let i = 2; i < lines.length; i++) {
        const line = lines[i].trim()
        if (line.includes('logger.js')) continue

        // 匹配 'at functionName (filePath:line:column)' 或 'at filePath:line:column'
        const match = line.match(/(?:at\s+(?:.*?\s+\()?(.*?):(\d+):(\d+)\)?)|(?:at\s+(.*))/)
        if (match) {
          const file = match[1]
          // 过滤掉微信开发者工具内部的调用
          if (file && !file.startsWith('WAService.js')) {
            return {
              function: line.split(' ')[1] || 'anonymous',
              file: file,
              line: parseInt(match[2]),
              column: parseInt(match[3])
            }
          }
        }
      }
    } catch (e) {
      // 在某些环境下 new Error().stack 可能不可用
    }
    return null
  }

  /**
   * 获取当前页面/组件上下文
   */
  getPageContext() {
    try {
      const pages = getCurrentPages()
      if (pages.length > 0) {
        const currentPage = pages[pages.length - 1]
        return {
          route: currentPage.route,
          options: currentPage.options
        }
      }
    } catch (e) {}
    return null
  }

  /**
   * 创建日志条目
   */
  createLogEntry(level, category, message, data, context) {
    const timestamp = Date.now()
    
    const entry = {
      id: `log_${timestamp}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp,
      sessionId: this.sessionId,
      userId: this.userId,
      level,
      category,
      message,
      data: data ? JSON.parse(JSON.stringify(data)) : null,
      context: {
        ...this.getPageContext(),
        ...(context || {})
      },
      stackTrace: this.getStackTrace(),
      relativeTime: timestamp - this.startTime
    }

    this.logs.push(entry)
    if (this.logs.length > this.maxLogs) {
      this.logs.shift()
    }

    return entry
  }

  /**
   * 输出日志到控制台
   */
  outputToConsole(entry) {
    const { level, category, message, data, timestamp, stackTrace, context } = entry
    const timeStr = this.formatTimestamp(timestamp)
    const categoryStr = `[${category}]`
    const locationStr = stackTrace ? `${stackTrace.file}:${stackTrace.line}` : (context.route || 'unknown')

    const consoleMethods = {
      [LOG_LEVELS.DEBUG]: console.log,
      [LOG_LEVELS.INFO]: console.info,
      [LOG_LEVELS.WARN]: console.warn,
      [LOG_LEVELS.ERROR]: console.error,
      [LOG_LEVELS.FATAL]: console.error
    }

    const consoleMethod = consoleMethods[level] || console.log
    const prefix = `${timeStr} ${categoryStr}`
    
    if (data) {
      consoleMethod(`${prefix} ${message}`, data, `\n📍 ${locationStr}`)
    } else {
      consoleMethod(`${prefix} ${message} \n📍 ${locationStr}`)
    }
  }

  /**
   * 记录日志
   */
  log(level, category, message, data, context) {
    if (level < this.config.level || !this.config.enabledCategories.has(category)) {
      return
    }

    const entry = this.createLogEntry(level, category, message, data, context)
    this.outputToConsole(entry)

    // 检查是否触发自动上报
    if (level >= this.config.uploadTriggerLevel) {
      this.scheduleUpload()
    }
    
    return entry
  }

  /**
   * 获取日志上下文（指定日志前后的日志）
   */
  getLogContext(logId, contextSize = 5) {
    const logIndex = this.logs.findIndex(log => log.id === logId)
    if (logIndex === -1) return null

    const startIndex = Math.max(0, logIndex - contextSize)
    const endIndex = Math.min(this.logs.length - 1, logIndex + contextSize)
    
    return {
      targetLog: this.logs[logIndex],
      contextLogs: this.logs.slice(startIndex, endIndex + 1),
      targetIndex: logIndex - startIndex
    }
  }

  /**
   * 导出日志
   */
  exportLogs(filters = {}) {
    const logs = this.getLogs(filters)
    const exportData = {
      sessionId: this.sessionId,
      exportTime: Date.now(),
      totalLogs: logs.length,
      logs: logs.map(log => ({
        ...log,
        formattedTime: this.formatTimestamp(log.timestamp)
      }))
    }
    return JSON.stringify(exportData, null, 2)
  }

  /**
   * 导出最近 N 条日志（按时间顺序保留最新 N 条）
   */
  exportRecent(count = 100) {
    const recent = this.logs.slice(Math.max(0, this.logs.length - count))
    const exportData = {
      sessionId: this.sessionId,
      exportTime: Date.now(),
      totalLogs: recent.length,
      logs: recent.map(log => ({
        ...log,
        formattedTime: this.formatTimestamp(log.timestamp)
      }))
    }
    return JSON.stringify(exportData, null, 2)
  }

  /**
   * 获取最近 N 条日志（数组对象）
   */
  getRecent(count = 100) {
    return this.logs.slice(Math.max(0, this.logs.length - count))
  }

  /**
   * 清空日志
   */
  clear() {
    this.logs = []
    console.clear()
  }

  /**
   * 获取统计信息
   */
  getStats() {
    const stats = {
      total: this.logs.length,
      byLevel: {},
      byCategory: {},
      sessionId: this.sessionId,
      startTime: this.startTime,
      duration: Date.now() - this.startTime
    }

    // 按级别统计
    Object.values(LOG_LEVELS).forEach(level => {
      stats.byLevel[level] = this.logs.filter(log => log.level === level).length
    })

    // 按分类统计
    Object.values(LOG_CATEGORIES).forEach(category => {
      stats.byCategory[category] = this.logs.filter(log => log.category === category).length
    })

    return stats
  }
}

// 创建全局logger实例
const logger = new Logger()

// 便捷方法
function createCategoryLogger(category) {
  return {
    debug(message, data, context) {
      return logger.log(LOG_LEVELS.DEBUG, category, message, data, context)
    },
    info(message, data, context) {
      return logger.log(LOG_LEVELS.INFO, category, message, data, context)
    },
    warn(message, data, context) {
      return logger.log(LOG_LEVELS.WARN, category, message, data, context)
    },
    error(message, data, context) {
      return logger.log(LOG_LEVELS.ERROR, category, message, data, context)
    },
    fatal(message, data, context) {
      return logger.log(LOG_LEVELS.FATAL, category, message, data, context)
    }
  }
}

// 导出
module.exports = {
  logger,
  LOG_LEVELS,
  LOG_CATEGORIES,
  createCategoryLogger,
  
  // 分类日志器
  apiLogger: createCategoryLogger(LOG_CATEGORIES.API),
  uiLogger: createCategoryLogger(LOG_CATEGORIES.UI),
  dataLogger: createCategoryLogger(LOG_CATEGORIES.DATA),
  authLogger: createCategoryLogger(LOG_CATEGORIES.AUTH),
  payLogger: createCategoryLogger(LOG_CATEGORIES.PAY),
  shareLogger: createCategoryLogger(LOG_CATEGORIES.SHARE),
  storageLogger: createCategoryLogger(LOG_CATEGORIES.STORAGE),
  networkLogger: createCategoryLogger(LOG_CATEGORIES.NETWORK),
  performanceLogger: createCategoryLogger(LOG_CATEGORIES.PERFORMANCE),
  userLogger: createCategoryLogger(LOG_CATEGORIES.USER)
}
