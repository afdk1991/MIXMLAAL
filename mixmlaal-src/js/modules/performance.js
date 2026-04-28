// 性能监控模块
export const Performance = {
  startTime: performance.now(),
  init() {
    console.log('✅ Performance 模块初始化完成');
    this.mark('app_init_start');
    this.setupPerformanceObserver();
    this.reportPageLoadPerformance();
  },

  mark(name) {
    try {
      performance.mark(name);
    } catch (error) {
      console.error('❌ 标记性能点失败:', error);
    }
  },

  measure(name, startMark, endMark) {
    try {
      performance.measure(name, startMark, endMark);
      const measures = performance.getEntriesByName(name);
      if (measures.length > 0) {
        const duration = measures[0].duration.toFixed(2);
        console.log(`📊 ${name}: ${duration}ms`);
        return duration;
      }
    } catch (error) {
      console.error('❌ 测量性能失败:', error);
    }
    return 0;
  },

  setupPerformanceObserver() {
    try {
      if ('PerformanceObserver' in window) {
        // 监控资源加载性能
        const resourceObserver = new PerformanceObserver(list => {
          list.getEntries().forEach(entry => {
            if (entry.duration > 100) {
              console.log(`📊 资源加载: ${entry.name} - ${entry.duration.toFixed(2)}ms`);
            }
          });
        });
        resourceObserver.observe({ entryTypes: ['resource'] });

        // 监控导航性能
        const navigationObserver = new PerformanceObserver(list => {
          list.getEntries().forEach(entry => {
            console.log(`📊 导航性能: ${entry.name} - ${entry.duration.toFixed(2)}ms`);
          });
        });
        navigationObserver.observe({ entryTypes: ['navigation'] });
      }
    } catch (error) {
      console.error('❌ 设置性能观察者失败:', error);
    }
  },

  reportPageLoadPerformance() {
    try {
      if ('performance' in window && 'timing' in window.performance) {
        const timing = window.performance.timing;
        const loadTime = timing.loadEventEnd - timing.navigationStart;
        const domContentLoadedTime = timing.domContentLoadedEventEnd - timing.navigationStart;
        const firstPaint = window.performance.getEntriesByType('paint')[0]?.startTime || 0;

        console.log(`📊 页面加载性能:`);
        console.log(`  - 总加载时间: ${loadTime.toFixed(2)}ms`);
        console.log(`  - DOM内容加载完成时间: ${domContentLoadedTime.toFixed(2)}ms`);
        console.log(`  - 首次绘制时间: ${firstPaint.toFixed(2)}ms`);
      }
    } catch (error) {
      console.error('❌ 报告页面加载性能失败:', error);
    }
  },

  reportNavigationPerformance(pageName) {
    try {
      const endTime = performance.now();
      const duration = endTime - this.startTime;
      console.log(`📊 页面导航性能: ${pageName} - ${duration.toFixed(2)}ms`);
      this.startTime = endTime;
    } catch (error) {
      console.error('❌ 报告导航性能失败:', error);
    }
  },

  report() {
    try {
      const endTime = performance.now();
      console.log(`📊 应用总运行时间: ${(endTime - this.startTime).toFixed(2)}ms`);

      // 清除性能标记
      performance.clearMarks();
      performance.clearMeasures();
    } catch (error) {
      console.error('❌ 报告性能失败:', error);
    }
  },
};
