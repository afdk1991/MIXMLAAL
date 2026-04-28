// 主题管理模块
import { Storage } from './storage.js';
import { EventBus } from './event-bus.js';

export const Theme = {
  current: 'light',
  init() {
    this.current = Storage.get('theme', 'light');
    this.apply();
    // 监听系统主题变化
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', _ => {
      if (this.current === 'auto') {
        this.apply();
      }
    });
  },
  apply() {
    const isDark = this.current === 'dark' ||
                      (this.current === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    document.body.classList.toggle('dark', isDark);

    if (isDark) {
      document.body.style.setProperty('--bg', '#1F2937');
      document.body.style.setProperty('--text', '#F9FAFB');
    } else {
      document.body.style.setProperty('--bg', '#F9FAFB');
      document.body.style.setProperty('--text', '#1F2937');
    }

    document.body.style.backgroundColor = 'var(--bg)';
    document.body.style.color = 'var(--text)';

    // 更新所有卡片和容器的背景色
    document.querySelectorAll('.bg-white, .bg-gray-100').forEach(el => {
      el.classList.toggle('dark:bg-gray-800', isDark);
      el.classList.toggle('dark:bg-gray-700', isDark);
    });

    Storage.set('theme', this.current);
    EventBus.emit('theme:change', this.current);
  },
  toggle() {
    this.current = this.current === 'light' ? 'dark' : 'light';
    this.apply();
  },
  set(mode) {
    this.current = mode;
    this.apply();
  },
};
