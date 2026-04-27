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

    <!-- 编辑表单 -->
    <div class="edit-container">
      <el-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-width="80px"
        class="edit-form"
      >
        <!-- 头像上传 -->
        <el-form-item label="头像">
          <div class="avatar-section">
            <el-avatar
              :src="formData.avatarUrl"
              :size="80"
              class="avatar"
            >
              <el-icon size="32"><User /></el-icon>
            </el-avatar>
            <div class="avatar-actions">
              <el-upload
                :show-file-list="false"
                :before-upload="beforeAvatarUpload"
                :http-request="handleAvatarUpload"
                accept="image/*"
              >
                <el-button class="upload-btn">
                  <el-icon class="upload-icon"><Upload /></el-icon>
                  更换头像
                </el-button>
              </el-upload>
              <p class="avatar-hint">支持 JPG、PNG 格式，文件大小不超过 2MB</p>
            </div>
          </div>
        </el-form-item>

        <!-- 用户名 -->
        <el-form-item label="用户名" prop="username">
          <el-input
            v-model="formData.username"
            placeholder="请输入用户名"
            maxlength="20"
            show-word-limit
            class="username-input"
          />
        </el-form-item>

        <!-- 个人简介 -->
        <el-form-item label="个人简介" prop="bio">
          <el-input
            v-model="formData.bio"
            type="textarea"
            placeholder="介绍一下自己吧..."
            :rows="4"
            maxlength="200"
            show-word-limit
            class="bio-input"
          />
        </el-form-item>
      </el-form>
    </div>
  </MainLayout>
</template>

<script setup>
import MainLayout from '@/layouts/MainLayout.vue'
import PageHeader from '@/components/PageHeader.vue'
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { User, Upload } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { updateUserProfile, uploadAvatar } from '@/api/user'

const router = useRouter()
const userStore = useUserStore()
const formRef = ref()
const saving = ref(false)

const formData = reactive({
  avatarUrl: '',
  username: '',
  bio: ''
})

const originalData = reactive({})

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 20, message: '用户名长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  bio: [
    { max: 200, message: '个人简介不能超过 200 个字符', trigger: 'blur' }
  ]
}

const initData = () => {
  if (userStore.userInfo) {
    Object.assign(formData, {
      avatarUrl: userStore.userInfo.avatarUrl || '',
      username: userStore.userInfo.username || '',
      bio: userStore.userInfo.bio || ''
    })
    Object.assign(originalData, formData)
  }
}

const hasChanges = () => {
  return Object.keys(formData).some(key => formData[key] !== originalData[key])
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

    saving.value = true

    const changedData = {}
    Object.keys(formData).forEach(key => {
      if (formData[key] !== originalData[key]) {
        changedData[key] = formData[key]
      }
    })

    if (Object.keys(changedData).length === 0) {
      ElMessage.info('没有修改任何信息')
      return
    }

    await updateUserProfile(changedData)
    await userStore.fetchUserProfile()

    ElMessage.success('保存成功')
    router.back()

  } catch (error) {
    ElMessage.error('保存失败，请重试')
  } finally {
    saving.value = false
  }
}

const beforeAvatarUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isImage) {
    ElMessage.error('只能上传图片文件')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB')
    return false
  }
  return true
}

const handleAvatarUpload = async ({ file }) => {
  try {
    const response = await uploadAvatar(file)

    if (response) {
      let avatarUrl = ''

      if (typeof response === 'string') {
        avatarUrl = response.trim().replace(/`/g, '')
      } else if (response.url) {
        avatarUrl = response.url.trim().replace(/`/g, '')
      } else if (response.avatarUrl) {
        avatarUrl = response.avatarUrl.trim().replace(/`/g, '')
      } else {
        avatarUrl = String(response).trim().replace(/`/g, '')
      }

      if (avatarUrl && (avatarUrl.startsWith('http://') || avatarUrl.startsWith('https://'))) {
        formData.avatarUrl = avatarUrl
        ElMessage.success('头像上传成功')
      } else {
        throw new Error(`获取到的URL格式不正确: ${avatarUrl}`)
      }
    } else {
      throw new Error('上传响应数据无效')
    }
  } catch (error) {
    ElMessage.error('头像上传失败，请重试')
  }
}

onMounted(() => {
  initData()
})
</script>

<style scoped>
.edit-container {
  padding: 24px 16px;
  max-width: 600px;
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

/* 头像区域 */
.avatar-section {
  display: flex;
  align-items: center;
  gap: 20px;
}

.avatar {
  border: 3px solid #E8E0ED;
  box-shadow: 0 4px 12px rgba(155, 138, 160, 0.15);
}

.avatar-actions {
  flex: 1;
}

.upload-btn {
  border-radius: 8px;
  border: 1px solid #E8E0ED;
  color: #9B8AA0;
  background: white;
}

.upload-btn:hover {
  border-color: #B4A5BE;
  color: #9B8AA0;
  background: #F8F7FA;
}

.upload-icon {
  margin-right: 4px;
}

.avatar-hint {
  font-size: 12px;
  color: #9CA3AF;
  margin-top: 8px;
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

/* 保存按钮 */
.save-btn {
  padding: 8px 24px;
  border-radius: 20px;
  background: linear-gradient(135deg, #9B8AA0 0%, #B4A5BE 100%);
  border: none;
  font-weight: 500;
}
</style>
