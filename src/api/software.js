import request from './request'

// 获取软件列表
export const getSoftwareList = (params) => {
  return request({
    url: '/software',
    method: 'get',
    params
  })
}

// 获取软件详情
export const getSoftwareDetail = (id) => {
  return request({
    url: `/software/${id}`,
    method: 'get'
  })
}

// 创建软件
export const createSoftware = (data) => {
  return request({
    url: '/software',
    method: 'post',
    data
  })
}

// 更新软件
export const updateSoftware = (id, data) => {
  return request({
    url: `/software/${id}`,
    method: 'put',
    data
  })
}

// 删除软件
export const deleteSoftware = (id) => {
  return request({
    url: `/software/${id}`,
    method: 'delete'
  })
}

// 重置 API Key
export const resetAPIKey = (id) => {
  return request({
    url: `/software/${id}/reset-key`,
    method: 'post'
  })
}
