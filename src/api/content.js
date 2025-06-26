import request from './request'

// 发布内容
export const createContent = (data) => {
  return request.post('/contents', data)
}

// 更新内容
export const updateContent = (data) => {
  return request.put('/contents', data)
}

// 获取内容详情
export const getContent = (id) => {
  return request.get(`/contents/${id}`)
}

// 删除内容
export const deleteContent = (id) => {
  return request.delete(`/contents/${id}`)
}

// 获取用户内容列表
export const getUserContentList = (userId, params = {}) => {
  return request.get(`/contents/user/${userId}`, { params })
}

// 分页获取内容
export const getContentPage = (params) => {
  return request.get('/contents/page', { params })
}

// 上传媒体文件
export const uploadMedia = (file) => {
  const formData = new FormData()
  formData.append('media', file)
  return request.post('/contents/upload/media', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}