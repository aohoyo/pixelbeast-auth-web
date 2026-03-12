<template>
  <div class="sidebar" :class="{ 'is-collapse': isCollapse }">
    <!-- Logo -->
    <div class="sidebar-logo">
      <img :src="siteLogo" class="logo-img" alt="logo" />
      <transition name="fade">
        <span v-if="!isCollapse" class="logo-text">{{ siteName }}</span>
      </transition>
    </div>
    
    <!-- 菜单 -->
    <el-scrollbar class="sidebar-menu-wrapper">
      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapse"
        :collapse-transition="false"
        router
        class="sidebar-menu"
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
    </el-scrollbar>
    
    <!-- 底部版权 -->
    <div class="sidebar-footer" v-if="showCopyright">
      <p class="copyright">{{ copyright }}</p>
      <a v-if="icp && !isCollapse" :href="icpLink" target="_blank" class="beian">{{ icp }}</a>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import config from '@/config'
import { useAuthStore } from '@/stores/auth'
import { useConfigStore } from '@/stores/config'
import request from '@/api/request'

const route = useRoute()
const authStore = useAuthStore()
const configStore = useConfigStore()

const isCollapse = computed(() => configStore.sidebarCollapsed)
const storageConfigured = computed(() => authStore.storageConfigured)
const activeMenu = computed(() => route.path)

const siteName = config.title
const siteLogo = config.logo
const copyright = config.copyright
const showCopyright = config.showCopyright
const icp = config.icp
const icpLink = config.icpLink

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
</script>

<style scoped>
.sidebar {
  width: 220px;
  height: 100vh;
  background-color: #1d1e1f;
  display: flex;
  flex-direction: column;
  transition: width 0.3s;
  overflow: hidden;
}

.sidebar.is-collapse {
  width: 64px;
}

/* Logo */
.sidebar-logo {
  height: 60px;
  display: flex;
  align-items: center;
  padding: 0 20px;
  background-color: #191a1c;
  border-bottom: 1px solid #2d2e2f;
  gap: 12px;
}

.logo-img {
  width: 32px;
  height: 32px;
  flex-shrink: 0;
}

.logo-text {
  font-size: 16px;
  font-weight: 600;
  color: #ffffff;
  white-space: nowrap;
  flex: 1;
}

.is-collapse .sidebar-logo {
  padding: 0;
  justify-content: center;
  gap: 0;
}

/* 菜单滚动区域 */
.sidebar-menu-wrapper {
  flex: 1;
  overflow: hidden;
}

.sidebar-menu {
  border-right: none;
  background-color: transparent;
  width: 100% !important;
}

/* 菜单项样式 */
.sidebar-menu :deep(.el-menu-item),
.sidebar-menu :deep(.el-sub-menu__title) {
  height: 50px;
  line-height: 50px;
  color: #bfcbd9;
  background-color: transparent;
}

.sidebar-menu :deep(.el-menu-item:hover),
.sidebar-menu :deep(.el-sub-menu__title:hover) {
  color: #ffffff;
  background-color: #263445;
}

.sidebar-menu :deep(.el-menu-item.is-active) {
  color: #409eff;
  background-color: #263445;
}

/* 子菜单 */
.sidebar-menu :deep(.el-sub-menu .el-menu-item) {
  padding-left: 50px !important;
  min-width: auto;
}

.sidebar-menu :deep(.el-menu--inline) {
  background-color: #1f2022 !important;
}

/* 禁用状态 */
.sidebar-menu :deep(.el-menu-item.is-disabled),
.sidebar-menu :deep(.el-sub-menu.is-disabled > .el-sub-menu__title) {
  opacity: 0.4;
  cursor: not-allowed;
}

/* 收缩状态 */
.is-collapse .sidebar-menu :deep(.el-menu-item),
.is-collapse .sidebar-menu :deep(.el-sub-menu__title) {
  padding: 0 20px !important;
}

/* 底部版权 */
.sidebar-footer {
  padding: 12px 16px;
  border-top: 1px solid #2d2e2f;
  text-align: center;
  background-color: #191a1c;
}

.copyright {
  font-size: 12px;
  color: #5a5e66;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
}

.beian {
  display: block;
  font-size: 11px;
  color: #5a5e66;
  margin-top: 4px;
  text-decoration: none;
}

.beian:hover {
  color: #409eff;
}

.is-collapse .sidebar-footer {
  padding: 12px 8px;
}

.is-collapse .copyright {
  font-size: 10px;
}

/* 过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>