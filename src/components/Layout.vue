<template>
  <div class="layout-container">
    <AppSidebar />
    <div class="main-container">
      <AppHeader />
      <AppTabs />
      <main class="main-content">
        <router-view v-slot="{ Component }">
          <keep-alive :include="cachedViews">
            <component :is="Component" />
          </keep-alive>
        </router-view>
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useTabsStore } from '@/stores/tabs'
import AppSidebar from './AppSidebar.vue'
import AppHeader from './AppHeader.vue'
import AppTabs from './AppTabs.vue'

const tabsStore = useTabsStore()
const cachedViews = computed(() => tabsStore.cachedViews)
</script>

<style scoped>
.layout-container {
  display: flex;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
}

.main-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.main-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background: #f5f7fa;
}

/* 响应式 */
@media (max-width: 768px) {
  .main-content {
    padding: 12px;
  }
}
</style>