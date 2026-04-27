<template>
  <MainLayout>
    <!-- 顶部工具栏 -->
    <el-header class="home-header" height="64px">
      <h1 class="header-title">首页</h1>
      <div class="header-actions">
        <el-button
          class="icon-btn"
          icon="Refresh"
          circle
          @click="refreshContent"
        />
      </div>
    </el-header>

    <!-- 内容区域 -->
    <div class="content-area">
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
          />
        </template>
      </WaterfallContainer>

      <!-- 加载状态 -->
      <LoadingState
        v-if="contentStore.loading"
        message="精彩内容加载中..."
      />

      <!-- 没有更多内容 -->
      <div v-if="!contentStore.hasMore && (contentStore.contentList?.length || 0) > 0" class="end-of-content">
        <div class="end-indicator">
          <el-icon class="end-icon"><Check /></el-icon>
          <p class="end-text">已经到底了，没有更多内容</p>
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
import { likeContent, cancelLike, getLikeStatus } from '@/api/like'
import ContentCard from '@/components/ContentCard.vue'
import LoadingState from '@/components/LoadingState.vue'
import EmptyState from '@/components/EmptyState.vue'
import WaterfallContainer from '@/components/WaterfallContainer.vue'

const router = useRouter()
const userStore = useUserStore()
const contentStore = useContentStore()

const hasNotification = computed(() => {
  return false
})

onMounted(async () => {
  console.log('Home 页面挂载')

  contentStore.resetState()

  if (!userStore.userInfo && userStore.token) {
    try {
      await userStore.fetchUserProfile()
    } catch (error) {
      console.error('获取用户信息失败:', error)
    }
  }

  try {
    console.log('开始加载首页内容')
    await contentStore.fetchAllContentList(1, true)
    console.log('首页内容加载完成，内容数量:', contentStore.contentList?.length)
  } catch (error) {
    console.error('加载首页内容失败:', error)
    ElMessage.error('加载内容失败，请刷新页面重试')
  }
})

onUnmounted(() => {
  console.log('Home 页面卸载')
})

const refreshContent = async () => {
  try {
    console.log('刷新内容')
    contentStore.resetState()
    await contentStore.fetchAllContentList(1, true)
    ElMessage.success('刷新成功')
  } catch (error) {
    console.error('刷新失败:', error)
    ElMessage.error('刷新失败，请重试')
  }
}

const handleLike = async (content) => {
  if (!userStore.isLoggedIn || !userStore.token) {
    ElMessage.warning('请先登录后再进行点赞操作')
    router.push('/login')
    return
  }

  try {
    console.log('点赞操作开始，当前状态:', content.isLiked)

    if (content.isLiked) {
      await cancelLike(content.id)
      content.isLiked = false
      content.likeCount = Math.max(0, (content.likeCount || 0) - 1)
      console.log('取消点赞成功')
    } else {
      await likeContent(content.id)
      content.isLiked = true
      content.likeCount = (content.likeCount || 0) + 1
      console.log('点赞成功')
    }

    try {
      const likeStatusResponse = await getLikeStatus(content.id)
      content.isLiked = likeStatusResponse.isLiked || false
      if (likeStatusResponse.likeCount !== undefined) {
        content.likeCount = likeStatusResponse.likeCount
      }
      console.log('同步点赞状态成功:', likeStatusResponse)
    } catch (syncError) {
      console.warn('同步点赞状态失败:', syncError)
    }

  } catch (error) {
    console.error('点赞操作失败:', error)

    if (error.message && error.message.includes('token')) {
      ElMessage.error('登录已过期，请重新登录')
      userStore.logout()
      router.push('/login')
    } else {
      ElMessage.error('操作失败，请重试')
    }
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
/* 顶部工具栏 */
.home-header {
  background: white;
  border-bottom: 1px solid #F0EEF5;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
}

.header-title {
  font-size: 18px;
  font-weight: 600;
  color: #374151;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.icon-btn {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  border: 1px solid #E8E0ED;
  background: white;
  color: #9B8AA0;
  transition: all 0.2s ease;
}

.icon-btn:hover {
  background: #F8F7FA;
  border-color: #B4A5BE;
  color: #9B8AA0;
  transform: rotate(90deg);
}

/* 内容区域 */
.content-area {
  padding: 20px;
  min-height: calc(100vh - 64px);
  background: linear-gradient(180deg, #FAFAFA 0%, #F5F5F5 100%);
}

/* 底部提示 */
.end-of-content {
  text-align: center;
  padding: 32px 0;
  animation: fadeIn 0.5s ease;
}

.end-indicator {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: white;
  border-radius: 24px;
  box-shadow: 0 2px 12px rgba(155, 138, 160, 0.08);
}

.end-icon {
  font-size: 18px;
  color: #B4A5BE;
}

.end-text {
  font-size: 14px;
  color: #9CA3AF;
  font-weight: 500;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>