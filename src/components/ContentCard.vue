<template>
  <div class="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer overflow-hidden">
    <!-- 内容图片 -->
    <div class="relative" @click="$emit('click', content)">
      <img 
        :src="content.mediaUrl || '/placeholder.jpg'" 
        :alt="content.title"
        class="w-full h-auto object-cover"
        loading="lazy"
      />
    </div>
    
    <!-- 标题和描述 -->
    <div class="p-3">
      <h3 class="font-medium text-gray-800 text-sm mb-2 line-clamp-2" @click="$emit('click', content)">
        {{ content.title }}
      </h3>
      
      <!-- 作者信息 -->
      <div class="flex items-center justify-between mb-2">
        <div class="flex items-center space-x-2 cursor-pointer" @click="handleAuthorClick">
          <el-avatar :src="content.userAvatarUrl" :size="20">
            <el-icon><User /></el-icon>
          </el-avatar>
          <span class="text-xs text-gray-500">{{ content.userName }}</span>
        </div>
      </div>
      
      <!-- 标签 -->
      <div class="flex flex-wrap gap-1 mb-2" v-if="content.tags && content.tags.length > 0">
        <span 
          v-for="tag in content.tags.slice(0, 2)" 
          :key="tag"
          class="text-xs text-primary-600 bg-primary-50 px-2 py-1 rounded"
        >
          #{{ tag }}
        </span>
      </div>
      
      <!-- 互动按钮 -->
      <div class="flex items-center justify-between text-gray-500">
        <div class="flex items-center space-x-4">
          <!-- 点赞 -->
          <div class="flex items-center space-x-1">
            <el-button
              :type="content.isLiked ? 'warning' : 'default'"
              size="small"
              circle
              @click.stop="$emit('like', content)"
              class="w-6 h-6"
            >
              <el-icon>
                <StarFilled v-if="content.isLiked" class="text-yellow-500" />
                <Star v-else />
              </el-icon>
            </el-button>
            <span class="text-xs">{{ content.likeCount || 0 }}</span>
          </div>
          
          <!-- 评论 -->
          <div class="flex items-center space-x-1">
            <el-icon size="14"><ChatDotRound /></el-icon>
            <span class="text-xs">{{ content.commentCount || 0 }}</span>
          </div>
        </div>
        
        <!-- 分享和收藏 -->
        <div class="flex items-center space-x-2">
          <el-icon size="14" class="cursor-pointer hover:text-primary-600"><Share /></el-icon>
          <el-icon size="14" class="cursor-pointer hover:text-primary-600"><Collection /></el-icon>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
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
}
</style>