<template>
  <footer class="fixed bottom-0 left-0 right-0 bg-card shadow-sm z-40 border-t border-border">
    <div class="container mx-auto px-4 py-1 md:py-2">
      <div class="flex justify-around items-center">
        <router-link to="/" class="footer-item" active-class="active">
          <i class="fa fa-home text-lg"></i>
          <span class="text-xs mt-1">首页</span>
        </router-link>
        <router-link to="/ride" class="footer-item" active-class="active">
          <i class="fa fa-car text-lg"></i>
          <span class="text-xs mt-1">出行</span>
        </router-link>
        <router-link to="/mall" class="footer-item" active-class="active">
          <i class="fa fa-shopping-bag text-lg"></i>
          <span class="text-xs mt-1">商城</span>
        </router-link>
        <router-link to="/integrated" class="footer-item" active-class="active">
          <i class="fa fa-th-large text-lg"></i>
          <span class="text-xs mt-1">综合</span>
        </router-link>
        <div class="footer-item" @click="handleMyClick" :class="{ active: $route.path === '/profile' }">
          <i class="fa fa-user text-lg"></i>
          <span class="text-xs mt-1">我的</span>
        </div>
      </div>
    </div>
    <div class="version-banner">
      <VersionDisplay />
    </div>
  </footer>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import VersionDisplay from '@/components/base/VersionDisplay.vue';

const router = useRouter();
const user = ref(null);
const emit = defineEmits(['showLogin']);

onMounted(() => {
  // 从localStorage获取用户信息
  const userStr = localStorage.getItem('user');
  if (userStr) {
    try {
      user.value = JSON.parse(userStr);
    } catch (error) {
      console.error('解析用户信息失败:', error);
    }
  }
});

function handleMyClick() {
  if (user.value) {
    // 已登录，跳转到个人中心
    router.push('/profile');
  } else {
    // 未登录，触发登录事件
    emit('showLogin');
  }
}
</script>

<style scoped>
.footer-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 1rem;
  transition: all 0.2s ease;
  color: var(--tw-color-text-secondary);
  position: relative;
}

.footer-item:hover {
  color: var(--tw-color-primary);
}

.footer-item.active {
  color: var(--tw-color-primary);
  font-weight: 600;
}

.footer-item.active::after {
  content: '';
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 2rem;
  height: 2px;
  background-color: var(--tw-color-primary);
  border-radius: 1px;
}

.version-banner {
  display: flex;
  justify-content: center;
  padding: 2px 0;
  background-color: var(--color-gray-50);
  border-top: 1px solid var(--color-gray-100);
}
</style>