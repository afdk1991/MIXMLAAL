// 性能监控模块
import { EventBus } from './event-bus.js';

export const PerformanceMonitor = {
  metrics: {
    pageLoadTime: null,
    domContentLoaded: null,
    firstPaint: null,
    firstContentfulPaint: null,
    largestContentfulPaint: null,
    timeToInteractive: null,
    cumulativeLayoutShift: null,
    firstInputDelay: null,
  },
  marks: new Map(),
  measures: new Map(),
  observers: {},
  enabled: true,
  maxMetrics: 100,
  metricHistory: [],

  init() {
    try {
      if (!this.enabled) {
        console.log('⚠️ PerformanceMonitor 已禁用');
        return;
      }

      console.log('🚀 PerformanceMonitor 初始化中...');

      this.setupPerformanceObserver();
      this.trackPageLoad();
      this.setupErrorTracking();
      this.setupMemoryMonitoring();

      console.log('✅ PerformanceMonitor 初始化完成');
    } catch (error) {
      console.error('❌ PerformanceMonitor 初始化失败:', error);
    }
  },

  setupPerformanceObserver() {
    if (typeof PerformanceObserver === 'undefined') {
      console.warn('⚠️ PerformanceObserver 不受支持');
      return;
    }

    try {
      this.observers.lcp = new PerformanceObserver(list => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.metrics.largestContentfulPaint = lastEntry.startTime;
        this.recordMetric('lcp', lastEntry.startTime);
        console.log('📊 LCP:', lastEntry.startTime);
      });
      this.observers.lcp.observe({ entryTypes: ['largest-contentful-paint'] });

      this.observers.fid = new PerformanceObserver(list => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.metrics.firstInputDelay = lastEntry.processingStart - lastEntry.startTime;
        this.recordMetric('fid', this.metrics.firstInputDelay);
        console.log('📊 FID:', this.metrics.firstInputDelay);
      });
      this.observers.fid.observe({ entryTypes: ['first-input'] });

      this.observers.cls = new PerformanceObserver(list => {
        const entries = list.getEntries();
        let clsValue = 0;
        entries.forEach(entry => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        this.metrics.cumulativeLayoutShift = clsValue;
        this.recordMetric('cls', clsValue);
        console.log('📊 CLS:', clsValue);
      });
      this.observers.cls.observe({ entryTypes: ['layout-shift'] });
    } catch (error) {
      console.error('❌ 设置 PerformanceObserver 失败:', error);
    }
  },

  trackPageLoad() {
    if (document.readyState === 'complete') {
      this.calculateLoadMetrics();
    } else {
      window.addEventListener('load', () => {
        this.calculateLoadMetrics();
      }, { once: true });
    }

    if (document.readyState === 'interactive' || document.readyState === 'complete') {
      this.calculateDCL();
    } else {
      document.addEventListener('DOMContentLoaded', () => {
        this.calculateDCL();
      }, { once: true });
    }
  },

  calculateDCL() {
    const navigation = performance.getEntriesByType('navigation')[0];
    if (navigation) {
      this.metrics.domContentLoaded = navigation.domContentLoadedEventEnd - navigation.startTime;
      this.recordMetric('dcl', this.metrics.domContentLoaded);
      console.log('📊 DCL:', this.metrics.domContentLoaded);
    }
  },

  calculateLoadMetrics() {
    const navigation = performance.getEntriesByType('navigation')[0];
    if (navigation) {
      this.metrics.pageLoadTime = navigation.loadEventEnd - navigation.startTime;
      this.recordMetric('load', this.metrics.pageLoadTime);
      console.log('📊 页面加载时间:', this.metrics.pageLoadTime);
    }

    const paintEntries = performance.getEntriesByType('paint');
    paintEntries.forEach(entry => {
      if (entry.name === 'first-paint') {
        this.metrics.firstPaint = entry.startTime;
        this.recordMetric('fp', entry.startTime);
        console.log('📊 FP:', entry.startTime);
      } else if (entry.name === 'first-contentful-paint') {
        this.metrics.firstContentfulPaint = entry.startTime;
        this.recordMetric('fcp', entry.startTime);
        console.log('📊 FCP:', entry.startTime);
      }
    });

    EventBus.emit('performance:ready', this.metrics);
  },

  setupErrorTracking() {
    window.addEventListener('error', event => {
      this.recordError('error', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error,
      });
    });

    window.addEventListener('unhandledrejection', event => {
      this.recordError('unhandledrejection', {
        reason: event.reason,
        promise: event.promise,
      });
    });
  },

  setupMemoryMonitoring() {
    if (performance.memory) {
      setInterval(() => {
        const memory = {
          usedJSHeapSize: performance.memory.usedJSHeapSize,
          totalJSHeapSize: performance.memory.totalJSHeapSize,
          jsHeapSizeLimit: performance.memory.jsHeapSizeLimit,
        };
        this.recordMetric('memory', memory.usedJSHeapSize);
      }, 10000);
    }
  },

  mark(name) {
    if (!this.enabled) { return; }
    try {
      performance.mark(name);
      this.marks.set(name, performance.now());
      console.log('📍 Mark:', name);
    } catch (error) {
      console.error('❌ 记录标记失败:', error);
    }
  },

  measure(name, startMark, endMark) {
    if (!this.enabled) { return; }
    try {
      if (startMark && endMark) {
        performance.measure(name, startMark, endMark);
      } else if (startMark) {
        performance.measure(name, startMark);
      } else {
        performance.measure(name);
      }

      const measures = performance.getEntriesByName(name);
      const lastMeasure = measures[measures.length - 1];
      this.measures.set(name, lastMeasure.duration);
      this.recordMetric(name, lastMeasure.duration);
      console.log('📏 Measure:', name, lastMeasure.duration);
    } catch (error) {
      console.error('❌ 记录测量失败:', error);
    }
  },

  recordMetric(name, value) {
    if (!this.enabled) { return; }

    const metric = {
      name,
      value,
      timestamp: Date.now(),
    };

    this.metricHistory.push(metric);

    if (this.metricHistory.length > this.maxMetrics) {
      this.metricHistory.shift();
    }

    EventBus.emit('performance:metric', metric);
  },

  recordError(type, error) {
    console.error(`❌ [${type}]`, error);
    EventBus.emit('performance:error', { type, error });
  },

  getMetrics() {
    return { ...this.metrics };
  },

  getMetricHistory() {
    return [...this.metricHistory];
  },

  getPerformanceReport() {
    return {
      metrics: this.getMetrics(),
      history: this.getMetricHistory(),
      marks: Object.fromEntries(this.marks),
      measures: Object.fromEntries(this.measures),
      timestamp: Date.now(),
    };
  },

  clear() {
    performance.clearMarks();
    performance.clearMeasures();
    this.marks.clear();
    this.measures.clear();
    this.metricHistory = [];
    console.log('🧹 PerformanceMonitor 已清除');
  },

  destroy() {
    Object.values(this.observers).forEach(observer => {
      if (observer && typeof observer.disconnect === 'function') {
        observer.disconnect();
      }
    });
    this.observers = {};
    this.clear();
    console.log('👋 PerformanceMonitor 已销毁');
  },
};
