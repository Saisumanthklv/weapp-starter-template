// src/services/modules/upload.js
// 文件上传相关API接口

const { api } = require('../api.js')

/**
 * 上传图片
 * @param {String} filePath 文件路径
 * @param {Object} options 上传选项
 */
const uploadImage = (filePath, options = {}) => {
  return api.upload('/upload/image', filePath, {}, {
    name: 'image',
    ...options
  })
}

/**
 * 上传文件
 * @param {String} filePath 文件路径
 * @param {Object} formData 表单数据
 * @param {Object} options 上传选项
 */
const uploadFile = (filePath, formData = {}, options = {}) => {
  return api.upload('/upload/file', filePath, formData, {
    name: 'file',
    ...options
  })
}

/**
 * 批量上传图片
 * @param {Array} filePaths 文件路径数组
 * @param {Object} options 上传选项
 */
const uploadImages = async (filePaths, options = {}) => {
  const uploadPromises = filePaths.map(filePath => 
    uploadImage(filePath, options)
  )
  return Promise.all(uploadPromises)
}

/**
 * 获取上传凭证
 * @param {Object} params 参数
 */
const getUploadToken = (params) => {
  return api.get('/upload/token', params)
}

/**
 * 删除文件
 * @param {String} fileUrl 文件URL
 */
const deleteFile = (fileUrl) => {
  return api.delete('/upload/file', { fileUrl })
}

module.exports = {
  uploadImage,
  uploadFile,
  uploadImages,
  getUploadToken,
  deleteFile
}
