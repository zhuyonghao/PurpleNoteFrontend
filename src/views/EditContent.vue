<template>
  <MainLayout>
    <!-- 顶部导航 -->
    <PageHeader @back="handleBack">
      <template #actions>
        <el-button 
          type="primary" 
          :loading="saving"
          :disabled="loading"
          @click="handleSave"
          :size="isMobile ? 'small' : 'default'"
        >
          保存
        </el-button>
      </template>
    </PageHeader>

    <!-- 加载状态 -->
    <div v-if="loading" class="flex justify-center items-center py-20">
      <el-icon class="is-loading mr-2" size="24"><Loading /></el-icon>
      <span class="text-gray-500">加载中...</span>
    </div>

    <!-- 编辑表单 -->
    <div v-else class="edit-container">
      <el-form 
        ref="formRef"
        :model="formData"
        :rules="rules"
        :label-width="labelWidth"
        class="edit-form"
      >
        <!-- 媒体预览 -->
        <el-form-item label="媒体文件">
          <div v-if="formData.mediaUrl" class="mb-4">
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
                <el-button :size="isMobile ? 'small' : 'default'" type="primary" plain class="action-btn">
                  <el-icon class="mr-1"><Upload /></el-icon>
                  更换文件
                </el-button>
              </el-upload>
              <el-button 
                type="danger" 
                plain 
                :size="isMobile ? 'small' : 'default'"
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
            class="w-full"
          >
            <div class="upload-area">
              <el-icon :size="isMobile ? 36 : 48" class="text-gray-400 mb-4"><Plus /></el-icon>
              <p class="text-gray-500 upload-text">点击上传图片或视频</p>
              <p class="text-xs text-gray-400 mt-2 upload-desc">支持 JPG、PNG、MP4 格式，文件大小不超过 10MB</p>
            </div>
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
          />
        </el-form-item>

        <!-- 内容 -->
        <el-form-item label="内容" prop="text">
          <el-input 
            v-model="formData.text"
            type="textarea"
            placeholder="分享你的生活..."
            :rows="textareaRows"
            maxlength="1000"
            show-word-limit
            resize="vertical"
          />
        </el-form-item>
      </el-form>
    </div>
    
    <!-- 移动端底部安全区域 -->
    <div class="mobile-safe-area"></div>
  </MainLayout>
</template>

<script setup>
import MainLayout from '@/layouts/MainLayout.vue'
import PageHeader from '@/components/PageHeader.vue'
import { ref, reactive, onMounted, computed, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Upload, Delete, Loading } from '@element-plus/icons-vue'
import { getContent, updateContent, uploadMedia } from '@/api/content'

const route = useRoute()
const router = useRouter()
const formRef = ref()
const saving = ref(false)
const loading = ref(true)
const windowWidth = ref(window.innerWidth)

// 响应式计算属性
const isMobile = computed(() => windowWidth.value < 768)
const labelWidth = computed(() => isMobile.value ? '60px' : '80px')
const textareaRows = computed(() => isMobile.value ? 4 : 6)

// 监听窗口大小变化
const handleResize = () => {
  windowWidth.value = window.innerWidth
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
  const contentId = route.params.id
  if (contentId) {
    console.log('页面加载，准备获取内容ID:', contentId)
    fetchContent()
  } else {
    console.error('未找到内容ID参数')
    ElMessage.error('缺少内容ID参数')
    router.back()
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

// 表单数据
const formData = reactive({
  id: null,
  title: '',
  text: '',
  mediaUrl: ''
})

// 原始数据，用于检测是否有修改
const originalData = reactive({})

// 表单验证规则
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

// 获取内容详情进行数据回显
const fetchContent = async () => {
  try {
    loading.value = true
    console.log('正在获取内容详情，ID:', route.params.id)
    
    const response = await getContent(route.params.id)
    console.log('获取到的内容数据:', response)
    
    // 修改这里：response 已经是处理后的数据，不需要再访问 .data
    if (response && response.id) {
      const contentData = response
      
      // 数据回显到表单
      Object.assign(formData, {
        id: contentData.id,
        title: contentData.title || '',
        text: contentData.text || '',
        mediaUrl: contentData.mediaUrl || ''
      })
      
      // 保存原始数据用于检测修改
      Object.assign(originalData, {
        id: contentData.id,
        title: contentData.title || '',
        text: contentData.text || '',
        mediaUrl: contentData.mediaUrl || ''
      })
      
      console.log('数据回显完成:', formData)
      ElMessage.success('内容加载成功')
    } else {
      throw new Error('未获取到有效的内容数据')
    }
  } catch (error) {
    console.error('获取内容失败:', error)
    ElMessage.error('获取内容失败，请检查内容是否存在')
    // 获取失败时返回上一页
    router.back()
  } finally {
    loading.value = false
  }
}

// 检查是否有修改
const hasChanges = () => {
  return Object.keys(formData).some(key => {
    if (key === 'id') return false // 忽略ID字段
    return formData[key] !== originalData[key]
  })
}

// 返回处理
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

// 保存处理
const handleSave = async () => {
  try {
    // 表单验证
    await formRef.value.validate()
    
    if (!hasChanges()) {
      ElMessage.info('没有修改内容')
      return
    }
    
    saving.value = true
    console.log('正在保存内容:', formData)
    
    // 构建更新数据
    const updateData = {
      id: formData.id,
      title: formData.title,
      text: formData.text,
      mediaUrl: formData.mediaUrl
    }
    
    const response = await updateContent(updateData)
    console.log('保存响应:', response)
    
    ElMessage.success('保存成功')
    
    // 更新原始数据
    Object.assign(originalData, formData)
    
    // 返回上一页
    router.back()
  } catch (error) {
    console.error('保存失败:', error)
    if (error.response && error.response.data && error.response.data.message) {
      ElMessage.error(`保存失败：${error.response.data.message}`)
    } else {
      ElMessage.error('保存失败，请重试')
    }
  } finally {
    saving.value = false
  }
}

// 媒体上传前验证
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

// 处理媒体上传
const handleMediaUpload = async ({ file }) => {
  try {
    console.log('正在上传文件:', file.name)
    const response = await uploadMedia(file)
    console.log('上传响应:', response)
    
    // 处理响应数据，清理格式
    if (response) {
      let mediaUrl = ''
      
      if (typeof response === 'string') {
        // 如果直接返回字符串
        mediaUrl = response.trim().replace(/`/g, '')
      } else if (response.url) {
        // 如果是对象且有url字段
        mediaUrl = response.url.trim().replace(/`/g, '')
      } else if (response.mediaUrl) {
        // 如果是对象且有mediaUrl字段
        mediaUrl = response.mediaUrl.trim().replace(/`/g, '')
      } else {
        // 其他情况，尝试直接使用response
        mediaUrl = String(response).trim().replace(/`/g, '')
      }
      
      console.log('处理后的URL:', mediaUrl)
      
      if (mediaUrl && (mediaUrl.startsWith('http://') || mediaUrl.startsWith('https://'))) {
        formData.mediaUrl = mediaUrl
        ElMessage.success('上传成功')
        console.log('新媒体URL:', mediaUrl)
      } else {
        console.error('URL格式不正确:', mediaUrl)
        throw new Error(`获取到的URL格式不正确: ${mediaUrl}`)
      }
    } else {
      throw new Error('上传响应数据无效')
    }
  } catch (error) {
    console.error('上传失败:', error)
    if (error.response && error.response.data && error.response.data.message) {
      ElMessage.error(`上传失败：${error.response.data.message}`)
    } else {
      ElMessage.error('上传失败，请重试')
    }
  }
}

// 移除媒体
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

// 页面挂载时获取内容数据
onMounted(() => {
  const contentId = route.params.id
  if (contentId) {
    console.log('页面加载，准备获取内容ID:', contentId)
    fetchContent()
  } else {
    console.error('未找到内容ID参数')
    ElMessage.error('缺少内容ID参数')
    router.back()
  }
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 基础容器样式 */
.edit-container {
  max-width: 672px; /* 2xl */
  margin: 0 auto;
  padding: 1.5rem 1rem;
}

.edit-form {
  background-color: white;
  border-radius: 0.5rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
}

.media-preview {
  width: 100%;
  max-width: 28rem;
  height: 12rem;
  object-fit: cover;
  border-radius: 0.5rem;
  border: 1px solid #e5e7eb;
}

.media-actions {
  margin-top: 0.5rem;
  display: flex;
  gap: 0.5rem;
}

.upload-area {
  border: 2px dashed #d1d5db;
  border-radius: 0.5rem;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: border-color 0.3s ease;
}

.upload-area:hover {
  border-color: #a855f7;
}

.upload-text {
  color: #6b7280;
}

.upload-desc {
  color: #9ca3af;
  margin-top: 0.5rem;
}

.action-btn {
  min-height: 36px;
}

.mobile-safe-area {
  height: 0;
}

/* 移动端适配 */
@media (max-width: 767px) {
  .edit-container {
    max-width: none;
    padding: 1rem 0.75rem;
    margin-bottom: 80px; /* 为底部导航栏留出空间 */
  }
  
  .edit-form {
    padding: 1rem;
    border-radius: 0.5rem;
    margin: 0;
  }
  
  .media-preview {
    max-width: none;
    height: 10rem;
  }
  
  .media-actions {
    flex-direction: column;
    gap: 0.75rem;
  }
  
  .action-btn {
    width: 100%;
    justify-content: center;
    min-height: 44px; /* 增加触摸目标大小 */
  }
  
  .upload-area {
    padding: 1.5rem 1rem;
    min-height: 120px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
  
  .upload-text {
    font-size: 0.875rem;
  }
  
  .upload-desc {
    font-size: 0.75rem;
    padding: 0 0.5rem;
    text-align: center;
  }
  
  .mobile-safe-area {
    height: env(safe-area-inset-bottom, 20px);
  }
  
  /* 表单项样式调整 */
  :deep(.el-form-item) {
    margin-bottom: 1.5rem;
  }
  
  :deep(.el-form-item__label) {
    font-size: 0.875rem;
    font-weight: 500;
    line-height: 1.5;
    padding-right: 8px;
  }
  
  :deep(.el-input__wrapper) {
    min-height: 44px;
    font-size: 16px; /* 防止iOS缩放 */
  }
  
  :deep(.el-textarea__inner) {
    font-size: 16px; /* 防止iOS缩放 */
    line-height: 1.5;
    min-height: 120px;
  }
  
  /* 按钮样式 */
  :deep(.el-button) {
    min-height: 44px;
    font-size: 0.875rem;
  }
  
  /* 字数统计样式 */
  :deep(.el-input__count) {
    font-size: 0.75rem;
  }
}

/* 平板适配 */
@media (min-width: 768px) and (max-width: 1023px) {
  .edit-container {
    padding: 1.5rem;
  }
  
  .edit-form {
    padding: 1.5rem;
  }
}

/* 桌面端保持原样 */
@media (min-width: 1024px) {
  .edit-container {
    padding: 1.5rem 1rem;
  }
  
  .edit-form {
    padding: 1.5rem;
  }
  
  .media-actions {
    flex-direction: row;
  }
  
  .upload-area {
    padding: 2rem;
  }
}

/* 确保在所有设备上都有良好的触摸体验 */
.action-btn,
:deep(.el-button) {
  transition: all 0.2s ease;
}

.action-btn:active,
:deep(.el-button:active) {
  transform: scale(0.98);
}

/* 优化滚动体验 */
.edit-container {
  scroll-behavior: smooth;
}

/* 处理横屏模式 */
@media (max-height: 500px) and (orientation: landscape) {
  .edit-container {
    padding-top: 0.5rem;
    padding-bottom: 0.5rem;
  }
  
  .edit-form {
    padding: 0.75rem;
  }
  
  :deep(.el-form-item) {
    margin-bottom: 1rem;
  }
}
</style>