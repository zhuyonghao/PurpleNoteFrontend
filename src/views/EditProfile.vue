<template>
  <MainLayout>
    <!-- 顶部导航 -->
    <PageHeader @back="handleBack">
      <template #actions>
        <el-button 
          type="primary" 
          :loading="saving"
          @click="handleSave"
        >
          保存
        </el-button>
      </template>
    </PageHeader>

    <!-- 编辑表单 -->
    <div class="max-w-2xl mx-auto px-4 py-6">
      <el-form 
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-width="80px"
        class="bg-white rounded-lg p-6 shadow-sm"
      >
        <!-- 头像上传 -->
        <el-form-item label="头像">
          <div class="flex items-center space-x-4">
            <el-avatar 
              :src="formData.avatarUrl" 
              :size="80"
              class="border-2 border-gray-200"
            >
              <el-icon size="40"><User /></el-icon>
            </el-avatar>
            <div>
              <el-upload
                :show-file-list="false"
                :before-upload="beforeAvatarUpload"
                :http-request="handleAvatarUpload"
                accept="image/*"
              >
                <el-button type="primary" plain>
                  <el-icon class="mr-1"><Upload /></el-icon>
                  更换头像
                </el-button>
              </el-upload>
              <p class="text-xs text-gray-500 mt-1">支持 JPG、PNG 格式，文件大小不超过 2MB</p>
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

// 表单数据
const formData = reactive({
  avatarUrl: '',
  username: '',
  bio: ''
})

// 原始数据，用于检测是否有修改
const originalData = reactive({})

// 表单验证规则
const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 20, message: '用户名长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  bio: [
    { max: 200, message: '个人简介不能超过 200 个字符', trigger: 'blur' }
  ]
}

// 初始化数据
const initData = () => {
  if (userStore.userInfo) {
    Object.assign(formData, {
      avatarUrl: userStore.userInfo.avatarUrl || '',
      username: userStore.userInfo.username || '',
      bio: userStore.userInfo.bio || ''
    })
    
    // 保存原始数据
    Object.assign(originalData, formData)
  }
}

// 检查是否有修改
const hasChanges = () => {
  return Object.keys(formData).some(key => formData[key] !== originalData[key])
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
    
    saving.value = true
    
    // 只提交有修改的字段
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
    
    console.log('提交修改的数据:', changedData)
    
    // 调用更新接口
    await updateUserProfile(changedData)
    
    // 更新本地用户信息
    await userStore.fetchUserProfile()
    
    ElMessage.success('保存成功')
    router.back()
    
  } catch (error) {
    console.error('保存失败:', error)
    ElMessage.error('保存失败，请重试')
  } finally {
    saving.value = false
  }
}

// 头像上传前验证
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

// 头像上传处理
const handleAvatarUpload = async ({ file }) => {
  try {
    console.log('开始上传头像:', file.name)
    
    const response = await uploadAvatar(file)
    console.log('头像上传响应:', response)
    
    // 处理返回的响应格式
    let avatarUrl = ''
    
    if (typeof response === 'string') {
      // 如果直接返回字符串URL
      avatarUrl = response.trim().replace(/`/g, '')
    } else if (response && response.code === 200 && response.data) {
      // 如果是标准的API响应格式
      avatarUrl = response.data.trim().replace(/`/g, '')
    } else if (response && response.data) {
      // 如果只有data字段
      avatarUrl = response.data.trim().replace(/`/g, '')
    } else {
      console.error('响应格式异常:', response)
      throw new Error(`无法解析上传响应: ${JSON.stringify(response)}`)
    }
    
    if (avatarUrl && avatarUrl.startsWith('http')) {
      formData.avatarUrl = avatarUrl
      ElMessage.success('头像上传成功')
      console.log('新头像URL:', avatarUrl)
    } else {
      throw new Error('获取到的URL格式不正确')
    }
  } catch (error) {
    console.error('头像上传失败:', error)
    ElMessage.error('头像上传失败，请重试')
  }
}

onMounted(() => {
  initData()
})
</script>

<style scoped>
.el-form-item {
  margin-bottom: 24px;
}

.el-upload {
  display: inline-block;
}
</style>