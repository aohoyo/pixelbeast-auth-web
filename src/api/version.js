import request from './request'

// 获取版本列表
export const getVersionList = (params) => {
  return request({
    url: '/version',
    method: 'get',
    params
  })
}

// 获取版本详情
export const getVersionDetail = (id) => {
  return request({
    url: `/version/${id}`,
    method: 'get'
  })
}

// 发布版本
export const publishVersion = (data) => {
  return request({
    url: '/version',
    method: 'post',
    data
  })
}

// 更新版本
export const updateVersion = (id, data) => {
  return request({
    url: `/version/${id}`,
    method: 'put',
    data
  })
}

// 删除版本
export const deleteVersion = (id) => {
  return request({
    url: `/version/${id}`,
    method: 'delete'
  })
}
