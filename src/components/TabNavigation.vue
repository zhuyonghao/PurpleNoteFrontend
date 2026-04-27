<template>
  <div class="tab-navigation">
    <div class="tab-container">
      <div
        v-for="tab in tabs"
        :key="tab.key"
        class="tab-item"
        :class="{ 'is-active': activeTab === tab.key }"
        @click="$emit('tabChange', tab.key)"
      >
        <el-icon class="tab-icon"><component :is="tab.icon" /></el-icon>
        <span class="tab-label">{{ tab.label }}</span>
        <div class="tab-indicator" v-if="activeTab === tab.key"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Document, Promotion, Star } from '@element-plus/icons-vue'

defineProps({
  activeTab: {
    type: String,
    required: true
  },
  tabs: {
    type: Array,
    default: () => [
      { key: 'notes', label: '笔记', icon: Document },
      { key: 'likes', label: '点赞', icon: Promotion },
    ]
  }
})

defineEmits(['tabChange'])
</script>

<style scoped>
.tab-navigation {
  background: white;
  border-bottom: 1px solid #F0EEF5;
}

.tab-container {
  display: flex;
  justify-content: center;
  gap: 8px;
  padding: 0 16px;
}

.tab-item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 14px 20px;
  cursor: pointer;
  color: #9CA3AF;
  transition: all 0.2s ease;
}

.tab-item:hover {
  color: #6B7280;
}

.tab-item.is-active {
  color: #9B8AA0;
}

.tab-icon {
  font-size: 16px;
}

.tab-label {
  font-size: 14px;
  font-weight: 500;
}

.tab-indicator {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 32px;
  height: 2px;
  background: linear-gradient(90deg, #9B8AA0, #B4A5BE);
  border-radius: 1px;
  animation: slideIn 0.2s ease;
}

@keyframes slideIn {
  from {
    width: 0;
  }
  to {
    width: 32px;
  }
}
</style>
