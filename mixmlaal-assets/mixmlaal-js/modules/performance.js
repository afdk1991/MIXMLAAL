/**
 * 性能监控模块
 * 提供应用性能监控和优化建议
 */
class Performance {
  constructor() {
    this.logger = console;
    this.metrics = new Map();
    this.isMonitoring = false;
    this.initialLoadCompleted = false;
  }

  /**
     * 初始化性能模块
     */
  initialize() {
    this.logger.log('⚡ Performance 模块初始化');
    this.startMonitoring();
    return Promise.resolve();
  }

  /**
     * 开始性能监控
     */
  startMonitoring() {
    if (this.isMonitoring) { return; }

    this.isMonitoring = true;

    // 监控首次加载性能
    this.monitorInitialLoad();

    // 监控运行时性能
    this.monitorRuntimePerformance();

    // 监控内存使用
    this.monitorMemory();

    // 监控网络性能
    this.monitorNetwork();

    this.logger.log('📊 性能监控已启动');
  }

  /**
     * 停止性能监控
     */
  stopMonitoring() {
    this.isMonitoring = false;
    this.logger.log('⏹️ 性能监控已停止');
  }

  /**
     * 监控首次加载性能
     */
  monitorInitialLoad() {
    if (!('performance' in window)) { return; }

    const observer = new PerformanceObserver(list => {
      list.getEntries().forEach(entry => {
        if (entry.entryType === 'navigation') {
          this.collectNavigationMetrics(entry);
        } else if (entry.entryType === 'paint') {
          this.collectPaintMetrics(entry);
        } else if (entry.entryType === 'resource') {
          this.collectResourceMetrics(entry);
        }
      });
    });

    observer.observe({
      entryTypes: ['navigation', 'paint', 'resource'],
    });

    // 页面加载完成后收集最终指标
    window.addEventListener('load', () => {
      setTimeout(() => {
        this.collectLoadCompleteMetrics();
        this.initialLoadCompleted = true;
        this.generatePerformanceReport();
      }, 1000);
    });
  }

  /**
     * 收集导航指标
     */
  collectNavigationMetrics(entry) {
    const metrics = {
      type: 'navigation',
      startTime: entry.startTime,
      duration: entry.duration,
      loadEventTime: entry.loadEventTime,
      domContentLoadedEventTime: entry.domContentLoadedEventTime,
      redirectCount: entry.redirectCount,
      nextHopProtocol: entry.nextHopProtocol,
      renderBlockingTime: entry.renderBlockingTime || 0,
    };

    this.metrics.set('navigation', metrics);
    this.reportMetric('navigation', metrics);
  }

  /**
     * 收集绘制指标
     */
  collectPaintMetrics(entry) {
    const metrics = {
      type: 'paint',
      name: entry.name,
      startTime: entry.startTime,
    };

    this.metrics.set(`paint_${entry.name.toLowerCase()}`, metrics);
    this.reportMetric('paint', metrics);
  }

  /**
     * 收集资源指标
     */
  collectResourceMetrics(entry) {
    const resourceType = entry.initiatorType || 'other';
    const domain = new URL(entry.name).hostname;

    // 按类型分组资源
    const typeMetrics = this.metrics.get(`resource_${resourceType}`) || {
      type: 'resource',
      resourceType: resourceType,
      count: 0,
      totalDuration: 0,
      maxDuration: 0,
      minDuration: Infinity,
      resources: [],
    };

    typeMetrics.count++;
    typeMetrics.totalDuration += entry.duration;
    typeMetrics.maxDuration = Math.max(typeMetrics.maxDuration, entry.duration);
    typeMetrics.minDuration = Math.min(typeMetrics.minDuration, entry.duration);
    typeMetrics.resources.push({
      name: entry.name,
      duration: entry.duration,
      domain: domain,
      startTime: entry.startTime,
    });

    this.metrics.set(`resource_${resourceType}`, typeMetrics);
  }

  /**
     * 收集加载完成指标
     */
  collectLoadCompleteMetrics() {
    // 计算关键性能指标
    const navigation = this.metrics.get('navigation');
    const fcp = this.metrics.get('paint_first-contentful-paint');
    const lcp = this.metrics.get('paint_largest-contentful-paint');

    const performanceScore = this.calculatePerformanceScore();

    const summary = {
      type: 'summary',
      timestamp: Date.now(),
      performanceScore: performanceScore,
      metrics: {
        loadTime: navigation ? navigation.duration : 0,
        domReadyTime: navigation ? navigation.domContentLoadedEventTime : 0,
        fcp: fcp ? fcp.startTime : 0,
        lcp: lcp ? lcp.startTime : 0,
        resourceCount: this.getTotalResourceCount(),
        totalResourceLoadTime: this.getTotalResourceLoadTime(),
      },
    };

    this.metrics.set('summary', summary);
    this.reportMetric('summary', summary);
  }

  /**
     * 监控运行时性能
     */
  monitorRuntimePerformance() {
    // 监控长任务
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver(list => {
        list.getEntries().forEach(entry => {
          if (entry.entryType === 'longtask') {
            this.handleLongTask(entry);
          }
        });
      });

      observer.observe({ entryTypes: ['longtask'] });
    }

    // 定期收集帧率
    setInterval(() => {
      this.measureFrameRate();
    }, 5000);
  }

  /**
     * 处理长任务
     */
  handleLongTask(entry) {
    const longTask = {
      type: 'longtask',
      duration: entry.duration,
      startTime: entry.startTime,
      attribution: entry.attribution || [],
    };

    this.reportMetric('longtask', longTask);

    // 如果任务超过50ms，发出警告
    if (entry.duration > 50) {
      this.logger.warn(`⚠️ 检测到长任务: ${entry.duration.toFixed(2)}ms`, longTask);
    }
  }

  /**
     * 测量帧率
     */
  measureFrameRate() {
    if (!('requestAnimationFrame' in window)) { return; }

    let frames = 0;
    let lastTime = performance.now();

    const measure = currentTime => {
      frames++;
      const delta = currentTime - lastTime;

      if (delta >= 1000) {
        const fps = Math.round((frames * 1000) / delta);
        this.reportMetric('fps', { fps, timestamp: Date.now() });

        if (fps < 30) {
          this.logger.warn(`⚠️ 低帧率检测: ${fps} FPS`);
        }

        frames = 0;
        lastTime = currentTime;
      }

      if (this.isMonitoring) {
        requestAnimationFrame(measure);
      }
    };

    requestAnimationFrame(measure);
  }

  /**
     * 监控内存使用
     */
  monitorMemory() {
    if (!('memory' in performance)) { return; }

    setInterval(() => {
      const memory = performance.memory;
      const memoryMetrics = {
        type: 'memory',
        timestamp: Date.now(),
        usedJSHeapSize: memory.usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit,
        usedRatio: (memory.usedJSHeapSize / memory.jsHeapSizeLimit * 100).toFixed(2),
      };

      this.reportMetric('memory', memoryMetrics);

      // 如果内存使用超过80%，发出警告
      if (memoryMetrics.usedRatio > 80) {
        this.logger.warn(`⚠️ 内存使用过高: ${memoryMetrics.usedRatio}%`);
      }
    }, 10000);
  }

  /**
     * 监控网络性能
     */
  monitorNetwork() {
    // 监听网络状态变化
    if ('connection' in navigator) {
      const connection = navigator.connection;

      const collectConnectionInfo = () => {
        const networkMetrics = {
          type: 'network',
          timestamp: Date.now(),
          type: connection.type,
          effectiveType: connection.effectiveType,
          downlink: connection.downlink,
          rtt: connection.rtt,
          saveData: connection.saveData,
          downlinkMax: connection.downlinkMax,
        };

        this.reportMetric('network', networkMetrics);
      };

      collectConnectionInfo();
      connection.addEventListener('change', collectConnectionInfo);
    }
  }

  /**
     * 计算性能评分
     */
  calculatePerformanceScore() {
    let score = 100;
    const metrics = this.metrics.get('summary');

    if (!metrics) { return 0; }

    // 基于各项指标计算评分
    const { loadTime, domReadyTime, fcp, lcp } = metrics.metrics;

    // 加载时间 (满分30分)
    if (loadTime > 4000) { score -= 30; } else if (loadTime > 3000) { score -= 20; } else if (loadTime > 2000) { score -= 10; }

    // DOM准备时间 (满分20分)
    if (domReadyTime > 2000) { score -= 20; } else if (domReadyTime > 1500) { score -= 10; } else if (domReadyTime > 1000) { score -= 5; }

    // 首次内容绘制 (满分25分)
    if (fcp > 2000) { score -= 25; } else if (fcp > 1500) { score -= 15; } else if (fcp > 1000) { score -= 5; }

    // 最大内容绘制 (满分25分)
    if (lcp > 4000) { score -= 25; } else if (lcp > 3000) { score -= 15; } else if (lcp > 2500) { score -= 5; }

    return Math.max(0, Math.min(100, score));
  }

  /**
     * 获取总资源数量
     */
  getTotalResourceCount() {
    let count = 0;
    for (const [key, metric] of this.metrics) {
      if (key.startsWith('resource_') && metric.count) {
        count += metric.count;
      }
    }
    return count;
  }

  /**
     * 获取总资源加载时间
     */
  getTotalResourceLoadTime() {
    let totalTime = 0;
    for (const [key, metric] of this.metrics) {
      if (key.startsWith('resource_') && metric.totalDuration) {
        totalTime += metric.totalDuration;
      }
    }
    return totalTime;
  }

  /**
     * 生成性能报告
     */
  generatePerformanceReport() {
    const report = {
      timestamp: Date.now(),
      initialLoadCompleted: this.initialLoadCompleted,
      performanceScore: this.calculatePerformanceScore(),
      metrics: Object.fromEntries(this.metrics),
      recommendations: this.generateRecommendations(),
    };

    this.logger.log('📊 性能报告:', report);
    return report;
  }

  /**
     * 生成优化建议
     */
  generateRecommendations() {
    const recommendations = [];
    const summary = this.metrics.get('summary');

    if (!summary) { return recommendations; }

    const { loadTime, domReadyTime, fcp, lcp, resourceCount } = summary.metrics;

    // 加载时间建议
    if (loadTime > 3000) {
      recommendations.push({
        type: 'performance',
        severity: 'high',
        message: '页面加载时间过长，建议优化资源加载和代码执行',
      });
    }

    // DOM准备时间建议
    if (domReadyTime > 1500) {
      recommendations.push({
        type: 'performance',
        severity: 'medium',
        message: 'DOM准备时间较长，建议减少阻塞渲染的JavaScript',
      });
    }

    // 首次内容绘制建议
    if (fcp > 1500) {
      recommendations.push({
        type: 'performance',
        severity: 'high',
        message: '首次内容绘制时间较长，建议优化关键渲染路径',
      });
    }

    // 最大内容绘制建议
    if (lcp > 3000) {
      recommendations.push({
        type: 'performance',
        severity: 'high',
        message: '最大内容绘制时间较长，建议优化图片和关键资源',
      });
    }

    // 资源数量建议
    if (resourceCount > 50) {
      recommendations.push({
        type: 'performance',
        severity: 'medium',
        message: '资源数量较多，建议合并和压缩资源',
      });
    }

    return recommendations;
  }

  /**
     * 报告指标
     */
  reportMetric(type, data) {
    if (window.Monitor) {
      window.Monitor.report({
        type: `performance_${type}`,
        level: 'info',
        data: data,
      });
    }

    if (window.EventBus) {
      window.EventBus.emit(`performance:metric`, {
        type,
        data,
        timestamp: Date.now(),
      });
    }
  }

  /**
     * 获取性能指标
     */
  getMetric(name) {
    return this.metrics.get(name);
  }

  /**
     * 获取所有性能指标
     */
  getAllMetrics() {
    return Object.fromEntries(this.metrics);
  }

  /**
     * 清除性能指标
     */
  clearMetrics() {
    this.metrics.clear();
  }

  /**
     * 手动触发性能分析
     */
  analyzePerformance() {
    this.collectLoadCompleteMetrics();
    return this.generatePerformanceReport();
  }
}

// 导出性能实例
const PerformanceInstance = new Performance();
window.Performance = PerformanceInstance;
