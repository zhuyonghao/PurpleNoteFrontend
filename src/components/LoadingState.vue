<template>
  <div class="text-center py-12">
    <div class="loading-container">
      <el-icon class="is-loading text-3xl text-purple-500 mb-3">
        <Loading />
      </el-icon>
      <p class="text-gray-600 font-medium">{{ message }}</p>
    </div>
  </div>
</template>

<script setup>
import { Loading } from '@element-plus/icons-vue'

const props = defineProps({
  message: {
    type: String,
    default: '加载中...'
  }
})
</script>

<style scoped>
.loading-container {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}
</style>