import { createRouter, createWebHistory } from 'vue-router'
import { useTabsStore } from '@/stores/tabs'
import { useAuthStore } from '@/stores/auth'
import request from '@/api/request'

const routes = [
  {
    path: '/',
    name: 'Layout',
    component: () => import('@/components/Layout.vue'),
    redirect: '/dashboard',
    children: [
      {
        path: '/dashboard',
        name: 'Dashboard',
        component: () => import('@/views/Dashboard.vue'),
        meta: { title: '控制台', icon: 'HomeFilled' }
      },
      {
        path: '/storage/config',
        name: 'StorageConfig',
        component: () => import('@/views/StorageConfig.vue'),
        meta: { title: '存储配置', icon: 'FolderOpened' }
      },
      {
        path: '/software/list',
        name: 'SoftwareList',
        component: () => import('@/views/software/SoftwareList.vue'),
        meta: { title: '软件列表', icon: 'Box' }
      },
      {
        path: '/software/add',
        name: 'SoftwareAdd',
        component: () => import('@/views/software/SoftwareAdd.vue'),
        meta: { title: '新增软件', icon: 'Plus', hidden: true }
      },
      {
        path: '/software/edit/:id',
        name: 'SoftwareEdit',
        component: () => import('@/views/software/SoftwareEdit.vue'),
        meta: { title: '编辑软件', icon: 'Edit', hidden: true }
      },
      {
        path: '/versions',
        name: 'VersionList',
        component: () => import('@/views/VersionList.vue'),
        meta: { title: '版本列表', icon: 'Collection' }
      },
      {
        path: '/versions/publish',
        name: 'VersionPublish',
        component: () => import('@/views/VersionPublish.vue'),
        meta: { title: '发布版本', icon: 'Upload', hidden: true }
      },
      {
        path: '/versions/detail/:id',
        name: 'VersionDetail',
        component: () => import('@/views/VersionPublish.vue'),
        meta: { title: '版本详情', icon: 'Document', hidden: true }
      }
    ]
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { title: '登录', public: true }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue'),
    meta: { title: '页面不存在' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})

// 检查存储配置状态
async function checkStorageConfig() {
  try {
    const res = await request.get('/storage/config')
    if (res.code === 0) {
      const config = res.data
      return config.has_config && config.status === 1
    }
    return false
  } catch (error) {
    console.error('Failed to check storage config:', error)
    return false
  }
}

// 路由守卫 - 登录状态检查 + 存储配置检查 + 自动添加标签页
router.beforeEach(async (to, from, next) => {
  const tabsStore = useTabsStore()
  const authStore = useAuthStore()
  
  // 判断是否为公开页面（登录页、404等）
  const isPublicPage = to.meta.public || to.name === 'NotFound'
  
  // 未登录且访问非公开页面，重定向到登录页
  if (!authStore.isLoggedIn && !isPublicPage) {
    next({ name: 'Login', query: { redirect: to.fullPath } })
    return
  }
  
  // 已登录且访问登录页，重定向到控制台
  if (authStore.isLoggedIn && to.name === 'Login') {
    next({ name: 'Dashboard' })
    return
  }
  
  // 已登录，访问非公开页面
  if (authStore.isLoggedIn && !isPublicPage) {
    // 如果还没有检查过存储配置，进行检查
    if (authStore.storageConfigured === false) {
      const configured = await checkStorageConfig()
      if (configured) {
        // 存储已配置，更新状态
        authStore.setStorageConfigured(true)
      } else if (to.name !== 'StorageConfig') {
        // 存储未配置且不在存储配置页，跳转到存储配置页
        next({ name: 'StorageConfig' })
        return
      }
    }
  }
  
  // 自动添加标签页（非公开、非隐藏页面）
  if (!to.meta.public && !to.meta.hidden) {
    tabsStore.addTab({
      name: to.name,
      title: to.meta.title,
      path: to.path,
      icon: to.meta.icon
    })
  }
  
  next()
})

export default router
