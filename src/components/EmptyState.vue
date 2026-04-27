<template>
  <div class="empty-state-wrapper">
    <div class="empty-state">
      <div class="empty-icon-wrapper">
        <el-icon class="empty-icon">
          <component :is="icon" />
        </el-icon>
      </div>
      <h3 class="empty-title">{{ title }}</h3>
      <p class="empty-description">{{ description }}</p>
      <el-button
        v-if="showButton"
        type="primary"
        size="large"
        class="action-btn"
        @click="$emit('button-click')"
      >
        <el-icon class="btn-icon">
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
.empty-state-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  padding: 40px 20px;
}

.empty-state {
  text-align: center;
  animation: fadeInUp 0.6s ease;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.empty-icon-wrapper {
  width: 88px;
  height: 88px;
  margin: 0 auto 20px;
  background: linear-gradient(135deg, #F3F0F5 0%, #E8E0ED 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 16px rgba(155, 138, 160, 0.1);
}

.empty-icon {
  font-size: 40px;
  color: #B4A5BE;
}

.empty-title {
  font-size: 18px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 8px;
}

.empty-description {
  font-size: 14px;
  color: #9CA3AF;
  margin-bottom: 24px;
}

.action-btn {
  padding: 12px 28px;
  border-radius: 20px;
  background: linear-gradient(135deg, #9B8AA0 0%, #B4A5BE 100%);
  border: none;
  font-size: 14px;
  font-weight: 500;
  box-shadow: 0 4px 12px rgba(155, 138, 160, 0.25);
  transition: all 0.2s ease;
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(155, 138, 160, 0.35);
}

.btn-icon {
  margin-right: 6px;
}
</style>
