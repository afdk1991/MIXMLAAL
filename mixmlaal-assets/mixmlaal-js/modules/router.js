/**
 * 路由管理模块
 * 提供页面导航和路由控制
 */
class Router {
  constructor() {
    this.logger = console;
    this.currentPage = 'portalPage';
    this.pageStack = [];
    this.maxStackSize = 10;
    this.isTransitioning = false;
    this.transitionDuration = 300;

    // 页面标题映射
    this.pageTitles = {
      portalPage: 'MIXMLAAL平台',
      socialPage: '社区',
      ecommercePage: '商城',
      platformPage: '开放平台',
      travelPage: '出行服务',
      profilePage: '我的',
      documentPage: '开发文档',
      settingsPage: '设置',
      aboutPage: '关于我们',
    };

    // 页面配置
    this.pageConfig = {
      portalPage: { requiresAuth: false, showHeader: true, showNav: true },
      socialPage: { requiresAuth: true, showHeader: true, showNav: true },
      ecommercePage: { requiresAuth: false, showHeader: true, showNav: true },
      platformPage: { requiresAuth: false, showHeader: true, showNav: true },
      travelPage: { requiresAuth: false, showHeader: true, showNav: true },
      profilePage: { requiresAuth: true, showHeader: true, showNav: true },
      documentPage: { requiresAuth: false, showHeader: true, showNav: true },
      settingsPage: { requiresAuth: false, showHeader: true, showNav: false },
      aboutPage: { requiresAuth: false, showHeader: true, showNav: false },
    };
  }

  /**
     * 初始化路由模块
     */
  initialize() {
    this.logger.log('🗺️ Router 模块初始化');
    this.bindNavigationEvents();
    this.setupHistoryManagement();
    this.initializeFirstPage();
    return Promise.resolve();
  }

  /**
     * 绑定导航事件
     */
  bindNavigationEvents() {
    // 绑定底部导航
    this.bindBottomNavigation();

    // 绑定页面内导航按钮
    this.bindPageNavigation();

    // 绑定返回按钮
    this.bindBackButton();

    // 绑定浏览器后退/前进
    this.bindBrowserNavigation();
  }

  /**
     * 绑定底部导航
     */
  bindBottomNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const navIndicator = document.querySelector('.nav-indicator');

    navItems.forEach((item, index) => {
      item.addEventListener('click', e => {
        e.preventDefault();
        const targetPage = item.getAttribute('data-page');
        if (targetPage) {
          this.navigateTo(targetPage, { fromNav: true });

          // 更新导航状态
          this.updateNavigationState(item, index);
        }
      });
    });
  }

  /**
     * 绑定页面内导航按钮
     */
  bindPageNavigation() {
    document.addEventListener('click', e => {
      const target = e.target.closest('[data-page]');
      if (target) {
        e.preventDefault();
        const targetPage = target.getAttribute('data-page');
        const options = this.parseNavigationOptions(target);
        this.navigateTo(targetPage, options);
      }
    });
  }

  /**
     * 绑定返回按钮
     */
  bindBackButton() {
    document.addEventListener('click', e => {
      if (e.target.closest('[data-back]')) {
        e.preventDefault();
        this.goBack();
      }
    });
  }

  /**
     * 绑定浏览器导航
     */
  bindBrowserNavigation() {
    window.addEventListener('popstate', e => {
      if (e.state && e.state.page) {
        this.navigateTo(e.state.page, { replace: true, fromHistory: true });
      }
    });
  }

  /**
     * 解析导航选项
     */
  parseNavigationOptions(element) {
    const options = {};

    if (element.hasAttribute('data-replace')) {
      options.replace = true;
    }

    if (element.hasAttribute('data-no-animation')) {
      options.noAnimation = true;
    }

    if (element.hasAttribute('data-no-history')) {
      options.noHistory = true;
    }

    return options;
  }

  /**
     * 设置历史管理
     */
  setupHistoryManagement() {
    // 初始化历史状态
    if (!window.history.state) {
      window.history.replaceState({ page: this.currentPage }, '', '');
    }
  }

  /**
     * 初始化首页
     */
  initializeFirstPage() {
    const firstPage = this.currentPage;
    this.showPage(firstPage, { noAnimation: true, noHistory: true });
    this.updatePageTitle(firstPage);
  }

  /**
     * 导航到指定页面
     */
  async navigateTo(pageId, options = {}) {
    // 检查是否正在过渡
    if (this.isTransitioning) {
      this.logger.warn('Router: 正在进行页面过渡，请等待完成');
      return;
    }

    // 检查页面是否存在
    const targetPage = document.getElementById(pageId);
    if (!targetPage) {
      this.logger.error(`Router: 页面不存在: ${pageId}`);
      return;
    }

    // 检查权限
    if (!this.checkPagePermission(pageId)) {
      this.logger.warn(`Router: 无权限访问页面: ${pageId}`);
      this.handleUnauthorizedAccess();
      return;
    }

    // 触发页面离开事件
    const canLeave = this.triggerPageEvent(this.currentPage, 'beforeLeave');
    if (!canLeave) {
      this.logger.warn('Router: 页面阻止了导航');
      return;
    }

    // 显示加载状态
    if (!options.noAnimation) {
      this.showLoading(pageId);
    }

    try {
      // 等待页面准备
      await this.preparePage(pageId);

      // 执行导航
      this.performNavigation(pageId, options);
    } catch (error) {
      this.logger.error('Router: 导航失败:', error);
      this.hideLoading();
    }
  }

  /**
     * 执行导航
     */
  performNavigation(pageId, options = {}) {
    this.isTransitioning = true;

    const currentPageEl = document.getElementById(this.currentPage);
    const targetPageEl = document.getElementById(pageId);

    if (!currentPageEl || !targetPageEl) {
      this.isTransitioning = false;
      return;
    }

    // 更新历史记录
    if (!options.noHistory) {
      this.updateHistory(pageId, options.replace);
    }

    // 更新页面栈
    this.updatePageStack(pageId, options.replace);

    // 执行页面过渡
    this.executePageTransition(currentPageEl, targetPageEl, options.noAnimation).then(() => {
      // 更新当前页面
      const previousPage = this.currentPage;
      this.currentPage = pageId;

      // 更新页面标题
      this.updatePageTitle(pageId);

      // 更新页面配置
      this.updatePageConfig(pageId);

      // 触发页面事件
      this.triggerPageEvent(previousPage, 'afterLeave');
      this.triggerPageEvent(pageId, 'afterEnter');

      // 完成过渡
      this.isTransitioning = false;

      // 触发导航完成事件
      this.emitNavigationEvent(pageId, previousPage);
    });
  }

  /**
     * 执行页面过渡动画
     */
  executePageTransition(fromPage, toPage, noAnimation = false) {
    return new Promise(resolve => {
      if (noAnimation) {
        fromPage.classList.add('hidden');
        toPage.classList.remove('hidden');
        toPage.classList.add('active');
        resolve();
        return;
      }

      // 添加过渡类
      fromPage.classList.add('page-exit');
      toPage.classList.remove('hidden');
      toPage.classList.add('page-enter');

      // 等待过渡完成
      setTimeout(() => {
        fromPage.classList.add('page-exit-active');
        toPage.classList.add('page-enter-active');

        setTimeout(() => {
          // 清理类名
          fromPage.classList.remove('active', 'page-exit', 'page-exit-active');
          fromPage.classList.add('hidden');

          toPage.classList.remove('page-enter', 'page-enter-active');
          toPage.classList.add('active');

          resolve();
        }, this.transitionDuration);
      }, 10);
    });
  }

  /**
     * 显示页面
     */
  showPage(pageId, options = {}) {
    const pages = document.querySelectorAll('.page');
    const targetPage = document.getElementById(pageId);

    if (!targetPage) {
      this.logger.error(`Router: 显示页面失败，页面不存在: ${pageId}`);
      return;
    }

    pages.forEach(page => {
      if (page.id === pageId) {
        page.classList.remove('hidden');
        page.classList.add('active');
      } else {
        page.classList.add('hidden');
        page.classList.remove('active');
      }
    });

    this.currentPage = pageId;
    this.updatePageTitle(pageId);
    this.updatePageConfig(pageId);

    if (!options.noHistory) {
      this.updateHistory(pageId, options.replace);
    }
  }

  /**
     * 返回上一页
     */
  goBack() {
    if (this.pageStack.length <= 1) {
      this.logger.warn('Router: 已经是第一页');
      return;
    }

    // 移除当前页面
    this.pageStack.pop();

    // 获取上一页
    const previousPage = this.pageStack[this.pageStack.length - 1];

    if (previousPage) {
      this.navigateTo(previousPage, { replace: true, fromBack: true });
    }
  }

  /**
     * 刷新当前页面
     */
  refreshCurrentPage() {
    this.triggerPageEvent(this.currentPage, 'refresh');
  }

  /**
     * 检查页面权限
     */
  checkPagePermission(pageId) {
    const config = this.pageConfig[pageId];
    if (!config) { return true; }

    if (config.requiresAuth) {
      // 检查认证状态
      if (window.Storage) {
        const token = window.Storage.get('auth_token');
        return !!token;
      }
      return false;
    }

    return true;
  }

  /**
     * 处理未授权访问
     */
  handleUnauthorizedAccess() {
    // 可以重定向到登录页面
    this.logger.warn('Router: 用户未登录，重定向到登录页面');

    // 触发未授权事件
    if (window.EventBus) {
      window.EventBus.emit('auth:required');
    }
  }

  /**
     * 准备页面
     */
  async preparePage(pageId) {
    // 触发页面准备事件
    const preparePromise = this.triggerPageEvent(pageId, 'beforeEnter');

    // 如果返回 Promise，等待完成
    if (preparePromise && typeof preparePromise.then === 'function') {
      await preparePromise;
    }
  }

  /**
     * 触发页面事件
     */
  triggerPageEvent(pageId, eventName) {
    const page = document.getElementById(pageId);
    if (!page) { return true; }

    // 触发自定义事件
    const event = new CustomEvent(`page:${eventName}`, {
      detail: { pageId: pageId },
      cancelable: true,
    });

    const result = page.dispatchEvent(event);

    // 触发全局事件
    if (window.EventBus) {
      window.EventBus.emit(`router:page:${eventName}`, {
        pageId: pageId,
        timestamp: Date.now(),
      });
    }

    return result;
  }

  /**
     * 更新历史记录
     */
  updateHistory(pageId, replace = false) {
    const state = { page: pageId, timestamp: Date.now() };

    if (replace) {
      window.history.replaceState(state, '', '');
    } else {
      window.history.pushState(state, '', '');
    }
  }

  /**
     * 更新页面栈
     */
  updatePageStack(pageId, replace = false) {
    if (replace) {
      // 替换当前页面
      if (this.pageStack.length > 0) {
        this.pageStack[this.pageStack.length - 1] = pageId;
      } else {
        this.pageStack.push(pageId);
      }
    } else {
      // 添加新页面
      this.pageStack.push(pageId);

      // 限制栈大小
      if (this.pageStack.length > this.maxStackSize) {
        this.pageStack.shift();
      }
    }
  }

  /**
     * 更新页面标题
     */
  updatePageTitle(pageId) {
    const title = this.pageTitles[pageId] || 'MIXMLAAL';
    const titleElement = document.getElementById('pageTitle');

    if (titleElement) {
      titleElement.textContent = title;
    }

    // 更新文档标题
    document.title = `${title} - MIXMLAAL`;
  }

  /**
     * 更新页面配置
     */
  updatePageConfig(pageId) {
    const config = this.pageConfig[pageId];
    if (!config) { return; }

    // 更新头部显示
    const header = document.querySelector('header');
    if (header) {
      if (config.showHeader) {
        header.classList.remove('hidden');
      } else {
        header.classList.add('hidden');
      }
    }

    // 更新导航显示
    const nav = document.querySelector('nav');
    if (nav) {
      if (config.showNav) {
        nav.classList.remove('hidden');
      } else {
        nav.classList.add('hidden');
      }
    }
  }

  /**
     * 更新导航状态
     */
  updateNavigationState(activeItem, index) {
    // 更新导航项状态
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.remove('active', 'nav-item-active');
    });

    if (activeItem) {
      activeItem.classList.add('active', 'nav-item-active');
    }

    // 更新指示器位置
    const navIndicator = document.querySelector('.nav-indicator');
    if (navIndicator) {
      const indicatorWidth = 100 / document.querySelectorAll('.nav-item').length;
      navIndicator.style.transform = `translateX(${index * indicatorWidth}%)`;
    }
  }

  /**
     * 显示加载状态
     */
  showLoading(pageId) {
    // 这里可以显示骨架屏或加载指示器
    this.logger.log(`Router: 加载页面中: ${pageId}`);
  }

  /**
     * 隐藏加载状态
     */
  hideLoading() {
    // 这里可以隐藏骨架屏或加载指示器
  }

  /**
     * 触发导航事件
     */
  emitNavigationEvent(pageId, previousPage) {
    if (window.EventBus) {
      window.EventBus.emit('router:navigated', {
        from: previousPage,
        to: pageId,
        timestamp: Date.now(),
      });
    }
  }

  /**
     * 获取当前页面
     */
  getCurrentPage() {
    return this.currentPage;
  }

  /**
     * 获取页面栈
     */
  getPageStack() {
    return [...this.pageStack];
  }

  /**
     * 获取页面配置
     */
  getPageConfig(pageId) {
    return this.pageConfig[pageId] || {};
  }

  /**
     * 注册页面配置
     */
  registerPage(pageId, config) {
    this.pageConfig[pageId] = {
      requiresAuth: false,
      showHeader: true,
      showNav: true,
      ...config,
    };
  }

  /**
     * 设置页面标题
     */
  setPageTitle(pageId, title) {
    this.pageTitles[pageId] = title;
    if (pageId === this.currentPage) {
      this.updatePageTitle(pageId);
    }
  }
}

// 导出路由实例
const RouterInstance = new Router();
window.Router = RouterInstance;
