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
              <el-dropdown-item command="logout" divided>
                <span style="color: #f56565;">退出登录</span>
              </el-dropdown-item>
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
      :empty-text="getEmptyText()"
      :show-actions="isOwnProfile && activeTab === 'notes'"
      @content-click="viewContent"
      @edit-content="editContent"
      @delete-content="deleteContent"
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
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { getUserProfile } from '@/api/user'
import { getContentPage } from '@/api/content'
import { followUser, unfollowUser } from '@/api/follow'
import { updateContent, deleteContent as deleteContentApi } from '@/api/content'
// 导入点赞相关API
import { getLikeStatus, getUserLikes } from '@/api/like'

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

// 获取空状态文本
const getEmptyText = () => {
  switch (activeTab.value) {
    case 'notes':
      return isOwnProfile.value ? '还没有发布任何内容' : 'TA还没有发布任何内容'
    case 'likes':
      return isOwnProfile.value ? '还没有点赞任何内容' : 'TA还没有点赞任何内容'
    case 'collections':
      return isOwnProfile.value ? '还没有收藏任何内容' : 'TA还没有收藏任何内容'
    default:
      return '暂无内容'
  }
}

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

// 获取用户发布的内容
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
      // 先显示内容，设置默认点赞状态
      const contentsWithDefaultLikeStatus = response.list.map(content => ({
        ...content,
        isLiked: false, // 默认未点赞
        likeCount: content.likeCount || 0
      }))
      
      if (append) {
        contentList.value = [...contentList.value, ...contentsWithDefaultLikeStatus]
      } else {
        contentList.value = contentsWithDefaultLikeStatus
      }
      
      // 检查是否还有更多数据
      hasMore.value = response.list.length === pageSize && page < (response.totalPages || 999)
      currentPage.value = page
      
      console.log('设置内容列表:', contentList.value)
      console.log('是否还有更多:', hasMore.value)
      
      // 异步加载点赞状态，逐个更新
      loadLikeStatusAsync(response.list, append ? contentList.value.length - response.list.length : 0)
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

// 获取用户点赞的内容列表
const fetchUserLikes = async (page = 1, append = false) => {
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
    
    console.log('正在获取用户点赞内容，用户ID:', userId, '页码:', page)
    
    const params = {
      page: page,
      size: pageSize
    }
    const response = await getUserLikes(userId, params)
    console.log('获取到的点赞内容数据:', response)
    
    if (response && response.list) {
      // 点赞列表中的内容默认为已点赞状态，可以直接显示
      const likedContents = response.list.map(content => ({
        ...content,
        isLiked: true // 用户点赞列表中的内容默认为已点赞状态
      }))
      
      if (append) {
        contentList.value = [...contentList.value, ...likedContents]
      } else {
        contentList.value = likedContents
      }
      
      // 检查是否还有更多数据
      hasMore.value = response.list.length === pageSize && page < (response.totalPages || 999)
      currentPage.value = page
      
      console.log('设置点赞内容列表:', contentList.value)
      console.log('是否还有更多:', hasMore.value)
    } else {
      console.log('没有找到点赞内容数据')
      if (!append) {
        contentList.value = []
      }
      hasMore.value = false
    }
  } catch (error) {
    ElMessage.error('获取用户点赞内容失败')
    console.error('获取用户点赞内容失败:', error)
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
  
  // 根据当前标签加载不同类型的内容
  switch (activeTab.value) {
    case 'notes':
      await fetchUserContent(nextPage, true)
      break
    case 'likes':
      await fetchUserLikes(nextPage, true)
      break
    case 'collections':
      // TODO: 实现收藏内容加载
      ElMessage.info('收藏功能开发中')
      break
  }
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
    case 'logout':
      handleLogout()
      break
  }
}

// 处理退出登录
const handleLogout = async () => {
  try {
    // 显示确认对话框
    await ElMessageBox.confirm(
      '确定要退出登录吗？',
      '退出确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    
    // 执行退出登录
    userStore.logout()
    ElMessage.success('已退出登录')
    
    // 跳转到登录页
    router.push('/login')
  } catch (error) {
    // 用户取消退出
    console.log('用户取消退出登录')
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

// 修改标签切换处理函数
const handleTabChange = (tab) => {
  activeTab.value = tab
  currentPage.value = 1
  hasMore.value = true
  
  console.log('切换到标签:', tab)
  
  // 根据不同标签加载不同内容
  switch (tab) {
    case 'notes':
      fetchUserContent(1, false)
      break
    case 'likes':
      fetchUserLikes(1, false)
      break
    case 'collections':
      // TODO: 实现收藏内容加载
      contentList.value = []
      ElMessage.info('收藏功能开发中')
      break
    default:
      fetchUserContent(1, false)
  }
}

const handleMessage = () => {
  ElMessage.info('私信功能开发中')
}

// 编辑内容
const editContent = (content) => {
  // 跳转到编辑页面，传递内容ID
  router.push({
    name: 'EditContent',
    params: { id: content.id }
  })
}

// 删除内容
const deleteContent = async (content) => {
  try {
    await deleteContentApi(content.id)
    ElMessage.success('删除成功')
    
    // 从列表中移除已删除的内容
    const index = contentList.value.findIndex(item => item.id === content.id)
    if (index > -1) {
      contentList.value.splice(index, 1)
    }
  } catch (error) {
    console.error('删除内容失败:', error)
    ElMessage.error('删除失败，请重试')
  }
}

// 异步加载点赞状态
const loadLikeStatusAsync = async (contents, startIndex = 0) => {
  // 检查用户是否已登录
  if (!userStore.isLoggedIn || !userStore.token) {
    console.log('用户未登录，跳过点赞状态查询')
    return
  }
  
  // 逐个加载点赞状态
  for (let i = 0; i < contents.length; i++) {
    const content = contents[i]
    const contentIndex = startIndex + i
    
    try {
      const likeStatus = await getLikeStatus(content.id)
      console.log(`内容${content.id}的点赞状态:`, likeStatus)
      
      // 立即更新对应位置的内容
      if (contentList.value[contentIndex]) {
        contentList.value[contentIndex] = {
          ...contentList.value[contentIndex],
          isLiked: likeStatus.isLiked || false,
          likeCount: likeStatus.likeCount !== undefined ? likeStatus.likeCount : (content.likeCount || 0)
        }
      }
    } catch (error) {
      console.warn(`获取内容${content.id}点赞状态失败:`, error)
      // 如果是token相关错误，记录警告
      if (error.message && error.message.includes('token')) {
        console.warn('Token相关错误，用户可能需要重新登录')
      }
      // 保持默认状态，不做额外处理
    }
  }
}
</script>