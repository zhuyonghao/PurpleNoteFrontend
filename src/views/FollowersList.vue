<template>
  <MainLayout>
    <!-- 顶部导航 -->
    <PageHeader @back="$router.back()">
      <template #title>
        <h1 class="header-title">{{ isOwnProfile ? '我的粉丝' : `${userInfo?.nickname || '用户'}的粉丝` }}</h1>
      </template>
    </PageHeader>

    <div class="list-container">
      <!-- 粉丝列表 -->
      <div v-if="!loading && followersList.length > 0" class="user-list">
        <div
          v-for="user in followersList"
          :key="user.id"
          class="user-card"
        >
          <div class="user-main" @click="viewProfile(user.id)">
            <!-- 头像 -->
            <el-avatar :src="user.avatarUrl" :size="56" class="user-avatar">
              <el-icon><User /></el-icon>
            </el-avatar>

            <!-- 用户信息 -->
            <div class="user-info">
              <h3 class="user-name">{{ user.nickname || user.username }}</h3>
              <p class="user-bio" v-if="user.bio">{{ user.bio }}</p>
              <div class="user-stats">
                <span>{{ user.followerCount || 0 }} 粉丝</span>
                <span class="stat-divider">·</span>
                <span>{{ user.contentCount || 0 }} 笔记</span>
              </div>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="user-action" v-if="user.id !== userStore.userInfo?.id">
            <el-button
              :type="user.isFollowed ? 'default' : 'primary'"
              size="small"
              class="follow-btn"
              @click="toggleFollow(user)"
              :loading="user.followLoading"
            >
              {{ user.isFollowed ? '已关注' : '关注' }}
            </el-button>
          </div>
        </div>
      </div>

      <!-- 加载状态 -->
      <LoadingState v-if="loading" message="加载中..." />

      <!-- 空状态 -->
      <div v-else-if="followersList.length === 0" class="empty-state">
        <el-icon size="56" class="empty-icon"><UserFilled /></el-icon>
        <p class="empty-title">{{ isOwnProfile ? '还没有粉丝' : 'TA还没有粉丝' }}</p>
        <p class="empty-subtitle">{{ isOwnProfile ? '发布精彩内容来吸引粉丝吧！' : '' }}</p>
      </div>

      <!-- 加载更多 -->
      <div v-if="hasMore && !loading" class="load-more">
        <el-button class="load-more-btn" @click="loadMore" :loading="loadingMore">加载更多</el-button>
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
import { getFollowersList, followUser, unfollowUser, getFollowStatus, getFollowerCount } from '@/api/follow'
import { getUserProfile } from '@/api/user'
import MainLayout from '@/layouts/MainLayout.vue'
import PageHeader from '@/components/PageHeader.vue'
import LoadingState from '@/components/LoadingState.vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const followersList = ref([])
const loading = ref(false)
const loadingMore = ref(false)
const hasMore = ref(true)
const currentPage = ref(1)
const pageSize = 20
const userInfo = ref(null)

const userId = computed(() => route.params.id || userStore.userInfo?.id)
const isOwnProfile = computed(() => !route.params.id || route.params.id == userStore.userInfo?.id)

const fetchFollowersList = async (page = 1, append = false) => {
  try {
    if (page === 1) {
      loading.value = true
    } else {
      loadingMore.value = true
    }

    const response = await getFollowersList(userId.value, {
      page,
      size: pageSize
    })

    if (response && response.list) {
      const users = response.list.map(user => ({
        ...user,
        followLoading: false
      }))

      if (append) {
        followersList.value = [...followersList.value, ...users]
      } else {
        followersList.value = users
      }

      hasMore.value = response.list.length === pageSize && page < (response.totalPages || 999)
      currentPage.value = page

      await loadFollowStatusAsync(users, append ? followersList.value.length - users.length : 0)
      await loadFollowerCountAsync(users, append ? followersList.value.length - users.length : 0)
    } else {
      if (!append) {
        followersList.value = []
      }
      hasMore.value = false
    }
  } catch (error) {
    ElMessage.error('获取粉丝列表失败')
  } finally {
    loading.value = false
    loadingMore.value = false
  }
}

const loadFollowStatusAsync = async (users, startIndex = 0) => {
  if (!userStore.isLoggedIn || !userStore.token) return

  for (let i = 0; i < users.length; i++) {
    const user = users[i]
    const userIndex = startIndex + i

    try {
      const status = await getFollowStatus(user.id)
      if (followersList.value[userIndex]) {
        followersList.value[userIndex].isFollowed = status === true
      }
    } catch (error) {
      console.warn(`获取用户${user.id}关注状态失败:`, error)
    }
  }
}

const loadFollowerCountAsync = async (users, startIndex = 0) => {
  for (let i = 0; i < users.length; i++) {
    const user = users[i]
    const userIndex = startIndex + i

    try {
      const followerCount = await getFollowerCount(user.id)
      if (followersList.value[userIndex]) {
        followersList.value[userIndex].followerCount = followerCount || 0
      }
    } catch (error) {
      console.warn(`获取用户${user.id}粉丝数失败:`, error)
    }
  }
}

const toggleFollow = async (user) => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    return
  }

  if (user.followLoading) return

  user.followLoading = true
  const originalFollowStatus = user.isFollowed
  const originalFollowerCount = user.followerCount

  try {
    if (user.isFollowed) {
      await unfollowUser(user.id)
      user.isFollowed = false
      user.followerCount = Math.max(0, (user.followerCount || 0) - 1)
      ElMessage.success('已取消关注')
    } else {
      await followUser(user.id)
      user.isFollowed = true
      user.followerCount = (user.followerCount || 0) + 1
      ElMessage.success('关注成功')
    }
  } catch (error) {
    user.isFollowed = originalFollowStatus
    user.followerCount = originalFollowerCount
    ElMessage.error(originalFollowStatus ? '取消关注失败' : '关注失败')
  } finally {
    user.followLoading = false
  }
}

const viewProfile = (id) => {
  router.push(`/profile/${id}`)
}

const loadMore = () => {
  if (hasMore.value && !loadingMore.value) {
    fetchFollowersList(currentPage.value + 1, true)
  }
}

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
  fetchFollowersList()
})
</script>

<style scoped>
.list-container {
  padding: 20px 16px;
  max-width: 600px;
  margin: 0 auto;
}

.header-title {
  font-size: 18px;
  font-weight: 600;
  color: #374151;
}

/* 用户列表 */
.user-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.user-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: white;
  border-radius: 14px;
  padding: 16px;
  box-shadow: 0 2px 12px rgba(155, 138, 160, 0.06);
  border: 1px solid #F0EEF5;
  transition: all 0.2s ease;
}

.user-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(155, 138, 160, 0.1);
  border-color: #E8E0ED;
}

.user-main {
  display: flex;
  align-items: center;
  gap: 14px;
  flex: 1;
  min-width: 0;
  cursor: pointer;
}

.user-avatar {
  flex-shrink: 0;
  border: 2px solid #E8E0ED;
}

.user-info {
  flex: 1;
  min-width: 0;
}

.user-name {
  font-size: 15px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 4px;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.user-bio {
  font-size: 13px;
  color: #9CA3AF;
  margin-bottom: 6px;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.user-stats {
  font-size: 12px;
  color: #B4A5BE;
  display: flex;
  align-items: center;
  gap: 6px;
}

.stat-divider {
  color: #D4D0DB;
}

/* 关注按钮 */
.follow-btn {
  flex-shrink: 0;
  padding: 6px 16px;
  border-radius: 18px;
  font-size: 13px;
  border-color: #E8E0ED;
  color: #9B8AA0;
  transition: all 0.2s ease;
}

.follow-btn:not(.is-disabled) {
  background: linear-gradient(135deg, #9B8AA0 0%, #B4A5BE 100%);
  border: none;
  color: white;
  box-shadow: 0 2px 8px rgba(155, 138, 160, 0.2);
}

.follow-btn:not(.is-disabled):hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(155, 138, 160, 0.3);
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.empty-icon {
  color: #D4D0DB;
  margin-bottom: 16px;
}

.empty-title {
  font-size: 16px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 8px;
}

.empty-subtitle {
  font-size: 14px;
  color: #9CA3AF;
}

/* 加载更多 */
.load-more {
  text-align: center;
  padding: 20px 0;
}

.load-more-btn {
  padding: 10px 24px;
  border-radius: 20px;
  border-color: #E8E0ED;
  color: #9B8AA0;
}

.load-more-btn:hover {
  border-color: #B4A5BE;
  color: #9B8AA0;
  background: #F8F7FA;
}
</style>
