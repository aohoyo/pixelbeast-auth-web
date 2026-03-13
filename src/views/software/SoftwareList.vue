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
        style="width: 100%"
      >
        <el-table-column type="index" label="#" width="60" align="center" />
        <el-table-column prop="name" label="软件名称" min-width="150">
          <template #default="{ row }">
            <div class="software-name">
              <el-avatar :size="32" :src="row.icon" :icon="Box" />
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
    
    <!-- 新增/编辑弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑软件' : '新增软件'"
      width="560px"
      :close-on-click-modal="false"
      destroy-on-close
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
        class="software-form"
      >
        <el-form-item label="软件标识" prop="slug">
          <el-input
            v-model="form.slug"
            disabled
            placeholder="自动生成"
          />
        </el-form-item>
        
        <el-form-item label="软件名称" prop="name">
          <el-input
            v-model="form.name"
            placeholder="请输入软件名称"
            maxlength="50"
            show-word-limit
          />
        </el-form-item>
        
        <el-form-item label="平台" prop="platform">
          <el-select v-model="form.platform" placeholder="请选择平台" style="width: 100%">
            <el-option label="Windows" value="windows" />
            <el-option label="macOS" value="macos" />
            <el-option label="Linux" value="linux" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="通讯密钥" prop="api_key">
          <div class="api-key-input-group">
            <el-input
              v-model="form.api_key"
              :type="showAPIKey ? 'text' : 'password'"
              placeholder="点击生成按钮或手动输入密钥"
              style="flex: 1;"
            />
            <el-button type="primary" @click="generateAPIKey">
              <el-icon><Key /></el-icon>
            </el-button>
            <el-button v-if="form.api_key" @click="copyAPIKey(form.api_key)">
              <el-icon><CopyDocument /></el-icon>
            </el-button>
            <el-button v-if="form.api_key" @click="showAPIKey = !showAPIKey">
              <el-icon><View v-if="!showAPIKey" /><Hide v-else /></el-icon>
            </el-button>
          </div>
        </el-form-item>
        
        <el-form-item label="软件图标" prop="icon">
          <div class="icon-wrapper">
            <el-upload
              class="icon-uploader"
              action="/api/v1/upload"
              :headers="uploadHeaders"
              :data="{ pathPrefix: 'software/icons' }"
              :show-file-list="false"
              :before-upload="handleIconBeforeUpload"
              :on-success="handleIconSuccess"
              :on-error="handleIconError"
              :on-progress="handleIconProgress"
            >
              <div class="icon-preview-box">
                <img v-if="form.icon" :src="form.icon" class="icon-img" alt="图标" />
                <div v-else class="icon-placeholder">
                  <el-icon :size="28"><Picture /></el-icon>
                  <span>上传图标</span>
                </div>
              </div>
            </el-upload>
            <!-- 上传进度条 -->
            <el-progress 
              v-if="iconUploadProgress > 0 && iconUploadProgress < 100" 
              :percentage="iconUploadProgress" 
              :stroke-width="6"
              style="margin-top: 8px;"
            />
            <el-input
              v-model="form.icon"
              placeholder="或输入图标URL"
              clearable
              style="margin-top: 8px;"
            />
          </div>
        </el-form-item>
        
        <el-form-item label="描述" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="3"
            placeholder="请输入软件描述"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">
          {{ isEdit ? '保存修改' : '创建软件' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onActivated } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { CopyDocument, Key, View, Hide, Picture, Box, Edit, Delete, Collection, Plus, Search } from '@element-plus/icons-vue'
import { getSoftwareList, getSoftwareDetail, createSoftware, updateSoftware, deleteSoftware } from '@/api/software'

const router = useRouter()
const loading = ref(false)
const softwareList = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const searchQuery = ref('')

// 弹窗相关
const dialogVisible = ref(false)
const isEdit = ref(false)
const editId = ref(null)
const formRef = ref(null)
const submitting = ref(false)
const showAPIKey = ref(false)
const iconUploadProgress = ref(0)

const form = reactive({
  name: '',
  slug: '',
  api_key: '',
  description: '',
  platform: 'windows',
  icon: ''
})

// 重置表单
const resetForm = () => {
  form.name = ''
  form.slug = 'app_' + Date.now()
  form.api_key = ''
  form.description = ''
  form.platform = 'windows'
  form.icon = ''
  showAPIKey.value = false
}

// 上传请求头
const uploadHeaders = computed(() => ({
  Authorization: 'Bearer ' + localStorage.getItem('token')
}))

const rules = {
  name: [
    { required: true, message: '请输入软件名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  platform: [
    { required: true, message: '请选择平台', trigger: 'change' }
  ]
}

// 获取软件列表
const fetchSoftwareList = async () => {
  loading.value = true
  try {
    const res = await getSoftwareList({
      page: currentPage.value,
      page_size: pageSize.value,
      keyword: searchQuery.value
    })
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

// 创建软件 - 打开弹窗
const handleCreate = () => {
  isEdit.value = false
  editId.value = null
  resetForm()
  dialogVisible.value = true
}

// 编辑软件 - 打开弹窗
const handleEdit = async (row) => {
  isEdit.value = true
  editId.value = row.id
  
  try {
    const res = await getSoftwareDetail(row.id)
    const data = res?.data || row
    form.name = data.name
    form.slug = data.slug
    form.api_key = data.api_key
    form.description = data.description || ''
    form.platform = data.platform || 'windows'
    form.icon = data.icon || ''
    showAPIKey.value = false
    dialogVisible.value = true
  } catch (error) {
    ElMessage.error('获取软件信息失败')
  }
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
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(key)
      ElMessage.success('通讯密钥已复制')
    } else {
      const textArea = document.createElement('textarea')
      textArea.value = key
      textArea.style.position = 'fixed'
      textArea.style.left = '-9999px'
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      ElMessage.success('通讯密钥已复制')
    }
  } catch (err) {
    ElMessage.error('复制失败')
  }
}

// 生成随机 API Key
const generateAPIKey = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  form.api_key = result
  showAPIKey.value = true
  ElMessage.success('通讯密钥已生成')
}

// 图标上传前处理
const handleIconBeforeUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isImage) {
    ElMessage.error('只能上传图片文件!')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB!')
    return false
  }
  iconUploadProgress.value = 0 // 重置进度
  return true
}

// 图标上传进度
const handleIconProgress = (event) => {
  iconUploadProgress.value = Math.round(event.percent)
}

// 图标上传成功
const handleIconSuccess = (response) => {
  iconUploadProgress.value = 100 // 完成进度
  setTimeout(() => {
    iconUploadProgress.value = 0 // 3秒后隐藏进度条
  }, 1000)
  
  if (response.code === 0) {
    form.icon = response.data.url
    ElMessage.success('图标上传成功')
  } else {
    ElMessage.error(response.message || '上传失败')
  }
}

// 图标上传失败
const handleIconError = () => {
  iconUploadProgress.value = 0 // 重置进度
  ElMessage.error('上传失败，请检查存储配置')
}

// 提交表单
const handleSubmit = async () => {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return
  
  const submitData = {
    name: form.name,
    slug: form.slug,
    api_key: form.api_key,
    description: form.description,
    platform: form.platform,
    icon: form.icon
  }
  
  submitting.value = true
  try {
    if (isEdit.value) {
      await updateSoftware(editId.value, submitData)
      ElMessage.success('修改成功')
    } else {
      await createSoftware(submitData)
      ElMessage.success('创建成功')
    }
    dialogVisible.value = false
    fetchSoftwareList()
  } catch (error) {
    ElMessage.error(isEdit.value ? '修改失败' : '创建失败')
  } finally {
    submitting.value = false
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

/* 弹窗表单样式 */
.software-form {
  padding: 10px 0;
}

.api-key-input-group {
  display: flex;
  gap: 8px;
  align-items: center;
  width: 100%;
}

.api-key-input-group :deep(.el-input) {
  flex: 1;
  min-width: 200px;
}

.icon-wrapper {
  width: 100%;
}

.icon-wrapper .el-input {
  margin-top: 8px;
  width: 100%;
}

.icon-uploader {
  display: block;
}

.icon-uploader :deep(.el-upload) {
  display: block;
}

.icon-preview-box {
  width: 100px;
  height: 100px;
  border: 2px dashed #dcdfe6;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.3s;
}

.icon-preview-box:hover {
  border-color: #409eff;
}

.icon-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.icon-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  color: #909399;
  font-size: 12px;
}

/* 进度条样式 - 确保可见 */
.icon-wrapper :deep(.el-progress) {
  display: block !important;
  width: 100px;
  margin-top: 8px;
}

.icon-wrapper :deep(.el-progress-bar) {
  display: block !important;
  padding-right: 0;
}

.icon-wrapper :deep(.el-progress-bar__outer) {
  display: block !important;
  height: 6px !important;
  background-color: #ebeef5;
  border-radius: 3px;
}

.icon-wrapper :deep(.el-progress-bar__inner) {
  border-radius: 3px;
}

.icon-wrapper :deep(.el-progress__text) {
  display: none !important;
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