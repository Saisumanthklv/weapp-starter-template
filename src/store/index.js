// src/store/index.js
// 简单的状态管理实现

/**
 * 状态管理类
 */
class Store {
  constructor() {
    this.state = {
      // 用户信息
      userInfo: null,
      isLoggedIn: false,
      
      // 应用状态
      loading: false,
      networkStatus: 'online',
      
      
      // UI状态
      tabBarIndex: 0,
      pageStack: []
    }
    
    this.listeners = new Map()
    this.middlewares = []
  }

  /**
   * 获取状态
   * @param {String} key 状态键名
   */
  getState(key) {
    if (key) {
      return this.state[key]
    }
    return this.state
  }

  /**
   * 设置状态
   * @param {String|Object} key 状态键名或状态对象
   * @param {Any} value 状态值
   */
  setState(key, value) {
    let updates = {}
    
    if (typeof key === 'object') {
      updates = key
    } else {
      updates[key] = value
    }

    // 执行中间件
    for (const middleware of this.middlewares) {
      updates = middleware(this.state, updates) || updates
    }

    // 更新状态
    const oldState = { ...this.state }
    Object.assign(this.state, updates)

    // 通知监听器
    Object.keys(updates).forEach(stateKey => {
      this.notifyListeners(stateKey, this.state[stateKey], oldState[stateKey])
    })
  }

  /**
   * 订阅状态变化
   * @param {String} key 状态键名
   * @param {Function} listener 监听函数
   */
  subscribe(key, listener) {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set())
    }
    this.listeners.get(key).add(listener)

    // 返回取消订阅函数
    return () => {
      this.listeners.get(key).delete(listener)
    }
  }

  /**
   * 通知监听器
   * @param {String} key 状态键名
   * @param {Any} newValue 新值
   * @param {Any} oldValue 旧值
   */
  notifyListeners(key, newValue, oldValue) {
    const listeners = this.listeners.get(key)
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(newValue, oldValue)
        } catch (error) {
          console.error('State listener error:', error)
        }
      })
    }
  }

  /**
   * 添加中间件
   * @param {Function} middleware 中间件函数
   */
  use(middleware) {
    this.middlewares.push(middleware)
  }

  /**
   * 批量更新状态
   * @param {Function} updater 更新函数
   */
  batch(updater) {
    const updates = {}
    const batchState = {
      ...this.state,
      setState: (key, value) => {
        if (typeof key === 'object') {
          Object.assign(updates, key)
        } else {
          updates[key] = value
        }
      }
    }
    
    updater(batchState)
    
    if (Object.keys(updates).length > 0) {
      this.setState(updates)
    }
  }
}

// 创建全局store实例
const store = new Store()

// 添加日志中间件（仅在开发环境）
const config = require('../config/index.js')
if (config.debug) {
  store.use((state, updates) => {
    console.log('State Update:', {
      before: state,
      updates: updates,
      after: { ...state, ...updates }
    })
    return updates
  })
}

// 状态管理的便捷方法
const storeHelpers = {
  /**
   * 设置用户信息
   * @param {Object} userInfo 用户信息
   */
  setUserInfo(userInfo) {
    store.setState({
      userInfo: userInfo,
      isLoggedIn: !!userInfo
    })
    
    // 持久化到本地存储
    if (userInfo) {
      wx.setStorageSync(config.storage.userInfo, userInfo)
    } else {
      wx.removeStorageSync(config.storage.userInfo)
    }
  },

  /**
   * 设置加载状态
   * @param {Boolean} loading 是否加载中
   */
  setLoading(loading) {
    store.setState('loading', loading)
  },

  /**
   * 设置网络状态
   * @param {String} status 网络状态
   */
  setNetworkStatus(status) {
    store.setState('networkStatus', status)
  },

  /**
   * 设置当前标签页索引
   * @param {Number} index 标签页索引
   */
  setTabBarIndex(index) {
    store.setState('tabBarIndex', index)
  },

  /**
   * 添加页面到堆栈
   * @param {String} pagePath 页面路径
   */
  pushPage(pagePath) {
    const pageStack = [...store.getState('pageStack'), pagePath]
    store.setState('pageStack', pageStack)
  },

  /**
   * 从页面堆栈中移除
   */
  popPage() {
    const pageStack = store.getState('pageStack')
    if (pageStack.length > 0) {
      const newStack = pageStack.slice(0, -1)
      store.setState('pageStack', newStack)
    }
  }
}

// 初始化状态（从本地存储恢复）
const initializeStore = () => {
  try {
    const userInfo = wx.getStorageSync(config.storage.userInfo)
    if (userInfo) {
      storeHelpers.setUserInfo(userInfo)
    }
  } catch (error) {
    console.error('Initialize store error:', error)
  }
}

// 监听网络状态变化
wx.onNetworkStatusChange((res) => {
  storeHelpers.setNetworkStatus(res.isConnected ? 'online' : 'offline')
})

module.exports = {
  store,
  storeHelpers,
  initializeStore
}
