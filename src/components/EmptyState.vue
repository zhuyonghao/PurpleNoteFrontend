<template>
  <div class="text-center py-20">
    <div class="empty-state">
      <div class="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full flex items-center justify-center">
        <el-icon class="text-4xl text-purple-400">
          <component :is="icon" />
        </el-icon>
      </div>
      <h3 class="text-xl font-semibold text-gray-700 mb-2">{{ title }}</h3>
      <p class="text-gray-500 mb-6">{{ description }}</p>
      <el-button 
        v-if="showButton"
        type="primary" 
        size="large"
        class="publish-btn"
        @click="$emit('button-click')"
      >
        <el-icon class="mr-2">
          <component :is="buttonIcon" />
        </el-icon>
        {{ buttonText }}
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { Document, Plus } from '@element-plus/icons-vue'

const props = defineProps({
  icon: {
    type: [String, Object],
    default: () => Document
  },
  title: {
    type: String,
    default: '还没有内容'
  },
  description: {
    type: String,
    default: '暂无相关内容'
  },
  showButton: {
    type: Boolean,
    default: false
  },
  buttonText: {
    type: String,
    default: '立即操作'
  },
  buttonIcon: {
    type: [String, Object],
    default: () => Plus
  }
})

const emit = defineEmits(['button-click'])
</script>

<style scoped>
.empty-state {
  animation: fadeIn 0.8s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.publish-btn {
  background: linear-gradient(45deg, #a855f7, #ec4899);
  border: none;
  border-radius: 12px;
  padding: 12px 24px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.publish-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(168, 85, 247, 0.3);
}
</style>