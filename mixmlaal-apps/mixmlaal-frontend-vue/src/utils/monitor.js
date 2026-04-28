/**
 * 监控与线上保障工具
 * 版本: v1.0.0.0
 * 说明: 实现接口请求监控、页面性能监控、用户行为埋点等功能
 */

// 监控配置
const monitorConfig = {
  // 是否启用监控
  enabled: true,
  // 采样率
  sampleRate: 1,
  // 上报地址
  reportUrl: '/api/v1/monitor/report',
  // 批量上报间隔（毫秒）
  batchInterval: 5000,
  // 最大批量上报数量
  maxBatchSize: 100
};

// 监控数据缓存
const monitorCache = {
  api: [],
  performance: [],
  behavior: [],
  error: []
};

// 批量上报定时器
let batchTimer = null;

// 工具函数
const utils = {
  // 生成唯一ID
  generateId: () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  },
  
  // 获取设备信息
  getDeviceInfo: () => {
    return {
      userAgent: navigator.userAgent,
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      devicePixelRatio: window.devicePixelRatio,
      language: navigator.language,
      platform: navigator.platform
    };
  },
  
  // 获取网络信息
  getNetworkInfo: () => {
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    return {
      type: connection?.type || 'unknown',
      effectiveType: connection?.effectiveType || 'unknown',
      downlink: connection?.downlink || 0,
      rtt: connection?.rtt || 0,
      saveData: connection?.saveData || false
    };
  },
  
  // 获取页面信息
  getPageInfo: () => {
    return {
      url: window.location.href,
      path: window.location.pathname,
      referrer: document.referrer,
      title: document.title
    };
  },
  
  // 节流函数
  throttle: (fn, delay) => {
    let lastCall = 0;
    return function(...args) {
      const now = Date.now();
      if (now - lastCall >= delay) {
        lastCall = now;
        return fn.apply(this, args);
      }
    };
  },
  
  // 防抖函数
  debounce: (fn, delay) => {
    let timer = null;
    return function(...args) {
      clearTimeout(timer);
      timer = setTimeout(() => {
        fn.apply(this, args);
      }, delay);
    };
  }
};

// 接口请求监控
const apiMonitor = {
  // 开始监控
  start: () => {
    if (!monitorConfig.enabled) return;
    
    // 重写fetch
    if (window.fetch) {
      const originalFetch = window.fetch;
      window.fetch = function(...args) {
        const startTime = Date.now();
        const url = args[0];
        const options = args[1] || {};
        
        return originalFetch(...args)
          .then(response => {
            const endTime = Date.now();
            const duration = endTime - startTime;
            
            apiMonitor.report({
              url: typeof url === 'string' ? url : url.toString(),
              method: options.method || 'GET',
              status: response.status,
              duration,
              startTime,
              endTime
            });
            
            return response;
          })
          .catch(error => {
            const endTime = Date.now();
            const duration = endTime - startTime;
            
            apiMonitor.report({
              url: typeof url === 'string' ? url : url.toString(),
              method: options.method || 'GET',
              status: 0,
              duration,
              startTime,
              endTime,
              error: error.message
            });
            
            throw error;
          });
      };
    }
    
    // 重写XMLHttpRequest
    if (window.XMLHttpRequest) {
      const originalOpen = XMLHttpRequest.prototype.open;
      const originalSend = XMLHttpRequest.prototype.send;
      
      XMLHttpRequest.prototype.open = function(method, url) {
        this._monitor = {
          method,
          url,
          startTime: Date.now()
        };
        return originalOpen.apply(this, arguments);
      };
      
      XMLHttpRequest.prototype.send = function() {
        const xhr = this;
        const originalOnLoad = xhr.onload;
        const originalOnError = xhr.onerror;
        
        xhr.onload = function() {
          const endTime = Date.now();
          const duration = endTime - xhr._monitor.startTime;
          
          apiMonitor.report({
            url: xhr._monitor.url,
            method: xhr._monitor.method,
            status: xhr.status,
            duration,
            startTime: xhr._monitor.startTime,
            endTime
          });
          
          if (originalOnLoad) {
            originalOnLoad.apply(xhr, arguments);
          }
        };
        
        xhr.onerror = function() {
          const endTime = Date.now();
          const duration = endTime - xhr._monitor.startTime;
          
          apiMonitor.report({
            url: xhr._monitor.url,
            method: xhr._monitor.method,
            status: 0,
            duration,
            startTime: xhr._monitor.startTime,
            endTime,
            error: 'Network error'
          });
          
          if (originalOnError) {
            originalOnError.apply(xhr, arguments);
          }
        };
        
        return originalSend.apply(this, arguments);
      };
    }
  },
  
  // 上报接口请求数据
  report: (data) => {
    if (!monitorConfig.enabled) return;
    
    // 采样
    if (Math.random() > monitorConfig.sampleRate) return;
    
    const reportData = {
      type: 'api',
      timestamp: Date.now(),
      device: utils.getDeviceInfo(),
      network: utils.getNetworkInfo(),
      page: utils.getPageInfo(),
      data
    };
    
    monitorCache.api.push(reportData);
    monitor.flush();
  }
};

// 页面性能监控
const performanceMonitor = {
  // 开始监控
  start: () => {
    if (!monitorConfig.enabled) return;
    
    // 监听页面加载完成
    window.addEventListener('load', performanceMonitor.reportPageLoad);
    
    // 监听页面可见性变化
    document.addEventListener('visibilitychange', performanceMonitor.reportVisibilityChange);
    
    // 监听页面跳转
    window.addEventListener('beforeunload', performanceMonitor.reportPageUnload);
  },
  
  // 上报页面加载性能
  reportPageLoad: () => {
    if (!monitorConfig.enabled) return;
    
    // 采样
    if (Math.random() > monitorConfig.sampleRate) return;
    
    const performance = window.performance;
    if (!performance || !performance.timing) return;
    
    const timing = performance.timing;
    const reportData = {
      type: 'performance',
      timestamp: Date.now(),
      device: utils.getDeviceInfo(),
      network: utils.getNetworkInfo(),
      page: utils.getPageInfo(),
      data: {
        navigationStart: timing.navigationStart,
        unloadEventStart: timing.unloadEventStart,
        unloadEventEnd: timing.unloadEventEnd,
        redirectStart: timing.redirectStart,
        redirectEnd: timing.redirectEnd,
        fetchStart: timing.fetchStart,
        domainLookupStart: timing.domainLookupStart,
        domainLookupEnd: timing.domainLookupEnd,
        connectStart: timing.connectStart,
        connectEnd: timing.connectEnd,
        secureConnectionStart: timing.secureConnectionStart,
        requestStart: timing.requestStart,
        responseStart: timing.responseStart,
        responseEnd: timing.responseEnd,
        domLoading: timing.domLoading,
        domInteractive: timing.domInteractive,
        domContentLoadedEventStart: timing.domContentLoadedEventStart,
        domContentLoadedEventEnd: timing.domContentLoadedEventEnd,
        domComplete: timing.domComplete,
        loadEventStart: timing.loadEventStart,
        loadEventEnd: timing.loadEventEnd,
        // 计算各阶段耗时
        redirectTime: timing.redirectEnd - timing.redirectStart,
        lookupTime: timing.domainLookupEnd - timing.domainLookupStart,
        connectTime: timing.connectEnd - timing.connectStart,
        requestTime: timing.responseEnd - timing.requestStart,
        responseTime: timing.responseEnd - timing.responseStart,
        domTime: timing.domComplete - timing.domLoading,
        loadTime: timing.loadEventEnd - timing.navigationStart
      }
    };
    
    monitorCache.performance.push(reportData);
    monitor.flush();
  },
  
  // 上报页面可见性变化
  reportVisibilityChange: () => {
    if (!monitorConfig.enabled) return;
    
    // 采样
    if (Math.random() > monitorConfig.sampleRate) return;
    
    const reportData = {
      type: 'performance',
      timestamp: Date.now(),
      device: utils.getDeviceInfo(),
      network: utils.getNetworkInfo(),
      page: utils.getPageInfo(),
      data: {
        visibilityState: document.visibilityState,
        timestamp: Date.now()
      }
    };
    
    monitorCache.performance.push(reportData);
    monitor.flush();
  },
  
  // 上报页面卸载
  reportPageUnload: () => {
    if (!monitorConfig.enabled) return;
    
    // 采样
    if (Math.random() > monitorConfig.sampleRate) return;
    
    const reportData = {
      type: 'performance',
      timestamp: Date.now(),
      device: utils.getDeviceInfo(),
      network: utils.getNetworkInfo(),
      page: utils.getPageInfo(),
      data: {
        event: 'unload',
        timestamp: Date.now()
      }
    };
    
    // 立即上报
    monitor.report([reportData]);
  }
};

// 用户行为埋点
const behaviorMonitor = {
  // 开始监控
  start: () => {
    if (!monitorConfig.enabled) return;
    
    // 监听点击事件
    document.addEventListener('click', behaviorMonitor.reportClick);
    
    // 监听滚动事件
    window.addEventListener('scroll', utils.throttle(behaviorMonitor.reportScroll, 1000));
    
    // 监听输入事件
    document.addEventListener('input', utils.debounce(behaviorMonitor.reportInput, 500));
  },
  
  // 上报点击事件
  reportClick: (event) => {
    if (!monitorConfig.enabled) return;
    
    // 采样
    if (Math.random() > monitorConfig.sampleRate) return;
    
    const target = event.target;
    const reportData = {
      type: 'behavior',
      timestamp: Date.now(),
      device: utils.getDeviceInfo(),
      network: utils.getNetworkInfo(),
      page: utils.getPageInfo(),
      data: {
        event: 'click',
        target: target.tagName,
        className: target.className,
        id: target.id,
        text: target.textContent?.trim() || '',
        x: event.clientX,
        y: event.clientY
      }
    };
    
    monitorCache.behavior.push(reportData);
    monitor.flush();
  },
  
  // 上报滚动事件
  reportScroll: () => {
    if (!monitorConfig.enabled) return;
    
    // 采样
    if (Math.random() > monitorConfig.sampleRate) return;
    
    const reportData = {
      type: 'behavior',
      timestamp: Date.now(),
      device: utils.getDeviceInfo(),
      network: utils.getNetworkInfo(),
      page: utils.getPageInfo(),
      data: {
        event: 'scroll',
        scrollTop: window.scrollY,
        scrollLeft: window.scrollX,
        windowHeight: window.innerHeight,
        windowWidth: window.innerWidth,
        documentHeight: document.documentElement.scrollHeight,
        documentWidth: document.documentElement.scrollWidth
      }
    };
    
    monitorCache.behavior.push(reportData);
    monitor.flush();
  },
  
  // 上报输入事件
  reportInput: (event) => {
    if (!monitorConfig.enabled) return;
    
    // 采样
    if (Math.random() > monitorConfig.sampleRate) return;
    
    const target = event.target;
    const reportData = {
      type: 'behavior',
      timestamp: Date.now(),
      device: utils.getDeviceInfo(),
      network: utils.getNetworkInfo(),
      page: utils.getPageInfo(),
      data: {
        event: 'input',
        target: target.tagName,
        className: target.className,
        id: target.id,
        name: target.name,
        type: target.type,
        value: target.value?.length > 100 ? target.value.substring(0, 100) + '...' : target.value
      }
    };
    
    monitorCache.behavior.push(reportData);
    monitor.flush();
  },
  
  // 手动上报行为
  track: (eventName, data = {}) => {
    if (!monitorConfig.enabled) return;
    
    // 采样
    if (Math.random() > monitorConfig.sampleRate) return;
    
    const reportData = {
      type: 'behavior',
      timestamp: Date.now(),
      device: utils.getDeviceInfo(),
      network: utils.getNetworkInfo(),
      page: utils.getPageInfo(),
      data: {
        event: eventName,
        ...data
      }
    };
    
    monitorCache.behavior.push(reportData);
    monitor.flush();
  }
};

// 错误监控
const errorMonitor = {
  // 开始监控
  start: () => {
    if (!monitorConfig.enabled) return;
    
    // 监听全局错误
    window.addEventListener('error', errorMonitor.reportError);
    
    // 监听未捕获的Promise错误
    window.addEventListener('unhandledrejection', errorMonitor.reportPromiseError);
  },
  
  // 上报错误
  reportError: (event) => {
    if (!monitorConfig.enabled) return;
    
    const reportData = {
      type: 'error',
      timestamp: Date.now(),
      device: utils.getDeviceInfo(),
      network: utils.getNetworkInfo(),
      page: utils.getPageInfo(),
      data: {
        event: 'error',
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error?.stack || event.error?.message || 'Unknown error'
      }
    };
    
    monitorCache.error.push(reportData);
    monitor.flush();
  },
  
  // 上报Promise错误
  reportPromiseError: (event) => {
    if (!monitorConfig.enabled) return;
    
    const reportData = {
      type: 'error',
      timestamp: Date.now(),
      device: utils.getDeviceInfo(),
      network: utils.getNetworkInfo(),
      page: utils.getPageInfo(),
      data: {
        event: 'unhandledrejection',
        reason: event.reason?.stack || event.reason?.message || 'Unknown promise error'
      }
    };
    
    monitorCache.error.push(reportData);
    monitor.flush();
  },
  
  // 手动上报错误
  report: (error, context = {}) => {
    if (!monitorConfig.enabled) return;
    
    const reportData = {
      type: 'error',
      timestamp: Date.now(),
      device: utils.getDeviceInfo(),
      network: utils.getNetworkInfo(),
      page: utils.getPageInfo(),
      data: {
        event: 'custom',
        error: error?.stack || error?.message || 'Unknown error',
        ...context
      }
    };
    
    monitorCache.error.push(reportData);
    monitor.flush();
  }
};

// 监控工具
const monitor = {
  // 初始化
  init: (config = {}) => {
    // 合并配置
    Object.assign(monitorConfig, config);
    
    if (!monitorConfig.enabled) return;
    
    // 开始监控
    apiMonitor.start();
    performanceMonitor.start();
    behaviorMonitor.start();
    errorMonitor.start();
  },
  
  // 刷新数据（批量上报）
  flush: () => {
    if (!monitorConfig.enabled) return;
    
    // 清除之前的定时器
    if (batchTimer) {
      clearTimeout(batchTimer);
    }
    
    // 设置新的定时器
    batchTimer = setTimeout(() => {
      const data = [
        ...monitorCache.api,
        ...monitorCache.performance,
        ...monitorCache.behavior,
        ...monitorCache.error
      ];
      
      if (data.length > 0) {
        // 批量上报
        monitor.report(data);
        
        // 清空缓存
        monitorCache.api = [];
        monitorCache.performance = [];
        monitorCache.behavior = [];
        monitorCache.error = [];
      }
    }, monitorConfig.batchInterval);
  },
  
  // 上报数据
  report: (data) => {
    if (!monitorConfig.enabled) return;
    
    try {
      // 发送数据
      fetch(monitorConfig.reportUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      }).catch(error => {
        console.error('监控数据上报失败:', error);
      });
    } catch (error) {
      console.error('监控数据上报失败:', error);
    }
  },
  
  // 手动上报
  track: behaviorMonitor.track,
  
  // 上报错误
  reportError: errorMonitor.report
};

// 导出监控工具
export default monitor;

// 导出子模块
export { apiMonitor, performanceMonitor, behaviorMonitor, errorMonitor };
