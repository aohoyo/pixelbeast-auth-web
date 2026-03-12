<template>
  <div class="storage-upload">
    <!-- 上传模式切换 -->
    <div class="upload-mode-tabs">
      <el-radio-group v-model="uploadMode" size="small">
        <el-radio-button label="file">上传文件</el-radio-button>
        <el-radio-button label="folder">上传文件夹</el-radio-button>
      </el-radio-group>
    </div>
    
    <!-- 文件上传 -->
    <el-upload
      v-if="uploadMode === 'file'"
      ref="uploadRef"
      class="upload-area"
      action="#"
      :auto-upload="false"
      :multiple="true"
      :accept="accept"
      :limit="100"
      :on-change="handleFileChange"
      :on-exceed="handleExceed"
      drag
    >
      <el-icon class="el-icon--upload" :size="64"><UploadFilled /></el-icon>
      <div class="el-upload__text">
        将文件拖到此处，或<em>点击上传</em>
      </div>
      <template #tip>
        <div class="el-upload__tip">
          {{ tipText }}
        </div>
      </template>
    </el-upload>
    
    <!-- 文件夹上传 -->
    <div v-else class="folder-upload-area">
      <input
        ref="folderInput"
        type="file"
        webkitdirectory
        directory
        multiple
        style="display: none"
        @change="handleFolderSelect"
      />
      <div class="folder-drop-zone" @click="selectFolder" @drop.prevent="handleFolderDrop" @dragover.prevent>
        <el-icon :size="64"><FolderOpened /></el-icon>
        <div class="folder-upload-text">
          点击选择文件夹，或拖拽文件夹到此处
        </div>
        <div class="folder-upload-tip">
          支持上传整个文件夹，最多100个文件
        </div>
      </div>
    </div>
    
    <!-- 文件列表 -->
    <div v-if="fileList.length > 0" class="upload-file-list">
      <div v-for="(file, index) in fileList" :key="index" class="upload-file-item">
        <div class="file-info">
          <el-icon :size="20"><Document /></el-icon>
          <span class="file-name">{{ file.name }}</span>
          <span class="file-size">({{ formatFileSize(file.size) }})</span>
        </div>
        <div class="file-status">
          <el-progress 
            v-if="file.status === 'uploading'" 
            :percentage="file.progress" 
            :stroke-width="4"
            class="upload-progress"
          />
          <el-icon v-else-if="file.status === 'success'" class="status-icon success"><CircleCheck /></el-icon>
          <el-icon v-else-if="file.status === 'error'" class="status-icon error"><CircleClose /></el-icon>
          <el-icon v-else class="status-icon pending"><Clock /></el-icon>
        </div>
        <el-icon class="delete-btn" @click="removeFile(index)"><Close /></el-icon>
      </div>
    </div>
    
    <!-- 上传按钮 -->
    <div v-if="fileList.length > 0" class="upload-actions">
      <el-button @click="clearFiles">清空列表</el-button>
      <el-button type="primary" :loading="isUploading" @click="startUpload">
        {{ isUploading ? '上传中...' : '开始上传' }}
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { UploadFilled, Document, Close, CircleCheck, CircleClose, Clock, FolderOpened } from '@element-plus/icons-vue'
import { getUploadToken } from '@/api/upload'

const props = defineProps({
  pathPrefix: {
    type: String,
    default: 'files'
  },
  accept: {
    type: String,
    default: '*'
  },
  maxSize: {
    type: Number,
    default: 100 // MB
  },
  maxFiles: {
    type: Number,
    default: 100 // 最大文件数
  }
})

const emit = defineEmits(['success', 'error', 'progress'])

const uploadRef = ref(null)
const folderInput = ref(null)
const fileList = ref([])
const isUploading = ref(false)
const uploadMode = ref('file') // 'file' 或 'folder'

const tipText = computed(() => {
  return `支持任意类型文件，单个文件最大 ${props.maxSize}MB，最多 ${props.maxFiles} 个文件`
})

// 选择文件夹
const selectFolder = () => {
  folderInput.value?.click()
}

// 处理文件夹选择
const handleFolderSelect = (event) => {
  const files = Array.from(event.target.files)
  addFiles(files)
}

// 处理文件夹拖拽
const handleFolderDrop = (event) => {
  const items = event.dataTransfer.items
  if (items) {
    const files = []
    for (let i = 0; i < items.length; i++) {
      const item = items[i].webkitGetAsEntry()
      if (item) {
        traverseFileTree(item, files)
      }
    }
  }
}

// 遍历文件树
const traverseFileTree = (item, files) => {
  if (item.isFile) {
    item.file((file) => {
      files.push(file)
      if (files.length > props.maxFiles) {
        ElMessage.warning(`最多只能选择 ${props.maxFiles} 个文件`)
        return
      }
      addFiles([file])
    })
  } else if (item.isDirectory) {
    const dirReader = item.createReader()
    dirReader.readEntries((entries) => {
      for (let i = 0; i < entries.length; i++) {
        traverseFileTree(entries[i], files)
      }
    })
  }
}

// 处理文件选择
const handleFileChange = (uploadFile) => {
  const file = uploadFile.raw
  addFiles([file])
}

// 添加文件到列表
const addFiles = (files) => {
  for (const file of files) {
    // 检查文件数量限制
    if (fileList.value.length >= props.maxFiles) {
      ElMessage.warning(`最多只能上传 ${props.maxFiles} 个文件`)
      break
    }
    
    // 检查文件大小
    if (file.size > props.maxSize * 1024 * 1024) {
      ElMessage.error(`文件 ${file.name} 超过 ${props.maxSize}MB 限制`)
      continue
    }
    
    // 检查是否已存在
    const exists = fileList.value.some(f => f.name === file.name && f.size === file.size)
    if (exists) {
      continue
    }
    
    // 添加到列表
    fileList.value.push({
      name: file.name,
      size: file.size,
      raw: file,
      status: 'pending',
      progress: 0
    })
  }
}

// 处理超出限制
const handleExceed = () => {
  ElMessage.warning(`最多只能上传 ${props.maxFiles} 个文件`)
}

// 移除文件
const removeFile = (index) => {
  fileList.value.splice(index, 1)
}

// 清空文件
const clearFiles = () => {
  fileList.value = []
  uploadRef.value?.clearFiles()
}

// 开始上传
const startUpload = async () => {
  if (fileList.value.length === 0) return
  
  isUploading.value = true
  
  for (let i = 0; i < fileList.value.length; i++) {
    const fileItem = fileList.value[i]
    if (fileItem.status === 'success') continue
    
    fileItem.status = 'uploading'
    fileItem.progress = 0
    
    try {
      // 1. 获取上传凭证
      console.log('Getting upload token for:', fileItem.name)
      const tokenRes = await getUploadToken({
        filename: fileItem.name,
        pathPrefix: props.pathPrefix,
        storageType: 'user'
      })
      
      console.log('Token response:', tokenRes)
      
      if (tokenRes.code !== 0) {
        throw new Error(tokenRes.message || '获取上传凭证失败')
      }
      
      const token = tokenRes.data
      console.log('Got token:', token)
      
      // 2. 根据存储类型选择上传方式
      let url
      console.log('Storage type:', token.storageType)
      console.log('Token:', token)
      
      try {
        switch (token.storageType) {
          case 'aliyun':
            url = await uploadToAliyun(fileItem, token)
            break
          case 'tencent':
            url = await uploadToTencent(fileItem, token)
            break
          case 'qiniu':
            url = await uploadToQiniu(fileItem, token)
            break
          case 'minio':
            url = await uploadToMinio(fileItem, token)
            break
          default:
            // 默认使用后端直传
            url = await uploadViaBackend(fileItem)
        }
      } catch (uploadError) {
        console.error('Upload error:', uploadError)
        throw uploadError
      }
      
      fileItem.status = 'success'
      fileItem.progress = 100
      fileItem.url = url
      
      emit('success', { file: fileItem, url })
    } catch (error) {
      fileItem.status = 'error'
      fileItem.error = error.message
      emit('error', { file: fileItem, error })
      ElMessage.error(`上传 ${fileItem.name} 失败: ${error.message}`)
    }
  }
  
  isUploading.value = false
  
  // 检查是否全部上传成功
  const allSuccess = fileList.value.every(f => f.status === 'success')
  if (allSuccess) {
    ElMessage.success('全部上传成功')
    // 延迟清空
    setTimeout(() => {
      clearFiles()
    }, 1500)
  }
}

// 上传到阿里云OSS
const uploadToAliyun = async (fileItem, token) => {
  const formData = new FormData()
  formData.append('key', token.key)
  formData.append('policy', token.policy)
  formData.append('OSSAccessKeyId', token.accessKeyId)
  formData.append('signature', token.signature)
  formData.append('file', fileItem.raw)
  
  const response = await fetch(token.url, {
    method: 'POST',
    body: formData
  })
  
  if (!response.ok) {
    throw new Error('上传失败')
  }
  
  return token.url + '/' + token.key
}

// 上传到腾讯云COS
const uploadToTencent = async (fileItem, token) => {
  const formData = new FormData()
  formData.append('key', token.key)
  formData.append('policy', token.policy)
  formData.append('q-sign-algorithm', token.signAlgorithm)
  formData.append('q-ak', token.accessKeyId)
  formData.append('q-key-time', token.keyTime)
  formData.append('q-signature', token.signature)
  formData.append('file', fileItem.raw)
  
  const response = await fetch(token.url, {
    method: 'POST',
    body: formData
  })
  
  if (!response.ok) {
    throw new Error('上传失败')
  }
  
  return token.url + '/' + token.key
}

// 上传到七牛云
const uploadToQiniu = async (fileItem, token) => {
  const formData = new FormData()
  formData.append('key', token.key)
  formData.append('token', token.token)
  formData.append('file', fileItem.raw)
  
  const response = await fetch(token.url, {
    method: 'POST',
    body: formData
  })
  
  if (!response.ok) {
    throw new Error('上传失败')
  }
  
  const result = await response.json()
  return token.domain + '/' + result.key
}

// 上传到MinIO
const uploadToMinio = async (fileItem, token) => {
  const response = await fetch(token.url, {
    method: 'PUT',
    headers: {
      'Content-Type': fileItem.raw.type || 'application/octet-stream'
    },
    body: fileItem.raw
  })
  
  if (!response.ok) {
    throw new Error('上传失败')
  }
  
  return token.url
}

// 通过后端直传（备用方案）
const uploadViaBackend = async (fileItem) => {
  const formData = new FormData()
  formData.append('file', fileItem.raw)
  formData.append('pathPrefix', props.pathPrefix)
  
  const response = await fetch('/api/v1/upload', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + localStorage.getItem('token')
    },
    body: formData
  })
  
  const result = await response.json()
  if (result.code !== 0) {
    throw new Error(result.message || '上传失败')
  }
  
  return result.data.url
}

// 格式化文件大小
const formatFileSize = (size) => {
  if (size < 1024) return size + ' B'
  if (size < 1024 * 1024) return (size / 1024).toFixed(2) + ' KB'
  if (size < 1024 * 1024 * 1024) return (size / 1024 / 1024).toFixed(2) + ' MB'
  return (size / 1024 / 1024 / 1024).toFixed(2) + ' GB'
}

// 暴露方法
defineExpose({
  clearFiles
})
</script>

<style scoped>
.storage-upload {
  width: 100%;
}

.upload-area :deep(.el-upload-dragger) {
  width: 100%;
}

.upload-file-list {
  margin-top: 16px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 12px;
}

.upload-file-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
  border-bottom: 1px solid #ebeef5;
}

.upload-file-item:last-child {
  border-bottom: none;
}

.file-info {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  overflow: hidden;
}

.file-name {
  font-size: 14px;
  color: #303133;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.file-size {
  font-size: 12px;
  color: #909399;
}

.file-status {
  width: 120px;
}

.upload-progress {
  margin: 0;
}

.status-icon {
  font-size: 20px;
}

.status-icon.success {
  color: #67c23a;
}

.status-icon.error {
  color: #f56c6c;
}

.status-icon.pending {
  color: #909399;
}

.delete-btn {
  cursor: pointer;
  color: #909399;
  font-size: 16px;
}

.delete-btn:hover {
  color: #f56c6c;
}

.upload-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 16px;
}

/* 上传模式切换 */
.upload-mode-tabs {
  margin-bottom: 16px;
  text-align: center;
}

/* 文件夹上传 */
.folder-upload-area {
  width: 100%;
}

.folder-drop-zone {
  border: 2px dashed #dcdfe6;
  border-radius: 8px;
  padding: 40px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
}

.folder-drop-zone:hover {
  border-color: #409eff;
  background-color: #f5f7fa;
}

.folder-upload-text {
  margin-top: 16px;
  font-size: 14px;
  color: #606266;
}

.folder-upload-tip {
  margin-top: 8px;
  font-size: 12px;
  color: #909399;
}
</style>
