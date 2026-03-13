<template>
  <div class="api-docs">
    <el-card class="doc-card">
      <template #header>
        <div class="card-header">
          <span class="title">API 开发文档</span>
          <el-tag type="info">v1.0</el-tag>
        </div>
      </template>
      
      <el-alert type="info" :closable="false" style="margin-bottom: 20px">
        <template #title>
          本文档供客户端开发者对接升级服务使用，包含检查更新、下载、增量更新等接口。
        </template>
      </el-alert>
      
      <!-- 基础信息 -->
      <div class="section">
        <h2 class="section-title">📌 基础信息</h2>
        <el-descriptions :column="1" border>
          <el-descriptions-item label="Base URL">
            <code>{{ baseUrl }}</code>
            <el-button type="primary" link size="small" @click="copyBaseUrl">复制</el-button>
          </el-descriptions-item>
          <el-descriptions-item label="认证方式">
            <code>API Key</code> - 在请求头或Query参数中传递
          </el-descriptions-item>
          <el-descriptions-item label="获取 API Key">
            在「软件管理」中创建软件后，系统会自动生成 API Key（通讯密钥）
          </el-descriptions-item>
        </el-descriptions>
      </div>
      
      <!-- 认证方式 -->
      <div class="section">
        <h2 class="section-title">🔐 认证方式</h2>
        <p class="section-desc">所有客户端接口都需要传递 API Key，支持以下两种方式：</p>
        
        <div class="method-tabs">
          <el-tabs v-model="authTab">
            <el-tab-pane label="Header 传递（推荐）" name="header">
              <div class="code-block">
                <pre>X-API-Key: your-api-key-here</pre>
              </div>
            </el-tab-pane>
            <el-tab-pane label="Query 参数传递" name="query">
              <div class="code-block">
                <pre>?api_key=your-api-key-here</pre>
              </div>
            </el-tab-pane>
          </el-tabs>
        </div>
      </div>
      
      <!-- 接口列表 -->
      <div class="section">
        <h2 class="section-title">📡 接口列表</h2>
        
        <!-- 1. 检查更新 -->
        <div class="api-item">
          <div class="api-header">
            <el-tag type="success" size="small">GET/POST</el-tag>
            <code class="api-path">/api/v1/update/check</code>
            <span class="api-desc">检查是否有新版本</span>
          </div>
          
          <div class="api-content">
            <h4>请求参数</h4>
            <el-table :data="checkUpdateParams" border size="small">
              <el-table-column prop="name" label="参数名" width="150" />
              <el-table-column prop="type" label="类型" width="100" />
              <el-table-column prop="required" label="必填" width="80">
                <template #default="{ row }">
                  <el-tag :type="row.required ? 'danger' : 'info'" size="small">
                    {{ row.required ? '是' : '否' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="desc" label="说明" />
            </el-table>
            
            <h4 style="margin-top: 16px">请求示例</h4>
            <div class="code-block">
              <pre>GET /api/v1/update/check?current_version=v1.0.0&device_id=device123
Header: X-API-Key: abc123def456...</pre>
            </div>
            
            <h4 style="margin-top: 16px">响应示例</h4>
            <div class="code-block">
              <pre>{
  "code": 0,
  "msg": "success",
  "data": {
    "has_update": true,
    "version": "v1.1.0",
    "version_code": 10100,
    "changelog": "1. 新增功能A\n2. 修复Bug B",
    "download_url": "https://cdn.example.com/packages/v1.1.0.zip",
    "package_size": 52428800,
    "package_hash": "abc123def456...",
    "package_hash_algo": "sha256",
    "is_forced": false,
    "is_incremental": false,
    "min_version": "v0.9.0",
    "published_at": "2024-01-15T00:00:00Z",
    "signature": "base64-signature...",
    "public_key": "-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----"
  }
}</pre>
            </div>
            
            <h4 style="margin-top: 16px">响应字段说明</h4>
            <el-table :data="checkUpdateResponse" border size="small">
              <el-table-column prop="name" label="字段名" width="150" />
              <el-table-column prop="type" label="类型" width="100" />
              <el-table-column prop="desc" label="说明" />
            </el-table>
          </div>
        </div>
        
        <!-- 2. 增量更新检查 -->
        <div class="api-item">
          <div class="api-header">
            <el-tag type="primary" size="small">POST</el-tag>
            <code class="api-path">/api/v1/update/delta</code>
            <span class="api-desc">检查增量更新（文件级）</span>
          </div>
          
          <div class="api-content">
            <h4>请求参数（JSON Body）</h4>
            <el-table :data="deltaUpdateParams" border size="small">
              <el-table-column prop="name" label="参数名" width="150" />
              <el-table-column prop="type" label="类型" width="150" />
              <el-table-column prop="required" label="必填" width="80">
                <template #default="{ row }">
                  <el-tag :type="row.required ? 'danger' : 'info'" size="small">
                    {{ row.required ? '是' : '否' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="desc" label="说明" />
            </el-table>
            
            <h4 style="margin-top: 16px">请求示例</h4>
            <div class="code-block">
              <pre>POST /api/v1/update/delta
Header: X-API-Key: abc123def456...
Content-Type: application/json

{
  "current_version": "v1.0.0",
  "local_files": {
    "app.exe": "hash-of-app-exe",
    "config.ini": "hash-of-config-ini",
    "resources/data.db": "hash-of-data-db"
  }
}</pre>
            </div>
            
            <h4 style="margin-top: 16px">响应示例</h4>
            <div class="code-block">
              <pre>{
  "code": 0,
  "msg": "success",
  "data": {
    "has_update": true,
    "version": "v1.1.0",
    "changed_files": [
      {
        "path": "app.exe",
        "size": 20971520,
        "hash": "new-hash...",
        "hash_algo": "sha256",
        "download_url": "https://..."
      }
    ],
    "new_files": [
      {
        "path": "plugins/new.dll",
        "size": 1048576,
        "hash": "hash...",
        "download_url": "https://..."
      }
    ],
    "deleted_files": ["old_module.dll"],
    "delta_size": 22020096,
    "full_size": 52428800,
    "full_url": "https://...",
    "full_hash": "full-package-hash..."
  }
}</pre>
            </div>
          </div>
        </div>
        
        <!-- 3. 下载版本包 -->
        <div class="api-item">
          <div class="api-header">
            <el-tag type="success" size="small">GET</el-tag>
            <code class="api-path">/api/v1/update/download/:id</code>
            <span class="api-desc">下载版本包</span>
          </div>
          
          <div class="api-content">
            <h4>请求参数</h4>
            <el-table :data="downloadParams" border size="small">
              <el-table-column prop="name" label="参数名" width="150" />
              <el-table-column prop="type" label="类型" width="100" />
              <el-table-column prop="required" label="必填" width="80">
                <template #default="{ row }">
                  <el-tag :type="row.required ? 'danger' : 'info'" size="small">
                    {{ row.required ? '是' : '否' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="desc" label="说明" />
            </el-table>
            
            <h4 style="margin-top: 16px">请求示例</h4>
            <div class="code-block">
              <pre>GET /api/v1/update/download/123?device_id=device123
Header: X-API-Key: abc123def456...</pre>
            </div>
            
            <h4 style="margin-top: 16px">响应</h4>
            <p>返回 HTTP 302 重定向到实际下载地址</p>
          </div>
        </div>
      </div>
      
      <!-- 签名验证 -->
      <div class="section">
        <h2 class="section-title">🔐 签名验证</h2>
        <p class="section-desc">为确保安装包完整性和来源可信，建议客户端在安装前验证签名。</p>
        
        <div class="steps">
          <h4>验证流程</h4>
          <el-steps :active="4" direction="vertical">
            <el-step title="获取公钥">
              <template #description>
                <p>在管理后台「签名密钥」页面生成密钥对，将公钥硬编码到客户端代码中</p>
              </template>
            </el-step>
            <el-step title="下载安装包">
              <template #description>
                <p>从 <code>download_url</code> 下载安装包</p>
              </template>
            </el-step>
            <el-step title="验证Hash">
              <template #description>
                <p>计算下载文件的 SHA256，与 <code>package_hash</code> 对比</p>
              </template>
            </el-step>
            <el-step title="验证签名">
              <template #description>
                <p>使用公钥验证 <code>signature</code> 是否有效</p>
              </template>
            </el-step>
          </el-steps>
        </div>
        
        <h4 style="margin-top: 20px">客户端验证示例（伪代码）</h4>
        <div class="code-block">
          <pre>// 1. 内置公钥（从管理后台复制）
const PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...
-----END PUBLIC KEY-----`;

// 2. 下载文件
const fileData = await downloadFile(response.download_url);

// 3. 验证 Hash
const hash = SHA256(fileData);
if (hash !== response.package_hash) {
    throw new Error('文件校验失败');
}

// 4. 验证签名
if (!verifySignature(PUBLIC_KEY, hash, response.signature)) {
    throw new Error('签名验证失败');
}

// 5. 安装
install(fileData);</pre>
        </div>
      </div>
      
      <!-- 错误码 -->
      <div class="section">
        <h2 class="section-title">⚠️ 错误码说明</h2>
        <el-table :data="errorCodes" border size="small">
          <el-table-column prop="code" label="错误码" width="100" />
          <el-table-column prop="msg" label="错误信息" width="200" />
          <el-table-column prop="desc" label="说明" />
        </el-table>
      </div>
      
      <!-- SDK 规划 -->
      <div class="section">
        <h2 class="section-title">📦 SDK 规划</h2>
        <p class="section-desc">后续将提供各平台 SDK，简化对接流程：</p>
        
        <el-table :data="sdkPlans" border size="small">
          <el-table-column prop="platform" label="平台" width="120" />
          <el-table-column prop="language" label="语言" width="120" />
          <el-table-column prop="features" label="功能" />
          <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="row.status === '计划中' ? 'info' : 'success'" size="small">
                {{ row.status }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

const baseUrl = ref(window.location.origin + '/api/v1')
const authTab = ref('header')

// 复制 Base URL
const copyBaseUrl = async () => {
  try {
    await navigator.clipboard.writeText(baseUrl.value)
    ElMessage.success('已复制')
  } catch (err) {
    // ignore
  }
}

// 检查更新参数
const checkUpdateParams = [
  { name: 'current_version', type: 'string', required: true, desc: '当前版本号，如 v1.0.0' },
  { name: 'device_id', type: 'string', required: false, desc: '设备唯一标识，用于灰度发布判断' },
  { name: 'platform', type: 'string', required: false, desc: '平台：windows/macos/linux/android/ios' }
]

// 检查更新响应字段
const checkUpdateResponse = [
  { name: 'has_update', type: 'boolean', desc: '是否有更新' },
  { name: 'version', type: 'string', desc: '最新版本号' },
  { name: 'version_code', type: 'int', desc: '版本代码，用于版本比较' },
  { name: 'changelog', type: 'string', desc: '更新日志' },
  { name: 'download_url', type: 'string', desc: '安装包下载地址' },
  { name: 'package_size', type: 'int64', desc: '安装包大小（字节）' },
  { name: 'package_hash', type: 'string', desc: '安装包 SHA256 哈希值' },
  { name: 'package_hash_algo', type: 'string', desc: '哈希算法，默认 sha256' },
  { name: 'is_forced', type: 'boolean', desc: '是否强制更新' },
  { name: 'is_incremental', type: 'boolean', desc: '是否增量包' },
  { name: 'min_version', type: 'string', desc: '最低支持升级版本' },
  { name: 'signature', type: 'string', desc: '安装包签名（Base64）' },
  { name: 'public_key', type: 'string', desc: '签名公钥（PEM格式）' }
]

// 增量更新参数
const deltaUpdateParams = [
  { name: 'current_version', type: 'string', required: true, desc: '当前版本号' },
  { name: 'local_files', type: 'object', required: true, desc: '本地文件清单，key=文件路径，value=文件hash' }
]

// 下载参数
const downloadParams = [
  { name: 'id', type: 'int', required: true, desc: '版本ID（从检查更新接口获取）' },
  { name: 'device_id', type: 'string', required: false, desc: '设备唯一标识' }
]

// 错误码
const errorCodes = [
  { code: 0, msg: 'success', desc: '请求成功' },
  { code: 400, msg: 'bad request', desc: '请求参数错误' },
  { code: 401, msg: 'unauthorized', desc: 'API Key 无效或缺失' },
  { code: 404, msg: 'not found', desc: '资源不存在' },
  { code: 500, msg: 'internal error', desc: '服务器内部错误' }
]

// SDK 规划
const sdkPlans = [
  { platform: 'Windows', language: 'C#/.NET', features: '检查更新、下载、签名验证、安装', status: '计划中' },
  { platform: 'macOS', language: 'Swift', features: '检查更新、下载、签名验证', status: '计划中' },
  { platform: 'Linux', language: 'C/Go', features: '检查更新、下载、签名验证', status: '计划中' },
  { platform: 'Android', language: 'Kotlin/Java', features: '检查更新、下载、安装', status: '计划中' },
  { platform: 'Electron', language: 'JavaScript', features: '检查更新、下载、签名验证', status: '计划中' }
]
</script>

<style scoped>
.api-docs {
  padding: 0;
}

.doc-card {
  max-width: 1200px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.title {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
}

.section {
  margin-bottom: 32px;
}

.section:last-child {
  margin-bottom: 0;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 2px solid #e5e7eb;
}

.section-desc {
  color: #6b7280;
  margin-bottom: 16px;
}

.api-item {
  background: #f9fafb;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
}

.api-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.api-path {
  font-family: 'SF Mono', 'Fira Code', monospace;
  font-size: 14px;
  color: #3b82f6;
  background: #eff6ff;
  padding: 4px 8px;
  border-radius: 4px;
}

.api-desc {
  color: #6b7280;
  font-size: 14px;
}

.api-content h4 {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 8px;
}

.code-block {
  background: #1f2937;
  border-radius: 8px;
  padding: 16px;
  overflow-x: auto;
}

.code-block pre {
  margin: 0;
  color: #e5e7eb;
  font-family: 'SF Mono', 'Fira Code', monospace;
  font-size: 13px;
  line-height: 1.6;
  white-space: pre-wrap;
}

.method-tabs {
  background: #f9fafb;
  border-radius: 8px;
  padding: 16px;
}
</style>