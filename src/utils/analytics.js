// src/utils/analytics.js
// 简化的统计数据收集工具（复用统一日志系统）
const { createCategoryLogger } = require('./logger.js');
const { getDeviceId } = require('./index.js');
const md5 = require('md5');

/**
 * 统计工具类
 */
class Analytics {
  constructor() {
    this.logger = createCategoryLogger('ANALYTICS');
    this.sessionId = this.generateSessionId();
    this.startTime = Date.now();
  }

  generateSessionId() {
    try {
      const deviceId = getDeviceId();
      const seed = [deviceId, Date.now(), Math.random(), Math.random()].join('-');
      return `session_${md5(seed)}`;
    } catch (e) {
      // 兜底：在 md5 不可用或系统信息获取失败时仍可生成
      // 使用 slice 替代已废弃的 substr，取 9 位随机串
      return `session_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
    }
  }

  /**
   * 页面访问统计
   * @param {string} pagePath 页面路径
   * @param {Object} params 页面参数
   */
  trackPageView(pagePath, params = {}) {
    const eventData = {
      event: 'page_view',
      page_path: pagePath,
      params,
      session_id: this.sessionId,
      timestamp: Date.now(),
    };

    this.logger.info('页面访问统计', eventData);
    this.storeEvent(eventData);
  }

  /**
   * 事件统计
   * @param {string} eventName 事件名称
   * @param {Object} properties 事件属性
   */
  trackEvent(eventName, properties = {}) {
    const eventData = {
      event: eventName,
      properties,
      session_id: this.sessionId,
      timestamp: Date.now(),
    };

    this.logger.info('事件统计', eventData);
    this.storeEvent(eventData);
  }

  /**
   * 存储统计数据到本地
   * @param {Object} eventData 事件数据
   */
  storeEvent(eventData) {
    try {
      // 存储到本地缓存，后续可通过接口上报
      const storageKey = 'analytics_data';
      let analyticsData = wx.getStorageSync(storageKey) || [];

      // 添加新的事件数据
      analyticsData.push({
        ...eventData,
        id: `${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
        stored_at: new Date().toISOString(),
      });

      // 滚动存储：仅保留最近 10 条，超出部分丢弃
      if (analyticsData.length > 10) {
        analyticsData = analyticsData.slice(-10);
      }

      wx.setStorageSync(storageKey, analyticsData);
      this.logger.info('统计数据已存储到本地（仅保留最近10条）');
    } catch (error) {
      this.logger.error('统计数据存储失败', error);
    }
  }

  /**
   * 获取本地存储的统计数据
   */
  getStoredAnalytics() {
    try {
      return wx.getStorageSync('analytics_data') || [];
    } catch (error) {
      this.logger.error('获取统计数据失败', error);
      return [];
    }
  }

  /**
   * 清空本地统计数据
   */
  clearStoredAnalytics() {
    try {
      wx.removeStorageSync('analytics_data');
      this.logger.info('本地统计数据已清空');
    } catch (error) {
      this.logger.error('清空统计数据失败', error);
    }
  }
}

// 创建全局实例
const analytics = new Analytics();

// 导出便捷函数
const trackPageView = (pagePath, params) =>
  analytics.trackPageView(pagePath, params);
const trackEvent = (eventName, properties) =>
  analytics.trackEvent(eventName, properties);
const getStoredAnalytics = () => analytics.getStoredAnalytics();
const clearStoredAnalytics = () => analytics.clearStoredAnalytics();

module.exports = {
  analytics,
  trackPageView,
  trackEvent,
  getStoredAnalytics,
  clearStoredAnalytics,
};
