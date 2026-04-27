<template>
  <PublishLayout>
    <!-- 顶部导航 -->
    <header class="publish-header">
      <el-button class="cancel-btn" @click="$router.back()">
        <el-icon class="mr-1"><ArrowLeft /></el-icon>
        取消
      </el-button>

      <el-button
        type="primary"
        @click="handlePublish"
        :loading="publishing"
        :disabled="!canPublish"
        class="publish-btn"
      >
        发布
      </el-button>
    </header>

    <!-- 发布表单 -->
    <div class="publish-container">
      <div class="publish-card">
        <!-- 图片上传区域 -->
        <div class="upload-section">
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
            <div v-if="!publishForm.imageUrl" class="upload-placeholder">
              <el-icon class="upload-icon"><UploadFilled /></el-icon>
              <div class="upload-title">添加图片/视频</div>
              <div class="upload-subtitle">(最多9张)</div>
              <div class="upload-hint">支持 jpg/png 文件，且不超过 10MB</div>
            </div>
            <div v-else class="uploaded-image">
              <img :src="publishForm.imageUrl" alt="预览图" />
              <div class="image-actions">
                <el-button @click.stop="removeImage" icon="Delete" circle size="small" type="danger" />
              </div>
            </div>
          </el-upload>
        </div>

        <!-- 内容编辑区域 -->
        <div class="form-section">
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
                placeholder="分享你的生活..."
                :rows="6"
                maxlength="500"
                show-word-limit
                resize="none"
                class="content-input"
              />
            </el-form-item>
          </el-form>
        </div>
      </div>
    </div>
  </PublishLayout>
</template>

<script setup>
import PublishLayout from '@/layouts/PublishLayout.vue'
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

const publishForm = reactive({
  title: '',
  content: '',
  imageUrl: ''
})

const handlePublish = async () => {
  try {
    const valid = await publishFormRef.value.validate()
    if (!valid) return

    publishing.value = true

    const data = {
      title: publishForm.title,
      text: publishForm.content,
      mediaUrl: publishForm.imageUrl
    }

    await createContent(data)
    ElMessage.success('发布成功')
    router.push('/home')
  } catch (error) {
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
  ]
}

const uploadUrl = computed(() => '/api/contents/upload/media')

const uploadHeaders = computed(() => ({
  'Authorization': `${userStore.token}`
}))

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
    let imageUrl = response.data
    if (typeof imageUrl === 'string') {
      imageUrl = imageUrl.replace(/`/g, '').trim()
    }
    publishForm.imageUrl = imageUrl
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
</script>

<style scoped>
.publish-header {
  background: white;
  border-bottom: 1px solid #F0EEF5;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  position: sticky;
  top: 0;
  z-index: 50;
}

.cancel-btn {
  color: #6B7280;
  border: none;
  background: transparent;
  padding: 8px 12px;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.cancel-btn:hover {
  background: #F8F7FA;
  color: #374151;
}

.publish-btn {
  padding: 8px 24px;
  border-radius: 20px;
  background: linear-gradient(135deg, #9B8AA0 0%, #B4A5BE 100%);
  border: none;
  font-weight: 500;
  box-shadow: 0 2px 8px rgba(155, 138, 160, 0.25);
  transition: all 0.2s ease;
}

.publish-btn:hover:not(.is-disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(155, 138, 160, 0.35);
}

.publish-btn.is-disabled {
  background: #D4D0DB;
  box-shadow: none;
}

/* 发布容器 */
.publish-container {
  padding: 20px 16px;
  background: linear-gradient(180deg, #FAFAFA 0%, #F5F5F5 100%);
  min-height: calc(100vh - 60px);
}

.publish-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 16px rgba(155, 138, 160, 0.08);
  border: 1px solid #F0EEF5;
}

/* 上传区域 */
.upload-section {
  padding: 24px;
  border-bottom: 1px solid #F0EEF5;
}

.upload-placeholder {
  text-align: center;
  padding: 40px 20px;
  border: 2px dashed #E8E0ED;
  border-radius: 12px;
  transition: all 0.2s ease;
}

.upload-placeholder:hover {
  border-color: #B4A5BE;
  background: #FAFAFA;
}

.upload-icon {
  font-size: 48px;
  color: #D4D0DB;
  margin-bottom: 12px;
}

.upload-title {
  font-size: 16px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 4px;
}

.upload-subtitle {
  font-size: 13px;
  color: #9CA3AF;
  margin-bottom: 8px;
}

.upload-hint {
  font-size: 12px;
  color: #B4A5BE;
}

.uploaded-image {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
}

.uploaded-image img {
  width: 100%;
  max-height: 300px;
  object-fit: cover;
  display: block;
}

.image-actions {
  position: absolute;
  top: 12px;
  right: 12px;
}

/* 表单区域 */
.form-section {
  padding: 24px;
}

.title-input :deep(.el-input__inner) {
  font-size: 18px;
  font-weight: 600;
  border: none;
  padding: 0;
}

.title-input :deep(.el-input__wrapper) {
  box-shadow: none !important;
  background: transparent;
}

.content-input :deep(.el-textarea__inner) {
  border: none;
  padding: 0;
  font-size: 15px;
  line-height: 1.7;
  color: #374151;
}

.content-input :deep(.el-textarea__wrapper) {
  box-shadow: none !important;
  background: transparent;
}

.content-input :deep(.el-input__count) {
  background: transparent;
  color: #B4A5BE;
}
</style>
