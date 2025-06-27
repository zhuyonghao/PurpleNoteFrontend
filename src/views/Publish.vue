<template>
  <div class="min-h-screen bg-gray-50">
    <!-- 顶部导航 -->
    <header class="bg-white shadow-sm sticky top-0 z-50">
      <div class="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        <el-button @click="$router.back()" type="text" class="text-gray-600">
          <el-icon class="mr-1"><Close /></el-icon>
          取消
        </el-button>
        
        <el-button 
          type="primary" 
          @click="handlePublish"
          :loading="publishing"
          :disabled="!canPublish"
          class="px-6"
        >
          发布
        </el-button>
      </div>
    </header>

    <!-- 发布表单 -->
    <div class="max-w-4xl mx-auto p-4">
      <div class="bg-white rounded-xl shadow-sm overflow-hidden">
        <!-- 图片上传区域 -->
        <div class="p-6 border-b border-gray-100">
          <el-upload
            class="upload-demo w-full"
            drag
            :action="uploadUrl"
            :headers="uploadHeaders"
            :on-success="handleUploadSuccess"
            :on-error="handleUploadError"
            :before-upload="beforeUpload"
            :show-file-list="false"
            accept="image/*"
            name="media"
          >
            <div v-if="!publishForm.imageUrl" class="upload-placeholder py-12">
              <el-icon class="text-6xl text-gray-300 mb-4"><Camera /></el-icon>
              <div class="text-lg text-gray-600 mb-2">
                添加图片/视频
              </div>
              <div class="text-sm text-gray-400">
                (最多9张)
              </div>
              <div class="text-xs text-gray-400 mt-2">
                支持 jpg/png 文件，且不超过 10MB
              </div>
            </div>
            <div v-else class="uploaded-image relative">
              <img :src="publishForm.imageUrl" alt="预览图" class="w-full max-h-96 object-cover rounded-lg" />
              <div class="absolute top-2 right-2">
                <el-button @click.stop="removeImage" icon="Delete" circle size="small" type="danger" />
              </div>
            </div>
          </el-upload>
        </div>
        
        <!-- 内容编辑区域 -->
        <div class="p-6">
          <el-form :model="publishForm" :rules="rules" ref="publishFormRef" label-position="top">
            <!-- 标题 -->
            <el-form-item prop="title">
              <el-input
                v-model="publishForm.title"
                placeholder="标题输入框..."
                maxlength="50"
                show-word-limit
                size="large"
                class="title-input"
              />
            </el-form-item>
            
            <!-- 内容描述 -->
            <el-form-item prop="content">
              <el-input
                v-model="publishForm.content"
                type="textarea"
                placeholder="📝 分享你的生活..."
                :rows="6"
                maxlength="500"
                show-word-limit
                resize="none"
              />
            </el-form-item>
            
            <!-- 移除标签输入区域 -->
          </el-form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { createContent } from '@/api/content'
import { UploadFilled, Delete, ArrowLeft } from '@element-plus/icons-vue'

const router = useRouter()
const userStore = useUserStore()

const publishFormRef = ref()
const publishing = ref(false)
const newTag = ref('')

// 移除标签相关的响应式数据
const publishForm = reactive({
  title: '',
  content: '',
  imageUrl: ''
  // 移除 tags: []
})

// 移除标签相关的方法
// 删除 addTag, removeTag 方法
// 删除 newTag 变量

// 修改发布方法，移除标签数据
const handlePublish = async () => {
  try {
    const valid = await publishFormRef.value.validate()
    if (!valid) return
    
    publishing.value = true
    
    const data = {
      title: publishForm.title,
      text: publishForm.content,
      mediaUrl: publishForm.imageUrl
      // 移除 tags 字段
    }
    
    console.log('发布数据:', data)
    await createContent(data)
    ElMessage.success('发布成功')
    router.push('/home')
  } catch (error) {
    console.error('发布失败:', error)
    ElMessage.error('发布失败')
  } finally {
    publishing.value = false
  }
}
const rules = {
  title: [
    { required: true, message: '请输入标题', trigger: 'blur' },
    { min: 1, max: 50, message: '标题长度在 1 到 50 个字符', trigger: 'blur' }
  ],
  content: [
    { required: true, message: '请输入内容描述', trigger: 'blur' },
    { min: 1, max: 500, message: '内容长度在 1 到 500 个字符', trigger: 'blur' }
  ],
  imageUrl: [
    { required: true, message: '请上传图片', trigger: 'change' }
  ]
}

const uploadUrl = computed(() => {
  return '/api/contents/upload/media'
})

const uploadHeaders = computed(() => {
  return {
    'Authorization': `${userStore.token}`
  }
})

const canPublish = computed(() => {
  return publishForm.title && publishForm.content && publishForm.imageUrl
})

const beforeUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt10M = file.size / 1024 / 1024 < 10
  
  if (!isImage) {
    ElMessage.error('只能上传图片文件!')
    return false
  }
  if (!isLt10M) {
    ElMessage.error('上传图片大小不能超过 10MB!')
    return false
  }
  return true
}

const handleUploadSuccess = (response) => {
  console.log('上传响应:', response)
  
  if (response.code === 200) {
    // 处理data字段，去除可能的反引号和空格
    let imageUrl = response.data
    if (typeof imageUrl === 'string') {
      imageUrl = imageUrl.replace(/`/g, '').trim()
    }
    
    console.log('解析后的图片URL:', imageUrl)
    publishForm.imageUrl = imageUrl
    ElMessage.success('图片上传成功')
  } else {
    console.error('上传失败:', response)
    ElMessage.error(response.message || '图片上传失败')
  }
}

const handleUploadError = () => {
  ElMessage.error('图片上传失败')
}

const removeImage = () => {
  publishForm.imageUrl = ''
}

const addTag = () => {
  const tag = newTag.value.trim()
  if (tag && !publishForm.tags.includes(tag) && publishForm.tags.length < 5) {
    publishForm.tags.push(tag)
    newTag.value = ''
  } else if (publishForm.tags.length >= 5) {
    ElMessage.warning('最多只能添加5个标签')
  }
}

const removeTag = (tag) => {
  const index = publishForm.tags.indexOf(tag)
  if (index > -1) {
    publishForm.tags.splice(index, 1)
  }
}
</script>

<style scoped>
.title-input :deep(.el-input__inner) {
  font-size: 18px;
  font-weight: 600;
}

.upload-placeholder {
  text-align: center;
}

.uploaded-image {
  position: relative;
}
</style>