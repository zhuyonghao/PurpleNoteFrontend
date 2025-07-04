<template>
  <div class="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer overflow-hidden">
    <!-- 内容图片 -->
    <div class="relative" @click="$emit('click', content)" style="display: flex !important; justify-content: center !important; align-items: center !important; height: 200px !important; overflow: hidden !important;">
      <img 
        :src="content.mediaUrl || '/placeholder.jpg'" 
        :alt="content.title"
        class="w-full h-full object-cover"
        loading="lazy"
        style="width: 100% !important; height: 100% !important; object-fit: cover !important;"
      />
    </div>
    
    <!-- 标题和描述 -->
    <div class="p-3" style="text-align: center !important;">
      <h3 class="font-medium text-gray-800 text-sm mb-2 line-clamp-2" @click="$emit('click', content)" style="text-align: center !important;">
        {{ content.title }}
      </h3>
      
      <!-- 作者信息 -->
      <div class="mb-2" style="display: flex !important; justify-content: center !important; align-items: center !important;">
        <div class="flex items-center space-x-2 cursor-pointer" @click="handleAuthorClick" style="display: flex !important; align-items: center !important; gap: 8px !important;">
          <el-avatar :src="content.userAvatarUrl" :size="20">
            <el-icon><User /></el-icon>
          </el-avatar>
          <span class="text-xs text-gray-500">{{ content.userName }}</span>
        </div>
      </div>
      
      <!-- 标签 -->
      <div class="mb-2" v-if="content.tags && content.tags.length > 0" style="display: flex !important; justify-content: center !important; flex-wrap: wrap !important; gap: 4px !important;">
        <span 
          v-for="tag in content.tags.slice(0, 2)" 
          :key="tag"
          class="text-xs text-primary-600 bg-primary-50 px-2 py-1 rounded"
        >
          #{{ tag }}
        </span>
      </div>
      
      <!-- 互动按钮 -->
      <div class="text-gray-500 text-xs" style="display: flex !important; justify-content: center !important; align-items: center !important;">
        <div style="display: flex !important; align-items: center !important; gap: 16px !important;">
          <!-- 点赞 -->
          <div style="display: flex !important; align-items: center !important; gap: 4px !important; cursor: pointer;" @click.stop="$emit('like', content)">
            <el-icon 
              :class="content.isLiked ? 'text-yellow-500' : 'text-gray-400'"
              size="14"
            >
              <StarFilled v-if="content.isLiked" />
              <Star v-else />
            </el-icon>
            <span>{{ content.likeCount || 0 }}</span>
          </div>
          
          <!-- 评论 -->
          <div style="display: flex !important; align-items: center !important; gap: 4px !important;">
            <el-icon size="14" class="text-gray-400"><ChatDotRound /></el-icon>
            <span>{{ commentCount }}</span>
          </div>
          
         
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { getContentCommentCount } from '@/api/comment'
import { 
  StarFilled,   // 实心星形，用于已点赞状态
  Star,         // 空心星形，用于未点赞状态
  User, 
  ChatDotRound, 
  Share,
  Collection    // 收藏图标
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

const showLikeAnimation = ref(false)
const commentCount = ref(props.content.commentCount || 0)

// 异步加载评论数
const loadCommentCount = async () => {
  try {
    const response = await getContentCommentCount(props.content.id)
    console.log(`内容${props.content.id}的评论数:`, response)
    
    // 更新评论数
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
    // 保持默认值
  }
}

// 组件挂载后异步加载评论数
onMounted(() => {
  loadCommentCount()
})

const handleDoubleTapLike = () => {
  showLikeAnimation.value = true
  setTimeout(() => {
    showLikeAnimation.value = false
  }, 1000)
  // 触发点赞事件
  emit('like', props.content)
}

// 处理作者头像点击事件
const handleAuthorClick = () => {
  // 添加调试信息
  console.log('Content data:', props.content)
  
  // 使用接口返回的userId进行跳转
  const userId = props.content.userId
  const userName = props.content.userName
  
  if (!userId) {
    console.warn('无法获取用户ID')
    return
  }
  
  // 如果是当前用户，跳转到个人主页
  if (userId === userStore.userInfo?.id) {
    router.push('/profile')
  } else {
    // 否则跳转到指定用户的主页
    router.push(`/profile/${userId}`)
  }
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-align: center !important;
}
</style>