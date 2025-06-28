<template>
  <div class="max-w-6xl mx-auto px-4 py-6 pb-20">
    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3">
      <div 
        v-for="item in contentList" 
        :key="item.id"
        class="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer overflow-hidden relative group"
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

        <!-- 内容图片 -->
        <div class="relative" style="display: flex !important; justify-content: center !important; align-items: center !important; height: 200px !important; overflow: hidden !important;">
          <img 
            :src="item.mediaUrl || '/placeholder.jpg'" 
            :alt="item.title"
            class="w-full h-full object-cover"
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
            <div class="flex items-center space-x-2 cursor-pointer" @click.stop="handleAuthorClick(item)" style="display: flex !important; align-items: center !important; gap: 8px !important;">
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
              
              <!-- 分享 -->
              <div style="display: flex !important; align-items: center !important; cursor: pointer;">
                <el-icon size="14" class="hover:text-primary-600 text-gray-400"><Share /></el-icon>
              </div>
              
              <!-- 收藏 -->
              <div style="display: flex !important; align-items: center !important; cursor: pointer;">
                <el-icon size="14" class="hover:text-primary-600 text-gray-400"><Collection /></el-icon>
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

const userStore = useUserStore()
const router = useRouter()

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

const emit = defineEmits(['contentClick', 'editContent', 'deleteContent', 'likeContent'])

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
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-align: center !important;
}
</style>