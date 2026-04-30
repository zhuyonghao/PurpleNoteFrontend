<template>
  <div class="user-manage">
    <h2 class="page-title">用户管理</h2>

    <el-card>
      <UserTable :users="adminStore.users" @toggle-status="handleToggleStatus" />

      <div class="pagination">
        <el-pagination
          v-model:current-page="page"
          v-model:page-size="pageSize"
          :total="adminStore.usersTotal"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useAdminStore } from '@/stores/admin'
import UserTable from '@/components/admin/UserTable.vue'

const adminStore = useAdminStore()

const page = ref(1)
const pageSize = ref(10)

const loadUsers = async () => {
  await adminStore.fetchUsers({
    page: page.value,
    pageSize: pageSize.value
  })
}

const handleSizeChange = (val) => {
  pageSize.value = val
  loadUsers()
}

const handlePageChange = (val) => {
  page.value = val
  loadUsers()
}

const handleToggleStatus = async (id, status) => {
  try {
    await adminStore.changeUserStatus(id, status)
    ElMessage.success('操作成功')
    loadUsers()
  } catch (error) {
    ElMessage.error(error.message || '操作失败')
  }
}

onMounted(() => {
  loadUsers()
})
</script>

<style scoped>
.user-manage {
  padding: 0;
}

.page-title {
  margin: 0 0 20px 0;
  font-size: 24px;
  color: #333;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>