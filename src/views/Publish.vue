<template>
  <div class="min-h-screen bg-gray-50">
    <!-- 顶部导航 -->
    <header class="bg-white shadow-sm sticky top-0 z-50">
      <div class="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        <div class="flex items-center">
          <el-button @click="$router.back()" icon="ArrowLeft" circle class="mr-4" />
          <h1 class="text-lg font-medium">发布内容</h1>
        </div>
        
        <el-button 
          type="primary" 
          @click="handlePublish"
          :loading="publishing"
          :disabled="!canPublish"
        >
          发布
        </el-button>
      </div>
    </header>

    <!-- 发布表单 -->
    <div class="max-w-4xl mx-auto p-4">
      <div class="bg-white rounded-xl shadow-sm p-6">
        <el-form :model="publishForm" :rules="rules" ref="publishFormRef" label-position="top">
          <!-- 图片上传 -->
          <el-form-item label="上传图片" prop="imageUrl">
            <el-upload
              class="upload-demo"
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
              <div v-if="!publishForm.imageUrl" class="upload-placeholder">
                <el-icon class="el-icon--upload"><upload-filled /></el-icon>
                <div class="el-upload__text">
                  将图片拖到此处，或<em>点击上传</em>
                </div>
                <div class="el-upload__tip">
                  支持 jpg/png 文件，且不超过 10MB
                </div>
              </div>
              <div v-else class="uploaded-image">
                <img :src="publishForm.imageUrl" alt="预览图" class="w-full h-64 object-cover rounded-lg" />
                <div class="upload-overlay">
                  <el-button @click.stop="removeImage" icon="Delete" circle />
                </div>
              </div>
            </el-upload>
          </el-form-item>
          
          <!-- 标题 -->
          <el-form-item label="标题" prop="title">
            <el-input
              v-model="publishForm.title"
              placeholder="请输入标题"
              maxlength="50"
              show-word-limit
            />
          </el-form-item>
          
          <!-- 内容 -->
          <el-form-item label="内容描述" prop="content">
            <el-input
              v-model="publishForm.content"
              type="textarea"
              placeholder="分享你的想法..."
              :rows="6"
              maxlength="500"
              show-word-limit
            />
          </el-form-item>
          
          <!-- 标签 -->
          <el-form-item label="标签">
            <div class="flex flex-wrap gap-2 mb-2">
              <el-tag
                v-for="tag in publishForm.tags"
                :key="tag"
                closable
                @close="removeTag(tag)"
              >
                {{ tag }}
              </el-tag>
            </div>
            <el-input
              v-model="newTag"
              placeholder="添加标签"
              @keyup.enter="addTag"
              class="w-32"
            >
              <template #append>
                <el-button @click="addTag" icon="Plus" />
              </template>
            </el-input>
          </el-form-item>
        </el-form>
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
import { UploadFilled, Delete, Plus, ArrowLeft } from '@element-plus/icons-vue'

const router = useRouter()
const userStore = useUserStore()

const publishFormRef = ref()
const publishing = ref(false)
const newTag = ref('')

const publishForm = reactive({
  title: '',
  content: '',
  imageUrl: '',
  tags: []
})

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
  if (response.code === 200) {
    publishForm.imageUrl = response.data.url
    ElMessage.success('图片上传成功')
  } else {
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

const handlePublish = async () => {
  try {
    const valid = await publishFormRef.value.validate()
    if (!valid) return
    
    publishing.value = true
    
    const data = {
      title: publishForm.title,
      text: publishForm.content,  // 改为 text 字段
      mediaUrl: publishForm.imageUrl,  // 改为 mediaUrl 字段
      tags: publishForm.tags.join(',')
    }
    
    await createContent(data)  // 改为 createContent
    ElMessage.success('发布成功')
    router.push('/home')
  } catch (error) {
    ElMessage.error('发布失败')
    console.error('发布失败:', error)
  } finally {
    publishing.value = false
  }
}
</script>

<style scoped>
.upload-demo {
  width: 100%;
}

.upload-placeholder {
  padding: 40px;
  text-align: center;
}

.uploaded-image {
  position: relative;
  width: 100%;
}

.upload-overlay {
  position: absolute;
  top: 8px;
  right: 8px;
  opacity: 0;
  transition: opacity 0.3s;
}

.uploaded-image:hover .upload-overlay {
  opacity: 1;
}
</style>