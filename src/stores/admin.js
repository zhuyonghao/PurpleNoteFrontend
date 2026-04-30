import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  getAdminUsersPage,
  updateUserStatus,
  getAdminContentsPage,
  getAuditPage,
  approveContent,
  rejectContent
} from '@/api/admin'

export const useAdminStore = defineStore('admin', () => {
  // 用户列表
  const users = ref([])
  const usersTotal = ref(0)

  // 内容列表
  const contents = ref([])
  const contentsTotal = ref(0)

  // 审核列表
  const auditList = ref([])
  const auditTotal = ref(0)

  // 获取用户列表
  const fetchUsers = async (params) => {
    const res = await getAdminUsersPage(params)
    users.value = res.list
    usersTotal.value = res.total
  }

  // 更新用户状态
  const changeUserStatus = async (id, status) => {
    await updateUserStatus(id, status)
  }

  // 获取内容列表
  const fetchContents = async (params) => {
    const res = await getAdminContentsPage(params)
    contents.value = res.list
    contentsTotal.value = res.total
  }

  // 获取待审核列表
  const fetchAuditList = async (params) => {
    const res = await getAuditPage(params)
    auditList.value = res.list
    auditTotal.value = res.total
  }

  // 审核通过
  const doApprove = async (id) => {
    await approveContent(id)
  }

  // 审核驳回
  const doReject = async (id, reason) => {
    await rejectContent(id, reason)
  }

  return {
    users,
    usersTotal,
    contents,
    contentsTotal,
    auditList,
    auditTotal,
    fetchUsers,
    changeUserStatus,
    fetchContents,
    fetchAuditList,
    doApprove,
    doReject
  }
})