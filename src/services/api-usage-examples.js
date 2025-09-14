// src/services/api-usage-examples.js
// API模块化使用示例

// 导入模块化API
const { user, task, order, product, upload } = require('./index.js')
const { useRequest } = require('../hooks/index.js')

/**
 * 示例1: 基础API使用
 */
const basicApiUsage = {
  // 用户相关操作
  async loginUser(loginData) {
    try {
      const result = await user.login(loginData)
      console.log('登录成功', result)
      return result
    } catch (error) {
      console.error('登录失败', error)
      throw error
    }
  },

  // 获取任务列表
  async getTaskList(params = {}) {
    return await task.getList({
      page: 1,
      pageSize: 20,
      ...params
    })
  },

  // 创建订单
  async createOrder(orderData) {
    return await order.create(orderData)
  }
}

/**
 * 示例2: 在页面中使用API
 */
const pageApiUsage = {
  // 任务列表页面
  taskListPage: {
    data: {
      taskList: [],
      loading: false
    },

    async onLoad() {
      await this.loadTasks()
    },

    async loadTasks() {
      try {
        this.setData({ loading: true })
        const result = await task.getList({
          page: 1,
          pageSize: 20,
          status: 'pending'
        })
        this.setData({ 
          taskList: result.list,
          loading: false 
        })
      } catch (error) {
        this.setData({ loading: false })
        wx.showToast({
          title: error.message || '加载失败',
          icon: 'none'
        })
      }
    },

    async createTask(taskData) {
      try {
        await task.create(taskData)
        wx.showToast({ title: '创建成功', icon: 'success' })
        this.loadTasks() // 重新加载列表
      } catch (error) {
        wx.showToast({
          title: error.message || '创建失败',
          icon: 'none'
        })
      }
    }
  },

  // 产品列表页面
  productListPage: {
    data: {
      productList: [],
      categories: []
    },

    async onLoad() {
      // 并行加载分类和产品
      await Promise.all([
        this.loadCategories(),
        this.loadProducts()
      ])
    },

    async loadCategories() {
      try {
        const categories = await product.getCategories()
        this.setData({ categories })
      } catch (error) {
        console.error('加载分类失败', error)
      }
    },

    async loadProducts(categoryId) {
      try {
        const params = { page: 1, pageSize: 20 }
        if (categoryId) params.categoryId = categoryId
        
        const result = await product.getList(params)
        this.setData({ productList: result.list })
      } catch (error) {
        wx.showToast({
          title: '加载产品失败',
          icon: 'none'
        })
      }
    }
  }
}

/**
 * 示例3: 使用Hooks进行状态管理
 */
const hooksApiUsage = {
  userProfilePage: {
    async onLoad() {
      const { requestWithLoading } = useRequest()
      
      // 带加载状态的用户信息获取
      try {
        const userInfo = await requestWithLoading(
          () => user.getUserInfo(),
          { loadingText: '加载用户信息...' }
        )
        this.setData({ userInfo })
      } catch (error) {
        wx.showToast({
          title: error.message || '加载失败',
          icon: 'none'
        })
      }
    },

    async updateProfile(profileData) {
      const { requestWithLoading } = useRequest()
      
      try {
        await requestWithLoading(
          () => user.updateUserInfo(profileData),
          { loadingText: '保存中...' }
        )
        wx.showToast({ title: '保存成功', icon: 'success' })
      } catch (error) {
        wx.showToast({
          title: error.message || '保存失败',
          icon: 'none'
        })
      }
    }
  }
}

/**
 * 示例4: 错误处理最佳实践
 */
const errorHandlingExamples = {
  async safeApiCall(apiFunction, fallbackValue = null) {
    try {
      return await apiFunction()
    } catch (error) {
      console.error('API调用失败:', error)
      
      // 根据错误类型进行不同处理
      if (error.type === 'NETWORK_ERROR') {
        wx.showToast({
          title: '网络连接失败',
          icon: 'none'
        })
      } else if (error.code === 401) {
        // 未授权，跳转登录
        wx.navigateTo({
          url: '/pages/login/index'
        })
      } else {
        wx.showToast({
          title: error.message || '操作失败',
          icon: 'none'
        })
      }
      
      return fallbackValue
    }
  },

  // 使用示例
  async loadUserData() {
    const userInfo = await this.safeApiCall(
      () => user.getUserInfo(),
      { name: '游客', avatar: '' }
    )
    this.setData({ userInfo })
  }
}

/**
 * 示例5: 文件上传
 */
const uploadExamples = {
  async uploadAvatar() {
    try {
      // 选择图片
      const res = await new Promise((resolve, reject) => {
        wx.chooseImage({
          count: 1,
          sizeType: ['compressed'],
          sourceType: ['album', 'camera'],
          success: resolve,
          fail: reject
        })
      })

      const filePath = res.tempFilePaths[0]
      
      // 上传图片
      wx.showLoading({ title: '上传中...' })
      const uploadResult = await upload.uploadImage(filePath)
      
      // 更新用户头像
      await user.updateUserInfo({
        avatar: uploadResult.url
      })
      
      wx.hideLoading()
      wx.showToast({ title: '头像更新成功', icon: 'success' })
      
      return uploadResult.url
    } catch (error) {
      wx.hideLoading()
      wx.showToast({
        title: error.message || '上传失败',
        icon: 'none'
      })
      throw error
    }
  }
}

/**
 * 示例6: 混入中使用模块化API
 */
const mixinApiUsage = {
  // 在listMixin中的实现示例
  taskListMixin: {
    // 实现fetchList方法
    async fetchList(params) {
      return await task.getList(params)
    },

    // 额外的任务操作方法
    async completeTask(taskId) {
      try {
        await task.complete(taskId)
        wx.showToast({ title: '任务完成', icon: 'success' })
        this.refreshData() // 刷新列表
      } catch (error) {
        wx.showToast({
          title: error.message || '操作失败',
          icon: 'none'
        })
      }
    }
  }
}

module.exports = {
  basicApiUsage,
  pageApiUsage,
  hooksApiUsage,
  errorHandlingExamples,
  uploadExamples,
  mixinApiUsage
}
