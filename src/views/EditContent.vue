<template>
  <MainLayout>
    <!-- 顶部导航 -->
    <PageHeader @back="handleBack">
      <template #actions>
        <el-button
          type="primary"
          :loading="saving"
          class="save-btn"
          @click="handleSave"
        >
          保存
        </el-button>
      </template>
    </PageHeader>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <el-icon class="is-loading loading-icon"><Loading /></el-icon>
      <span class="loading-text">加载中...</span>
    </div>

    <!-- 编辑表单 -->
    <div v-else class="edit-container">
      <el-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-width="80px"
        class="edit-form"
      >
        <!-- 媒体预览 -->
        <el-form-item label="媒体文件">
          <div v-if="formData.mediaUrl" class="media-preview-section">
            <img
              :src="formData.mediaUrl"
              alt="预览图"
              class="media-preview"
            />
            <div class="media-actions">
              <el-upload
                :show-file-list="false"
                :before-upload="beforeMediaUpload"
                :http-request="handleMediaUpload"
                accept="image/*,video/*"
              >
                <el-button type="primary" plain class="action-btn">
                  <el-icon class="mr-1"><Upload /></el-icon>
                  更换文件
                </el-button>
              </el-upload>
              <el-button
                type="danger"
                plain
                @click="removeMedia"
                class="action-btn"
              >
                <el-icon class="mr-1"><Delete /></el-icon>
                移除文件
              </el-button>
            </div>
          </div>

          <el-upload
            v-else
            :show-file-list="false"
            :before-upload="beforeMediaUpload"
            :http-request="handleMediaUpload"
            accept="image/*,video/*"
            class="upload-area"
          >
            <el-icon class="upload-icon"><Plus /></el-icon>
            <p class="upload-text">点击上传图片或视频</p>
            <p class="upload-hint">支持 JPG、PNG、MP4 格式，文件大小不超过 10MB</p>
          </el-upload>
        </el-form-item>

        <!-- 标题 -->
        <el-form-item label="标题" prop="title">
          <el-input
            v-model="formData.title"
            placeholder="请输入标题"
            maxlength="100"
            show-word-limit
            clearable
            class="title-input"
          />
        </el-form-item>

        <!-- 内容 -->
        <el-form-item label="内容" prop="text">
          <el-input
            v-model="formData.text"
            type="textarea"
            placeholder="分享你的生活..."
            :rows="6"
            maxlength="1000"
            show-word-limit
            resize="vertical"
            class="content-input"
          />
        </el-form-item>
      </el-form>
    </div>
  </MainLayout>
</template>

<script setup>
import MainLayout from '@/layouts/MainLayout.vue'
import PageHeader from '@/components/PageHeader.vue'
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Upload, Delete, Loading } from '@element-plus/icons-vue'
import { getContent, updateContent, uploadMedia } from '@/api/content'

const route = useRoute()
const router = useRouter()
const formRef = ref()
const saving = ref(false)
const loading = ref(true)

const formData = reactive({
  id: null,
  title: '',
  text: '',
  mediaUrl: ''
})

const originalData = reactive({})

const rules = {
  title: [
    { required: true, message: '请输入标题', trigger: 'blur' },
    { min: 1, max: 100, message: '标题长度在 1 到 100 个字符', trigger: 'blur' }
  ],
  text: [
    { required: true, message: '请输入内容', trigger: 'blur' },
    { min: 1, max: 1000, message: '内容长度在 1 到 1000 个字符', trigger: 'blur' }
  ]
}

const fetchContent = async () => {
  try {
    loading.value = true
    const response = await getContent(route.params.id)

    if (response && response.id) {
      Object.assign(formData, {
        id: response.id,
        title: response.title || '',
        text: response.text || '',
        mediaUrl: response.mediaUrl || ''
      })

      Object.assign(originalData, {
        id: response.id,
        title: response.title || '',
        text: response.text || '',
        mediaUrl: response.mediaUrl || ''
      })
    } else {
      throw new Error('未获取到有效的内容数据')
    }
  } catch (error) {
    ElMessage.error('获取内容失败，请检查内容是否存在')
    router.back()
  } finally {
    loading.value = false
  }
}

const hasChanges = () => {
  return Object.keys(formData).some(key => {
    if (key === 'id') return false
    return formData[key] !== originalData[key]
  })
}

const handleBack = async () => {
  if (hasChanges()) {
    try {
      await ElMessageBox.confirm(
        '您有未保存的修改，确定要离开吗？',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
      router.back()
    } catch {
      // 用户取消
    }
  } else {
    router.back()
  }
}

const handleSave = async () => {
  try {
    await formRef.value.validate()

    if (!hasChanges()) {
      ElMessage.info('没有修改内容')
      return
    }

    saving.value = true

    const updateData = {
      id: formData.id,
      title: formData.title,
      text: formData.text,
      mediaUrl: formData.mediaUrl
    }

    await updateContent(updateData)

    ElMessage.success('保存成功')
    Object.assign(originalData, formData)
    router.back()
  } catch (error) {
    ElMessage.error('保存失败，请重试')
  } finally {
    saving.value = false
  }
}

const beforeMediaUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  const isVideo = file.type.startsWith('video/')
  const isLt10M = file.size / 1024 / 1024 < 10

  if (!isImage && !isVideo) {
    ElMessage.error('只能上传图片或视频文件！')
    return false
  }
  if (!isLt10M) {
    ElMessage.error('文件大小不能超过 10MB！')
    return false
  }
  return true
}

const handleMediaUpload = async ({ file }) => {
  try {
    const response = await uploadMedia(file)

    if (response) {
      let mediaUrl = ''

      if (typeof response === 'string') {
        mediaUrl = response.trim().replace(/`/g, '')
      } else if (response.url) {
        mediaUrl = response.url.trim().replace(/`/g, '')
      } else if (response.mediaUrl) {
        mediaUrl = response.mediaUrl.trim().replace(/`/g, '')
      } else {
        mediaUrl = String(response).trim().replace(/`/g, '')
      }

      if (mediaUrl && (mediaUrl.startsWith('http://') || mediaUrl.startsWith('https://'))) {
        formData.mediaUrl = mediaUrl
        ElMessage.success('上传成功')
      } else {
        throw new Error(`获取到的URL格式不正确: ${mediaUrl}`)
      }
    } else {
      throw new Error('上传响应数据无效')
    }
  } catch (error) {
    ElMessage.error('上传失败，请重试')
  }
}

const removeMedia = () => {
  ElMessageBox.confirm(
    '确定要移除当前媒体文件吗？',
    '确认移除',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    formData.mediaUrl = ''
    ElMessage.success('已移除媒体文件')
  }).catch(() => {
    // 用户取消
  })
}

onMounted(() => {
  const contentId = route.params.id
  if (contentId) {
    fetchContent()
  } else {
    ElMessage.error('缺少内容ID参数')
    router.back()
  }
})
</script>

<style scoped>
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
}

.loading-icon {
  color: #B4A5BE;
  margin-bottom: 12px;
  font-size: 32px;
}

.loading-text {
  color: #9CA3AF;
  font-size: 14px;
}

.edit-container {
  padding: 24px 16px;
  max-width: 672px;
  margin: 0 auto;
}

.edit-form {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 16px rgba(155, 138, 160, 0.08);
  border: 1px solid #F0EEF5;
}

:deep(.el-form-item) {
  margin-bottom: 24px;
}

:deep(.el-form-item__label) {
  color: #374151;
  font-weight: 500;
}

/* 媒体预览 */
.media-preview-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.media-preview {
  width: 100%;
  max-width: 300px;
  height: 180px;
  object-fit: cover;
  border-radius: 12px;
  border: 1px solid #E8E0ED;
}

.media-actions {
  display: flex;
  gap: 12px;
}

/* 上传区域 */
.upload-area {
  width: 100%;
  border: 2px dashed #E8E0ED;
  border-radius: 12px;
  padding: 40px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.upload-area:hover {
  border-color: #B4A5BE;
  background: #FAFAFA;
}

.upload-icon {
  font-size: 40px;
  color: #D4D0DB;
  margin-bottom: 12px;
}

.upload-text {
  color: #374151;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 4px;
}

.upload-hint {
  color: #9CA3AF;
  font-size: 12px;
}

/* 输入框样式 */
:deep(.el-input__wrapper) {
  border-radius: 10px;
  box-shadow: 0 0 0 1px #E8E0ED inset;
  transition: all 0.2s ease;
}

:deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px #B4A5BE inset;
}

:deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #9B8AA0 inset !important;
}

:deep(.el-textarea__wrapper) {
  border-radius: 10px;
  box-shadow: 0 0 0 1px #E8E0ED inset;
  transition: all 0.2s ease;
}

:deep(.el-textarea__wrapper:hover) {
  box-shadow: 0 0 0 1px #B4A5BE inset;
}

:deep(.el-textarea__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #9B8AA0 inset !important;
}

/* 按钮样式 */
.action-btn {
  border-radius: 8px;
  border-color: #E8E0ED;
  color: #6B7280;
}

.action-btn:hover {
  border-color: #B4A5BE;
  color: #9B8AA0;
  background: #F8F7FA;
}

.save-btn {
  padding: 8px 24px;
  border-radius: 20px;
  background: linear-gradient(135deg, #9B8AA0 0%, #B4A5BE 100%);
  border: none;
  font-weight: 500;
  box-shadow: 0 2px 8px rgba(155, 138, 160, 0.25);
  transition: all 0.2s ease;
}

.save-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(155, 138, 160, 0.35);
}

/* 响应式 */
@media (max-width: 640px) {
  .edit-container {
    padding: 16px 12px;
  }

  .edit-form {
    padding: 16px;
  }

  .media-actions {
    flex-direction: column;
  }

  .action-btn {
    width: 100%;
  }
}
</style>
