import request from './request'

/**
 * 管理员登录
 * @param {Object} params - 登录参数
 * @param {string} params.username - 用户名
 * @param {string} params.password - 密码
 * @returns {Promise} - 返回 { code, msg, data }
 */
export function login(params) {
  return request.post('/admin/login', params)
}

export default {
  login
}