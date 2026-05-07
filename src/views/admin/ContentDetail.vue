<template>
  <div class="content-detail">
    <h2 class="page-title">内容详情</h2>

    <el-card v-if="content">
      <!-- 基本信息 -->
      <div class="info-section">
        <h3>基本信息</h3>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="标题">{{ content.title }}</el-descriptions-item>
          <el-descriptions-item label="作者">
            <el-avatar :src="content.userAvatarUrl" :size="24" />
            {{ content.userName }}
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusTagType(content.auditStatus)">
              {{ getStatusLabel(content.auditStatus) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="发布时间">{{ formatDate(content.createdAt) }}</el-descriptions-item>
        </el-descriptions>
      </div>

      <!-- 内容正文 -->
      <div class="info-section">
        <h3>正文内容</h3>
        <div class="content-text">{{ content.text }}</div>
      </div>

      <!-- 媒体 -->
      <div v-if="content.mediaUrl" class="info-section">
        <h3>媒体</h3>
        <el-image
          :src="content.mediaUrl"
          :preview-src-list="[content.mediaUrl]"
          fit="cover"
          class="media-item"
        />
      </div>

      <!-- 审核操作（仅 auditor 可操作） -->
      <div v-if="userStore.isAuditor && content.auditStatus === 0" class="audit-actions">
        <el-button type="success" size="large" @click="handleApprove">审核通过</el-button>
        <el-button type="danger" size="large" @click="handleReject">审核驳回</el-button>
      </div>

      <!-- 驳回原因弹窗 -->
      <el-dialog v-model="rejectDialogVisible" title="驳回原因" width="500px">
        <el-input
          v-model="rejectReason"
          type="textarea"
          :rows="4"
          placeholder="请输入驳回原因"
        />
        <template #footer>
          <el-button @click="rejectDialogVisible = false">取消</el-button>
          <el-button type="danger" @click="confirmReject">确认驳回</el-button>
        </template>
      </el-dialog>
    </el-card>

    <el-button class="back-btn" @click="router.back()">返回</el-button>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { useAdminStore } from '@/stores/admin'
import { getContent } from '@/api/content'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const adminStore = useAdminStore()

const content = ref(null)
const rejectDialogVisible = ref(false)
const rejectReason = ref('')
const contentId = route.params.id

const statusMap = {
  0: { label: '待审核', type: 'warning' },
  1: { label: '通过', type: 'success' },
  2: { label: '驳回', type: 'danger' },
  3: { label: '用户禁用', type: 'info' }
}

const getStatusLabel = (status) => statusMap[status]?.label || '未知'
const getStatusTagType = (status) => statusMap[status]?.type || 'info'

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const loadContent = async () => {
  try {
    const res = await getContent(contentId)
    content.value = res
  } catch (error) {
    ElMessage.error('获取内容详情失败')
    router.back()
  }
}

const handleApprove = async () => {
  try {
    await adminStore.doApprove(contentId)
    ElMessage.success('审核通过')
    loadContent()
  } catch (error) {
    ElMessage.error(error.message || '操作失败')
  }
}

const handleReject = () => {
  rejectReason.value = ''
  rejectDialogVisible.value = true
}

const confirmReject = async () => {
  if (!rejectReason.value.trim()) {
    ElMessage.warning('请输入驳回原因')
    return
  }
  try {
    await adminStore.doReject(contentId, rejectReason.value)
    ElMessage.success('已驳回')
    rejectDialogVisible.value = false
    loadContent()
  } catch (error) {
    ElMessage.error(error.message || '操作失败')
  }
}

onMounted(() => {
  loadContent()
})
</script>

<style scoped>
.content-detail {
  padding: 0;
}

.page-title {
  margin: 0 0 20px 0;
  font-size: 24px;
  color: #333;
}

.info-section {
  margin-bottom: 24px;
}

.info-section h3 {
  margin: 0 0 12px 0;
  color: #333;
}

.content-text {
  color: #666;
  line-height: 1.8;
  white-space: pre-wrap;
}

.media-item {
  max-width: 400px;
  border-radius: 8px;
}

.audit-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  padding: 20px 0;
  border-top: 1px solid #eee;
  margin-top: 20px;
}

.back-btn {
  margin-top: 20px;
}
</style>