<template>
  <div class="min-h-screen bg-gray-50">
    <!-- 搜索头部 -->
    <header class="bg-white shadow-sm sticky top-0 z-50">
      <div class="max-w-6xl mx-auto px-4 py-3">
        <div class="flex items-center space-x-4">
          <el-button @click="$router.back()" icon="ArrowLeft" circle />
          
          <el-input
            v-model="searchKeyword"
            placeholder="搜索内容、用户..."
            prefix-icon="Search"
            class="flex-1"
            @keyup.enter="handleSearch"
            clearable
          >
            <template #append>
              <el-button @click="handleSearch" icon="Search" />
            </template>
          </el-input>
        </div>
        
        <!-- 搜索类型切换 -->
        <div class="flex space-x-4 mt-4">
          <el-radio-group v-model="searchType" @change="handleTypeChange">
            <el-radio-button label="content">内容</el-radio-button>
            <el-radio-button label="user">用户</el-radio-button>
          </el-radio-group>
        </div>
      </div>
    </header>

    <!-- 搜索结果 -->
    <div class="max-w-6xl mx-auto p-4">
      <!-- 内容搜索结果 -->
      <div v-if="searchType === 'content'">
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <div 
            v-for="item in contentResults" 
            :key="item.id"
            class="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            @click="viewContent(item)"
          >
            <img 
              :src="item.imageUrl || '/placeholder.jpg'" 
              :alt="item.title"
              class="w-full h-48 object-cover"
            />
            <div class="p-3">
              <h3 class="font-medium text-gray-800 text-sm line-clamp-2 mb-2">{{ item.title }}</h3>
              <div class="flex items-center space-x-2">
                <el-avatar :src="item.author?.avatarUrl" :size="20">
                  <el-icon><User /></el-icon>
                </el-avatar>
                <span class="text-xs text-gray-500">{{ item.author?.nickname || item.author?.username }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 用户搜索结果 -->
      <div v-else-if="searchType === 'user'">
        <div class="space-y-4">
          <div 
            v-for="user in userResults" 
            :key="user.id"
            class="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            @click="viewProfile(user)"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-4">
                <el-avatar :src="user.avatarUrl" :size="50">
                  <el-icon><User /></el-icon>
                </el-avatar>
                <div>
                  <h3 class="font-medium text-gray-800">{{ user.nickname || user.username }}</h3>
                  <p class="text-sm text-gray-500" v-if="user.bio">{{ user.bio }}</p>
                  <div class="flex space-x-4 text-xs text-gray-400 mt-1">
                    <span>{{ user.contentCount || 0 }} 作品</span>
                    <span>{{ user.followerCount || 0 }} 粉丝</span>
                  </div>
                </div>
              </div>
              
              <el-button 
                v-if="user.id !== userStore.userInfo?.id"
                :type="user.isFollowed ? 'default' : 'primary'"
                size="small"
                @click.stop="handleFollow(user)"
              >
                {{ user.isFollowed ? '已关注' : '关注' }}
              </el-button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 空状态 -->
      <div v-if="hasSearched && (contentResults.length === 0 && userResults.length === 0)" class="text-center py-16">
        <el-icon size="64" class="text-gray-300 mb-4"><Search /></el-icon>
        <p class="text-gray-500">没有找到相关结果</p>
        <p class="text-sm text-gray-400 mt-2">试试其他关键词</p>
      </div>
      
      <!-- 默认状态 -->
      <div v-if="!hasSearched" class="text-center py-16">
        <el-icon size="64" class="text-gray-300 mb-4"><Search /></el-icon>
        <p class="text-gray-500">输入关键词开始搜索</p>
      </div>
      
      <!-- 加载状态 -->
      <div v-if="loading" class="text-center py-8">
        <el-loading-spinner size="large" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { searchContent } from '@/api/content'
import { searchUsers } from '@/api/user'
import { followUser, unfollowUser } from '@/api/follow'
import { Search, User, ArrowLeft } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const searchKeyword = ref('')
const searchType = ref('content')
const contentResults = ref([])
const userResults = ref([])
const loading = ref(false)
const hasSearched = ref(false)

onMounted(() => {
  // 从路由参数获取搜索关键词
  if (route.query.q) {
    searchKeyword.value = route.query.q
    handleSearch()
  }
})

const handleSearch = async () => {
  if (!searchKeyword.value.trim()) {
    ElMessage.warning('请输入搜索关键词')
    return
  }
  
  loading.value = true
  hasSearched.value = true
  
  try {
    if (searchType.value === 'content') {
      await searchContentData()
    } else {
      await searchUserData()
    }
  } catch (error) {
    ElMessage.error('搜索失败')
    console.error('搜索失败:', error)
  } finally {
    loading.value = false
  }
}

const searchContentData = async () => {
  try {
    const response = await searchContent({
      keyword: searchKeyword.value,
      page: 1,
      size: 20
    })
    contentResults.value = response.data?.records || []
    userResults.value = []
  } catch (error) {
    throw error
  }
}

const searchUserData = async () => {
  try {
    const response = await searchUsers({
      keyword: searchKeyword.value,
      page: 1,
      size: 20
    })
    userResults.value = response.data?.records || []
    contentResults.value = []
  } catch (error) {
    throw error
  }
}

const handleTypeChange = () => {
  if (hasSearched.value) {
    handleSearch()
  }
}

const viewContent = (content) => {
  router.push(`/content/${content.id}`)
}

const viewProfile = (user) => {
  router.push(`/profile/${user.id}`)
}

const handleFollow = async (user) => {
  try {
    if (user.isFollowed) {
      await unfollowUser(user.id)
      user.isFollowed = false
      user.followerCount = Math.max(0, (user.followerCount || 0) - 1)
    } else {
      await followUser(user.id)
      user.isFollowed = true
      user.followerCount = (user.followerCount || 0) + 1
    }
  } catch (error) {
    ElMessage.error('操作失败')
  }
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>