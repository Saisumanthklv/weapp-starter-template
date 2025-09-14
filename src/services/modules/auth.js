// src/services/modules/auth.js
// 登录认证相关API接口

const { api } = require('../api.js')

/**
 * 认证模块API
 */
const authApi = {
  /**
   * 微信一键登录
   * @param {Object} loginData 登录数据
   * @param {string} loginData.code 微信登录code
   * @param {string} loginData.encryptedData 加密数据（可选）
   * @param {string} loginData.iv 初始向量（可选）
   */
  async wxLogin(loginData) {
    return await api.post('/auth/wx-login', loginData)
  },

  /**
   * 发送手机验证码
   * @param {Object} phoneData 手机号数据
   * @param {string} phoneData.phone 手机号
   * @param {string} phoneData.type 验证码类型：login|register|reset
   */
  async sendSmsCode(phoneData) {
    return await api.post('/auth/send-sms', phoneData)
  },

  /**
   * 手机号验证码登录
   * @param {Object} loginData 登录数据
   * @param {string} loginData.phone 手机号
   * @param {string} loginData.code 验证码
   */
  async phoneLogin(loginData) {
    return await api.post('/auth/phone-login', loginData)
  },

  /**
   * 绑定手机号
   * @param {Object} phoneData 手机号数据
   * @param {string} phoneData.encryptedData 加密数据
   * @param {string} phoneData.iv 初始向量
   * @param {string} phoneData.code 验证码（可选）
   */
  async bindPhone(phoneData) {
    return await api.post('/auth/bind-phone', phoneData)
  },

  /**
   * 错误上报
   * @param {Object} errorData 错误数据
   */
  async reportError(errorData) {
    // #TODO: 实现实际的错误上报接口
    console.log('错误上报 (模拟):', errorData)
    return Promise.resolve({ success: true, message: '错误上报成功 (模拟)' })
    
    /* 实际实现代码:
    try {
      const response = await api.post('/error/report', {
        ...errorData,
        timestamp: Date.now(),
        userAgent: wx.getSystemInfoSync(),
        version: config.version
      })
      return response
    } catch (error) {
      console.error('错误上报失败:', error)
      throw error
    }
    */
  },

  /**
   * 刷新token
   * @param {string} refreshToken 刷新token
   */
  async refreshToken(refreshToken) {
    return await api.post('/auth/refresh-token', { refreshToken })
  },

  /**
   * 用户登出
   */
  async logout() {
    return await api.post('/auth/logout')
  },

  /**
   * 检查登录状态
   */
  async checkLoginStatus() {
    return await api.get('/auth/status')
  }
}

module.exports = authApi
