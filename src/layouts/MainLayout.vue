<template>
  <div class="main-layout">
    <el-container>
      <!-- 左侧导航栏 -->
      <NavigationBar />

      <!-- 右侧内容区域 -->
      <el-main class="main-content">
        <slot />
      </el-main>
    </el-container>
  </div>
</template>

<script setup>
import NavigationBar from '@/components/NavigationBar.vue'
</script>

<style scoped>
.main-layout {
  min-height: 100vh;
  background: linear-gradient(180deg, #FAFAFA 0%, #F5F5F5 100%);
}

.main-content {
  padding: 0;
  overflow-x: hidden;
}
</style>
