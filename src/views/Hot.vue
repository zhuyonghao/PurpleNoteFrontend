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
    <div class="content-container" style="height: calc(100vh - 64px);">
      <!-- 排行榜列表 -->
      <div class="rank-list-wrapper">
        <!-- 加载状态 -->
        <div v-if="loading && rankList.length === 0" class="loading-container">
          <div class="loading-content">
            <el-icon class="is-loading loading-icon" size="48"><Loading /></el-icon>
            <span class="loading-text">加载中...</span>
          </div>
        </div>
        
        <!-- 排行榜内容 -->
        <div v-else-if="rankList.length > 0" class="rank-items-container">
          <div 
            v-for="(item, index) in rankList" 
            :key="item.contentId"
            class="rank-item"
            @click="viewContent(item.contentId)"
          >
            <div class="rank-item-content">
              <div class="rank-item-inner">
                <!-- 排名和内容信息 -->
                <div class="rank-info-section">
                  <!-- 排名徽章 -->
                  <div class="rank-badge-container">
                    <div 
                      class="rank-badge"
                      :class="getRankBadgeClass(index)"
                    >
                      {{ index + 1 }}
                    </div>
                  </div>
                  
                  <!-- 内容信息 -->
                  <div class="content-info">
                    <h3 class="content-title">
                      {{ item.contentTitle }}
                    </h3>
                    <div class="content-meta">
                      <div class="meta-item">
                        <el-icon class="meta-icon"><User /></el-icon>
                        <span class="meta-text">{{ item.userName }}</span>
                      </div>
                      <div class="meta-item like-meta">
                        <el-icon class="meta-icon like-icon"><StarFilled /></el-icon>
                        <span class="like-count">{{ item.likeCount }} 点赞</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <!-- 查看按钮 -->
                <div class="action-section">
                  <el-button 
                    type="primary" 
                    size="default" 
                    class="view-button"
                    @click.stop="viewContent(item.contentId)"
                  >
                    <span class="button-text">查看详情</span>
                  </el-button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 空状态 -->
        <div v-else class="empty-state">
          <div class="empty-content">
            <el-icon size="80" class="empty-icon"><TrendCharts /></el-icon>
            <p class="empty-title">暂无热门内容</p>
            <p class="empty-subtitle">快去发布精彩内容吧！</p>
          </div>
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
    return 'rank-badge-gold' // 金色
  } else if (index === 1) {
    return 'rank-badge-silver' // 银色
  } else if (index === 2) {
    return 'rank-badge-bronze' // 铜色
  } else {
    return 'rank-badge-purple' // 紫色
  }
}

// 页面加载时获取数据
onMounted(() => {
  fetchRankData()
})
</script>

<style scoped>
/* 内容容器样式 */
.content-container {
  padding: 24px !important;
  overflow-y: auto !important;
  overflow-x: hidden !important;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%) !important;
  display: flex !important;
  justify-content: center !important;
  align-items: flex-start !important;
}

/* 排行榜列表包装器 */
.rank-list-wrapper {
  width: 100% !important;
  max-width: 1000px !important;
  margin: 0 auto !important;
  display: flex !important;
  flex-direction: column !important;
  align-items: center !important;
  min-height: calc(100vh - 112px) !important;
}

/* 加载状态容器 */
.loading-container {
  display: flex !important;
  justify-content: center !important;
  align-items: center !important;
  height: 400px !important;
  width: 100% !important;
}

.loading-content {
  display: flex !important;
  flex-direction: column !important;
  align-items: center !important;
  justify-content: center !important;
  padding: 40px !important;
  background: rgba(255, 255, 255, 0.9) !important;
  border-radius: 20px !important;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1) !important;
  backdrop-filter: blur(10px) !important;
}

.loading-icon {
  color: #6366f1 !important;
  margin-bottom: 16px !important;
}

.loading-text {
  color: #6b7280 !important;
  font-size: 16px !important;
  font-weight: 500 !important;
}

/* 排行榜项目容器 */
.rank-items-container {
  width: 100% !important;
  display: flex !important;
  flex-direction: column !important;
  gap: 20px !important;
  align-items: center !important;
}

/* 排行榜项目 */
.rank-item {
  width: 100% !important;
  max-width: 900px !important;
  background: rgba(255, 255, 255, 0.95) !important;
  border-radius: 20px !important;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1) !important;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1) !important;
  cursor: pointer !important;
  overflow: hidden !important;
  backdrop-filter: blur(10px) !important;
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
}

.rank-item:hover {
  transform: translateY(-8px) scale(1.02) !important;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15) !important;
  background: rgba(255, 255, 255, 1) !important;
}

.rank-item-content {
  padding: 32px !important;
}

.rank-item-inner {
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  width: 100% !important;
}

/* 排名信息区域 */
.rank-info-section {
  display: flex !important;
  align-items: center !important;
  gap: 24px !important;
  flex: 1 !important;
  min-width: 0 !important;
}

/* 排名徽章 */
.rank-badge-container {
  flex-shrink: 0 !important;
}

.rank-badge {
  width: 60px !important;
  height: 60px !important;
  border-radius: 50% !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  color: white !important;
  font-weight: 700 !important;
  font-size: 20px !important;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2) !important;
  position: relative !important;
}

.rank-badge::before {
  content: '' !important;
  position: absolute !important;
  inset: -2px !important;
  border-radius: 50% !important;
  background: linear-gradient(45deg, rgba(255,255,255,0.3), transparent) !important;
  z-index: -1 !important;
}

/* 内容信息 */
.content-info {
  flex: 1 !important;
  min-width: 0 !important;
}

.content-title {
  font-size: 20px !important;
  font-weight: 600 !important;
  color: #1f2937 !important;
  margin-bottom: 12px !important;
  line-height: 1.4 !important;
  display: -webkit-box !important;
  -webkit-line-clamp: 2 !important;
  -webkit-box-orient: vertical !important;
  overflow: hidden !important;
}

.content-meta {
  display: flex !important;
  align-items: center !important;
  gap: 24px !important;
  flex-wrap: wrap !important;
}

.meta-item {
  display: flex !important;
  align-items: center !important;
  gap: 6px !important;
  font-size: 14px !important;
  color: #6b7280 !important;
}

.meta-icon {
  font-size: 16px !important;
}

.like-meta {
  color: #ef4444 !important;
}

.like-icon {
  color: #ef4444 !important;
}

.like-count {
  font-weight: 600 !important;
  color: #ef4444 !important;
}

/* 操作区域 */
.action-section {
  flex-shrink: 0 !important;
  margin-left: 24px !important;
}

.view-button {
  padding: 12px 24px !important;
  border-radius: 12px !important;
  font-weight: 600 !important;
  font-size: 14px !important;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%) !important;
  border: none !important;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3) !important;
  transition: all 0.3s ease !important;
}

.view-button:hover {
  transform: translateY(-2px) !important;
  box-shadow: 0 8px 20px rgba(99, 102, 241, 0.4) !important;
  background: linear-gradient(135deg, #5855f7 0%, #7c3aed 100%) !important;
}

.button-text {
  color: white !important;
}

/* 空状态 */
.empty-state {
  display: flex !important;
  justify-content: center !important;
  align-items: center !important;
  height: 400px !important;
  width: 100% !important;
}

.empty-content {
  text-align: center !important;
  padding: 60px 40px !important;
  background: rgba(255, 255, 255, 0.9) !important;
  border-radius: 24px !important;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1) !important;
  backdrop-filter: blur(10px) !important;
}

.empty-icon {
  color: #d1d5db !important;
  margin-bottom: 24px !important;
}

.empty-title {
  color: #6b7280 !important;
  font-size: 20px !important;
  font-weight: 600 !important;
  margin-bottom: 8px !important;
}

.empty-subtitle {
  color: #9ca3af !important;
  font-size: 14px !important;
}

/* 文本截断样式 */
.line-clamp-2 {
  display: -webkit-box !important;
  -webkit-line-clamp: 2 !important;
  -webkit-box-orient: vertical !important;
  overflow: hidden !important;
}

/* 渐变动画 */
.bg-gradient-to-r {
  background-size: 200% 200% !important;
  animation: gradient 3s ease infinite !important;
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

/* 响应式设计 */
@media (max-width: 768px) {
  .content-container {
    padding: 16px !important;
  }
  
  .rank-item-content {
    padding: 20px !important;
  }
  
  .rank-item-inner {
    flex-direction: column !important;
    gap: 20px !important;
  }
  
  .rank-info-section {
    width: 100% !important;
  }
  
  .action-section {
    margin-left: 0 !important;
    width: 100% !important;
  }
  
  .view-button {
    width: 100% !important;
  }
  
  .content-meta {
    gap: 16px !important;
  }
}


/* 排名徽章颜色样式 */
.rank-badge-gold {
  background: linear-gradient(135deg, #fbbf24 0%, #d97706 100%) !important;
}

.rank-badge-silver {
  background: linear-gradient(135deg, #9ca3af 0%, #6b7280 100%) !important;
}

.rank-badge-bronze {
  background: linear-gradient(135deg, #fb923c 0%, #ea580c 100%) !important;
}

.rank-badge-purple {
  background: linear-gradient(135deg, #a855f7 0%, #7c3aed 100%) !important;
}

</style>