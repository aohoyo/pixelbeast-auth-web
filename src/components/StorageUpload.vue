<template>
  <div class="storage-upload">
    <el-upload
      ref="uploadRef"
      class="upload-area"
      action="/api/v1/upload"
      :headers="uploadHeaders"
      :data="{ pathPrefix: props.pathPrefix }"
      :multiple="true"
      :limit="100"
      :auto-upload="true"
      :before-upload="handleBeforeUpload"
      :on-success="handleSuccess"
      :on-error="handleError"
      :on-change="handleChange"
      drag
    >
      <el-icon class="el-icon--upload" :size="64"><UploadFilled /></el-icon>
      <div class="el-upload__text">
        将文件拖到此处，或<em>点击上传</em>
      </div>
      <template #tip>
        <div class="el-upload__tip">
          支持任意类型文件，单个文件最大 100MB
        </div>
      </template>
    </el-upload>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { UploadFilled } from '@element-plus/icons-vue'
import { createFile } from '@/api/file'

const props = defineProps({
  pathPrefix: {
    type: String,
    default: 'files'
  }
})

const emit = defineEmits(['success'])

const uploadRef = ref(null)

const uploadHeaders = computed(() => {
  return {
    Authorization: 'Bearer ' + localStorage.getItem('token')
  }
})

const handleBeforeUpload = (file) => {
  const maxSize = 100 * 1024 * 1024 // 100MB
  if (file.size > maxSize) {
    ElMessage.error('文件大小不能超过 100MB')
    return false
  }
  return true
}

const handleSuccess = async (response, file) => {
  if (response.code === 0) {
    // 创建文件记录
    try {
      await createFile({
        name: file.name,
        url: response.data.url,
        size: file.size,
        parent_id: 0
      })
      ElMessage.success(`${file.name} 上传成功`)
      emit('success', { file, url: response.data.url })
    } catch (err) {
      console.error('创建文件记录失败:', err)
    }
  } else {
    ElMessage.error(response.message || '上传失败')
  }
}

const handleError = (error, file) => {
  ElMessage.error(`${file.name} 上传失败`)
}

const handleChange = (file, fileList) => {
  // 上传完成后清空列表
  if (file.status === 'success') {
    setTimeout(() => {
      uploadRef.value?.clearFiles()
    }, 1000)
  }
}
</script>

<style scoped>
.storage-upload {
  width: 100%;
}

.upload-area :deep(.el-upload-dragger) {
  width: 100%;
}
</style>
