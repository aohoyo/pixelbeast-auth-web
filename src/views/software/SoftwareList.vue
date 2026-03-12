<template>
  <div class="software-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <span class="title">软件列表</span>
            <el-tag type="info" size="small">共 {{ total }} 个</el-tag>
          </div>
          <div class="header-right">
            <el-input
              v-model="searchQuery"
              placeholder="搜索软件名称"
              clearable
              style="width: 240px"
              @keyup.enter="handleSearch"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
            <el-button type="primary" @click="handleCreate">
              <el-icon><Plus /></el-icon>创建软件
            </el-button>
          </div>
        </div>
      </template>
      
      <el-table
        :data="softwareList"
        v-loading="loading"
        stripe
        border
        style="width: 100%"
      >
        <el-table-column type="index" label="#" width="60" align="center" />
        <el-table-column prop="name" label="软件名称" min-width="150">
          <template #default="{ row }">
            <div class="software-name">
              <el-avatar :size="32" :icon="Box" />
              <span>{{ row.name }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="slug" label="标识符" width="150" />
        <el-table-column prop="api_key" label="通讯密钥" width="200">
          <template #default="{ row }">
            <div class="api-key-cell">
              <span class="api-key-text">{{ maskAPIKey(row.api_key) }}</span>
              <el-button link type="primary" @click="copyAPIKey(row.api_key)">
                <el-icon><CopyDocument /></el-icon>
              </el-button>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="latest_version" label="最新版本" width="120">
          <template #default="{ row }">
            <el-tag v-if="row.latest_version" type="success" size="small">
              {{ row.latest_version }}
            </el-tag>
            <span v-else class="text-gray">-</span>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip />
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-switch
              v-model="row.status"
              :active-value="1"
              :inactive-value="0"
              @change="handleStatusChange(row)"
            />
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" width="160">
          <template #default="{ row }">
            {{ formatDate(row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)">
              <el-icon><Edit /></el-icon>编辑
            </el-button>
            <el-button type="primary" link @click="handleVersions(row)">
              <el-icon><Collection /></el-icon>版本
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
import { ref, onMounted, onActivated } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getSoftwareList, deleteSoftware, updateSoftware } from '@/api/software'

const router = useRouter()
const loading = ref(false)
const softwareList = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const searchQuery = ref('')

// 获取软件列表
const fetchSoftwareList = async () => {
  loading.value = true
  try {
    const res = await getSoftwareList({
      page: currentPage.value,
      page_size: pageSize.value,
      keyword: searchQuery.value
    })
    // 后端返回格式: { code, msg, data: { list, total, page } }
    softwareList.value = res?.data?.list || []
    total.value = res?.data?.total || 0
  } catch (error) {
    console.error('获取软件列表失败:', error)
    softwareList.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  currentPage.value = 1
  fetchSoftwareList()
}

// 创建软件 - 跳转到新增页
const handleCreate = () => {
  router.push('/software/add')
}

// 编辑软件 - 跳转到编辑页
const handleEdit = (row) => {
  router.push(`/software/edit/${row.id}`)
}

// 遮罩 API Key 显示
const maskAPIKey = (key) => {
  if (!key) return ''
  return key.substring(0, 4) + '****' + key.substring(key.length - 4)
}

// 复制 API Key
const copyAPIKey = async (key) => {
  if (!key) {
    ElMessage.warning('没有可复制的内容')
    return
  }
  
  try {
    // 优先使用现代 Clipboard API
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(key)
      ElMessage.success('通讯密钥已复制')
    } else {
      // 降级方案：使用 execCommand
      const textArea = document.createElement('textarea')
      textArea.value = key
      textArea.style.position = 'fixed'
      textArea.style.left = '-9999px'
      textArea.style.top = '-9999px'
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      
      const successful = document.execCommand('copy')
      document.body.removeChild(textArea)
      
      if (successful) {
        ElMessage.success('通讯密钥已复制')
      } else {
        throw new Error('execCommand failed')
      }
    }
  } catch (err) {
    console.error('复制失败:', err)
    ElMessage.error('复制失败，请手动复制')
  }
}

// 查看版本
const handleVersions = (row) => {
  router.push(`/versions?software_id=${row.id}`)
}

// 删除软件
const handleDelete = (row) => {
  ElMessageBox.confirm(
    `确定要删除软件 "${row.name}" 吗？此操作不可恢复。`,
    '确认删除',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      await deleteSoftware(row.id)
      ElMessage.success('删除成功')
      fetchSoftwareList()
    } catch (error) {
      ElMessage.error('删除失败')
    }
  })
}

// 状态变更
const handleStatusChange = async (row) => {
  try {
    await updateSoftware(row.id, { status: row.status })
    ElMessage.success('状态更新成功')
  } catch (error) {
    row.status = row.status === 1 ? 0 : 1
    ElMessage.error('状态更新失败')
  }
}

// 分页
const handleSizeChange = (val) => {
  pageSize.value = val
  fetchSoftwareList()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  fetchSoftwareList()
}

// 格式化日期
const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleString('zh-CN')
}

onMounted(() => {
  fetchSoftwareList()
})

// 从其他页面返回时刷新数据
onActivated(() => {
  fetchSoftwareList()
})
</script>

<style scoped>
.software-list {
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

.software-name {
  display: flex;
  align-items: center;
  gap: 8px;
}

.text-gray {
  color: #9ca3af;
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
  }
  
  .header-right .el-input {
    flex: 1;
  }
}
</style>