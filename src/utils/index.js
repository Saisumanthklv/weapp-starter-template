// src/utils/index.js
// 公共工具函数集合

const _ = require('lodash')
const md5 = require('md5')

/**
 * 校验工具
 */
const validateUtils = {
  /**
   * 校验邮箱
   * @param {String} email
   */
  isEmail(email) {
    return /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/.test(email)
  },

  /**
   * 校验手机号
   * @param {String} mobile
   */
  isMobile(mobile) {
    return /^1[3-9]\d{9}$/.test(mobile)
  },

  /**
   * 校验URL
   * @param {String} url
   */
  isURL(url) {
    return /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/.test(url)
  },

  /**
   * 校验身份证号
   * @param {String} idCard
   */
  isIdCard(idCard) {
    return /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/.test(idCard)
  }
}

/**
 * 缓存工具（小程序专用）
 */
const storageUtils = {
  /**
   * 设置缓存
   * @param {String} key
   * @param {Any} value
   */
  set(key, value) {
    wx.setStorageSync(key, value)
  },

  /**
   * 获取缓存
   * @param {String} key
   */
  get(key) {
    return wx.getStorageSync(key)
  },

  /**
   * 移除缓存
   * @param {String} key
   */
  remove(key) {
    wx.removeStorageSync(key)
  },

  /**
   * 清空缓存
   */
  clear() {
    wx.clearStorageSync()
  }
}

/**
 * 获取或生成设备唯一ID (deviceId)
 * 首次生成后会持久化存储在本地缓存中
 */
const getDeviceId = () => {
  const deviceIdKey = 'deviceId'
  let deviceId = storageUtils.get(deviceIdKey)

  if (!deviceId) {
    // 如果缓存中没有，则生成一个新的deviceId
    // 使用时间戳 + 随机数作为种子，确保唯一性
    const seed = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
    deviceId = md5(seed)
    storageUtils.set(deviceIdKey, deviceId)
  }

  return deviceId
}

module.exports = {
  _,
  md5,
  validateUtils,
  storageUtils,
  getDeviceId
}
