/**
 * 监控模块
 * 提供全面的应用性能和错误监控
 */
class Monitor {
  constructor() {
    this.logger = console;
    this.logs = [];
    this.maxLogs = 1000;
    this.isMonitoring = false;
  }

  /**
     * 初始化监控模块
     */
  initialize() {
    this.logger.log('📊 Monitor 模块初始化');
    this.startMonitoring();
    return Promise.resolve();
  }

  /**
     * 开始监控
     */
  startMonitoring() {
    if (this.isMonitoring) { return; }

    this.isMonitoring = true;

    // 监听错误
    this.listenErrors();

    // 监听性能指标
    this.listenPerformance();

    // 监听网络状态
    this.listenNetwork();

    // 监听用户行为
    this.listenUserActions();

    this.logger.log('🔍 监控已启动');
  }

  /**
     * 停止监控
     */
  stopMonitoring() {
    this.isMonitoring = false;

    // 移除所有监听器
    this.removeAllListeners();

    this.logger.log('⏹️ 监控已停止');
  }

  /**
     * 监听 JavaScript 错误
     */
  listenErrors() {
    // JS 运行时错误
    window.addEventListener('error', this.handleJSError.bind(this));

    // Promise 未捕获错误
    window.addEventListener('unhandledrejection', this.handlePromiseError.bind(this));

    // 资源加载错误
    window.addEventListener('error', this.handleResourceError.bind(this), true);
  }

  /**
     * 监听性能指标
     */
  listenPerformance() {
    // 页面加载完成后收集性能数据
    window.addEventListener('load', this.collectPerformanceData.bind(this));

    // 监听导航性能
    if ('performance' in window && 'navigation' in window.performance) {
      this.watchNavigationPerformance();
    }
  }

  /**
     * 监听网络状态
     */
  listenNetwork() {
    window.addEventListener('online', this.handleNetworkChange.bind(this));
    window.addEventListener('offline', this.handleNetworkChange.bind(this));

    // 监听网络质量变化（如果浏览器支持）
    if ('connection' in navigator) {
      navigator.connection.addEventListener('change', this.handleConnectionChange.bind(this));
    }
  }

  /**
     * 监听用户行为
     */
  listenUserActions() {
    // 点击事件
    document.addEventListener('click', this.handleUserClick.bind(this), true);

    // 页面可见性变化
    document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));

    // 页面卸载前保存数据
    window.addEventListener('beforeunload', this.handleBeforeUnload.bind(this));
  }

  /**
     * 处理 JavaScript 错误
     */
  handleJSError(event) {
    this.report({
      type: 'js_error',
      level: 'error',
      message: event.message,
      filename: event.filename,
      line: event.lineno,
      column: event.colno,
      stack: event.error?.stack,
      timestamp: Date.now(),
    });
  }

  /**
     * 处理 Promise 错误
     */
  handlePromiseError(event) {
    this.report({
      type: 'promise_error',
      level: 'error',
      reason: event.reason?.message || String(event.reason),
      stack: event.reason?.stack,
      timestamp: Date.now(),
    });
  }

  /**
     * 处理资源加载错误
     */
  handleResourceError(event) {
    if (event.target && (event.target.tagName === 'IMG' ||
                            event.target.tagName === 'SCRIPT' ||
                            event.target.tagName === 'LINK' ||
                            event.target.tagName === 'AUDIO' ||
                            event.target.tagName === 'VIDEO')) {
      this.report({
        type: 'resource_error',
        level: 'warning',
        resourceType: event.target.tagName.toLowerCase(),
        src: event.target.src || event.target.href,
        timestamp: Date.now(),
      });
    }
  }

  /**
     * 收集性能数据
     */
  collectPerformanceData() {
    if (!('performance' in window)) { return; }

    const timing = performance.timing;
    const navigation = performance.navigation;

    this.report({
      type: 'performance',
      level: 'info',
      metrics: {
        loadTime: timing.loadEventEnd - timing.navigationStart,
        domReady: timing.domContentLoadedEventEnd - timing.navigationStart,
        firstPaint: timing.responseStart - timing.navigationStart,
        networkTime: timing.responseEnd - timing.requestStart,
        domParseTime: timing.domComplete - timing.domLoading,
        redirectCount: navigation.redirectCount,
        type: navigation.type,
      },
      timestamp: Date.now(),
    });

    // 收集资源性能
    this.collectResourcePerformance();
  }

  /**
     * 收集资源性能数据
     */
  collectResourcePerformance() {
    if (!('getEntriesByType' in performance)) { return; }

    const resources = performance.getEntriesByType('resource');
    const resourceStats = {
      total: resources.length,
      byType: {},
      byDomain: {},
      slowResources: [],
    };

    resources.forEach(resource => {
      // 按类型统计
      const type = resource.initiatorType || 'other';
      resourceStats.byType[type] = (resourceStats.byType[type] || 0) + 1;

      // 按域名统计
      const domain = new URL(resource.name).hostname;
      resourceStats.byDomain[domain] = (resourceStats.byDomain[domain] || 0) + 1;

      // 记录慢资源（加载时间 > 1000ms）
      if (resource.duration > 1000) {
        resourceStats.slowResources.push({
          name: resource.name,
          duration: resource.duration,
          type: type,
        });
      }
    });

    this.report({
      type: 'resource_performance',
      level: 'info',
      stats: resourceStats,
      timestamp: Date.now(),
    });
  }

  /**
     * 监控导航性能
     */
  watchNavigationPerformance() {
    const observer = new PerformanceObserver(list => {
      list.getEntries().forEach(entry => {
        if (entry.entryType === 'navigation') {
          this.report({
            type: 'navigation_performance',
            level: 'info',
            entry: {
              type: entry.type,
              redirectCount: entry.redirectCount,
              loadEventTime: entry.loadEventTime,
              domContentLoadedEventTime: entry.domContentLoadedEventTime,
            },
            timestamp: Date.now(),
          });
        }
      });
    });

    observer.observe({ entryTypes: ['navigation'] });
  }

  /**
     * 处理网络状态变化
     */
  handleNetworkChange(event) {
    this.report({
      type: 'network_status',
      level: 'info',
      status: event.type === 'online' ? 'online' : 'offline',
      timestamp: Date.now(),
    });
  }

  /**
     * 处理网络连接变化
     */
  handleConnectionChange() {
    const connection = navigator.connection;
    this.report({
      type: 'connection_change',
      level: 'info',
      connection: {
        type: connection.type,
        effectiveType: connection.effectiveType,
        downlink: connection.downlink,
        rtt: connection.rtt,
        saveData: connection.saveData,
      },
      timestamp: Date.now(),
    });
  }

  /**
     * 处理用户点击
     */
  handleUserClick(event) {
    // 避免过多的点击事件
    if (Math.random() > 0.1) { return; } // 只记录10%的点击事件

    const target = event.target;
    const selector = this.getElementSelector(target);

    this.report({
      type: 'user_click',
      level: 'info',
      selector: selector,
      tagName: target.tagName,
      coordinates: {
        x: event.clientX,
        y: event.clientY,
      },
      timestamp: Date.now(),
    });
  }

  /**
     * 获取元素选择器
     */
  getElementSelector(element) {
    if (!element) { return ''; }

    let selector = element.tagName.toLowerCase();

    if (element.id) {
      selector += `#${element.id}`;
    } else if (element.className) {
      const classes = element.className.split(' ').filter(c => c);
      if (classes.length) {
        selector += `.${classes.join('.')}`;
      }
    }

    return selector;
  }

  /**
     * 处理页面可见性变化
     */
  handleVisibilityChange() {
    this.report({
      type: 'visibility_change',
      level: 'info',
      state: document.visibilityState,
      timestamp: Date.now(),
    });
  }

  /**
     * 处理页面卸载
     */
  handleBeforeUnload() {
    // 保存关键日志到 sessionStorage
    const criticalLogs = this.getCriticalLogs();
    if (criticalLogs.length > 0) {
      sessionStorage.setItem('mixmlaal_critical_logs', JSON.stringify(criticalLogs));
    }
  }

  /**
     * 报告日志
     */
  report(data) {
    // 添加通用字段
    data.appName = 'MIXMLAAL';
    data.version = '0.0.0.4';
    data.sessionId = this.getSessionId();

    // 保存日志
    this.logs.push(data);

    // 限制日志数量
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // 输出到控制台
    this.logToConsole(data);

    // 发送到服务器（如果配置了）
    this.sendToServer(data);

    // 触发事件
    if (window.EventBus) {
      window.EventBus.emit('monitor:log', data);
    }
  }

  /**
     * 获取会话 ID
     */
  getSessionId() {
    let sessionId = sessionStorage.getItem('mixmlaal_session_id');
    if (!sessionId) {
      sessionId = this.generateSessionId();
      sessionStorage.setItem('mixmlaal_session_id', sessionId);
    }
    return sessionId;
  }

  /**
     * 生成会话 ID
     */
  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
     * 输出到控制台
     */
  logToConsole(data) {
    const { type, level, message, ...rest } = data;

    switch (level) {
      case 'error':
        this.logger.error(`[🚨 ${type}]`, message, rest);
        break;
      case 'warning':
        this.logger.warn(`[⚠️ ${type}]`, message, rest);
        break;
      case 'info':
        this.logger.info(`[ℹ️ ${type}]`, message, rest);
        break;
      default:
        this.logger.log(`[📝 ${type}]`, message, rest);
    }
  }

  /**
     * 发送到服务器
     */
  sendToServer(data) {
    // 这里可以实现实际的服务器上报逻辑
    // 例如使用 fetch 或 XMLHttpRequest 发送数据
    if (data.level === 'error' || data.level === 'warning') {
      // 模拟上报
      setTimeout(() => {
        console.log('📤 日志已上报到服务器:', data.type);
      }, 0);
    }
  }

  /**
     * 获取关键日志
     */
  getCriticalLogs() {
    return this.logs.filter(log =>
      log.level === 'error' ||
            log.level === 'warning' ||
            log.type === 'performance',
    );
  }

  /**
     * 获取所有日志
     */
  getAllLogs() {
    return [...this.logs];
  }

  /**
     * 按类型获取日志
     */
  getLogsByType(type) {
    return this.logs.filter(log => log.type === type);
  }

  /**
     * 按级别获取日志
     */
  getLogsByLevel(level) {
    return this.logs.filter(log => log.level === level);
  }

  /**
     * 清空日志
     */
  clearLogs() {
    this.logs = [];
  }

  /**
     * 移除所有监听器
     */
  removeAllListeners() {
    // 这里应该移除所有添加的事件监听器
    // 由于 JavaScript 的限制，需要保存监听器引用才能正确移除
  }

  /**
     * 手动记录日志
     */
  log(message, level = 'info', data = {}) {
    this.report({
      type: 'manual_log',
      level: level,
      message: message,
      ...data,
      timestamp: Date.now(),
    });
  }

  /**
     * 记录错误
     */
  error(message, error = null, data = {}) {
    this.report({
      type: 'manual_error',
      level: 'error',
      message: message,
      error: error?.message,
      stack: error?.stack,
      ...data,
      timestamp: Date.now(),
    });
  }

  /**
     * 记录警告
     */
  warn(message, data = {}) {
    this.report({
      type: 'manual_warning',
      level: 'warning',
      message: message,
      ...data,
      timestamp: Date.now(),
    });
  }

  /**
     * 记录信息
     */
  info(message, data = {}) {
    this.report({
      type: 'manual_info',
      level: 'info',
      message: message,
      ...data,
      timestamp: Date.now(),
    });
  }
}

// 导出监控实例
const MonitorInstance = new Monitor();
window.Monitor = MonitorInstance;
