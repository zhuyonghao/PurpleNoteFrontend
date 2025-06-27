<template>
  <MainLayout>
    <!-- 顶部工具栏 -->
    <el-header class="bg-white shadow-sm border-b border-gray-100 flex items-center justify-between px-6" height="64px">
      <h1 class="text-xl font-semibold text-gray-800">首页</h1>
      <div class="flex items-center space-x-3">
        <el-button 
          icon="Bell" 
          circle 
          :badge="hasNotification ? '1' : null" 
          @click="handleNotificationClick" 
        />
        <el-button icon="Refresh" circle @click="refreshContent" />
      </div>
    </el-header>
    
    <!-- 内容区域 -->
    <div class="p-6 overflow-auto" style="height: calc(100vh - 64px);">
      <!-- 瀑布流内容 -->
      <WaterfallContainer 
        :items="contentStore.contentList || []"
        :has-more="contentStore.hasMore"
        @load-more="loadMore"
      >
        <template #default="{ item }">
          <ContentCard 
            :content="item" 
            @like="handleLike" 
            @click="viewDetail" 
            class="content-card-hover"
          />
        </template>
      </WaterfallContainer>
      
      <!-- 加载状态 -->
      <LoadingState 
        v-if="contentStore.loading" 
        message="精彩内容加载中..." 
      />
      
      <!-- 没有更多内容 -->
      <div v-if="!contentStore.hasMore && (contentStore.contentList?.length || 0) > 0" class="text-center py-12">
        <div class="no-more-content">
          <el-icon class="text-4xl text-gray-400 mb-3"><Check /></el-icon>
          <p class="text-gray-500 font-medium">已经到底了，没有更多内容</p>
        </div>
      </div>
      
      <!-- 空状态 -->
      <EmptyState 
        v-if="!contentStore.loading && (contentStore.contentList?.length || 0) === 0"
        title="还没有内容"
        description="成为第一个分享精彩内容的人吧！"
        :show-button="true"
        button-text="发布第一篇内容"
        @button-click="$router.push('/publish')"
      />
    </div>
  </MainLayout>
</template>

<script setup>
import MainLayout from '@/layouts/MainLayout.vue'
import { onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { 
  Bell, 
  Refresh, 
  Check 
} from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { useContentStore } from '@/stores/content'
import { likeContent, cancelLike } from '@/api/like'
import ContentCard from '@/components/ContentCard.vue'
import LoadingState from '@/components/LoadingState.vue'
import EmptyState from '@/components/EmptyState.vue'
import WaterfallContainer from '@/components/WaterfallContainer.vue'
import NavigationBar from '@/components/NavigationBar.vue'

const router = useRouter()
const userStore = useUserStore()
const contentStore = useContentStore()

// 计算是否有通知
const hasNotification = computed(() => {
  // 这里可以根据实际的通知状态来判断
  return false
})

onMounted(async () => {
  console.log('Home 页面挂载')
  
  // 重置内容状态，防止重复内容
  contentStore.resetState()
  
  // 确保用户信息已加载
  if (!userStore.userInfo && userStore.token) {
    try {
      await userStore.fetchUserProfile()
    } catch (error) {
      console.error('获取用户信息失败:', error)
    }
  }
  
  // 加载所有内容列表
  try {
    console.log('开始加载首页内容')
    await contentStore.fetchAllContentList(1, true)
    console.log('首页内容加载完成，内容数量:', contentStore.contentList?.length)
  } catch (error) {
    console.error('加载首页内容失败:', error)
    ElMessage.error('加载内容失败，请刷新页面重试')
  }
})

// 页面卸载时清理状态
onUnmounted(() => {
  console.log('Home 页面卸载')
})

const handleNotificationClick = () => {
  // 处理通知点击事件
  console.log('通知被点击')
  // 可以跳转到通知页面或显示通知列表
}

const refreshContent = async () => {
  try {
    console.log('刷新内容')
    contentStore.resetState() // 重置状态
    await contentStore.fetchAllContentList(1, true)
    ElMessage.success('刷新成功')
  } catch (error) {
    console.error('刷新失败:', error)
    ElMessage.error('刷新失败，请重试')
  }
}

const handleLike = async (content) => {
  try {
    if (content.isLiked) {
      await cancelLike(content.id)
      content.isLiked = false
      content.likeCount--
    } else {
      await likeContent(content.id)
      content.isLiked = true
      content.likeCount++
    }
  } catch (error) {
    console.error('点赞操作失败:', error)
    ElMessage.error('操作失败，请重试')
  }
}

const viewDetail = (content) => {
  router.push(`/content/${content.id}`)
}

const loadMore = async () => {
  console.log('=== loadMore 开始 ===', {
    hasMore: contentStore.hasMore,
    loading: contentStore.loading,
    currentPage: contentStore.currentPage,
    contentListLength: contentStore.contentList?.length
  })
  
  if (!contentStore.hasMore || contentStore.loading) {
    console.log('跳过加载更多：', {
      hasMore: contentStore.hasMore,
      loading: contentStore.loading
    })
    return
  }
  
  try {
    console.log('开始调用 contentStore.loadMore()')
    await contentStore.loadMore()
    console.log('loadMore 完成，新的状态:', {
      hasMore: contentStore.hasMore,
      currentPage: contentStore.currentPage,
      contentListLength: contentStore.contentList?.length
    })
  } catch (error) {
    console.error('加载更多失败:', error)
    ElMessage.error('加载更多失败，请重试')
  }
  
  console.log('=== loadMore 结束 ===')
}
</script>

<style scoped>
.content-card-hover {
  transition: all 0.3s ease;
}

.content-card-hover:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.no-more-content {
  animation: fadeIn 0.5s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

/* 自定义滚动条样式 */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>