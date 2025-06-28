<template>
  <div class="bg-white" style="background-color: white !important;">
    <div class="max-w-6xl mx-auto px-4 py-6" style="max-width: 72rem !important; margin-left: auto !important; margin-right: auto !important; padding-left: 1rem !important; padding-right: 1rem !important; padding-top: 1.5rem !important; padding-bottom: 1.5rem !important;">
      <!-- 头像和基本信息 -->
      <div class="text-center mb-6" style="text-align: center !important; margin-bottom: 1.5rem !important;">
        <el-avatar :src="userProfile.avatarUrl" :size="80" class="mb-4 border-4 border-white shadow-lg" style="margin-bottom: 1rem !important; border-width: 4px !important; border-color: white !important; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;">
          <el-icon size="40"><User /></el-icon>
        </el-avatar>
        <h1 class="text-xl font-bold text-gray-800 mb-2" style="font-size: 1.25rem !important; font-weight: 700 !important; color: #1f2937 !important; margin-bottom: 0.5rem !important;">{{ userProfile.nickname || userProfile.username }}</h1>
        <p class="text-gray-600 text-sm mb-4" v-if="userProfile.bio" style="color: #4b5563 !important; font-size: 0.875rem !important; margin-bottom: 1rem !important;">{{ userProfile.bio }}</p>
      </div>
      
      <!-- 统计信息 -->
      <!-- 统计信息 - 极端强制水平版本 -->
      <div class="flex justify-center mb-6" style="display: flex !important; justify-content: center !important; margin-bottom: 1.5rem !important;">
        <div class="flex space-x-8 min-w-max" style="display: flex !important; flex-direction: row !important; gap: 2rem !important; min-width: max-content !important;">
          <div class="text-center" style="text-align: center !important; flex-shrink: 0 !important; min-width: 60px !important;">
            <div class="text-xl font-bold text-gray-800" style="font-size: 1.25rem !important; font-weight: 700 !important; color: #1f2937 !important; white-space: nowrap !important;">{{ userProfile.contentCount || 0 }}</div>
            <div class="text-sm text-gray-500" style="font-size: 0.875rem !important; color: #6b7280 !important; white-space: nowrap !important;">笔记</div>
          </div>
          <div class="text-center cursor-pointer" style="text-align: center !important; cursor: pointer !important; flex-shrink: 0 !important; min-width: 60px !important;" @click="$emit('showFollowing')">
            <div class="text-xl font-bold text-gray-800" style="font-size: 1.25rem !important; font-weight: 700 !important; color: #1f2937 !important; white-space: nowrap !important;">{{ userProfile.followingCount || 0 }}</div>
            <div class="text-sm text-gray-500" style="font-size: 0.875rem !important; color: #6b7280 !important; white-space: nowrap !important;">关注</div>
          </div>
          <div class="text-center cursor-pointer" style="text-align: center !important; cursor: pointer !important; flex-shrink: 0 !important; min-width: 60px !important;" @click="$emit('showFollowers')">
            <div class="text-xl font-bold text-gray-800" style="font-size: 1.25rem !important; font-weight: 700 !important; color: #1f2937 !important; white-space: nowrap !important;">{{ userProfile.followerCount || 0 }}</div>
            <div class="text-sm text-gray-500" style="font-size: 0.875rem !important; color: #6b7280 !important; white-space: nowrap !important;">粉丝</div>
          </div>
        </div>
      </div>
      
      <!-- 操作按钮 -->
      <div class="flex justify-center space-x-3 mb-6" v-if="!isOwnProfile" style="display: flex !important; justify-content: center !important; gap: 0.75rem !important; margin-bottom: 1.5rem !important;">
        <el-button 
          :type="userProfile.isFollowed ? 'default' : 'primary'"
          class="flex-1 max-w-24"
          style="flex: 1 1 0% !important; max-width: 6rem !important;"
          @click="$emit('follow')"
        >
          {{ userProfile.isFollowed ? '已关注' : '关注' }}
        </el-button>
        <el-button class="flex-1 max-w-24" style="flex: 1 1 0% !important; max-width: 6rem !important;" @click="$emit('message')">私信</el-button>
      </div>
      
      <div class="flex justify-center space-x-3 mb-6" v-else style="display: flex !important; justify-content: center !important; gap: 0.75rem !important; margin-bottom: 1.5rem !important;">
        <el-button class="flex-1 max-w-32" style="flex: 1 1 0% !important; max-width: 8rem !important;" @click="$emit('editProfile')">编辑资料</el-button>
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