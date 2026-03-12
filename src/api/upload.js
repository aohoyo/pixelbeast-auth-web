import request from './request'

/**
 * 获取上传凭证
 * @param {Object} data - 上传参数
 * @param {string} data.filename - 文件名
 * @param {string} data.pathPrefix - 路径前缀
 * @param {string} data.storageType - 存储类型：user(用户配置) / system(系统配置)
 */
export const getUploadToken = (data) => {
  return request({
    url: '/api/v1/upload/token',
    method: 'post',
    data
  })
}

/**
 * 直传文件到用户存储
 * @param {FormData} formData - 包含文件的 FormData
 */
export const uploadFile = (formData) => {
  return request({
    url: '/api/v1/upload',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

/**
 * 删除已上传的文件
 * @param {string} url - 文件URL
 */
export const deleteFile = (url) => {
  return request({
    url: '/api/v1/upload/delete',
    method: 'post',
    data: { url }
  })
}
