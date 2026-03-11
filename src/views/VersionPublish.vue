<template>
  <div class="version-publish">
    <el-card>
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <el-button type="primary" text @click="handleBack">
              <el-icon><ArrowLeft /></el-icon>返回
            </el-button>
            <span class="title">{{ isEdit ? '编辑版本' : '发布版本' }}</span>
          </div>
        </div>
      </template>
      
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="120px"
        class="version-form"
      >
        <el-row :gutter="20">
          <el-col :xs="24" :md="12">
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
          <el-col :xs="24" :md="12">
            <el-form-item label="版本号" prop="version">
              <el-input
                v-model="form.version"
                placeholder="如：v1.0.0"
                :disabled="isEdit"
              />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :xs="24" :md="12">
            <el-form-item label="渠道" prop="channel">
              <el-select v-model="form.channel" placeholder="选择发布渠道" style="width: 100%">
                <el-option label="稳定版" value="stable" />
                <el-option label="测试版" value="beta" />
                <el-option label="内测版" value="alpha" />
                <el-option label="开发版" value="dev" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :md="12">
            <el-form-item label="状态" prop="status">
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
            placeholder="请输入更新日志，支持 Markdown 格式"
            maxlength="2000"
            show-word-limit
          />
        </el-form-item>
        
        <el-form-item label="版本截图" prop="screenshots">
          <el-upload
            class="screenshot-uploader"
            action="#"
            list-type="picture-card"
            :multiple="true"
            :auto-upload="false"
            :on-change="handleScreenshotChange"
            :on-remove="handleScreenshotRemove"
            :file-list="screenshotList"
          >
            <el-icon><Plus /></el-icon>
          </el-upload>
          <div class="upload-tip">支持多张截图，建议尺寸 1920x1080</div>
        </el-form-item>
        
        <el-form-item label="安装包" prop="package_url">
          <el-upload
            class="package-uploader"
            drag
            action="#"
            :auto-upload="false"
            :on-change="handleFileChange"
            :show-file-list="true"
            :limit="1"
            accept=".exe,.dmg,.zip,.apk,.ipa"
          >
            <el-icon class="el-icon--upload"><Upload /></el-icon>
            <div class="el-upload__text">
              将文件拖到此处，或 <em>点击上传</em>
            </div>
            <template #tip>
              <div class="el-upload__tip">
                支持 .exe, .dmg, .zip, .apk, .ipa 格式，单个文件不超过 500MB
              </div>
            </template>
          </el-upload>
          <el-input
            v-if="form.package_url"
            v-model="form.package_url"
            placeholder="或输入外部下载链接"
            style="margin-top: 12px"
          />
        </el-form-item>
        
        <el-form-item label="附加信息">
          <el-card class="config-card" shadow="never">
            <el-row :gutter="20">
              <el-col :xs="24" :md="12">
                <el-form-item label="最低版本" label-width="100px">
                  <el-input v-model="form.min_version" placeholder="如：v1.0.0" />
                </el-form-item>
              </el-col>
              <el-col :xs="24" :md="12">
                <el-form-item label="文件大小" label-width="100px">
                  <el-input v-model="form.file_size" placeholder="自动计算" disabled>
                    <template #append>MB</template>
                  </el-input>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :xs="24" :md="12">
                <el-form-item label="MD5" label-width="100px">
                  <el-input v-model="form.md5" placeholder="自动计算" disabled />
                </el-form-item>
              </el-col>
              <el-col :xs="24" :md="12">
                <el-form-item label="SHA256" label-width="100px">
                  <el-input v-model="form.sha256" placeholder="自动计算" disabled />
                </el-form-item>
              </el-col>
            </el-row>
            <el-form-item label="强制更新" label-width="100px">
              <el-switch v-model="form.force_update" />
            </el-form-item>
          </el-card>
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" :loading="submitting" @click="handleSubmit">
            {{ isEdit ? '保存修改' : '发布版本' }}
          </el-button>
          <el-button @click="handleSaveDraft" :loading="submitting">
            保存草稿
          </el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    
    <!-- 版本详情展示（只读模式） -->
    <el-card v-if="isDetail" class="detail-card">
      <template #header>
        <span>版本详情</span>
      </template>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="软件">{{ detailInfo.software_name }}</el-descriptions-item>
        <el-descriptions-item label="版本号">{{ detailInfo.version }}</el-descriptions-item>
        <el-descriptions-item label="渠道">{{ getChannelLabel(detailInfo.channel) }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusType(detailInfo.status)">
            {{ getStatusLabel(detailInfo.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="下载量">{{ detailInfo.download_count || 0 }}</el-descriptions-item>
        <el-descriptions-item label="发布时间">{{ formatDate(detailInfo.publish_time) }}</el-descriptions-item>
        <el-descriptions-item label="文件大小">{{ detailInfo.file_size || '-' }}</el-descriptions-item>
        <el-descriptions-item label="MD5">{{ detailInfo.md5 || '-' }}</el-descriptions-item>
        <el-descriptions-item label="更新日志" :span="2">
          <pre class="changelog-content">{{ detailInfo.changelog || '-' }}</pre>
        </el-descriptions-item>
      </el-descriptions>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { publishVersion, updateVersion, getVersionDetail } from '@/api/version'
import { getSoftwareList } from '@/api/software'

const route = useRoute()
const router = useRouter()
const formRef = ref(null)

const isEdit = computed(() => !!route.query.id)
const isDetail = computed(() => route.path.includes('/detail/'))
const versionId = computed(() => route.params.id || route.query.id)

const submitting = ref(false)
const softwareOptions = ref([])
const detailInfo = ref({})
const uploadFile = ref(null)
const screenshotList = ref([])

const form = reactive({
  software_id: '',
  version: '',
  channel: 'stable',
  status: 'draft',
  changelog: '',
  screenshots: [],
  package_url: '',
  min_version: '',
  file_size: '',
  md5: '',
  sha256: '',
  force_update: false
})

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

// 获取版本详情
const fetchVersionDetail = async () => {
  if (!versionId.value) return
  
  try {
    const res = await getVersionDetail(versionId.value)
    detailInfo.value = res
    Object.assign(form, res)
  } catch (error) {
    // 模拟数据
    detailInfo.value = {
      id: 1,
      software_id: 1,
      software_name: '客户端A',
      version: 'v2.1.0',
      channel: 'stable',
      status: 'published',
      changelog: '## 更新内容\n\n- 修复已知问题\n- 优化性能\n- 新增暗黑模式',
      download_count: 12580,
      publish_time: '2024-01-15T10:30:00',
      file_size: '45.2 MB',
      md5: 'a1b2c3d4e5f6...',
      sha256: 'abcdef123456...',
      force_update: false
    }
    if (!isDetail.value) {
      Object.assign(form, detailInfo.value)
    }
  }
}

// 文件选择
const handleFileChange = (file) => {
  uploadFile.value = file.raw
  // 模拟计算文件大小
  const size = file.size / 1024 / 1024
  form.file_size = size.toFixed(2)
  // 模拟计算 MD5/SHA256
  form.md5 = '计算中...'
  form.sha256 = '计算中...'
}

// 处理截图选择
const handleScreenshotChange = (file, fileList) => {
  // TODO: 实际上传逻辑后续完善
  // 这里先用本地预览
  const reader = new FileReader()
  reader.onload = (e) => {
    form.screenshots.push(e.target.result)
  }
  reader.readAsDataURL(file.raw)
}

// 处理截图移除
const handleScreenshotRemove = (file, fileList) => {
  const index = form.screenshots.findIndex(url => url === file.url)
  if (index > -1) {
    form.screenshots.splice(index, 1)
  }
}

// 提交表单
const handleSubmit = async () => {
  if (isDetail.value) return
  
  const valid = await formRef.value.validate()
  if (!valid) return
  
  submitting.value = true
  try {
    const data = { ...form }
    if (isEdit.value) {
      await updateVersion(versionId.value, data)
      ElMessage.success('更新成功')
    } else {
      await publishVersion(data)
      ElMessage.success('发布成功')
    }
    router.push('/versions')
  } catch (error) {
    ElMessage.error(isEdit.value ? '更新失败' : '发布失败')
  } finally {
    submitting.value = false
  }
}

// 保存草稿
const handleSaveDraft = async () => {
  if (isDetail.value) return
  
  form.status = 'draft'
  await handleSubmit()
}

// 重置表单
const handleReset = () => {
  if (isDetail.value) return
  formRef.value.resetFields()
  uploadFile.value = null
}

// 返回
const handleBack = () => {
  router.back()
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

// 格式化日期
const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleString('zh-CN')
}

onMounted(() => {
  fetchSoftwareOptions()
  fetchVersionDetail()
})
</script>

<style scoped>
.version-publish {
  padding: 0;
}

.card-header {
  display: flex;
  align-items: center;
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

.version-form {
  max-width: 900px;
}

.config-card {
  background: #f9fafb;
}

.package-uploader {
  width: 100%;
}

.package-uploader :deep(.el-upload-dragger) {
  width: 100%;
  height: 180px;
}

.detail-card {
  margin-top: 20px;
}

.changelog-content {
  white-space: pre-wrap;
  margin: 0;
  font-family: inherit;
  font-size: 14px;
  line-height: 1.6;
  color: #374151;
}

.screenshot-uploader :deep(.el-upload--picture-card) {
  width: 120px;
  height: 120px;
}

.screenshot-uploader :deep(.el-upload-list--picture-card .el-upload-list__item) {
  width: 120px;
  height: 120px;
}

.upload-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 8px;
}
</style>
