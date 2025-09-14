// src/pages/home/index.js
// 全局统计：使用 wx.$trackPageView / wx.$trackEvent（已在 app.js 中挂载）

Page({
  /**
   * 页面的初始数据
   */
  data: {
    activeTab: 0,
    bannerList: [
      {
        id: 1,
        title: '春季新品上市',
        desc: '全场8折优惠，限时抢购',
        image: 'https://picsum.photos/750/400?random=1',
      },
      {
        id: 2,
        title: '品质生活',
        desc: '精选好物，品质保证',
        image: 'https://picsum.photos/750/400?random=2',
      },
      {
        id: 3,
        title: '会员专享',
        desc: '会员专属优惠，立即享受',
        image: 'https://picsum.photos/750/400?random=3',
      },
    ],
    recommendList: [
      {
        id: 1,
        title: '精选商品1',
        price: 99.9,
        sales: 1234,
        image: 'https://picsum.photos/300/300?random=11',
      },
      {
        id: 2,
        title: '热门商品2',
        price: 199.9,
        sales: 567,
        image: 'https://picsum.photos/300/300?random=12',
      },
      {
        id: 3,
        title: '推荐商品3',
        price: 299.9,
        sales: 890,
        image: 'https://picsum.photos/300/300?random=13',
      },
      {
        id: 4,
        title: '优质商品4',
        price: 399.9,
        sales: 456,
        image: 'https://picsum.photos/300/300?random=14',
      },
      {
        id: 5,
        title: '精选商品1',
        price: 99.9,
        sales: 1234,
        image: 'https://picsum.photos/300/300?random=15',
      },
      {
        id: 6,
        title: '热门商品2',
        price: 199.9,
        sales: 567,
        image: 'https://picsum.photos/300/300?random=16',
      },
      {
        id: 7,
        title: '推荐商品3',
        price: 299.9,
        sales: 890,
        image: 'https://picsum.photos/300/300?random=17',
      },
      {
        id: 8,
        title: '优质商品4',
        price: 399.9,
        sales: 456,
        image: 'https://picsum.photos/300/300?random=18',
      },
    ],
    hotList: [
      {
        id: 1,
        title: '热销商品A',
        desc: '销量第一，用户好评如潮',
        price: 159.9,
        image: 'https://picsum.photos/300/300?random=21',
      },
      {
        id: 2,
        title: '人气商品B',
        desc: '明星推荐，品质保证',
        price: 259.9,
        image: 'https://picsum.photos/300/300?random=22',
      },
      {
        id: 3,
        title: '爆款商品C',
        desc: '限时特价，数量有限',
        price: 89.9,
        image: 'https://picsum.photos/300/300?random=23',
      },
    ],
    newList: [
      {
        id: 1,
        title: '新品上市A',
        desc: '全新设计，引领潮流',
        price: 199.9,
        image: 'https://picsum.photos/300/300?random=31',
      },
      {
        id: 2,
        title: '新品上市B',
        desc: '科技创新，体验升级',
        price: 299.9,
        image: 'https://picsum.photos/300/300?random=32',
      },
      {
        id: 3,
        title: '新品上市C',
        desc: '限量发售，先到先得',
        price: 399.9,
        image: 'https://picsum.photos/300/300?random=33',
      },
    ],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {
    console.info('首页加载完成', { page: 'home', action: 'onLoad' });
    this.loadData();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {
    console.info('首页渲染完成', { page: 'home', action: 'onReady' });
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    console.info('首页显示', { page: 'home', action: 'onShow' });
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {
    console.info('首页隐藏', { page: 'home', action: 'onHide' });
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {
    console.info('首页卸载', { page: 'home', action: 'onUnload' });
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {
    console.info('首页下拉刷新', { page: 'home', action: 'onPullDownRefresh' });
    
    // 模拟刷新数据
    setTimeout(() => {
      wx.stopPullDownRefresh();
      wx.showToast({
        title: '刷新成功',
        icon: 'success'
      });
    }, 1000);
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {
    console.info('首页上拉加载', { page: 'home', action: 'onReachBottom' });
    
    // 模拟加载更多数据
    wx.showLoading({
      title: '加载中...'
    });
    
    setTimeout(() => {
      wx.hideLoading();
      wx.showToast({
        title: '加载完成',
        icon: 'success'
      });
    }, 1000);
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {
    console.info('首页分享', { page: 'home', action: 'onShareAppMessage' });
    
    return {
      title: '微信小程序启动模板',
      path: '/pages/home/index'
    };
  },

  // ==================== 自定义方法 ====================

  /**
   * 加载页面数据
   */
  loadData() {
    console.info('加载首页数据', { page: 'home', action: 'loadData' });
    
    // 这里可以调用 API 加载真实数据
    // 目前使用 data 中的模拟数据
  },

  /**
   * 主要按钮点击事件
   */
  onPrimaryClick() {
    wx.showToast({
      title: '主要按钮点击',
      icon: 'success'
    });
  },

  /**
   * 成功按钮点击事件
   */
  onSuccessClick() {
    wx.showToast({
      title: '成功按钮点击',
      icon: 'success'
    });
  },

  /**
   * 警告按钮点击事件
   */
  onWarningClick() {
    wx.showToast({
      title: '警告按钮点击',
      icon: 'none'
    });
  },

  /**
   * 危险按钮点击事件
   */
  onDangerClick() {
    wx.showModal({
      title: '危险操作',
      content: '确定要执行此操作吗？',
      showCancel: true,
      confirmText: '确定',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          wx.showToast({
            title: '操作已确认',
            icon: 'success'
          });
        }
      }
    });
  },

  /**
   * Tab切换事件
   */
  onTabChange(event) {
    const { index } = event.detail;
    console.info('Tab切换', { page: 'home', action: 'onTabChange', index });
    
    this.setData({
      activeTab: index
    });

    // 统计埋点
    if (wx.$trackEvent) {
      wx.$trackEvent('tab_change', {
        page: 'home',
        tab_index: index,
        tab_name: ['推荐', '热门', '新品'][index]
      });
    }
  },

  /**
   * Banner点击事件
   */
  onBannerTap(event) {
    const { item } = event.currentTarget.dataset;
    console.info('Banner点击', { page: 'home', action: 'onBannerTap', item });
    
    wx.showToast({
      title: `点击了${item.title}`,
      icon: 'none'
    });

    // 统计埋点
    if (wx.$trackEvent) {
      wx.$trackEvent('banner_click', {
        page: 'home',
        banner_id: item.id,
        banner_title: item.title
      });
    }
  },

  /**
   * 商品点击事件
   */
  onItemTap(event) {
    const { item } = event.currentTarget.dataset;
    console.info('商品点击', { page: 'home', action: 'onItemTap', item });
    
    wx.showToast({
      title: `点击了${item.title}`,
      icon: 'none'
    });

    // 统计埋点
    if (wx.$trackEvent) {
      wx.$trackEvent('product_click', {
        page: 'home',
        product_id: item.id,
        product_title: item.title,
        product_price: item.price
      });
    }
  }
});
