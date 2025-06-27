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
          
          <el-menu-item index="/search" class="nav-menu-item">
            <el-icon class="mr-3"><Search /></el-icon>
            <span>搜索</span>
          </el-menu-item>
          
          <el-menu-item index="/publish" class="nav-menu-item">
            <el-icon class="mr-3"><Plus /></el-icon>
            <span>发布</span>
          </el-menu-item>
          
          <el-menu-item index="/profile" class="nav-menu-item">
            <el-icon class="mr-3"><User /></el-icon>
            <span>我的</span>
          </el-menu-item>
        </el-menu>
      </div>
      
      <!-- 用户信息 -->
      <div class="p-6 border-t border-gray-100" v-if="userStore.userInfo">
        <div class="flex items-center">
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
        </div>
      </div>
    </div>
  </el-aside>

  <!-- 移动端底部导航栏 -->
  <div class="mobile-nav">
    <div class="bg-white border-t border-gray-200 shadow-lg">
      <el-menu
        :default-active="$route.path"
        mode="horizontal"
        class="border-none mobile-nav-menu"
        router
        background-color="#ffffff"
        text-color="#6b7280"
        active-text-color="#9333ea"
      >
        <el-menu-item index="/" class="mobile-nav-item">
          <div class="flex flex-col items-center py-2">
            <el-icon class="text-lg mb-1"><House /></el-icon>
            <span class="text-xs">首页</span>
          </div>
        </el-menu-item>
        
        <el-menu-item index="/search" class="mobile-nav-item">
          <div class="flex flex-col items-center py-2">
            <el-icon class="text-lg mb-1"><Search /></el-icon>
            <span class="text-xs">搜索</span>
          </div>
        </el-menu-item>
        
        <el-menu-item index="/publish" class="mobile-nav-item">
          <div class="flex flex-col items-center py-2">
            <el-icon class="text-lg mb-1"><Plus /></el-icon>
            <span class="text-xs">发布</span>
          </div>
        </el-menu-item>
        
        <el-menu-item index="/profile" class="mobile-nav-item">
          <div class="flex flex-col items-center py-2">
            <el-icon class="text-lg mb-1"><User /></el-icon>
            <span class="text-xs">我的</span>
          </div>
        </el-menu-item>
      </el-menu>
    </div>
  </div>
</template>

<script setup>
import { 
  House, 
  Search, 
  Plus, 
  User 
} from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
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
}

.mobile-nav-item {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60px;
  margin: 0;
  border-radius: 0;
  transition: all 0.3s ease;
  background-color: #ffffff !important;
}

.mobile-nav-item:hover {
  background-color: #f9fafb !important;
}

.mobile-nav-item.is-active {
  background-color: #faf5ff !important;
  color: #9333ea !important;
}

/* 自定义Element Plus Menu样式 */
:deep(.el-menu-item) {
  height: 48px;
  line-height: 48px;
  margin-bottom: 8px;
  border-radius: 8px;
}

:deep(.el-menu-item:hover) {
  background-color: #f3f4f6;
}

:deep(.el-menu-item.is-active) {
  background-color: #faf5ff;
  color: #9333ea;
}

:deep(.el-menu-item.is-active::before) {
  display: none;
}

/* 移动端菜单项样式覆盖 */
:deep(.mobile-nav-menu .el-menu-item) {
  min-height: 60px;
  height: auto;
  line-height: normal;
  margin-bottom: 0;
  border-radius: 0;
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0;
  background-color: #ffffff !important;
}

:deep(.mobile-nav-menu .el-menu-item:hover) {
  background-color: #f9fafb !important;
}

:deep(.mobile-nav-menu .el-menu-item.is-active) {
  background-color: #faf5ff !important;
  color: #9333ea !important;
}
</style>