// src/pages/profile/index.js
// 全局统计：使用 wx.$trackPageView / wx.$trackEvent / wx.$getStoredAnalytics（已在 app.js 中挂载）

Page({
  /**
   * 页面的初始数据
   */
  data: {
    userInfo: {
      avatar: 'https://picsum.photos/200/200?random=user',
      nickname: '微信用户',
      userId: 'wx_user_001',
      level: 'VIP2',
    },
    stats: {
      orderCount: 12,
      favoriteCount: 36,
      couponCount: 5,
      pointsCount: 2580,
    },
    orderStatus: {
      pending: 2,
      shipped: 1,
      completed: 9,
      refund: 0,
    },
    // 统计数据网格数据
    statsData: [
      { type: 'orders', label: '订单', value: '12' },
      { type: 'favorites', label: '收藏', value: '8' },
      { type: 'coupons', label: '优惠券', value: '3' },
      { type: 'points', label: '积分', value: '1280' }
    ],
    // 订单状态网格数据
    orderStatusData: [
      { type: 'pending', label: '待付款', icon: 'clock-o', count: 2 },
      { type: 'shipped', label: '待发货', icon: 'gift-o', count: 1 },
      { type: 'received', label: '待收货', icon: 'logistics', count: 0 },
      { type: 'reviewed', label: '待评价', icon: 'chat-o', count: 3 }
    ],
    menuList: [
      { id: 1, icon: 'star-o', title: '我的收藏', url: '', badge: '' },
      { id: 2, icon: 'location-o', title: '收货地址', url: '', badge: '' },
      { id: 3, icon: 'coupon-o', title: '优惠券', url: '', badge: '5' },
      { id: 4, icon: 'balance-o', title: '我的钱包', url: '', badge: '' },
      { id: 5, icon: 'gift-o', title: '积分商城', url: '', badge: 'NEW' },
      { id: 6, icon: 'friends-o', title: '邀请好友', url: '', badge: '' },
    ],
    settingList: [
      { id: 1, icon: 'setting-o', title: '设置', url: '' },
      {
        id: 2,
        icon: 'chart-trending-o',
        title: '统计数据',
        url: '',
        action: 'viewAnalytics',
      },
      { id: 3, icon: 'service-o', title: '联系客服', url: '' },
      { id: 4, icon: 'question-o', title: '帮助中心', url: '' },
      { id: 5, icon: 'info-o', title: '关于我们', url: '' },
    ],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    console.info('个人中心页面加载', { page: 'profile', action: 'onLoad' });
    // 确保数据正确设置
    this.setData({
      statsData: [
        { type: 'orders', label: '订单', value: '12' },
        { type: 'favorites', label: '收藏', value: '8' },
        { type: 'coupons', label: '优惠券', value: '3' },
        { type: 'points', label: '积分', value: '1280' }
      ],
      orderStatusData: [
        { type: 'pending', label: '待付款', icon: 'clock-o', count: 2 },
        { type: 'shipped', label: '待发货', icon: 'gift-o', count: 1 },
        { type: 'received', label: '待收货', icon: 'logistics', count: 0 },
        { type: 'reviewed', label: '待评价', icon: 'chat-o', count: 3 }
      ]
    });
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    console.info('个人中心页面显示', { page: 'profile', action: 'onShow' });
    // 调试数据
    console.log('statsData:', this.data.statsData);
    console.log('orderStatusData:', this.data.orderStatusData);
    // 初始化自定义 tabbar
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().init();
    }
  },

  /**
   * 点击头像
   */
  onAvatarTap() {
    console.info('用户点击头像', { userId: this.data.userInfo.userId });
    // 事件统计
    wx.$trackEvent &&
      wx.$trackEvent('avatar_click', {
        user_id: this.data.userInfo.userId,
        page: 'profile',
      });
    // 跳转到登录页（demo 需求）
    wx.navigateTo({ url: '/src/pages/login/index' });
  },

  /**
   * 点击用户信息区域
   */
  onUserInfoTap() {
    console.info('用户点击个人信息', { userId: this.data.userInfo.userId });
    // 事件统计
    wx.$trackEvent &&
      wx.$trackEvent('user_info_click', {
        user_id: this.data.userInfo.userId,
        page: 'profile',
      });
    // 跳转到登录页（demo 需求）
    wx.navigateTo({ url: '/src/pages/login/index' });
  },

  /**
   * 点击统计数据
   */
  onStatTap(e) {
    const { type } = e.currentTarget.dataset;
    console.info('用户点击统计数据', {
      type,
      userId: this.data.userInfo.userId,
    });

    // 用户信息点击事件统计
    wx.$trackEvent &&
      wx.$trackEvent('user_info_click', {
        page: 'profile',
        user_id: this.data.userInfo.userId,
        timestamp: Date.now(),
      });

    const messages = {
      orders: '订单列表',
      favorites: '我的收藏',
      coupons: '优惠券列表',
      points: '积分详情',
    };

    wx.showToast({
      title: `${messages[type]}开发中`,
      icon: 'none',
    });
  },

  /**
   * 点击订单入口
   */
  onOrdersTap() {
    console.info('用户点击订单入口', { userId: this.data.userInfo.userId });
    // 事件统计
    wx.$trackEvent &&
      wx.$trackEvent('orders_click', {
        user_id: this.data.userInfo.userId,
        page: 'profile',
      });
    wx.showToast({
      title: '订单页面开发中',
      icon: 'none',
    });
  },

  /**
   * 点击订单状态
   */
  onOrderStatusTap(e) {
    const { status } = e.currentTarget.dataset;
    console.info('用户点击订单状态', {
      status,
      userId: this.data.userInfo.userId,
    });

    // 统计数据点击事件统计
    wx.$trackEvent &&
      wx.$trackEvent('stat_click', {
        stat_type: status,
        stat_value: this.data.orderStatus[status],
        page: 'profile',
        user_id: this.data.userInfo.userId,
        timestamp: Date.now(),
      });

    const statusNames = {
      pending: '待付款',
      shipped: '待收货',
      completed: '已完成',
      refund: '退款/售后',
    };

    wx.showToast({
      title: `${statusNames[status]}订单开发中`,
      icon: 'none',
    });
  },

  /**
   * 点击菜单项
   */
  onMenuTap(e) {
    const item = e.currentTarget.dataset.item;
    console.info('用户点击菜单', {
      menu: item.title,
      url: item.url,
      userId: this.data.userInfo.userId,
    });

    wx.showToast({
      title: `${item.title}开发中`,
      icon: 'none',
    });
  },

  /**
   * 点击设置项
   */
  onSettingTap(e) {
    const item = e.currentTarget.dataset.item;
    console.info('用户点击设置', {
      setting: item.title,
      userId: this.data.userInfo.userId,
    });

    // 特殊处理统计数据查看
    if (item.action === 'viewAnalytics') {
      this.viewAnalyticsData();
      return;
    }

    wx.showToast({
      title: `${item.title}开发中`,
      icon: 'none',
    });
  },

  /**
   * 查看统计数据
   */
  viewAnalyticsData() {
    const analyticsData =
      (wx.$getStoredAnalytics && wx.$getStoredAnalytics()) || [];

    console.info('查看统计数据', {
      total_events: analyticsData.length,
      user_id: this.data.userInfo.userId,
    });

    if (analyticsData.length === 0) {
      wx.showToast({
        title: '暂无统计数据',
        icon: 'none',
      });
      return;
    }

    // 统计数据概览
    const pageViews = analyticsData.filter(
      (item) => item.event === 'page_view',
    );
    const events = analyticsData.filter((item) => item.event !== 'page_view');

    const summary = {
      总事件数: analyticsData.length,
      页面访问: pageViews.length,
      用户行为: events.length,
      最近事件: analyticsData[analyticsData.length - 1]?.event || '无',
    };

    wx.showModal({
      title: '统计数据概览',
      content: Object.entries(summary)
        .map(([key, value]) => `${key}: ${value}`)
        .join('\n'),
      showCancel: true,
      cancelText: '关闭',
      confirmText: '查看详情',
      success: (res) => {
        if (res.confirm) {
          // 在控制台输出详细数据
          console.info('统计数据详情', {
            data: analyticsData.slice(-10), // 最近10条
            summary,
          });
          wx.showToast({
            title: '详情已输出到控制台',
            icon: 'success',
          });
        }
      },
    });
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {
    console.info('用户分享个人中心', {
      page: 'profile',
      userId: this.data.userInfo.userId,
    });

    return {
      title: '分享个人中心',
      path: '/src/pages/profile/index',
    };
  },
});
