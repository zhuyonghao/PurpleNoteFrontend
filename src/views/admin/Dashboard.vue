<template>
  <div class="dashboard">
    <!-- 欢迎区域 -->
    <div class="welcome-section">
      <div class="welcome-content">
        <h1 class="welcome-title">{{ greeting }}，{{ userStore.userInfo?.username || '管理员' }}</h1>
        <p class="welcome-subtitle">{{ userStore.isAuditor ? '审核员' : '管理员' }}控制台</p>
      </div>
      <div class="welcome-decoration">
        <div class="decoration-circle circle-1"></div>
        <div class="decoration-circle circle-2"></div>
        <div class="decoration-circle circle-3"></div>
      </div>
    </div>

    <!-- 快捷入口 -->
    <div class="quick-actions">
      <h3 class="section-title">快捷入口</h3>
      <div class="action-cards">
        <div v-if="userStore.isAdmin" class="action-card" @click="router.push('/admin/users')">
          <div class="card-icon-wrapper user-icon">
            <el-icon :size="28"><User /></el-icon>
          </div>
          <span class="card-label">用户管理</span>
          <span class="card-desc">管理平台用户</span>
        </div>

        <div v-if="userStore.isAdmin" class="action-card" @click="router.push('/admin/contents')">
          <div class="card-icon-wrapper content-icon">
            <el-icon :size="28"><Document /></el-icon>
          </div>
          <span class="card-label">内容管理</span>
          <span class="card-desc">审核与发布内容</span>
        </div>

        <div v-if="userStore.isAuditor" class="action-card" @click="router.push('/admin/audit')">
          <div class="card-icon-wrapper audit-icon">
            <el-icon :size="28"><Search /></el-icon>
          </div>
          <span class="card-label">内容审核</span>
          <span class="card-desc">待审核内容</span>
        </div>

        <div class="action-card" @click="router.push('/home')">
          <div class="card-icon-wrapper home-icon">
            <el-icon :size="28"><HomeFilled /></el-icon>
          </div>
          <span class="card-label">用户界面</span>
          <span class="card-desc">返回前台首页</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { User, Document, Search, HomeFilled } from '@element-plus/icons-vue'

const router = useRouter()
const userStore = useUserStore()

const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 12) return '早上好'
  if (hour < 18) return '下午好'
  return '晚上好'
})
</script>

<style scoped>
.dashboard {
  padding: 0;
}

/* 欢迎区域 */
.welcome-section {
  position: relative;
  background: linear-gradient(135deg, #9774e4 0%, #b9a2f6 100%);
  border-radius: 16px;
  padding: 32px 40px;
  margin-bottom: 32px;
  overflow: hidden;
  color: #fff;
}

.welcome-content {
  position: relative;
  z-index: 2;
}

.welcome-title {
  margin: 0 0 8px 0;
  font-size: 28px;
  font-weight: 600;
}

.welcome-subtitle {
  margin: 0;
  font-size: 14px;
  opacity: 0.9;
}

.welcome-decoration {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 50%;
  overflow: hidden;
}

.decoration-circle {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
}

.circle-1 {
  width: 200px;
  height: 200px;
  top: -80px;
  right: -40px;
}

.circle-2 {
  width: 150px;
  height: 150px;
  top: 20px;
  right: 80px;
}

.circle-3 {
  width: 100px;
  height: 100px;
  bottom: -40px;
  right: 160px;
}

/* 快捷入口 */
.section-title {
  margin: 0 0 20px 0;
  font-size: 16px;
  font-weight: 500;
  color: #333;
}

.action-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 20px;
}

.action-card {
  background: #fff;
  border-radius: 12px;
  padding: 24px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid #f0f0f0;
}

.action-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(151, 116, 228, 0.15);
  border-color: #9774e4;
}

.card-icon-wrapper {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
}

.user-icon {
  background: linear-gradient(135deg, #e4e6f0 0%, #d0d3e8 100%);
  color: #6b7280;
}

.content-icon {
  background: linear-gradient(135deg, #fce7f3 0%, #f9a8d4 100%);
  color: #db2777;
}

.audit-icon {
  background: linear-gradient(135deg, #fef3c7 0%, #fcd34d 100%);
  color: #d97706;
}

.home-icon {
  background: linear-gradient(135deg, #d1fae5 0%, #6ee7b7 100%);
  color: #059669;
}

.card-label {
  display: block;
  font-size: 16px;
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
}

.card-desc {
  display: block;
  font-size: 12px;
  color: #999;
}
</style>