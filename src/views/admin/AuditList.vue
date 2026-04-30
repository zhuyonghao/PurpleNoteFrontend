<template>
  <div class="audit-list">
    <h2 class="page-title">审核台</h2>

    <el-card>
      <ContentTable :contents="adminStore.auditList" @view="handleViewContent" />

      <div class="pagination">
        <el-pagination
          v-model:current-page="page"
          v-model:page-size="pageSize"
          :total="adminStore.auditTotal"
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

const loadAuditList = async () => {
  await adminStore.fetchAuditList({
    page: page.value,
    pageSize: pageSize.value
  })
}

const handleSizeChange = (val) => {
  pageSize.value = val
  loadAuditList()
}

const handlePageChange = (val) => {
  page.value = val
  loadAuditList()
}

const handleViewContent = (id) => {
  router.push(`/admin/content/${id}`)
}

onMounted(() => {
  loadAuditList()
})
</script>

<style scoped>
.audit-list {
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