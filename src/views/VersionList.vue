<template>
  <div class="version-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <span class="title">版本列表</span>
            <el-tag type="info" size="small">共 {{ total }} 个</el-tag>
          </div>
          <div class="header-right">
            <el-select
              v-model="selectedSoftware"
              placeholder="选择软件"
              clearable
              style="width: 180px"
              @change="handleSoftwareChange"
            >
              <el-option
                v-for="item in softwareOptions"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              />
            </el-select>
            <el-select
              v-model="selectedStatus"
              placeholder="状态"
              clearable
              style="width: 120px"
              @change="handleStatusChange"
            >
              <el-option label="已发布" value="published" />
              <el-option label="草稿" value="draft" />
              <el-option label="已归档" value="archived" />
            </el-select>
            <el-button type="primary" @click="handlePublish">
              <el-icon><Plus /></el-icon>发布版本
            </el-button>
          </div>
        </div>
      </template>
      
      <el-table
        :data="versionList"
        v-loading="loading"
        stripe
        border
        style="width: 100%"
      >
        <el-table-column type="index" label="#" width="60" align="center" />
        <el-table-column prop="software_name" label="软件" min-width="120" />
        <el-table-column prop="version" label="版本号" width="120">
          <template #default="{ row }">
            <el-tag type="primary" size="small" effect="plain">
              {{ row.version }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="channel" label="渠道" width="100">
          <template #default="{ row }">
            <el-tag :type="getChannelType(row.channel)" size="small">
              {{ getChannelLabel(row.channel) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="changelog" label="更新日志" min-width="200" show-overflow-tooltip />
        <el-table-column prop="download_count" label="下载量" width="100" align="right">
          <template #default="{ row }">
            {{ formatNumber(row.download_count) }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">
              {{ getStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="publish_time" label="发布时间" width="160">
          <template #default="{ row }">
            {{ formatDate(row.publish_time) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleDetail(row)">
              <el-icon><View /></el-icon>详情
            </el-button>
            <el-button type="primary" link @click="handleEdit(row)">
              <el-icon><Edit /></el-icon>编辑
            </el-button>
            <el-button type="danger" link @click="handleDelete(row)">
              <el-icon><Delete /></el-icon>删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getVersionList, deleteVersion } from '@/api/version'
import { getSoftwareList } from '@/api/software'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const versionList = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const selectedSoftware = ref(route.query.software_id || '')
const selectedStatus = ref('')
const softwareOptions = ref([])

// 获取软件选项
const fetchSoftwareOptions = async () => {
  try {
    const res = await getSoftwareList({ page: 1, page_size: 100 })
    softwareOptions.value = res?.list || []
  } catch (error) {
    softwareOptions.value = [
      { id: 1, name: '客户端A' },
      { id: 2, name: '客户端B' },
      { id: 3, name: '工具箱' }
    ]
  }
}

// 获取版本列表
const fetchVersionList = async () => {
  loading.value = true
  try {
    const res = await getVersionList({
      page: currentPage.value,
      page_size: pageSize.value,
      software_id: selectedSoftware.value,
      status: selectedStatus.value
    })
    versionList.value = res?.list || []
    total.value = res?.total || 0
  } catch (error) {
    // 模拟数据
    versionList.value = [
      {
        id: 1,
        software_id: 1,
        software_name: '客户端A',
        version: 'v2.1.0',
        channel: 'stable',
        changelog: '修复已知问题，优化性能',
        download_count: 12580,
        status: 'published',
        publish_time: '2024-01-15T10:30:00'
      },
      {
        id: 2,
        software_id: 1,
        software_name: '客户端A',
        version: 'v2.0.5',
        channel: 'stable',
        changelog: '新增功能：自动更新、暗黑模式',
        download_count: 8920,
        status: 'published',
        publish_time: '2024-01-10T14:00:00'
      },
      {
        id: 3,
        software_id: 2,
        software_name: '客户端B',
        version: 'v1.5.2-beta',
        channel: 'beta',
        changelog: '测试版本，新增实验性功能',
        download_count: 1200,
        status: 'draft',
        publish_time: null
      }
    ]
    total.value = versionList.value.length
  } finally {
    loading.value = false
  }
}

// 软件筛选变化
const handleSoftwareChange = () => {
  currentPage.value = 1
  fetchVersionList()
}

// 状态筛选变化
const handleStatusChange = () => {
  currentPage.value = 1
  fetchVersionList()
}

// 发布版本
const handlePublish = () => {
  router.push('/versions/publish')
}

// 查看详情
const handleDetail = (row) => {
  router.push(`/versions/detail/${row.id}`)
}

// 编辑版本
const handleEdit = (row) => {
  router.push(`/versions/publish?id=${row.id}`)
}

// 删除版本
const handleDelete = (row) => {
  ElMessageBox.confirm(
    `确定要删除版本 "${row.version}" 吗？此操作不可恢复。`,
    '确认删除',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      await deleteVersion(row.id)
      ElMessage.success('删除成功')
      fetchVersionList()
    } catch (error) {
      ElMessage.error('删除失败')
    }
  })
}

// 分页
const handleSizeChange = (val) => {
  pageSize.value = val
  fetchVersionList()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  fetchVersionList()
}

// 获取渠道类型
const getChannelType = (channel) => {
  const map = {
    stable: 'success',
    beta: 'warning',
    alpha: 'danger',
    dev: 'info'
  }
  return map[channel] || 'info'
}

// 获取渠道标签
const getChannelLabel = (channel) => {
  const map = {
    stable: '稳定版',
    beta: '测试版',
    alpha: '内测版',
    dev: '开发版'
  }
  return map[channel] || channel
}

// 获取状态类型
const getStatusType = (status) => {
  const map = {
    published: 'success',
    draft: 'info',
    archived: 'danger'
  }
  return map[status] || 'info'
}

// 获取状态标签
const getStatusLabel = (status) => {
  const map = {
    published: '已发布',
    draft: '草稿',
    archived: '已归档'
  }
  return map[status] || status
}

// 格式化数字
const formatNumber = (num) => {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + 'w'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k'
  }
  return num?.toString() || '0'
}

// 格式化日期
const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleString('zh-CN')
}

onMounted(() => {
  fetchSoftwareOptions()
  fetchVersionList()
})
</script>

<style scoped>
.version-list {
  padding: 0;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.title {
  font-size: 16px;
  font-weight: 500;
  color: #1f2937;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.pagination-wrapper {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

/* 响应式 */
@media (max-width: 768px) {
  .card-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
  
  .header-right {
    width: 100%;
    flex-wrap: wrap;
  }
}
</style>
