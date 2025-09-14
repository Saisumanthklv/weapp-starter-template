// src/subpackages/user/settings/index.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    userInfo: {},
    settingsList: [
      { title: '账号与安全', icon: '🔒', type: 'navigate', url: '' },
      { title: '隐私设置', icon: '🛡️', type: 'navigate', url: '' },
      { title: '消息通知', icon: '🔔', type: 'switch', value: true },
      { title: '自动更新', icon: '🔄', type: 'switch', value: false },
      { title: '清除缓存', icon: '🗑️', type: 'action', action: 'clearCache' },
      { title: '意见反馈', icon: '💬', type: 'navigate', url: '' },
      { title: '检查更新', icon: '⬆️', type: 'action', action: 'checkUpdate' },
      { title: '关于应用', icon: 'ℹ️', type: 'navigate', url: '' }
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    console.log('用户设置页面加载完成')
    this.getUserInfo()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {
    console.log('用户设置页面渲染完成')
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    console.log('用户设置页面显示')
  },

  /**
   * 获取用户信息
   */
  getUserInfo() {
    // TODO: 实现获取用户信息逻辑
    const userInfo = wx.getStorageSync('userInfo')
    if (userInfo) {
      this.setData({
        userInfo: userInfo
      })
    }
  },

  /**
   * 设置项点击事件
   */
  onSettingTap(e) {
    const item = e.currentTarget.dataset.item
    
    switch (item.type) {
      case 'navigate':
        if (item.url) {
          wx.navigateTo({
            url: item.url
          })
        } else {
          wx.showToast({
            title: '功能开发中',
            icon: 'none'
          })
        }
        break
      case 'action':
        this.handleAction(item.action)
        break
      case 'switch':
        // 开关类型在 wxml 中处理
        break
    }
  },

  /**
   * 开关切换事件
   */
  onSwitchChange(e) {
    const index = e.currentTarget.dataset.index
    const value = e.detail.value
    const settingsList = this.data.settingsList
    settingsList[index].value = value
    
    this.setData({
      settingsList: settingsList
    })
    
    // TODO: 保存设置到本地存储或服务器
    wx.showToast({
      title: value ? '已开启' : '已关闭',
      icon: 'success'
    })
  },

  /**
   * 处理操作类型的设置项
   */
  handleAction(action) {
    switch (action) {
      case 'clearCache':
        wx.showModal({
          title: '清除缓存',
          content: '确定要清除所有缓存数据吗？',
          success: (res) => {
            if (res.confirm) {
              // TODO: 实现清除缓存逻辑
              wx.showToast({
                title: '缓存已清除',
                icon: 'success'
              })
            }
          }
        })
        break
      case 'checkUpdate':
        wx.showLoading({
          title: '检查中...'
        })
        // TODO: 实现检查更新逻辑
        setTimeout(() => {
          wx.hideLoading()
          wx.showToast({
            title: '已是最新版本',
            icon: 'success'
          })
        }, 1500)
        break
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {
    return {
      title: '分享设置页面',
      path: '/src/subpackages/user/settings/index'
    }
  }
})
