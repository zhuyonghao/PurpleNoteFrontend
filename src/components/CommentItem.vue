<template>
  <div class="comment-item">
    <div class="flex items-start space-x-3">
      <!-- 用户头像 -->
      <div class="relative flex-shrink-0">
        <el-avatar :src="comment.userAvatar" :size="40" class="ring-2 ring-gray-100 hover:ring-blue-200 transition-all duration-200">
          <el-icon><User /></el-icon>
        </el-avatar>
        <!-- 在线状态指示器 -->
        <div class="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
      </div>
      
      <div class="flex-1 min-w-0">
        <!-- 评论卡片 -->
        <div class="bg-gray-50 rounded-2xl px-4 py-3 hover:bg-gray-100 transition-colors duration-200">
          <!-- 用户名和时间 -->
          <div class="flex items-center justify-between mb-2">
            <div class="flex items-center space-x-2">
              <span class="font-semibold text-gray-900 hover:text-blue-600 cursor-pointer transition-colors">{{ comment.username }}</span>
              <el-tag v-if="isAuthor" size="small" type="warning" effect="light">作者</el-tag>
            </div>
            <span class="text-xs text-gray-500 bg-white px-2 py-1 rounded-full">{{ formatDate(comment.createdAt) }}</span>
          </div>
          
          <!-- 评论内容 -->
          <div class="prose prose-sm max-w-none">
            <p class="text-gray-800 leading-relaxed break-words mb-0">{{ comment.content }}</p>
          </div>
        </div>
        
        <!-- 操作按钮 -->
        <div class="flex items-center justify-between mt-3 px-2">
          <div class="flex items-center space-x-6">
            <!-- 点赞按钮 -->
            <button
              v-if="userStore.isLoggedIn"
              @click="handleLike"
              class="group flex items-center space-x-2 text-sm font-medium transition-all duration-200 hover:scale-105"
              :class="comment.isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'"
            >
              <div class="relative">
                <el-icon :size="16" class="transition-transform duration-200 group-hover:scale-110">
                  <component :is="comment.isLiked ? 'StarFilled' : 'Star'" />
                </el-icon>
                <div v-if="comment.isLiked" class="absolute inset-0 animate-ping">
                  <el-icon :size="16" class="text-red-300">
                    <StarFilled />
                  </el-icon>
                </div>
              </div>
              <span class="select-none">{{ comment.likeCount || 0 }}</span>
            </button>
            
            <!-- 回复按钮 -->
            <button
              v-if="userStore.isLoggedIn"
              @click="toggleReply"
              class="flex items-center space-x-1 text-sm font-medium text-gray-500 hover:text-blue-500 transition-all duration-200 hover:scale-105"
            >
              <el-icon :size="16">
                <ChatDotRound />
              </el-icon>
              <span>回复</span>
            </button>
          </div>
          
          <!-- 删除按钮 -->
          <button
            v-if="canDelete"
            @click="handleDelete"
            class="flex items-center space-x-1 text-sm font-medium text-gray-400 hover:text-red-500 transition-all duration-200 hover:scale-105"
          >
            <el-icon :size="16">
              <Delete />
            </el-icon>
            <span class="hidden sm:inline">删除</span>
          </button>
        </div>
        
        <!-- 回复输入框 -->
        <transition name="slide-down">
          <div v-if="showReplyInput" class="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
            <div class="flex items-start space-x-3">
              <el-avatar :src="userStore.userInfo?.avatarUrl" :size="32" class="ring-2 ring-blue-200">
                <el-icon><User /></el-icon>
              </el-avatar>
              <div class="flex-1">
                <el-input
                  v-model="replyContent"
                  type="textarea"
                  :rows="3"
                  :placeholder="`回复 ${comment.username}...`"
                  maxlength="500"
                  show-word-limit
                  resize="none"
                  class="reply-input"
                />
                <div class="flex justify-end space-x-2 mt-3">
                  <el-button size="small" @click="cancelReply" plain>取消</el-button>
                  <el-button
                    type="primary"
                    size="small"
                    @click="submitReply"
                    :loading="replyLoading"
                    :disabled="!replyContent.trim()"
                  >
                    <el-icon class="mr-1"><Position /></el-icon>
                    发送回复
                  </el-button>
                </div>
              </div>
            </div>
          </div>
        </transition>
        
        <!-- 子评论区域 -->
        <div v-if="comment.children && comment.children.length > 0" class="mt-4">
          <!-- 子评论标题 -->
          <div class="flex items-center space-x-2 mb-3 px-2">
            <div class="w-8 h-px bg-gradient-to-r from-blue-400 to-purple-400"></div>
            <span class="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
              {{ comment.children.length }} 条回复
            </span>
            <div class="flex-1 h-px bg-gradient-to-r from-purple-400 to-transparent"></div>
          </div>
          
          <!-- 子评论列表 -->
          <div class="space-y-3 relative">
            <!-- 连接线 -->
            <div class="absolute left-5 top-0 bottom-0 w-px bg-gradient-to-b from-blue-200 via-purple-200 to-transparent"></div>
            
            <div
              v-for="(child, index) in comment.children"
              :key="child.id"
              class="relative pl-6"
            >
              <!-- 分支线 -->
              <div class="absolute left-5 top-6 w-4 h-px bg-gradient-to-r from-blue-200 to-purple-200"></div>
              
              <div class="flex items-start space-x-3 group">
                <el-avatar :src="child.userAvatar" :size="32" class="ring-2 ring-gray-100 group-hover:ring-purple-200 transition-all duration-200">
                  <el-icon><User /></el-icon>
                </el-avatar>
                
                <div class="flex-1 min-w-0">
                  <!-- 子评论卡片 -->
                  <div class="bg-white rounded-xl px-4 py-3 shadow-sm border border-gray-100 hover:shadow-md hover:border-purple-200 transition-all duration-200">
                    <div class="flex items-center justify-between mb-2">
                      <div class="flex items-center space-x-2">
                        <span class="font-medium text-gray-800 text-sm hover:text-purple-600 cursor-pointer transition-colors">{{ child.username }}</span>
                        <el-tag v-if="isChildAuthor(child)" size="small" type="warning" effect="light">作者</el-tag>
                      </div>
                      <span class="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-full">{{ formatDate(child.createdAt) }}</span>
                    </div>
                    
                    <p class="text-gray-700 text-sm leading-relaxed break-words mb-0">{{ child.content }}</p>
                  </div>
                  
                  <!-- 子评论操作 -->
                  <div class="flex items-center justify-between mt-2 px-2">
                    <div class="flex items-center space-x-4">
                      <button
                        v-if="userStore.isLoggedIn"
                        @click="() => handleChildLike(child)"
                        class="group flex items-center space-x-1 text-xs font-medium transition-all duration-200 hover:scale-105"
                        :class="child.isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'"
                      >
                        <el-icon :size="14" class="transition-transform duration-200 group-hover:scale-110">
                          <component :is="child.isLiked ? 'StarFilled' : 'Star'" />
                        </el-icon>
                        <span>{{ child.likeCount || 0 }}</span>
                      </button>
                    </div>
                    
                    <button
                      v-if="canDeleteChild(child)"
                      @click="() => handleChildDelete(child)"
                      class="text-xs font-medium text-gray-400 hover:text-red-500 transition-all duration-200 hover:scale-105"
                    >
                      <el-icon :size="14">
                        <Delete />
                      </el-icon>
                    </button>
                  </div>
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
import { User, Star, StarFilled, ChatDotRound, Delete, Position } from '@element-plus/icons-vue'

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

// 是否是内容作者
const isAuthor = computed(() => {
  return props.authorId && props.comment.userId === props.authorId
})

// 是否是子评论的作者
const isChildAuthor = (child) => {
  return props.authorId && child.userId === props.authorId
}

// 是否可以删除评论
const canDelete = computed(() => {
  return userStore.isLoggedIn && 
         userStore.userInfo && 
         userStore.userInfo.id === props.comment.userId
})

// 是否可以删除子评论
const canDeleteChild = (child) => {
  return userStore.isLoggedIn && 
         userStore.userInfo && 
         userStore.userInfo.id === child.userId
}

// 格式化日期
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

// 切换回复输入框
const toggleReply = () => {
  showReplyInput.value = !showReplyInput.value
  if (!showReplyInput.value) {
    replyContent.value = ''
  }
}

// 取消回复
const cancelReply = () => {
  showReplyInput.value = false
  replyContent.value = ''
}

// 提交回复
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

// 处理点赞
const handleLike = () => {
  emit('like', props.comment)
}

// 处理子评论点赞
const handleChildLike = (child) => {
  emit('like', child)
}

// 处理删除
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

// 处理删除子评论
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
  @apply py-4 transition-all duration-200;
  padding-top: 1rem !important;
  padding-bottom: 1rem !important;
  transition: all 0.2s !important;
}

.comment-item:hover {
  @apply transform translate-x-1;
  transform: translateX(0.25rem) !important;
}

/* 强制布局样式 */
.flex {
  display: flex !important;
}

.items-start {
  align-items: flex-start !important;
}

.items-center {
  align-items: center !important;
}

.justify-between {
  justify-content: space-between !important;
}

.space-x-3 > * + * {
  margin-left: 0.75rem !important;
}

.space-x-2 > * + * {
  margin-left: 0.5rem !important;
}

.space-x-6 > * + * {
  margin-left: 1.5rem !important;
}

.space-x-4 > * + * {
  margin-left: 1rem !important;
}

.space-y-3 > * + * {
  margin-top: 0.75rem !important;
}

.flex-1 {
  flex: 1 1 0% !important;
}

.flex-shrink-0 {
  flex-shrink: 0 !important;
}

.min-w-0 {
  min-width: 0px !important;
}

/* 定位样式 */
.relative {
  position: relative !important;
}

.absolute {
  position: absolute !important;
}

/* 边距和内边距 */
.mt-3 {
  margin-top: 0.75rem !important;
}

.mt-4 {
  margin-top: 1rem !important;
}

.mt-2 {
  margin-top: 0.5rem !important;
}

.mb-2 {
  margin-bottom: 0.5rem !important;
}

.mb-3 {
  margin-bottom: 0.75rem !important;
}

.px-2 {
  padding-left: 0.5rem !important;
  padding-right: 0.5rem !important;
}

.px-4 {
  padding-left: 1rem !important;
  padding-right: 1rem !important;
}

.py-3 {
  padding-top: 0.75rem !important;
  padding-bottom: 0.75rem !important;
}

.p-4 {
  padding: 1rem !important;
}

.pl-6 {
  padding-left: 1.5rem !important;
}

/* 背景和边框 */
.bg-gray-50 {
  background-color: rgb(249 250 251) !important;
}

.bg-white {
  background-color: rgb(255 255 255) !important;
}

.bg-blue-50 {
  background-color: rgb(239 246 255) !important;
}

.bg-gray-100 {
  background-color: rgb(243 244 246) !important;
}

.rounded-2xl {
  border-radius: 1rem !important;
}

.rounded-xl {
  border-radius: 0.75rem !important;
}

.rounded-full {
  border-radius: 9999px !important;
}

.border {
  border-width: 1px !important;
}

.border-blue-100 {
  border-color: rgb(219 234 254) !important;
}

.border-gray-100 {
  border-color: rgb(243 244 246) !important;
}

/* 阴影效果 */
.shadow-sm {
  box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05) !important;
}

/* 回复输入框动画 */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

.slide-down-enter-from {
  opacity: 0 !important;
  transform: translateY(-10px) !important;
  max-height: 0 !important;
}

.slide-down-leave-to {
  opacity: 0 !important;
  transform: translateY(-10px) !important;
  max-height: 0 !important;
}

.slide-down-enter-to,
.slide-down-leave-from {
  opacity: 1 !important;
  transform: translateY(0) !important;
  max-height: 200px !important;
}

/* 自定义回复输入框样式 */
.reply-input :deep(.el-textarea__inner) {
  border-color: rgb(219 234 254) !important;
  background-color: rgb(255 255 255) !important;
}

.reply-input :deep(.el-textarea__inner:focus) {
  border-color: rgb(147 197 253) !important;
}

/* 点赞动画 */
@keyframes heartbeat {
  0% { transform: scale(1) !important; }
  50% { transform: scale(1.1) !important; }
  100% { transform: scale(1) !important; }
}

.group:hover .group-hover\:animate-heartbeat {
  animation: heartbeat 0.6s ease-in-out !important;
}

/* 移动端优化 */
@media (max-width: 640px) {
  .comment-item {
    padding-top: 0.75rem !important;
    padding-bottom: 0.75rem !important;
  }
  
  .comment-item:hover {
    transform: none !important;
  }
}
</style>