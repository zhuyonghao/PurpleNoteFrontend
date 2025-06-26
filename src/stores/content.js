import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getContentPage, getContent } from '@/api/content'

export const useContentStore = defineStore('content', () => {
  const contentList = ref([])
  const currentContent = ref(null)
  const loading = ref(false)
  const hasMore = ref(true)
  const currentPage = ref(1)
  const pageSize = ref(10)

  // 获取内容列表
  const fetchContentList = async (userId, page = 1, refresh = false) => {
    try {
      loading.value = true
      const params = {
        userId,
        page,
        size: pageSize.value
      }
      const result = await getContentPage(params)
      
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

  // 加载更多
  const loadMore = async (userId) => {
    if (hasMore.value && !loading.value) {
      await fetchContentList(userId, currentPage.value + 1)
    }
  }

  // 刷新列表
  const refreshList = async (userId) => {
    await fetchContentList(userId, 1, true)
  }

  return {
    contentList,
    currentContent,
    loading,
    hasMore,
    currentPage,
    fetchContentList,
    fetchContentDetail,
    loadMore,
    refreshList
  }
})