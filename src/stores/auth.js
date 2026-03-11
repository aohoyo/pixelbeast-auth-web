import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  // Token
  const token = ref(localStorage.getItem('token') || '')
  
  // 用户信息
  const user = ref(JSON.parse(localStorage.getItem('user') || 'null'))
  
  // 是否已登录
  const isLoggedIn = computed(() => !!token.value)
  
  // 设置 Token
  const setToken = (newToken) => {
    token.value = newToken
    if (newToken) {
      localStorage.setItem('token', newToken)
    } else {
      localStorage.removeItem('token')
    }
  }
  
  // 设置用户信息
  const setUser = (userData) => {
    user.value = userData
    if (userData) {
      localStorage.setItem('user', JSON.stringify(userData))
    } else {
      localStorage.removeItem('user')
    }
  }
  
  // 登录成功后调用
  const login = (newToken, userData = null) => {
    setToken(newToken)
    if (userData) {
      setUser(userData)
    }
  }
  
  // 退出登录
  const logout = () => {
    setToken('')
    setUser(null)
  }
  
  // 检查登录状态（从 localStorage 恢复）
  const checkAuth = () => {
    const savedToken = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')
    
    if (savedToken) {
      token.value = savedToken
    }
    if (savedUser) {
      try {
        user.value = JSON.parse(savedUser)
      } catch (e) {
        user.value = null
      }
    }
    
    return !!savedToken
  }

  return {
    token,
    user,
    isLoggedIn,
    setToken,
    setUser,
    login,
    logout,
    checkAuth
  }
})