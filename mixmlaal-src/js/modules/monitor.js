// 性能监控模块
export const Monitor = {
  logs: [],
  init() {
    this.listenErrors();
    this.listenPerformance();
    this.listenNetwork();
  },
  listenErrors() {
    // JS错误
    window.addEventListener('error', e => {
      this.report({
        type: 'js_error',
        message: e.message,
        filename: e.filename,
        line: e.lineno,
        column: e.colno,
      });
    });
    // Promise错误
    window.addEventListener('unhandledrejection', e => {
      this.report({
        type: 'promise_error',
        reason: e.reason?.message || String(e.reason),
      });
    });
  },
  listenPerformance() {
    window.addEventListener('load', () => {
      const timing = performance.timing;
      this.report({
        type: 'performance',
        loadTime: timing.loadEventEnd - timing.navigationStart,
        domReady: timing.domContentLoadedEventEnd - timing.navigationStart,
        network: timing.responseEnd - timing.requestStart,
      });
    });
  },
  listenNetwork() {
    window.addEventListener('online', () => {
      this.report({ type: 'network', status: 'online' });
    });
    window.addEventListener('offline', () => {
      this.report({ type: 'network', status: 'offline' });
    });
  },
  report(data) {
    data.timestamp = new Date().toISOString();
    this.logs.push(data);
    console.log('[📊 监控上报]', data);
    // 可以在这里添加实际的上报逻辑
  },
};
