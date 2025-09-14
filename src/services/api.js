// src/services/api.js
// 网络请求封装服务

const config = require('../config/index.js')

/**
 * HTTP请求封装类
 */
class ApiService {
  constructor() {
    this.baseUrl = config.apiBaseUrl
    this.timeout = config.timeout
    this.defaultHeaders = {
      'Content-Type': 'application/json'
    }
  }

  /**
   * 通用请求方法
   * @param {Object} options 请求配置
   */
  request(options = {}) {
    return new Promise((resolve, reject) => {
      // 请求拦截器
      const requestOptions = this.interceptRequest(options)
      
      wx.request({
        url: requestOptions.url,
        method: requestOptions.method || 'GET',
        data: requestOptions.data,
        header: requestOptions.header,
        timeout: requestOptions.timeout || this.timeout,
        success: (res) => {
          // 响应拦截器
          this.interceptResponse(res, resolve, reject)
        },
        fail: (error) => {
          this.handleError(error, reject)
        }
      })
    })
  }

  /**
   * 请求拦截器
   * @param {Object} options 原始请求配置
   */
  interceptRequest(options) {
    const token = wx.getStorageSync(config.storage.token)
    
    // 处理URL
    let url = options.url
    if (!url.startsWith('http')) {
      url = this.baseUrl + url
    }

    // 处理请求头
    const header = {
      ...this.defaultHeaders,
      ...options.header
    }

    // 添加认证token
    if (token) {
      header.Authorization = `Bearer ${token}`
    }

    // 添加设备信息
    const systemInfo = wx.getSystemInfoSync()
    header['X-Device-Info'] = JSON.stringify({
      platform: systemInfo.platform,
      version: systemInfo.version,
      model: systemInfo.model
    })

    if (config.debug) {
      console.log('API Request:', { url, method: options.method, data: options.data, header })
    }

    return {
      ...options,
      url,
      header
    }
  }

  /**
   * 响应拦截器
   * @param {Object} res 响应对象
   * @param {Function} resolve Promise resolve
   * @param {Function} reject Promise reject
   */
  interceptResponse(res, resolve, reject) {
    if (config.debug) {
      console.log('API Response:', res)
    }

    const { statusCode, data } = res

    // HTTP状态码检查
    if (statusCode >= 200 && statusCode < 300) {
      // 业务状态码检查
      if (data.code === 0 || data.success) {
        resolve(data.data || data)
      } else {
        // 业务错误处理
        this.handleBusinessError(data, reject)
      }
    } else {
      // HTTP错误处理
      this.handleHttpError(res, reject)
    }
  }

  /**
   * 业务错误处理
   * @param {Object} data 响应数据
   * @param {Function} reject Promise reject
   */
  handleBusinessError(data, reject) {
    const error = {
      type: 'BUSINESS_ERROR',
      code: data.code,
      message: data.message || '业务处理失败',
      data: data
    }

    // 特殊错误码处理
    if (data.code === 401) {
      // token过期，清除本地存储并跳转登录
      wx.removeStorageSync(config.storage.token)
      wx.removeStorageSync(config.storage.userInfo)
      // TODO: 跳转到登录页面
    }

    if (config.debug) {
      console.error('Business Error:', error)
    }

    reject(error)
  }

  /**
   * HTTP错误处理
   * @param {Object} res 响应对象
   * @param {Function} reject Promise reject
   */
  handleHttpError(res, reject) {
    const error = {
      type: 'HTTP_ERROR',
      statusCode: res.statusCode,
      message: this.getHttpErrorMessage(res.statusCode),
      data: res
    }

    if (config.debug) {
      console.error('HTTP Error:', error)
    }

    reject(error)
  }

  /**
   * 网络错误处理
   * @param {Object} error 错误对象
   * @param {Function} reject Promise reject
   */
  handleError(error, reject) {
    const networkError = {
      type: 'NETWORK_ERROR',
      message: '网络连接失败，请检查网络设置',
      data: error
    }

    if (config.debug) {
      console.error('Network Error:', networkError)
    }

    reject(networkError)
  }

  /**
   * 获取HTTP错误信息
   * @param {Number} statusCode 状态码
   */
  getHttpErrorMessage(statusCode) {
    const messages = {
      400: '请求参数错误',
      401: '未授权访问',
      403: '禁止访问',
      404: '请求的资源不存在',
      405: '请求方法不允许',
      408: '请求超时',
      500: '服务器内部错误',
      502: '网关错误',
      503: '服务不可用',
      504: '网关超时'
    }
    return messages[statusCode] || `请求失败 (${statusCode})`
  }

  /**
   * GET请求
   * @param {String} url 请求地址
   * @param {Object} params 请求参数
   * @param {Object} options 其他配置
   */
  get(url, params = {}, options = {}) {
    // 将参数拼接到URL中
    if (Object.keys(params).length > 0) {
      const queryString = Object.keys(params)
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
        .join('&')
      url += (url.includes('?') ? '&' : '?') + queryString
    }

    return this.request({
      url,
      method: 'GET',
      ...options
    })
  }

  /**
   * POST请求
   * @param {String} url 请求地址
   * @param {Object} data 请求数据
   * @param {Object} options 其他配置
   */
  post(url, data = {}, options = {}) {
    return this.request({
      url,
      method: 'POST',
      data,
      ...options
    })
  }

  /**
   * PUT请求
   * @param {String} url 请求地址
   * @param {Object} data 请求数据
   * @param {Object} options 其他配置
   */
  put(url, data = {}, options = {}) {
    return this.request({
      url,
      method: 'PUT',
      data,
      ...options
    })
  }

  /**
   * DELETE请求
   * @param {String} url 请求地址
   * @param {Object} options 其他配置
   */
  delete(url, options = {}) {
    return this.request({
      url,
      method: 'DELETE',
      ...options
    })
  }

  /**
   * 文件上传
   * @param {String} url 上传地址
   * @param {String} filePath 文件路径
   * @param {Object} formData 额外的表单数据
   * @param {Object} options 其他配置
   */
  upload(url, filePath, formData = {}, options = {}) {
    return new Promise((resolve, reject) => {
      const token = wx.getStorageSync(config.storage.token)
      
      if (!url.startsWith('http')) {
        url = this.baseUrl + url
      }

      const header = {
        ...options.header
      }

      if (token) {
        header.Authorization = `Bearer ${token}`
      }

      wx.uploadFile({
        url,
        filePath,
        name: options.name || 'file',
        formData,
        header,
        success: (res) => {
          try {
            const data = JSON.parse(res.data)
            if (data.code === 0 || data.success) {
              resolve(data.data || data)
            } else {
              reject({
                type: 'UPLOAD_ERROR',
                message: data.message || '上传失败',
                data: data
              })
            }
          } catch (error) {
            reject({
              type: 'PARSE_ERROR',
              message: '响应数据解析失败',
              data: res
            })
          }
        },
        fail: (error) => {
          reject({
            type: 'UPLOAD_ERROR',
            message: '文件上传失败',
            data: error
          })
        }
      })
    })
  }
}

// 创建API实例
const api = new ApiService()

// 只导出通用的API封装类实例
module.exports = {
  ApiService,
  api
}
