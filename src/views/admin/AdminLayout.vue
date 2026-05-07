<template>
  <el-container class="admin-layout">
    <!-- 顶部栏 -->
    <el-header class="admin-header">
      <div class="header-left">
        <span class="logo">PurpleNote</span>
        <span class="title">管理后台</span>
      </div>
      <div class="header-right">
        <span class="admin-name">{{ userStore.isAuditor ? '审核员' : '管理员' }}: {{ userStore.userInfo?.username || '未知' }}</span>
        <el-button type="danger" size="small" @click="handleLogout">退出</el-button>
      </div>
    </el-header>

    <el-container class="admin-body">
      <!-- 侧边栏 -->
      <el-aside width="200px" class="admin-sidebar">
        <el-menu
          :default-active="currentRoute"
          router
          class="admin-menu"
        >
          <el-menu-item index="/admin/dashboard">
            <span>仪表盘</span>
          </el-menu-item>

          <el-menu-item v-if="userStore.isAdmin" index="/admin/users">
            <span>用户管理</span>
          </el-menu-item>

          <el-menu-item v-if="userStore.isAdmin" index="/admin/contents">
            <span>内容管理</span>
          </el-menu-item>

          <el-menu-item v-if="userStore.isAuditor" index="/admin/audit">
            <span>审核台</span>
          </el-menu-item>
        </el-menu>
      </el-aside>

      <!-- 主内容区 -->
      <el-main class="admin-main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessageBox } from 'element-plus'
import { useUserStore } from '@/stores/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const currentRoute = computed(() => route.path)

const handleLogout = async () => {
  try {
    await ElMessageBox.confirm('确定要退出管理后台吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    userStore.logout()
    router.push('/home')
  } catch {
    // 取消退出
  }
}
</script>

<style scoped>
.admin-layout {
  height: 100vh;
}

.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fff;
  border-bottom: 1px solid #e4e7ed;
  padding: 0 20px;
  height: 60px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.logo {
  font-size: 20px;
  font-weight: bold;
  color: #9774e4;
}

.title {
  font-size: 16px;
  color: #333;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.admin-name {
  color: #666;
}

.admin-body {
  height: calc(100vh - 60px);
}

.admin-sidebar {
  background: #f5f7fa;
}

.admin-menu {
  border-right: none;
  background: transparent;
}

.admin-main {
  padding: 20px;
  background: #f0f2f5;
}
</style>