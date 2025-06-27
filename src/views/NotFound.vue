<template>
  <div class="min-h-screen bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center p-4">
    <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 text-center">
      <!-- 404图标 -->
      <div class="mb-8">
        <div class="text-8xl font-bold text-purple-500 mb-4">404</div>
        <div class="text-6xl mb-4">🔍</div>
      </div>
      
      <!-- 错误信息 -->
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-gray-800 mb-2">页面走丢了</h1>
        <p class="text-gray-600 mb-4">抱歉，您访问的页面不存在或已被移除</p>
        <p class="text-sm text-gray-500">请检查网址是否正确，或返回首页继续浏览</p>
      </div>
      
      <!-- 操作按钮 -->
      <div class="space-y-3">
        <el-button 
          type="primary" 
          size="large" 
          class="w-full"
          @click="goHome"
        >
          <el-icon class="mr-2"><House /></el-icon>
          返回首页
        </el-button>
        
        <el-button 
          size="large" 
          class="w-full"
          @click="goBack"
        >
          <el-icon class="mr-2"><ArrowLeft /></el-icon>
          返回上页
        </el-button>
      </div>
      
      <!-- 推荐链接 -->
      <div class="mt-8 pt-6 border-t border-gray-200">
        <p class="text-sm text-gray-500 mb-4">或者您可以访问：</p>
        <div class="flex justify-center space-x-4 text-sm">
          <router-link 
            to="/home" 
            class="text-purple-600 hover:text-purple-700 transition-colors"
          >
            🏠 首页
          </router-link>
          <router-link 
            to="/search" 
            class="text-purple-600 hover:text-purple-700 transition-colors"
          >
            🔍 搜索
          </router-link>
          <router-link 
            to="/publish" 
            class="text-purple-600 hover:text-purple-700 transition-colors"
          >
            ➕ 发布
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { House, ArrowLeft } from '@element-plus/icons-vue'

const router = useRouter()

// 返回首页
const goHome = () => {
  router.push('/home')
}

// 返回上一页
const goBack = () => {
  // 如果有历史记录则返回，否则跳转到首页
  if (window.history.length > 1) {
    router.go(-1)
  } else {
    router.push('/home')
  }
}
</script>

<style scoped>
/* 添加一些动画效果 */
.bg-white {
  animation: fadeInUp 0.6s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 悬停效果 */
.el-button:hover {
  transform: translateY(-2px);
  transition: all 0.3s ease;
}
</style>