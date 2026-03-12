import request from './request'

/**
 * 获取存储中的文件列表
 * @param {Object} params - 查询参数
 * @param {string} params.path - 路径前缀
 */
export const getStorageFiles = (params) => {
  return request({
    url: '/storage/files',
    method: 'get',
    params
  })
}

/**
 * 删除存储中的文件
 * @param {string} key - 文件key
 */
export const deleteStorageFile = (key) => {
  return request({
    url: '/storage/files',
    method: 'delete',
    data: { key }
  })
}

/**
 * 获取文件下载URL
 * @param {string} key - 文件key
 */
export const getStorageFileUrl = (key) => {
  return request({
    url: '/storage/files/url',
    method: 'get',
    params: { key }
  })
}
