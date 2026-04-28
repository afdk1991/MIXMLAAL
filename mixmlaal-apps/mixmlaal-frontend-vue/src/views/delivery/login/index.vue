<template>
  <view class="login-container">
    <view class="login-form">
      <view class="logo">
        <text class="logo-text">配送系统</text>
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
      <button @click="login" class="login-btn">登录</button>
      <view class="register-link">
        <text>还没有账号？</text>
        <text @click="goToRegister" class="link">立即注册</text>
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
        password: ''
      }
    };
  },
  methods: {
    async login() {
      if (!this.form.username || !this.form.password) {
        uni.showToast({
          title: '请输入用户名和密码',
          icon: 'none'
        });
        return;
      }
      
      try {
        const response = await uni.request({
          url: 'http://localhost:3000/api/auth/login',
          method: 'POST',
          data: this.form
        });
        
        if (response.data.code === 200) {
          uni.setStorageSync('token', response.data.data.token);
          uni.setStorageSync('user', response.data.data.user);
          uni.showToast({
            title: '登录成功',
            icon: 'success'
          });
          uni.switchTab({
            url: '/pages/index/index'
          });
        } else {
          uni.showToast({
            title: response.data.message,
            icon: 'none'
          });
        }
      } catch (error) {
        uni.showToast({
          title: '登录失败，请稍后重试',
          icon: 'none'
        });
      }
    },
    goToRegister() {
      uni.navigateTo({
        url: '/pages/login/register'
      });
    }
  }
};
</script>

<style scoped>
.login-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: #f5f5f5;
}

.login-form {
  width: 80%;
  max-width: 400px;
  background-color: #ffffff;
  padding: 30rpx;
  border-radius: 10rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
}

.logo {
  text-align: center;
  margin-bottom: 40rpx;
}

.logo-text {
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

.login-btn {
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

.register-link {
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