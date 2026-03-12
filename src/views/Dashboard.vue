<template>
  <div class="dashboard">
    <!-- 统计卡片 -->
    <el-row :gutter="20">
      <el-col :xs="24" :sm="12" :md="6">
        <div class="stat-card">
          <div class="stat-icon" style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);">
            <el-icon><Box /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.softwareCount }}</div>
            <div class="stat-label">软件总数</div>
          </div>
        </div>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <div class="stat-card">
          <div class="stat-icon" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%);">
            <el-icon><Collection /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.versionCount }}</div>
            <div class="stat-label">版本总数</div>
          </div>
        </div>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <div class="stat-card">
          <div class="stat-icon" style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);">
            <el-icon><Download /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ formatNumber(stats.downloadCount) }}</div>
            <div class="stat-label">总下载量</div>
          </div>
        </div>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <div class="stat-card">
          <div class="stat-icon" style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);">
            <el-icon><User /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ formatNumber(stats.activeUsers) }}</div>
            <div class="stat-label">活跃用户</div>
          </div>
        </div>
      </el-col>
    </el-row>
    
    <!-- 图表区域 -->
    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :xs="24" :lg="16">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>下载趋势</span>
              <el-radio-group v-model="trendPeriod" size="small">
                <el-radio-button label="week">本周</el-radio-button>
                <el-radio-button label="month">本月</el-radio-button>
                <el-radio-button label="year">全年</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <div ref="trendChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
      <el-col :xs="24" :lg="8">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>版本分布</span>
            </div>
          </template>
          <div ref="distributionChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- 最近活动 -->
    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :xs="24" :lg="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>最近发布</span>
              <el-button type="primary" text @click="$router.push('/versions')">查看全部</el-button>
            </div>
          </template>
          <el-table :data="recentVersions" v-loading="loading" stripe>
            <el-table-column prop="software_name" label="软件" min-width="120" />
            <el-table-column prop="version" label="版本号" width="100" />
            <el-table-column prop="publish_time" label="发布时间" width="160">
              <template #default="{ row }">
                {{ formatDate(row.publish_time) }}
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="80">
              <template #default="{ row }">
                <el-tag :type="row.status === 'published' ? 'success' : 'info'" size="small">
                  {{ row.status === 'published' ? '已发布' : '草稿' }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
      <el-col :xs="24" :lg="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>系统公告</span>
            </div>
          </template>
          <el-timeline>
            <el-timeline-item
              v-for="(notice, index) in notices"
              :key="index"
              :type="notice.type"
              :timestamp="notice.time"
            >
              {{ notice.content }}
            </el-timeline-item>
          </el-timeline>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'
import { getDownloadStats, getVersionDistribution, getUpdateTrend } from '@/api/update'
import { getVersionList } from '@/api/version'

const loading = ref(false)
const trendPeriod = ref('week')
const trendChartRef = ref(null)
const distributionChartRef = ref(null)

let trendChart = null
let distributionChart = null

// 统计数据
const stats = ref({
  softwareCount: 12,
  versionCount: 48,
  downloadCount: 125680,
  activeUsers: 8920
})

// 最近版本
const recentVersions = ref([])

// 系统公告
const notices = ref([
  { type: 'primary', time: '2024-01-15', content: '系统升级完成，新增版本对比功能' },
  { type: 'success', time: '2024-01-14', content: '新增3个软件包，版本管理更便捷' },
  { type: 'warning', time: '2024-01-13', content: '下载服务维护通知：1月20日凌晨2-4点' },
  { type: 'info', time: '2024-01-12', content: '欢迎使用软件升级管理系统 v1.0' }
])

// 初始化趋势图
const initTrendChart = () => {
  if (!trendChartRef.value) return
  
  trendChart = echarts.init(trendChartRef.value)
  const option = {
    tooltip: {
      trigger: 'axis'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '下载量',
        type: 'line',
        smooth: true,
        data: [120, 132, 101, 134, 90, 230, 210],
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(37, 99, 235, 0.3)' },
            { offset: 1, color: 'rgba(37, 99, 235, 0.05)' }
          ])
        },
        itemStyle: {
          color: '#2563eb'
        }
      }
    ]
  }
  trendChart.setOption(option)
}

// 初始化分布图
const initDistributionChart = () => {
  if (!distributionChartRef.value) return
  
  distributionChart = echarts.init(distributionChartRef.value)
  const option = {
    tooltip: {
      trigger: 'item'
    },
    legend: {
      bottom: '5%',
      left: 'center'
    },
    series: [
      {
        name: '版本分布',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 20,
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: [
          { value: 35, name: '稳定版', itemStyle: { color: '#10b981' } },
          { value: 25, name: '测试版', itemStyle: { color: '#f59e0b' } },
          { value: 20, name: '开发版', itemStyle: { color: '#3b82f6' } },
          { value: 15, name: '内测版', itemStyle: { color: '#8b5cf6' } },
          { value: 5, name: '归档版', itemStyle: { color: '#6b7280' } }
        ]
      }
    ]
  }
  distributionChart.setOption(option)
}

// 获取数据
const fetchData = async () => {
  loading.value = true
  try {
    // 获取最近版本
    const versions = await getVersionList({ page: 1, page_size: 5 })
    recentVersions.value = versions?.list || []
  } catch (error) {
    // 使用模拟数据
    recentVersions.value = [
      { software_name: '客户端A', version: 'v2.1.0', publish_time: '2024-01-15T10:30:00', status: 'published' },
      { software_name: '客户端B', version: 'v1.5.2', publish_time: '2024-01-14T15:20:00', status: 'published' },
      { software_name: '工具箱', version: 'v3.0.0', publish_time: '2024-01-13T09:00:00', status: 'draft' }
    ]
  } finally {
    loading.value = false
  }
}

// 格式化数字
const formatNumber = (num) => {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + 'w'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k'
  }
  return num.toString()
}

// 格式化日期
const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleString('zh-CN')
}

// 监听窗口大小变化
const handleResize = () => {
  trendChart?.resize()
  distributionChart?.resize()
}

onMounted(() => {
  initTrendChart()
  initDistributionChart()
  fetchData()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  trendChart?.dispose()
  distributionChart?.dispose()
})
</script>

<style scoped>
.dashboard {
  padding: 0;
}

.stat-card {
  background: #ffffff;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-size: 24px;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: 600;
  color: #1f2937;
  line-height: 1.2;
}

.stat-label {
  font-size: 14px;
  color: #6b7280;
  margin-top: 4px;
}

.chart-card {
  height: 400px;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-header span {
  font-size: 16px;
  font-weight: 500;
  color: #1f2937;
}

.chart-container {
  height: 300px;
  width: 100%;
}

/* 响应式 */
@media (max-width: 768px) {
  .stat-card {
    margin-bottom: 12px;
  }
  
  .chart-card {
    margin-bottom: 12px;
  }
}
</style>