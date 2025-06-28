import request from './request'

// 关注用户
export const followUser = (followedId) => {
  return request.post(`/follows/${followedId}`)
}

// 取消关注
export const unfollowUser = (followedId) => {
  return request.delete(`/follows/${followedId}`)
}

// 获取关注状态
export const getFollowStatus = (followedId) => {
  return request.get(`/follows/isFollow/${followedId}`)
}

// 获取关注列表
export const getFollowingList = (userId, params) => {
  return request.get(`/follows/users/${userId}/following`, { params })
}

// 获取粉丝列表
export const getFollowersList = (userId, params) => {
  return request.get(`/follows/users/${userId}/followers`, { params })
}

// 获取关注数
export const getFollowingCount = (userId) => {
  return request.get(`/follows/${userId}/following/count`)
}

// 获取粉丝数
export const getFollowerCount = (userId) => {
  return request.get(`/follows/${userId}/followers/count`)
}

/** 
 * 获取共同关注人数 
 * @param {string} targetUserId 
 * @returns 
 */ 
export const getMutualFollowsCount = (targetUserId) => {
  return request.get(`/follows/mutual/${targetUserId}/count`)
}