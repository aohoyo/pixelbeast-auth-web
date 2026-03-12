<template>
  <div class="software-add">
    <el-card>
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <el-button link @click="goBack">
              <el-icon><ArrowLeft /></el-icon>返回
            </el-button>
            <span class="title">新增软件</span>
          </div>
        </div>
      </template>
      
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
        class="software-form"
        style="max-width: 600px;"
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
        
        <el-form-item label="通讯密钥" prop="api_key" style="width: 100%;">
          <div class="api-key-input-group" style="display: flex; width: 100%;">
            <el-input
              v-model="form.api_key"
              :type="showAPIKey ? 'text' : 'password'"
              placeholder="点击生成按钮或手动输入密钥"
              style="flex: 1;"
            />
            <el-button type="primary" circle @click="generateAPIKey" :disabled="!!form.api_key" title="生成密钥">
              <el-icon><Key /></el-icon>
            </el-button>
            <el-button v-if="form.api_key" circle @click="copyAPIKey" title="复制密钥">
              <el-icon><CopyDocument /></el-icon>
            </el-button>
            <el-button v-if="form.api_key" circle @click="showAPIKey = !showAPIKey" :title="showAPIKey ? '隐藏' : '显示'">
              <el-icon><View v-if="!showAPIKey" /><Hide v-else /></el-icon>
            </el-button>
          </div>
        </el-form-item>
        
        <el-form-item label="软件图标" prop="icon">
          <div class="icon-wrapper">
            <!-- 预览图 -->
            <el-upload
              class="icon-uploader-inline"
              action="/api/v1/upload"
              :headers="uploadHeaders"
              :data="{ pathPrefix: 'software/icons' }"
              :auto-upload="true"
              accept="image/jpeg,image/png,image/gif,image/webp"
              :before-upload="handleIconBeforeUpload"
              :on-success="handleIconSuccess"
              :on-error="handleIconError"
            >
              <div class="icon-preview-box">
                <img v-if="form.icon" :src="form.icon" class="icon-img" alt="图标" />
                <div v-else class="icon-placeholder">
                  <el-icon :size="32"><Picture /></el-icon>
                  <span>点击上传</span>
                </div>
              </div>
            </el-upload>
            
            <!-- 右侧操作区 -->
            <div class="icon-actions">
              <el-input
                v-model="form.icon"
                placeholder="输入图标URL地址"
                clearable
                class="icon-url-input"
              />
              <div class="icon-buttons">
                <el-button size="small" @click="form.icon = ''" v-if="form.icon">
                  <el-icon><Delete /></el-icon>
                  清除
                </el-button>
              </div>
              <div class="icon-tip">建议尺寸 128x128，支持 JPG/PNG/GIF/WebP，最大 2MB</div>
            </div>
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
        
        <el-form-item>
          <el-button type="primary" :loading="submitting" @click="handleSubmit">
            创建软件
          </el-button>
          <el-button @click="goBack">取消</el-button>
        </el-form-item>
      </el-form>


    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { CopyDocument, Key, View, Hide, Picture, Delete } from '@element-plus/icons-vue'
import { createSoftware } from '@/api/software'

const router = useRouter()
const formRef = ref(null)
const submitting = ref(false)
const showAPIKeyDialog = ref(false)
const showAPIKey = ref(false)
const createdSoftware = reactive({
  slug: '',
  api_key: ''
})

const form = reactive({
  name: '',
  slug: '',
  api_key: '',
  description: '',
  platform: 'windows',
  icon: ''
})

// 上传请求头
const uploadHeaders = computed(() => {
  return {
    Authorization: 'Bearer ' + localStorage.getItem('token')
  }
})

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
  return true
}

// 图标上传成功
const handleIconSuccess = (response) => {
  if (response.code === 0) {
    form.icon = response.data.url
    ElMessage.success('图标上传成功')
  } else {
    ElMessage.error(response.message || '上传失败')
  }
}

// 图标上传失败
const handleIconError = () => {
  ElMessage.error('上传失败，请检查存储配置')
}

// 自动生成 slug
const generateSlug = () => {
  form.slug = 'app_' + Date.now()
}

// 初始化时生成 slug
generateSlug()

const rules = {
  name: [
    { required: true, message: '请输入软件名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  platform: [
    { required: true, message: '请选择平台', trigger: 'change' }
  ]
}

// 返回列表
const goBack = () => {
  router.push('/software/list')
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

// 复制 API Key
const copyAPIKey = async () => {
  if (!form.api_key) {
    ElMessage.warning('请先生成通讯密钥')
    return
  }
  
  try {
    // 优先使用现代 Clipboard API
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(form.api_key)
      ElMessage.success('通讯密钥已复制到剪贴板')
    } else {
      // 降级方案：使用 execCommand
      const textArea = document.createElement('textarea')
      textArea.value = form.api_key
      textArea.style.position = 'fixed'
      textArea.style.left = '-9999px'
      textArea.style.top = '-9999px'
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      
      const successful = document.execCommand('copy')
      document.body.removeChild(textArea)
      
      if (successful) {
        ElMessage.success('通讯密钥已复制到剪贴板')
      } else {
        throw new Error('execCommand failed')
      }
    }
  } catch (err) {
    console.error('复制失败:', err)
    ElMessage.error('复制失败，请手动复制')
  }
}

// 复制到剪贴板
const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
    ElMessage.success('已复制到剪贴板')
  } catch (err) {
    ElMessage.error('复制失败')
  }
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
    await createSoftware(submitData)
    ElMessage.success('创建成功')
    router.push('/software/list')
  } catch (error) {
    ElMessage.error('创建失败')
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.software-add {
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

.software-form {
  padding: 20px 0;
}

.icon-uploader {
  display: inline-block;
}

.icon-uploader :deep(.el-upload) {
  border: 1px dashed #d9d9d9;
  border-radius: 8px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: border-color 0.3s;
}

.icon-uploader :deep(.el-upload:hover) {
  border-color: #409eff;
}

.icon-preview {
  width: 100px;
  height: 100px;
  display: block;
  object-fit: cover;
}

.icon-upload-placeholder {
  width: 100px;
  height: 100px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #8c939d;
}

.icon-upload-placeholder .el-icon {
  font-size: 28px;
}

.upload-text {
  font-size: 12px;
  margin-top: 8px;
}

.upload-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 8px;
}

.api-key-input-group {
  display: flex;
  gap: 8px;
  align-items: center;
}

.api-key-input {
  flex: 1;
}

.api-key-input :deep(.el-input__inner) {
  font-family: monospace;
  letter-spacing: 1px;
}

.key-display {
  display: flex;
  align-items: center;
  gap: 8px;
}

.key-display code {
  font-family: monospace;
  background: #f5f5f5;
  padding: 4px 8px;
  border-radius: 4px;
  word-break: break-all;
}

/* 图标输入模式 */
.icon-input-mode {
  margin-bottom: 12px;
}

.icon-upload-area {
  display: inline-block;
}

.icon-url-area {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.icon-preview-wrapper {
  width: 100px;
  height: 100px;
  border: 1px dashed #d9d9d9;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.icon-preview-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 新图标样式 */
.icon-wrapper {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.icon-uploader-inline :deep(.el-upload) {
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
  flex-shrink: 0;
}

.icon-preview-box:hover {
  border-color: #409eff;
  background-color: #f5f7fa;
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
  gap: 8px;
  color: #909399;
  font-size: 12px;
}

.icon-actions {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.icon-url-input {
  width: 100%;
}

.icon-url-input :deep(.el-input__inner) {
  font-size: 13px;
}

.icon-buttons {
  display: flex;
  gap: 8px;
}

.icon-tip {
  font-size: 12px;
  color: #909399;
}
</style>