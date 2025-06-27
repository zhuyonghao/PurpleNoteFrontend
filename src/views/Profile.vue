<template>
  <MainLayout>
    <!-- 顶部导航 -->
    <header class="bg-white shadow-sm sticky top-0 z-50">
      <div class="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <el-button @click="$router.back()" icon="ArrowLeft" circle />
        
        <el-dropdown v-if="isOwnProfile" @command="handleCommand">
          <el-button icon="Setting" circle />
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="edit">编辑资料</el-dropdown-item>
              <el-dropdown-item command="settings">设置</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </header>

    <!-- 用户信息和内容 -->
    <div class="bg-white" v-if="userProfile">
      <div class="max-w-6xl mx-auto px-4 py-6">
        <!-- 头像和基本信息 -->
        <div class="text-center mb-6">
          <el-avatar :src="userProfile.avatarUrl" :size="80" class="mb-4 border-4 border-white shadow-lg">
            <el-icon size="40"><User /></el-icon>
          </el-avatar>
          <h1 class="text-xl font-bold text-gray-800 mb-2">{{ userProfile.nickname || userProfile.username }}</h1>
          <p class="text-gray-600 text-sm mb-4" v-if="userProfile.bio">{{ userProfile.bio }}</p>
        </div>
        
        <!-- 统计信息 -->
        <div class="flex justify-center space-x-8 mb-6">
          <div class="text-center">
            <div class="text-xl font-bold text-gray-800">{{ userProfile.contentCount || 0 }}</div>
            <div class="text-sm text-gray-500">笔记</div>
          </div>
          <div class="text-center cursor-pointer" @click="showFollowing">
            <div class="text-xl font-bold text-gray-800">{{ userProfile.followingCount || 0 }}</div>
            <div class="text-sm text-gray-500">关注</div>
          </div>
          <div class="text-center cursor-pointer" @click="showFollowers">
            <div class="text-xl font-bold text-gray-800">{{ userProfile.followerCount || 0 }}</div>
            <div class="text-sm text-gray-500">粉丝</div>
          </div>
        </div>
        
        <!-- 操作按钮 -->
        <div class="flex justify-center space-x-3 mb-6" v-if="!isOwnProfile">
          <el-button 
            :type="userProfile.isFollowed ? 'default' : 'primary'"
            class="flex-1 max-w-24"
            @click="handleFollow"
          >
            {{ userProfile.isFollowed ? '已关注' : '关注' }}
          </el-button>
          <el-button class="flex-1 max-w-24">私信</el-button>
        </div>
        
        <div class="flex justify-center space-x-3 mb-6" v-else>
          <el-button class="flex-1 max-w-32" @click="editProfile">编辑资料</el-button>
        </div>
      </div>
    </div>

    <!-- 内容筛选标签 -->
    <div class="bg-white border-t border-gray-100">
      <div class="max-w-6xl mx-auto px-4">
        <div class="flex justify-center space-x-8 py-3">
          <div 
            class="flex items-center space-x-1 py-2 px-4 cursor-pointer border-b-2"
            :class="activeTab === 'notes' ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500'"
            @click="activeTab = 'notes'"
          >
            <el-icon><Document /></el-icon>
            <span class="text-sm font-medium">笔记</span>
          </div>
          <div 
            class="flex items-center space-x-1 py-2 px-4 cursor-pointer border-b-2"
            :class="activeTab === 'likes' ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500'"
            @click="activeTab = 'likes'"
          >
            <el-icon><Promotion /></el-icon>
            <span class="text-sm font-medium">点赞</span>
          </div>
          <div 
            class="flex items-center space-x-1 py-2 px-4 cursor-pointer border-b-2"
            :class="activeTab === 'collections' ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500'"
            @click="activeTab = 'collections'"
          >
            <el-icon><Star /></el-icon>
            <span class="text-sm font-medium">收藏</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 内容网格展示 -->
    <div class="max-w-6xl mx-auto px-4 py-6 pb-20">
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        <div 
          v-for="item in contentList" 
          :key="item.id"
          class="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
          @click="viewContent(item)"
        >
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
        <p class="text-gray-500">{{ isOwnProfile ? '还没有发布任何内容' : 'TA还没有发布任何内容' }}</p>
      </div>
    </div>
  </MainLayout>
</template>

<script setup>
import MainLayout from '@/layouts/MainLayout.vue'
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { getUserProfile } from '@/api/user'
import { getContentPage } from '@/api/content'
import { followUser, unfollowUser } from '@/api/follow'
import { User, Star, ArrowLeft, More, Document, Promotion } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const userProfile = ref(null)
const contentList = ref([])
const loading = ref(true)
const loadingMore = ref(false)
const activeTab = ref('notes')
const currentPage = ref(1)
const hasMore = ref(true)
const pageSize = 10

const isOwnProfile = computed(() => {
  return !route.params.id || route.params.id == userStore.userInfo?.id
})

const fetchUserProfile = async () => {
  try {
    if (isOwnProfile.value) {
      // 如果是自己的主页，使用store中的用户信息或重新获取
      if (userStore.userInfo) {
        userProfile.value = userStore.userInfo
      } else {
        await userStore.fetchUserProfile()
        userProfile.value = userStore.userInfo
      }
    } else {
      // 如果是其他用户的主页，通过用户ID获取
      const response = await getUserProfile(route.params.id)
      userProfile.value = response.data
    }
  } catch (error) {
    ElMessage.error('获取用户信息失败')
    console.error('获取用户信息失败:', error)
  }
}

const fetchUserContent = async (page = 1, append = false) => {
  try {
    if (page === 1) {
      loading.value = true
    } else {
      loadingMore.value = true
    }
    
    let userId
    
    if (isOwnProfile.value) {
      if (userProfile.value && userProfile.value.id) {
        userId = userProfile.value.id
      } else {
        await fetchUserProfile()
        userId = userProfile.value?.id
      }
    } else {
      userId = route.params.id
    }
    
    if (!userId) {
      console.error('无法获取用户ID')
      return
    }
    
    console.log('正在获取用户内容，用户ID:', userId, '页码:', page)
    
    const params = {
      userId: userId,
      page: page,
      size: pageSize
    }
    
    const response = await getContentPage(params)
    console.log('获取到的内容数据:', response)
    
    if (response && response.list) {
      if (append) {
        contentList.value = [...contentList.value, ...response.list]
      } else {
        contentList.value = response.list
      }
      
      // 检查是否还有更多数据
      hasMore.value = response.list.length === pageSize && page < (response.totalPages || 999)
      currentPage.value = page
      
      console.log('设置内容列表:', contentList.value)
      console.log('是否还有更多:', hasMore.value)
    } else {
      console.log('没有找到内容数据')
      if (!append) {
        contentList.value = []
      }
      hasMore.value = false
    }
  } catch (error) {
    ElMessage.error('获取用户内容失败')
    console.error('获取用户内容失败:', error)
    hasMore.value = false
  } finally {
    loading.value = false
    loadingMore.value = false
  }
}

// 加载更多内容
const loadMore = async () => {
  if (loadingMore.value || !hasMore.value) return
  
  const nextPage = currentPage.value + 1
  await fetchUserContent(nextPage, true)
}

// 滚动事件处理
const handleScroll = () => {
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop
  const windowHeight = window.innerHeight
  const documentHeight = document.documentElement.scrollHeight
  
  // 当滚动到距离底部100px时开始加载
  if (scrollTop + windowHeight >= documentHeight - 100) {
    loadMore()
  }
}

onMounted(async () => {
  await fetchUserProfile()
  await fetchUserContent()
  
  // 添加滚动事件监听
  window.addEventListener('scroll', handleScroll)
})

// 组件卸载时移除事件监听
import { onUnmounted } from 'vue'
onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})

const handleFollow = async () => {
  try {
    if (userProfile.value.isFollowed) {
      await unfollowUser(userProfile.value.id)
      userProfile.value.isFollowed = false
      userProfile.value.followerCount = Math.max(0, (userProfile.value.followerCount || 0) - 1)
    } else {
      await followUser(userProfile.value.id)
      userProfile.value.isFollowed = true
      userProfile.value.followerCount = (userProfile.value.followerCount || 0) + 1
    }
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

const handleCommand = (command) => {
  switch (command) {
    case 'edit':
      ElMessage.info('编辑功能开发中')
      break
    case 'settings':
      ElMessage.info('设置功能开发中')
      break
  }
}

const editProfile = () => {
  ElMessage.info('编辑资料功能开发中')
}

const viewContent = (content) => {
  router.push(`/content/${content.id}`)
}

const showFollowers = () => {
  ElMessage.info('粉丝列表功能开发中')
}

const showFollowing = () => {
  ElMessage.info('关注列表功能开发中')
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