<template>
  <div class="register-container">
    <div class="register-card">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-800 mb-2">注册小紫书</h1>
        <p class="text-gray-600">加入我们，分享美好生活</p>
      </div>
      
      <el-form :model="registerForm" :rules="rules" ref="registerFormRef">
        <el-form-item prop="username">
          <el-input
            v-model="registerForm.username"
            placeholder="用户名"
            size="large"
            prefix-icon="User"
          />
        </el-form-item>
        
        <el-form-item prop="password">
          <el-input
            v-model="registerForm.password"
            type="password"
            placeholder="密码"
            size="large"
            prefix-icon="Lock"
            show-password
          />
        </el-form-item>
        
        <el-form-item prop="confirmPassword">
          <el-input
            v-model="registerForm.confirmPassword"
            type="password"
            placeholder="确认密码"
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
            @click="handleRegister"
          >
            注册
          </el-button>
        </el-form-item>
      </el-form>
      
      <div class="text-center">
        <span class="text-gray-600">已有账号？</span>
        <router-link to="/login" class="text-primary-600 hover:text-primary-700 ml-1">
          立即登录
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
const registerFormRef = ref()
const loading = ref(false)

const registerForm = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const validateConfirmPassword = (rule, value, callback) => {
  if (value !== registerForm.password) {
    callback(new Error('两次输入密码不一致'))
  } else {
    callback()
  }
}

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在3到20个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ]
}

const handleRegister = async () => {
  if (!registerFormRef.value) return
  
  await registerFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        await userStore.register({
          username: registerForm.username,
          email: registerForm.email,
          password: registerForm.password
        })
        ElMessage.success('注册成功，请登录')
        router.push('/login')
      } catch (error) {
        console.error('注册失败:', error)
      } finally {
        loading.value = false
      }
    }
  })
}
</script>

<style scoped>
.register-container {
  min-height: 100vh !important;
  background: linear-gradient(135deg, var(--el-color-primary-light-4), var(--el-color-secondary-light-4)) !important;
  display: flex !important;
  align-items: flex-start !important;
  justify-content: center !important;
  padding: 1rem !important;
  padding-top: 15vh !important;
}

.register-card {
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
.register-card .el-form {
  text-align: left !important;
}

.register-card .text-center {
  text-align: center !important;
}

/* 确保按钮完全居中 */
.register-card .el-button {
  width: 100% !important;
  margin: 0 auto !important;
}

/* 响应式设计 */
@media (max-width: 640px) {
  .register-container {
    padding: 0.5rem !important;
    padding-top: 10vh !important;
  }
  
  .register-card {
    padding: 1.5rem !important;
    margin: 0.5rem auto !important;
  }
}

@media (max-height: 600px) {
  .register-container {
    padding-top: 5vh !important;
  }
}
</style>