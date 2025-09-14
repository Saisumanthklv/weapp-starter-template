// src/app-init.js
// 应用初始化文件

const { initializeStore } = require('./store/index.js');
const config = require('./config/index.js');
const { initializePlugins } = require('./plugin/index.js');
const loggerModule = require('./utils/logger.js');

/**
 * 应用初始化函数
 */
const initializeApp = async () => {
  try {
    console.log('开始初始化应用...');

    // 1. 初始化插件系统 (依赖注入logger)
    console.log('初始化插件系统...');
    initializePlugins(loggerModule);

    // 2. 初始化状态管理
    console.log('初始化状态管理...');
    initializeStore();

    // 2. 设置全局错误处理
    setupGlobalErrorHandler();

    // 3. 设置网络状态监听
    setupNetworkListener();

    // 4. 设置页面生命周期监听
    setupPageLifecycleListener();

    console.log('应用初始化完成');
    return true;
  } catch (error) {
    console.error('应用初始化失败:', error);
    return false;
  }
};

/**
 * 设置全局错误处理
 */
const setupGlobalErrorHandler = () => {
  // 监听小程序错误
  wx.onError((error) => {
    console.error('小程序错误:', error);
    // 这里可以上报错误到监控系统
  });

  // 监听未处理的Promise拒绝
  wx.onUnhandledRejection((event) => {
    console.error('未处理的Promise拒绝:', event.reason);
    // 这里可以上报错误到监控系统
  });
};

/**
 * 设置网络状态监听
 */
const setupNetworkListener = () => {
  const { storeHelpers } = require('./store/index.js');

  // 监听网络状态变化
  wx.onNetworkStatusChange((res) => {
    const status = res.isConnected ? 'online' : 'offline';
    storeHelpers.setNetworkStatus(status);

    if (!res.isConnected) {
      wx.showToast({
        title: '网络连接已断开',
        icon: 'none',
      });
    }
  });

  // 获取初始网络状态
  wx.getNetworkType({
    success: (res) => {
      const status = res.networkType === 'none' ? 'offline' : 'online';
      storeHelpers.setNetworkStatus(status);
    },
  });
};

/**
 * 设置页面生命周期监听和性能监控
 */
const setupPageLifecycleListener = () => {
  // 防止重复包装
  if (Page.__wrapped) {
    return;
  }

  const { storeHelpers } = require('./store/index.js');

  // 原始的Page函数
  const originalPage = Page;

  // 重写Page函数以添加通用逻辑
  Page = (options) => {
    const originalOnLoad = options.onLoad;
    const originalOnShow = options.onShow;
    const originalOnHide = options.onHide;
    const originalOnUnload = options.onUnload;
    const originalOnReady = options.onReady;

    // 性能监控变量
    let loadStartTime = 0;
    let readyTime = 0;

    // 重写onLoad
    options.onLoad = function (query) {
      // 性能监控：记录加载开始时间
      if (config.debug) {
        loadStartTime = Date.now();
      }

      // 页面加载通用逻辑
      if (config.debug) {
        console.log(`页面加载: ${this.route}`, query);
      }

      // 调用原始onLoad
      if (originalOnLoad) {
        originalOnLoad.call(this, query);
      }
    };

    // 重写onReady
    options.onReady = function () {
      // 性能监控：计算加载时间
      if (config.debug && loadStartTime) {
        readyTime = Date.now();
        const loadTime = readyTime - loadStartTime;
        console.log(`页面 ${this.route} 加载耗时: ${loadTime}ms`);
      }

      // 调用原始onReady
      if (originalOnReady) {
        originalOnReady.call(this);
      }
    };

    // 重写onShow
    options.onShow = function () {
      // 页面显示通用逻辑
      storeHelpers.pushPage(this.route);

      if (config.debug) {
        console.log(`页面显示: ${this.route}`);
      }

      // 全局页面PV统计（安全调用，不阻塞页面）
      try {
        if (
          typeof wx !== 'undefined' &&
          typeof wx.$trackPageView === 'function'
        ) {
          wx.$trackPageView(`/${this.route}`.replace(/^\/+/, '/'), {
            page: this.route,
            options: this.options || {},
          });
        }
      } catch (e) {
        // 忽略统计异常
      }

      // 调用原始onShow
      if (originalOnShow) {
        originalOnShow.call(this);
      }
    };

    // 重写onHide
    options.onHide = function () {
      // 页面隐藏通用逻辑
      if (config.debug) {
        console.log(`页面隐藏: ${this.route}`);
      }

      // 调用原始onHide
      if (originalOnHide) {
        originalOnHide.call(this);
      }
    };

    // 重写onUnload
    options.onUnload = function () {
      // 页面卸载通用逻辑
      storeHelpers.popPage();

      if (config.debug) {
        console.log(`页面卸载: ${this.route}`);
      }

      // 调用原始onUnload
      if (originalOnUnload) {
        originalOnUnload.call(this);
      }
    };

    // 调用原始Page函数
    return originalPage(options);
  };

  // 标记已包装
  Page.__wrapped = true;
};

/**
 * 检查更新
 */
const checkForUpdates = () => {
  if (wx.canIUse('getUpdateManager')) {
    const updateManager = wx.getUpdateManager();

    updateManager.onCheckForUpdate((res) => {
      if (res.hasUpdate) {
        console.log('发现新版本');
      }
    });

    updateManager.onUpdateReady(() => {
      wx.showModal({
        title: '更新提示',
        content: '新版本已经准备好，是否重启应用？',
        success: (res) => {
          if (res.confirm) {
            updateManager.applyUpdate();
          }
        },
      });
    });

    updateManager.onUpdateFailed(() => {
      console.error('新版本下载失败');
    });
  }
};

/**
 * 设置性能监控（已合并到setupPageLifecycleListener中）
 */
const setupPerformanceMonitor = () => {
  // 性能监控功能已合并到setupPageLifecycleListener中
  // 这里保留空函数以保持兼容性
};

module.exports = {
  initializeApp,
  setupGlobalErrorHandler,
  setupNetworkListener,
  setupPageLifecycleListener,
  checkForUpdates,
  setupPerformanceMonitor,
};
