<template>
  <el-table :data="contents" border style="width: 100%">
    <el-table-column prop="title" label="标题" min-width="200" show-overflow-tooltip />

    <el-table-column prop="userName" label="作者" width="120" />

    <el-table-column prop="auditStatus" label="状态" width="120">
      <template #default="{ row }">
        <el-tag :type="getStatusTagType(row.auditStatus)">
          {{ getStatusLabel(row.auditStatus) }}
        </el-tag>
      </template>
    </el-table-column>

    <el-table-column prop="createdAt" label="发布时间" width="180" />

    <el-table-column label="操作" width="100" fixed="right">
      <template #default="{ row }">
        <el-button type="primary" size="small" @click="handleView(row)">
          查看
        </el-button>
      </template>
    </el-table-column>
  </el-table>
</template>

<script setup>
const props = defineProps({
  contents: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['view'])

const statusMap = {
  0: { label: '待审核', type: 'warning' },
  1: { label: '通过', type: 'success' },
  2: { label: '驳回', type: 'danger' },
  3: { label: '用户禁用', type: 'info' }
}

const getStatusLabel = (status) => statusMap[status]?.label || '未知'
const getStatusTagType = (status) => statusMap[status]?.type || 'info'

const handleView = (row) => {
  emit('view', row.id)
}
</script>