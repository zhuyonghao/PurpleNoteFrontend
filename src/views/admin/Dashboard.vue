<template>
  <div class="dashboard">
    <h2 class="page-title">仪表盘</h2>

    <!-- Admin 视角 -->
    <div v-if="userStore.isAdmin" class="stats-grid">
      <el-card class="stat-card">
        <template #header>
          <div class="card-header">
            <span>用户统计</span>
          </div>
        </template>
        <div class="stat-value">{{ stats.users }}</div>
        <div class="stat-label">总用户数</div>
      </el-card>

      <el-card class="stat-card">
        <template #header>
          <div class="card-header">
            <span>内容统计</span>
          </div>
        </template>
        <div class="stat-value">{{ stats.contents }}</div>
        <div class="stat-label">总内容数</div>
      </el-card>

      <el-card class="stat-card">
        <template #header>
          <div class="card-header">
            <span>待审核</span>
          </div>
        </template>
        <div class="stat-value">{{ stats.pending }}</div>
        <div class="stat-label">待审核内容</div>
      </el-card>
    </div>

    <!-- Auditor 视角 -->
    <div v-if="userStore.isAuditor" class="stats-grid">
      <el-card class="stat-card">
        <template #header>
          <div class="card-header">
            <span>待审核</span>
          </div>
        </template>
        <div class="stat-value">{{ stats.pending }}</div>
        <div class="stat-label">待审核内容</div>
      </el-card>

      <el-card class="stat-card">
        <template #header>
          <div class="card-header">
            <span>今日已审核</span>
          </div>
        </template>
        <div class="stat-value">{{ stats.todayApproved }}</div>
        <div class="stat-label">今日通过</div>
      </el-card>

      <el-card class="stat-card">
        <template #header>
          <div class="card-header">
            <span>本月已审核</span>
          </div>
        </template>
        <div class="stat-value">{{ stats.monthApproved }}</div>
        <div class="stat-label">本月通过</div>
      </el-card>
    </div>

    <!-- 快捷入口 -->
    <div class="quick-actions">
      <h3>快捷入口</h3>
      <div class="action-cards">
        <el-card v-if="userStore.isAdmin" class="action-card" @click="router.push('/admin/users')">
          <el-icon :size="32"><User /></el-icon>
          <span>用户管理</span>
        </el-card>

        <el-card v-if="userStore.isAdmin" class="action-card" @click="router.push('/admin/contents')">
          <el-icon :size="32"><Document /></el-icon>
          <span>内容管理</span>
        </el-card>

        <el-card v-if="userStore.isAuditor" class="action-card" @click="router.push('/admin/audit')">
          <el-icon :size="32"><Search /></el-icon>
          <span>审核台</span>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { User, Document, Search } from '@element-plus/icons-vue'

const router = useRouter()
const userStore = useUserStore()

const stats = ref({
  users: 0,
  contents: 0,
  pending: 0,
  todayApproved: 0,
  monthApproved: 0
})

onMounted(() => {
  // TODO: 调用统计 API 获取数据
  // 这里暂时使用模拟数据
  stats.value = {
    users: 128,
    contents: 456,
    pending: 12,
    todayApproved: 8,
    monthApproved: 156
  }
})
</script>

<style scoped>
.dashboard {
  padding: 0;
}

.page-title {
  margin: 0 0 20px 0;
  font-size: 24px;
  color: #333;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  text-align: center;
}

.card-header {
  text-align: center;
}

.stat-value {
  font-size: 36px;
  font-weight: bold;
  color: #9774e4;
  margin: 10px 0;
}

.stat-label {
  color: #999;
  font-size: 14px;
}

.quick-actions h3 {
  margin: 0 0 16px 0;
  color: #333;
}

.action-cards {
  display: flex;
  gap: 20px;
}

.action-card {
  width: 150px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
}

.action-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.action-card .el-icon {
  color: #9774e4;
  margin-bottom: 10px;
}

.action-card span {
  display: block;
  color: #666;
}
</style>