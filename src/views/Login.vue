<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-left">
        <div class="brand">
          <img :src="siteLogo" class="brand-logo" alt="logo" />
          <h1 class="brand-name">{{ siteName }}</h1>
        </div>
        <p class="brand-desc">专业的软件版本管理与分发平台</p>
        <div class="features">
          <div class="feature-item">
            <el-icon><Check /></el-icon>
            <span>多软件版本统一管理</span>
          </div>
          <div class="feature-item">
            <el-icon><Check /></el-icon>
            <span>智能升级分发策略</span>
          </div>
          <div class="feature-item">
            <el-icon><Check /></el-icon>
            <span>实时数据统计分析</span>
          </div>
        </div>
        <div class="copyright" v-if="showCopyright">
          <p>{{ copyright }}</p>
          <p class="beian" v-if="icp">
            <a :href="icpLink" target="_blank" rel="noopener">{{ icp }}</a>
          </p>
        </div>
      </div>
      
      <div class="login-right">
        <div class="login-form-wrapper">
          <h2 class="form-title">欢迎回来</h2>
          <p class="form-subtitle">请登录您的账户</p>
          
          <el-form
            ref="formRef"
            :model="form"
            :rules="rules"
            class="login-form"
            @keyup.enter="handleLogin"
          >
            <el-form-item prop="username">
              <el-input
                v-model="form.username"
                placeholder="用户名"
                size="large"
                :prefix-icon="User"
              />
            </el-form-item>
            
            <el-form-item prop="password">
              <el-input
                v-model="form.password"
                type="password"
                placeholder="密码"
                size="large"
                :prefix-icon="Lock"
                show-password
              />
            </el-form-item>
            
            <el-form-item>
              <div class="form-options">
                <el-checkbox v-model="rememberMe">记住我</el-checkbox>
                <el-link type="primary">忘记密码？</el-link>
              </div>
            </el-form-item>
            
            <el-form-item>
              <el-button
                type="primary"
                size="large"
                :loading="loading"
                class="login-btn"
                @click="handleLogin"
              >
                登录
              </el-button>
            </el-form-item>
          </el-form>
          
          <div class="login-footer">
            <p>还没有账户？<el-link type="primary">联系管理员</el-link></p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/stores/auth'
import { login } from '@/api/auth'
import config from '@/config'

const router = useRouter()
const authStore = useAuthStore()
const formRef = ref(null)

const loading = ref(false)
const rememberMe = ref(false)
const siteName = config.title
const siteLogo = config.logo
const copyright = config.copyright
const showCopyright = config.showCopyright
const icp = config.icp
const icpLink = config.icpLink

const form = reactive({
  username: '',
  password: ''
})

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ]
}

const handleLogin = async () => {
  const valid = await formRef.value.validate()
  if (!valid) return
  
  loading.value = true
  try {
    const response = await login({
      username: form.username,
      password: form.password
    })
    
    if (response.code !== 0) {
      ElMessage.error(response.msg || '登录失败')
      return
    }
    
    const { token, expires_in } = response.data
    authStore.login(token, { expires_in })
    
    ElMessage.success('登录成功')
    
    const redirect = router.currentRoute.value.query.redirect || '/dashboard'
    router.push(redirect)
  } catch (error) {
    ElMessage.error('登录失败，请检查网络连接')
    console.error('登录错误:', error)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  padding: 20px;
}

.login-container {
  display: flex;
  width: 100%;
  max-width: 1000px;
  min-height: 600px;
  background: #ffffff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

.login-left {
  flex: 1;
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  padding: 60px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  color: #ffffff;
}

.brand {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}

.brand-logo {
  width: 48px;
  height: 48px;
  object-fit: contain;
  border-radius: 8px;
}

.brand-name {
  font-size: 28px;
  font-weight: 700;
  margin: 0;
}

.brand-desc {
  font-size: 16px;
  opacity: 0.9;
  margin-bottom: 48px;
}

.features {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 15px;
  opacity: 0.9;
}

.feature-item .el-icon {
  font-size: 20px;
}

.copyright {
  margin-top: auto;
  padding-top: 48px;
  font-size: 12px;
  opacity: 0.7;
}

.copyright p {
  margin: 0;
}

.beian {
  margin-top: 8px;
}

.beian a {
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
}

.beian a:hover {
  color: #ffffff;
}

.login-right {
  flex: 1;
  padding: 60px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.login-form-wrapper {
  max-width: 360px;
  margin: 0 auto;
}

.form-title {
  font-size: 26px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 8px 0;
}

.form-subtitle {
  font-size: 15px;
  color: #6b7280;
  margin: 0 0 32px 0;
}

.login-form {
  margin-bottom: 24px;
}

.login-form :deep(.el-input__wrapper) {
  border-radius: 8px;
  padding: 4px 12px;
}

.form-options {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.login-btn {
  width: 100%;
  border-radius: 8px;
  height: 46px;
  font-size: 16px;
  font-weight: 500;
}

.login-footer {
  text-align: center;
  color: #6b7280;
  font-size: 14px;
}

/* 响应式 */
@media (max-width: 768px) {
  .login-container {
    flex-direction: column;
    min-height: auto;
  }
  
  .login-left {
    padding: 40px 24px;
    min-height: 200px;
  }
  
  .brand-name {
    font-size: 24px;
  }
  
  .brand-desc {
    font-size: 14px;
    margin-bottom: 24px;
  }
  
  .features {
    display: none;
  }
  
  .login-right {
    padding: 40px 24px;
  }
  
  .login-form-wrapper {
    max-width: 100%;
  }
}
</style>