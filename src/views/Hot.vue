<template>
  <MainLayout>
    <!-- 顶部工具栏 -->
    <el-header class="bg-white shadow-sm border-b border-gray-100 flex items-center justify-between px-6" height="64px">
      <h1 class="text-xl font-semibold text-gray-800">热门排行榜</h1>
      <div class="flex items-center space-x-3">
        <el-button icon="Refresh" circle @click="refreshRank" :loading="loading" />
      </div>
    </el-header>
    
    <!-- 内容区域 -->
    <div class="p-6 overflow-auto" style="height: calc(100vh - 64px);">
      <!-- 排行榜列表 -->
      <div class="max-w-4xl mx-auto">
        <!-- 加载状态 -->
        <div v-if="loading && rankList.length === 0" class="flex justify-center items-center h-64">
          <el-icon class="is-loading mr-2" size="32"><Loading /></el-icon>
          <span class="text-gray-500">加载中...</span>
        </div>
        
        <!-- 排行榜内容 -->
        <div v-else-if="rankList.length > 0" class="space-y-4">
          <div 
            v-for="(item, index) in rankList" 
            :key="item.contentId"
            class="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer overflow-hidden"
            @click="viewContent(item.contentId)"
          >
            <div class="p-6">
              <div class="flex items-center justify-between">
                <!-- 排名和内容信息 -->
                <div class="flex items-center space-x-4 flex-1">
                  <!-- 排名徽章 -->
                  <div class="flex-shrink-0">
                    <div 
                      class="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
                      :class="getRankBadgeClass(index)"
                    >
                      {{ index + 1 }}
                    </div>
                  </div>
                  
                  <!-- 内容信息 -->
                  <div class="flex-1 min-w-0">
                    <h3 class="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">
                      {{ item.contentTitle }}
                    </h3>
                    <div class="flex items-center space-x-4 text-sm text-gray-500">
                      <div class="flex items-center space-x-1">
                        <el-icon><User /></el-icon>
                        <span>{{ item.userName }}</span>
                      </div>
                      <div class="flex items-center space-x-1">
                        <el-icon class="text-red-500"><StarFilled /></el-icon>
                        <span class="font-medium text-red-500">{{ item.likeCount }} 点赞</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <!-- 查看按钮 -->
                <div class="flex-shrink-0 ml-4">
                  <el-button type="primary" size="small" @click.stop="viewContent(item.contentId)">
                    查看详情
                  </el-button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 空状态 -->
        <div v-else class="text-center py-16">
          <el-icon size="64" class="text-gray-300 mb-4"><TrendCharts /></el-icon>
          <p class="text-gray-500 text-lg mb-2">暂无热门内容</p>
          <p class="text-gray-400 text-sm">快去发布精彩内容吧！</p>
        </div>
      </div>
    </div>
  </MainLayout>
</template>

<script setup>
import MainLayout from '@/layouts/MainLayout.vue'
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getLikeRank } from '@/api/like'
import { 
  Loading, 
  Refresh, 
  User, 
  StarFilled, 
  TrendCharts 
} from '@element-plus/icons-vue'

const router = useRouter()
const rankList = ref([])
const loading = ref(false)

// 获取排行榜数据
// 获取排行榜数据
const fetchRankData = async () => {
  try {
    loading.value = true
    console.log('正在获取点赞排行榜数据...')
    
    const response = await getLikeRank()
    console.log('API完整响应:', response)
    
    // 由于响应拦截器已经处理了code和message，直接使用返回的data
    if (response && Array.isArray(response)) {
      rankList.value = response
      console.log('获取排行榜数据成功:', response)
    } else {
      console.error('API响应数据结构异常:', response)
      ElMessage.error('数据格式错误')
    }
  } catch (error) {
    console.error('获取排行榜数据失败:', error)
    ElMessage.error('获取排行榜数据失败，请重试')
  } finally {
    loading.value = false
  }
}

// 刷新排行榜
const refreshRank = async () => {
  await fetchRankData()
  ElMessage.success('排行榜已刷新')
}

// 查看内容详情
const viewContent = (contentId) => {
  router.push(`/content/${contentId}`)
}

// 获取排名徽章样式
const getRankBadgeClass = (index) => {
  if (index === 0) {
    return 'bg-gradient-to-r from-yellow-400 to-yellow-600' // 金色
  } else if (index === 1) {
    return 'bg-gradient-to-r from-gray-400 to-gray-600' // 银色
  } else if (index === 2) {
    return 'bg-gradient-to-r from-orange-400 to-orange-600' // 铜色
  } else {
    return 'bg-gradient-to-r from-purple-400 to-purple-600' // 紫色
  }
}

// 页面加载时获取数据
onMounted(() => {
  fetchRankData()
})
</script>

<style scoped>
/* 文本截断样式 */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 悬停效果 */
.hover\:shadow-md:hover {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

/* 渐变动画 */
.bg-gradient-to-r {
  background-size: 200% 200%;
  animation: gradient 3s ease infinite;
}

@keyframes gradient {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}
</style>