// src/pages/login/index.js
// 登录页面

const { auth } = require('../../services/index.js');
const { authLogger } = require('../../utils/logger.js');

Page({
  data: {
    loginType: 'wx', // wx: 微信一键登录, phone: 手机号登录
    phoneNumber: '',
    verifyCode: '',
    countdown: 0,
    loading: false,
    phoneLoading: false,
    agreedToTerms: true,
    canGetUserProfile: wx.canIUse('getUserProfile'),
    statusBarHeight: 0,
    navBarHeight: 0
  },

  onLoad(options) {
    authLogger.info('登录页面加载', options);
    
    // 获取系统信息，用于自定义导航栏适配
    const systemInfo = wx.getSystemInfoSync();
    this.setData({
      statusBarHeight: systemInfo.statusBarHeight,
      navBarHeight: systemInfo.statusBarHeight + 44
    });
  },

  /**
   * 返回上一页
   */
  onBack() {
    wx.navigateBack({
      delta: 1
    });
  },

  /**
   * 切换登录方式
   */
  onLoginTypeChange(e) {
    const loginType =
      (e && e.detail && e.detail.name) ||
      (e &&
        e.currentTarget &&
        e.currentTarget.dataset &&
        e.currentTarget.dataset.type) ||
      'wx';
    authLogger.info('切换登录方式', { loginType });

    this.setData({
      loginType,
      phoneNumber: '',
      verifyCode: '',
      countdown: 0,
    });
  },

  /**
   * 微信一键登录
   */
  async onWxLogin() {
    if (this.data.loading) return;

    try {
      this.setData({ loading: true });
      authLogger.info('开始微信一键登录');

      // 获取登录code
      const loginRes = await this.getWxLoginCode();
      authLogger.info('获取微信登录code成功', { code: loginRes.code });

      let userInfo = null;

      // 尝试获取用户信息
      if (this.data.canGetUserProfile) {
        try {
          const userProfile = await this.getUserProfile();
          userInfo = {
            encryptedData: userProfile.encryptedData,
            iv: userProfile.iv,
          };
          authLogger.info('获取用户信息成功');
        } catch (error) {
          authLogger.warn('用户取消授权或获取用户信息失败', error);
        }
      }

      // 调用登录接口
      const loginData = {
        code: loginRes.code,
        ...userInfo,
      };

      const result = await auth.wxLogin(loginData);
      authLogger.info('微信登录成功', result);

      // 保存登录信息
      wx.setStorageSync('token', result.token);
      wx.setStorageSync('userInfo', result.userInfo);

      // 统计登录事件
      wx.$trackEvent && wx.$trackEvent('login_success', { type: 'wx' });

      // 跳转到首页
      wx.switchTab({
        url: '/src/pages/home/index',
      });
    } catch (error) {
      authLogger.error('微信登录失败', error);
      wx.showToast({
        title: error.message || '登录失败',
        icon: 'none',
      });

      // 统计登录失败
      wx.$trackEvent &&
        wx.$trackEvent('login_fail', { type: 'wx', error: error.message });
    } finally {
      this.setData({ loading: false });
    }
  },

  /**
   * 获取微信登录code
   */
  getWxLoginCode() {
    return new Promise((resolve, reject) => {
      wx.login({
        success: resolve,
        fail: reject,
      });
    });
  },

  /**
   * 获取用户信息
   */
  getUserProfile() {
    return new Promise((resolve, reject) => {
      wx.getUserProfile({
        desc: '用于完善用户资料',
        success: resolve,
        fail: reject,
      });
    });
  },

  /**
   * 手机号输入
   */
  onPhoneInput(e) {
    const phoneNumber = e.detail.value;
    this.setData({ phoneNumber });
  },

  /**
   * 验证码输入
   */
  onCodeInput(e) {
    const verifyCode = e.detail.value;
    this.setData({ verifyCode });
  },

  /**
   * 发送验证码
   */
  async onSendCode() {
    const { phoneNumber } = this.data;

    if (!phoneNumber) {
      wx.showToast({
        title: '请输入手机号',
        icon: 'none',
      });
      return;
    }

    if (!/^1[3-9]\d{9}$/.test(phoneNumber)) {
      wx.showToast({
        title: '手机号格式不正确',
        icon: 'none',
      });
      return;
    }

    if (this.data.countdown > 0) return;

    try {
      authLogger.info('发送验证码', { phoneNumber });

      await auth.sendSmsCode({
        phone: phoneNumber,
        type: 'login',
      });

      authLogger.info('验证码发送成功');
      wx.showToast({
        title: '验证码已发送',
        icon: 'success',
      });

      // 开始倒计时
      this.startCountdown();
    } catch (error) {
      authLogger.error('发送验证码失败', error);
      wx.showToast({
        title: error.message || '发送失败',
        icon: 'none',
      });
    }
  },

  /**
   * 开始倒计时
   */
  startCountdown() {
    let countdown = 60;
    this.setData({ countdown });

    const timer = setInterval(() => {
      countdown--;
      this.setData({ countdown });

      if (countdown <= 0) {
        clearInterval(timer);
      }
    }, 1000);
  },

  /**
   * 手机号验证码登录
   */
  async onPhoneLogin() {
    const { phoneNumber, verifyCode } = this.data;

    if (!phoneNumber) {
      wx.showToast({
        title: '请输入手机号',
        icon: 'none',
      });
      return;
    }

    if (!verifyCode) {
      wx.showToast({
        title: '请输入验证码',
        icon: 'none',
      });
      return;
    }

    if (this.data.loading) return;

    try {
      this.setData({ loading: true });
      authLogger.info('开始手机号登录', { phoneNumber });

      const result = await auth.phoneLogin({
        phone: phoneNumber,
        code: verifyCode,
      });

      authLogger.info('手机号登录成功', result);

      // 保存登录信息
      wx.setStorageSync('token', result.token);
      wx.setStorageSync('userInfo', result.userInfo);

      // 统计登录事件
      wx.$trackEvent && wx.$trackEvent('login_success', { type: 'phone' });

      wx.showToast({
        title: '登录成功',
        icon: 'success',
      });

      // 跳转到首页
      setTimeout(() => {
        wx.switchTab({
          url: '/src/pages/home/index',
        });
      }, 1500);
    } catch (error) {
      authLogger.error('手机号登录失败', error);
      wx.showToast({
        title: error.message || '登录失败',
        icon: 'none',
      });

      // 统计登录失败
      wx.$trackEvent &&
        wx.$trackEvent('login_fail', { type: 'phone', error: error.message });
    } finally {
      this.setData({ loading: false });
    }
  },

  /**
   * 微信手机号快捷登录
   */
  async onGetPhoneNumber(e) {
    if (e.detail.errMsg !== 'getPhoneNumber:ok') {
      authLogger.warn('用户拒绝授权手机号');
      return;
    }

    try {
      this.setData({ loading: true });
      authLogger.info('开始微信手机号登录');

      // 先获取微信登录code
      const loginRes = await this.getWxLoginCode();

      // 绑定手机号并登录
      const result = await auth.bindPhone({
        encryptedData: e.detail.encryptedData,
        iv: e.detail.iv,
        code: loginRes.code,
      });

      authLogger.info('微信手机号登录成功', result);

      // 保存登录信息
      wx.setStorageSync('token', result.token);
      wx.setStorageSync('userInfo', result.userInfo);

      // 统计登录事件
      wx.$trackEvent && wx.$trackEvent('login_success', { type: 'wx_phone' });

      wx.showToast({
        title: '登录成功',
        icon: 'success',
      });

      // 跳转到首页
      setTimeout(() => {
        wx.switchTab({
          url: '/src/pages/home/index',
        });
      }, 1500);
    } catch (error) {
      authLogger.error('微信手机号登录失败', error);
      wx.showToast({
        title: error.message || '登录失败',
        icon: 'none',
      });
    } finally {
      this.setData({ phoneLoading: false });
    }
  },

  /**
   * 切换到微信登录
   */
  switchToWxLogin() {
    this.setData({ loginType: 'wx' });
  },

  /**
   * 协议确认变更
   */
  onAgreementChange(e) {
    this.setData({
      agreedToTerms: e.detail
    });
  },

  /**
   * 查看用户协议
   */
  onViewUserAgreement() {
    wx.showModal({
      title: '用户协议',
      content: '这里是用户协议内容...',
      showCancel: false
    });
  },

  /**
   * 查看隐私政策
   */
  onViewPrivacyPolicy() {
    wx.showModal({
      title: '隐私政策',
      content: '这里是隐私政策内容...',
      showCancel: false
    });
  },

  /**
   * 联系客服
   */
  onContactService() {
    wx.showModal({
      title: '联系客服',
      content: '客服电话：400-123-4567\n工作时间：9:00-18:00',
      showCancel: false
    });
  }
});
