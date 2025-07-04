import request from './request'

/**
 * 发表评论
 * @param {object} params 评论创建DTO
 * @param {number} params.contentId 内容ID
 * @param {string} params.content 评论内容
 * @param {string} params.parentId 父评论ID，顶级评论为null
 * @returns {Promise} 返回评论结果
 */
export const createComment = (params) => {
  return request.post('/comments', params)
}

/**
 * 删除评论
 * @param {string} commentId 评论ID
 * @returns {Promise} 返回删除结果
 */
export const deleteComment = (commentId) => {
  return request.delete(`/comments/${commentId}`)
}

/**
 * 获取内容的评论列表
 * @param {number} contentId 内容ID
 * @param {object} params 分页参数
 * @param {number} params.pageNum 页码，默认1
 * @param {number} params.pageSize 每页大小，默认10
 * @returns {Promise} 返回评论列表
 */
// 获取内容评论列表
export const getContentComments = (contentId, params = {}) => {
  return request({
    url: `/comments/content/${contentId}`,
    method: 'get',
    params: {
      pageNum: params.pageNum || 1,  // 修改为 pageNum
      pageSize: params.pageSize || 10
    }
  })
}

/**
 * 点赞评论
 * @param {string} commentId 评论ID
 * @returns {Promise} 返回点赞结果
 */
export const likeComment = (commentId) => {
  return request.post(`/comments/${commentId}/like`)
}

/**
 * 取消点赞评论
 * @param {string} commentId 评论ID
 * @returns {Promise} 返回取消点赞结果
 */
export const unlikeComment = (commentId) => {
  return request.delete(`/comments/${commentId}/like`)
}

/**
 * 获取评论点赞状态
 * @param {string} commentId 评论ID
 * @returns {Promise} 返回点赞状态
 */
export const getCommentLikeStatus = (commentId) => {
  return request.get(`/comments/${commentId}/like/status`)
}

/** 
 * 统计内容评论数 
 * @param {string} contentId 内容ID 
 * @returns {Promise} 返回评论数统计
 */ 
export const getContentCommentCount = (contentId) => {
  return request.get(`/comments/content/${contentId}/count`)
}