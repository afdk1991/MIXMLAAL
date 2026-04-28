/**
 * 预览模式模块
 * 提供多设备实时预览功能
 */
class Preview {
  constructor() {
    this.logger = console;
    this.isActive = false;
    this.currentDevice = 'ios';
    this.currentOrientation = 'portrait';

    // 设备配置
    this.devices = {
      ios: {
        name: 'iPhone',
        sizes: {
          portrait: { width: 375, height: 812, scale: 0.9 },
          landscape: { width: 812, height: 375, scale: 0.9 },
        },
        borderRadius: '28px',
        platform: 'ios',
      },
      android: {
        name: 'Android',
        sizes: {
          portrait: { width: 360, height: 740, scale: 0.9 },
          landscape: { width: 740, height: 360, scale: 0.9 },
        },
        borderRadius: '24px',
        platform: 'android',
      },
      tablet: {
        name: 'iPad',
        sizes: {
          portrait: { width: 768, height: 1024, scale: 0.6 },
          landscape: { width: 1024, height: 768, scale: 0.6 },
        },
        borderRadius: '16px',
        platform: 'ios',
      },
      web: {
        name: 'Web',
        sizes: {
          portrait: { width: 1200, height: 800, scale: 0.7 },
          landscape: { width: 1200, height: 800, scale: 0.7 },
        },
        borderRadius: '8px',
        platform: 'web',
      },
    };

    // DOM 元素
    this.elements = {
      container: null,
      device: null,
      screen: null,
      content: null,
      controls: null,
      exitBtn: null,
    };
  }

  /**
     * 初始化预览模块
     */
  initialize() {
    this.logger.log('📱 Preview 模块初始化');
    this.createPreviewUI();
    this.bindEvents();
    return Promise.resolve();
  }

  /**
     * 创建预览界面
     */
  createPreviewUI() {
    // 创建预览容器
    this.elements.container = document.createElement('div');
    this.elements.container.id = 'preview-container';
    this.elements.container.className = 'fixed inset-0 z-999 bg-black/80 hidden items-center justify-center flex-col gap-4';

    // 创建设备框架
    this.elements.device = document.createElement('div');
    this.elements.device.id = 'preview-device';
    this.elements.device.className = 'relative bg-gray-900 rounded-3xl p-3 shadow-2xl transition-all duration-300';

    // 创建屏幕
    this.elements.screen = document.createElement('div');
    this.elements.screen.id = 'preview-screen';
    this.elements.screen.className = 'bg-white rounded-2xl overflow-hidden relative transition-all duration-300';

    // 创建内容容器
    this.elements.content = document.createElement('div');
    this.elements.content.id = 'preview-content';
    this.elements.content.className = 'w-full h-full overflow-hidden';

    // 组装结构
    this.elements.screen.appendChild(this.elements.content);
    this.elements.device.appendChild(this.elements.screen);
    this.elements.container.appendChild(this.elements.device);

    // 创建控制栏
    this.createControls();

    // 添加到文档
    document.body.appendChild(this.elements.container);
  }

  /**
     * 创建控制栏
     */
  createControls() {
    this.elements.controls = document.createElement('div');
    this.elements.controls.className = 'preview-controls flex gap-3 bg-gray-800/50 backdrop-blur-sm p-3 rounded-lg';

    // 设备选择按钮
    const deviceButtons = Object.keys(this.devices).map(deviceKey => {
      const button = document.createElement('button');
      button.className = `px-4 py-2 bg-white text-gray-900 rounded-lg text-sm font-medium transition-colors ${deviceKey === this.currentDevice ? 'bg-primary text-white' : ''}`;
      button.textContent = this.devices[deviceKey].name;
      button.setAttribute('data-device', deviceKey);
      return button;
    });

    // 方向切换按钮
    const orientationButton = document.createElement('button');
    orientationButton.id = 'preview-orientation';
    orientationButton.className = 'px-4 py-2 bg-white text-gray-900 rounded-lg text-sm font-medium transition-colors';
    orientationButton.innerHTML = '<i class="fa fa-refresh mr-1"></i> 旋转';

    // 退出按钮
    this.elements.exitBtn = document.createElement('button');
    this.elements.exitBtn.id = 'preview-exit';
    this.elements.exitBtn.className = 'px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium transition-colors hover:bg-red-600';
    this.elements.exitBtn.innerHTML = '<i class="fa fa-times mr-1"></i> 退出预览';

    // 组装控制栏
    deviceButtons.forEach(button => this.elements.controls.appendChild(button));
    this.elements.controls.appendChild(orientationButton);
    this.elements.controls.appendChild(this.elements.exitBtn);

    this.elements.container.appendChild(this.elements.controls);
  }

  /**
     * 绑定事件
     */
  bindEvents() {
    // 预览按钮
    const previewToggle = document.getElementById('previewToggle');
    if (previewToggle) {
      previewToggle.addEventListener('click', () => {
        this.togglePreview();
      });
    }

    // 设备切换
    this.elements.container.addEventListener('click', e => {
      const deviceButton = e.target.closest('[data-device]');
      if (deviceButton) {
        const device = deviceButton.getAttribute('data-device');
        this.switchDevice(device);

        // 更新按钮状态
        document.querySelectorAll('[data-device]').forEach(btn => {
          btn.classList.remove('bg-primary', 'text-white');
          btn.classList.add('bg-white', 'text-gray-900');
        });
        deviceButton.classList.remove('bg-white', 'text-gray-900');
        deviceButton.classList.add('bg-primary', 'text-white');
      }
    });

    // 方向切换
    const orientationBtn = document.getElementById('preview-orientation');
    if (orientationBtn) {
      orientationBtn.addEventListener('click', () => {
        this.toggleOrientation();
      });
    }

    // 退出预览
    if (this.elements.exitBtn) {
      this.elements.exitBtn.addEventListener('click', () => {
        this.exitPreview();
      });
    }

    // 键盘快捷键
    document.addEventListener('keydown', e => {
      if (this.isActive) {
        if (e.key === 'Escape') {
          this.exitPreview();
        } else if (e.key === 'r' && e.ctrlKey) {
          e.preventDefault();
          this.toggleOrientation();
        }
      }
    });

    // 窗口大小变化
    window.addEventListener('resize', () => {
      if (this.isActive) {
        this.updatePreviewSize();
      }
    });
  }

  /**
     * 切换预览模式
     */
  togglePreview() {
    if (this.isActive) {
      this.exitPreview();
    } else {
      this.enterPreview();
    }
  }

  /**
     * 进入预览模式
     */
  enterPreview(device = 'ios') {
    this.isActive = true;
    this.currentDevice = device;

    // 准备预览内容
    this.preparePreviewContent();

    // 应用设备设置
    this.applyDeviceSettings();

    // 显示预览容器
    this.elements.container.style.display = 'flex';

    // 禁用背景滚动
    document.body.style.overflow = 'hidden';

    // 触发事件
    this.emitPreviewEvent('enter', { device, orientation: this.currentOrientation });

    this.logger.log(`📱 进入预览模式: ${this.devices[device].name}`);
  }

  /**
     * 退出预览模式
     */
  exitPreview() {
    if (!this.isActive) { return; }

    this.isActive = false;

    // 隐藏预览容器
    this.elements.container.style.display = 'none';

    // 启用背景滚动
    document.body.style.overflow = '';

    // 清理预览内容
    this.cleanupPreviewContent();

    // 触发事件
    this.emitPreviewEvent('exit', {});

    this.logger.log('📱 退出预览模式');
  }

  /**
     * 切换设备
     */
  switchDevice(device) {
    if (!this.devices[device]) {
      this.logger.warn(`Preview: 未知设备类型: ${device}`);
      return;
    }

    const previousDevice = this.currentDevice;
    this.currentDevice = device;

    // 应用设备设置
    this.applyDeviceSettings();

    // 更新预览内容
    this.updatePreviewContent();

    // 触发事件
    this.emitPreviewEvent('deviceChange', {
      from: previousDevice,
      to: device,
      orientation: this.currentOrientation,
    });

    this.logger.log(`📱 切换设备: ${this.devices[device].name}`);
  }

  /**
     * 切换方向
     */
  toggleOrientation() {
    this.currentOrientation = this.currentOrientation === 'portrait' ? 'landscape' : 'portrait';

    // 应用设备设置
    this.applyDeviceSettings();

    // 更新预览内容
    this.updatePreviewContent();

    // 触发事件
    this.emitPreviewEvent('orientationChange', {
      device: this.currentDevice,
      orientation: this.currentOrientation,
    });

    this.logger.log(`📱 切换方向: ${this.currentOrientation}`);
  }

  /**
     * 应用设备设置
     */
  applyDeviceSettings() {
    const device = this.devices[this.currentDevice];
    const size = device.sizes[this.currentOrientation];

    if (!size) { return; }

    // 更新屏幕样式
    this.elements.screen.style.width = `${size.width}px`;
    this.elements.screen.style.height = `${size.height}px`;
    this.elements.screen.style.borderRadius = device.borderRadius;

    // 更新设备样式
    this.elements.device.className = `relative bg-gray-900 rounded-3xl p-3 shadow-2xl transition-all duration-300 platform-${device.platform}`;

    // 更新缩放
    this.elements.content.style.transform = `scale(${size.scale})`;
    this.elements.content.style.transformOrigin = 'top center';

    // 更新平台样式
    this.applyPlatformStyles(device.platform);
  }

  /**
     * 应用平台样式
     */
  applyPlatformStyles(platform) {
    // 移除所有平台类
    this.elements.screen.classList.remove('platform-ios', 'platform-android', 'platform-web');

    // 添加当前平台类
    this.elements.screen.classList.add(`platform-${platform}`);

    // 根据平台调整样式
    if (platform === 'ios') {
      this.elements.screen.style.borderRadius = '28px';
    } else if (platform === 'android') {
      this.elements.screen.style.borderRadius = '24px';
    } else {
      this.elements.screen.style.borderRadius = '8px';
    }
  }

  /**
     * 准备预览内容
     */
  preparePreviewContent() {
    // 克隆应用内容
    const app = document.getElementById('app');
    if (app) {
      const appClone = app.cloneNode(true);

      // 移除预览按钮
      const previewBtn = appClone.querySelector('#previewToggle');
      if (previewBtn) {
        previewBtn.remove();
      }

      // 清空内容容器
      this.elements.content.innerHTML = '';
      this.elements.content.appendChild(appClone);

      // 重新初始化克隆的应用
      this.initializeClonedApp(appClone);
    }
  }

  /**
     * 初始化克隆的应用
     */
  initializeClonedApp(appClone) {
    // 重新绑定事件
    const navItems = appClone.querySelectorAll('.nav-item');
    navItems.forEach(item => {
      item.addEventListener('click', e => {
        e.preventDefault();
        const targetPage = item.getAttribute('data-page');
        if (targetPage) {
          // 在克隆的应用中切换页面
          const pages = appClone.querySelectorAll('.page');
          pages.forEach(page => {
            page.classList.toggle('hidden', page.id !== targetPage);
            page.classList.toggle('active', page.id === targetPage);
          });

          // 更新导航状态
          navItems.forEach(nav => nav.classList.remove('active', 'nav-item-active'));
          item.classList.add('active', 'nav-item-active');
        }
      });
    });

    // 绑定其他必要的事件
    this.bindClonedAppEvents(appClone);
  }

  /**
     * 绑定克隆应用的事件
     */
  bindClonedAppEvents(appClone) {
    // 阻止冒泡到预览容器的事件
    appClone.addEventListener('click', e => {
      e.stopPropagation();
    });

    // 绑定返回按钮
    appClone.querySelectorAll('[data-back]').forEach(btn => {
      btn.addEventListener('click', e => {
        e.preventDefault();
        e.stopPropagation();
        // 实现返回逻辑
      });
    });

    // 绑定其他交互元素
    appClone.querySelectorAll('button, a, input, select, textarea').forEach(el => {
      el.addEventListener('click', e => {
        e.stopPropagation();
      });
    });
  }

  /**
     * 更新预览内容
     */
  updatePreviewContent() {
    // 重新调整内容大小
    const device = this.devices[this.currentDevice];
    const size = device.sizes[this.currentOrientation];

    if (size) {
      this.elements.content.style.transform = `scale(${size.scale})`;
    }
  }

  /**
     * 清理预览内容
     */
  cleanupPreviewContent() {
    this.elements.content.innerHTML = '';
  }

  /**
     * 更新预览大小
     */
  updatePreviewSize() {
    if (!this.isActive) { return; }

    // 根据窗口大小调整预览缩放
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    const device = this.devices[this.currentDevice];
    const size = device.sizes[this.currentOrientation];

    if (!size) { return; }

    // 计算最大缩放比例
    const maxScaleX = (windowWidth - 100) / size.width;
    const maxScaleY = (windowHeight - 200) / size.height;
    const maxScale = Math.min(maxScaleX, maxScaleY, 1);

    // 应用新的缩放
    this.elements.content.style.transform = `scale(${maxScale})`;
  }

  /**
     * 获取预览状态
     */
  getPreviewState() {
    return {
      isActive: this.isActive,
      currentDevice: this.currentDevice,
      currentOrientation: this.currentOrientation,
      deviceInfo: this.devices[this.currentDevice],
    };
  }

  /**
     * 触发预览事件
     */
  emitPreviewEvent(event, data) {
    if (window.EventBus) {
      window.EventBus.emit(`preview:${event}`, {
        ...data,
        timestamp: Date.now(),
      });
    }
  }

  /**
     * 截图功能
     */
  takeScreenshot() {
    if (!this.isActive) {
      this.logger.warn('Preview: 未在预览模式中，无法截图');
      return null;
    }

    // 这里可以实现截图功能
    // 例如使用 html2canvas 等库
    this.logger.log('📸 截图功能（需要 html2canvas 库）');

    return {
      device: this.currentDevice,
      orientation: this.currentOrientation,
      timestamp: Date.now(),
    };
  }

  /**
     * 录制功能
     */
  startRecording() {
    if (!this.isActive) {
      this.logger.warn('Preview: 未在预览模式中，无法录制');
      return;
    }

    this.logger.log('🎬 开始录制（需要 MediaRecorder API）');
    // 这里可以实现录制功能
  }

  /**
     * 停止录制
     */
  stopRecording() {
    this.logger.log('⏹️ 停止录制');
    // 这里可以实现停止录制功能
  }
}

// 导出预览实例
const PreviewInstance = new Preview();
window.Preview = PreviewInstance;
