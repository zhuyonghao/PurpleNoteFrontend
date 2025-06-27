<template>
  <MainLayout>
    <!-- 顶部导航 -->
    <PageHeader @back="$router.back()">
      <template #actions>
        <el-dropdown v-if="isOwnProfile" @command="handleCommand">
          <el-button icon="Setting" circle />
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="edit">编辑资料</el-dropdown-item>
              <el-dropdown-item command="settings">设置</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </template>
    </PageHeader>

    <!-- 用户信息 -->
    <UserProfileHeader 
      v-if="userProfile"
      :user-profile="userProfile"
      :is-own-profile="isOwnProfile"
      @follow="handleFollow"
      @message="handleMessage"
      @edit-profile="editProfile"
      @show-followers="showFollowers"
      @show-following="showFollowing"
    />

    <!-- 内容筛选标签 -->
    <TabNavigation 
      :active-tab="activeTab"
      @tab-change="handleTabChange"
    />

    <!-- 内容网格展示 -->
    <ContentGrid 
      :content-list="contentList"
      :loading="loading"
      :loading-more="loadingMore"
      :has-more="hasMore"
      :empty-text="isOwnProfile ? '还没有发布任何内容' : 'TA还没有发布任何内容'"
      @content-click="viewContent"
    />
  </MainLayout>
</template>

<script setup>
import MainLayout from '@/layouts/MainLayout.vue'
import PageHeader from '@/components/PageHeader.vue'
import UserProfileHeader from '@/components/UserProfileHeader.vue'
import TabNavigation from '@/components/TabNavigation.vue'
import ContentGrid from '@/components/ContentGrid.vue'
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { getUserProfile } from '@/api/user'
import { getContentPage } from '@/api/content'
import { followUser, unfollowUser } from '@/api/follow'

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
      router.push('/profile/edit')
      break
    case 'settings':
      ElMessage.info('设置功能开发中')
      break
  }
}

const editProfile = () => {
  router.push('/profile/edit')
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

const handleTabChange = (tab) => {
  activeTab.value = tab
  // 根据不同标签加载不同内容
  fetchUserContent(1, false)
}

const handleMessage = () => {
  ElMessage.info('私信功能开发中')
}
</script>