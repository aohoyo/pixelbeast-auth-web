<template>
  <div class="signing-key-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <span class="title">签名密钥管理</span>
            <el-tag type="info" size="small">共 {{ total }} 个</el-tag>
          </div>
          <el-button type="primary" @click="handleCreate">
            <el-icon><Plus /></el-icon>生成密钥对
          </el-button>
        </div>
      </template>
      
      <el-alert
        type="info"
        :closable="false"
        style="margin-bottom: 16px"
      >
        <template #title>
          <span>签名密钥用于验证安装包的完整性和来源。生成后请将公钥集成到客户端代码中。</span>
        </template>
      </el-alert>
      
      <el-table :data="keyList" v-loading="loading" stripe>
        <el-table-column type="index" label="#" width="60" align="center" />
        <el-table-column prop="name" label="密钥名称" min-width="150" />
        <el-table-column prop="algorithm" label="算法" width="120">
          <template #default="{ row }">
            <el-tag size="small" type="info">{{ row.algorithm?.toUpperCase() }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="is_active" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.is_active" type="success" size="small">活跃</el-tag>
            <el-tag v-else type="info" size="small">未激活</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" width="160">
          <template #default="{ row }">
            {{ formatDate(row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="250" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleViewPublicKey(row)">
              <el-icon><View /></el-icon>查看公钥
            </el-button>
            <el-button 
              v-if="!row.is_active"
              type="primary" 
              link 
              @click="handleActivate(row)"
            >
              <el-icon><Check /></el-icon>激活
            </el-button>
            <el-button type="danger" link @click="handleDelete(row)">
              <el-icon><Delete /></el-icon>删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    
    <!-- 创建密钥弹窗 -->
    <el-dialog
      v-model="createDialogVisible"
      title="生成签名密钥对"
      width="500px"
      :close-on-click-modal="false"
      destroy-on-close
    >
      <el-form :model="createForm" :rules="createRules" ref="createFormRef" label-width="100px">
        <el-form-item label="密钥名称" prop="name">
          <el-input v-model="createForm.name" placeholder="如：生产环境密钥" maxlength="50" />
        </el-form-item>
        <el-form-item label="算法" prop="algorithm">
          <el-radio-group v-model="createForm.algorithm">
            <el-radio label="rsa2048">RSA-2048（推荐）</el-radio>
            <el-radio label="rsa4096">RSA-4096（更安全）</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="createDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="creating" @click="handleCreateSubmit">
          生成密钥对
        </el-button>
      </template>
    </el-dialog>
    
    <!-- 查看公钥弹窗 -->
    <el-dialog
      v-model="publicKeyDialogVisible"
      title="公钥信息"
      width="700px"
    >
      <el-alert type="warning" :closable="false" style="margin-bottom: 16px">
        <template #title>
          <span>请将此公钥集成到客户端代码中进行签名验证。公钥可以公开分享，私钥由服务器安全保管。</span>
        </template>
      </el-alert>
      
      <div class="public-key-section">
        <div class="key-header">
          <span class="key-label">公钥 (PEM格式)</span>
          <el-button type="primary" link @click="copyPublicKey">
            <el-icon><CopyDocument /></el-icon>复制
          </el-button>
        </div>
        <el-input
          v-model="currentPublicKey"
          type="textarea"
          :rows="12"
          readonly
          class="key-textarea"
        />
      </div>
      
      <template #footer>
        <el-button type="primary" @click="publicKeyDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, View, Check, Delete, CopyDocument } from '@element-plus/icons-vue'
import request from '@/api/request'

const loading = ref(false)
const keyList = ref([])
const total = ref(0)

// 创建弹窗
const createDialogVisible = ref(false)
const createFormRef = ref(null)
const creating = ref(false)
const createForm = reactive({
  name: '',
  algorithm: 'rsa2048'
})

const createRules = {
  name: [
    { required: true, message: '请输入密钥名称', trigger: 'blur' }
  ]
}

// 公钥弹窗
const publicKeyDialogVisible = ref(false)
const currentPublicKey = ref('')

// 获取密钥列表
const fetchKeyList = async () => {
  loading.value = true
  try {
    const res = await request.get('/signing-key')
    keyList.value = res?.data || []
    total.value = keyList.value.length
  } catch (error) {
    keyList.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

// 创建密钥
const handleCreate = () => {
  createForm.name = ''
  createForm.algorithm = 'rsa2048'
  createDialogVisible.value = true
}

const handleCreateSubmit = async () => {
  const valid = await createFormRef.value?.validate().catch(() => false)
  if (!valid) return
  
  creating.value = true
  try {
    await request.post('/signing-key', createForm)
    ElMessage.success('密钥对生成成功')
    createDialogVisible.value = false
    fetchKeyList()
  } catch (error) {
    ElMessage.error('生成失败')
  } finally {
    creating.value = false
  }
}

// 查看公钥
const handleViewPublicKey = (row) => {
  currentPublicKey.value = row.public_key || ''
  publicKeyDialogVisible.value = true
}

// 复制公钥
const copyPublicKey = async () => {
  if (!currentPublicKey.value) {
    ElMessage.warning('没有可复制的内容')
    return
  }
  
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(currentPublicKey.value)
      ElMessage.success('公钥已复制到剪贴板')
    } else {
      const textArea = document.createElement('textarea')
      textArea.value = currentPublicKey.value
      textArea.style.position = 'fixed'
      textArea.style.left = '-9999px'
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      ElMessage.success('公钥已复制到剪贴板')
    }
  } catch (err) {
    ElMessage.error('复制失败')
  }
}

// 激活密钥
const handleActivate = (row) => {
  ElMessageBox.confirm(
    `确定要将 "${row.name}" 设置为活跃密钥吗？新上传的安装包将使用此密钥签名。`,
    '激活密钥',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      await request.post(`/signing-key/${row.id}/activate`)
      ElMessage.success('激活成功')
      fetchKeyList()
    } catch (error) {
      ElMessage.error('激活失败')
    }
  })
}

// 删除密钥
const handleDelete = (row) => {
  ElMessageBox.confirm(
    `确定要删除密钥 "${row.name}" 吗？此操作不可恢复。`,
    '确认删除',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      await request.delete(`/signing-key/${row.id}`)
      ElMessage.success('删除成功')
      fetchKeyList()
    } catch (error) {
      ElMessage.error('删除失败')
    }
  })
}

// 格式化日期
const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleString('zh-CN')
}

onMounted(() => {
  fetchKeyList()
})
</script>

<style scoped>
.signing-key-list {
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

.public-key-section {
  margin-top: 8px;
}

.key-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.key-label {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.key-textarea :deep(.el-textarea__inner) {
  font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace;
  font-size: 12px;
  line-height: 1.5;
}
</style>