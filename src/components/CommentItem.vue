<template>
  <div class="comment-item">
    <div class="comment-main">
      <!-- 用户头像 -->
      <el-avatar :src="comment.userAvatar" :size="40" class="comment-avatar">
        <el-icon><User /></el-icon>
      </el-avatar>

      <div class="comment-body">
        <!-- 评论卡片 -->
        <div class="comment-card">
          <div class="comment-header">
            <div class="comment-user">
              <span class="username">{{ comment.username }}</span>
              <el-tag v-if="isAuthor" size="small" class="author-tag">作者</el-tag>
            </div>
            <span class="comment-time">{{ formatDate(comment.createdAt) }}</span>
          </div>

          <p class="comment-content">{{ comment.content }}</p>
        </div>

        <!-- 操作按钮 -->
        <div class="comment-actions">
          <div class="action-left">
            <!-- 点赞按钮 -->
            <div
              v-if="userStore.isLoggedIn"
              class="action-btn"
              :class="{ 'is-liked': comment.isLiked }"
              @click="handleLike"
            >
              <el-icon size="14">
                <StarFilled v-if="comment.isLiked" />
                <Star v-else />
              </el-icon>
              <span>{{ comment.likeCount || 0 }}</span>
            </div>

            <!-- 回复按钮 -->
            <div
              v-if="userStore.isLoggedIn"
              class="action-btn"
              @click="toggleReply"
            >
              <el-icon size="14"><ChatDotRound /></el-icon>
              <span>回复</span>
            </div>
          </div>

          <!-- 删除按钮 -->
          <div
            v-if="canDelete"
            class="action-btn delete-btn"
            @click="handleDelete"
          >
            <el-icon size="14"><Delete /></el-icon>
          </div>
        </div>

        <!-- 回复输入框 -->
        <transition name="slide">
          <div v-if="showReplyInput" class="reply-input-wrapper">
            <el-input
              v-model="replyContent"
              type="textarea"
              :rows="2"
              :placeholder="`回复 ${comment.username}...`"
              maxlength="500"
              show-word-limit
              resize="none"
              class="reply-input"
            />
            <div class="reply-actions">
              <el-button size="small" @click="cancelReply">取消</el-button>
              <el-button
                type="primary"
                size="small"
                @click="submitReply"
                :loading="replyLoading"
                :disabled="!replyContent.trim()"
              >
                发送回复
              </el-button>
            </div>
          </div>
        </transition>

        <!-- 子评论区域 -->
        <div v-if="comment.children && comment.children.length > 0" class="child-comments">
          <div class="child-header">
            <span class="child-count">{{ comment.children.length }} 条回复</span>
          </div>

          <div
            v-for="child in comment.children"
            :key="child.id"
            class="child-comment"
          >
            <el-avatar :src="child.userAvatar" :size="28" class="child-avatar">
              <el-icon><User /></el-icon>
            </el-avatar>

            <div class="child-body">
              <div class="child-header">
                <div class="child-user">
                  <span class="username">{{ child.username }}</span>
                  <el-tag v-if="isChildAuthor(child)" size="small" class="author-tag">作者</el-tag>
                </div>
              </div>

              <p class="child-content">{{ child.content }}</p>

              <div class="child-actions">
                <span class="child-time">{{ formatDate(child.createdAt) }}</span>
                <div class="action-btn" @click="() => handleChildLike(child)">
                  <el-icon size="12">
                    <StarFilled v-if="child.isLiked" />
                    <Star v-else />
                  </el-icon>
                  <span>{{ child.likeCount || 0 }}</span>
                </div>
                <div
                  v-if="canDeleteChild(child)"
                  class="action-btn delete-btn"
                  @click="() => handleChildDelete(child)"
                >
                  <el-icon size="12"><Delete /></el-icon>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { User, Star, StarFilled, ChatDotRound, Delete } from '@element-plus/icons-vue'

const props = defineProps({
  comment: {
    type: Object,
    required: true
  },
  contentId: {
    type: [String, Number],
    required: true
  },
  authorId: {
    type: [String, Number],
    default: null
  }
})

const emit = defineEmits(['reply', 'delete', 'like'])

const userStore = useUserStore()
const showReplyInput = ref(false)
const replyContent = ref('')
const replyLoading = ref(false)

const isAuthor = computed(() => {
  return props.authorId && props.comment.userId === props.authorId
})

const isChildAuthor = (child) => {
  return props.authorId && child.userId === props.authorId
}

const canDelete = computed(() => {
  return userStore.isLoggedIn &&
         userStore.userInfo &&
         userStore.userInfo.id === props.comment.userId
})

const canDeleteChild = (child) => {
  return userStore.isLoggedIn &&
         userStore.userInfo &&
         userStore.userInfo.id === child.userId
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  const now = new Date()
  const diff = now - date

  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 7) return `${days}天前`

  return date.toLocaleDateString('zh-CN', {
    month: 'short',
    day: 'numeric'
  })
}

const toggleReply = () => {
  showReplyInput.value = !showReplyInput.value
  if (!showReplyInput.value) {
    replyContent.value = ''
  }
}

const cancelReply = () => {
  showReplyInput.value = false
  replyContent.value = ''
}

const submitReply = async () => {
  if (!replyContent.value.trim()) {
    ElMessage.warning('请输入回复内容')
    return
  }

  replyLoading.value = true
  try {
    await emit('reply', props.comment, replyContent.value.trim())
    showReplyInput.value = false
    replyContent.value = ''
  } finally {
    replyLoading.value = false
  }
}

const handleLike = () => {
  emit('like', props.comment)
}

const handleChildLike = (child) => {
  emit('like', child)
}

const handleDelete = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要删除这条评论吗？',
      '确认删除',
      {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    emit('delete', props.comment)
  } catch {
    // 用户取消删除
  }
}

const handleChildDelete = async (child) => {
  try {
    await ElMessageBox.confirm(
      '确定要删除这条回复吗？',
      '确认删除',
      {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    emit('delete', child)
  } catch {
    // 用户取消删除
  }
}
</script>

<style scoped>
.comment-item {
  padding: 16px 0;
  border-bottom: 1px solid #F0EEF5;
}

.comment-item:last-child {
  border-bottom: none;
}

.comment-main {
  display: flex;
  gap: 12px;
}

.comment-avatar {
  flex-shrink: 0;
  border: 2px solid #E8E0ED;
}

.comment-body {
  flex: 1;
  min-width: 0;
}

.comment-card {
  background: #FAFAFA;
  border-radius: 12px;
  padding: 12px 14px;
  margin-bottom: 10px;
}

.comment-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.comment-user {
  display: flex;
  align-items: center;
  gap: 8px;
}

.username {
  font-size: 13px;
  font-weight: 600;
  color: #374151;
}

.author-tag {
  background: linear-gradient(135deg, #E8E0ED 0%, #D4A5A5 100%);
  border: none;
  color: white;
  font-size: 10px;
}

.comment-time {
  font-size: 11px;
  color: #9CA3AF;
}

.comment-content {
  font-size: 14px;
  color: #374151;
  line-height: 1.5;
  word-break: break-word;
}

/* 操作按钮 */
.comment-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 4px;
}

.action-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #9CA3AF;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.action-btn:hover {
  background: #F8F7FA;
  color: #6B7280;
}

.action-btn.is-liked {
  color: #D4A5A5;
}

.delete-btn:hover {
  color: #DC6855;
  background: #FDF9F9;
}

/* 回复输入框 */
.reply-input-wrapper {
  margin-top: 12px;
  padding: 12px;
  background: #FAFAFA;
  border-radius: 12px;
  border: 1px solid #E8E0ED;
}

.reply-input :deep(.el-textarea__inner) {
  border: none;
  background: transparent;
  padding: 0;
}

.reply-input :deep(.el-input__count) {
  background: transparent;
}

.reply-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 10px;
}

.reply-actions .el-button {
  border-radius: 16px;
  padding: 6px 14px;
  font-size: 12px;
}

.reply-actions .el-button--primary {
  background: linear-gradient(135deg, #9B8AA0 0%, #B4A5BE 100%);
  border: none;
}

/* 子评论 */
.child-comments {
  margin-top: 12px;
  padding-left: 16px;
  border-left: 2px solid #E8E0ED;
}

.child-header {
  margin-bottom: 8px;
}

.child-count {
  font-size: 12px;
  color: #9CA3AF;
  padding: 2px 10px;
  background: #F3F0F5;
  border-radius: 10px;
}

.child-comment {
  display: flex;
  gap: 10px;
  padding: 10px 0;
}

.child-comment:not(:last-child) {
  border-bottom: 1px dashed #F0EEF5;
}

.child-avatar {
  flex-shrink: 0;
  border: 1px solid #E8E0ED;
}

.child-body {
  flex: 1;
  min-width: 0;
}

.child-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.child-user {
  display: flex;
  align-items: center;
  gap: 6px;
}

.child-content {
  font-size: 13px;
  color: #374151;
  line-height: 1.5;
  margin-bottom: 6px;
}

.child-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.child-time {
  font-size: 11px;
  color: #9CA3AF;
}

/* 动画 */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.2s ease;
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
