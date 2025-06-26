<template>
  <div class="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer overflow-hidden">
    <!-- 内容图片 -->
    <div class="relative" @click="$emit('click', content)">
      <img 
        :src="content.imageUrl || '/placeholder.jpg'" 
        :alt="content.title"
        class="w-full h-auto object-cover"
        loading="lazy"
      />
      <div class="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 hover:opacity-100 transition-opacity" />
    </div>
    
    <!-- 内容信息 -->
    <div class="p-4">
      <h3 class="font-medium text-gray-800 mb-2 line-clamp-2" @click="$emit('click', content)">
        {{ content.title }}
      </h3>
      
      <!-- 用户信息 -->
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-2">
          <el-avatar :src="content.author?.avatarUrl" :size="24">
            <el-icon><User /></el-icon>
          </el-avatar>
          <span class="text-sm text-gray-600">{{ content.author?.username }}</span>
        </div>
        
        <!-- 点赞按钮 -->
        <div class="flex items-center space-x-1">
          <el-button
            :type="content.isLiked ? 'danger' : 'default'"
            :icon="content.isLiked ? 'HeartFilled' : 'Heart'"
            size="small"
            circle
            @click.stop="$emit('like', content)"
          />
          <span class="text-sm text-gray-500">{{ content.likeCount || 0 }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  content: {
    type: Object,
    required: true
  }
})

defineEmits(['click', 'like'])
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>