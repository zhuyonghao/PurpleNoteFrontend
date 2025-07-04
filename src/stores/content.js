import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getContentPage, getContent, getAllContentPageOrderByTime } from '@/api/content'
import { getLikeStatus } from '@/api/like'
import { useUserStore } from '@/stores/user'
import { getContentCommentCount } from '@/api/comment'

export const useContentStore = defineStore('content', () => {
  const contentList = ref([])
  const currentContent = ref(null)
  const loading = ref(false)
  const hasMore = ref(true)
  const currentPage = ref(1)
  const pageSize = ref(10)

  // 获取内容列表（用户内容）
  const fetchContentList = async (userId, page = 1, refresh = false) => {
    try {
      loading.value = true
      const params = {
        userId,
        page,
        size: pageSize.value
      }
      const result = await getContentPage(params)
      console.log('getContentPage API返回结果:', result)
      
      if (refresh || page === 1) {
        contentList.value = result.list || []
      } else {
        contentList.value.push(...(result.list || []))
      }
      
      currentPage.value = page
      hasMore.value = page < result.totalPages
      
      return result
    } catch (error) {
      throw error
    } finally {
      loading.value = false
    }
  }

  // 获取所有内容列表（首页使用）
  const fetchAllContentList = async (page = 1, refresh = false) => {
    try {
      loading.value = true
      console.log('开始获取内容列表，页码:', page, '刷新:', refresh)
      
      const result = await getAllContentPageOrderByTime(page, pageSize.value)
      console.log('API返回结果:', result)
      
      // 先设置默认点赞状态，让内容立即显示
      const contentsWithDefaultStatus = (result.list || []).map(content => ({
        ...content,
        isLiked: false,
        likeCount: content.likeCount || 0
      }))
      
      if (refresh || page === 1) {
        contentList.value = contentsWithDefaultStatus
        console.log('设置内容列表:', contentList.value)
      } else {
        contentList.value.push(...contentsWithDefaultStatus)
        console.log('追加内容列表:', contentsWithDefaultStatus)
      }
      
      currentPage.value = page
      hasMore.value = page < result.totalPages
      
      console.log('当前页:', currentPage.value, '是否有更多:', hasMore.value, '总页数:', result.totalPages)
      
      // 异步加载点赞状态
      loadLikeStatusAsync(result.list || [], refresh || page === 1 ? 0 : contentList.value.length - (result.list || []).length)
      
      return result
    } catch (error) {
      console.error('获取内容列表失败:', error)
      if (refresh || page === 1) {
        contentList.value = []
      }
      hasMore.value = false
      throw error
    } finally {
      loading.value = false
      console.log('加载状态结束')
    }
  }

  // 异步加载点赞状态
  const loadLikeStatusAsync = async (contents, startIndex = 0) => {
    // 检查用户是否已登录
    const userStore = useUserStore()
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

  // 获取内容详情
  const fetchContentDetail = async (id) => {
    try {
      const result = await getContent(id)
      
      // 获取点赞状态
      try {
        const likeStatus = await getLikeStatus(id)
        result.isLiked = likeStatus.isLiked || false
      } catch (error) {
        console.warn('获取点赞状态失败:', error)
        result.isLiked = false
      }
      
      currentContent.value = result
      return result
    } catch (error) {
      throw error
    }
  }

  // 加载更多内容
  // 加载更多内容
  const loadMore = async (userId = null) => {
    console.log('loadMore 调用，当前状态:', {
      hasMore: hasMore.value,
      loading: loading.value,
      currentPage: currentPage.value
    })
    
    if (!hasMore.value || loading.value) {
      console.log('跳过 loadMore：没有更多内容或正在加载中')
      return
    }
    
    const nextPage = currentPage.value + 1
    console.log('开始加载第', nextPage, '页')
    
    try {
      if (userId) {
        await fetchContentList(userId, nextPage)
      } else {
        await fetchAllContentList(nextPage)
      }
    } catch (error) {
      console.error('loadMore 失败:', error)
      throw error
    }
  }

  // 重置状态
  const resetState = () => {
    contentList.value = []
    currentContent.value = null
    loading.value = false
    hasMore.value = true
    currentPage.value = 1
  }

  // 异步加载评论数
  const loadCommentCountAsync = async (contents, startIndex = 0) => {
  // 逐个加载评论数
  for (let i = 0; i < contents.length; i++) {
    const content = contents[i]
    const contentIndex = startIndex + i
    
    try {
      const response = await getContentCommentCount(content.id)
      console.log(`内容${content.id}的评论数:`, response)
      
      // 立即更新对应位置的内容
      if (contentList.value[contentIndex]) {
        let commentCount = 0
        if (response && typeof response === 'object') {
          if (response.data !== undefined) {
            commentCount = response.data
          } else if (response.count !== undefined) {
            commentCount = response.count
          } else {
            commentCount = response
          }
        } else if (typeof response === 'number') {
          commentCount = response
        }
        
        contentList.value[contentIndex] = {
          ...contentList.value[contentIndex],
          commentCount: commentCount
        }
      }
    } catch (error) {
      console.warn(`获取内容${content.id}评论数失败:`, error)
    }
    
    // 添加小延迟，避免请求过于频繁
    await new Promise(resolve => setTimeout(resolve, 50))
  }
}

// 在 fetchContents 函数中调用
const fetchContents = async (page = 1, refresh = false) => {
  // ... existing code ...
  
  // 异步加载点赞状态和评论数
  loadLikeStatusAsync(result.list || [], refresh || page === 1 ? 0 : contentList.value.length - (result.list || []).length)
  loadCommentCountAsync(result.list || [], refresh || page === 1 ? 0 : contentList.value.length - (result.list || []).length)
  
  return result
}

  return {
    contentList,
    currentContent,
    loading,
    hasMore,
    currentPage,
    pageSize,
    fetchContentList,
    fetchAllContentList,
    fetchContentDetail,
    loadMore,
    resetState
  }
})