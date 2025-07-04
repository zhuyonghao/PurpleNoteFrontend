<template>
  <div class="comment-section">
    <!-- 评论输入框 -->
    <div v-if="userStore.isLoggedIn" class="comment-input-section mb-6">
      <div class="flex items-start space-x-3">
        <el-avatar :src="userStore.userInfo?.avatarUrl" :size="32">
          <el-icon><User /></el-icon>
        </el-avatar>
        <div class="flex-1">
          <el-input
            v-model="newComment"
            type="textarea"
            :rows="3"
            placeholder="写下你的评论..."
            maxlength="500"
            show-word-limit
            resize="none"
          />
          <div class="flex justify-end mt-2">
            <el-button
              type="primary"
              size="small"
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
    <div class="comment-list" ref="commentListRef">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-medium text-gray-800">
          评论 ({{ totalComments }})
        </h3>
      </div>

      <!-- 评论项 -->
      <div v-if="comments.length > 0" class="space-y-4">
        <div
          v-for="comment in comments"
          :key="comment.id"
          class="comment-item"
        >
          <CommentItem
            :comment="comment"
            :content-id="contentId"
            @reply="handleReply"
            @delete="handleDeleteComment"
            @like="handleLikeComment"
          />
        </div>
      </div>

      <!-- 空状态 -->
      <div v-else class="text-center py-8">
        <el-icon size="48" class="text-gray-300 mb-2">
          <ChatDotRound />
        </el-icon>
        <p class="text-gray-500">暂无评论，快来发表第一条评论吧！</p>
      </div>

      <!-- 加载状态和底部提示 -->
      <div class="text-center mt-6">
        <!-- 加载中 -->
        <div v-if="loading && comments.length > 0" class="py-4">
          <el-icon class="is-loading text-blue-500 text-xl">
            <Loading />
          </el-icon>
          <p class="text-gray-500 mt-2">正在加载更多评论...</p>
        </div>
        
        <!-- 已到底部 -->
        <div v-else-if="!hasMore && comments.length > 0" class="py-4">
          <el-divider>
            <span class="text-gray-500 text-base font-medium">已经到达底部了</span>
          </el-divider>
          <!-- 移动端额外提示 -->
          <div class="mt-2 text-center md:hidden">
            <el-tag size="small" type="info" effect="plain">
              <el-icon class="mr-1"><Check /></el-icon>
              所有评论已加载完成
            </el-tag>
          </div>
        </div>
        
        <!-- 手动加载按钮（备用） -->
        <div v-else-if="hasMore && !autoLoading" class="py-4">
          <el-button @click="loadMoreComments" :loading="loading" plain>
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
import { User, ChatDotRound, Loading, Check } from '@element-plus/icons-vue'

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
const totalPages = ref(0) // 添加总页数变量
const hasMore = ref(false)
const autoLoading = ref(true)
const commentListRef = ref(null)

// 滚动监听
let throttledScrollListener = null

onMounted(() => {
  loadComments()
  setupScrollListener()
})

onUnmounted(() => {
  removeScrollListener()
})

// 设置滚动监听
const setupScrollListener = () => {
  const scrollListener = () => {
    // 检查是否滚动到底部
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop
    const windowHeight = window.innerHeight
    const documentHeight = document.documentElement.scrollHeight
    
    // 距离底部100px时开始加载
    const threshold = 100
    const isNearBottom = scrollTop + windowHeight >= documentHeight - threshold
    
    // 添加更严格的检查条件
    if (isNearBottom && hasMore.value && !loading.value && autoLoading.value && currentPage.value < totalPages.value) {
      console.log('滚动到底部，自动加载下一页', {
        当前页: currentPage.value,
        总页数: totalPages.value,
        hasMore: hasMore.value
      })
      loadMoreComments()
    }
  }
  
  // 添加滚动监听，使用节流
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

// 移除滚动监听
const removeScrollListener = () => {
  if (throttledScrollListener) {
    window.removeEventListener('scroll', throttledScrollListener)
    throttledScrollListener = null
  }
}

// 查询单个评论点赞状态（异步，不阻塞页面显示）
const loadSingleCommentLikeStatus = async (comment) => {
  if (!userStore.isLoggedIn) {
    return
  }
  
  try {
    const isLiked = await getCommentLikeStatus(comment.id)
    console.log(`评论 ${comment.id} 点赞状态查询结果:`, isLiked)
    
    // 找到评论在数组中的索引
    const commentIndex = comments.value.findIndex(c => c.id === comment.id)
    if (commentIndex !== -1) {
      // 使用Vue的响应式更新方式
      comments.value[commentIndex] = {
        ...comments.value[commentIndex],
        isLiked: isLiked
      }
      console.log(`评论 ${comment.id} 点赞状态已更新:`, comments.value[commentIndex].isLiked)
    }
    
  } catch (error) {
    console.error(`查询评论 ${comment.id} 点赞状态失败:`, error)
  }
}

// 查询子评论点赞状态（异步，不阻塞页面显示）
const loadChildCommentLikeStatus = async (child) => {
  if (!userStore.isLoggedIn) {
    return
  }
  
  try {
    const isLiked = await getCommentLikeStatus(child.id)
    console.log(`子评论 ${child.id} 点赞状态查询结果:`, isLiked)
    
    // 找到父评论
    const parentComment = comments.value.find(comment => 
      comment.children && comment.children.some(c => c.id === child.id)
    )
    
    if (parentComment) {
      const childIndex = parentComment.children.findIndex(c => c.id === child.id)
      if (childIndex !== -1) {
        // 使用Vue的响应式更新方式
        parentComment.children[childIndex] = {
          ...parentComment.children[childIndex],
          isLiked: isLiked
        }
        console.log(`子评论 ${child.id} 点赞状态已更新:`, parentComment.children[childIndex].isLiked)
      }
    }
    
  } catch (error) {
    console.error(`查询子评论 ${child.id} 点赞状态失败:`, error)
  }
}

// 修改点赞处理函数，支持主评论和子评论
const handleLikeComment = async (comment) => {
  try {
    // 首先尝试在主评论中查找
    const commentIndex = comments.value.findIndex(c => c.id === comment.id)
    
    if (commentIndex !== -1) {
      // 处理主评论点赞
      const currentComment = comments.value[commentIndex]
      let response
      
      if (currentComment.isLiked) {
        response = await unlikeComment(comment.id)
        // 使用响应式更新
        comments.value[commentIndex] = {
          ...currentComment,
          isLiked: false,
          likeCount: Math.max(0, currentComment.likeCount - 1)
        }
      } else {
        response = await likeComment(comment.id)
        // 使用响应式更新
        comments.value[commentIndex] = {
          ...currentComment,
          isLiked: true,
          likeCount: currentComment.likeCount + 1
        }
      }
      
      console.log('主评论点赞操作响应:', response)
      
      // 重新查询点赞状态以确保数据一致性
      if (userStore.isLoggedIn) {
        setTimeout(() => {
          loadSingleCommentLikeStatus(comments.value[commentIndex])
        }, 100)
      }
    } else {
      // 在子评论中查找
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
        // 处理子评论点赞
        const currentChild = parentComment.children[childIndex]
        let response
        
        if (currentChild.isLiked) {
          response = await unlikeComment(comment.id)
          // 使用响应式更新子评论
          comments.value[parentIndex].children[childIndex] = {
            ...currentChild,
            isLiked: false,
            likeCount: Math.max(0, currentChild.likeCount - 1)
          }
        } else {
          response = await likeComment(comment.id)
          // 使用响应式更新子评论
          comments.value[parentIndex].children[childIndex] = {
            ...currentChild,
            isLiked: true,
            likeCount: currentChild.likeCount + 1
          }
        }
        
        console.log('子评论点赞操作响应:', response)
        
        // 重新查询子评论点赞状态以确保数据一致性
        if (userStore.isLoggedIn) {
          setTimeout(() => {
            loadChildCommentLikeStatus(comments.value[parentIndex].children[childIndex])
          }, 100)
        }
      } else {
        console.error('未找到要点赞的评论:', comment.id)
        return
      }
    }
  } catch (error) {
    console.error('评论点赞操作失败:', error)
    ElMessage.error('操作失败')
    
    // 操作失败时恢复原状态
    const commentIndex = comments.value.findIndex(c => c.id === comment.id)
    if (commentIndex !== -1) {
      // 主评论恢复
      const currentComment = comments.value[commentIndex]
      comments.value[commentIndex] = {
        ...currentComment,
        isLiked: !currentComment.isLiked,
        likeCount: currentComment.isLiked ? 
          currentComment.likeCount + 1 : 
          Math.max(0, currentComment.likeCount - 1)
      }
    } else {
      // 子评论恢复
      for (let i = 0; i < comments.value.length; i++) {
        if (comments.value[i].children && comments.value[i].children.length > 0) {
          const childIndex = comments.value[i].children.findIndex(child => child.id === comment.id)
          if (childIndex !== -1) {
            const currentChild = comments.value[i].children[childIndex]
            comments.value[i].children[childIndex] = {
              ...currentChild,
              isLiked: !currentChild.isLiked,
              likeCount: currentChild.isLiked ? 
                currentChild.likeCount + 1 : 
                Math.max(0, currentChild.likeCount - 1)
            }
            break
          }
        }
      }
    }
  }
}

// 异步加载评论点赞状态（不阻塞页面显示）
const loadCommentLikeStatusAsync = async (comments) => {
  if (!userStore.isLoggedIn || !comments.length) {
    return
  }
  
  console.log('开始异步查询评论点赞状态，评论数量:', comments.length)
  
  // 逐个查询评论点赞状态，不使用Promise.all
  for (const comment of comments) {
    // 查询主评论点赞状态
    await loadSingleCommentLikeStatus(comment)
    
    // 查询子评论点赞状态
    if (comment.children && comment.children.length > 0) {
      for (const child of comment.children) {
        await loadChildCommentLikeStatus(child)
      }
    }
    
    // 添加小延迟，避免请求过于频繁
    await new Promise(resolve => setTimeout(resolve, 50))
  }
  
  console.log('所有评论点赞状态查询完成')
}

// 修改加载评论函数
const loadComments = async (page = 1) => {
  try {
    loading.value = true
    console.log('加载评论，内容ID:', props.contentId, '页码:', page)
    
    const response = await getContentComments(props.contentId, {
      pageNum: page,
      pageSize: pageSize.value
    })
    
    console.log('评论列表响应:', response)
    
    if (response && response.list && Array.isArray(response.list)) {
      // 预处理评论数据，设置默认点赞状态
      const processedComments = response.list.map(comment => ({
        ...comment,
        isLiked: false, // 默认为未点赞，后续异步查询真实状态
        children: comment.children ? comment.children.map(child => ({
          ...child,
          isLiked: false // 默认为未点赞，后续异步查询真实状态
        })) : []
      }))
      
      // 立即更新页面显示
      if (page === 1) {
        comments.value = processedComments
      } else {
        comments.value.push(...processedComments)
      }
      
      totalComments.value = response.total || 0
      totalPages.value = response.totalPages || 0
      hasMore.value = response.currentPage < response.totalPages
      currentPage.value = response.currentPage
      
      console.log('评论数据处理完成:', {
        评论数量: response.list.length,
        总评论数: response.total,
        当前页: response.currentPage,
        总页数: response.totalPages,
        是否有更多: hasMore.value
      })
      
      // 页面显示后，异步查询点赞状态
      nextTick(() => {
        loadCommentLikeStatusAsync(processedComments)
      })
      
      if (!hasMore.value && comments.value.length > 0) {
        await nextTick()
        console.log('已加载所有评论，到达底部')
      }
    } else {
      console.warn('评论列表为空或格式错误:', response)
      comments.value = []
      totalComments.value = 0
      hasMore.value = false
    }
  } catch (error) {
    console.error('加载评论失败:', error)
    ElMessage.error('加载评论失败')
    comments.value = []
    totalComments.value = 0
    hasMore.value = false
  } finally {
    loading.value = false
  }
}

// 加载更多评论
const loadMoreComments = () => {
  if (hasMore.value && !loading.value) {
    const nextPage = currentPage.value + 1
    console.log('准备加载下一页:', {
      当前页: currentPage.value,
      下一页: nextPage,
      hasMore: hasMore.value,
      loading: loading.value
    })
    
    // 双重检查：确保下一页不会超过总页数
    if (nextPage <= totalPages.value) {
      loadComments(nextPage)
    } else {
      console.log('已到达最后一页，停止加载')
      hasMore.value = false
    }
  } else {
    console.log('无法加载更多:', { hasMore: hasMore.value, loading: loading.value })
  }
}

// 提交评论
const submitComment = async () => {
  if (!newComment.value.trim()) {
    ElMessage.warning('请输入评论内容')
    return
  }
  
  try {
    submitting.value = true
    console.log('提交评论:', {
      contentId: props.contentId,
      content: newComment.value.trim()
    })
    
    const response = await createComment({
      contentId: Number(props.contentId),
      content: newComment.value.trim(),
      parentId: null
    })
    
    console.log('评论提交响应:', response)
    
    // 清空输入框
    newComment.value = ''
    
    // 重新加载评论列表
    await loadComments(1)
    
    ElMessage.success('评论发表成功')
  } catch (error) {
    console.error('评论提交失败:', error)
    ElMessage.error('评论发表失败')
  } finally {
    submitting.value = false
  }
}

// 处理回复
const handleReply = async (parentComment, replyContent) => {
  try {
    console.log('回复评论:', {
      contentId: props.contentId,
      content: replyContent,
      parentId: parentComment.id
    })
    
    await createComment({
      contentId: Number(props.contentId),
      content: replyContent,
      parentId: parentComment.id
    })
    
    // 重新加载评论列表
    await loadComments(1)
    
    ElMessage.success('回复成功')
  } catch (error) {
    console.error('回复失败:', error)
    ElMessage.error('回复失败')
  }
}

// 处理删除评论
const handleDeleteComment = async (comment) => {
  try {
    await deleteComment(comment.id)
    
    // 重新加载评论列表
    await loadComments(1)
    
    ElMessage.success('评论删除成功')
  } catch (error) {
    console.error('删除评论失败:', error)
    ElMessage.error('删除评论失败')
  }
}
</script>

<style scoped>
.comment-section {
  @apply bg-white rounded-lg p-6;
}

.comment-input-section {
  @apply border-b border-gray-100 pb-6;
}

.comment-item {
  @apply border-b border-gray-50 pb-4 last:border-b-0;
}

.is-loading {
  animation: rotating 2s linear infinite;
}

@keyframes rotating {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>