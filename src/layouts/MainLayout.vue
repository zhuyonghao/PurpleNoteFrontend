<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
    <el-container class="min-h-screen">
      <!-- 左侧导航栏 -->
      <NavigationBar />
      
      <!-- 右侧内容区域 -->
      <el-main class="p-0">
        <slot />
      </el-main>
    </el-container>
  </div>
</template>

<script setup>
import NavigationBar from '@/components/NavigationBar.vue'
</script>