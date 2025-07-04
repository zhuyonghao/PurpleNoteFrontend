<template>
  <div class="max-w-6xl mx-auto px-4 py-6 pb-20">
    <!-- 瀑布流容器 -->
    <div 
      ref="containerRef"
      class="waterfall-container"
    >
      <div 
        v-for="(item, index) in contentList" 
        :key="item.id"
        class="waterfall-item bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer overflow-hidden relative group"
        :style="{ animationDelay: `${index * 0.1}s` }"
        @click="handleContentClick(item)"
      >
        <!-- 操作菜单 - 只在自己的内容上显示 -->
        <div v-if="showActions && isOwnContent(item)" class="absolute top-2 right-2 z-10">
          <el-dropdown @command="(command) => handleAction(command, item)" trigger="click">
            <el-button 
              size="small" 
              circle 
              class="opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 backdrop-blur-sm"
              @click.stop
            >
              <el-icon><MoreFilled /></el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="edit">
                  <el-icon><Edit /></el-icon>
                  编辑
                </el-dropdown-item>
                <el-dropdown-item command="delete" class="text-red-500">
                  <el-icon><Delete /></el-icon>
                  删除
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>

        <!-- 内容图片 - 修改为固定高度 -->
        <div class="relative" style="display: flex !important; justify-content: center !important; align-items: center !important; height: 200px !important; overflow: hidden !important;">
          <img 
            :src="item.mediaUrl || '/placeholder.jpg'" 
            :alt="item.title"
            class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
            style="width: 100% !important; height: 100% !important; object-fit: cover !important;"
          />
        </div>
        
        <!-- 内容信息 -->
        <div class="p-3" style="text-align: center !important;">
          <!-- 标题 -->
          <h3 class="font-medium text-gray-800 text-sm mb-2 line-clamp-2" style="text-align: center !important;">
            {{ item.title }}
          </h3>
          
          <!-- 作者信息 -->
          <div class="mb-2" style="display: flex !important; justify-content: center !important; align-items: center !important;">
            <div class="flex items-center space-x-2 cursor-pointer hover:opacity-80 transition-opacity" @click.stop="handleAuthorClick(item)" style="display: flex !important; align-items: center !important; gap: 8px !important;">
              <el-avatar :src="item.userAvatarUrl" :size="20">
                <el-icon><User /></el-icon>
              </el-avatar>
              <span class="text-xs text-gray-500">{{ item.userName }}</span>
            </div>
          </div>
          
          <!-- 标签 -->
          <div class="mb-2" v-if="item.tags && item.tags.length > 0" style="display: flex !important; justify-content: center !important; flex-wrap: wrap !important; gap: 4px !important;">
            <span 
              v-for="tag in item.tags.slice(0, 2)" 
              :key="tag"
              class="text-xs text-primary-600 bg-primary-50 px-2 py-1 rounded"
            >
              #{{ tag }}
            </span>
          </div>
          
          <!-- 互动按钮 -->
          <div class="text-gray-500 text-xs" style="display: flex !important; justify-content: center !important; align-items: center !important;">
            <div style="display: flex !important; align-items: center !important; gap: 16px !important;">
              <!-- 点赞 -->
              <div style="display: flex !important; align-items: center !important; gap: 4px !important; cursor: pointer;" @click.stop="handleLike(item)">
                <el-icon 
                  :class="item.isLiked ? 'text-yellow-500' : 'text-gray-400'"
                  size="14"
                >
                  <StarFilled v-if="item.isLiked" />
                  <Star v-else />
                </el-icon>
                <span>{{ item.likeCount || 0 }}</span>
              </div>
              
              <!-- 评论 -->
              <div style="display: flex !important; align-items: center !important; gap: 4px !important;">
                <el-icon size="14" class="text-gray-400"><ChatDotRound /></el-icon>
                <span>{{ item.commentCount || 0 }}</span>
              </div>
              
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 加载更多提示 -->
    <div v-if="loadingMore" class="text-center py-4">
      <el-icon class="is-loading mr-2"><Loading /></el-icon>
      <span class="text-gray-500">加载中...</span>
    </div>
    
    <!-- 没有更多数据提示 -->
    <div v-else-if="!hasMore && contentList.length > 0" class="text-center py-4">
      <span class="text-gray-400">没有更多内容了</span>
    </div>
    
    <!-- 空状态 -->
    <div v-if="contentList.length === 0 && !loading" class="text-center py-16">
      <el-icon size="64" class="text-gray-300 mb-4"><Document /></el-icon>
      <p class="text-gray-500">{{ emptyText }}</p>
    </div>
  </div>
</template>

<script setup>
import { 
  Promotion, 
  Loading, 
  Document, 
  MoreFilled, 
  Edit, 
  Delete,
  StarFilled,
  Star,
  User,
  ChatDotRound,
  Share,
  Collection
} from '@element-plus/icons-vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { useRouter } from 'vue-router'
import { getContentCommentCount } from '@/api/comment'
import { ref, onMounted, onUnmounted, watch } from 'vue'

const userStore = useUserStore()
const router = useRouter()
const containerRef = ref(null)

const props = defineProps({
  contentList: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  loadingMore: {
    type: Boolean,
    default: false
  },
  hasMore: {
    type: Boolean,
    default: true
  },
  emptyText: {
    type: String,
    default: '暂无内容'
  },
  showActions: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['contentClick', 'editContent', 'deleteContent', 'likeContent', 'loadMore', 'updateCommentCount'])

// 判断是否是自己的内容
const isOwnContent = (content) => {
  return content.userId === userStore.userInfo?.id || content.authorId === userStore.userInfo?.id
}

// 处理内容点击
const handleContentClick = (item) => {
  emit('contentClick', item)
}

// 处理作者头像点击事件
const handleAuthorClick = (item) => {
  console.log('Content data:', item)
  
  const userId = item.userId
  
  if (!userId) {
    console.warn('无法获取用户ID')
    return
  }
  
  // 如果是当前用户，跳转到个人主页
  if (userId === userStore.userInfo?.id) {
    router.push('/profile')
  } else {
    // 否则跳转到指定用户的主页
    router.push(`/profile/${userId}`)
  }
}

// 处理点赞
const handleLike = (item) => {
  emit('likeContent', item)
}

// 处理操作菜单
const handleAction = async (command, item) => {
  if (command === 'edit') {
    emit('editContent', item)
  } else if (command === 'delete') {
    try {
      await ElMessageBox.confirm(
        '确定要删除这条内容吗？删除后无法恢复。',
        '确认删除',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
      emit('deleteContent', item)
    } catch {
      // 用户取消删除
    }
  }
}

// 滚动加载更多
let isLoading = false
let lastTriggerTime = 0

const handleScroll = () => {
  if (!props.hasMore || isLoading || props.loadingMore) {
    return
  }
  
  const now = Date.now()
  if (now - lastTriggerTime < 1000) {
    return
  }
  
  const scrollTop = document.documentElement.scrollTop
  const scrollHeight = document.documentElement.scrollHeight
  const clientHeight = document.documentElement.clientHeight
  
  if (scrollTop + clientHeight >= scrollHeight - 200) {
    isLoading = true
    lastTriggerTime = now
    
    emit('loadMore')
    
    setTimeout(() => {
      isLoading = false
    }, 2000)
  }
}

const throttle = (func, delay) => {
  let timeoutId
  let lastExecTime = 0
  return function (...args) {
    const currentTime = Date.now()
    
    if (currentTime - lastExecTime > delay) {
      func.apply(this, args)
      lastExecTime = currentTime
    } else {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        func.apply(this, args)
        lastExecTime = Date.now()
      }, delay - (currentTime - lastExecTime))
    }
  }
}

const throttledScrollHandler = throttle(handleScroll, 300)

onMounted(() => {
  window.addEventListener('scroll', throttledScrollHandler, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', throttledScrollHandler)
  isLoading = false
  lastTriggerTime = 0
})

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  const now = new Date()
  const diff = now - date
  
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
  if (diff < 2592000000) return `${Math.floor(diff / 86400000)}天前`
  
  return date.toLocaleDateString('zh-CN')
}

// 异步加载评论数
const loadCommentCountAsync = async (contents, startIndex = 0) => {
  // 逐个加载评论数
  for (let i = 0; i < contents.length; i++) {
    const content = contents[i]
    const contentIndex = startIndex + i
    
    try {
      const response = await getContentCommentCount(content.id)
      console.log(`内容${content.id}的评论数:`, response)
      
      // 立即更新对应位置的内容
      if (props.contentList[contentIndex]) {
        // 直接修改 props.contentList 中的数据
        let commentCount = 0
        if (response && typeof response === 'object') {
          if (response.data !== undefined) {
            commentCount = response.data
          } else if (response.count !== undefined) {
            commentCount = response.count
          } else {
            commentCount = response
          }
        } else if (typeof response === 'number') {
          commentCount = response
        }
        
        // 触发父组件更新
        emit('updateCommentCount', content.id, commentCount)
      }
    } catch (error) {
      console.warn(`获取内容${content.id}评论数失败:`, error)
    }
    
    // 添加小延迟，避免请求过于频繁
    await new Promise(resolve => setTimeout(resolve, 50))
  }
}

// 监听 contentList 变化，异步加载评论数
watch(() => props.contentList, (newList) => {
  if (newList && newList.length > 0) {
    loadCommentCountAsync(newList)
  }
}, { immediate: true })

// 删除重复的 emit 声明
// const emit = defineEmits(['contentClick', 'editContent', 'deleteContent', 'likeContent', 'loadMore', 'updateCommentCount'])
</script>

<style scoped>
/* 瀑布流容器 */
.waterfall-container {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  width: 100%;
  box-sizing: border-box;
  justify-content: flex-start;
}

/* 瀑布流项目 */
.waterfall-item {
  flex: 0 0 auto;
  break-inside: avoid;
  margin-bottom: 0;
  opacity: 0;
  animation: fadeInUp 0.6s ease forwards;
  box-sizing: border-box;
}

/* 响应式调整 - 精确控制列宽 */
@media (max-width: 640px) {
  .waterfall-container {
    gap: 12px;
    padding: 0 12px;
  }
  .waterfall-item {
    width: calc(50% - 6px);
  }
}

@media (min-width: 641px) and (max-width: 768px) {
  .waterfall-container {
    gap: 14px;
    padding: 0 16px;
  }
  .waterfall-item {
    width: calc(33.333% - 9.33px);
  }
}

@media (min-width: 769px) and (max-width: 1024px) {
  .waterfall-container {
    gap: 16px;
    padding: 0 20px;
  }
  .waterfall-item {
    width: calc(25% - 12px);
  }
}

@media (min-width: 1025px) and (max-width: 1280px) {
  .waterfall-container {
    gap: 18px;
    padding: 0 24px;
  }
  .waterfall-item {
    width: calc(25% - 13.5px);
  }
}

@media (min-width: 1281px) {
  .waterfall-container {
    gap: 20px;
    padding: 0 28px;
  }
  .waterfall-item {
    width: calc(20% - 16px);
  }
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-align: center !important;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>