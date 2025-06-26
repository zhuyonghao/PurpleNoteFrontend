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
    <div class="max-w-4xl mx-auto p-4" v-if="content">
      <div class="bg-white rounded-xl shadow-sm overflow-hidden">
        <!-- 内容图片 -->
        <div class="relative">
          <img 
            :src="content.imageUrl || '/placeholder.jpg'" 
            :alt="content.title"
            class="w-full h-auto object-cover max-h-96"
          />
        </div>
        
        <!-- 内容信息 -->
        <div class="p-6">
          <h1 class="text-2xl font-bold text-gray-800 mb-4">{{ content.title }}</h1>
          <p class="text-gray-600 leading-relaxed mb-6">{{ content.content }}</p>
          
          <!-- 作者信息 -->
          <div class="flex items-center justify-between border-t pt-4">
            <div class="flex items-center space-x-3">
              <el-avatar :src="content.author?.avatarUrl" :size="40">
                <el-icon><User /></el-icon>
              </el-avatar>
              <div>
                <p class="font-medium text-gray-800">{{ content.author?.nickname || content.author?.username }}</p>
                <p class="text-sm text-gray-500">{{ formatDate(content.createTime) }}</p>
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
    <div v-else class="flex justify-center items-center h-64">
      <el-loading-spinner size="large" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getContentById } from '@/api/content'
import { likeContent, cancelLike } from '@/api/like'
import { User, Star, StarFilled, ArrowLeft, Share } from '@element-plus/icons-vue'

const route = useRoute()
const content = ref(null)
const loading = ref(true)

onMounted(async () => {
  await fetchContent()
})

const fetchContent = async () => {
  try {
    loading.value = true
    const response = await getContentById(route.params.id)
    content.value = response.data
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
    } else {
      await likeContent(content.value.id)
      content.value.isLiked = true
      content.value.likeCount = (content.value.likeCount || 0) + 1
    }
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

const handleShare = () => {
  if (navigator.share) {
    navigator.share({
      title: content.value.title,
      text: content.value.content,
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
</script>