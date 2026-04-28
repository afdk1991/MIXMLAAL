<template>
  <div class="relative language-selector">
    <button 
      type="button" 
      class="flex items-center text-sm font-medium text-text-secondary hover:text-text-primary focus:outline-none transition-colors p-2 rounded-full hover:bg-background"
      @click="toggleLanguageMenu"
    >
      <span class="mr-2">{{ currentLanguageName }}</span>
      <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>
    <div 
      v-if="isLanguageMenuOpen" 
      class="absolute right-0 mt-2 w-48 bg-card rounded-lg shadow-lg py-2 z-50 transform transition-all duration-200 scale-100 opacity-100"
    >
      <button 
        v-for="lang in languages" 
        :key="lang.value"
        @click="changeLanguage(lang.value)"
        class="block px-4 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-background w-full text-left transition-colors rounded-md"
        :class="{ 'bg-background text-text-primary font-medium': currentLanguage === lang.value }"
      >
        {{ lang.name }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';

const { locale } = useI18n();
const isLanguageMenuOpen = ref(false);

const languages = [
  { value: 'zh-CN', name: '中文' },
  { value: 'en-US', name: 'English' }
];

const currentLanguage = computed(() => locale.value);

const currentLanguageName = computed(() => {
  const lang = languages.find(l => l.value === currentLanguage.value);
  return lang ? lang.name : '中文';
});

const toggleLanguageMenu = () => {
  isLanguageMenuOpen.value = !isLanguageMenuOpen.value;
};

const changeLanguage = (lang) => {
  locale.value = lang;
  localStorage.setItem('locale', lang);
  isLanguageMenuOpen.value = false;
};

// 点击外部关闭菜单
const handleClickOutside = (event) => {
  const languageSelector = document.querySelector('.language-selector');
  if (languageSelector && !languageSelector.contains(event.target)) {
    isLanguageMenuOpen.value = false;
  }
};

// 监听点击事件
window.addEventListener('click', handleClickOutside);

// 组件卸载时移除事件监听器
const handleUnmount = () => {
  window.removeEventListener('click', handleClickOutside);
};

// 注册卸载钩子
onUnmounted(handleUnmount);
</script>

<style scoped>
.language-selector {
  position: relative;
}
</style>
