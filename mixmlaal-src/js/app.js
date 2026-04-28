// MIXMLAAL APP 主入口
import { EventBus } from './modules/event-bus.js';
import { Storage } from './modules/storage.js';
import { Monitor } from './modules/monitor.js';
import { Network } from './modules/network.js';
import { Theme } from './modules/theme.js';
import { Preview } from './modules/preview.js';
import { Notification } from './modules/notification.js';
import { Performance } from './modules/performance.js';
import { Platform } from './modules/platform.js';
import { State } from './modules/state.js';

import { Feedback } from './modules/feedback.js';
import { ErrorHandler } from './modules/error-handler.js';
import { Loader } from './modules/loader.js';
import { PerformanceMonitor } from './modules/performance-monitor.js';
import { LazyLoader } from './modules/lazy-loader.js';

class App {
  constructor() {
    this.modules = [];
    this.initialized = false;
  }

  async init() {
    if (this.initialized) { return; }

    console.log('🚀 MIXMLAAL APP 初始化中...');

    this.modules = [
      { name: 'Monitor', instance: Monitor },
      { name: 'Storage', instance: Storage },
      { name: 'State', instance: State },
      { name: 'Theme', instance: Theme },
      { name: 'Network', instance: Network },
      { name: 'Preview', instance: Preview },
      { name: 'Notification', instance: Notification },
      { name: 'Performance', instance: Performance },
      { name: 'PerformanceMonitor', instance: PerformanceMonitor },
      { name: 'LazyLoader', instance: LazyLoader },
      { name: 'Platform', instance: Platform },
      { name: 'Feedback', instance: Feedback },
      { name: 'ErrorHandler', instance: ErrorHandler },
      { name: 'Loader', instance: Loader },
    ];

    for (const module of this.modules) {
      try {
        if (module.instance && typeof module.instance.init === 'function') {
          await module.instance.init();
          console.log(`✅ ${module.name} 初始化完成`);
        }
      } catch (error) {
        console.error(`❌ ${module.name} 初始化失败:`, error);
        if (Monitor && typeof Monitor.report === 'function') {
          Monitor.report({
            type: 'module_error',
            module: module.name,
            error: error.message,
          });
        }
      }
    }

    this.bindGlobalEvents();
    this.setupPlatformDetection();

    Loader.hide();

    this.initialized = true;
    console.log('🎉 MIXMLAAL APP 初始化完成！');
  }

  bindGlobalEvents() {
    try {
      const darkModeToggle = document.getElementById('darkModeToggle');
      if (darkModeToggle) {
        darkModeToggle.addEventListener('click', () => {
          Theme.toggle();
          const icon = Theme.current === 'dark' ? 'fa-sun-o' : 'fa-moon-o';
          darkModeToggle.innerHTML = `<i class="fa ${icon} text-lg"></i>`;
        });
      }

      const notificationBtn = document.getElementById('notificationBtn');
      const notificationModal = document.getElementById('notificationModal');
      const closeNotificationBtn = document.getElementById('closeNotificationBtn');

      if (notificationBtn && notificationModal) {
        notificationBtn.addEventListener('click', () => {
          notificationModal.classList.remove('hidden');
        });
      }

      if (closeNotificationBtn && notificationModal) {
        closeNotificationBtn.addEventListener('click', () => {
          notificationModal.classList.add('hidden');
        });
      }

      const fabButton = document.getElementById('fabButton');
      const fabMenu = document.getElementById('fabMenu');

      if (fabButton && fabMenu) {
        const fabIcon = fabButton.querySelector('i');
        let fabMenuOpen = false;

        fabButton.addEventListener('click', e => {
          e.stopPropagation();
          fabMenuOpen = !fabMenuOpen;

          if (fabMenuOpen) {
            fabMenu.classList.remove('opacity-0', 'invisible');
            fabMenu.classList.add('opacity-100', 'visible');

            const menuItems = fabMenu.querySelectorAll('.fab-menu-item');
            menuItems.forEach((item, index) => {
              setTimeout(() => {
                item.classList.remove('translate-y-4');
                item.classList.add('translate-y-0');
              }, index * 100);
            });

            if (fabIcon) { fabIcon.classList.add('rotate-45'); }
          } else {
            fabMenu.classList.remove('opacity-100', 'visible');
            fabMenu.classList.add('opacity-0', 'invisible');

            const menuItems = fabMenu.querySelectorAll('.fab-menu-item');
            menuItems.forEach(item => {
              item.classList.remove('translate-y-0');
              item.classList.add('translate-y-4');
            });

            if (fabIcon) { fabIcon.classList.remove('rotate-45'); }
          }
        });

        document.querySelectorAll('.fab-menu-item').forEach(item => {
          item.addEventListener('click', e => {
            e.stopPropagation();
            const action = item.getAttribute('data-action');
            console.log('FAB action:', action);
            fabButton.click();
          });
        });

        document.addEventListener('click', e => {
          if (fabMenuOpen && !fabButton.contains(e.target) && !fabMenu.contains(e.target)) {
            fabButton.click();
          }
        });
      }

      window.addEventListener('resize', () => {
        EventBus.emit('window:resize', {
          width: window.innerWidth,
          height: window.innerHeight,
        });
      });
    } catch (error) {
      console.error('绑定全局事件失败:', error);
    }
  }

  setupPlatformDetection() {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    const isAndroid = /Android/.test(navigator.userAgent);
    const app = document.getElementById('app');
    const platformText = document.getElementById('platformText');
    const platformIndicator = document.getElementById('platformIndicator');

    if (isIOS && app) {
      app.classList.add('platform-ios');
      if (platformText) {
        platformText.textContent = 'iOS 设备';
        platformText.className = 'text-ios';
      }
      if (platformIndicator) {
        platformIndicator.classList.remove('hidden');
      }
    } else if (isAndroid && app) {
      app.classList.add('platform-android');
      if (platformText) {
        platformText.textContent = 'Android 设备';
        platformText.className = 'text-android';
      }
      if (platformIndicator) {
        platformIndicator.classList.remove('hidden');
      }
    }
  }
}

const app = new App();

document.addEventListener('DOMContentLoaded', async () => {
  try {
    await app.init();
  } catch (error) {
    console.error('应用启动失败:', error);
  }
});

window.MIXMLAAL = app;
