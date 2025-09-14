// src/services/modules/user.js
// 用户相关API接口

const { api } = require('../api.js')

/**
 * 用户模块API
 */
const userApi = {
  /**
   * 获取用户信息
   */
  async getUserInfo() {
    return await api.get('/user/info')
  },

  /**
   * 更新用户信息
   * @param {Object} userInfo 用户信息
   */
  async updateUserInfo(userInfo) {
    return await api.put('/user/info', userInfo)
  },

  /**
   * 获取用户设置
   */
  async getUserSettings() {
    return await api.get('/user/settings')
  },

  /**
   * 更新用户设置
   * @param {Object} settings 设置数据
   */
  async updateUserSettings(settings) {
    return await api.put('/user/settings', settings)
  }
}

module.exports = userApi
