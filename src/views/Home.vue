<template>
  <div class="min-h-screen bg-gray-50">
    <!-- 顶部导航 -->
    <header class="bg-white shadow-sm sticky top-0 z-50">
      <div class="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <h1 class="text-2xl font-bold text-primary-600">小紫书</h1>
        
        <div class="flex items-center space-x-4">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索内容..."
            prefix-icon="Search"
            class="w-64"
            @keyup.enter="handleSearch"
          />
          
          <el-button type="primary" icon="Plus" @click="$router.push('/publish')">
            发布
          </el-button>
          
          <el-dropdown @command="handleCommand">
            <el-avatar :src="userStore.userInfo?.avatarUrl" :size="32">
              <el-icon><User /></el-icon>
            </el-avatar>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">个人主页</el-dropdown-item>
                <el-dropdown-item command="settings">设置</el-dropdown-item>
                <el-dropdown-item command="logout" divided>退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
    </header>

    <!-- 主要内容区域 -->
    <main class="max-w-6xl mx-auto py-6">
      <!-- 瀑布流内容 -->
      <div class="waterfall" v-infinite-scroll="loadMore" :infinite-scroll-disabled="!contentStore.hasMore">
        <div 
          v-for="item in contentStore.contentList || []" 
          :key="item.id"
          class="waterfall-item"
        >
          <ContentCard :content="item" @like="handleLike" @click="viewDetail" />
        </div>
      </div>
      
      <!-- 加载状态 -->
      <div v-if="contentStore.loading" class="text-center py-8">
        <el-icon class="is-loading text-2xl text-primary-500"><Loading /></el-icon>
        <p class="text-gray-500 mt-2">加载中...</p>
      </div>
      
      <!-- 没有更多内容 -->
      <div v-if="!contentStore.hasMore && (contentStore.contentList?.length || 0) > 0" class="text-center py-8">
        <p class="text-gray-500">没有更多内容了</p>
      </div>
      
      <!-- 空状态 -->
      <div v-if="!contentStore.loading && (contentStore.contentList?.length || 0) === 0" class="text-center py-16">
        <el-icon class="text-6xl text-gray-300 mb-4"><Document /></el-icon>
        <p class="text-gray-500 text-lg">暂无内容</p>
        <el-button type="primary" class="mt-4" @click="$router.push('/publish')">
          发布第一篇内容
        </el-button>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { useContentStore } from '@/stores/content'
import { likeContent, cancelLike } from '@/api/like'
import ContentCard from '@/components/ContentCard.vue'

const router = useRouter()
const userStore = useUserStore()
const contentStore = useContentStore()
const searchKeyword = ref('')

onMounted(async () => {
  // 确保用户信息已加载
  if (!userStore.userInfo && userStore.token) {
    try {
      await userStore.fetchUserProfile()
    } catch (error) {
      console.error('获取用户信息失败:', error)
    }
  }
  
  // 加载内容列表
  contentStore.fetchContentList(0)
})

const handleSearch = () => {
  if (searchKeyword.value.trim()) {
    router.push({ name: 'Search', query: { q: searchKeyword.value } })
  }
}

const handleCommand = async (command) => {
  switch (command) {
    case 'profile':
      try {
        // 确保用户信息已加载
        if (!userStore.userInfo) {
          await userStore.fetchUserProfile()
        }
        
        // 添加更详细的调试信息
        console.log('用户信息:', userStore.userInfo)
        
        // 检查用户信息是否有ID
        if (userStore.userInfo?.id) {
          console.log('跳转到个人主页，用户ID:', userStore.userInfo.id)
          router.push(`/profile/${userStore.userInfo.id}`)
        } else {
          console.log('用户信息中没有ID，跳转到默认个人主页')
          // 如果没有ID，跳转到不带参数的profile路由
          router.push('/profile')
        }
      } catch (error) {
        ElMessage.error('获取用户信息失败')
        console.error('跳转个人主页失败:', error)
        // 即使获取用户信息失败，也尝试跳转到默认个人主页
        router.push('/profile')
      }
      break
    case 'settings':
      ElMessage.info('设置功能开发中')
      break
    case 'logout':
      userStore.logout()
      router.push('/login')
      break
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
  }
}

const viewDetail = (content) => {
  router.push(`/content/${content.id}`)
}

const loadMore = () => {
  contentStore.loadMore(0)
}
</script>