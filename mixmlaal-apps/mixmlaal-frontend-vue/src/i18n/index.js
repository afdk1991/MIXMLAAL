import { createI18n } from 'vue-i18n';
import zhCn from './locales/zh-CN';
import enUs from './locales/en-US';

// 创建 i18n 实例
const i18n = createI18n({
  locale: localStorage.getItem('locale') || 'zh-CN', // 默认语言
  fallbackLocale: 'zh-CN', // 回退语言
  messages: {
    'zh-CN': zhCn,
    'en-US': enUs,
  },
  legacy: false, // 启用组合式API模式
});

export default i18n;
