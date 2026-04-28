<template>
  <div class="register-form">
    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label for="username" class="form-label">用户名</label>
        <input
          type="text"
          id="username"
          v-model="form.username"
          class="form-input"
          placeholder="请输入用户名"
          required
        />
      </div>
      
      <div class="form-group">
        <label for="email" class="form-label">邮箱</label>
        <input
          type="email"
          id="email"
          v-model="form.email"
          class="form-input"
          placeholder="请输入邮箱"
          required
        />
      </div>
      
      <div class="form-group">
        <label for="phone" class="form-label">手机号</label>
        <input
          type="tel"
          id="phone"
          v-model="form.phone"
          class="form-input"
          placeholder="请输入手机号"
          required
        />
      </div>
      
      <div class="form-group">
        <label for="password" class="form-label">密码</label>
        <input
          type="password"
          id="password"
          v-model="form.password"
          class="form-input"
          placeholder="请输入密码"
          required
        />
      </div>
      
      <div class="form-group">
        <label for="nickname" class="form-label">昵称</label>
        <input
          type="text"
          id="nickname"
          v-model="form.nickname"
          class="form-input"
          placeholder="请输入昵称"
        />
      </div>
      
      <div class="form-actions">
        <button
          type="submit"
          class="btn btn-primary w-full"
          :disabled="isLoading"
        >
          {{ isLoading ? '注册中...' : '注册' }}
        </button>
      </div>
      
      <div class="form-links">
        <router-link to="/login" class="form-link">已有账号？登录</router-link>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/store/auth';

const router = useRouter();
const authStore = useAuthStore();

const form = ref({
  username: '',
  email: '',
  phone: '',
  password: '',
  nickname: ''
});

const isLoading = computed(() => authStore.getLoading);
const error = computed(() => authStore.getError);

async function handleSubmit() {
  try {
    await authStore.register(form.value);
    router.push('/user');
  } catch (error) {
    console.error('注册失败:', error);
  }
}
</script>

<style scoped>
.register-form {
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
