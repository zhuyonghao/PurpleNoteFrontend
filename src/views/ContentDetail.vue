<template>
  <div class="min-h-screen bg-gray-50">
    <!-- 返回按钮 -->
    <header class="bg-white shadow-sm sticky top-0 z-50">
      <div class="max-w-4xl mx-auto px-4 py-3 flex items-center">
        <el-button @click="$router.back()" icon="ArrowLeft" circle />
        <h1 class="ml-4 text-lg font-medium">内容详情</h1>
      </div>
    </header>

    <!-- 内容详情 -->
    <div class="max-w-4xl mx-auto p-4" v-if="content && !loading">
      <div class="bg-white rounded-xl shadow-sm overflow-hidden">
        <!-- 内容图片 -->
        <div class="relative">
          <img 
            :src="content.mediaUrl || '/placeholder.jpg'" 
            :alt="content.title"
            class="w-full h-auto object-cover max-h-96"
          />
        </div>
        
        <!-- 内容信息 -->
        <div class="p-6">
          <h1 class="text-2xl font-bold text-gray-800 mb-4">{{ content.title }}</h1>
          <p class="text-gray-600 leading-relaxed mb-6">{{ content.text }}</p>
          
          <!-- 作者信息 -->
          <div class="flex items-center justify-between border-t pt-4">
            <div class="flex items-center space-x-3 cursor-pointer" @click="handleAuthorClick">
              <el-avatar :src="content.userAvatarUrl" :size="40">
                <el-icon><User /></el-icon>
              </el-avatar>
              <div>
                <p class="font-medium text-gray-800">{{ content.userName }}</p>
                <p class="text-sm text-gray-500">{{ formatDate(content.createdAt) }}</p>
              </div>
            </div>
            
            <!-- 操作按钮 -->
            <div class="flex items-center space-x-4">
              <el-button 
                :type="content.isLiked ? 'danger' : 'default'"
                :icon="content.isLiked ? 'HeartFilled' : 'Heart'"
                @click="handleLike"
              >
                {{ content.likeCount || 0 }}
              </el-button>
              
              <el-button icon="Share" @click="handleShare">分享</el-button>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 加载状态 -->
    <div v-else-if="loading" class="flex justify-center items-center h-64">
      <el-icon class="is-loading" size="32">
        <Loading />
      </el-icon>
      <span class="ml-2 text-gray-500">加载中...</span>
    </div>
    
    <!-- 错误状态 -->
    <div v-else class="flex justify-center items-center h-64">
      <div class="text-center">
        <el-icon size="48" class="text-gray-400 mb-4">
          <Warning />
        </el-icon>
        <p class="text-gray-500">内容加载失败</p>
        <el-button @click="fetchContent" class="mt-4">重新加载</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { getContent } from '@/api/content'
import { likeContent, cancelLike, getLikeStatus } from '@/api/like'
import { User, Star, StarFilled, ArrowLeft, Share, Loading, Warning } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const content = ref(null)
const loading = ref(true)

onMounted(async () => {
  await fetchContent()
})

const fetchContent = async () => {
  try {
    loading.value = true
    console.log('正在获取内容ID:', route.params.id)
    const response = await getContent(route.params.id)
    console.log('API完整响应:', response)
    
    // 直接使用响应数据，不需要通过 .data 属性
    if (response && response.id) {
      content.value = response
      
      // 获取点赞状态
      if (userStore.isLoggedIn && userStore.token) {
        try {
          const likeStatusResponse = await getLikeStatus(response.id)
          console.log('点赞状态响应:', likeStatusResponse)
          
          // 根据新的响应格式处理数据
          content.value.isLiked = likeStatusResponse.isLiked || false
          // 如果接口返回了likeCount，使用接口的值
          if (likeStatusResponse.likeCount !== undefined) {
            content.value.likeCount = likeStatusResponse.likeCount
          }
        } catch (error) {
          console.warn('获取点赞状态失败:', error)
          content.value.isLiked = false
        }
      } else {
        console.log('用户未登录，设置默认点赞状态')
        content.value.isLiked = false
      }
      
      console.log('获取内容详情成功:', content.value)
    } else {
      console.error('API响应数据结构异常:', response)
      ElMessage.error('数据格式错误')
    }
  } catch (error) {
    ElMessage.error('获取内容详情失败')
    console.error('获取内容详情失败:', error)
  } finally {
    loading.value = false
  }
}

const handleLike = async () => {
  try {
    if (content.value.isLiked) {
      await cancelLike(content.value.id)
      content.value.isLiked = false
      content.value.likeCount = Math.max(0, (content.value.likeCount || 0) - 1)
      console.log('取消点赞成功')
    } else {
      await likeContent(content.value.id)
      content.value.isLiked = true
      content.value.likeCount = (content.value.likeCount || 0) + 1
      console.log('点赞成功')
    }
  } catch (error) {
    console.error('点赞操作失败:', error)
    ElMessage.error('操作失败')
  }
}

const handleShare = () => {
  if (navigator.share) {
    navigator.share({
      title: content.value.title,
      text: content.value.text,
      url: window.location.href
    })
  } else {
    navigator.clipboard.writeText(window.location.href)
    ElMessage.success('链接已复制到剪贴板')
  }
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 处理作者头像点击事件
const handleAuthorClick = () => {
  // 添加调试信息
  console.log('Content data:', content.value)
  
  // 使用接口返回的userId进行跳转
  const userId = content.value?.userId
  
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
</script>

<style scoped>
.is-loading {
  animation: rotating 2s linear infinite;
}

@keyframes rotating {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>