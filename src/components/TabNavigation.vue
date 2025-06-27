<template>
  <div class="bg-white border-t border-gray-100">
    <div class="max-w-6xl mx-auto px-4">
      <div class="flex justify-center space-x-8 py-3">
        <div 
          v-for="tab in tabs"
          :key="tab.key"
          class="flex items-center space-x-1 py-2 px-4 cursor-pointer border-b-2"
          :class="activeTab === tab.key ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500'"
          @click="$emit('tabChange', tab.key)"
        >
          <el-icon><component :is="tab.icon" /></el-icon>
          <span class="text-sm font-medium">{{ tab.label }}</span>
        </div>
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
      { key: 'collections', label: '收藏', icon: Star }
    ]
  }
})

defineEmits(['tabChange'])
</script>