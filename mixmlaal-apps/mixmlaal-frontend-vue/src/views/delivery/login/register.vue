<template>
  <view class="register-container">
    <view class="register-form">
      <view class="title">
        <text class="title-text">注册账号</text>
      </view>
      <view class="form-item">
        <input
          v-model="form.username"
          type="text"
          placeholder="请输入用户名"
          class="input"
        />
      </view>
      <view class="form-item">
        <input
          v-model="form.password"
          type="password"
          placeholder="请输入密码"
          class="input"
        />
      </view>
      <view class="form-item">
        <input
          v-model="form.name"
          type="text"
          placeholder="请输入姓名"
          class="input"
        />
      </view>
      <view class="form-item">
        <input
          v-model="form.phone"
          type="number"
          placeholder="请输入手机号"
          class="input"
        />
      </view>
      <button @click="register" class="register-btn">注册</button>
      <view class="login-link">
        <text>已有账号？</text>
        <text @click="goToLogin" class="link">立即登录</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      form: {
        username: '',
        password: '',
        name: '',
        phone: ''
      }
    };
  },
  methods: {
    async register() {
      if (!this.form.username || !this.form.password || !this.form.name || !this.form.phone) {
        uni.showToast({
          title: '请填写完整信息',
          icon: 'none'
        });
        return;
      }
      
      try {
        const response = await uni.request({
          url: 'http://localhost:3000/api/auth/register',
          method: 'POST',
          data: this.form
        });
        
        if (response.data.code === 200) {
          uni.showToast({
            title: '注册成功',
            icon: 'success'
          });
          uni.navigateBack();
        } else {
          uni.showToast({
            title: response.data.message,
            icon: 'none'
          });
        }
      } catch (error) {
        uni.showToast({
          title: '注册失败，请稍后重试',
          icon: 'none'
        });
      }
    },
    goToLogin() {
      uni.navigateBack();
    }
  }
};
</script>

<style scoped>
.register-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: #f5f5f5;
}

.register-form {
  width: 80%;
  max-width: 400px;
  background-color: #ffffff;
  padding: 30rpx;
  border-radius: 10rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
}

.title {
  text-align: center;
  margin-bottom: 40rpx;
}

.title-text {
  font-size: 36rpx;
  font-weight: bold;
  color: #007AFF;
}

.form-item {
  margin-bottom: 20rpx;
}

.input {
  width: 100%;
  height: 80rpx;
  border: 1rpx solid #e5e5e5;
  border-radius: 10rpx;
  padding: 0 20rpx;
  font-size: 28rpx;
}

.register-btn {
  width: 100%;
  height: 80rpx;
  background-color: #007AFF;
  color: #ffffff;
  border: none;
  border-radius: 10rpx;
  font-size: 28rpx;
  font-weight: bold;
  margin-top: 20rpx;
}

.login-link {
  text-align: center;
  margin-top: 20rpx;
  font-size: 24rpx;
  color: #666666;
}

.link {
  color: #007AFF;
  margin-left: 10rpx;
}
</style>