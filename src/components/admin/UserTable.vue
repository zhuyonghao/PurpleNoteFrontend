<template>
  <el-table :data="users" border style="width: 100%">
    <el-table-column prop="avatarUrl" label="头像" width="80">
      <template #default="{ row }">
        <el-avatar :src="row.avatarUrl" :size="40" />
      </template>
    </el-table-column>

    <el-table-column prop="username" label="用户名" min-width="120" />

    <el-table-column prop="role" label="角色" width="100">
      <template #default="{ row }">
        <el-tag :type="getRoleTagType(row.role)">
          {{ getRoleLabel(row.role) }}
        </el-tag>
      </template>
    </el-table-column>

    <el-table-column prop="status" label="状态" width="100">
      <template #default="{ row }">
        <el-tag :type="row.status === 0 ? 'success' : 'danger'">
          {{ row.status === 0 ? '正常' : '禁用' }}
        </el-tag>
      </template>
    </el-table-column>

    <el-table-column prop="createdAt" label="注册时间" width="180" />

    <el-table-column label="操作" width="150" fixed="right">
      <template #default="{ row }">
        <el-button
          :type="row.status === 0 ? 'danger' : 'success'"
          size="small"
          @click="handleToggleStatus(row)"
        >
          {{ row.status === 0 ? '禁用' : '启用' }}
        </el-button>
      </template>
    </el-table-column>
  </el-table>
</template>

<script setup>
import { ElMessage, ElMessageBox } from 'element-plus'

const props = defineProps({
  users: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['toggle-status'])

const getRoleLabel = (role) => {
  const map = { user: '普通用户', admin: '管理员', auditor: '审核员' }
  return map[role] || role
}

const getRoleTagType = (role) => {
  const map = { user: 'info', admin: 'warning', auditor: 'success' }
  return map[role] || 'info'
}

const handleToggleStatus = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要${row.status === 0 ? '禁用' : '启用'}用户 "${row.username}" 吗？`,
      '确认',
      { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }
    )
    emit('toggle-status', row.id, row.status === 0 ? 1 : 0)
  } catch {
    // 取消操作
  }
}
</script>
