// 预览模式模块
import { EventBus } from './event-bus.js';

export const Preview = {
  active: false,
  currentDevice: 'ios',
  deviceSizes: {
    ios: { width: 320, height: 568 },
    android: { width: 360, height: 640 },
    tablet: { width: 768, height: 1024 },
  },
  container: null,
  screen: null,
  content: null,

  init() {
    this.container = document.getElementById('preview-container');
    this.screen = document.getElementById('preview-screen');
    this.content = document.getElementById('preview-content');
    this.bindEvents();
  },

  bindEvents() {
    // 预览按钮
    document.getElementById('previewToggle').addEventListener('click', () => {
      this.enter();
    });

    // 设备切换
    document.querySelectorAll('[data-device]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.switchDevice(btn.dataset.device);
      });
    });

    // 退出预览
    document.getElementById('preview-exit').addEventListener('click', () => {
      this.exit();
    });
  },

  enter(device = 'ios') {
    this.active = true;
    this.currentDevice = device;
    this.switchDevice(device);

    // 复制应用内容到预览窗口
    const appContent = document.getElementById('app').cloneNode(true);
    this.content.innerHTML = '';
    this.content.appendChild(appContent);

    this.container.style.display = 'flex';
    EventBus.emit('preview:enter', device);
  },

  exit() {
    this.active = false;
    this.container.style.display = 'none';
    EventBus.emit('preview:exit');
  },

  switchDevice(device) {
    const size = this.deviceSizes[device];
    if (size) {
      this.screen.style.width = `${size.width}px`;
      this.screen.style.height = `${size.height}px`;
      this.currentDevice = device;

      // 更新设备边框样式
      this.screen.className = `bg-white rounded-2xl overflow-hidden relative ${device === 'ios' ? 'rounded-[28px]' : device === 'tablet' ? 'rounded-[16px]' : 'rounded-[24px]'}`;

      EventBus.emit('preview:deviceChange', device);
    }
  },
};
