<template>
  <div class="security-page">
    <div class="container">
      <header class="page-header">
        <h1>{{ $t('security.title') }}</h1>
      </header>

      <div class="security-list">
        <div class="security-item">
          <div class="item-info">
            <span class="icon">🔒</span>
            <div>
              <h3>{{ $t('security.password') }}</h3>
              <p>{{ $t('security.passwordDesc') }}</p>
            </div>
          </div>
          <button @click="showChangePassword = true">{{ $t('security.change') }}</button>
        </div>

        <div class="security-item">
          <div class="item-info">
            <span class="icon">📱</span>
            <div>
              <h3>{{ $t('security.phone') }}</h3>
              <p>{{ phoneDisplay }}</p>
            </div>
          </div>
          <button @click="showChangePhone = true">{{ $t('security.change') }}</button>
        </div>

        <div class="security-item">
          <div class="item-info">
            <span class="icon">✉️</span>
            <div>
              <h3>{{ $t('security.email') }}</h3>
              <p>{{ emailDisplay }}</p>
            </div>
          </div>
          <button @click="showChangeEmail = true">{{ $t('security.change') }}</button>
        </div>

        <div class="security-item">
          <div class="item-info">
            <span class="icon">🔐</span>
            <div>
              <h3>{{ $t('security.twoFactor') }}</h3>
              <p>{{ twoFactorEnabled ? $t('security.enabled') : $t('security.disabled') }}</p>
            </div>
          </div>
          <button @click="toggleTwoFactor">
            {{ twoFactorEnabled ? $t('security.disable') : $t('security.enable') }}
          </button>
        </div>

        <div class="security-item">
          <div class="item-info">
            <span class="icon">📋</span>
            <div>
              <h3>{{ $t('security.loginHistory') }}</h3>
              <p>{{ $t('security.loginHistoryDesc') }}</p>
            </div>
          </div>
          <button @click="$router.push('/security/login-history')">{{ $t('security.view') }}</button>
        </div>

        <div class="security-item danger">
          <div class="item-info">
            <span class="icon">⚠️</span>
            <div>
              <h3>{{ $t('security.accountCancellation') }}</h3>
              <p>{{ $t('security.accountCancellationDesc') }}</p>
            </div>
          </div>
          <button class="btn-danger" @click="showCancellation = true">{{ $t('security.cancell') }}</button>
        </div>
      </div>

      <div v-if="showChangePassword" class="modal">
        <div class="modal-content">
          <h3>{{ $t('security.changePassword') }}</h3>
          <form @submit.prevent="changePassword">
            <input type="password" v-model="passwordForm.oldPassword" :placeholder="$t('security.oldPassword')" required />
            <input type="password" v-model="passwordForm.newPassword" :placeholder="$t('security.newPassword')" required />
            <input type="password" v-model="passwordForm.confirmPassword" :placeholder="$t('security.confirmPassword')" required />
            <button type="submit">{{ $t('security.confirm') }}</button>
          </form>
          <button class="btn-close" @click="showChangePassword = false">×</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Security',
  data() {
    return {
      phoneDisplay: '138****8888',
      emailDisplay: 'u***@example.com',
      twoFactorEnabled: false,
      showChangePassword: false,
      showChangePhone: false,
      showChangeEmail: false,
      showCancellation: false,
      passwordForm: {
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
      },
    };
  },
  methods: {
    async changePassword() {
      if (this.passwordForm.newPassword !== this.passwordForm.confirmPassword) {
        alert('两次密码输入不一致');
        return;
      }
      this.showChangePassword = false;
    },
    async toggleTwoFactor() {
      this.twoFactorEnabled = !this.twoFactorEnabled;
    },
  },
};
</script>

<style scoped>
.security-page {
  min-height: 100vh;
  background: #f5f7fa;
  padding: 40px 20px;
}

.container {
  max-width: 800px;
  margin: 0 auto;
}

.page-header h1 {
  font-size: 28px;
  color: #333;
  margin-bottom: 30px;
}

.security-list {
  background: white;
  border-radius: 16px;
  overflow: hidden;
}

.security-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #f0f0f0;
}

.security-item:last-child {
  border-bottom: none;
}

.item-info {
  display: flex;
  gap: 15px;
  align-items: center;
}

.item-info .icon {
  font-size: 28px;
}

.item-info h3 {
  font-size: 16px;
  color: #333;
  margin-bottom: 4px;
}

.item-info p {
  font-size: 14px;
  color: #999;
}

.security-item button {
  padding: 8px 16px;
  background: #f5f7fa;
  border: none;
  border-radius: 20px;
  font-size: 14px;
  cursor: pointer;
  color: #667eea;
}

.security-item.danger .icon {
  color: #ff6b6b;
}

.btn-danger {
  color: #ff6b6b !important;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 30px;
  border-radius: 20px;
  width: 90%;
  max-width: 400px;
  position: relative;
}

.modal-content h3 {
  text-align: center;
  margin-bottom: 20px;
}

.modal-content form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.modal-content input {
  padding: 12px 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
}

.modal-content button[type="submit"] {
  padding: 14px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
}

.btn-close {
  position: absolute;
  top: 10px;
  right: 15px;
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
}
</style>