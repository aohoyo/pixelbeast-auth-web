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
              style="width: 160px"
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
              style="width: 100px"
              @change="handleStatusChange"
            >
              <el-option label="已发布" value="published" />
              <el-option label="草稿" value="draft" />
            </el-select>
            <el-button type="primary" @click="handleCreate">
              <el-icon><Plus /></el-icon>发布版本
            </el-button>
          </div>
        </div>
      </template>
      
      <el-table
        :data="versionList"
        v-loading="loading"
        stripe
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
        <el-table-column prop="channel" label="渠道" width="90">
          <template #default="{ row }">
            <el-tag :type="getChannelType(row.channel)" size="small">
              {{ getChannelLabel(row.channel) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="changelog" label="更新日志" min-width="180" show-overflow-tooltip />
        <el-table-column prop="download_count" label="下载量" width="90" align="right">
          <template #default="{ row }">
            {{ formatNumber(row.download_count) }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="90" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">
              {{ getStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" width="150">
          <template #default="{ row }">
            {{ formatDate(row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)">
              <el-icon><Edit /></el-icon>编辑
            </el-button>
            <el-button type="primary" link @click="handleDownload(row)">
              <el-icon><Download /></el-icon>下载
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
    
    <!-- 新增/编辑版本弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑版本' : '发布新版本'"
      width="700px"
      :close-on-click-modal="false"
      destroy-on-close
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
        class="version-form"
      >
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="选择软件" prop="software_id">
              <el-select
                v-model="form.software_id"
                placeholder="请选择软件"
                style="width: 100%"
                :disabled="isEdit"
              >
                <el-option
                  v-for="item in softwareOptions"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="版本号" prop="version">
              <el-input
                v-model="form.version"
                placeholder="如：v1.0.0"
                :disabled="isEdit"
              />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="发布渠道" prop="channel">
              <el-select v-model="form.channel" placeholder="选择渠道" style="width: 100%">
                <el-option label="稳定版" value="stable" />
                <el-option label="测试版" value="beta" />
                <el-option label="内测版" value="alpha" />
                <el-option label="开发版" value="dev" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态">
              <el-radio-group v-model="form.status">
                <el-radio label="draft">草稿</el-radio>
                <el-radio label="published">发布</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item label="更新日志" prop="changelog">
          <el-input
            v-model="form.changelog"
            type="textarea"
            :rows="4"
            placeholder="请输入更新日志"
            maxlength="2000"
            show-word-limit
          />
        </el-form-item>
        
        <el-form-item label="安装包">
          <div class="upload-area">
            <el-upload
              ref="uploadRef"
              :action="uploadAction"
              :headers="uploadHeaders"
              :data="{ pathPrefix: 'packages' }"
              :on-success="handleUploadSuccess"
              :on-error="handleUploadError"
              :before-upload="beforeUpload"
              :show-file-list="true"
              :limit="1"
              :file-list="fileList"
              accept=".exe,.dmg,.zip,.apk,.ipa"
            >
              <el-button type="primary">
                <el-icon><Upload /></el-icon>选择文件
              </el-button>
              <template #tip>
                <div class="upload-tip">支持 .exe, .dmg, .zip, .apk, .ipa 格式</div>
              </template>
            </el-upload>
            <el-input
              v-if="form.package_url"
              v-model="form.package_url"
              placeholder="或输入外部下载链接"
              style="margin-top: 12px"
              clearable
            />
          </div>
        </el-form-item>
        
        <el-form-item label="附加选项">
          <div class="extra-options">
            <el-checkbox v-model="form.force_update">强制更新</el-checkbox>
            <el-input
              v-model="form.min_version"
              placeholder="最低版本要求（可选）"
              style="width: 200px; margin-left: 16px"
            />
          </div>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button @click="handleSaveDraft" :loading="submitting">保存草稿</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">
          {{ isEdit ? '保存修改' : '发布版本' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getVersionList, getVersionDetail, publishVersion, updateVersion, deleteVersion } from '@/api/version'
import { getSoftwareList } from '@/api/software'

const route = useRoute()

const loading = ref(false)
const versionList = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const selectedSoftware = ref(route.query.software_id || '')
const selectedStatus = ref('')
const softwareOptions = ref([])

// 弹窗相关
const dialogVisible = ref(false)
const isEdit = ref(false)
const editId = ref(null)
const formRef = ref(null)
const uploadRef = ref(null)
const submitting = ref(false)
const fileList = ref([])

const form = reactive({
  software_id: '',
  version: '',
  channel: 'stable',
  status: 'published',
  changelog: '',
  package_url: '',
  file_size: 0,
  min_version: '',
  force_update: false
})

// 上传配置
const uploadAction = computed(() => '/api/v1/upload')
const uploadHeaders = computed(() => ({
  Authorization: 'Bearer ' + localStorage.getItem('token')
}))

const rules = {
  software_id: [
    { required: true, message: '请选择软件', trigger: 'change' }
  ],
  version: [
    { required: true, message: '请输入版本号', trigger: 'blur' },
    { pattern: /^v?\d+\.\d+\.\d+/, message: '版本号格式不正确', trigger: 'blur' }
  ],
  channel: [
    { required: true, message: '请选择渠道', trigger: 'change' }
  ],
  changelog: [
    { required: true, message: '请输入更新日志', trigger: 'blur' }
  ]
}

// 重置表单
const resetForm = () => {
  form.software_id = ''
  form.version = ''
  form.channel = 'stable'
  form.status = 'published'
  form.changelog = ''
  form.package_url = ''
  form.file_size = 0
  form.min_version = ''
  form.force_update = false
  fileList.value = []
}

// 获取软件选项
const fetchSoftwareOptions = async () => {
  try {
    const res = await getSoftwareList({ page: 1, page_size: 100 })
    softwareOptions.value = res?.data?.list || []
  } catch (error) {
    softwareOptions.value = []
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
    versionList.value = res?.data?.list || []
    total.value = res?.data?.total || 0
  } catch (error) {
    versionList.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

// 创建版本
const handleCreate = () => {
  isEdit.value = false
  editId.value = null
  resetForm()
  // 如果有选中的软件，自动填充
  if (selectedSoftware.value) {
    form.software_id = selectedSoftware.value
  }
  dialogVisible.value = true
}

// 编辑版本
const handleEdit = async (row) => {
  isEdit.value = true
  editId.value = row.id
  
  try {
    const res = await getVersionDetail(row.id)
    const data = res?.data || row
    form.software_id = data.software_id
    form.version = data.version
    form.channel = data.channel || 'stable'
    form.status = data.status || 'draft'
    form.changelog = data.changelog || ''
    form.package_url = data.package_url || ''
    form.file_size = data.file_size || 0
    form.min_version = data.min_version || ''
    form.force_update = data.force_update || false
    dialogVisible.value = true
  } catch (error) {
    ElMessage.error('获取版本信息失败')
  }
}

// 上传前校验
const beforeUpload = (file) => {
  const isLt500M = file.size / 1024 / 1024 < 500
  if (!isLt500M) {
    ElMessage.error('文件大小不能超过 500MB')
    return false
  }
  return true
}

// 上传成功
const handleUploadSuccess = (response) => {
  if (response.code === 0) {
    form.package_url = response.data.url
    form.file_size = response.data.size || 0
    ElMessage.success('上传成功')
  } else {
    ElMessage.error(response.msg || '上传失败')
  }
}

// 上传失败
const handleUploadError = () => {
  ElMessage.error('上传失败，请检查存储配置')
}

// 提交表单
const handleSubmit = async () => {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return
  
  submitting.value = true
  try {
    const data = { ...form }
    if (isEdit.value) {
      await updateVersion(editId.value, data)
      ElMessage.success('更新成功')
    } else {
      await publishVersion(data)
      ElMessage.success('发布成功')
    }
    dialogVisible.value = false
    fetchVersionList()
  } catch (error) {
    ElMessage.error(isEdit.value ? '更新失败' : '发布失败')
  } finally {
    submitting.value = false
  }
}

// 保存草稿
const handleSaveDraft = async () => {
  form.status = 'draft'
  await handleSubmit()
}

// 下载版本
const handleDownload = (row) => {
  if (row.package_url) {
    window.open(row.package_url, '_blank')
  } else {
    ElMessage.warning('暂无下载链接')
  }
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
    draft: 'info'
  }
  return map[status] || 'info'
}

// 获取状态标签
const getStatusLabel = (status) => {
  const map = {
    published: '已发布',
    draft: '草稿'
  }
  return map[status] || status
}

// 格式化数字
const formatNumber = (num) => {
  if (!num) return '0'
  if (num >= 10000) return (num / 10000).toFixed(1) + 'w'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'k'
  return num.toString()
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

/* 弹窗表单样式 */
.version-form {
  padding: 10px 0;
}

.upload-area {
  width: 100%;
}

.upload-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 8px;
}

.extra-options {
  display: flex;
  align-items: center;
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