<template>
  <aside class="sidebar" :class="{ collapsed: isCollapsed }">
    <div class="logo">
      <img :src="siteLogo" class="logo-img" alt="logo" />
      <span class="logo-text" v-show="!isCollapsed">{{ siteName }}</span>
    </div>
    
    <el-menu
      :default-active="activeMenu"
      :collapse="isCollapsed"
      :collapse-transition="false"
      router
      class="sidebar-menu"
      background-color="#1e293b"
      text-color="#94a3b8"
      active-text-color="#ffffff"
    >
      <el-menu-item index="/dashboard">
        <el-icon><HomeFilled /></el-icon>
        <template #title>控制台</template>
      </el-menu-item>
      
      <el-menu-item index="/software/list" :disabled="!storageConfigured">
        <el-icon><Box /></el-icon>
        <template #title>软件管理</template>
      </el-menu-item>
      
      <el-sub-menu index="/versions" :disabled="!storageConfigured">
        <template #title>
          <el-icon><Collection /></el-icon>
          <span>版本管理</span>
        </template>
        <el-menu-item index="/versions">版本列表</el-menu-item>
        <el-menu-item index="/versions/publish">发布版本</el-menu-item>
      </el-sub-menu>
      
      <el-sub-menu index="/system">
        <template #title>
          <el-icon><Setting /></el-icon>
          <span>系统管理</span>
        </template>
        <el-menu-item index="/storage/config">
          <el-icon><FolderOpened /></el-icon>
          <template #title>存储配置</template>
        </el-menu-item>
      </el-sub-menu>
    </el-menu>
    
    <div class="collapse-btn" @click="toggleCollapse">
      <el-icon>
        <Fold v-if="!isCollapsed" />
        <Expand v-else />
      </el-icon>
    </div>
  </aside>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { SITE_NAME, SITE_LOGO } from '@/config'
import { useAuthStore } from '@/stores/auth'
import request from '@/api/request'

const route = useRoute()

const authStore = useAuthStore()
const storageConfigured = computed(() => authStore.storageConfigured)

// 加载存储配置状态
const loadStorageStatus = async () => {
  try {
    const res = await request.get('/storage/config')
    if (res.code === 0) {
      authStore.setStorageConfigured(res.data.has_config && res.data.status === 1)
    }
  } catch (error) {
    console.error('Failed to load storage status:', error)
  }
}

onMounted(() => {
  loadStorageStatus()
})

const isCollapsed = ref(false)
const siteName = SITE_NAME
const siteLogo = SITE_LOGO
const activeMenu = computed(() => route.path)

const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value
}
</script>

<style scoped>
.sidebar {
  width: 220px;
  height: 100vh;
  background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%);
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
  position: relative;
}

.sidebar.collapsed {
  width: 64px;
}

.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 0 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.collapsed .logo {
  justify-content: center;
  padding: 0;
}

.logo-img {
  width: 32px;
  height: 32px;
  margin-right: 12px;
  border-radius: 4px;
}

.collapsed .logo-img {
  margin-right: 0;
  width: 36px;
  height: 36px;
}

.logo-text {
  font-size: 16px;
  font-weight: 600;
  color: #ffffff;
  white-space: nowrap;
  overflow: hidden;
}

.sidebar-menu {
  flex: 1;
  border-right: none;
  padding-top: 8px;
}

.sidebar-menu :deep(.el-menu-item),
.sidebar-menu :deep(.el-sub-menu__title) {
  height: 48px;
  line-height: 48px;
  margin: 4px 8px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.sidebar-menu :deep(.el-menu-item:hover),
.sidebar-menu :deep(.el-sub-menu__title:hover) {
  background: rgba(96, 165, 250, 0.15) !important;
}

.sidebar-menu :deep(.el-menu-item.is-active) {
  background: linear-gradient(135deg, var(--el-color-primary) 0%, var(--el-color-primary-dark-2) 100%) !important;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
}

.sidebar-menu :deep(.el-sub-menu .el-menu-item) {
  padding-left: 48px !important;
}

/* 禁用菜单样式 */
.sidebar-menu :deep(.el-menu-item.is-disabled),
.sidebar-menu :deep(.el-sub-menu.is-disabled > .el-sub-menu__title) {
  opacity: 0.5;
  cursor: not-allowed !important;
  pointer-events: none;
}

.collapse-btn {
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
  cursor: pointer;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  transition: all 0.3s ease;
}

.collapse-btn:hover {
  color: #ffffff;
  background: rgba(255, 255, 255, 0.05);
}

/* 响应式 */
@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    left: 0;
    top: 0;
    z-index: 1000;
    transform: translateX(0);
  }
  
  .sidebar.collapsed {
    transform: translateX(-100%);
  }
}
</style>
