<template>
  <header class="bg-white shadow-sm sticky top-0 z-50">
    <div class="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
      <el-button @click="$emit('back')" icon="ArrowLeft" circle />
      
      <div class="flex items-center space-x-2">
        <slot name="actions"></slot>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ArrowLeft } from '@element-plus/icons-vue'

defineEmits(['back'])
</script>