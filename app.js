// app.js
const { initializeApp, checkForUpdates } = require('./src/app-init.js')
const { trackPageView, trackEvent, getStoredAnalytics, clearStoredAnalytics } = require('./src/utils/analytics.js')
const { logger } = require('./src/utils/logger.js')

App({
  async onLaunch() {
    console.log('小程序启动')

    // 初始化应用
    const initSuccess = await initializeApp()
    if (!initSuccess) {
      console.error('应用初始化失败')
      return
    }

    // 设置全局统计函数
    this.setupGlobalAnalytics()

    // 设置开发者工具命令
    this.setupDevCommands()

    // 检查更新
    checkForUpdates()

    // 展示本地存储能力
    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        console.log('登录成功', res.code)
      }
    })
  },

  onShow() {
    console.log('小程序显示')
  },

  onHide() {
    console.log('小程序隐藏')
  },

  onError(msg) {
    console.error('小程序错误:', msg)
  },

  /**
   * 设置全局统计函数
   */
  setupGlobalAnalytics() {
    // 仅在 wx 命名空间挂载，便于在任意上下文通过 wx.$xxx 访问
    try {
      wx.$trackPageView = trackPageView
      wx.$trackEvent = trackEvent
      wx.$getStoredAnalytics = getStoredAnalytics
      wx.$clearStoredAnalytics = clearStoredAnalytics
    } catch (e) {
      // ignore if wx is not ready
    }

    console.log('全局统计函数已设置: $trackPageView, $trackEvent, $getStoredAnalytics, $clearStoredAnalytics')
  },

  /**
   * 设置开发者工具命令（在 DevTools 控制台调用）
   * 可用命令：
   *  - $printRecentLogs(N): 打印最近 N 条日志（默认 100）
   *  - $exportRecentLogs(N): 导出最近 N 条日志为 JSON，并复制到剪贴板
   */
  setupDevCommands() {
    const printRecent = (count = 100) => {
      try {
        const recent = logger.getRecent(count)
        console.info(`[DEV] 最近 ${recent.length} 条日志:`, recent)
        return recent
      } catch (e) {
        console.error('[DEV] 打印日志失败:', e)
        return []
      }
    }

    const exportRecent = (count = 100) => {
      try {
        const json = logger.exportRecent(count)
        if (typeof wx !== 'undefined' && wx.setClipboardData) {
          wx.setClipboardData({ data: json })
          wx.showToast({ title: `已复制最近${count}条日志`, icon: 'success' })
        }
        console.info(`[DEV] 导出最近 ${count} 条日志：已复制到剪贴板`)
        return json
      } catch (e) {
        console.error('[DEV] 导出日志失败:', e)
        return ''
      }
    }

    // 仅注册到 wx 命名空间，便于在控制台调用
    if (typeof wx !== 'undefined') {
      wx.$printRecentLogs = printRecent
      wx.$exportRecentLogs = exportRecent
    }

    console.log('开发者命令已注册: $printRecentLogs(count), $exportRecentLogs(count)')
  },

  globalData: {
    userInfo: null,
    version: '1.0.0'
  }
})
