<template>
  <div class="app-tabs">
    <div class="tabs-wrapper">
      <div
        v-for="tab in tabs"
        :key="tab.path"
        class="tab-item"
        :class="{ active: activeTab === tab.path }"
        @click="switchTab(tab)"
        @contextmenu.prevent="showContextMenu($event, tab)"
      >
        <el-icon v-if="tab.icon"><component :is="tab.icon" /></el-icon>
        <span class="tab-title">{{ tab.title }}</span>
        <el-icon
          v-if="tab.closable"
          class="tab-close"
          @click.stop="closeTab(tab.path)"
        ><Close /></el-icon>
      </div>
    </div>
    
    <div class="tabs-actions">
      <el-dropdown trigger="click" @command="handleCommand">
        <el-icon class="action-icon"><ArrowDown /></el-icon>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="closeOthers">关闭其他</el-dropdown-item>
            <el-dropdown-item command="closeAll">关闭全部</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
    
    <!-- 右键菜单 -->
    <div
      v-if="contextMenu.visible"
      class="context-menu"
      :style="{ left: contextMenu.x + 'px', top: contextMenu.y + 'px' }"
    >
      <div class="menu-item" @click="refreshTab">刷新页面</div>
      <div class="menu-item" @click="closeCurrentTab">关闭标签</div>
      <div class="menu-item" @click="closeOtherTabs">关闭其他</div>
      <div class="menu-item" @click="closeAllTabs">关闭全部</div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useTabsStore } from '@/stores/tabs'

const router = useRouter()
const tabsStore = useTabsStore()

const tabs = computed(() => tabsStore.tabs)
const activeTab = computed(() => tabsStore.activeTab)

const contextMenu = ref({
  visible: false,
  x: 0,
  y: 0,
  tab: null
})

// 切换标签
const switchTab = (tab) => {
  router.push(tab.path)
}

// 关闭标签
const closeTab = (path) => {
  const nextPath = tabsStore.removeTab(path)
  if (nextPath) {
    router.push(nextPath)
  }
}

// 显示右键菜单
const showContextMenu = (e, tab) => {
  contextMenu.value = {
    visible: true,
    x: e.clientX,
    y: e.clientY,
    tab
  }
}

// 隐藏右键菜单
const hideContextMenu = () => {
  contextMenu.value.visible = false
}

// 刷新当前标签
const refreshTab = () => {
  const tab = contextMenu.value.tab
  if (tab) {
    // 移除缓存并重新加载
    const index = tabsStore.cachedViews.indexOf(tab.name)
    if (index > -1) {
      tabsStore.cachedViews.splice(index, 1)
    }
    router.replace({ path: '/redirect' + tab.path })
  }
  hideContextMenu()
}

// 关闭当前标签
const closeCurrentTab = () => {
  const tab = contextMenu.value.tab
  if (tab && tab.closable) {
    closeTab(tab.path)
  }
  hideContextMenu()
}

// 关闭其他标签
const closeOtherTabs = () => {
  const tab = contextMenu.value.tab
  if (tab) {
    tabsStore.closeOthers(tab.path)
    router.push(tab.path)
  }
  hideContextMenu()
}

// 关闭全部标签
const closeAllTabs = () => {
  const nextPath = tabsStore.closeAll()
  router.push(nextPath)
  hideContextMenu()
}

// 下拉菜单命令
const handleCommand = (command) => {
  switch (command) {
    case 'closeOthers':
      tabsStore.closeOthers(activeTab.value)
      break
    case 'closeAll':
      const nextPath = tabsStore.closeAll()
      router.push(nextPath)
      break
  }
}

// 点击其他地方关闭右键菜单
onMounted(() => {
  document.addEventListener('click', hideContextMenu)
})

onUnmounted(() => {
  document.removeEventListener('click', hideContextMenu)
})
</script>

<style scoped>
.app-tabs {
  height: 40px;
  background: #ffffff;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  align-items: center;
  padding: 0 16px;
  position: relative;
}

.tabs-wrapper {
  flex: 1;
  display: flex;
  gap: 4px;
  overflow-x: auto;
  overflow-y: hidden;
}

.tab-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  color: #606266;
  background: #f5f7fa;
  transition: all 0.3s ease;
  white-space: nowrap;
  user-select: none;
}

.tab-item:hover {
  background: #e4e7ed;
  color: #303133;
}

.tab-item.active {
  background: linear-gradient(135deg, var(--el-color-primary) 0%, var(--el-color-primary-dark-2) 100%);
  color: #ffffff;
}

.tab-title {
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tab-close {
  font-size: 12px;
  opacity: 0.7;
  transition: opacity 0.3s ease;
}

.tab-close:hover {
  opacity: 1;
}

.tab-item.active .tab-close {
  color: #ffffff;
}

.tabs-actions {
  margin-left: 8px;
}

.action-icon {
  font-size: 14px;
  color: #606266;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.action-icon:hover {
  background: #f5f7fa;
  color: var(--el-color-primary);
}

/* 右键菜单 */
.context-menu {
  position: fixed;
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  padding: 4px 0;
  z-index: 9999;
  min-width: 120px;
}

.menu-item {
  padding: 8px 16px;
  font-size: 13px;
  color: #606266;
  cursor: pointer;
  transition: all 0.2s ease;
}

.menu-item:hover {
  background: #f5f7fa;
  color: var(--el-color-primary);
}
</style>
