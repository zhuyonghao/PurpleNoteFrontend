<template>
  <div class="bg-white border-t border-gray-100" style="background-color: white !important; border-top: 1px solid #f3f4f6 !important;">
    <div class="max-w-6xl mx-auto px-4" style="max-width: 72rem !important; margin-left: auto !important; margin-right: auto !important; padding-left: 1rem !important; padding-right: 1rem !important;">
      <div class="flex justify-center space-x-8 py-3" style="display: flex !important; justify-content: center !important; gap: 2rem !important; padding-top: 0.75rem !important; padding-bottom: 0.75rem !important;">
        <div 
          v-for="tab in tabs"
          :key="tab.key"
          class="flex items-center space-x-1 py-2 px-4 cursor-pointer border-b-2"
          :class="activeTab === tab.key ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500'"
          :style="{
            'display': 'flex !important',
            'align-items': 'center !important',
            'gap': '0.25rem !important',
            'padding-top': '0.5rem !important',
            'padding-bottom': '0.5rem !important',
            'padding-left': '1rem !important',
            'padding-right': '1rem !important',
            'cursor': 'pointer !important',
            'border-bottom-width': '2px !important',
            'border-bottom-color': activeTab === tab.key ? '#2563eb !important' : 'transparent !important',
            'color': activeTab === tab.key ? '#2563eb !important' : '#6b7280 !important'
          }"
          @click="$emit('tabChange', tab.key)"
        >
          <el-icon style="display: inline-flex !important;"><component :is="tab.icon" /></el-icon>
          <span class="text-sm font-medium" style="font-size: 0.875rem !important; font-weight: 500 !important; white-space: nowrap !important;">{{ tab.label }}</span>
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
    ]
  }
})

defineEmits(['tabChange'])
</script>