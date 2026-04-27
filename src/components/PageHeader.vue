<template>
  <header class="page-header">
    <div class="header-content">
      <el-button class="back-btn" icon="ArrowLeft" circle @click="$emit('back')" />

      <div class="header-actions">
        <slot name="actions"></slot>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ArrowLeft } from '@element-plus/icons-vue'

defineEmits(['back'])
</script>

<style scoped>
.page-header {
  background: white;
  border-bottom: 1px solid #F0EEF5;
  position: sticky;
  top: 0;
  z-index: 50;
}

.header-content {
  max-width: 72rem;
  margin: 0 auto;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.back-btn {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  border: 1px solid #E8E0ED;
  background: white;
  color: #9B8AA0;
  transition: all 0.2s ease;
}

.back-btn:hover {
  background: #F8F7FA;
  border-color: #B4A5BE;
  color: #9B8AA0;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>
