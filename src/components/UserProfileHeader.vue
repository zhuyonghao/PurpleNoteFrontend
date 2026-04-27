<template>
  <div class="profile-header">
    <!-- 头像区域 -->
    <div class="avatar-section">
      <div class="avatar-wrapper">
        <el-avatar :src="userProfile.avatarUrl" :size="88" class="user-avatar">
          <el-icon size="36"><User /></el-icon>
        </el-avatar>
        <div class="avatar-glow"></div>
      </div>

      <h1 class="user-name">{{ userProfile.nickname || userProfile.username }}</h1>
      <p class="user-bio" v-if="userProfile.bio">{{ userProfile.bio }}</p>
    </div>

    <!-- 统计信息 -->
    <div class="stats-section">
      <div class="stat-item">
        <span class="stat-number">{{ userProfile.contentCount || 0 }}</span>
        <span class="stat-label">笔记</span>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-item clickable" @click="$emit('showFollowing')">
        <span class="stat-number">{{ userProfile.followingCount || 0 }}</span>
        <span class="stat-label">关注</span>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-item clickable" @click="$emit('showFollowers')">
        <span class="stat-number">{{ userProfile.followerCount || 0 }}</span>
        <span class="stat-label">粉丝</span>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="actions-section" v-if="!isOwnProfile">
      <el-button
        :type="userProfile.isFollowed ? 'default' : 'primary'"
        :class="['action-btn', userProfile.isFollowed ? 'following-btn' : 'follow-btn']"
        @click="$emit('follow')"
      >
        {{ userProfile.isFollowed ? '已关注' : '关注' }}
      </el-button>
      <el-button class="action-btn message-btn" @click="$emit('message')">
        私信
      </el-button>
    </div>

    <div class="actions-section" v-else>
      <el-button class="action-btn edit-btn" @click="$emit('editProfile')">
        编辑资料
      </el-button>
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

<style scoped>
.profile-header {
  background: white;
  padding: 32px 24px 24px;
  border-bottom: 1px solid #F0EEF5;
}

/* 头像区域 */
.avatar-section {
  text-align: center;
  margin-bottom: 20px;
}

.avatar-wrapper {
  position: relative;
  display: inline-block;
  margin-bottom: 16px;
}

.user-avatar {
  position: relative;
  z-index: 1;
  border: 3px solid white;
  box-shadow: 0 4px 20px rgba(155, 138, 160, 0.15);
}

.avatar-glow {
  position: absolute;
  inset: -8px;
  background: linear-gradient(135deg, #E8E0ED 0%, #D4A5A5 100%);
  border-radius: 50%;
  filter: blur(16px);
  opacity: 0.4;
  z-index: 0;
}

.user-name {
  font-size: 20px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 6px;
}

.user-bio {
  font-size: 14px;
  color: #6B7280;
  max-width: 300px;
  margin: 0 auto;
  line-height: 1.5;
}

/* 统计区域 */
.stats-section {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0;
  margin-bottom: 20px;
  padding: 16px 0;
  background: #FAFAFA;
  border-radius: 12px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 28px;
}

.stat-item.clickable {
  cursor: pointer;
  transition: transform 0.2s ease;
}

.stat-item.clickable:hover {
  transform: scale(1.05);
}

.stat-number {
  font-size: 20px;
  font-weight: 600;
  color: #374151;
  line-height: 1.2;
}

.stat-label {
  font-size: 12px;
  color: #9CA3AF;
  margin-top: 2px;
}

.stat-divider {
  width: 1px;
  height: 32px;
  background: #E8E0ED;
}

/* 操作按钮 */
.actions-section {
  display: flex;
  justify-content: center;
  gap: 12px;
}

.action-btn {
  min-width: 100px;
  height: 38px;
  border-radius: 19px;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.follow-btn {
  background: linear-gradient(135deg, #9B8AA0 0%, #B4A5BE 100%);
  border: none;
  color: white;
  box-shadow: 0 2px 12px rgba(155, 138, 160, 0.25);
}

.follow-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(155, 138, 160, 0.35);
}

.following-btn {
  background: white;
  border: 1px solid #E8E0ED;
  color: #6B7280;
}

.following-btn:hover {
  border-color: #D4A5A5;
  color: #D4A5A5;
  background: #FDF9F9;
}

.message-btn {
  background: white;
  border: 1px solid #E8E0ED;
  color: #6B7280;
}

.message-btn:hover {
  border-color: #B4A5BE;
  color: #9B8AA0;
  background: #F8F7FA;
}

.edit-btn {
  background: white;
  border: 1px solid #E8E0ED;
  color: #6B7280;
  min-width: 120px;
}

.edit-btn:hover {
  border-color: #B4A5BE;
  color: #9B8AA0;
  background: #F8F7FA;
}
</style>
