import request from './request'

// 点赞内容
export const likeContent = (contentId) => {
  return request.post(`/likes/${contentId}`)
}

// 取消点赞
export const cancelLike = (contentId) => {
  return request.delete(`/likes/${contentId}`)
}

// 获取点赞状态
export const getLikeStatus = (contentId) => {
  return request.get(`/likes/status/${contentId}`)
}

// 获取用户点赞列表
export const getUserLikes = (userId, params) => {
  return request.get(`/likes/users/${userId}`, { params })
}

// 获取点赞排行榜
export const getLikeRank = () => {
  return request.get('/likes/rank')
}