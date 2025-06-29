<template>
  <!-- 桌面端左侧导航栏 -->
  <el-aside width="256px" class="desktop-nav">
    <div class="h-screen bg-white shadow-lg flex flex-col">
      <!-- Logo区域 -->
      <div class="p-6 border-b border-gray-100 logo-section">
        <div class="logo-container">
          <div class="logo-icon-wrapper">
            <div class="logo-icon">
              <span class="logo-text">P</span>
              <div class="logo-shine"></div>
            </div>
          </div>
          <div class="brand-text-wrapper">
            <span class="brand-text">Purple Note</span>
            <div class="brand-subtitle">创意笔记平台</div>
          </div>
        </div>
      </div>
      
      <!-- 导航菜单 -->
      <div class="flex-1 p-4">
        <el-menu
          :default-active="$route.path"
          class="border-none nav-menu-container"
          router
          background-color="transparent"
          text-color="#374151"
          active-text-color="#9333ea"
        >
          <el-menu-item index="/" class="nav-menu-item">
            <div class="nav-item-content">
              <el-icon class="nav-icon"><House /></el-icon>
              <span class="nav-text">首页</span>
            </div>
          </el-menu-item>
          
          <el-menu-item index="/hot" class="nav-menu-item">
            <div class="nav-item-content">
              <el-icon class="nav-icon"><TrendCharts /></el-icon>
              <span class="nav-text">热门</span>
            </div>
          </el-menu-item>
          
          <el-menu-item index="/publish" class="nav-menu-item">
            <div class="nav-item-content">
              <el-icon class="nav-icon"><Plus /></el-icon>
              <span class="nav-text">发布</span>
            </div>
          </el-menu-item>
          
          <el-menu-item index="/messages" class="nav-menu-item">
            <div class="nav-item-content">
              <el-icon class="nav-icon"><ChatDotRound /></el-icon>
              <span class="nav-text">消息</span>
            </div>
          </el-menu-item>
          
          <el-menu-item index="/profile" class="nav-menu-item">
            <div class="nav-item-content">
              <el-icon class="nav-icon"><User /></el-icon>
              <span class="nav-text">我</span>
            </div>
          </el-menu-item>
        </el-menu>
      </div>
      
      <!-- 用户信息 -->
      <div class="p-6 border-t border-gray-100 user-info-section" v-if="userStore.userInfo">
        <el-dropdown @command="handleUserCommand" trigger="click">
          <div class="user-dropdown-trigger">
            <el-avatar :src="userStore.userInfo.avatarUrl" :size="44" class="user-avatar">
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
                <el-icon class="mr-2"><User /></el-icon>
                个人主页
              </el-dropdown-item>
              <el-dropdown-item command="settings">
                <el-icon class="mr-2"><Setting /></el-icon>
                设置
              </el-dropdown-item>
              <el-dropdown-item command="logout" divided>
                <el-icon class="mr-2" style="color: #f56565;"><SwitchButton /></el-icon>
                <span style="color: #f56565;">退出登录</span>
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>
  </el-aside>

  <!-- 移动端底部导航栏 -->
  <div class="mobile-nav">
    <div class="bg-white border-t border-gray-200 shadow-lg">
      <div class="mobile-nav-menu-custom">
        <router-link 
          v-for="item in navItems" 
          :key="item.path"
          :to="item.path"
          class="mobile-nav-item-custom"
          :class="{ 'active': $route.path === item.path }"
        >
          <div class="flex flex-col items-center py-2">
            <component :is="item.icon" class="text-lg mb-1" />
            <span class="text-xs">{{ item.label }}</span>
          </div>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { 
  House, 
  TrendCharts, 
  Plus, 
  ChatDotRound,
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

// 定义导航项
const navItems = [
  { path: '/', icon: House, label: '首页' },
  { path: '/hot', icon: TrendCharts, label: '热门' },
  { path: '/publish', icon: Plus, label: '发布' },
  { path: '/messages', icon: ChatDotRound, label: '消息' },
  { path: '/profile', icon: User, label: '我' }
]

// 处理用户下拉菜单命令
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

// 处理退出登录
const handleLogout = async () => {
  try {
    // 显示确认对话框
    await ElMessageBox.confirm(
      '确定要退出登录吗？',
      '退出确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    
    // 执行退出登录
    userStore.logout()
    ElMessage.success('已退出登录')
    
    // 跳转到登录页
    router.push('/login')
  } catch (error) {
    // 用户取消退出
    console.log('用户取消退出登录')
  }
}
</script>

<style scoped>
/* 桌面端导航栏 - 使用媒体查询确保精确控制 */
.desktop-nav {
  display: none;
}

@media (min-width: 768px) {
  .desktop-nav {
    display: block !important;
  }
  .mobile-nav {
    display: none !important;
  }
}

/* 桌面端导航样式美化 */
.nav-menu-container {
  padding: 0 !important;
}

.nav-menu-item {
  margin-bottom: 12px !important;
  border-radius: 12px !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
  padding: 0 !important;
  height: auto !important;
  min-height: 48px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  position: relative !important;
  overflow: hidden !important;
}

.nav-item-content {
  display: flex !important;
  align-items: center !important;
  justify-content: flex-start !important;
  width: 100% !important;
  padding: 12px 16px !important;
  border-radius: 12px !important;
  transition: all 0.3s ease !important;
}

.nav-icon {
  margin-right: 12px !important;
  font-size: 20px !important;
  color: inherit !important;
  transition: all 0.3s ease !important;
}

.nav-text {
  font-size: 15px !important;
  font-weight: 500 !important;
  color: inherit !important;
  transition: all 0.3s ease !important;
}

.nav-menu-item:hover .nav-item-content {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%) !important;
  transform: translateX(4px) !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
}

.nav-menu-item:hover .nav-icon {
  color: #9333ea !important;
  transform: scale(1.1) !important;
}

.nav-menu-item:hover .nav-text {
  color: #9333ea !important;
}

.nav-menu-item.is-active .nav-item-content {
  background: linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%) !important;
  border: 1px solid #e9d5ff !important;
  box-shadow: 0 4px 16px rgba(147, 51, 234, 0.2) !important;
}

.nav-menu-item.is-active .nav-icon {
  color: #9333ea !important;
  transform: scale(1.1) !important;
}

.nav-menu-item.is-active .nav-text {
  color: #9333ea !important;
  font-weight: 600 !important;
}

/* 用户信息区域美化 */
.user-info-section {
  background: linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%) !important;
}

.user-dropdown-trigger {
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  cursor: pointer !important;
  padding: 12px !important;
  border-radius: 16px !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
  background: white !important;
  border: 1px solid #e5e7eb !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06) !important;
}

.user-dropdown-trigger:hover {
  background: linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%) !important;
  border-color: #d8b4fe !important;
  box-shadow: 0 4px 16px rgba(147, 51, 234, 0.15) !important;
  transform: translateY(-2px) !important;
}

.user-avatar {
  margin-right: 12px !important;
  border: 2px solid #e5e7eb !important;
  transition: all 0.3s ease !important;
}

.user-dropdown-trigger:hover .user-avatar {
  border-color: #9333ea !important;
  box-shadow: 0 0 0 3px rgba(147, 51, 234, 0.1) !important;
}

.user-info {
  flex: 1 !important;
  min-width: 0 !important;
  text-align: left !important;
}

.user-name {
  font-size: 14px !important;
  font-weight: 600 !important;
  color: #1f2937 !important;
  margin: 0 !important;
  margin-bottom: 2px !important;
  line-height: 1.4 !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
  white-space: nowrap !important;
}

.user-handle {
  font-size: 12px !important;
  color: #6b7280 !important;
  margin: 0 !important;
  line-height: 1.3 !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
  white-space: nowrap !important;
}

.dropdown-arrow {
  color: #9ca3af !important;
  margin-left: 8px !important;
  font-size: 14px !important;
  transition: all 0.3s ease !important;
}

.user-dropdown-trigger:hover .dropdown-arrow {
  color: #9333ea !important;
  transform: rotate(180deg) !important;
}

/* 移动端底部导航栏 */
.mobile-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  padding-bottom: env(safe-area-inset-bottom);
}

@media (max-width: 767px) {
  .mobile-nav {
    display: block !important;
  }
  .desktop-nav {
    display: none !important;
  }
}

/* 移动端导航栏 */
.mobile-nav {
  display: flex;
  justify-content: space-around;
  padding: 0;
  min-height: 60px;
  background-color: #ffffff !important;
  width: 100%; /* 确保占满宽度 */
  overflow-x: visible; /* 改为visible，避免内容被隐藏 */
}

.mobile-nav-menu {
  display: flex;
  justify-content: space-around;
  padding: 0;
  min-height: 60px;
  background-color: #ffffff !important;
  width: 100%;
}

.mobile-nav-item {
  flex: 1;
  display: flex !important;
  justify-content: center;
  align-items: center;
  min-height: 60px;
  margin: 0;
  border-radius: 0;
  transition: all 0.3s ease;
  background-color: #ffffff !important;
  min-width: 60px; /* 设置最小宽度 */
}

/* 移动端菜单项样式覆盖 */
:deep(.mobile-nav-menu .el-menu-item) {
  min-height: 60px !important;
  height: auto !important;
  line-height: normal !important;
  margin-bottom: 0 !important;
  border-radius: 0 !important;
  flex: 1 !important;
  display: flex !important;
  justify-content: center !important;
  align-items: center !important;
  padding: 8px 4px !important; /* 增加内边距 */
  background-color: #ffffff !important;
  min-width: 60px !important; /* 设置最小宽度 */
  white-space: nowrap !important; /* 防止文字换行 */
  color: #6b7280 !important; /* 确保文字颜色 */
}

/* 确保图标和文字显示 */
:deep(.mobile-nav-menu .el-menu-item .el-icon) {
  display: block !important;
  font-size: 18px !important;
  margin-bottom: 2px !important;
  color: inherit !important;
}

:deep(.mobile-nav-menu .el-menu-item span) {
  display: block !important;
  font-size: 10px !important;
  color: inherit !important;
  line-height: 1 !important;
}

:deep(.mobile-nav-menu .el-menu-item:hover) {
  background-color: #f9fafb !important;
  color: #6b7280 !important;
}

:deep(.mobile-nav-menu .el-menu-item.is-active) {
  background-color: #faf5ff !important;
  color: #9333ea !important;
}

:deep(.mobile-nav-menu .el-menu-item.is-active .el-icon) {
  color: #9333ea !important;
}

:deep(.mobile-nav-menu .el-menu-item.is-active span) {
  color: #9333ea !important;
}

/* 移动端自定义导航样式 */
.mobile-nav-menu-custom {
  display: flex;
  justify-content: space-around;
  align-items: center;
  min-height: 60px;
  background-color: #ffffff;
  width: 100%;
}

.mobile-nav-item-custom {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60px;
  text-decoration: none;
  color: #6b7280;
  transition: all 0.3s ease;
  padding: 8px 4px;
}

.mobile-nav-item-custom:hover {
  background-color: #f9fafb;
  color: #6b7280;
}

.mobile-nav-item-custom.active {
  background-color: #faf5ff;
  color: #9333ea;
}

.mobile-nav-item-custom .text-lg {
  font-size: 18px;
  margin-bottom: 2px;
}

.mobile-nav-item-custom .text-xs {
  font-size: 10px;
  line-height: 1;
}
/* Logo区域美化样式 */
.logo-section {
  background: linear-gradient(135deg, #fafafa 0%, #ffffff 50%, #f8fafc 100%) !important;
  border-bottom: 1px solid #e2e8f0 !important;
  position: relative !important;
  overflow: hidden !important;
}

.logo-section::before {
  content: '' !important;
  position: absolute !important;
  top: 0 !important;
  left: -100% !important;
  width: 100% !important;
  height: 100% !important;
  background: linear-gradient(90deg, transparent, rgba(147, 51, 234, 0.1), transparent) !important;
  animation: logoShimmer 3s infinite !important;
}

.logo-container {
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  position: relative !important;
  z-index: 2 !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

.logo-container:hover {
  transform: translateY(-2px) !important;
}

.logo-icon-wrapper {
  position: relative !important;
  margin-right: 16px !important;
}

.logo-icon {
  width: 48px !important;
  height: 48px !important;
  background: linear-gradient(135deg, #9333ea 0%, #7c3aed 50%, #6d28d9 100%) !important;
  border-radius: 16px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  position: relative !important;
  overflow: hidden !important;
  box-shadow: 0 8px 32px rgba(147, 51, 234, 0.3), 0 4px 16px rgba(147, 51, 234, 0.2) !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
  border: 2px solid rgba(255, 255, 255, 0.2) !important;
}

.logo-icon:hover {
  transform: scale(1.05) rotate(5deg) !important;
  box-shadow: 0 12px 40px rgba(147, 51, 234, 0.4), 0 6px 20px rgba(147, 51, 234, 0.3) !important;
}

.logo-icon::before {
  content: '' !important;
  position: absolute !important;
  top: -50% !important;
  left: -50% !important;
  width: 200% !important;
  height: 200% !important;
  background: conic-gradient(from 0deg, transparent, rgba(255, 255, 255, 0.3), transparent) !important;
  animation: logoRotate 4s linear infinite !important;
}

.logo-text {
  font-size: 24px !important;
  font-weight: 800 !important;
  color: white !important;
  position: relative !important;
  z-index: 2 !important;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3) !important;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif !important;
}

.logo-shine {
  position: absolute !important;
  top: 8px !important;
  left: 8px !important;
  width: 12px !important;
  height: 12px !important;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.8) 0%, transparent 70%) !important;
  border-radius: 50% !important;
  animation: logoGlow 2s ease-in-out infinite alternate !important;
}

.brand-text-wrapper {
  display: flex !important;
  flex-direction: column !important;
  align-items: flex-start !important;
}

.brand-text {
  font-size: 24px !important;
  font-weight: 700 !important;
  color: #1f2937 !important;
  letter-spacing: -0.5px !important;
  line-height: 1.2 !important;
  background: linear-gradient(135deg, #1f2937 0%, #4b5563 50%, #6b7280 100%) !important;
  -webkit-background-clip: text !important;
  -webkit-text-fill-color: transparent !important;
  background-clip: text !important;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif !important;
  transition: all 0.3s ease !important;
}

.logo-container:hover .brand-text {
  background: linear-gradient(135deg, #9333ea 0%, #7c3aed 50%, #6d28d9 100%) !important;
  -webkit-background-clip: text !important;
  -webkit-text-fill-color: transparent !important;
  background-clip: text !important;
}

.brand-subtitle {
  font-size: 11px !important;
  color: #9ca3af !important;
  font-weight: 500 !important;
  margin-top: 2px !important;
  letter-spacing: 0.5px !important;
  opacity: 0.8 !important;
  transition: all 0.3s ease !important;
}

.logo-container:hover .brand-subtitle {
  color: #9333ea !important;
  opacity: 1 !important;
}

/* 动画定义 */
@keyframes logoShimmer {
  0% {
    left: -100% !important;
  }
  100% {
    left: 100% !important;
  }
}

@keyframes logoRotate {
  0% {
    transform: rotate(0deg) !important;
  }
  100% {
    transform: rotate(360deg) !important;
  }
}

@keyframes logoGlow {
  0% {
    opacity: 0.6 !important;
    transform: scale(1) !important;
  }
  100% {
    opacity: 1 !important;
    transform: scale(1.2) !important;
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .logo-icon {
    width: 40px !important;
    height: 40px !important;
  }
  
  .logo-text {
    font-size: 20px !important;
  }
  
  .brand-text {
    font-size: 20px !important;
  }
  
  .brand-subtitle {
    font-size: 10px !important;
  }
}
</style>