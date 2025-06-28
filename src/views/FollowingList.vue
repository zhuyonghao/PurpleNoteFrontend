<template>
  <MainLayout>
    <!-- 顶部导航 -->
    <PageHeader @back="$router.back()">
      <template #title>
        <h1 class="text-lg font-semibold">{{ isOwnProfile ? '我的关注' : `${userInfo?.nickname || '用户'}的关注` }}</h1>
      </template>
    </PageHeader>

    <div class="max-w-4xl mx-auto px-4 py-6">
      <!-- 关注列表 -->
      <div v-if="!loading && followingList.length > 0" class="space-y-4">
        <div 
          v-for="user in followingList" 
          :key="user.id"
          class="bg-white rounded-lg p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3 flex-1 min-w-0">
              <!-- 头像 -->
              <el-avatar 
                :src="user.avatarUrl" 
                :size="50" 
                class="flex-shrink-0 cursor-pointer"
                @click="viewProfile(user.id)"
              >
                <el-icon><User /></el-icon>
              </el-avatar>
              
              <!-- 用户信息 -->
              <div class="flex-1 min-w-0">
                <h3 
                  class="font-semibold text-gray-800 truncate cursor-pointer hover:text-purple-600 transition-colors"
                  @click="viewProfile(user.id)"
                >
                  {{ user.nickname || user.username }}
                </h3>
                <p class="text-sm text-gray-500 truncate" v-if="user.bio">
                  {{ user.bio }}
                </p>
                <div class="flex items-center space-x-4 text-xs text-gray-400 mt-1">
                  <span>{{ user.followerCount || 0 }} 粉丝</span>
                  <span>{{ user.contentCount || 0 }} 笔记</span>
                </div>
              </div>
            </div>
            
            <!-- 操作按钮 -->
            <div class="flex-shrink-0 ml-3">
              <el-button 
                v-if="user.id !== userStore.userInfo?.id"
                :type="user.isFollowed ? 'default' : 'primary'"
                size="small"
                @click="toggleFollow(user)"
                :loading="user.followLoading"
              >
                {{ user.isFollowed ? '已关注' : '关注' }}
              </el-button>
            </div>
          </div>
        </div>
      </div>

      <!-- 加载状态 -->
      <LoadingState v-if="loading" message="加载中..." />
      
      <!-- 空状态 -->
      <div v-else-if="followingList.length === 0" class="text-center py-16">
        <el-icon size="64" class="text-gray-300 mb-4"><UserFilled /></el-icon>
        <p class="text-gray-500 text-lg mb-2">{{ isOwnProfile ? '还没有关注任何人' : 'TA还没有关注任何人' }}</p>
        <p class="text-gray-400 text-sm">{{ isOwnProfile ? '快去关注感兴趣的用户吧！' : '' }}</p>
      </div>
      
      <!-- 加载更多 -->
      <div v-if="hasMore && !loading" class="text-center py-4">
        <el-button @click="loadMore" :loading="loadingMore">加载更多</el-button>
      </div>
    </div>
  </MainLayout>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, UserFilled } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { getFollowingList, followUser, unfollowUser, getFollowStatus, getFollowerCount } from '@/api/follow'
import { getUserProfile } from '@/api/user'
import MainLayout from '@/layouts/MainLayout.vue'
import PageHeader from '@/components/PageHeader.vue'
import LoadingState from '@/components/LoadingState.vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const followingList = ref([])
const loading = ref(false)
const loadingMore = ref(false)
const hasMore = ref(true)
const currentPage = ref(1)
const pageSize = 20
const userInfo = ref(null)

const userId = computed(() => route.params.id || userStore.userInfo?.id)
const isOwnProfile = computed(() => !route.params.id || route.params.id == userStore.userInfo?.id)

// 获取关注列表
const fetchFollowingList = async (page = 1, append = false) => {
  try {
    if (page === 1) {
      loading.value = true
    } else {
      loadingMore.value = true
    }
    
    console.log('正在获取关注列表，用户ID:', userId.value, '页码:', page)
    
    const response = await getFollowingList(userId.value, {
      page,
      size: pageSize
    })
    
    console.log('获取到的关注列表数据:', response)
    
    if (response && response.list) {
      const users = response.list.map(user => ({
        ...user,
        followLoading: false,
        // 如果后端没有返回 followerCount，设置默认值
        followerCount: user.followerCount || 0
      }))
      
      if (append) {
        followingList.value = [...followingList.value, ...users]
      } else {
        followingList.value = users
      }
      
      hasMore.value = response.list.length === pageSize && page < (response.totalPages || 999)
      currentPage.value = page
      
      console.log('设置关注列表:', followingList.value)
      console.log('是否还有更多:', hasMore.value)
      
      // 先加载关注状态，再加载粉丝数（顺序执行）
      const startIndex = append ? followingList.value.length - users.length : 0
      await loadFollowStatusAsync(users, startIndex)
      await loadFollowerCountAsync(users, startIndex)
    } else {
      console.log('没有找到关注列表数据')
      if (!append) {
        followingList.value = []
      }
      hasMore.value = false
    }
  } catch (error) {
    ElMessage.error('获取关注列表失败')
    console.error('获取关注列表失败:', error)
    hasMore.value = false
  } finally {
    loading.value = false
    loadingMore.value = false
  }
}

// 异步加载粉丝数
const loadFollowerCountAsync = async (users, startIndex = 0) => {
  for (let i = 0; i < users.length; i++) {
    const user = users[i]
    const userIndex = startIndex + i
    
    try {
      const followerCount = await getFollowerCount(user.id)
      console.log(`用户${user.id}的粉丝数:`, followerCount)
      
      if (followingList.value[userIndex]) {
        followingList.value[userIndex].followerCount = followerCount || 0
      }
    } catch (error) {
      console.warn(`获取用户${user.id}粉丝数失败:`, error)
      // 保持默认值
      if (followingList.value[userIndex]) {
        followingList.value[userIndex].followerCount = followingList.value[userIndex].followerCount || 0
      }
    }
  }
}

// 异步加载关注状态
const loadFollowStatusAsync = async (users, startIndex = 0) => {
  if (!userStore.isLoggedIn || !userStore.token) {
    console.log('用户未登录，跳过关注状态查询')
    return
  }
  
  for (let i = 0; i < users.length; i++) {
    const user = users[i]
    const userIndex = startIndex + i
    
    try {
      const status = await getFollowStatus(user.id)
      console.log(`用户${user.id}的关注状态:`, status)
      
      if (followingList.value[userIndex]) {
        // 直接使用返回的布尔值，而不是 status.isFollowed
        followingList.value[userIndex].isFollowed = status === true
      }
    } catch (error) {
      console.warn(`获取用户${user.id}关注状态失败:`, error)
      // 设置默认值
      if (followingList.value[userIndex]) {
        followingList.value[userIndex].isFollowed = false
      }
    }
  }
}

// 切换关注状态
const toggleFollow = async (user) => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    return
  }
  
  if (user.followLoading) {
    return // 防止重复点击
  }
  
  user.followLoading = true
  const originalFollowStatus = user.isFollowed
  
  try {
    if (user.isFollowed) {
      // 取消关注
      await unfollowUser(user.id)
      user.isFollowed = false
      ElMessage.success('已取消关注')
    } else {
      // 关注
      await followUser(user.id)
      user.isFollowed = true
      ElMessage.success('关注成功')
    }
  } catch (error) {
    // 恢复原始状态
    user.isFollowed = originalFollowStatus
    ElMessage.error(originalFollowStatus ? '取消关注失败' : '关注失败')
    console.error('关注操作失败:', error)
  } finally {
    user.followLoading = false
  }
}

// 查看用户资料
const viewProfile = (id) => {
  router.push(`/profile/${id}`)
}

// 加载更多
const loadMore = () => {
  if (hasMore.value && !loadingMore.value) {
    fetchFollowingList(currentPage.value + 1, true)
  }
}

// 获取用户信息
const fetchUserInfo = async () => {
  try {
    if (isOwnProfile.value) {
      userInfo.value = userStore.userInfo
    } else {
      const response = await getUserProfile(userId.value)
      userInfo.value = response.data
    }
  } catch (error) {
    console.error('获取用户信息失败:', error)
  }
}

onMounted(() => {
  fetchUserInfo()
  fetchFollowingList()
})
</script>