<template>
  <div class="login-form">
    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label for="identifier" class="form-label">手机号/邮箱/用户名</label>
        <input
          type="text"
          id="identifier"
          v-model="form.identifier"
          class="form-input"
          :class="{ 'form-input-error': errors.identifier }"
          placeholder="请输入手机号/邮箱/用户名"
          @blur="validateField('identifier')"
          @input="clearError('identifier')"
        />
        <div v-if="errors.identifier" class="form-error">{{ errors.identifier }}</div>
      </div>

      <div class="form-group">
        <label for="password" class="form-label">密码</label>
        <input
          type="password"
          id="password"
          v-model="form.password"
          class="form-input"
          :class="{ 'form-input-error': errors.password }"
          placeholder="请输入密码"
          @blur="validateField('password')"
          @input="clearError('password')"
        />
        <div v-if="errors.password" class="form-error">{{ errors.password }}</div>
      </div>

      <div v-if="generalError" class="form-error general-error">{{ generalError }}</div>

      <div class="form-actions">
        <button
          type="submit"
          class="btn btn-primary w-full"
          :disabled="isLoading || !isFormValid"
        >
          <span v-if="isLoading" class="loading-spinner"></span>
          {{ isLoading ? '登录中...' : '登录' }}
        </button>
      </div>

      <div class="form-links">
        <router-link to="/register" class="form-link">注册</router-link>
        <router-link to="/reset-password" class="form-link">忘记密码？</router-link>
      </div>

      <div class="divider">
        <span>其他登录方式</span>
      </div>

      <div class="third-party-login">
        <button
          type="button"
          class="third-party-btn"
          @click="thirdPartyLogin('wechat')"
          :disabled="isLoading"
          :class="{ 'btn-loading': isLoading }"
        >
          <i class="fab fa-weixin"></i>
          <span>微信登录</span>
        </button>
        <button
          type="button"
          class="third-party-btn"
          @click="thirdPartyLogin('qq')"
          :disabled="isLoading"
          :class="{ 'btn-loading': isLoading }"
        >
          <i class="fab fa-qq"></i>
          <span>QQ登录</span>
        </button>
        <button
          type="button"
          class="third-party-btn"
          @click="thirdPartyLogin('google')"
          :disabled="isLoading"
          :class="{ 'btn-loading': isLoading }"
        >
          <i class="fab fa-google"></i>
          <span>Google登录</span>
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/store/auth';
import api from '@/api';

const router = useRouter();
const authStore = useAuthStore();

const form = ref({
  identifier: '',
  password: ''
});

const errors = ref({
  identifier: '',
  password: ''
});

const generalError = ref('');
const isLoading = ref(false);

// 表单验证
const validateField = (field) => {
  switch (field) {
    case 'identifier':
      if (!form.value.identifier.trim()) {
        errors.value.identifier = '请输入手机号/邮箱/用户名';
      } else {
        errors.value.identifier = '';
      }
      break;
    case 'password':
      if (!form.value.password) {
        errors.value.password = '请输入密码';
      } else if (form.value.password.length < 6) {
        errors.value.password = '密码长度至少6位';
      } else {
        errors.value.password = '';
      }
      break;
  }
};

const clearError = (field) => {
  errors.value[field] = '';
  generalError.value = '';
};

const validateForm = () => {
  let isValid = true;
  
  // 验证所有字段
  Object.keys(form.value).forEach(field => {
    validateField(field);
    if (errors.value[field]) {
      isValid = false;
    }
  });
  
  return isValid;
};

const isFormValid = computed(() => {
  return !errors.value.identifier && !errors.value.password && 
         form.value.identifier.trim() && form.value.password;
});

async function handleSubmit() {
  if (!validateForm()) {
    return;
  }
  
  try {
    isLoading.value = true;
    generalError.value = '';
    
    await authStore.login(form.value.identifier, form.value.password);
    router.push('/user');
  } catch (error) {
    console.error('登录失败:', error);
    generalError.value = error.message || '登录失败，请重试';
  } finally {
    isLoading.value = false;
  }
}

async function thirdPartyLogin(provider) {
  try {
    isLoading.value = true;
    generalError.value = '';

    const response = await api.auth.getOAuthUrl(provider);

    if (response.data?.url) {
      window.location.href = response.data.url;
    } else {
      const width = 600;
      const height = 700;
      const left = (window.screen.width - width) / 2;
      const top = (window.screen.height - height) / 2;

      const oauthWindow = window.open(
        response.data.url,
        `${provider}Login`,
        `width=${width},height=${height},left=${left},top=${top},scrollbars=yes`
      );

      if (oauthWindow) {
        const checkClosed = setInterval(() => {
          if (oauthWindow.closed) {
            clearInterval(checkClosed);
            handleOAuthCallback(provider);
          }
        }, 1000);

        window.oauthWindow = oauthWindow;
      } else {
        throw new Error('弹出窗口被阻止，请允许弹窗');
      }
    }
  } catch (error) {
    console.error(`${provider}登录失败:`, error);
    generalError.value = error.message || `${provider}登录失败，请重试`;
  } finally {
    isLoading.value = false;
  }
}

async function handleOAuthCallback(provider) {
  try {
    isLoading.value = true;
    
    const token = localStorage.getItem(`oauth_${provider}_token`);
    const isNewUser = localStorage.getItem(`oauth_${provider}_isNewUser`) === 'true';

    if (token) {
      localStorage.setItem('access_token', token);
      localStorage.removeItem(`oauth_${provider}_token`);
      localStorage.removeItem(`oauth_${provider}_isNewUser`);

      await authStore.fetchCurrentUser();

      if (isNewUser) {
        router.push('/edit-profile');
      } else {
        router.push('/user');
      }
    } else {
      generalError.value = '登录失败，请重试';
    }
  } catch (error) {
    console.error('OAuth回调处理失败:', error);
    generalError.value = '登录处理失败，请重试';
  } finally {
    isLoading.value = false;
  }
}
</script>

<style scoped>
.login-form {
  max-width: 400px;
  margin: 0 auto;
  padding: 2rem;
  background-color: var(--color-white);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: var(--font-weight-medium);
  color: var(--color-gray-700);
}

.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--color-gray-300);
  border-radius: var(--radius-md);
  font-size: 1rem;
  transition: all var(--transition-fast);
}

.form-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-input-error {
  border-color: var(--color-danger) !important;
}

.form-input-error:focus {
  border-color: var(--color-danger) !important;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1) !important;
}

.form-error {
  font-size: 0.75rem;
  color: var(--color-danger);
  margin-top: 0.25rem;
  min-height: 1rem;
}

.general-error {
  margin-bottom: 1rem;
  padding: 0.75rem;
  background-color: rgba(239, 68, 68, 0.1);
  border-radius: var(--radius-md);
  text-align: center;
}

.form-actions {
  margin-top: 2rem;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: var(--radius-md);
  font-size: 1rem;
  font-weight: var(--font-weight-medium);
  text-align: center;
  cursor: pointer;
  transition: all var(--transition-fast);
  gap: 0.5rem;
}

.btn-primary {
  background-color: var(--color-primary);
  color: var(--color-white);
}

.btn-primary:hover:not(:disabled) {
  background-color: var(--color-primary-dark);
  transform: translateY(-1px);
  box-shadow: 0 4px 6px rgba(59, 130, 246, 0.2);
}

.btn-primary:disabled {
  background-color: var(--color-gray-400);
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.w-full {
  width: 100%;
}

.loading-spinner {
  width: 1rem;
  height: 1rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.form-links {
  display: flex;
  justify-content: space-between;
  margin-top: 1rem;
}

.form-link {
  color: var(--color-primary);
  text-decoration: none;
  font-size: 0.875rem;
  transition: color var(--transition-fast);
}

.form-link:hover {
  text-decoration: underline;
  color: var(--color-primary-dark);
}

.divider {
  display: flex;
  align-items: center;
  margin: 2rem 0;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background-color: var(--color-gray-200);
}

.divider span {
  padding: 0 1rem;
  color: var(--color-gray-500);
  font-size: 0.875rem;
}

.third-party-login {
  display: flex;
  justify-content: space-around;
  gap: 1rem;
}

.third-party-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
  border: 1px solid var(--color-gray-200);
  border-radius: var(--radius-md);
  background-color: var(--color-white);
  cursor: pointer;
  transition: all var(--transition-fast);
  position: relative;
  overflow: hidden;
}

.third-party-btn:hover:not(:disabled) {
  border-color: var(--color-primary);
  box-shadow: var(--shadow-sm);
  transform: translateY(-1px);
}

.third-party-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.third-party-btn.btn-loading::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.2), transparent);
  animation: loading-shimmer 1.5s infinite;
}

@keyframes loading-shimmer {
  0% { left: -100%; }
  100% { left: 100%; }
}

.third-party-btn i {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  transition: transform var(--transition-fast);
}

.third-party-btn:hover:not(:disabled) i {
  transform: scale(1.1);
}

.third-party-btn span {
  font-size: 0.75rem;
  color: var(--color-gray-600);
}

.fa-weixin {
  color: #07C160;
}

.fa-qq {
  color: #12B7F5;
}

.fa-google {
  color: #DB4437;
}
</style>