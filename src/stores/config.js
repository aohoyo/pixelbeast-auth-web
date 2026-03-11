/**
 * 动态状态配置
 * 
 * 说明：
 * - 这里的配置是响应式状态，运行时可能改变
 * - 如主题设置、用户偏好等
 * - 纯静态配置请使用 config/index.js
 */

import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useConfigStore = defineStore('config', () => {
  // 分页配置（组件内直接使用，这里保留供全局使用）
  const pagination = ref({
    pageSize: 10,
    pageSizes: [10, 20, 50, 100],
    layout: 'total, sizes, prev, pager, next, jumper'
  })

  // 更新分页
  const updatePagination = (newConfig) => {
    Object.assign(pagination.value, newConfig)
  }

  return {
    pagination,
    updatePagination
  }
})
