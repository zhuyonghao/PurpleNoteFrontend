<template>
  <div class="min-h-screen bg-gray-50">
    <!-- 顶部导航 -->
    <header class="bg-white shadow-sm sticky top-0 z-50">
      <div class="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div class="flex items-center">
          <el-button @click="$router.back()" icon="ArrowLeft" circle class="mr-4" />
          <h1 class="text-lg font-medium">个人主页</h1>
        </div>
        
        <el-dropdown v-if="isOwnProfile" @command="handleCommand">
          <el-button icon="More" circle />
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="edit">编辑资料</el-dropdown-item>
              <el-dropdown-item command="settings">设置</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </header>

    <!-- 用户信息 -->
    <div class="bg-white" v-if="userProfile">
      <div class="max-w-6xl mx-auto px-4 py-8">
        <div class="flex items-start space-x-6">
          <!-- 头像 -->
          <el-avatar :src="userProfile.avatarUrl" :size="80">
            <el-icon size="40"><User /></el-icon>
          </el-avatar>
          
          <!-- 用户信息 -->
          <div class="flex-1">
            <div class="flex items-center space-x-4 mb-4">
              <h1 class="text-2xl font-bold text-gray-800">{{ userProfile.nickname || userProfile.username }}</h1>
              
              <el-button 
                v-if="!isOwnProfile"
                :type="userProfile.isFollowed ? 'default' : 'primary'"
                @click="handleFollow"
              >
                {{ userProfile.isFollowed ? '已关注' : '关注' }}
              </el-button>
            </div>
            
            <p class="text-gray-600 mb-4" v-if="userProfile.bio">{{ userProfile.bio }}</p>
            
            <!-- 统计信息 -->
            <div class="flex space-x-8">
              <div class="text-center">
                <div class="text-xl font-bold text-gray-800">{{ userProfile.contentCount || 0 }}</div>
                <div class="text-sm text-gray-500">作品</div>
              </div>
              <div class="text-center cursor-pointer" @click="showFollowers">
                <div class="text-xl font-bold text-gray-800">{{ userProfile.followerCount || 0 }}</div>
                <div class="text-sm text-gray-500">粉丝</div>
              </div>
              <div class="text-center cursor-pointer" @click="showFollowing">
                <div class="text-xl font-bold text-gray-800">{{ userProfile.followingCount || 0 }}</div>
                <div class="text-sm text-gray-500">关注</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 内容列表 -->
    <div class="max-w-6xl mx-auto px-4 py-6">
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <div 
          v-for="item in contentList" 
          :key="item.id"
          class="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
          @click="viewContent(item)"
        >
          <img 
            :src="item.mediaUrl || '/placeholder.jpg'" 
            :alt="item.title"
            class="w-full h-48 object-cover"
          />
          <div class="p-3">
            <h3 class="font-medium text-gray-800 text-sm line-clamp-2">{{ item.title }}</h3>
            <div class="flex items-center justify-between mt-2 text-xs text-gray-500">
              <span>{{ formatDate(item.createdAt) }}</span>
              <div class="flex items-center space-x-2">
                <el-icon><Star /></el-icon>
                <span>{{ item.likeCount || 0 }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 空状态 -->
      <div v-if="contentList.length === 0" class="text-center py-16">
        <el-icon size="64" class="text-gray-300 mb-4"><Document /></el-icon>
        <p class="text-gray-500">{{ isOwnProfile ? '还没有发布任何内容' : 'TA还没有发布任何内容' }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { getUserProfile } from '@/api/user'
import { getContentPage } from '@/api/content'
import { followUser, unfollowUser } from '@/api/follow'
import { User, Star, ArrowLeft, More, Document } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const userProfile = ref(null)
const contentList = ref([])
const loading = ref(true)

const isOwnProfile = computed(() => {
  return !route.params.id || route.params.id == userStore.userInfo?.id
})

onMounted(async () => {
  // 先获取用户信息，再获取用户内容
  await fetchUserProfile()
  await fetchUserContent()
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

const fetchUserContent = async () => {
  try {
    let userId
    
    if (isOwnProfile.value) {
      // 如果是自己的主页，从用户信息中获取ID
      if (userProfile.value && userProfile.value.id) {
        userId = userProfile.value.id
      } else {
        // 如果userProfile还没有加载，先获取用户信息
        await fetchUserProfile()
        userId = userProfile.value?.id
      }
    } else {
      // 如果是其他用户的主页，使用路由参数中的ID
      userId = route.params.id
    }
    
    if (!userId) {
      console.error('无法获取用户ID')
      return
    }
    
    console.log('正在获取用户内容，用户ID:', userId)
    
    // 调用内容分页接口，传入用户ID
    const params = {
      userId: userId,
      page: 1,
      size: 10
    }
    
    const response = await getContentPage(params)
    console.log('获取到的内容数据:', response)
    
    // 修改数据处理逻辑：list在response的根级别
    if (response && response.list) {
      contentList.value = response.list
      console.log('设置内容列表:', contentList.value)
    } else {
      console.log('没有找到内容数据')
      contentList.value = []
    }
  } catch (error) {
    ElMessage.error('获取用户内容失败')
    console.error('获取用户内容失败:', error)
  } finally {
    loading.value = false
  }
}

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