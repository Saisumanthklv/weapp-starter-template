// src/hooks/index.js
// 自定义Hooks文件

const { storeHelpers } = require('../store/index.js')
const utils = require('../utils/index.js')

/**
 * 用户信息Hook
 */
const useUserInfo = () => {
  const getUserInfo = () => {
    return storeHelpers.store.getState('userInfo')
  }

  const isLoggedIn = () => {
    return storeHelpers.store.getState('isLoggedIn')
  }

  const login = async (userInfo) => {
    storeHelpers.setUserInfo(userInfo)
    // 触发登录事件
    wx.triggerEvent && wx.triggerEvent('userLogin', userInfo)
  }

  const logout = () => {
    storeHelpers.setUserInfo(null)
    // 清除相关存储
    wx.removeStorageSync('token')
    // 触发登出事件
    wx.triggerEvent && wx.triggerEvent('userLogout')
  }

  const updateUserInfo = (updates) => {
    const currentUserInfo = getUserInfo()
    const newUserInfo = { ...currentUserInfo, ...updates }
    storeHelpers.setUserInfo(newUserInfo)
  }

  return {
    getUserInfo,
    isLoggedIn,
    login,
    logout,
    updateUserInfo
  }
}

/**
 * 网络请求Hook - 提供加载状态管理
 */
const useRequest = () => {
  const { api } = require('../services/api.js')

  /**
   * 带加载状态的请求
   * @param {Function} requestFn 请求函数
   * @param {Object} options 选项
   */
  const requestWithLoading = async (requestFn, options = {}) => {
    const { showLoading = true, loadingText = '加载中...' } = options
    
    try {
      if (showLoading) {
        storeHelpers.setLoading(true)
        if (loadingText) {
          wx.showLoading({ title: loadingText })
        }
      }
      
      const result = await requestFn()
      return result
    } catch (error) {
      console.error('Request error:', error)
      throw error
    } finally {
      if (showLoading) {
        storeHelpers.setLoading(false)
        wx.hideLoading()
      }
    }
  }

  return {
    requestWithLoading,
    // 直接暴露原始API实例，避免重复封装
    api
  }
}

/**
 * 存储Hook
 */
const useStorage = () => {
  const { storageUtils } = utils

  const setItem = (key, value, expire) => {
    storageUtils.set(key, value, expire)
  }

  const getItem = (key, defaultValue) => {
    return storageUtils.get(key, defaultValue)
  }

  const removeItem = (key) => {
    storageUtils.remove(key)
  }

  const clear = () => {
    storageUtils.clear()
  }

  // 响应式存储
  const useReactiveStorage = (key, defaultValue) => {
    const getValue = () => getItem(key, defaultValue)
    const setValue = (value) => {
      setItem(key, value)
      // 可以在这里触发更新事件
    }

    return [getValue, setValue]
  }

  return {
    setItem,
    getItem,
    removeItem,
    clear,
    useReactiveStorage
  }
}

/**
 * 页面生命周期Hook
 */
const usePageLifecycle = () => {
  const onPageLoad = (callback) => {
    // 在页面的onLoad中调用
    if (typeof callback === 'function') {
      callback()
    }
  }

  const onPageShow = (callback) => {
    // 在页面的onShow中调用
    if (typeof callback === 'function') {
      callback()
    }
  }

  const onPageHide = (callback) => {
    // 在页面的onHide中调用
    if (typeof callback === 'function') {
      callback()
    }
  }

  const onPageUnload = (callback) => {
    // 在页面的onUnload中调用
    if (typeof callback === 'function') {
      callback()
    }
  }

  return {
    onPageLoad,
    onPageShow,
    onPageHide,
    onPageUnload
  }
}

/**
 * 表单Hook
 */
const useForm = (initialData = {}) => {
  let formData = { ...initialData }
  let errors = {}

  const setFormData = (data) => {
    formData = { ...formData, ...data }
  }

  const setFieldValue = (field, value) => {
    formData[field] = value
    // 清除该字段的错误
    if (errors[field]) {
      delete errors[field]
    }
  }

  const getFieldValue = (field) => {
    return formData[field]
  }

  const setFieldError = (field, error) => {
    errors[field] = error
  }

  const getFieldError = (field) => {
    return errors[field]
  }

  const clearErrors = () => {
    errors = {}
  }

  const validate = (rules) => {
    const newErrors = {}
    let isValid = true

    Object.keys(rules).forEach(field => {
      const rule = rules[field]
      const value = formData[field]

      if (rule.required && (!value || value.toString().trim() === '')) {
        newErrors[field] = rule.message || `${field}不能为空`
        isValid = false
      } else if (value && rule.pattern && !rule.pattern.test(value)) {
        newErrors[field] = rule.message || `${field}格式不正确`
        isValid = false
      } else if (rule.validator && typeof rule.validator === 'function') {
        const error = rule.validator(value)
        if (error) {
          newErrors[field] = error
          isValid = false
        }
      }
    })

    errors = newErrors
    return isValid
  }

  const reset = () => {
    formData = { ...initialData }
    errors = {}
  }

  return {
    formData,
    errors,
    setFormData,
    setFieldValue,
    getFieldValue,
    setFieldError,
    getFieldError,
    clearErrors,
    validate,
    reset
  }
}

/**
 * 列表Hook
 */
const useList = (fetchFunction) => {
  let list = []
  let loading = false
  let page = 1
  let pageSize = 20
  let total = 0
  let hasMore = true

  const loadData = async (refresh = false) => {
    if (loading) return

    if (refresh) {
      page = 1
      list = []
      hasMore = true
    }

    if (!hasMore && !refresh) return

    loading = true

    try {
      const result = await fetchFunction({
        page,
        pageSize
      })

      const newList = refresh ? result.list : [...list, ...result.list]
      list = newList
      total = result.total
      hasMore = newList.length < result.total
      page += 1

      return {
        list: newList,
        total,
        hasMore
      }
    } catch (error) {
      throw error
    } finally {
      loading = false
    }
  }

  const refresh = () => {
    return loadData(true)
  }

  const loadMore = () => {
    return loadData(false)
  }

  const reset = () => {
    list = []
    page = 1
    total = 0
    hasMore = true
    loading = false
  }

  return {
    list,
    loading,
    total,
    hasMore,
    loadData,
    refresh,
    loadMore,
    reset
  }
}

/**
 * 防抖Hook
 */
const useDebounce = (func, delay = 300) => {
  let timer = null

  const debouncedFunc = (...args) => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      func.apply(this, args)
    }, delay)
  }

  const cancel = () => {
    if (timer) {
      clearTimeout(timer)
      timer = null
    }
  }

  return {
    debouncedFunc,
    cancel
  }
}

/**
 * 节流Hook
 */
const useThrottle = (func, delay = 300) => {
  let timer = null
  let lastExecTime = 0

  const throttledFunc = (...args) => {
    const currentTime = Date.now()

    if (currentTime - lastExecTime > delay) {
      func.apply(this, args)
      lastExecTime = currentTime
    } else if (!timer) {
      timer = setTimeout(() => {
        func.apply(this, args)
        lastExecTime = Date.now()
        timer = null
      }, delay - (currentTime - lastExecTime))
    }
  }

  const cancel = () => {
    if (timer) {
      clearTimeout(timer)
      timer = null
    }
  }

  return {
    throttledFunc,
    cancel
  }
}

module.exports = {
  useUserInfo,
  useRequest,
  useStorage,
  usePageLifecycle,
  useForm,
  useList,
  useDebounce,
  useThrottle
}
