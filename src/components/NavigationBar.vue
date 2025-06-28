<template>
  <!-- 桌面端左侧导航栏 -->
  <el-aside width="256px" class="desktop-nav">
    <div class="h-screen bg-white shadow-lg flex flex-col">
      <!-- Logo区域 -->
      <div class="p-6 border-b border-gray-100">
        <div class="flex items-center">
          <div class="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center mr-3">
            <span class="text-white font-bold text-sm">P</span>
          </div>
          <span class="text-xl font-bold text-gray-800">Purple Note</span>
        </div>
      </div>
      
      <!-- 导航菜单 -->
      <div class="flex-1 p-4">
        <el-menu
          :default-active="$route.path"
          class="border-none"
          router
          background-color="transparent"
          text-color="#374151"
          active-text-color="#9333ea"
        >
          <el-menu-item index="/" class="nav-menu-item">
            <el-icon class="mr-3"><House /></el-icon>
            <span>首页</span>
          </el-menu-item>
          
          <el-menu-item index="/hot" class="nav-menu-item">
            <el-icon class="mr-3"><TrendCharts /></el-icon>
            <span>热门</span>
          </el-menu-item>
          
          <el-menu-item index="/publish" class="nav-menu-item">
            <el-icon class="mr-3"><Plus /></el-icon>
            <span>发布</span>
          </el-menu-item>
          
          <el-menu-item index="/messages" class="nav-menu-item">
            <el-icon class="mr-3"><ChatDotRound /></el-icon>
            <span>消息</span>
          </el-menu-item>
          
          <el-menu-item index="/profile" class="nav-menu-item">
            <el-icon class="mr-3"><User /></el-icon>
            <span>我</span>
          </el-menu-item>
        </el-menu>
      </div>
      
      <!-- 用户信息 -->
      <div class="p-6 border-t border-gray-100" v-if="userStore.userInfo">
        <el-dropdown @command="handleUserCommand" trigger="click">
          <div class="flex items-center cursor-pointer hover:bg-gray-50 rounded-lg p-2 -m-2 transition-colors">
            <el-avatar :src="userStore.userInfo.avatarUrl" :size="40" class="mr-3">
              <el-icon><User /></el-icon>
            </el-avatar>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-900 truncate">
                {{ userStore.userInfo.nickname || userStore.userInfo.username }}
              </p>
              <p class="text-xs text-gray-500 truncate">
                @{{ userStore.userInfo.username }}
              </p>
            </div>
            <el-icon class="text-gray-400 ml-2"><ArrowDown /></el-icon>
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

/* 移动端导航栏 */
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

/* 桌面端导航样式 */
.nav-menu-item {
  margin-bottom: 8px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.nav-menu-item:hover {
  background-color: #f3f4f6 !important;
}

.nav-menu-item.is-active {
  background-color: #faf5ff !important;
  color: #9333ea !important;
}

/* 移动端底部导航样式 */
.mobile-nav-menu {
  display: flex;
  justify-content: space-around;
  padding: 0;
  min-height: 60px;
  background-color: #ffffff !important;
  width: 100%; /* 确保占满宽度 */
  overflow-x: visible; /* 改为visible，避免内容被隐藏 */
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
</style>