<template>
  <MainLayout>
    <!-- 顶部工具栏 -->
    <el-header class="hot-header" height="64px">
      <h1 class="header-title">热门排行榜</h1>
      <el-button class="refresh-btn" icon="Refresh" circle @click="refreshRank" :loading="loading" />
    </el-header>

    <!-- 内容区域 -->
    <div class="content-area">
      <!-- 加载状态 -->
      <div v-if="loading && rankList.length === 0" class="loading-container">
        <div class="loading-content">
          <el-icon class="is-loading loading-icon"><Loading /></el-icon>
          <span class="loading-text">加载中...</span>
        </div>
      </div>

      <!-- 排行榜内容 -->
      <div v-else-if="rankList.length > 0" class="rank-list">
        <div
          v-for="(item, index) in rankList"
          :key="item.contentId"
          class="rank-item"
          :style="{ animationDelay: `${index * 0.05}s` }"
          @click="viewContent(item.contentId)"
        >
          <!-- 排名 -->
          <div class="rank-badge" :class="getRankBadgeClass(index)">
            {{ index + 1 }}
          </div>

          <!-- 内容信息 -->
          <div class="item-content">
            <div class="item-info">
              <h3 class="item-title">{{ item.contentTitle }}</h3>
              <div class="item-meta">
                <div class="meta-item">
                  <el-icon class="meta-icon"><User /></el-icon>
                  <span>{{ item.userName }}</span>
                </div>
                <div class="meta-item like-item">
                  <el-icon class="meta-icon"><StarFilled /></el-icon>
                  <span>{{ item.likeCount }} 点赞</span>
                </div>
              </div>
            </div>

            <!-- 查看按钮 -->
            <el-button class="view-btn" @click.stop="viewContent(item.contentId)">
              查看详情
            </el-button>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-else class="empty-state">
        <div class="empty-content">
          <el-icon size="64" class="empty-icon"><TrendCharts /></el-icon>
          <p class="empty-title">暂无热门内容</p>
          <p class="empty-subtitle">快去发布精彩内容吧！</p>
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

const fetchRankData = async () => {
  try {
    loading.value = true
    const response = await getLikeRank()

    if (response && Array.isArray(response)) {
      rankList.value = response
    } else {
      ElMessage.error('数据格式错误')
    }
  } catch (error) {
    ElMessage.error('获取排行榜数据失败，请重试')
  } finally {
    loading.value = false
  }
}

const refreshRank = async () => {
  await fetchRankData()
  ElMessage.success('排行榜已刷新')
}

const viewContent = (contentId) => {
  router.push(`/content/${contentId}`)
}

const getRankBadgeClass = (index) => {
  if (index === 0) return 'gold'
  if (index === 1) return 'silver'
  if (index === 2) return 'bronze'
  return 'purple'
}

onMounted(() => {
  fetchRankData()
})
</script>

<style scoped>
/* 顶部工具栏 */
.hot-header {
  background: white;
  border-bottom: 1px solid #F0EEF5;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
}

.header-title {
  font-size: 18px;
  font-weight: 600;
  color: #374151;
}

.refresh-btn {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  border: 1px solid #E8E0ED;
  background: white;
  color: #9B8AA0;
  transition: all 0.2s ease;
}

.refresh-btn:hover {
  background: #F8F7FA;
  border-color: #B4A5BE;
  color: #9B8AA0;
  transform: rotate(90deg);
}

/* 内容区域 */
.content-area {
  padding: 24px;
  min-height: calc(100vh - 64px);
  background: linear-gradient(180deg, #FAFAFA 0%, #F5F5F5 100%);
}

/* 加载状态 */
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 80px 0;
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(155, 138, 160, 0.1);
}

.loading-icon {
  color: #B4A5BE;
  margin-bottom: 12px;
  font-size: 32px;
}

.loading-text {
  color: #9CA3AF;
  font-size: 14px;
}

/* 排行榜列表 */
.rank-list {
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* 排行榜项目 */
.rank-item {
  display: flex;
  align-items: center;
  gap: 20px;
  background: white;
  border-radius: 14px;
  padding: 20px 24px;
  box-shadow: 0 2px 12px rgba(155, 138, 160, 0.06);
  border: 1px solid #F0EEF5;
  cursor: pointer;
  transition: all 0.2s ease;
  opacity: 0;
  animation: fadeInUp 0.5s ease forwards;
}

.rank-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(155, 138, 160, 0.12);
  border-color: #E8E0ED;
}

/* 排名徽章 */
.rank-badge {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 18px;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.rank-badge.gold {
  background: linear-gradient(135deg, #E5C76B 0%, #C9A84C 100%);
}

.rank-badge.silver {
  background: linear-gradient(135deg, #C4C4C4 0%, #9A9A9A 100%);
}

.rank-badge.bronze {
  background: linear-gradient(135deg, #D4A574 0%, #B8865A 100%);
}

.rank-badge.purple {
  background: linear-gradient(135deg, #9B8AA0 0%, #7A6A7D 100%);
}

/* 内容信息 */
.item-content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  min-width: 0;
}

.item-info {
  flex: 1;
  min-width: 0;
}

.item-title {
  font-size: 16px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 8px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.item-meta {
  display: flex;
  align-items: center;
  gap: 16px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #9CA3AF;
}

.meta-icon {
  font-size: 14px;
}

.like-item {
  color: #D4A5A5;
}

/* 查看按钮 */
.view-btn {
  flex-shrink: 0;
  padding: 8px 20px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
  background: linear-gradient(135deg, #9B8AA0 0%, #B4A5BE 100%);
  border: none;
  color: white;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(155, 138, 160, 0.2);
}

.view-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(155, 138, 160, 0.3);
}

/* 空状态 */
.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 80px 0;
}

.empty-content {
  text-align: center;
  padding: 48px 40px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(155, 138, 160, 0.1);
}

.empty-icon {
  color: #D4D0DB;
  margin-bottom: 16px;
}

.empty-title {
  font-size: 18px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 8px;
}

.empty-subtitle {
  font-size: 14px;
  color: #9CA3AF;
}

/* 动画 */
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

/* 响应式 */
@media (max-width: 640px) {
  .content-area {
    padding: 16px;
  }

  .rank-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
    padding: 16px;
  }

  .rank-badge {
    width: 40px;
    height: 40px;
    font-size: 16px;
  }

  .item-content {
    flex-direction: column;
    align-items: flex-start;
    width: 100%;
  }

  .view-btn {
    width: 100%;
  }
}
</style>
