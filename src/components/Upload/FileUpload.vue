<template>
  <div class="file-upload">
    <el-upload
      class="upload-component"
      :action="uploadAction"
      :headers="uploadHeaders"
      :data="uploadData"
      :show-file-list="showFileList"
      :auto-upload="autoUpload"
      :accept="accept"
      :limit="limit"
      :multiple="multiple"
      :before-upload="handleBeforeUpload"
      :on-success="handleSuccess"
      :on-error="handleError"
      :on-change="handleChange"
      :on-exceed="handleExceed"
      :file-list="fileList"
    >
      <template v-if="type === 'image'">
        <div v-if="!modelValue" class="upload-placeholder">
          <el-icon :size="28"><Plus /></el-icon>
          <div class="upload-text">{{ placeholder }}</div>
        </div>
        <img v-else :src="modelValue" class="upload-preview" />
      </template>
      
      <template v-else-if="type === 'file'">
        <el-button type="primary">
          <el-icon><Upload /></el-icon>
          {{ placeholder }}
        </el-button>
      </template>
      
      <template v-else-if="type === 'drag'">
        <el-icon :size="40"><Upload /></el-icon>
        <div class="el-upload__text">
          将文件拖到此处，或<em>点击上传</em>
        </div>
      </template>
    </el-upload>
    
    <div v-if="tip" class="upload-tip">{{ tip }}</div>
    
    <!-- 文件列表显示 -->
    <div v-if="showFileList && fileList.length > 0" class="file-list">
      <div v-for="file in fileList" :key="file.uid" class="file-item">
        <el-icon><Document /></el-icon>
        <span class="file-name">{{ file.name }}</span>
        <el-icon class="file-delete" @click="removeFile(file)"><Close /></el-icon>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, Upload, Document, Close } from '@element-plus/icons-vue'
import { getUploadToken } from '@/api/upload'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    default: 'image', // image, file, drag
    validator: (value) => ['image', 'file', 'drag'].includes(value)
  },
  accept: {
    type: String,
    default: ''
  },
  limit: {
    type: Number,
    default: 1
  },
  multiple: {
    type: Boolean,
    default: false
  },
  autoUpload: {
    type: Boolean,
    default: true
  },
  showFileList: {
    type: Boolean,
    default: false
  },
  placeholder: {
    type: String,
    default: '点击上传'
  },
  tip: {
    type: String,
    default: ''
  },
  maxSize: {
    type: Number,
    default: 10 // MB
  },
  // 存储类型：user(用户配置) / system(系统配置)
  storageType: {
    type: String,
    default: 'user'
  },
  // 上传路径前缀
  pathPrefix: {
    type: String,
    default: 'uploads'
  }
})

const emit = defineEmits(['update:modelValue', 'success', 'error', 'change'])

const fileList = ref([])
const uploadToken = ref('')
const uploadData = ref({})

// 上传地址 - 使用后端直传接口
const uploadAction = computed(() => {
  return '/api/v1/upload'
})

const uploadHeaders = computed(() => {
  return {
    'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
  }
})

// 上传前处理
const handleBeforeUpload = async (file) => {
  // 检查文件大小
  const isLtMaxSize = file.size / 1024 / 1024 < props.maxSize
  if (!isLtMaxSize) {
    ElMessage.error(`文件大小不能超过 ${props.maxSize}MB`)
    return false
  }
  
  // 获取上传凭证
  try {
    const res = await getUploadToken({
      filename: file.name,
      pathPrefix: props.pathPrefix,
      storageType: props.storageType
    })
    uploadData.value = res.data
    return true
  } catch (error) {
    ElMessage.error('获取上传凭证失败')
    return false
  }
}

// 上传成功
const handleSuccess = (response, file) => {
  if (response.code === 0) {
    const url = response.data.url
    emit('update:modelValue', url)
    emit('success', { url, response, file })
    ElMessage.success('上传成功')
  } else {
    ElMessage.error(response.message || '上传失败')
    emit('error', { response, file })
  }
}

// 上传失败
const handleError = (error, file) => {
  ElMessage.error('上传失败')
  emit('error', { error, file })
}

// 文件改变
const handleChange = (file, files) => {
  fileList.value = files
  emit('change', { file, files })
}

// 超出限制
const handleExceed = () => {
  ElMessage.warning(`最多只能上传 ${props.limit} 个文件`)
}

// 移除文件
const removeFile = (file) => {
  const index = fileList.value.indexOf(file)
  if (index > -1) {
    fileList.value.splice(index, 1)
  }
  if (props.modelValue && file.url === props.modelValue) {
    emit('update:modelValue', '')
  }
}
</script>

<style scoped>
.file-upload {
  display: inline-block;
}

.upload-component :deep(.el-upload) {
  border: 1px dashed #d9d9d9;
  border-radius: 8px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: border-color 0.3s;
}

.upload-component :deep(.el-upload:hover) {
  border-color: #409eff;
}

.upload-placeholder {
  width: 120px;
  height: 120px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #8c939d;
}

.upload-text {
  font-size: 12px;
  margin-top: 8px;
}

.upload-preview {
  width: 120px;
  height: 120px;
  display: block;
  object-fit: cover;
}

.upload-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 8px;
}

/* 拖拽上传样式 */
.upload-component[type="drag"] :deep(.el-upload) {
  width: 360px;
  height: 180px;
}

.upload-component[type="drag"] :deep(.el-upload-dragger) {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

/* 文件列表 */
.file-list {
  margin-top: 12px;
}

.file-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #f5f7fa;
  border-radius: 4px;
  margin-bottom: 8px;
}

.file-name {
  flex: 1;
  font-size: 14px;
  color: #606266;
}

.file-delete {
  cursor: pointer;
  color: #909399;
}

.file-delete:hover {
  color: #f56c6c;
}
</style>
