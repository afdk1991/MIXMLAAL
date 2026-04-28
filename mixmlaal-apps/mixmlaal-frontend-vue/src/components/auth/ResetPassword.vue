<template>
  <div class="reset-password-form">
    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label for="email" class="form-label">邮箱</label>
        <div class="input-group">
          <input
            type="email"
            id="email"
            v-model="form.email"
            class="form-input"
            placeholder="请输入邮箱"
            required
          />
          <button
            type="button"
            class="btn btn-secondary"
            @click="sendCode"
            :disabled="isSendingCode"
          >
            {{ isSendingCode ? '发送中...' : '发送验证码' }}
          </button>
        </div>
      </div>
      
      <div class="form-group">
        <label for="code" class="form-label">验证码</label>
        <input
          type="text"
          id="code"
          v-model="form.code"
          class="form-input"
          placeholder="请输入验证码"
          required
        />
      </div>
      
      <div class="form-group">
        <label for="password" class="form-label">新密码</label>
        <input
          type="password"
          id="password"
          v-model="form.password"
          class="form-input"
          placeholder="请输入新密码"
          required
        />
      </div>
      
      <div class="form-group">
        <label for="confirmPassword" class="form-label">确认新密码</label>
        <input
          type="password"
          id="confirmPassword"
          v-model="form.confirmPassword"
          class="form-input"
          placeholder="请确认新密码"
          required
        />
      </div>
      
      <div class="form-actions">
        <button
          type="submit"
          class="btn btn-primary w-full"
          :disabled="isLoading"
        >
          {{ isLoading ? '重置中...' : '重置密码' }}
        </button>
      </div>
      
      <div class="form-links">
        <router-link to="/login" class="form-link">返回登录</router-link>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import authApi from '@/api/auth';

const router = useRouter();

const form = ref({
  email: '',
  code: '',
  password: '',
  confirmPassword: ''
});

const isLoading = ref(false);
const isSendingCode = ref(false);
const error = ref(null);

async function sendCode() {
  try {
    isSendingCode.value = true;
    await authApi.sendCode({ email: form.value.email });
    alert('验证码已发送');
  } catch (error) {
    console.error('发送验证码失败:', error);
    alert('发送验证码失败');
  } finally {
    isSendingCode.value = false;
  }
}

async function handleSubmit() {
  if (form.value.password !== form.value.confirmPassword) {
    alert('两次输入的密码不一致');
    return;
  }
  
  try {
    isLoading.value = true;
    await authApi.resetPassword({
      email: form.value.email,
      code: form.value.code,
      password: form.value.password
    });
    alert('密码重置成功');
    router.push('/login');
  } catch (error) {
    console.error('重置密码失败:', error);
    alert('重置密码失败');
  } finally {
    isLoading.value = false;
  }
}
</script>

<style scoped>
.reset-password-form {
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

.input-group {
  display: flex;
  gap: 1rem;
}

.form-input {
  flex: 1;
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

.form-actions {
  margin-top: 2rem;
}

.btn {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: var(--radius-md);
  font-size: 1rem;
  font-weight: var(--font-weight-medium);
  text-align: center;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.btn-primary {
  background-color: var(--color-primary);
  color: var(--color-white);
}

.btn-primary:hover {
  background-color: var(--color-primary-dark);
}

.btn-primary:disabled {
  background-color: var(--color-gray-400);
  cursor: not-allowed;
}

.btn-secondary {
  background-color: var(--color-gray-200);
  color: var(--color-gray-800);
}

.btn-secondary:hover {
  background-color: var(--color-gray-300);
}

.btn-secondary:disabled {
  background-color: var(--color-gray-400);
  cursor: not-allowed;
}

.form-links {
  margin-top: 1rem;
  text-align: center;
}

.form-link {
  color: var(--color-primary);
  text-decoration: none;
  font-size: 0.875rem;
}

.form-link:hover {
  text-decoration: underline;
}
</style>
