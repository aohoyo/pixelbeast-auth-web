import axios from 'axios'

// 登录使用独立实例，避免拦截器影响
const loginRequest = axios.create({
  baseURL: '/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

/**
 * 管理员登录
 * @param {Object} params - 登录参数
 * @param {string} params.username - 用户名
 * @param {string} params.password - 密码
 * @returns {Promise} - 返回 { code, data, msg }
 */
export function login(params) {
  console.log('登录请求参数:', params)
  return loginRequest.post('/admin/login', params)
    .then(response => {
      console.log('登录响应:', response.data)
      return response.data
    })
    .catch(error => {
      console.error('登录错误:', error)
      if (error.response) {
        console.error('错误响应:', error.response.data)
        return error.response.data
      }
      throw error
    })
}

export default {
  login
}