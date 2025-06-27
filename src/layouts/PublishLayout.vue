<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
    <el-container class="min-h-screen">
      <!-- 发布页面内容区域，不包含导航栏 -->
      <el-main class="p-0">
        <slot />
      </el-main>
    </el-container>
  </div>
</template>

<script setup>
// 发布页面专用布局，不包含导航栏
</script>

<style scoped>
/* 发布页面布局样式 */
.el-main {
  padding: 0;
}
</style>