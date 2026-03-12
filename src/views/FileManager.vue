<template>
  <div class="file-manager">
    <el-card>
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <el-icon :size="20"><FolderOpened /></el-icon>
            <span class="title">文件管理</span>
          </div>
          <div class="header-right">
            <el-button type="primary" @click="handleUpload">
              <el-icon><Upload /></el-icon>
              上传文件
            </el-button>
            <el-button @click="handleRefresh">
              <el-icon><Refresh /></el-icon>
              刷新
            </el-button>
          </div>
        </div>
      </template>
      
      <!-- 路径导航 -->
      <div class="breadcrumb-wrapper">
        <el-breadcrumb separator="/">
          <el-breadcrumb-item @click="goToRoot" class="breadcrumb-root">
            <el-icon><HomeFilled /></el-icon>
            根目录
          </el-breadcrumb-item>
          <el-breadcrumb-item 
            v-for="(item, index) in breadcrumbList" 
            :key="index"
            @click="goToPath(index)"
            class="breadcrumb-item"
          >
            {{ item }}
          </el-breadcrumb-item>
        </el-breadcrumb>
      </div>
      
      <!-- 文件列表 -->
      <div class="file-list" v-loading="loading">
        <div v-if="fileList.length === 0" class="empty-state">
          <el-icon :size="64" class="empty-icon"><FolderOpened /></el-icon>
          <p>当前文件夹为空</p>
          <el-button type="primary" @click="handleUpload">上传文件</el-button>
        </div>
        
        <div v-else class="file-grid">
          <div 
            v-for="file in fileList" 
            :key="file.id"
            class="file-item"
            :class="{ 'is-selected': selectedFiles.includes(file.id) }"
            @click="handleFileClick(file)"
            @dblclick="handleFileDblClick(file)"
            @contextmenu.prevent="handleContextMenu($event, file)"
          >
            <!-- 文件图标 -->
            <div class="file-icon">
              <FileIcon :file="file" :size="48" />
            </div>
            
            <!-- 文件名 -->
            <div class="file-name" :title="file.name">
              {{ file.name }}
            </div>
            
            <!-- 文件信息 -->
            <div class="file-info">
              <span v-if="file.type === 'folder'">{{ file.childrenCount || 0 }} 项</span>
              <span v-else>{{ formatFileSize(file.size) }}</span>
            </div>
            
            <!-- 选择框 -->
            <el-checkbox 
              v-model="selectedFiles" 
              :label="file.id"
              class="file-checkbox"
              @click.stop
            />
          </div>
        </div>
      </div>
      
      <!-- 底部操作栏 -->
      <div class="file-manager-footer" v-if="selectedFiles.length > 0">
        <span class="selected-count">已选择 {{ selectedFiles.length }} 项</span>
        <div class="footer-actions">
          <el-button type="danger" size="small" @click="handleBatchDelete">
            <el-icon><Delete /></el-icon>
            删除
          </el-button>
          <el-button size="small" @click="handleBatchDownload">
            <el-icon><Download /></el-icon>
            下载
          </el-button>
          <el-button size="small" @click="clearSelection">
            取消选择
          </el-button>
        </div>
      </div>
    </el-card>
    
    <!-- 右键菜单 -->
    <teleport to="body">
      <div 
        v-if="contextMenu.visible" 
        class="context-menu"
        :style="{ left: contextMenu.x + 'px', top: contextMenu.y + 'px' }"
      >
        <div class="context-menu-item" @click="handlePreview" v-if="canPreview">
          <el-icon><View /></el-icon>
          预览
        </div>
        <div class="context-menu-item" @click="handleDownload">
          <el-icon><Download /></el-icon>
          下载
        </div>
        <div class="context-menu-item" @click="handleRename">
          <el-icon><Edit /></el-icon>
          重命名
        </div>
        <div class="context-menu-divider"></div>
        <div class="context-menu-item is-danger" @click="handleDelete">
          <el-icon><Delete /></el-icon>
          删除
        </div>
      </div>
    </teleport>
    
    <!-- 上传对话框 -->
    <el-dialog
      v-model="uploadDialog.visible"
      title="上传文件"
      width="500px"
    >
      <el-upload
        drag
        action="/api/v1/upload"
        :headers="uploadHeaders"
        :data="{ pathPrefix: currentPath }"
        multiple
        :on-success="handleUploadSuccess"
        :on-error="handleUploadError"
        :before-upload="handleBeforeUpload"
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
    </el-dialog>
    
    <!-- 重命名对话框 -->
    <el-dialog
      v-model="renameDialog.visible"
      title="重命名"
      width="400px"
    >
      <el-input v-model="renameDialog.newName" placeholder="请输入新文件名" />
      <template #footer>
        <el-button @click="renameDialog.visible = false">取消</el-button>
        <el-button type="primary" @click="confirmRename">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  FolderOpened,
  Upload,
  Refresh,
  HomeFilled,
  Delete,
  Download,
  View,
  Edit,
  UploadFilled
} from '@element-plus/icons-vue'
import FileIcon from '@/components/FileIcon.vue'

// 文件列表
const fileList = ref([])
const loading = ref(false)
const selectedFiles = ref([])
const currentPath = ref('files')

// 面包屑导航
const breadcrumbList = computed(() => {
  return currentPath.value.split('/').filter(Boolean).slice(1)
})

// 上传请求头
const uploadHeaders = computed(() => {
  return {
    Authorization: 'Bearer ' + localStorage.getItem('token')
  }
})

// 右键菜单
const contextMenu = reactive({
  visible: false,
  x: 0,
  y: 0,
  file: null
})

// 上传对话框
const uploadDialog = reactive({
  visible: false
})

// 重命名对话框
const renameDialog = reactive({
  visible: false,
  file: null,
  newName: ''
})

// 是否可以预览
const canPreview = computed(() => {
  if (!contextMenu.file) return false
  const previewTypes = ['image', 'video', 'audio', 'pdf', 'txt']
  return previewTypes.includes(contextMenu.file.fileType)
})

// 获取文件列表
const fetchFileList = async () => {
  loading.value = true
  try {
    // TODO: 调用后端 API 获取文件列表
    // const res = await request.get('/files', { params: { path: currentPath.value } })
    // fileList.value = res.data
    
    // 模拟数据
    fileList.value = [
      {
        id: '1',
        name: '文档',
        type: 'folder',
        childrenCount: 5,
        updatedAt: '2024-03-12 10:00:00'
      },
      {
        id: '2',
        name: '图片',
        type: 'folder',
        childrenCount: 12,
        updatedAt: '2024-03-12 09:30:00'
      },
      {
        id: '3',
        name: 'report.pdf',
        type: 'file',
        fileType: 'pdf',
        size: 1024 * 1024 * 2.5,
        updatedAt: '2024-03-11 15:20:00'
      },
      {
        id: '4',
        name: 'logo.png',
        type: 'file',
        fileType: 'image',
        size: 1024 * 256,
        updatedAt: '2024-03-10 08:15:00'
      },
      {
        id: '5',
        name: 'data.xlsx',
        type: 'file',
        fileType: 'excel',
        size: 1024 * 1024 * 1.2,
        updatedAt: '2024-03-09 14:30:00'
      }
    ]
  } catch (error) {
    ElMessage.error('获取文件列表失败')
  } finally {
    loading.value = false
  }
}

// 格式化文件大小
const formatFileSize = (size) => {
  if (size < 1024) return size + ' B'
  if (size < 1024 * 1024) return (size / 1024).toFixed(2) + ' KB'
  if (size < 1024 * 1024 * 1024) return (size / 1024 / 1024).toFixed(2) + ' MB'
  return (size / 1024 / 1024 / 1024).toFixed(2) + ' GB'
}

// 点击文件
const handleFileClick = (file) => {
  if (selectedFiles.value.includes(file.id)) {
    selectedFiles.value = selectedFiles.value.filter(id => id !== file.id)
  } else {
    selectedFiles.value.push(file.id)
  }
}

// 双击文件
const handleFileDblClick = (file) => {
  if (file.type === 'folder') {
    currentPath.value += '/' + file.name
    fetchFileList()
  } else {
    handlePreview()
  }
}

// 右键菜单
const handleContextMenu = (event, file) => {
  contextMenu.visible = true
  contextMenu.x = event.clientX
  contextMenu.y = event.clientY
  contextMenu.file = file
}

// 隐藏右键菜单
const hideContextMenu = () => {
  contextMenu.visible = false
}

// 返回根目录
const goToRoot = () => {
  currentPath.value = 'files'
  fetchFileList()
}

// 跳转到指定路径
const goToPath = (index) => {
  const parts = currentPath.value.split('/').filter(Boolean)
  currentPath.value = parts.slice(0, index + 1).join('/')
  fetchFileList()
}

// 上传文件
const handleUpload = () => {
  uploadDialog.visible = true
}

// 刷新
const handleRefresh = () => {
  fetchFileList()
}

// 上传前检查
const handleBeforeUpload = (file) => {
  const maxSize = 100 * 1024 * 1024 // 100MB
  if (file.size > maxSize) {
    ElMessage.error('文件大小不能超过 100MB')
    return false
  }
  return true
}

// 上传成功
const handleUploadSuccess = () => {
  ElMessage.success('上传成功')
  fetchFileList()
}

// 上传失败
const handleUploadError = () => {
  ElMessage.error('上传失败')
}

// 预览
const handlePreview = () => {
  if (!contextMenu.file) return
  ElMessage.info('预览功能开发中...')
  hideContextMenu()
}

// 下载
const handleDownload = () => {
  if (!contextMenu.file) return
  ElMessage.info('下载功能开发中...')
  hideContextMenu()
}

// 重命名
const handleRename = () => {
  if (!contextMenu.file) return
  renameDialog.file = contextMenu.file
  renameDialog.newName = contextMenu.file.name
  renameDialog.visible = true
  hideContextMenu()
}

// 确认重命名
const confirmRename = async () => {
  if (!renameDialog.newName.trim()) {
    ElMessage.warning('请输入文件名')
    return
  }
  // TODO: 调用重命名 API
  ElMessage.success('重命名成功')
  renameDialog.visible = false
  fetchFileList()
}

// 删除
const handleDelete = async () => {
  if (!contextMenu.file) return
  try {
    await ElMessageBox.confirm(
      `确定要删除 "${contextMenu.file.name}" 吗？`,
      '确认删除',
      { type: 'warning' }
    )
    // TODO: 调用删除 API
    ElMessage.success('删除成功')
    fetchFileList()
  } catch {
    // 取消删除
  }
  hideContextMenu()
}

// 批量删除
const handleBatchDelete = async () => {
  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedFiles.value.length} 项吗？`,
      '确认删除',
      { type: 'warning' }
    )
    // TODO: 调用批量删除 API
    ElMessage.success('删除成功')
    selectedFiles.value = []
    fetchFileList()
  } catch {
    // 取消删除
  }
}

// 批量下载
const handleBatchDownload = () => {
  ElMessage.info('批量下载功能开发中...')
}

// 清除选择
const clearSelection = () => {
  selectedFiles.value = []
}

// 点击页面其他地方隐藏右键菜单
onMounted(() => {
  fetchFileList()
  document.addEventListener('click', hideContextMenu)
})

onUnmounted(() => {
  document.removeEventListener('click', hideContextMenu)
})
</script>

<style scoped>
.file-manager {
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
}

.header-right {
  display: flex;
  gap: 8px;
}

/* 面包屑导航 */
.breadcrumb-wrapper {
  padding: 12px 0;
  border-bottom: 1px solid #e4e7ed;
  margin-bottom: 16px;
}

.breadcrumb-root {
  cursor: pointer;
  color: #409eff;
}

.breadcrumb-root:hover {
  color: #66b1ff;
}

.breadcrumb-item {
  cursor: pointer;
}

.breadcrumb-item:hover {
  color: #409eff;
}

/* 文件列表 */
.file-list {
  min-height: 400px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
  color: #909399;
}

.empty-icon {
  margin-bottom: 16px;
  color: #dcdfe6;
}

.empty-state p {
  margin-bottom: 16px;
}

/* 文件网格 */
.file-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 16px;
  padding: 8px;
}

.file-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 8px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
}

.file-item:hover {
  background-color: #f5f7fa;
}

.file-item.is-selected {
  background-color: #ecf5ff;
  border: 1px solid #409eff;
}

.file-icon {
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
}

.file-name {
  font-size: 13px;
  color: #303133;
  text-align: center;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding: 0 4px;
}

.file-info {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.file-checkbox {
  position: absolute;
  top: 8px;
  left: 8px;
}

/* 底部操作栏 */
.file-manager-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background-color: #f5f7fa;
  border-top: 1px solid #e4e7ed;
  margin: 16px -20px -20px;
}

.selected-count {
  font-size: 14px;
  color: #606266;
}

.footer-actions {
  display: flex;
  gap: 8px;
}

/* 右键菜单 */
.context-menu {
  position: fixed;
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  z-index: 3000;
  min-width: 120px;
  padding: 4px 0;
}

.context-menu-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  font-size: 14px;
  color: #606266;
  cursor: pointer;
  transition: all 0.3s;
}

.context-menu-item:hover {
  background-color: #f5f7fa;
  color: #409eff;
}

.context-menu-item.is-danger {
  color: #f56c6c;
}

.context-menu-item.is-danger:hover {
  background-color: #fef0f0;
}

.context-menu-divider {
  height: 1px;
  background-color: #e4e7ed;
  margin: 4px 0;
}
</style>
