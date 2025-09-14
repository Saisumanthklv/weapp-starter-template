// src/constants/index.js
// 常量定义文件

/**
 * HTTP状态码
 */
const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  REQUEST_TIMEOUT: 408,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504
}

/**
 * 业务状态码
 */
const BUSINESS_CODE = {
  SUCCESS: 0,
  FAIL: -1,
  INVALID_PARAMS: 1001,
  UNAUTHORIZED: 1002,
  FORBIDDEN: 1003,
  NOT_FOUND: 1004,
  SERVER_ERROR: 1005,
  TOKEN_EXPIRED: 1006,
  USER_NOT_EXISTS: 2001,
  PASSWORD_ERROR: 2002,
  USER_DISABLED: 2003
}

/**
 * 错误消息
 */
const ERROR_MESSAGES = {
  [BUSINESS_CODE.FAIL]: '操作失败',
  [BUSINESS_CODE.INVALID_PARAMS]: '参数错误',
  [BUSINESS_CODE.UNAUTHORIZED]: '未授权访问',
  [BUSINESS_CODE.FORBIDDEN]: '禁止访问',
  [BUSINESS_CODE.NOT_FOUND]: '资源不存在',
  [BUSINESS_CODE.SERVER_ERROR]: '服务器错误',
  [BUSINESS_CODE.TOKEN_EXPIRED]: '登录已过期',
  [BUSINESS_CODE.USER_NOT_EXISTS]: '用户不存在',
  [BUSINESS_CODE.PASSWORD_ERROR]: '密码错误',
  [BUSINESS_CODE.USER_DISABLED]: '用户已被禁用'
}

/**
 * 页面路径常量
 */
const PAGES = {
  HOME: '/src/pages/home/index',
  TASKS: '/src/pages/tasks/index',
  ORDER: '/src/pages/order/index',
  PROFILE: '/src/pages/profile/index',
  PRODUCT: '/src/subpackages/product/index',
  SETTINGS: '/src/subpackages/user/settings/index'
}

/**
 * 存储键名常量
 */
const STORAGE_KEYS = {
  USER_INFO: 'userInfo',
  TOKEN: 'token',
  SETTINGS: 'settings',
  CACHE_PREFIX: 'cache_',
  TEMP_DATA: 'tempData'
}

/**
 * 事件名称常量
 */
const EVENTS = {
  USER_LOGIN: 'userLogin',
  USER_LOGOUT: 'userLogout',
  USER_INFO_UPDATE: 'userInfoUpdate',
  NETWORK_CHANGE: 'networkChange',
  TAB_CHANGE: 'tabChange',
  PAGE_SHOW: 'pageShow',
  PAGE_HIDE: 'pageHide'
}

/**
 * 任务状态
 */
const TASK_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
}

/**
 * 任务状态文本
 */
const TASK_STATUS_TEXT = {
  [TASK_STATUS.PENDING]: '待处理',
  [TASK_STATUS.IN_PROGRESS]: '进行中',
  [TASK_STATUS.COMPLETED]: '已完成',
  [TASK_STATUS.CANCELLED]: '已取消'
}

/**
 * 订单状态
 */
const ORDER_STATUS = {
  PENDING_PAYMENT: 'pending_payment',
  PENDING_SHIPMENT: 'pending_shipment',
  PENDING_RECEIPT: 'pending_receipt',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded'
}

/**
 * 订单状态文本
 */
const ORDER_STATUS_TEXT = {
  [ORDER_STATUS.PENDING_PAYMENT]: '待付款',
  [ORDER_STATUS.PENDING_SHIPMENT]: '待发货',
  [ORDER_STATUS.PENDING_RECEIPT]: '待收货',
  [ORDER_STATUS.COMPLETED]: '已完成',
  [ORDER_STATUS.CANCELLED]: '已取消',
  [ORDER_STATUS.REFUNDED]: '已退款'
}

/**
 * 用户角色
 */
const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'user',
  VIP: 'vip',
  GUEST: 'guest'
}

/**
 * 文件类型
 */
const FILE_TYPES = {
  IMAGE: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
  VIDEO: ['mp4', 'avi', 'mov', 'wmv'],
  AUDIO: ['mp3', 'wav', 'aac', 'flac'],
  DOCUMENT: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx']
}

/**
 * 正则表达式
 */
const REGEX = {
  PHONE: /^1[3-9]\d{9}$/,
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  ID_CARD: /^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/,
  URL: /^https?:\/\/.+/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
  CHINESE: /[\u4e00-\u9fa5]/,
  NUMBER: /^\d+$/,
  DECIMAL: /^\d+(\.\d+)?$/
}

/**
 * 时间格式
 */
const DATE_FORMATS = {
  DATE: 'YYYY-MM-DD',
  TIME: 'HH:mm:ss',
  DATETIME: 'YYYY-MM-DD HH:mm:ss',
  MONTH: 'YYYY-MM',
  YEAR: 'YYYY'
}

/**
 * 分页配置
 */
const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  MIN_PAGE_SIZE: 10
}

/**
 * 上传配置
 */
const UPLOAD = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_IMAGE_SIZE: 5 * 1024 * 1024,  // 5MB
  MAX_FILES: 9,
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif'],
  ALLOWED_FILE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf']
}

/**
 * 主题配置
 */
const THEME = {
  PRIMARY_COLOR: '#007aff',
  SUCCESS_COLOR: '#28a745',
  WARNING_COLOR: '#ffc107',
  DANGER_COLOR: '#dc3545',
  INFO_COLOR: '#17a2b8',
  LIGHT_COLOR: '#f8f9fa',
  DARK_COLOR: '#343a40'
}

/**
 * 动画配置
 */
const ANIMATION = {
  DURATION: {
    FAST: 200,
    NORMAL: 300,
    SLOW: 500
  },
  EASING: {
    EASE: 'ease',
    EASE_IN: 'ease-in',
    EASE_OUT: 'ease-out',
    EASE_IN_OUT: 'ease-in-out',
    LINEAR: 'linear'
  }
}

module.exports = {
  HTTP_STATUS,
  BUSINESS_CODE,
  ERROR_MESSAGES,
  PAGES,
  STORAGE_KEYS,
  EVENTS,
  TASK_STATUS,
  TASK_STATUS_TEXT,
  ORDER_STATUS,
  ORDER_STATUS_TEXT,
  USER_ROLES,
  FILE_TYPES,
  REGEX,
  DATE_FORMATS,
  PAGINATION,
  UPLOAD,
  THEME,
  ANIMATION
}
