<template>
  <div class="content-manage">
    <h2 class="page-title">内容管理</h2>

    <el-card>
      <div class="filters">
        <el-select v-model="filterStatus" placeholder="选择状态" clearable @change="handleFilterChange">
          <el-option label="全部" :value="null" />
          <el-option label="待审核" :value="0" />
          <el-option label="通过" :value="1" />
          <el-option label="驳回" :value="2" />
          <el-option label="用户禁用" :value="3" />
        </el-select>
      </div>

      <ContentTable :contents="adminStore.contents" @view="handleViewContent" />

      <div class="pagination">
        <el-pagination
          v-model:current-page="page"
          v-model:page-size="pageSize"
          :total="adminStore.contentsTotal"
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
import { useRouter } from 'vue-router'
import { useAdminStore } from '@/stores/admin'
import ContentTable from '@/components/admin/ContentTable.vue'

const router = useRouter()
const adminStore = useAdminStore()

const page = ref(1)
const pageSize = ref(10)
const filterStatus = ref(null)

const loadContents = async () => {
  await adminStore.fetchContents({
    page: page.value,
    pageSize: pageSize.value,
    auditStatus: filterStatus.value
  })
}

const handleSizeChange = (val) => {
  pageSize.value = val
  loadContents()
}

const handlePageChange = (val) => {
  page.value = val
  loadContents()
}

const handleFilterChange = () => {
  page.value = 1
  loadContents()
}

const handleViewContent = (id) => {
  router.push(`/admin/content/${id}`)
}

onMounted(() => {
  loadContents()
})
</script>

<style scoped>
.content-manage {
  padding: 0;
}

.page-title {
  margin: 0 0 20px 0;
  font-size: 24px;
  color: #333;
}

.filters {
  margin-bottom: 16px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
