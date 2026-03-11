import request from './request'

// 检查更新
export const checkUpdate = (params) => {
  return request({
    url: '/update/check',
    method: 'get',
    params
  })
}

// 获取下载统计
export const getDownloadStats = (params) => {
  return request({
    url: '/stats/downloads',
    method: 'get',
    params
  })
}

// 获取版本分布统计
export const getVersionDistribution = (params) => {
  return request({
    url: '/stats/distribution',
    method: 'get',
    params
  })
}

// 获取升级趋势
export const getUpdateTrend = (params) => {
  return request({
    url: '/stats/trend',
    method: 'get',
    params
  })
}
