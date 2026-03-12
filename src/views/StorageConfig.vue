<template>
  <div class="storage-config">
    <el-card class="config-card">
      <template #header>
        <div class="card-header">
          <span>存储配置</span>
          <el-tag v-if="configStatus.has_config" :type="configStatus.status === 1 ? 'success' : 'danger'">
            {{ configStatus.status === 1 ? '已配置' : '配置异常' }}
          </el-tag>
          <el-tag v-else type="warning">未配置</el-tag>
        </div>
      </template>

      <el-alert
        v-if="!configStatus.has_config"
        title="请先配置存储才能使用软件升级服务"
        type="warning"
        :closable="false"
        show-icon
        style="margin-bottom: 20px;"
      />

      <el-form ref="formRef" :model="form" :rules="rules" label-width="120px">
        <!-- 存储类型选择 -->
        <el-form-item label="存储类型" prop="type">
          <el-select v-model="form.type" placeholder="请选择存储类型" @change="onTypeChange">
            <el-option
              v-for="item in storageTypes"
              :key="item.type"
              :label="item.name"
              :value="item.type"
            >
              <div class="storage-option">
                <span>{{ item.name }}</span>
                <span class="storage-desc">{{ item.description }}</span>
              </div>
            </el-option>
          </el-select>
          <div v-if="currentTypeInfo" class="storage-link">
            <el-link :href="currentTypeInfo.website" target="_blank" type="primary">
              官网：{{ currentTypeInfo.website }}
            </el-link>
          </div>
        </el-form-item>

        <!-- 动态表单字段 -->
        <template v-for="field in currentFields" :key="field.name">
          <el-form-item 
            :label="field.label" 
            :prop="field.name"
            :rules="field.required ? [{ required: true, message: `请输入${field.label}` }] : []"
          >
            <el-input
              v-if="field.type === 'text'"
              v-model="form[field.name]"
              :placeholder="field.placeholder"
              clearable
            />
            <el-input
              v-else-if="field.type === 'password'"
              v-model="form[field.name]"
              :placeholder="field.placeholder"
              show-password
              clearable
            />
            <el-checkbox
              v-else-if="field.type === 'checkbox'"
              v-model="form[field.name]"
            />
          </el-form-item>
        </template>

        <!-- 操作按钮 -->
        <el-form-item>
          <el-button type="primary" @click="testConfig" :loading="testing">
            测试连接
          </el-button>
          <el-button type="success" @click="saveConfig" :loading="saving">
            保存配置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 配置帮助 -->
    <el-card class="help-card" style="margin-top: 20px;">
      <template #header>
        <span>配置帮助</span>
      </template>
      <el-collapse>
        <el-collapse-item title="阿里云OSS配置说明" name="aliyun">
          <ol>
            <li>登录阿里云控制台，进入对象存储OSS</li>
            <li>创建Bucket或使用已有Bucket</li>
            <li>在访问控制RAM中创建AccessKey</li>
            <li>填写AccessKey ID、AccessKey Secret、Bucket名称、Region</li>
            <li>Region格式：oss-cn-hangzhou、oss-cn-shanghai等</li>
          </ol>
        </el-collapse-item>
        <el-collapse-item title="腾讯云COS配置说明" name="tencent">
          <ol>
            <li>登录腾讯云控制台，进入对象存储COS</li>
            <li>创建存储桶或使用已有存储桶</li>
            <li>在访问管理CAM中创建密钥</li>
            <li>填写SecretId、SecretKey、Bucket名称、Region</li>
            <li>Bucket格式：bucketname-appid，Region格式：ap-guangzhou等</li>
          </ol>
        </el-collapse-item>
        <el-collapse-item title="七牛云Kodo配置说明" name="qiniu">
          <ol>
            <li>登录七牛云控制台，进入对象存储Kodo</li>
            <li>创建存储空间或使用已有空间</li>
            <li>在个人中心-密钥管理中获取AccessKey/SecretKey</li>
            <li>填写AccessKey、SecretKey、Bucket名称、CDN域名</li>
            <li>CDN域名格式：https://xxx.qiniudn.com 或自定义域名</li>
          </ol>
        </el-collapse-item>
        <el-collapse-item title="MinIO配置说明" name="minio">
          <ol>
            <li>部署MinIO服务（Docker或二进制）</li>
            <li>创建Bucket或使用已有Bucket</li>
            <li>填写服务地址（如：localhost:9000）</li>
            <li>填写AccessKey、SecretKey（默认minioadmin/minioadmin）</li>
            <li>填写公开访问域名（用于生成下载链接）</li>
          </ol>
          <el-alert type="info" :closable="false" style="margin-top: 10px;">
            MinIO是开源对象存储，适合自建服务，完全自主控制数据
          </el-alert>
        </el-collapse-item>
      </el-collapse>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import request from '@/api/request'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const formRef = ref(null)
const testing = ref(false)
const saving = ref(false)

// 存储类型列表（硬编码）
const storageTypes = ref([
  {
    type: 'aliyun',
    name: '阿里云OSS',
    description: '国内首选，稳定可靠',
    website: 'https://oss.aliyun.com',
    fields: [
      { name: 'access_key', label: 'AccessKey ID', type: 'text', required: true, placeholder: 'LTAI...' },
      { name: 'secret_key', label: 'AccessKey Secret', type: 'password', required: true, placeholder: '' },
      { name: 'bucket', label: 'Bucket名称', type: 'text', required: true, placeholder: 'my-bucket' },
      { name: 'region', label: 'Region', type: 'text', required: true, placeholder: 'oss-cn-hangzhou' },
      { name: 'domain', label: 'CDN域名(可选)', type: 'text', required: false, placeholder: 'https://cdn.example.com' }
    ]
  },
  {
    type: 'tencent',
    name: '腾讯云COS',
    description: '性价比高，CDN加速',
    website: 'https://cos.tencent.com',
    fields: [
      { name: 'access_key', label: 'SecretId', type: 'text', required: true, placeholder: '' },
      { name: 'secret_key', label: 'SecretKey', type: 'password', required: true, placeholder: '' },
      { name: 'bucket', label: 'Bucket名称', type: 'text', required: true, placeholder: 'my-bucket-123456' },
      { name: 'region', label: 'Region', type: 'text', required: true, placeholder: 'ap-guangzhou' },
      { name: 'domain', label: 'CDN域名(可选)', type: 'text', required: false, placeholder: 'https://cdn.example.com' }
    ]
  },
  {
    type: 'qiniu',
    name: '七牛云Kodo',
    description: '免费额度多，价格实惠',
    website: 'https://qiniu.com',
    fields: [
      { name: 'access_key', label: 'AccessKey', type: 'text', required: true, placeholder: '' },
      { name: 'secret_key', label: 'SecretKey', type: 'password', required: true, placeholder: '' },
      { name: 'bucket', label: 'Bucket名称', type: 'text', required: true, placeholder: 'my-bucket' },
      { name: 'region', label: 'Region', type: 'text', required: false, placeholder: 'z0(华东) / z1(华北) / z2(华南)' },
      { name: 'domain', label: 'CDN域名', type: 'text', required: true, placeholder: 'https://xxx.qiniudn.com' }
    ]
  },
  {
    type: 'minio',
    name: 'MinIO(自建)',
    description: '开源对象存储，完全自主控制',
    website: 'https://min.io',
    fields: [
      { name: 'endpoint', label: '服务地址', type: 'text', required: true, placeholder: 'localhost:9000' },
      { name: 'access_key', label: 'AccessKey', type: 'text', required: true, placeholder: 'minioadmin' },
      { name: 'secret_key', label: 'SecretKey', type: 'password', required: true, placeholder: 'minioadmin' },
      { name: 'bucket', label: 'Bucket名称', type: 'text', required: true, placeholder: 'pixelbeast' },
      { name: 'domain', label: '公开访问域名', type: 'text', required: false, placeholder: 'http://localhost:9000/pixelbeast' }
    ]
  }
])

// 配置状态
const configStatus = ref({
  has_config: false,
  status: 0,
  type: ''
})

// 表单数据
const form = ref({
  type: '',
  access_key: '',
  secret_key: '',
  bucket: '',
  region: '',
  domain: '',
  endpoint: '',
  use_ssl: false
})

// 表单校验规则
const rules = {
  type: [{ required: true, message: '请选择存储类型', trigger: 'change' }]
}

// 当前存储类型信息
const currentTypeInfo = computed(() => {
  return storageTypes.value.find(t => t.type === form.value.type)
})

// 当前存储类型的表单字段
const currentFields = computed(() => {
  return currentTypeInfo.value?.fields || []
})

// 存储类型已硬编码，无需加载

// 加载当前配置状态
const loadConfigStatus = async () => {
  try {
    const res = await request.get('/storage/config')
    if (res.code === 0) {
      configStatus.value = res.data
      // 如果有配置，填充表单
      if (configStatus.value.has_config) {
        form.value.type = res.data.type || ''
        form.value.access_key = res.data.access_key || ''
        form.value.secret_key = res.data.secret_key || ''
        form.value.bucket = res.data.bucket || ''
        form.value.region = res.data.region || ''
        form.value.domain = res.data.domain || ''
        form.value.endpoint = res.data.endpoint || ''
      }
      // 更新 authStore 的存储配置状态
      authStore.setStorageConfigured(configStatus.value.has_config && configStatus.value.status === 1)
    }
  } catch (error) {
    console.error('Failed to load config status:', error)
  }
}

// 加载配置详情（已配置时）
const loadConfigDetail = async () => {
  // 配置详情已在 res.data 中返回，无需额外请求
  // 这里可以根据需要填充表单（但不显示密钥）
}

// 存储类型变更
const onTypeChange = () => {
  // 清空其他字段
  form.value.access_key = ''
  form.value.secret_key = ''
  form.value.bucket = ''
  form.value.region = ''
  form.value.domain = ''
  form.value.endpoint = ''
  form.value.use_ssl = false
}

// 测试配置
const testConfig = async () => {
  try {
    await formRef.value.validate()
  } catch {
    return
  }

  testing.value = true
  try {
    console.log('Testing config:', form.value)
    const res = await request.post('/storage/test', form.value)
    console.log('Test response:', res)
    if (res.code === 0) {
      ElMessage.success('连接成功')
    } else {
      ElMessage.error(res.msg || '连接失败')
    }
  } catch (error) {
    console.error('Test error:', error)
    ElMessage.error(error.message || '连接失败')
  } finally {
    testing.value = false
  }
}

// 保存配置
const saveConfig = async () => {
  try {
    await formRef.value.validate()
  } catch {
    return
  }

  saving.value = true
  try {
    console.log('Saving config:', form.value)
    const res = await request.post('/storage/config', form.value)
    console.log('Save response:', res)
    if (res.code === 0) {
      ElMessage.success('保存成功')
      // 更新存储配置状态
      authStore.setStorageConfigured(true)
      // 强制刷新页面以获取最新状态
      window.location.reload()
    } else {
      ElMessage.error(res.msg || '保存失败')
    }
  } catch (error) {
    console.error('Save error:', error)
    ElMessage.error(error.message || '保存失败')
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  loadConfigStatus()
})
</script>

<style scoped>
.storage-config {
  padding: 20px;
}

.config-card {
  max-width: 800px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.storage-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.storage-desc {
  color: #999;
  font-size: 12px;
}

.storage-link {
  margin-top: 5px;
}

.help-card {
  max-width: 800px;
}

.help-card ol {
  padding-left: 20px;
  margin: 0;
}

.help-card li {
  margin: 5px 0;
}
</style>