<template>
  <div class="loading-wrapper">
    <div class="loading-container">
      <div class="loading-spinner">
        <el-icon class="is-loading">
          <Loading />
        </el-icon>
      </div>
      <p class="loading-message">{{ message }}</p>
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
.loading-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  padding: 40px 20px;
}

.loading-container {
  text-align: center;
}

.loading-spinner {
  width: 48px;
  height: 48px;
  margin: 0 auto 16px;
  background: linear-gradient(135deg, #F3F0F5 0%, #E8E0ED 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(155, 138, 160, 0.1);
}

.is-loading {
  font-size: 24px;
  color: #9B8AA0;
  animation: rotate 1.5s linear infinite;
}

@keyframes rotate {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.loading-message {
  font-size: 14px;
  color: #9CA3AF;
  font-weight: 500;
}
</style>
