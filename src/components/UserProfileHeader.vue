<template>
  <div class="bg-white">
    <div class="max-w-6xl mx-auto px-4 py-6">
      <!-- 头像和基本信息 -->
      <div class="text-center mb-6">
        <el-avatar :src="userProfile.avatarUrl" :size="80" class="mb-4 border-4 border-white shadow-lg">
          <el-icon size="40"><User /></el-icon>
        </el-avatar>
        <h1 class="text-xl font-bold text-gray-800 mb-2">{{ userProfile.nickname || userProfile.username }}</h1>
        <p class="text-gray-600 text-sm mb-4" v-if="userProfile.bio">{{ userProfile.bio }}</p>
      </div>
      
      <!-- 统计信息 -->
      <div class="flex justify-center space-x-8 mb-6">
        <div class="text-center">
          <div class="text-xl font-bold text-gray-800">{{ userProfile.contentCount || 0 }}</div>
          <div class="text-sm text-gray-500">笔记</div>
        </div>
        <div class="text-center cursor-pointer" @click="$emit('showFollowing')">
          <div class="text-xl font-bold text-gray-800">{{ userProfile.followingCount || 0 }}</div>
          <div class="text-sm text-gray-500">关注</div>
        </div>
        <div class="text-center cursor-pointer" @click="$emit('showFollowers')">
          <div class="text-xl font-bold text-gray-800">{{ userProfile.followerCount || 0 }}</div>
          <div class="text-sm text-gray-500">粉丝</div>
        </div>
      </div>
      
      <!-- 操作按钮 -->
      <div class="flex justify-center space-x-3 mb-6" v-if="!isOwnProfile">
        <el-button 
          :type="userProfile.isFollowed ? 'default' : 'primary'"
          class="flex-1 max-w-24"
          @click="$emit('follow')"
        >
          {{ userProfile.isFollowed ? '已关注' : '关注' }}
        </el-button>
        <el-button class="flex-1 max-w-24" @click="$emit('message')">私信</el-button>
      </div>
      
      <div class="flex justify-center space-x-3 mb-6" v-else>
        <el-button class="flex-1 max-w-32" @click="$emit('editProfile')">编辑资料</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { User } from '@element-plus/icons-vue'

defineProps({
  userProfile: {
    type: Object,
    required: true
  },
  isOwnProfile: {
    type: Boolean,
    default: false
  }
})

defineEmits(['showFollowing', 'showFollowers', 'follow', 'message', 'editProfile'])
</script>