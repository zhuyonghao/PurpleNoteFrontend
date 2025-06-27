<template>
  <div class="max-w-6xl mx-auto px-4 py-6 pb-20">
    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3">
      <div 
        v-for="item in contentList" 
        :key="item.id"
        class="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer relative group"
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

        <img 
          :src="item.mediaUrl || '/placeholder.jpg'" 
          :alt="item.title"
          class="w-full h-32 object-cover"
        />
        <div class="p-2">
          <h3 class="font-medium text-gray-800 text-xs line-clamp-2 mb-1">{{ item.title }}</h3>
          <div class="flex items-center justify-between text-xs text-gray-500">
            <span>{{ formatDate(item.createdAt) }}</span>
            <div class="flex items-center space-x-1">
              <el-icon size="12"><Promotion /></el-icon>
              <span>{{ item.likeCount || 0 }}</span>
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
import { Promotion, Loading, Document, MoreFilled, Edit, Delete } from '@element-plus/icons-vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

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

const emit = defineEmits(['contentClick', 'editContent', 'deleteContent'])

// 判断是否是自己的内容
const isOwnContent = (content) => {
  return content.userId === userStore.userInfo?.id || content.authorId === userStore.userInfo?.id
}

// 处理内容点击
const handleContentClick = (item) => {
  emit('contentClick', item)
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