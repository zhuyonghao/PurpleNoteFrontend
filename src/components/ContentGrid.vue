<template>
  <div class="content-grid">
    <!-- 瀑布流容器 -->
    <div ref="containerRef" class="waterfall-container">
      <div
        v-for="(item, index) in contentList"
        :key="item.id"
        class="waterfall-item"
        :style="{ animationDelay: `${index * 0.05}s` }"
        @click="handleContentClick(item)"
      >
        <!-- 操作菜单 -->
        <div v-if="showActions && isOwnContent(item)" class="item-actions">
          <el-dropdown @command="(command) => handleAction(command, item)" trigger="click">
            <el-button
              size="small"
              circle
              class="action-btn"
              @click.stop
            >
              <el-icon><MoreFilled /></el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="edit">
                  <el-icon><Edit /></el-icon>
                  编辑
                </el-dropdown-item>
                <el-dropdown-item command="delete" class="delete-item">
                  <el-icon><Delete /></el-icon>
                  删除
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>

        <!-- 内容图片 -->
        <div class="item-image">
          <img
            :src="item.mediaUrl || '/placeholder.jpg'"
            :alt="item.title"
            loading="lazy"
          />
          <div class="image-overlay">
            <span class="view-text">查看</span>
          </div>
        </div>

        <!-- 内容信息 -->
        <div class="item-content">
          <h3 class="item-title line-clamp-2">{{ item.title }}</h3>

          <!-- 作者信息 -->
          <div class="author-row" @click.stop="handleAuthorClick(item)">
            <el-avatar :src="item.userAvatarUrl" :size="18">
              <el-icon><User /></el-icon>
            </el-avatar>
            <span class="author-name">{{ item.userName }}</span>
          </div>

          <!-- 标签 -->
          <div class="tags-row" v-if="item.tags && item.tags.length > 0">
            <span v-for="tag in item.tags.slice(0, 2)" :key="tag" class="tag">
              #{{ tag }}
            </span>
          </div>

          <!-- 互动 -->
          <div class="互动-row">
            <div class="互动-item" @click.stop="handleLike(item)">
              <el-icon
                :class="item.isLiked ? 'is-liked' : ''"
                size="13"
              >
                <StarFilled v-if="item.isLiked" />
                <Star v-else />
              </el-icon>
              <span>{{ item.likeCount || 0 }}</span>
            </div>
            <div class="互动-item">
              <el-icon size="13"><ChatDotRound /></el-icon>
              <span>{{ item.commentCount || 0 }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 加载更多 -->
    <div v-if="loadingMore" class="loading-more">
      <el-icon class="is-loading mr-2"><Loading /></el-icon>
      <span>加载中...</span>
    </div>

    <!-- 底部提示 -->
    <div v-else-if="!hasMore && contentList.length > 0" class="no-more">
      <span>没有更多内容了</span>
    </div>

    <!-- 空状态 -->
    <div v-if="contentList.length === 0 && !loading" class="empty-state">
      <el-icon size="56" class="empty-icon"><Document /></el-icon>
      <p class="empty-text">{{ emptyText }}</p>
    </div>
  </div>
</template>

<script setup>
import {
  Promotion,
  Loading,
  Document,
  MoreFilled,
  Edit,
  Delete,
  StarFilled,
  Star,
  User,
  ChatDotRound
} from '@element-plus/icons-vue'
import { ElMessageBox } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { useRouter } from 'vue-router'
import { getContentCommentCount } from '@/api/comment'
import { ref, onMounted, onUnmounted, watch } from 'vue'

const userStore = useUserStore()
const router = useRouter()
const containerRef = ref(null)

const props = defineProps({
  contentList: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  loadingMore: {
    type: Boolean,
    default: false
  },
  hasMore: {
    type: Boolean,
    default: true
  },
  emptyText: {
    type: String,
    default: '暂无内容'
  },
  showActions: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['contentClick', 'editContent', 'deleteContent', 'likeContent', 'loadMore', 'updateCommentCount'])

const isOwnContent = (content) => {
  return content.userId === userStore.userInfo?.id || content.authorId === userStore.userInfo?.id
}

const handleContentClick = (item) => {
  emit('contentClick', item)
}

const handleAuthorClick = (item) => {
  const userId = item.userId
  if (!userId) return

  if (userId === userStore.userInfo?.id) {
    router.push('/profile')
  } else {
    router.push(`/profile/${userId}`)
  }
}

const handleLike = (item) => {
  emit('likeContent', item)
}

const handleAction = async (command, item) => {
  if (command === 'edit') {
    emit('editContent', item)
  } else if (command === 'delete') {
    try {
      await ElMessageBox.confirm(
        '确定要删除这条内容吗？删除后无法恢复。',
        '确认删除',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
      emit('deleteContent', item)
    } catch {
      // 用户取消
    }
  }
}

let isLoading = false
let lastTriggerTime = 0

const handleScroll = () => {
  if (!props.hasMore || isLoading || props.loadingMore) return

  const now = Date.now()
  if (now - lastTriggerTime < 1000) return

  const scrollTop = document.documentElement.scrollTop
  const scrollHeight = document.documentElement.scrollHeight
  const clientHeight = document.documentElement.clientHeight

  if (scrollTop + clientHeight >= scrollHeight - 200) {
    isLoading = true
    lastTriggerTime = now
    emit('loadMore')
    setTimeout(() => {
      isLoading = false
    }, 2000)
  }
}

const throttle = (func, delay) => {
  let timeoutId
  let lastExecTime = 0
  return function (...args) {
    const currentTime = Date.now()
    if (currentTime - lastExecTime > delay) {
      func.apply(this, args)
      lastExecTime = currentTime
    } else {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        func.apply(this, args)
        lastExecTime = Date.now()
      }, delay - (currentTime - lastExecTime))
    }
  }
}

const throttledScrollHandler = throttle(handleScroll, 300)

onMounted(() => {
  window.addEventListener('scroll', throttledScrollHandler, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', throttledScrollHandler)
  isLoading = false
  lastTriggerTime = 0
})

const loadCommentCountAsync = async (contents, startIndex = 0) => {
  for (let i = 0; i < contents.length; i++) {
    const content = contents[i]
    const contentIndex = startIndex + i

    try {
      const response = await getContentCommentCount(content.id)
      if (props.contentList[contentIndex]) {
        let commentCount = 0
        if (response && typeof response === 'object') {
          if (response.data !== undefined) {
            commentCount = response.data
          } else if (response.count !== undefined) {
            commentCount = response.count
          } else {
            commentCount = response
          }
        } else if (typeof response === 'number') {
          commentCount = response
        }
        emit('updateCommentCount', content.id, commentCount)
      }
    } catch (error) {
      console.warn(`获取内容${content.id}评论数失败:`, error)
    }

    await new Promise(resolve => setTimeout(resolve, 50))
  }
}

watch(() => props.contentList, (newList) => {
  if (newList && newList.length > 0) {
    loadCommentCountAsync(newList)
  }
}, { immediate: true })
</script>

<style scoped>
.content-grid {
  padding: 16px;
}

/* 瀑布流容器 */
.waterfall-container {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

/* 瀑布流项目 */
.waterfall-item {
  flex: 0 0 auto;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(155, 138, 160, 0.06);
  border: 1px solid #F0EEF5;
  transition: all 0.2s ease;
  opacity: 0;
  animation: fadeInUp 0.5s ease forwards;
  position: relative;
}

.waterfall-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(155, 138, 160, 0.12);
  border-color: #E8E0ED;
}

/* 操作按钮 */
.item-actions {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 10;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.waterfall-item:hover .item-actions {
  opacity: 1;
}

.action-btn {
  width: 28px;
  height: 28px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(4px);
  border: none;
  border-radius: 8px;
  color: #6B7280;
}

.action-btn:hover {
  background: white;
  color: #9B8AA0;
}

/* 删除项 */
.delete-item {
  color: #DC6855;
}

/* 图片 */
.item-image {
  position: relative;
  height: 180px;
  overflow: hidden;
}

.item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 0;
  transition: transform 0.3s ease;
}

.waterfall-item:hover .item-image img {
  transform: scale(1.05);
}

.image-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, rgba(155, 138, 160, 0), rgba(155, 138, 160, 0.3));
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.waterfall-item:hover .image-overlay {
  opacity: 1;
}

.view-text {
  color: white;
  font-size: 13px;
  font-weight: 500;
  padding: 5px 14px;
  background: rgba(155, 138, 160, 0.8);
  border-radius: 16px;
  backdrop-filter: blur(4px);
}

/* 内容信息 */
.item-content {
  padding: 12px;
}

.item-title {
  font-size: 13px;
  font-weight: 500;
  color: #374151;
  line-height: 1.4;
  margin-bottom: 8px;
}

.author-row {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
  cursor: pointer;
  padding: 2px 4px;
  border-radius: 6px;
  transition: background 0.2s ease;
}

.author-row:hover {
  background: #F8F7FA;
}

.author-name {
  font-size: 11px;
  color: #6B7280;
}

/* 标签 */
.tags-row {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 10px;
}

.tag {
  font-size: 10px;
  color: #9B8AA0;
  background: #F3F0F5;
  padding: 2px 8px;
  border-radius: 10px;
}

/* 互动按钮 */
.互动-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-top: 8px;
  border-top: 1px solid #F5F3F7;
}

.互动-item {
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 11px;
  color: #9CA3AF;
  cursor: pointer;
  padding: 3px 6px;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.互动-item:hover {
  background: #F8F7FA;
  color: #6B7280;
}

.互动-item.is-liked {
  color: #D4A5A5;
}

/* 加载更多 */
.loading-more,
.no-more {
  text-align: center;
  padding: 20px 0;
  color: #9CA3AF;
  font-size: 13px;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 60px 0;
}

.empty-icon {
  color: #D4D0DB;
  margin-bottom: 12px;
}

.empty-text {
  color: #9CA3AF;
  font-size: 14px;
}

/* 响应式 */
@media (max-width: 640px) {
  .waterfall-container {
    gap: 12px;
  }
  .waterfall-item {
    width: calc(50% - 6px);
  }
  .item-image {
    height: 140px;
  }
}

@media (min-width: 641px) and (max-width: 768px) {
  .waterfall-item {
    width: calc(33.333% - 10.66px);
  }
}

@media (min-width: 769px) and (max-width: 1024px) {
  .waterfall-item {
    width: calc(25% - 12px);
  }
}

@media (min-width: 1025px) {
  .waterfall-item {
    width: calc(20% - 12.8px);
  }
}

/* 动画 */
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
</style>
