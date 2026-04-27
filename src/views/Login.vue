<template>
  <div class="login-container">
    <!-- 装饰性背景元素 -->
    <div class="decorative-circle circle-1"></div>
    <div class="decorative-circle circle-2"></div>
    <div class="decorative-circle circle-3"></div>

    <div class="login-card">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gradient mb-2">小紫书</h1>
        <p class="text-gray-500">发现生活之美</p>
      </div>

      <el-form :model="loginForm" :rules="rules" ref="loginFormRef" @submit.prevent="handleLogin">
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="用户名 / 邮箱"
            size="large"
            prefix-icon="User"
          />
        </el-form-item>

        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="密码"
            size="large"
            prefix-icon="Lock"
            show-password
          />
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            size="large"
            class="login-btn"
            :loading="loading"
            @click="handleLogin"
          >
            登录
          </el-button>
        </el-form-item>
      </el-form>

      <div class="text-center">
        <span class="text-gray-500">还没有账号？</span>
        <router-link to="/register" class="text-link ml-1">
          立即注册
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()
const loginFormRef = ref()
const loading = ref(false)

const loginForm = reactive({
  username: '',
  password: ''
})

const rules = {
  username: [
    { required: true, message: '请输入用户名或邮箱', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ]
}

const handleLogin = async () => {
  if (!loginFormRef.value) return

  await loginFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        await userStore.login(loginForm)
        ElMessage.success('登录成功')
        router.push('/home')
      } catch (error) {
        console.error('登录失败:', error)
      } finally {
        loading.value = false
      }
    }
  })
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  background: linear-gradient(180deg, #F8F7FA 0%, #F0EEF5 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  position: relative;
  overflow: hidden;
}

/* 装饰性圆形背景 */
.decorative-circle {
  position: absolute;
  border-radius: 50%;
  filter: blur(60px);
  opacity: 0.5;
  pointer-events: none;
}

.circle-1 {
  width: 300px;
  height: 300px;
  background: linear-gradient(135deg, #E8E0ED 0%, #D4A5A5 100%);
  top: -100px;
  right: -50px;
}

.circle-2 {
  width: 250px;
  height: 250px;
  background: linear-gradient(135deg, #B4A5BE 0%, #E8E0ED 100%);
  bottom: -80px;
  left: -60px;
}

.circle-3 {
  width: 180px;
  height: 180px;
  background: linear-gradient(135deg, #D4A5A5 0%, #B4A5BE 100%);
  top: 50%;
  left: 10%;
  opacity: 0.3;
}

.login-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(155, 138, 160, 0.1);
  border: 1px solid #E8E0ED;
  width: 100%;
  max-width: 26rem;
  padding: 2.5rem;
  margin: 0 auto;
  text-align: center;
  position: relative;
  z-index: 1;
  animation: slideUp 0.5s ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 渐变文字 */
.text-gradient {
  background: linear-gradient(135deg, #9B8AA0 0%, #B4A5BE 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* 表单样式 */
.login-card :deep(.el-form-item) {
  margin-bottom: 1.25rem;
}

.login-card :deep(.el-input__wrapper) {
  padding: 4px 11px;
  border-radius: 10px;
}

.login-card :deep(.el-input__inner) {
  --el-input-text-color: #374151;
  --el-input-placeholder-color: #9CA3AF;
}

.login-card :deep(.el-input__prefix .el-icon) {
  color: #B4A5BE;
}

/* 登录按钮 */
.login-btn {
  width: 100%;
  height: 44px;
  font-size: 16px;
  border-radius: 10px;
  background: linear-gradient(135deg, #9B8AA0 0%, #B4A5BE 100%);
  border: none;
  color: white;
  font-weight: 500;
  transition: all 0.2s ease;
  box-shadow: 0 2px 12px rgba(155, 138, 160, 0.25);
}

.login-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(155, 138, 160, 0.35);
  background: linear-gradient(135deg, #8A7A91 0%, #A695AD 100%);
}

.login-btn:active {
  transform: translateY(0);
}

/* 链接样式 */
.text-link {
  color: #9B8AA0;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s ease;
}

.text-link:hover {
  color: #7A6A7D;
}

/* 响应式设计 */
@media (max-width: 640px) {
  .login-card {
    padding: 2rem 1.5rem;
    margin: 0.5rem;
  }

  .decorative-circle {
    opacity: 0.3;
  }
}
</style>
