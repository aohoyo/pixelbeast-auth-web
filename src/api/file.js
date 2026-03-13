import request from './request'

/**
 * 获取文件列表
 * @param {Object} params - 查询参数
 * @param {number} params.parent_id - 父文件夹ID
 * @param {string} params.search - 搜索关键词
 * @param {string} params.sort - 排序字段 (name/size/updated_at)
 * @param {string} params.order - 排序方式 (asc/desc)
 * @param {string} params.type - 文件类型筛选
 */
export const getFileList = (params) => {
  return request({
    url: '/files',
    method: 'get',
    params: {
      parent_id: params.parent_id || 0,
      search: params.search,
      sort: params.sort,
      order: params.order,
      type: params.type
    }
  })
}

/**
 * 获取存储统计
 */
export const getStorageStats = () => {
  return request({
    url: '/files/stats',
    method: 'get'
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
 * @param {string} data.source - 来源：software/version/file
 * @param {number} data.source_id - 关联的业务ID
 */
export const createFile = (data) => {
  return request({
    url: '/files/record',
    method: 'post',
    data
  })
}

/**
 * 移动文件
 * @param {number[]} fileIds - 文件ID数组
 * @param {number} targetId - 目标文件夹ID
 */
export const moveFiles = (fileIds, targetId) => {
  return request({
    url: '/files/move',
    method: 'post',
    data: {
      file_ids: fileIds,
      target_id: targetId
    }
  })
}

/**
 * 复制文件
 * @param {number[]} fileIds - 文件ID数组
 * @param {number} targetId - 目标文件夹ID
 */
export const copyFiles = (fileIds, targetId) => {
  return request({
    url: '/files/copy',
    method: 'post',
    data: {
      file_ids: fileIds,
      target_id: targetId
    }
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
