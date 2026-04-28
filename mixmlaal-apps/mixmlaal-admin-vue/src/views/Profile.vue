<template>
  <div class="profile-container">
    <h1>个人中心</h1>
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span>个人信息</span>
        </div>
      </template>
      <div class="profile-content">
        <div class="avatar-section">
          <el-avatar :size="100" :src="userInfo.avatar || 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'" />
          <h2>{{ userInfo.nickname || '管理员' }}</h2>
          <p>{{ userInfo.email || '无邮箱' }}</p>
        </div>
        <div class="info-section">
          <el-form :model="profileForm" :rules="profileRules" ref="profileFormRef" label-width="100px">
            <el-form-item label="用户名" prop="username">
              <el-input v-model="profileForm.username" placeholder="请输入用户名" />
            </el-form-item>
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="profileForm.email" placeholder="请输入邮箱" />
            </el-form-item>
            <el-form-item label="昵称" prop="nickname">
              <el-input v-model="profileForm.nickname" placeholder="请输入昵称" />
            </el-form-item>
            <el-form-item label="头像" prop="avatar">
              <el-input v-model="profileForm.avatar" placeholder="请输入头像URL" />
            </el-form-item>
            <el-form-item label="性别" prop="gender">
              <el-select v-model="profileForm.gender" placeholder="请选择性别">
                <el-option label="未知" value="0" />
                <el-option label="男" value="1" />
                <el-option label="女" value="2" />
              </el-select>
            </el-form-item>
            <el-form-item label="生日" prop="birthday">
              <el-date-picker v-model="profileForm.birthday" type="date" placeholder="选择生日" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleUpdateProfile">保存修改</el-button>
            </el-form-item>
          </el-form>
        </div>
      </div>
    </el-card>
    <el-card shadow="hover" style="margin-top: 20px;">
      <template #header>
        <div class="card-header">
          <span>修改密码</span>
        </div>
      </template>
      <div class="password-section">
        <el-form :model="passwordForm" :rules="passwordRules" ref="passwordFormRef" label-width="100px">
          <el-form-item label="旧密码" prop="oldPassword">
            <el-input v-model="passwordForm.oldPassword" type="password" placeholder="请输入旧密码" />
          </el-form-item>
          <el-form-item label="新密码" prop="newPassword">
            <el-input v-model="passwordForm.newPassword" type="password" placeholder="请输入新密码" />
          </el-form-item>
          <el-form-item label="确认新密码" prop="confirmPassword">
            <el-input v-model="passwordForm.confirmPassword" type="password" placeholder="请确认新密码" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleUpdatePassword">修改密码</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useUserStore } from '../store/user'
import { ElMessage } from 'element-plus'
import api from '../api'

const userStore = useUserStore()
const userInfo = ref({})

// 个人信息表单
const profileForm = reactive({
  username: '',
  email: '',
  nickname: '',
  avatar: '',
  gender: 0,
  birthday: ''
})

// 个人信息表单规则
const profileRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, message: '用户名长度至少为2位', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  nickname: [
    { required: true, message: '请输入昵称', trigger: 'blur' }
  ]
}

// 密码修改表单
const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 密码修改表单规则
const passwordRules = {
  oldPassword: [
    { required: true, message: '请输入旧密码', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '新密码长度至少为6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== passwordForm.newPassword) {
          callback(new Error('两次输入密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

// 获取用户信息
const getUserInfo = async () => {
  try {
    const response = await userStore.getCurrentUser()
    userInfo.value = response.data.user
    profileForm.username = userInfo.value.username || ''
    profileForm.email = userInfo.value.email || ''
    profileForm.nickname = userInfo.value.nickname || ''
    profileForm.avatar = userInfo.value.avatar || ''
    profileForm.gender = userInfo.value.gender || 0
    profileForm.birthday = userInfo.value.birthday || ''
  } catch (error) {
    ElMessage.error('获取用户信息失败')
    console.error('获取用户信息失败:', error)
  }
}

// 更新个人信息
const handleUpdateProfile = async () => {
  try {
    await api.put('/users/profile', profileForm)
    ElMessage.success('更新个人信息成功')
    getUserInfo()
  } catch (error) {
    ElMessage.error('更新个人信息失败')
    console.error('更新个人信息失败:', error)
  }
}

// 更新密码
const handleUpdatePassword = async () => {
  try {
    await api.put('/users/password', passwordForm)
    ElMessage.success('修改密码成功')
    passwordForm.oldPassword = ''
    passwordForm.newPassword = ''
    passwordForm.confirmPassword = ''
  } catch (error) {
    ElMessage.error('修改密码失败')
    console.error('修改密码失败:', error)
  }
}

// 组件挂载时
onMounted(() => {
  getUserInfo()
})
</script>

<style scoped>
.profile-container {
  padding: 20px;
}

.profile-container h1 {
  margin-bottom: 20px;
  color: #303133;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.profile-content {
  display: flex;
  align-items: center;
}

.avatar-section {
  flex: 0 0 200px;
  text-align: center;
  margin-right: 40px;
}

.avatar-section h2 {
  margin-top: 10px;
  margin-bottom: 5px;
  color: #303133;
}

.avatar-section p {
  color: #909399;
  margin: 0;
}

.info-section {
  flex: 1;
}

.password-section {
  max-width: 500px;
}

@media (max-width: 768px) {
  .profile-content {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .avatar-section {
    margin-bottom: 20px;
  }
}
</style>