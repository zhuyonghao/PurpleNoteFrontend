<template>
  <MainLayout>
    <div class="min-h-screen bg-gray-50">
      <!-- 返回按钮 -->
      <header class="bg-white shadow-sm sticky top-0 z-50">
        <div class="max-w-4xl mx-auto px-4 py-3 flex items-center" style="margin-left: auto !important; margin-right: auto !important;">
          <el-button @click="$router.back()" icon="ArrowLeft" circle />
          <h1 class="ml-4 text-lg font-medium">内容详情</h1>
        </div>
      </header>

      <!-- 内容详情居中容器 -->
      <div class="flex justify-center" style="display: flex !important; justify-content: center !important; align-items: flex-start !important;">
        <div class="w-full max-w-4xl p-4" v-if="content && !loading" style="width: 100% !important; max-width: 64rem !important; margin: 0 auto !important; padding: 1rem !important;">
          <!-- 内容卡片 -->
          <div class="bg-white rounded-xl shadow-sm overflow-hidden mb-6" style="margin-left: auto !important; margin-right: auto !important;">
            <!-- 内容图片 -->
            <div class="relative">
              <img 
                :src="content.mediaUrl || '/placeholder.jpg'" 
                :alt="content.title"
                class="content-image w-full h-auto object-cover"
                style="width: 100% !important; height: auto !important; display: block !important; margin: 0 auto !important;"
              />
            </div>
            
            <!-- 内容信息 -->
            <div class="p-6" style="text-align: center !important; margin: 0 auto !important;">
              <h1 class="text-2xl font-bold text-gray-800 mb-4" style="text-align: center !important;">{{ content.title }}</h1>
              <p class="text-gray-600 leading-relaxed mb-6" style="text-align: center !important; max-width: 600px !important; margin: 0 auto 1.5rem auto !important;">{{ content.text }}</p>
              
              <!-- 作者信息区域 -->
              <div class="border-t pt-6 mb-8" style="display: flex !important; justify-content: center !important; align-items: center !important; gap: 1rem !important; padding-top: 1.5rem !important; margin-bottom: 2rem !important;">
                <!-- 头像 -->
                <div class="cursor-pointer avatar-hover" @click="handleAuthorClick">
                  <el-avatar :src="content.userAvatarUrl" :size="40">
                    <el-icon><User /></el-icon>
                  </el-avatar>
                </div>
                
                <!-- 用户名和粉丝数 -->
                <div class="cursor-pointer user-info-hover" @click="handleAuthorClick" style="text-align: left !important;">
                  <p class="font-medium text-gray-800">{{ content.userName }}</p>
                  <span v-if="followerCount !== null" class="text-xs text-gray-500">
                    {{ followerCount }} 粉丝
                  </span>
                </div>
                
                <!-- 关注按钮 -->
                <el-button 
                  v-if="content.userId !== userStore.userInfo?.id && userStore.isLoggedIn"
                  :type="isFollowed ? 'default' : 'primary'"
                  size="small"
                  @click="toggleFollow"
                  :loading="followLoading"
                >
                  {{ isFollowed ? '已关注' : '关注' }}
                </el-button>
              </div>
              
              <!-- 时间和点赞操作区域 -->
              <div class="flex items-center justify-center time-like-container" style="justify-content: center !important; align-items: center !important; gap: 4rem !important; padding-top: 1rem !important;">
                <!-- 发布时间 -->
                <span class="text-sm text-gray-500">{{ formatDate(content.createdAt) }}</span>
                
                <!-- 点赞按钮 -->
                <el-button 
                  :type="content.isLiked ? 'danger' : 'default'"
                  :icon="content.isLiked ? 'HeartFilled' : 'Heart'"
                  @click="handleLike"
                  size="small"
                >
                  {{ content.likeCount || 0 }}
                </el-button>
              </div>
            </div>
          </div>
          
          <!-- 评论区域 -->
          <CommentSection :content-id="content.id" />
        </div>
        
        <!-- 加载状态 -->
        <div v-else-if="loading" class="flex justify-center items-center h-64" style="display: flex !important; justify-content: center !important; align-items: center !important; width: 100% !important;">
          <div style="text-align: center !important;">
            <el-icon class="is-loading" size="32">
              <Loading />
            </el-icon>
            <span class="ml-2 text-gray-500">加载中...</span>
          </div>
        </div>
        
        <!-- 错误状态 -->
        <div v-else class="flex justify-center items-center h-64" style="display: flex !important; justify-content: center !important; align-items: center !important; width: 100% !important;">
          <div class="text-center" style="text-align: center !important;">
            <el-icon size="48" class="text-gray-400 mb-4">
              <Warning />
            </el-icon>
            <p class="text-gray-500">内容加载失败</p>
            <el-button @click="fetchContent" class="mt-4">重新加载</el-button>
          </div>
        </div>
      </div>
    </div>
  </MainLayout>
</template>

<script setup>
import MainLayout from '@/layouts/MainLayout.vue'
import CommentSection from '@/components/CommentSection.vue'
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { getContent } from '@/api/content'
import { likeContent, cancelLike, getLikeStatus } from '@/api/like'
import { followUser, unfollowUser, getFollowStatus, getFollowerCount } from '@/api/follow'
import { User, Star, StarFilled, ArrowLeft, Share, Loading, Warning } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const content = ref(null)
const loading = ref(true)
const isFollowed = ref(false)
const followLoading = ref(false)
const followerCount = ref(null)

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
        
        // 获取关注状态（修复：只要用户登录且不是自己的内容就查询关注状态）
        if (response.userId && response.userId !== userStore.userInfo?.id) {
          try {
            const followStatusResponse = await getFollowStatus(response.userId)
            console.log('关注状态响应:', followStatusResponse)
            
            // 处理不同的响应格式
            if (followStatusResponse && typeof followStatusResponse === 'object') {
              // 如果是 {code: 200, data: boolean} 格式
              if (followStatusResponse.code === 200 && followStatusResponse.data !== undefined) {
                isFollowed.value = followStatusResponse.data === true
              }
              // 如果是 {isFollowed: boolean} 格式
              else if (followStatusResponse.isFollowed !== undefined) {
                isFollowed.value = followStatusResponse.isFollowed === true
              }
              else {
                isFollowed.value = false
              }
            } else if (typeof followStatusResponse === 'boolean') {
              // 直接返回布尔值
              isFollowed.value = followStatusResponse
            } else {
              isFollowed.value = false
            }
            
            console.log('解析后的关注状态:', isFollowed.value)
          } catch (error) {
            console.warn('获取关注状态失败:', error)
            isFollowed.value = false
          }
        } else {
          // 如果是自己的内容或用户未登录，设置为未关注状态
          isFollowed.value = false
        }
      } else {
        console.log('用户未登录，设置默认状态')
        content.value.isLiked = false
        isFollowed.value = false
      }
      
      // 获取作者粉丝数
      if (response.userId) {
        try {
          const followerCountResponse = await getFollowerCount(response.userId)
          console.log('粉丝数响应:', followerCountResponse)
          
          // 处理不同的响应格式
          if (followerCountResponse && typeof followerCountResponse === 'object') {
            // 如果是 {code: 200, data: count} 格式
            if (followerCountResponse.code === 200 && followerCountResponse.data !== undefined) {
              followerCount.value = followerCountResponse.data
            }
            // 如果是 {count: number} 格式
            else if (followerCountResponse.count !== undefined) {
              followerCount.value = followerCountResponse.count
            }
            else {
              followerCount.value = 0
            }
          } else if (typeof followerCountResponse === 'number') {
            // 直接返回数字
            followerCount.value = followerCountResponse
          } else {
            followerCount.value = 0
          }
          
          console.log('解析后的粉丝数:', followerCount.value)
        } catch (error) {
          console.warn('获取粉丝数失败:', error)
          followerCount.value = null
        }
      }
      
      console.log('获取内容详情成功:', content.value)
      console.log('当前关注状态:', isFollowed.value)
      console.log('当前粉丝数:', followerCount.value)
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

// 切换关注状态（修复版本）
const toggleFollow = async () => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    return
  }
  
  if (!content.value?.userId) {
    ElMessage.error('用户信息不完整')
    return
  }
  
  // 防止重复点击
  if (followLoading.value) {
    return
  }
  
  followLoading.value = true
  const originalFollowState = isFollowed.value
  const originalFollowerCount = followerCount.value
  
  try {
    let response
    
    if (isFollowed.value) {
      // 当前是已关注状态，执行取消关注
      console.log('执行取消关注操作，用户ID:', content.value.userId)
      response = await unfollowUser(content.value.userId)
      console.log('取消关注响应:', response)
      
      // 修复：检查响应是否成功（无论data是什么值）
      // 由于响应拦截器已经处理了成功的情况，如果能执行到这里说明操作成功
      isFollowed.value = false
      // 更新粉丝数
      if (followerCount.value !== null && followerCount.value > 0) {
        followerCount.value = followerCount.value - 1
      }
      ElMessage.success('已取消关注')
      console.log('取消关注成功，新状态:', isFollowed.value)
    } else {
      // 当前是未关注状态，执行关注
      console.log('执行关注操作，用户ID:', content.value.userId)
      response = await followUser(content.value.userId)
      console.log('关注响应:', response)
      
      // 修复：检查响应是否成功（无论data是什么值）
      // 由于响应拦截器已经处理了成功的情况，如果能执行到这里说明操作成功
      isFollowed.value = true
      // 更新粉丝数
      if (followerCount.value !== null) {
        followerCount.value = followerCount.value + 1
      }
      ElMessage.success('关注成功')
      console.log('关注成功，新状态:', isFollowed.value)
    }
  } catch (error) {
    // 恢复原始状态
    isFollowed.value = originalFollowState
    followerCount.value = originalFollowerCount
    
    const errorMsg = originalFollowState ? '取消关注失败' : '关注失败'
    ElMessage.error(errorMsg)
    console.error('关注操作失败:', error)
  } finally {
    followLoading.value = false
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

/* 头像悬停效果 */
.avatar-hover {
  transition: transform 0.2s ease-in-out;
}

.avatar-hover:hover {
  transform: scale(1.1);
}

/* 用户信息悬停效果 */
.user-info-hover {
  transition: color 0.2s ease-in-out;
}

.user-info-hover:hover p {
  color: #409eff !important;
}

/* 时间和点赞区域间距 */
.time-like-container {
  display: flex !important;
  justify-content: center !important;
  align-items: center !important;
  gap: 4rem !important;
  padding-top: 1rem !important;
}

/* 强制居中样式 */
.force-center {
  display: flex !important;
  justify-content: center !important;
  align-items: flex-start !important;
  margin: 0 auto !important;
}

.content-container {
  width: 100% !important;
  max-width: 64rem !important;
  margin-left: auto !important;
  margin-right: auto !important;
  padding: 1rem !important;
}

.content-card {
  margin-left: auto !important;
  margin-right: auto !important;
  display: block !important;
}

.loading-center {
  display: flex !important;
  justify-content: center !important;
  align-items: center !important;
  width: 100% !important;
  text-align: center !important;
}

/* 响应式图片样式 */
.content-image {
  /* 移动端：保持原有大小 */
  width: 100%;
  max-height: 24rem; /* 384px */
  object-fit: cover;
}

/* 平板端：开始缩小宽度和高度 */
@media (min-width: 768px) {
  .content-image {
    width: 85%;
    max-width: 500px;
    max-height: 20rem; /* 320px */
    margin: 0 auto;
    display: block;
  }
}

/* 桌面端：进一步缩小 */
@media (min-width: 1024px) {
  .content-image {
    width: 70%;
    max-width: 450px;
    max-height: 16rem; /* 256px */
    margin: 0 auto;
    display: block;
  }
}

/* 大屏桌面端：最小尺寸 */
@media (min-width: 1280px) {
  .content-image {
    width: 60%;
    max-width: 400px;
    max-height: 14rem; /* 224px */
    margin: 0 auto;
    display: block;
  }
}
</style>