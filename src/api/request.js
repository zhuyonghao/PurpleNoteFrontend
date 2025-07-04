import axios from 'axios'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'

const request = axios.create({
  baseURL: '/api',
  timeout: 10000
})

// 请求拦截器
request.interceptors.request.use(
  config => {
    const userStore = useUserStore()
    if (userStore.token) {
      config.headers.authorization = `${userStore.token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  response => {
    const { code, message, data } = response.data
    if (code === 200) {
      return data
    } else {
      // 检查是否是需要静默处理的API
      const silentApis = [
        '/comments/content/',  // 评论数统计
        '/likes/status/',      // 点赞状态
        '/likes/content/'      // 点赞数统计
      ]
      
      const isSilentApi = silentApis.some(api => 
        response.config.url.includes(api)
      )
      
      if (!isSilentApi) {
        ElMessage.error(message || '请求失败')
      }
      return Promise.reject(new Error(message || '请求失败'))
    }
  },
  error => {
    // 检查是否是需要静默处理的API
    const silentApis = [
      '/comments/content/',
      '/likes/status/',
      '/likes/content/'
    ]
    
    const isSilentApi = silentApis.some(api => 
      error.config?.url?.includes(api)
    )
    
    if (error.response?.status === 401) {
      if (!isSilentApi) {
        const userStore = useUserStore()
        userStore.logout()
        ElMessage.error('登录已过期，请重新登录')
      }
    } else if (!isSilentApi) {
      ElMessage.error(error.message || '网络错误')
    }
    return Promise.reject(error)
  }
)

export default request