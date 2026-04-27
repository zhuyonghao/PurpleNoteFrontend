<template>
  <MainLayout>
    <div class="detail-page">
      <!-- 返回按钮 -->
      <header class="detail-header">
        <div class="header-container">
          <el-button class="back-btn" icon="ArrowLeft" circle @click="$router.back()" />
        </div>
      </header>

      <!-- 内容区域 -->
      <div class="detail-content" v-if="content && !loading">
        <div class="content-wrapper">
          <!-- 内容卡片 -->
          <div class="content-card">
            <!-- 内容图片 -->
            <div class="image-frame">
              <img
                :src="content.mediaUrl || '/placeholder.jpg'"
                :alt="content.title"
                class="content-image"
              />
            </div>

            <!-- 内容信息 -->
            <div class="content-info">
              <h1 class="content-title">{{ content.title }}</h1>
              <p class="content-text">{{ content.text }}</p>

              <!-- 作者区域 -->
              <div class="author-card" @click="handleAuthorClick">
                <div class="author-left">
                  <el-avatar :src="content.userAvatarUrl" :size="44">
                    <el-icon><User /></el-icon>
                  </el-avatar>
                  <div class="author-info">
                    <span class="author-name">{{ content.userName }}</span>
                    <span class="author-followers" v-if="followerCount !== null">
                      {{ followerCount }} 粉丝
                    </span>
                  </div>
                </div>
                <el-button
                  v-if="content.userId !== userStore.userInfo?.id && userStore.isLoggedIn"
                  :type="isFollowed ? 'default' : 'primary'"
                  size="small"
                  :loading="followLoading"
                  class="follow-btn"
                  @click="toggleFollow"
                >
                  {{ isFollowed ? '已关注' : '关注' }}
                </el-button>
              </div>

              <!-- 操作栏 -->
              <div class="action-bar">
                <span class="publish-time">{{ formatDate(content.createdAt) }}</span>
                <div class="action-buttons">
                  <el-button
                    class="like-btn"
                    :class="{ 'is-liked': content.isLiked }"
                    @click="handleLike"
                  >
                    <el-icon size="14" :class="content.isLiked ? 'is-active' : ''">
                      <StarFilled v-if="content.isLiked" />
                      <Star v-else />
                    </el-icon>
                    <span>{{ content.likeCount || 0 }}</span>
                  </el-button>
                </div>
              </div>
            </div>
          </div>

          <!-- 评论区域 -->
          <CommentSection :content-id="content.id" />
        </div>
      </div>

      <!-- 加载状态 -->
      <div v-else-if="loading" class="loading-state">
        <el-icon class="is-loading" size="32"><Loading /></el-icon>
        <span>加载中...</span>
      </div>

      <!-- 错误状态 -->
      <div v-else class="error-state">
        <el-icon size="48" class="error-icon"><Warning /></el-icon>
        <p>内容加载失败</p>
        <el-button class="retry-btn" @click="fetchContent">重新加载</el-button>
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
import { User, ArrowLeft, Loading, Warning, Star, StarFilled } from '@element-plus/icons-vue'

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
    const response = await getContent(route.params.id)

    if (response && response.id) {
      content.value = response

      if (userStore.isLoggedIn && userStore.token) {
        try {
          const likeStatusResponse = await getLikeStatus(response.id)
          content.value.isLiked = likeStatusResponse.isLiked || false
          if (likeStatusResponse.likeCount !== undefined) {
            content.value.likeCount = likeStatusResponse.likeCount
          }
        } catch (error) {
          console.warn('获取点赞状态失败:', error)
          content.value.isLiked = false
        }

        if (response.userId && response.userId !== userStore.userInfo?.id) {
          try {
            const followStatusResponse = await getFollowStatus(response.userId)
            if (followStatusResponse && typeof followStatusResponse === 'object') {
              if (followStatusResponse.code === 200 && followStatusResponse.data !== undefined) {
                isFollowed.value = followStatusResponse.data === true
              } else if (followStatusResponse.isFollowed !== undefined) {
                isFollowed.value = followStatusResponse.isFollowed === true
              }
            } else if (typeof followStatusResponse === 'boolean') {
              isFollowed.value = followStatusResponse
            }
          } catch (error) {
            console.warn('获取关注状态失败:', error)
            isFollowed.value = false
          }
        }
      }

      if (response.userId) {
        try {
          const followerCountResponse = await getFollowerCount(response.userId)
          if (followerCountResponse && typeof followerCountResponse === 'object') {
            if (followerCountResponse.code === 200 && followerCountResponse.data !== undefined) {
              followerCount.value = followerCountResponse.data
            } else if (followerCountResponse.count !== undefined) {
              followerCount.value = followerCountResponse.count
            }
          } else if (typeof followerCountResponse === 'number') {
            followerCount.value = followerCountResponse
          }
        } catch (error) {
          console.warn('获取粉丝数失败:', error)
          followerCount.value = 0
        }
      }
    }
  } catch (error) {
    ElMessage.error('获取内容详情失败')
    console.error('获取内容详情失败:', error)
  } finally {
    loading.value = false
  }
}

const toggleFollow = async () => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    return
  }

  if (!content.value?.userId) {
    ElMessage.error('用户信息不完整')
    return
  }

  if (followLoading.value) return

  followLoading.value = true
  const originalFollowState = isFollowed.value
  const originalFollowerCount = followerCount.value

  try {
    if (isFollowed.value) {
      await unfollowUser(content.value.userId)
      isFollowed.value = false
      if (followerCount.value !== null && followerCount.value > 0) {
        followerCount.value = followerCount.value - 1
      }
      ElMessage.success('已取消关注')
    } else {
      await followUser(content.value.userId)
      isFollowed.value = true
      if (followerCount.value !== null) {
        followerCount.value = followerCount.value + 1
      }
      ElMessage.success('关注成功')
    }
  } catch (error) {
    isFollowed.value = originalFollowState
    followerCount.value = originalFollowerCount
    ElMessage.error(originalFollowState ? '取消关注失败' : '关注失败')
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
    } else {
      await likeContent(content.value.id)
      content.value.isLiked = true
      content.value.likeCount = (content.value.likeCount || 0) + 1
    }
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const handleAuthorClick = () => {
  const userId = content.value?.userId
  if (!userId) return

  if (userId === userStore.userInfo?.id) {
    router.push('/profile')
  } else {
    router.push(`/profile/${userId}`)
  }
}
</script>

<style scoped>
.detail-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #FAFAFA 0%, #F5F5F5 100%);
}

.detail-header {
  background: white;
  border-bottom: 1px solid #F0EEF5;
  position: sticky;
  top: 0;
  z-index: 50;
}

.header-container {
  max-width: 72rem;
  margin: 0 auto;
  padding: 12px 16px;
}

.back-btn {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  border: 1px solid #E8E0ED;
  background: white;
  color: #9B8AA0;
  transition: all 0.2s ease;
}

.back-btn:hover {
  background: #F8F7FA;
  border-color: #B4A5BE;
  color: #9B8AA0;
}

.detail-content {
  padding: 24px 16px;
}

.content-wrapper {
  max-width: 640px;
  margin: 0 auto;
}

.content-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 16px rgba(155, 138, 160, 0.08);
  border: 1px solid #F0EEF5;
  animation: fadeInUp 0.4s ease;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 图片框架 */
.image-frame {
  padding: 16px;
  padding-bottom: 0;
}

.content-image {
  width: 100%;
  max-height: 400px;
  object-fit: cover;
  border-radius: 12px;
  border: 1px solid #E8E0ED;
}

/* 内容信息 */
.content-info {
  padding: 20px 24px 24px;
}

.content-title {
  font-size: 22px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 12px;
  line-height: 1.4;
}

.content-text {
  font-size: 15px;
  color: #6B7280;
  line-height: 1.7;
  margin-bottom: 24px;
}

/* 作者卡片 */
.author-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background: #FAFAFA;
  border-radius: 12px;
  margin-bottom: 20px;
  cursor: pointer;
  transition: background 0.2s ease;
}

.author-card:hover {
  background: #F5F3F7;
}

.author-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.author-info {
  display: flex;
  flex-direction: column;
}

.author-name {
  font-size: 15px;
  font-weight: 500;
  color: #374151;
}

.author-followers {
  font-size: 12px;
  color: #9CA3AF;
  margin-top: 2px;
}

.follow-btn {
  border-radius: 18px;
  padding: 6px 16px;
  font-size: 13px;
}

.follow-btn:not(.is-disabled) {
  background: linear-gradient(135deg, #9B8AA0 0%, #B4A5BE 100%);
  border: none;
  color: white;
}

.follow-btn:not(.is-disabled):hover {
  opacity: 0.9;
}

/* 操作栏 */
.action-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 16px;
  border-top: 1px solid #F0EEF5;
}

.publish-time {
  font-size: 13px;
  color: #9CA3AF;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.like-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  border-radius: 18px;
  padding: 6px 14px;
  font-size: 13px;
  border-color: #E8E0ED;
  color: #9CA3AF;
  background: white;
  transition: all 0.2s ease;
}

.like-btn:hover {
  border-color: #B4A5BE;
  color: #9B8AA0;
  background: #F8F7FA;
}

.like-btn.is-liked {
  border-color: #D4A5A5;
  color: #D4A5A5;
  background: #FDF9F9;
}

.like-btn.is-liked:hover {
  border-color: #C49494;
  color: #C49494;
  background: #FDF5F5;
}

.like-btn :deep(.el-icon) {
  transition: all 0.2s ease;
}

.like-btn :deep(.el-icon.is-active) {
  color: #D4A5A5;
}

/* 加载状态 */
.loading-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  color: #9CA3AF;
  gap: 12px;
}

.error-icon {
  color: #D4D0DB;
}

.retry-btn {
  margin-top: 8px;
  border-radius: 8px;
  border-color: #E8E0ED;
  color: #9B8AA0;
}

.retry-btn:hover {
  border-color: #B4A5BE;
  background: #F8F7FA;
}

.is-loading {
  animation: rotating 2s linear infinite;
}

@keyframes rotating {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
