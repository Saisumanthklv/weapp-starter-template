// src/mixins/index.js
// 页面和组件混入文件

const { storeHelpers } = require('../store/index.js')
const utils = require('../utils/index.js')
const constants = require('../constants/index.js')

/**
 * 基础混入 - 提供通用的页面功能
 */
const baseMixin = {
  data: {
    loading: false,
    error: null
  },

  onLoad() {
    // 页面加载时的通用逻辑
    this.setData({
      loading: false,
      error: null
    })
  },

  onShow() {
    // 页面显示时的通用逻辑
    storeHelpers.pushPage(this.route)
  },

  onHide() {
    // 页面隐藏时的通用逻辑
  },

  onUnload() {
    // 页面卸载时的通用逻辑
    storeHelpers.popPage()
  },

  methods: {
    /**
     * 设置加载状态
     * @param {Boolean} loading 是否加载中
     */
    setLoading(loading) {
      this.setData({ loading })
      storeHelpers.setLoading(loading)
    },

    /**
     * 设置错误信息
     * @param {String} error 错误信息
     */
    setError(error) {
      this.setData({ error })
    },

    /**
     * 显示成功提示
     * @param {String} title 提示文本
     */
    showSuccess(title = '操作成功') {
      wx.showToast({
        title,
        icon: 'success',
        duration: 2000
      })
    },

    /**
     * 显示错误提示
     * @param {String} title 提示文本
     */
    showError(title = '操作失败') {
      wx.showToast({
        title,
        icon: 'none',
        duration: 2000
      })
    },

    /**
     * 显示加载提示
     * @param {String} title 提示文本
     */
    showLoading(title = '加载中...') {
      wx.showLoading({
        title,
        mask: true
      })
    },

    /**
     * 隐藏加载提示
     */
    hideLoading() {
      wx.hideLoading()
    },

    /**
     * 显示确认对话框
     * @param {Object} options 配置选项
     */
    showConfirm(options = {}) {
      const defaultOptions = {
        title: '提示',
        content: '确定要执行此操作吗？',
        confirmText: '确定',
        cancelText: '取消'
      }
      
      return new Promise((resolve) => {
        wx.showModal({
          ...defaultOptions,
          ...options,
          success: (res) => {
            resolve(res.confirm)
          }
        })
      })
    },

    /**
     * 页面跳转
     * @param {String} url 页面路径
     * @param {Object} params 参数
     */
    navigateTo(url, params = {}) {
      const queryString = Object.keys(params)
        .map(key => `${key}=${encodeURIComponent(params[key])}`)
        .join('&')
      
      const fullUrl = queryString ? `${url}?${queryString}` : url
      
      wx.navigateTo({
        url: fullUrl,
        fail: () => {
          // 如果跳转失败，尝试使用switchTab
          wx.switchTab({ url })
        }
      })
    },

    /**
     * 页面重定向
     * @param {String} url 页面路径
     */
    redirectTo(url) {
      wx.redirectTo({ url })
    },

    /**
     * 返回上一页
     * @param {Number} delta 返回层数
     */
    navigateBack(delta = 1) {
      wx.navigateBack({ delta })
    }
  }
}

/**
 * 列表页面混入 - 提供列表页面的通用功能
 */
const listMixin = {
  data: {
    list: [],
    page: 1,
    pageSize: 20,
    total: 0,
    hasMore: true,
    refreshing: false
  },

  onLoad() {
    this.loadData()
  },

  onPullDownRefresh() {
    this.refreshData()
  },

  onReachBottom() {
    this.loadMore()
  },

  methods: {
    /**
     * 加载数据
     * @param {Boolean} refresh 是否刷新
     */
    async loadData(refresh = false) {
      if (refresh) {
        this.setData({
          page: 1,
          list: [],
          hasMore: true
        })
      }

      if (!this.data.hasMore && !refresh) return

      this.setLoading(true)

      try {
        const params = {
          page: this.data.page,
          pageSize: this.data.pageSize,
          ...this.getListParams()
        }

        // 使用模块化API
        const result = await this.fetchList(params)
        const newList = refresh ? result.list : [...this.data.list, ...result.list]

        this.setData({
          list: newList,
          total: result.total,
          hasMore: newList.length < result.total,
          page: this.data.page + 1
        })
      } catch (error) {
        this.showError(error.message || '加载失败')
      } finally {
        this.setLoading(false)
        if (this.data.refreshing) {
          wx.stopPullDownRefresh()
          this.setData({ refreshing: false })
        }
      }
    },

    /**
     * 刷新数据
     */
    refreshData() {
      this.setData({ refreshing: true })
      this.loadData(true)
    },

    /**
     * 加载更多
     */
    loadMore() {
      if (!this.data.loading && this.data.hasMore) {
        this.loadData()
      }
    },

    /**
     * 获取列表参数 - 子页面需要重写此方法
     */
    getListParams() {
      return {}
    },

    /**
     * 获取列表数据 - 子页面需要重写此方法
     */
    async fetchList(params) {
      throw new Error('fetchList method must be implemented')
    }
  }
}

/**
 * 表单页面混入 - 提供表单页面的通用功能
 */
const formMixin = {
  data: {
    formData: {},
    errors: {},
    submitting: false
  },

  methods: {
    /**
     * 更新表单数据
     * @param {String} field 字段名
     * @param {Any} value 字段值
     */
    updateFormData(field, value) {
      this.setData({
        [`formData.${field}`]: value,
        [`errors.${field}`]: null
      })
    },

    /**
     * 设置表单错误
     * @param {String} field 字段名
     * @param {String} message 错误信息
     */
    setFormError(field, message) {
      this.setData({
        [`errors.${field}`]: message
      })
    },

    /**
     * 清除表单错误
     * @param {String} field 字段名
     */
    clearFormError(field) {
      if (field) {
        this.setData({
          [`errors.${field}`]: null
        })
      } else {
        this.setData({ errors: {} })
      }
    },

    /**
     * 验证表单
     */
    validateForm() {
      const rules = this.getValidationRules()
      const errors = {}
      let isValid = true

      Object.keys(rules).forEach(field => {
        const rule = rules[field]
        const value = this.data.formData[field]
        const error = this.validateField(field, value, rule)
        
        if (error) {
          errors[field] = error
          isValid = false
        }
      })

      this.setData({ errors })
      return isValid
    },

    /**
     * 验证单个字段
     * @param {String} field 字段名
     * @param {Any} value 字段值
     * @param {Object} rule 验证规则
     */
    validateField(field, value, rule) {
      if (rule.required && (!value || value.toString().trim() === '')) {
        return rule.message || `${field}不能为空`
      }

      if (value && rule.pattern && !rule.pattern.test(value)) {
        return rule.message || `${field}格式不正确`
      }

      if (value && rule.minLength && value.length < rule.minLength) {
        return rule.message || `${field}长度不能少于${rule.minLength}个字符`
      }

      if (value && rule.maxLength && value.length > rule.maxLength) {
        return rule.message || `${field}长度不能超过${rule.maxLength}个字符`
      }

      if (rule.validator && typeof rule.validator === 'function') {
        return rule.validator(value)
      }

      return null
    },

    /**
     * 提交表单
     */
    async submitForm() {
      if (this.data.submitting) return

      if (!this.validateForm()) {
        this.showError('请检查表单信息')
        return
      }

      this.setData({ submitting: true })

      try {
        await this.handleSubmit(this.data.formData)
        this.showSuccess('提交成功')
        this.onSubmitSuccess()
      } catch (error) {
        this.showError(error.message || '提交失败')
        this.onSubmitError(error)
      } finally {
        this.setData({ submitting: false })
      }
    },

    /**
     * 获取验证规则 - 子页面需要重写此方法
     */
    getValidationRules() {
      return {}
    },

    /**
     * 处理提交 - 子页面需要重写此方法
     */
    async handleSubmit(formData) {
      throw new Error('handleSubmit method must be implemented')
    },

    /**
     * 提交成功回调
     */
    onSubmitSuccess() {
      // 子页面可以重写此方法
    },

    /**
     * 提交失败回调
     */
    onSubmitError(error) {
      // 子页面可以重写此方法
    }
  }
}

/**
 * 权限混入 - 提供权限检查功能
 */
const authMixin = {
  onLoad() {
    this.checkAuth()
  },

  methods: {
    /**
     * 检查权限
     */
    checkAuth() {
      const userInfo = storeHelpers.store.getState('userInfo')
      const isLoggedIn = storeHelpers.store.getState('isLoggedIn')

      if (!isLoggedIn) {
        this.redirectToLogin()
        return false
      }

      const requiredRole = this.getRequiredRole()
      if (requiredRole && !this.hasRole(userInfo.role, requiredRole)) {
        this.showError('权限不足')
        this.navigateBack()
        return false
      }

      return true
    },

    /**
     * 检查是否有指定角色
     * @param {String} userRole 用户角色
     * @param {String} requiredRole 需要的角色
     */
    hasRole(userRole, requiredRole) {
      const roleLevel = {
        [constants.USER_ROLES.GUEST]: 0,
        [constants.USER_ROLES.USER]: 1,
        [constants.USER_ROLES.VIP]: 2,
        [constants.USER_ROLES.ADMIN]: 3
      }

      return roleLevel[userRole] >= roleLevel[requiredRole]
    },

    /**
     * 跳转到登录页
     */
    redirectToLogin() {
      wx.navigateTo({
        url: '/pages/login/index'
      })
    },

    /**
     * 获取所需角色 - 子页面可以重写此方法
     */
    getRequiredRole() {
      return null
    }
  }
}

module.exports = {
  baseMixin,
  listMixin,
  formMixin,
  authMixin
}
