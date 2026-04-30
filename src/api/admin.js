import request from './request'

// ===== 管理员 - 用户管理 =====

// 分页查询用户列表
export const getAdminUsersPage = (params) => {
  return request.get('/users/admin/users/page', { params })
}

// 修改用户状态
export const updateUserStatus = (id, status) => {
  return request.put(`/users/admin/users/${id}/status`, { status })
}

// ===== 管理员 - 内容管理 =====

// 分页查询所有内容
export const getAdminContentsPage = (params) => {
  return request.get('/contents/admin/page', { params })
}

// ===== 审核员 - 审核 =====

// 分页查询待审核内容
export const getAuditPage = (params) => {
  return request.get('/contents/audit/page', { params })
}

// 审核通过
export const approveContent = (id) => {
  return request.put(`/contents/audit/${id}/approve`)
}

// 审核驳回
export const rejectContent = (id, reason) => {
  return request.put(`/contents/audit/${id}/reject`, { reason })
}