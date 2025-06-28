import request from './request'

/** 
 * 发布内容接口 
 * @param {object} params 内容发布DTO 
 * @param {string} params.title 内容标题 
 * @param {string} params.text 内容正文 
 * @param {string} params.mediaUrl 媒体文件URL（图片/视频） 
 * @returns {Promise} 返回发布结果
 */ 
export function createContent(params) { 
  return request.post(`/contents`, params); 
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

/** 
 * 分页查询所有内容接口（按时间降序） 
 * @param {string} page 
 * @param {string} size 
 * @returns 
 */ 
export const getAllContentPageOrderByTime = (page, size) => {
  return request.get(`/contents/all/page?page=${page}&size=${size}`)
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

/** 
 * 查询用户内容数量接口 
 * @param {string} userId 
 * @returns 
 */ 
export function getUserContentCount(userId) { 
  return request.get(`/contents/users/${userId}/count`); 
}