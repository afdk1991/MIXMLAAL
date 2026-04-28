// MIXMLAAL 应用主入口文件
// 加载所有模块并初始化应用

// 模块加载器
class ModuleLoader {
  constructor() {
    this.modules = [];
    this.loadedModules = new Map();
  }

  /**
     * 加载模块
     */
  async loadModules() {
    const moduleList = [
      { name: 'event-bus', path: 'modules/event-bus.js' },
      { name: 'storage', path: 'modules/storage.js' },
      { name: 'monitor', path: 'modules/monitor.js' },
      { name: 'network', path: 'modules/network.js' },
      { name: 'theme', path: 'modules/theme.js' },
      { name: 'router', path: 'modules/router.js' },
      { name: 'preview', path: 'modules/preview.js' },
      { name: 'notification', path: 'modules/notification.js' },
      { name: 'performance', path: 'modules/performance.js' },
      { name: 'platform', path: 'modules/platform.js' },
      { name: 'state', path: 'modules/state.js' },
      { name: 'utils', path: 'modules/utils.js' },
    ];

    const loadPromises = moduleList.map(async moduleInfo => {
      try {
        const script = document.createElement('script');
        script.src = `assets/js/${moduleInfo.path}`;
        script.type = 'text/javascript';

        const loadPromise = new Promise((resolve, reject) => {
          script.onload = () => {
            console.log(`✅ 模块加载完成: ${moduleInfo.name}`);
            resolve(moduleInfo);
          };
          script.onerror = error => {
            console.error(`❌ 模块加载失败: ${moduleInfo.name}`, error);
            reject(error);
          };
        });

        document.head.appendChild(script);
        return await loadPromise;
      } catch (error) {
        console.error(`❌ 加载模块 ${moduleInfo.name} 时出错:`, error);
        throw error;
      }
    });

    try {
      const loaded = await Promise.allSettled(loadPromises);
      const successful = loaded.filter(result => result.status === 'fulfilled');

      console.log(`📦 模块加载完成: ${successful.length}/${moduleList.length}`);

      if (successful.length === 0) {
        throw new Error('所有模块加载失败');
      }

      return successful.length;
    } catch (error) {
      console.error('❌ 模块加载过程中发生错误:', error);
      throw error;
    }
  }
}

// 应用启动器
class AppBootstrap {
  constructor() {
    this.moduleLoader = new ModuleLoader();
    this.isBootstrapping = false;
  }

  /**
     * 启动应用
     */
  async bootstrap() {
    if (this.isBootstrapping) {
      console.warn('🚀 应用正在启动中...');
      return;
    }

    this.isBootstrapping = true;

    try {
      console.log('🚀 MIXMLAAL 应用启动中...');

      // 1. 加载模块
      await this.loadModules();

      // 2. 等待 DOM 准备就绪
      await this.waitForDOMReady();

      // 3. 初始化应用
      await this.initializeApp();

      // 4. 启动完成
      this.onBootstrapComplete();
    } catch (error) {
      console.error('❌ 应用启动失败:', error);
      this.handleBootstrapError(error);
    } finally {
      this.isBootstrapping = false;
    }
  }

  /**
     * 加载模块
     */
  async loadModules() {
    console.log('📦 开始加载应用模块...');
    await this.moduleLoader.loadModules();
  }

  /**
     * 等待 DOM 准备就绪
     */
  waitForDOMReady() {
    return new Promise(resolve => {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', resolve);
      } else {
        resolve();
      }
    });
  }

  /**
     * 初始化应用
     */
  async initializeApp() {
    console.log('🔧 开始初始化应用...');

    // 检查核心模块是否可用
    if (!window.MIXMLAALApp) {
      throw new Error('核心应用类 MIXMLAALApp 未找到');
    }

    // 创建应用实例
    const app = new window.MIXMLAALApp();

    // 初始化应用
    await app.initialize();

    // 保存到全局
    window.mixmlaal = app;
  }

  /**
     * 启动完成处理
     */
  onBootstrapComplete() {
    console.log('🎉 MIXMLAAL 应用启动成功！');

    // 显示启动成功通知
    if (window.Notification) {
      window.Notification.success('应用启动成功', {
        title: 'MIXMLAAL',
        duration: 3000,
      });
    }

    // 触发启动完成事件
    if (window.EventBus) {
      window.EventBus.emit('app:bootstrap:complete', {
        timestamp: Date.now(),
      });
    }
  }

  /**
     * 处理启动错误
     */
  handleBootstrapError(error) {
    // 显示错误信息
    const errorMessage = document.createElement('div');
    errorMessage.className = 'fixed inset-0 bg-red-50 flex items-center justify-center p-4 z-50';
    errorMessage.innerHTML = `
            <div class="bg-white rounded-lg shadow-lg p-6 max-w-md text-center">
                <div class="text-red-500 text-4xl mb-4">❌</div>
                <h2 class="text-xl font-bold text-gray-900 mb-2">应用启动失败</h2>
                <p class="text-gray-600 mb-4">${error.message}</p>
                <button onclick="window.location.reload()" class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors">
                    重新加载
                </button>
            </div>
        `;
    document.body.appendChild(errorMessage);
  }
}

// 自动启动应用
const bootstrap = new AppBootstrap();

// 检查是否在页面底部加载
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => bootstrap.bootstrap());
} else {
  // 如果 DOM 已经准备就绪，立即启动
  bootstrap.bootstrap();
}

// 导出启动器
window.AppBootstrap = AppBootstrap;
