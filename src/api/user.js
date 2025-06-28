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
  return request.get(`/users/profile/${userId}`)
}

/**
 * 修改个人主页接口
 * @param {object} params 要修改的资料参数
 * @param {string} params.avatarUrl 头像URL
 * @param {string} params.bio 个人简介
 * @param {string} params.nickname 昵称
 * @returns 
 */
export const updateUserProfile = (params) => {
  return request.put('/users/profile', params)
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