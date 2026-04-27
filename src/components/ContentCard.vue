<template>
  <div class="content-card hover-lift">
    <!-- 内容图片 -->
    <div class="image-wrapper" @click="$emit('click', content)">
      <img
        :src="content.mediaUrl || '/placeholder.jpg'"
        :alt="content.title"
        class="content-image"
        loading="lazy"
      />
      <!-- 悬停叠加层 -->
      <div class="image-overlay">
        <span class="view-text">查看详情</span>
      </div>
    </div>

    <!-- 标题和描述 -->
    <div class="card-content">
      <h3 class="card-title line-clamp-2" @click="$emit('click', content)">
        {{ content.title }}
      </h3>

      <!-- 作者信息 -->
      <div class="author-info" @click="handleAuthorClick">
        <el-avatar :src="content.userAvatarUrl" :size="24">
          <el-icon><User /></el-icon>
        </el-avatar>
        <span class="author-name">{{ content.userName }}</span>
      </div>

      <!-- 标签 -->
      <div class="tags-wrapper" v-if="content.tags && content.tags.length > 0">
        <span
          v-for="tag in content.tags.slice(0, 2)"
          :key="tag"
          class="tag"
        >
          #{{ tag }}
        </span>
      </div>

      <!-- 互动按钮 -->
      <div class="action-bar">
        <!-- 点赞 -->
        <div
          class="action-item"
          :class="{ 'is-liked': content.isLiked }"
          @click.stop="$emit('like', content)"
        >
          <el-icon size="14">
            <StarFilled v-if="content.isLiked" />
            <Star v-else />
          </el-icon>
          <span class="action-count">{{ content.likeCount || 0 }}</span>
        </div>

        <!-- 评论 -->
        <div class="action-item">
          <el-icon size="14"><ChatDotRound /></el-icon>
          <span class="action-count">{{ commentCount }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { getContentCommentCount } from '@/api/comment'
import {
  StarFilled,
  Star,
  User,
  ChatDotRound
} from '@element-plus/icons-vue'

const router = useRouter()
const userStore = useUserStore()

const props = defineProps({
  content: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['click', 'like'])

const commentCount = ref(props.content.commentCount || 0)

// 异步加载评论数
const loadCommentCount = async () => {
  try {
    const response = await getContentCommentCount(props.content.id)
    if (response && typeof response === 'object') {
      if (response.data !== undefined) {
        commentCount.value = response.data
      } else if (response.count !== undefined) {
        commentCount.value = response.count
      } else {
        commentCount.value = response
      }
    } else if (typeof response === 'number') {
      commentCount.value = response
    }
  } catch (error) {
    console.warn(`获取内容${props.content.id}评论数失败:`, error)
  }
}

loadCommentCount()

// 处理作者点击
const handleAuthorClick = () => {
  const userId = props.content.userId
  if (!userId) return

  if (userId === userStore.userInfo?.id) {
    router.push('/profile')
  } else {
    router.push(`/profile/${userId}`)
  }
}
</script>

<style scoped>
.content-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(155, 138, 160, 0.06);
  transition: all 0.2s ease;
  border: 1px solid #F0EEF5;
}

.content-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(155, 138, 160, 0.12);
  border-color: #E8E0ED;
}

/* 图片容器 */
.image-wrapper {
  position: relative;
  height: 200px;
  overflow: hidden;
  cursor: pointer;
}

.content-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 0;
  transition: transform 0.3s ease;
}

.content-card:hover .content-image {
  transform: scale(1.03);
}

/* 悬停叠加层 */
.image-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to bottom,
    rgba(155, 138, 160, 0) 0%,
    rgba(155, 138, 160, 0.4) 100%
  );
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.content-card:hover .image-overlay {
  opacity: 1;
}

.view-text {
  color: white;
  font-size: 14px;
  font-weight: 500;
  padding: 6px 16px;
  background: rgba(155, 138, 160, 0.8);
  border-radius: 20px;
  backdrop-filter: blur(4px);
}

/* 卡片内容 */
.card-content {
  padding: 14px;
}

/* 标题 */
.card-title {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 10px;
  line-height: 1.4;
  cursor: pointer;
  transition: color 0.2s ease;
}

.card-title:hover {
  color: #9B8AA0;
}

/* 作者信息 */
.author-info {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
  cursor: pointer;
  padding: 4px 0;
  border-radius: 8px;
  transition: background 0.2s ease;
}

.author-info:hover {
  background: #F8F7FA;
}

.author-name {
  font-size: 12px;
  color: #6B7280;
}

/* 标签 */
.tags-wrapper {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 12px;
}

.tag {
  font-size: 11px;
  color: #9B8AA0;
  background: #F3F0F5;
  padding: 3px 10px;
  border-radius: 12px;
  transition: all 0.2s ease;
}

.tag:hover {
  background: #E8E0ED;
  color: #7A6A7D;
}

/* 操作栏 */
.action-bar {
  display: flex;
  align-items: center;
  gap: 16px;
  padding-top: 10px;
  border-top: 1px solid #F5F3F7;
}

.action-item {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #9CA3AF;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  padding: 4px 8px;
  border-radius: 8px;
}

.action-item:hover {
  background: #F8F7FA;
  color: #6B7280;
}

.action-item.is-liked {
  color: #D4A5A5;
}

.action-item.is-liked:hover {
  color: #C49595;
}

.action-count {
  font-weight: 500;
}
</style>
