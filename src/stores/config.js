/**
 * 动态状态配置
 * 
 * 运行时可能改变的配置，如用户偏好等
 */

import { defineStore } from 'pinia'
import { ref } from 'vue'
import { PAGINATION } from '@/config'

export const useConfigStore = defineStore('config', () => {
  // 分页配置
  const pagination = ref({ ...PAGINATION })

  // 侧边栏折叠状态
  const sidebarCollapsed = ref(false)

  const updatePagination = (newConfig) => {
    Object.assign(pagination.value, newConfig)
  }

  const resetPagination = () => {
    pagination.value = { ...PAGINATION }
  }

  const toggleSidebar = () => {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }

  return {
    pagination,
    sidebarCollapsed,
    updatePagination,
    resetPagination,
    toggleSidebar,
  }
})