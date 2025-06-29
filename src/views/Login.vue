<template>
  <div class="login-container">
    <div class="login-card">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-800 mb-2">小紫书</h1>
        <p class="text-gray-600">发现生活之美</p>
      </div>
      
      <el-form :model="loginForm" :rules="rules" ref="loginFormRef" @submit.prevent="handleLogin">
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="用户名/邮箱"
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
            class="w-full"
            :loading="loading"
            @click="handleLogin"
          >
            登录
          </el-button>
        </el-form-item>
      </el-form>
      
      <div class="text-center">
        <span class="text-gray-600">还没有账号？</span>
        <router-link to="/register" class="text-primary-600 hover:text-primary-700 ml-1">
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
  min-height: 100vh !important;
  background: linear-gradient(135deg, var(--el-color-primary-light-4), var(--el-color-secondary-light-4)) !important;
  display: flex !important;
  align-items: flex-start !important;
  justify-content: center !important;
  padding: 1rem !important;
  padding-top: 15vh !important;
}

.login-card {
  background: white !important;
  border-radius: 1rem !important;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25) !important;
  width: 100% !important;
  max-width: 28rem !important;
  padding: 2rem !important;
  margin: 0 auto !important;
  text-align: center !important;
}

/* 确保所有文本内容都居中 */
.login-card .el-form {
  text-align: left !important;
}

.login-card .text-center {
  text-align: center !important;
}

/* 确保按钮完全居中 */
.login-card .el-button {
  width: 100% !important;
  margin: 0 auto !important;
}

/* 响应式设计 */
@media (max-width: 640px) {
  .login-container {
    padding: 0.5rem !important;
    padding-top: 10vh !important;
  }
  
  .login-card {
    padding: 1.5rem !important;
    margin: 0.5rem auto !important;
  }
}

@media (max-height: 600px) {
  .login-container {
    padding-top: 5vh !important;
  }
}
</style>