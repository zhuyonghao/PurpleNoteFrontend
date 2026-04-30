import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { login as loginApi, register as registerApi, getUserProfile } from '@/api/user'
import router from '@/router'

export const useUserStore = defineStore('user', () => {
  const token = ref(localStorage.getItem('token') || '')
  const userInfo = ref(null)
  const isLoggedIn = ref(!!token.value)

  // 用户角色: user, admin, auditor
  const role = ref('')

  // 是否是管理员
  const isAdmin = computed(() => role.value === 'admin')

  // 是否是审核员
  const isAuditor = computed(() => role.value === 'auditor')

  // 是否可以访问管理后台
  const canAccessAdmin = computed(() => role.value === 'admin' || role.value === 'auditor')

  // 登录
  const loading = ref(false)
  const error = ref(null)
  
  const login = async (loginData) => {
    loading.value = true
    error.value = null
    
    try {
      const result = await loginApi(loginData)
      token.value = result
      localStorage.setItem('token', result)
      isLoggedIn.value = true
      
      // 延迟获取用户信息，避免立即失败
      setTimeout(async () => {
        try {
          await fetchUserProfile()
          // Login redirect: if user is admin or auditor, go to admin dashboard
          if (role.value === 'admin' || role.value === 'auditor') {
            router.push('/admin/dashboard')
          }
        } catch (err) {
          console.warn('获取用户信息失败，但登录成功')
        }
      }, 100)
      
      return result
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // 注册
  const register = async (registerData) => {
    try {
      const result = await registerApi(registerData)
      return result
    } catch (error) {
      throw error
    }
  }

  // 获取用户信息
  const fetchUserProfile = async () => {
    try {
      const result = await getUserProfile()
      userInfo.value = result
      role.value = result.role || 'user'  // 默认为普通用户
      return result
    } catch (error) {
      console.error('获取用户信息失败:', error)
      // 如果是用户不存在或token无效，自动登出
      if (error.message?.includes('用户不存在') || error.response?.status === 401) {
        ElMessage.warning('登录状态已失效，请重新登录')
        logout()
        // 跳转到登录页
        router.push('/login')
      }
      throw error
    }
  }

  // 登出
  const logout = () => {
    token.value = ''
    userInfo.value = null
    role.value = ''
    isLoggedIn.value = false
    localStorage.removeItem('token')
  }

  // 验证token有效性
  const validateToken = () => {
    if (!token.value) return false
    
    try {
      // 解析JWT token
      const payload = JSON.parse(atob(token.value.split('.')[1]))
      const currentTime = Math.floor(Date.now() / 1000)
      
      // 检查是否过期
      if (payload.exp && payload.exp < currentTime) {
        logout()
        return false
      }
      
      return true
    } catch (error) {
      console.error('Token解析失败:', error)
      logout()
      return false
    }
  }

  // 在store的返回对象中添加
  const initializeUser = async () => {
    if (token.value && !userInfo.value) {
      try {
        await fetchUserProfile()
      } catch (error) {
        console.error('初始化用户信息失败:', error)
        logout()
      }
    }
  }

  return {
    token,
    userInfo,
    isLoggedIn,
    role,
    isAdmin,
    isAuditor,
    canAccessAdmin,
    login,
    register,
    fetchUserProfile,
    logout,
    initializeUser
  }
})