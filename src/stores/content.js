import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getContentPage, getContent, getAllContentPageOrderByTime } from '@/api/content'

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
      
      if (refresh || page === 1) {
        contentList.value = result.list || []
        console.log('设置内容列表:', contentList.value)
      } else {
        contentList.value.push(...(result.list || []))
        console.log('追加内容列表:', result.list)
      }
      
      currentPage.value = page
      hasMore.value = page < result.totalPages
      
      console.log('当前页:', currentPage.value, '是否有更多:', hasMore.value, '总页数:', result.totalPages)
      
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

  // 获取内容详情
  const fetchContentDetail = async (id) => {
    try {
      const result = await getContent(id)
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