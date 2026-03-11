import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useTabsStore = defineStore('tabs', () => {
  // 标签页列表（默认控制台，路径与路由一致）
  const tabs = ref([
    { name: 'Dashboard', title: '控制台', path: '/dashboard', icon: 'HomeFilled', closable: false }
  ])
  
  // 当前激活的标签页
  const activeTab = ref('/dashboard')
  
  // 缓存的页面
  const cachedViews = ref(['Dashboard'])
  
  // 获取当前激活的标签页信息
  const currentTab = computed(() => {
    return tabs.value.find(tab => tab.path === activeTab.value)
  })

  // 添加标签页
  const addTab = (tab) => {
    // 检查是否已存在
    const exists = tabs.value.find(t => t.path === tab.path)
    if (!exists) {
      tabs.value.push({
        ...tab,
        closable: tab.closable !== false
      })
      // 添加到缓存
      if (tab.name && !cachedViews.value.includes(tab.name)) {
        cachedViews.value.push(tab.name)
      }
    }
    activeTab.value = tab.path
  }

  // 移除标签页
  const removeTab = (targetPath) => {
    const tabIndex = tabs.value.findIndex(tab => tab.path === targetPath)
    if (tabIndex === -1) return
    
    const tab = tabs.value[tabIndex]
    tabs.value.splice(tabIndex, 1)
    
    // 从缓存中移除
    const cacheIndex = cachedViews.value.indexOf(tab.name)
    if (cacheIndex > -1) {
      cachedViews.value.splice(cacheIndex, 1)
    }
    
    // 如果关闭的是当前标签页，切换到相邻标签页
    if (activeTab.value === targetPath) {
      const nextTab = tabs.value[tabIndex] || tabs.value[tabIndex - 1]
      if (nextTab) {
        activeTab.value = nextTab.path
      }
    }
    
    return activeTab.value
  }

  // 关闭其他标签页
  const closeOthers = (targetPath) => {
    const currentTab = tabs.value.find(tab => tab.path === targetPath)
    tabs.value = tabs.value.filter(tab => !tab.closable || tab.path === targetPath)
    cachedViews.value = tabs.value.map(tab => tab.name).filter(Boolean)
    activeTab.value = targetPath
  }

  // 关闭所有标签页
  const closeAll = () => {
    tabs.value = tabs.value.filter(tab => !tab.closable)
    cachedViews.value = tabs.value.map(tab => tab.name).filter(Boolean)
    activeTab.value = tabs.value[0]?.path || '/'
    return activeTab.value
  }

  // 设置激活标签页
  const setActiveTab = (path) => {
    activeTab.value = path
  }

  return {
    tabs,
    activeTab,
    cachedViews,
    currentTab,
    addTab,
    removeTab,
    closeOthers,
    closeAll,
    setActiveTab
  }
})
