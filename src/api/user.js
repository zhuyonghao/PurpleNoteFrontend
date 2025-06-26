import request from './request'

// 用户登录
export const login = (data) => {
  return request.post('/users/login', data)
}

// 用户注册
export const register = (data) => {
  return request.post('/users/register', data)
}

// 获取用户资料（当前用户）
export const getUserProfile = () => {
  return request.get('/users/profile')
}

// 获取指定用户资料
export const getUserById = (userId) => {
  return request.get(`/users/${userId}`)
}

// 更新用户资料
export const updateUserProfile = (data) => {
  return request.put('/users/profile', data)
}

// 上传头像
export const uploadAvatar = (file) => {
  const formData = new FormData()
  formData.append('avatar', file)
  return request.post('/users/upload/avatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}