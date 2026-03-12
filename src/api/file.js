import request from './request'

/**
 * 获取文件列表
 * @param {Object} params - 查询参数
 * @param {string} params.path - 路径
 * @param {number} params.page - 页码
 * @param {number} params.pageSize - 每页数量
 */
export const getFileList = (params) => {
  return request({
    url: '/files',
    method: 'get',
    params: { parent_id: params.parent_id || 0 }
  })
}

/**
 * 创建文件夹
 * @param {Object} data - 文件夹信息
 * @param {string} data.name - 文件夹名称
 * @param {number} data.parent_id - 父文件夹ID
 */
export const createFolder = (data) => {
  return request({
    url: '/files/folder',
    method: 'post',
    data
  })
}

/**
 * 创建文件记录（上传后调用）
 * @param {Object} data - 文件信息
 * @param {string} data.name - 文件名
 * @param {string} data.url - 文件URL
 * @param {number} data.size - 文件大小
 * @param {number} data.parent_id - 父文件夹ID
 */
export const createFile = (data) => {
  return request({
    url: '/files',
    method: 'post',
    data
  })
}

/**
 * 删除文件/文件夹
 * @param {string} id - 文件ID
 */
export const deleteFile = (id) => {
  return request({
    url: `/files/${id}`,
    method: 'delete'
  })
}

/**
 * 批量删除文件
 * @param {string[]} ids - 文件ID数组
 */
export const batchDeleteFiles = (ids) => {
  return request({
    url: '/files/batch',
    method: 'delete',
    data: { ids }
  })
}

/**
 * 重命名文件
 * @param {string} id - 文件ID
 * @param {Object} data - 新名称
 * @param {string} data.name - 新文件名
 */
export const renameFile = (id, data) => {
  return request({
    url: `/files/${id}/rename`,
    method: 'put',
    data
  })
}

/**
 * 移动文件
 * @param {string} id - 文件ID
 * @param {Object} data - 目标路径
 * @param {string} data.targetPath - 目标路径
 */
export const moveFile = (id, data) => {
  return request({
    url: `/files/${id}/move`,
    method: 'put',
    data
  })
}

/**
 * 复制文件
 * @param {string} id - 文件ID
 * @param {Object} data - 目标路径
 * @param {string} data.targetPath - 目标路径
 */
export const copyFile = (id, data) => {
  return request({
    url: `/files/${id}/copy`,
    method: 'post',
    data
  })
}

/**
 * 获取文件下载链接
 * @param {string} id - 文件ID
 */
export const getDownloadUrl = (id) => {
  return request({
    url: `/files/${id}/download`,
    method: 'get'
  })
}

/**
 * 批量下载文件
 * @param {string[]} ids - 文件ID数组
 */
export const batchDownload = (ids) => {
  return request({
    url: '/files/batch/download',
    method: 'post',
    data: { ids },
    responseType: 'blob'
  })
}
