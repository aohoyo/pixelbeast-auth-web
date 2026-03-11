import axios from 'axios'
import { ElMessage, ElLoading } from 'element-plus'
import { API_BASE_URL } from '@/config'

// 创建 axios 实例
const request = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
let loadingInstance = null
let loadingCount = 0

request.interceptors.request.use(
  (config) => {
    
    // 添加 token
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    // 显示加载
    if (config.showLoading !== false) {
      loadingCount++
      if (loadingCount === 1) {
        loadingInstance = ElLoading.service({
          lock: true,
          text: '加载中...',
          background: 'rgba(0, 0, 0, 0.1)'
        })
      }
    }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  (response) => {
    // 关闭加载
    if (response.config.showLoading !== false) {
      loadingCount--
      if (loadingCount <= 0) {
        loadingCount = 0
        loadingInstance?.close()
      }
    }
    
    const { code, message, data } = response.data
    
    // 业务成功
    if (code === 0 || code === 200) {
      return data
    }
    
    // 业务错误
    ElMessage.error(message || '请求失败')
    return Promise.reject(new Error(message))
  },
  (error) => {
    // 关闭加载
    loadingCount--
    if (loadingCount <= 0) {
      loadingCount = 0
      loadingInstance?.close()
    }
    
    // 处理 HTTP 错误
    const { response } = error
    if (response) {
      switch (response.status) {
        case 401:
          ElMessage.error('登录已过期，请重新登录')
          localStorage.removeItem('token')
          window.location.href = '/login'
          break
        case 403:
          ElMessage.error('没有权限访问')
          break
        case 404:
          ElMessage.error('请求的资源不存在')
          break
        case 500:
          ElMessage.error('服务器错误')
          break
        default:
          ElMessage.error(response.data?.message || '网络错误')
      }
    } else {
      ElMessage.error('网络连接失败')
    }
    
    return Promise.reject(error)
  }
)

export default request
