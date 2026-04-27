<template>
  <div class="comment-section">
    <!-- 评论输入框 -->
    <div v-if="userStore.isLoggedIn" class="comment-input-section">
      <div class="input-main">
        <el-avatar :src="userStore.userInfo?.avatarUrl" :size="36" class="input-avatar">
          <el-icon><User /></el-icon>
        </el-avatar>
        <div class="input-wrapper">
          <el-input
            v-model="newComment"
            type="textarea"
            :rows="3"
            placeholder="写下你的评论..."
            maxlength="500"
            show-word-limit
            resize="none"
            class="comment-input"
          />
          <div class="input-actions">
            <el-button
              type="primary"
              size="small"
              class="submit-btn"
              @click="submitComment"
              :loading="submitting"
              :disabled="!newComment.trim()"
            >
              发表评论
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 评论列表 -->
    <div class="comment-list">
      <div class="list-header">
        <h3 class="list-title">评论 ({{ totalComments }})</h3>
      </div>

      <!-- 评论项 -->
      <div v-if="comments.length > 0" class="comment-items">
        <CommentItem
          v-for="comment in comments"
          :key="comment.id"
          :comment="comment"
          :content-id="contentId"
          @reply="handleReply"
          @delete="handleDeleteComment"
          @like="handleLikeComment"
        />
      </div>

      <!-- 空状态 -->
      <div v-else class="empty-state">
        <el-icon size="40" class="empty-icon"><ChatDotRound /></el-icon>
        <p class="empty-text">暂无评论，快来发表第一条评论吧！</p>
      </div>

      <!-- 加载状态和底部提示 -->
      <div class="list-footer">
        <!-- 加载中 -->
        <div v-if="loading && comments.length > 0" class="loading-more">
          <el-icon class="is-loading"><Loading /></el-icon>
          <span>正在加载更多评论...</span>
        </div>

        <!-- 已到底部 -->
        <div v-else-if="!hasMore && comments.length > 0" class="end-of-list">
          <el-divider>
            <span class="end-text">已经到达底部了</span>
          </el-divider>
        </div>

        <!-- 手动加载按钮 -->
        <div v-else-if="hasMore && !autoLoading" class="load-more">
          <el-button class="load-more-btn" @click="loadMoreComments" :loading="loading">
            点击加载更多评论
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { createComment, getContentComments, deleteComment, likeComment, unlikeComment, getCommentLikeStatus } from '@/api/comment'
import CommentItem from './CommentItem.vue'
import { User, ChatDotRound, Loading } from '@element-plus/icons-vue'

const props = defineProps({
  contentId: {
    type: [String, Number],
    required: true
  }
})

const userStore = useUserStore()
const comments = ref([])
const newComment = ref('')
const loading = ref(false)
const submitting = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const totalComments = ref(0)
const totalPages = ref(0)
const hasMore = ref(false)
const autoLoading = ref(true)
const commentListRef = ref(null)

let throttledScrollListener = null

onMounted(() => {
  loadComments()
  setupScrollListener()
})

onUnmounted(() => {
  removeScrollListener()
})

const setupScrollListener = () => {
  const scrollListener = () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop
    const windowHeight = window.innerHeight
    const documentHeight = document.documentElement.scrollHeight

    const threshold = 100
    const isNearBottom = scrollTop + windowHeight >= documentHeight - threshold

    if (isNearBottom && hasMore.value && !loading.value && autoLoading.value && currentPage.value < totalPages.value) {
      loadMoreComments()
    }
  }

  let ticking = false
  throttledScrollListener = () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        scrollListener()
        ticking = false
      })
      ticking = true
    }
  }

  window.addEventListener('scroll', throttledScrollListener, { passive: true })
}

const removeScrollListener = () => {
  if (throttledScrollListener) {
    window.removeEventListener('scroll', throttledScrollListener)
    throttledScrollListener = null
  }
}

const loadSingleCommentLikeStatus = async (comment) => {
  if (!userStore.isLoggedIn) return

  try {
    const isLiked = await getCommentLikeStatus(comment.id)
    const commentIndex = comments.value.findIndex(c => c.id === comment.id)
    if (commentIndex !== -1) {
      comments.value[commentIndex] = {
        ...comments.value[commentIndex],
        isLiked: isLiked
      }
    }
  } catch (error) {
    console.error(`查询评论 ${comment.id} 点赞状态失败:`, error)
  }
}

const loadChildCommentLikeStatus = async (child) => {
  if (!userStore.isLoggedIn) return

  try {
    const isLiked = await getCommentLikeStatus(child.id)
    const parentComment = comments.value.find(comment =>
      comment.children && comment.children.some(c => c.id === child.id)
    )

    if (parentComment) {
      const childIndex = parentComment.children.findIndex(c => c.id === child.id)
      if (childIndex !== -1) {
        parentComment.children[childIndex] = {
          ...parentComment.children[childIndex],
          isLiked: isLiked
        }
      }
    }
  } catch (error) {
    console.error(`查询子评论 ${child.id} 点赞状态失败:`, error)
  }
}

const handleLikeComment = async (comment) => {
  try {
    const commentIndex = comments.value.findIndex(c => c.id === comment.id)

    if (commentIndex !== -1) {
      const currentComment = comments.value[commentIndex]

      if (currentComment.isLiked) {
        await unlikeComment(comment.id)
        comments.value[commentIndex] = {
          ...currentComment,
          isLiked: false,
          likeCount: Math.max(0, currentComment.likeCount - 1)
        }
      } else {
        await likeComment(comment.id)
        comments.value[commentIndex] = {
          ...currentComment,
          isLiked: true,
          likeCount: currentComment.likeCount + 1
        }
      }

      if (userStore.isLoggedIn) {
        setTimeout(() => {
          loadSingleCommentLikeStatus(comments.value[commentIndex])
        }, 100)
      }
    } else {
      let parentComment = null
      let childIndex = -1
      let parentIndex = -1

      for (let i = 0; i < comments.value.length; i++) {
        if (comments.value[i].children && comments.value[i].children.length > 0) {
          const foundChildIndex = comments.value[i].children.findIndex(child => child.id === comment.id)
          if (foundChildIndex !== -1) {
            parentComment = comments.value[i]
            childIndex = foundChildIndex
            parentIndex = i
            break
          }
        }
      }

      if (parentComment && childIndex !== -1) {
        const currentChild = parentComment.children[childIndex]

        if (currentChild.isLiked) {
          await unlikeComment(comment.id)
          comments.value[parentIndex].children[childIndex] = {
            ...currentChild,
            isLiked: false,
            likeCount: Math.max(0, currentChild.likeCount - 1)
          }
        } else {
          await likeComment(comment.id)
          comments.value[parentIndex].children[childIndex] = {
            ...currentChild,
            isLiked: true,
            likeCount: currentChild.likeCount + 1
          }
        }

        if (userStore.isLoggedIn) {
          setTimeout(() => {
            loadChildCommentLikeStatus(comments.value[parentIndex].children[childIndex])
          }, 100)
        }
      }
    }
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

const loadCommentLikeStatusAsync = async (comments) => {
  if (!userStore.isLoggedIn || !comments.length) return

  for (const comment of comments) {
    await loadSingleCommentLikeStatus(comment)

    if (comment.children && comment.children.length > 0) {
      for (const child of comment.children) {
        await loadChildCommentLikeStatus(child)
      }
    }

    await new Promise(resolve => setTimeout(resolve, 50))
  }
}

const loadComments = async (page = 1) => {
  try {
    loading.value = true

    const response = await getContentComments(props.contentId, {
      pageNum: page,
      pageSize: pageSize.value
    })

    if (response && response.list && Array.isArray(response.list)) {
      const processedComments = response.list.map(comment => ({
        ...comment,
        isLiked: false,
        children: comment.children ? comment.children.map(child => ({
          ...child,
          isLiked: false
        })) : []
      }))

      if (page === 1) {
        comments.value = processedComments
      } else {
        comments.value.push(...processedComments)
      }

      totalComments.value = response.total || 0
      totalPages.value = response.totalPages || 0
      hasMore.value = response.currentPage < response.totalPages
      currentPage.value = response.currentPage

      nextTick(() => {
        loadCommentLikeStatusAsync(processedComments)
      })
    } else {
      comments.value = []
      totalComments.value = 0
      hasMore.value = false
    }
  } catch (error) {
    ElMessage.error('加载评论失败')
    comments.value = []
    totalComments.value = 0
    hasMore.value = false
  } finally {
    loading.value = false
  }
}

const loadMoreComments = () => {
  if (hasMore.value && !loading.value) {
    const nextPage = currentPage.value + 1
    if (nextPage <= totalPages.value) {
      loadComments(nextPage)
    } else {
      hasMore.value = false
    }
  }
}

const submitComment = async () => {
  if (!newComment.value.trim()) {
    ElMessage.warning('请输入评论内容')
    return
  }

  try {
    submitting.value = true

    await createComment({
      contentId: Number(props.contentId),
      content: newComment.value.trim(),
      parentId: null
    })

    newComment.value = ''
    await loadComments(1)
    ElMessage.success('评论发表成功')
  } catch (error) {
    ElMessage.error('评论发表失败')
  } finally {
    submitting.value = false
  }
}

const handleReply = async (parentComment, replyContent) => {
  try {
    await createComment({
      contentId: Number(props.contentId),
      content: replyContent,
      parentId: parentComment.id
    })

    await loadComments(1)
    ElMessage.success('回复成功')
  } catch (error) {
    ElMessage.error('回复失败')
  }
}

const handleDeleteComment = async (comment) => {
  try {
    await deleteComment(comment.id)
    await loadComments(1)
    ElMessage.success('评论删除成功')
  } catch (error) {
    ElMessage.error('删除评论失败')
  }
}
</script>

<style scoped>
.comment-section {
  background: white;
  border-radius: 16px;
  padding: 20px;
  margin-top: 16px;
  box-shadow: 0 2px 16px rgba(155, 138, 160, 0.08);
  border: 1px solid #F0EEF5;
}

/* 评论输入框 */
.comment-input-section {
  padding-bottom: 20px;
  border-bottom: 1px solid #F0EEF5;
  margin-bottom: 20px;
}

.input-main {
  display: flex;
  gap: 12px;
}

.input-avatar {
  flex-shrink: 0;
  border: 2px solid #E8E0ED;
}

.input-wrapper {
  flex: 1;
}

.comment-input :deep(.el-textarea__inner) {
  border-radius: 12px;
  padding: 12px;
  border-color: #E8E0ED;
  transition: all 0.2s ease;
}

.comment-input :deep(.el-textarea__inner:hover) {
  border-color: #B4A5BE;
}

.comment-input :deep(.el-textarea__inner:focus) {
  border-color: #9B8AA0 !important;
}

.comment-input :deep(.el-input__count) {
  background: transparent;
  color: #B4A5BE;
}

.input-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;
}

.submit-btn {
  padding: 8px 20px;
  border-radius: 18px;
  background: linear-gradient(135deg, #9B8AA0 0%, #B4A5BE 100%);
  border: none;
  font-size: 13px;
}

.submit-btn:hover:not(.is-disabled) {
  opacity: 0.9;
}

/* 评论列表 */
.list-header {
  margin-bottom: 16px;
}

.list-title {
  font-size: 16px;
  font-weight: 600;
  color: #374151;
}

.comment-items {
  margin-bottom: 16px;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 32px 0;
}

.empty-icon {
  color: #D4D0DB;
  margin-bottom: 12px;
}

.empty-text {
  font-size: 14px;
  color: #9CA3AF;
}

/* 底部 */
.list-footer {
  text-align: center;
  padding-top: 16px;
}

.loading-more {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #9CA3AF;
  font-size: 13px;
}

.loading-more .is-loading {
  color: #B4A5BE;
}

.end-of-list {
  color: #9CA3AF;
}

.end-text {
  font-size: 13px;
  color: #9CA3AF;
}

.load-more {
  padding: 12px 0;
}

.load-more-btn {
  padding: 10px 24px;
  border-radius: 20px;
  border-color: #E8E0ED;
  color: #9B8AA0;
  font-size: 13px;
}

.load-more-btn:hover {
  border-color: #B4A5BE;
  color: #9B8AA0;
  background: #F8F7FA;
}

.is-loading {
  opacity: 0.6;
}
</style>
