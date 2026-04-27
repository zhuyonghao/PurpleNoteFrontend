<template>
  <!-- 桌面端左侧导航栏 -->
  <el-aside width="240px" class="desktop-nav">
    <div class="nav-container">
      <!-- Logo区域 -->
      <div class="logo-section">
        <div class="logo-container">
          <div class="logo-icon-wrapper">
            <div class="logo-icon">
              <span class="logo-text">P</span>
            </div>
          </div>
          <div class="brand-text-wrapper">
            <span class="brand-text">Purple Note</span>
            <span class="brand-subtitle">创意笔记平台</span>
          </div>
        </div>
      </div>

      <!-- 导航菜单 -->
      <div class="nav-menu-wrapper">
        <el-menu
          :default-active="$route.path"
          class="nav-menu"
          router
          background-color="transparent"
          text-color="#6B7280"
          active-text-color="#9B8AA0"
        >
          <el-menu-item index="/" class="nav-item">
            <div class="nav-item-content">
              <el-icon class="nav-icon"><House /></el-icon>
              <span class="nav-text">首页</span>
            </div>
          </el-menu-item>

          <el-menu-item index="/hot" class="nav-item">
            <div class="nav-item-content">
              <el-icon class="nav-icon"><TrendCharts /></el-icon>
              <span class="nav-text">热门</span>
            </div>
          </el-menu-item>

          <el-menu-item index="/publish" class="nav-item">
            <div class="nav-item-content">
              <el-icon class="nav-icon"><Plus /></el-icon>
              <span class="nav-text">发布</span>
            </div>
          </el-menu-item>

          <el-menu-item index="/profile" class="nav-item">
            <div class="nav-item-content">
              <el-icon class="nav-icon"><User /></el-icon>
              <span class="nav-text">我</span>
            </div>
          </el-menu-item>
        </el-menu>
      </div>

      <!-- 用户信息 -->
      <div class="user-section" v-if="userStore.userInfo">
        <el-dropdown @command="handleUserCommand" trigger="click">
          <div class="user-dropdown">
            <el-avatar :src="userStore.userInfo.avatarUrl" :size="40" class="user-avatar">
              <el-icon><User /></el-icon>
            </el-avatar>
            <div class="user-info">
              <p class="user-name">
                {{ userStore.userInfo.nickname || userStore.userInfo.username }}
              </p>
            </div>
            <el-icon class="dropdown-arrow"><ArrowDown /></el-icon>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="profile">
                <el-icon class="menu-icon"><User /></el-icon>
                个人主页
              </el-dropdown-item>
              <el-dropdown-item command="settings">
                <el-icon class="menu-icon"><Setting /></el-icon>
                设置
              </el-dropdown-item>
              <el-dropdown-item command="logout" divided>
                <el-icon class="menu-icon logout-icon"><SwitchButton /></el-icon>
                <span class="logout-text">退出登录</span>
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>
  </el-aside>

  <!-- 移动端底部导航栏 -->
  <div class="mobile-nav">
    <div class="mobile-nav-bar">
      <router-link
        v-for="item in navItems"
        :key="item.path"
        :to="item.path"
        class="mobile-nav-item"
        :class="{ 'is-active': $route.path === item.path }"
      >
        <el-icon class="mobile-icon"><component :is="item.icon" /></el-icon>
        <span class="mobile-text">{{ item.label }}</span>
      </router-link>
    </div>
  </div>
</template>

<script setup>
import {
  House,
  TrendCharts,
  Plus,
  User,
  ArrowDown,
  Setting,
  SwitchButton
} from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'

const userStore = useUserStore()
const router = useRouter()

const navItems = [
  { path: '/', icon: House, label: '首页' },
  { path: '/hot', icon: TrendCharts, label: '热门' },
  { path: '/publish', icon: Plus, label: '发布' },
  { path: '/profile', icon: User, label: '我' }
]

const handleUserCommand = async (command) => {
  switch (command) {
    case 'profile':
      router.push('/profile')
      break
    case 'settings':
      ElMessage.info('设置功能开发中')
      break
    case 'logout':
      await handleLogout()
      break
  }
}

const handleLogout = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要退出登录吗？',
      '退出确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )

    userStore.logout()
    ElMessage.success('已退出登录')
    router.push('/login')
  } catch (error) {
    console.log('用户取消退出登录')
  }
}
</script>

<style scoped>
/* 桌面端导航 */
.desktop-nav {
  display: none;
}

@media (min-width: 768px) {
  .desktop-nav {
    display: block;
  }
  .mobile-nav {
    display: none;
  }
}

.nav-container {
  height: 100vh;
  background: white;
  border-right: 1px solid #F0EEF5;
  display: flex;
  flex-direction: column;
}

/* Logo区域 */
.logo-section {
  padding: 24px 20px;
  border-bottom: 1px solid #F0EEF5;
}

.logo-container {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-icon-wrapper {
  flex-shrink: 0;
}

.logo-icon {
  width: 44px;
  height: 44px;
  background: linear-gradient(135deg, #9B8AA0 0%, #B4A5BE 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(155, 138, 160, 0.25);
  transition: all 0.2s ease;
}

.logo-icon:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 16px rgba(155, 138, 160, 0.35);
}

.logo-text {
  font-size: 22px;
  font-weight: 700;
  color: white;
}

.brand-text-wrapper {
  display: flex;
  flex-direction: column;
}

.brand-text {
  font-size: 16px;
  font-weight: 600;
  color: #374151;
  line-height: 1.2;
}

.brand-subtitle {
  font-size: 11px;
  color: #9CA3AF;
  margin-top: 2px;
}

/* 导航菜单 */
.nav-menu-wrapper {
  flex: 1;
  padding: 16px 12px;
}

.nav-menu {
  border: none;
}

.nav-item {
  height: auto;
  padding: 0;
  margin-bottom: 4px;
  border-radius: 10px;
}

.nav-item-content {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-radius: 10px;
  transition: all 0.2s ease;
}

.nav-item:hover .nav-item-content {
  background: #F8F7FA;
}

.nav-item.is-active .nav-item-content {
  background: linear-gradient(135deg, rgba(155, 138, 160, 0.1) 0%, rgba(180, 165, 190, 0.1) 100%);
}

.nav-icon {
  font-size: 18px;
  margin-right: 12px;
  color: #9B8AA0;
}

.nav-text {
  font-size: 14px;
  font-weight: 500;
  color: inherit;
}

.nav-item.is-active .nav-icon,
.nav-item.is-active .nav-text {
  color: #9B8AA0;
}

/* 用户区域 */
.user-section {
  padding: 16px 20px;
  border-top: 1px solid #F0EEF5;
  background: #FAFAFA;
}

.user-dropdown {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: white;
  border: 1px solid #E8E0ED;
}

.user-dropdown:hover {
  border-color: #B4A5BE;
  box-shadow: 0 2px 8px rgba(155, 138, 160, 0.1);
}

.user-avatar {
  border: 2px solid #E8E0ED;
  margin-right: 10px;
}

.user-info {
  flex: 1;
  min-width: 0;
}

.user-name {
  font-size: 13px;
  font-weight: 500;
  color: #374151;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dropdown-arrow {
  font-size: 14px;
  color: #9CA3AF;
  transition: transform 0.2s ease;
}

.user-dropdown:hover .dropdown-arrow {
  color: #9B8AA0;
}

/* 下拉菜单图标 */
.menu-icon {
  margin-right: 8px;
  font-size: 14px;
}

.logout-icon {
  color: #D4A5A5;
}

.logout-text {
  color: #D4A5A5;
}

/* 移动端导航 */
.mobile-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  padding-bottom: env(safe-area-inset-bottom);
  background: white;
  border-top: 1px solid #F0EEF5;
}

@media (max-width: 767px) {
  .mobile-nav {
    display: block;
  }
  .desktop-nav {
    display: none;
  }
}

.mobile-nav-bar {
  display: flex;
  justify-content: space-around;
  align-items: center;
  height: 56px;
}

.mobile-nav-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  text-decoration: none;
  color: #9CA3AF;
  transition: all 0.2s ease;
  padding: 8px 0;
}

.mobile-nav-item:hover,
.mobile-nav-item.is-active {
  color: #9B8AA0;
}

.mobile-icon {
  font-size: 20px;
}

.mobile-text {
  font-size: 10px;
  font-weight: 500;
}
</style>
