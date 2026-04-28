/**
 * 性能监控与链路追踪
 * 版本: v1.0.0.0
 * 说明: API性能监控、系统指标收集、链路追踪
 */

const os = require('os');
const { logger } = require('./logger');

// 性能指标存储
const metrics = {
  requests: {
    total: 0,
    success: 0,
    error: 0,
  },
  responseTime: [],
  endpoints: new Map(),
  errors: new Map(),
};

/**
 * 性能监控中间件
 * 记录API响应时间和状态码
 */
const performanceMonitor = (req, res, next) => {
  const startTime = process.hrtime();
  const endpoint = `${req.method} ${req.route?.path || req.path}`;

  res.on('finish', () => {
    const diff = process.hrtime(startTime);
    const duration = (diff[0] * 1e9 + diff[1]) / 1e6; // 转换为毫秒

    // 更新总请求数
    metrics.requests.total++;
    if (res.statusCode < 400) {
      metrics.requests.success++;
    } else {
      metrics.requests.error++;
    }

    // 记录响应时间
    metrics.responseTime.push(duration);
    // 只保留最近1000条记录
    if (metrics.responseTime.length > 1000) {
      metrics.responseTime.shift();
    }

    // 记录端点性能
    if (!metrics.endpoints.has(endpoint)) {
      metrics.endpoints.set(endpoint, {
        count: 0,
        totalTime: 0,
        avgTime: 0,
        minTime: Infinity,
        maxTime: 0,
        errors: 0,
      });
    }

    const endpointStats = metrics.endpoints.get(endpoint);
    endpointStats.count++;
    endpointStats.totalTime += duration;
    endpointStats.avgTime = endpointStats.totalTime / endpointStats.count;
    endpointStats.minTime = Math.min(endpointStats.minTime, duration);
    endpointStats.maxTime = Math.max(endpointStats.maxTime, duration);
    if (res.statusCode >= 400) {
      endpointStats.errors++;
    }

    // 慢请求警告（超过1秒）
    if (duration > 1000) {
      logger.warn(`慢请求警告: ${endpoint} 耗时 ${duration.toFixed(2)}ms`, {
        endpoint,
        duration: `${duration.toFixed(2)}ms`,
        statusCode: res.statusCode,
      });
    }
  });

  next();
};

/**
 * 错误监控
 * 记录错误信息和堆栈
 */
const errorMonitor = (err, req, res, next) => {
  const errorKey = err.message || 'Unknown Error';

  if (!metrics.errors.has(errorKey)) {
    metrics.errors.set(errorKey, {
      count: 0,
      lastOccurrence: null,
      stack: err.stack,
    });
  }

  const errorStats = metrics.errors.get(errorKey);
  errorStats.count++;
  errorStats.lastOccurrence = new Date().toISOString();

  // 记录错误日志
  logger.error(`API错误: ${errorKey}`, {
    error: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
  });

  next(err);
};

/**
 * 计算响应时间统计
 */
const calculateResponseTimeStats = () => {
  const times = metrics.responseTime;
  if (times.length === 0) { return null; }

  const sorted = [...times].sort((a, b) => a - b);
  const sum = sorted.reduce((a, b) => a + b, 0);

  return {
    count: times.length,
    avg: (sum / times.length).toFixed(2),
    min: sorted[0].toFixed(2),
    max: sorted[sorted.length - 1].toFixed(2),
    p50: sorted[Math.floor(sorted.length * 0.5)].toFixed(2),
    p95: sorted[Math.floor(sorted.length * 0.95)].toFixed(2),
    p99: sorted[Math.floor(sorted.length * 0.99)].toFixed(2),
  };
};

/**
 * 获取系统指标
 */
const getSystemMetrics = () => {
  const totalMemory = os.totalmem();
  const freeMemory = os.freemem();
  const usedMemory = totalMemory - freeMemory;

  return {
    cpu: os.loadavg()[0].toFixed(2),
    memory: {
      total: `${(totalMemory / 1024 / 1024 / 1024).toFixed(2)}GB`,
      used: `${(usedMemory / 1024 / 1024 / 1024).toFixed(2)}GB`,
      free: `${(freeMemory / 1024 / 1024 / 1024).toFixed(2)}GB`,
      usage: `${((usedMemory / totalMemory) * 100).toFixed(2)}%`,
    },
    uptime: `${(os.uptime() / 3600).toFixed(2)}h`,
    platform: os.platform(),
    arch: os.arch(),
  };
};

/**
 * 获取应用指标
 */
const getAppMetrics = () => {
  const endpointStats = {};
  metrics.endpoints.forEach((value, key) => {
    endpointStats[key] = {
      count: value.count,
      avgTime: `${value.avgTime.toFixed(2)}ms`,
      minTime: value.minTime === Infinity ? 0 : `${value.minTime.toFixed(2)}ms`,
      maxTime: `${value.maxTime.toFixed(2)}ms`,
      errorRate: `${((value.errors / value.count) * 100).toFixed(2)}%`,
    };
  });

  const errorStats = {};
  metrics.errors.forEach((value, key) => {
    errorStats[key] = {
      count: value.count,
      lastOccurrence: value.lastOccurrence,
    };
  });

  return {
    requests: metrics.requests,
    responseTime: calculateResponseTimeStats(),
    endpoints: endpointStats,
    errors: errorStats,
    uptime: `${(process.uptime() / 3600).toFixed(2)}h`,
    memoryUsage: process.memoryUsage(),
  };
};

/**
 * 获取完整监控数据
 */
const getMetrics = () => {
  return {
    timestamp: new Date().toISOString(),
    system: getSystemMetrics(),
    application: getAppMetrics(),
  };
};

/**
 * 重置指标
 */
const resetMetrics = () => {
  metrics.requests = { total: 0, success: 0, error: 0 };
  metrics.responseTime = [];
  metrics.endpoints.clear();
  metrics.errors.clear();
};

/**
 * 健康检查
 */
const healthCheck = () => {
  const sysMetrics = getSystemMetrics();
  const memoryUsage = parseFloat(sysMetrics.memory.usage);
  const cpuLoad = parseFloat(sysMetrics.cpu);

  const checks = {
    status: 'healthy',
    checks: {
      memory: {
        status: memoryUsage < 90 ? 'pass' : 'fail',
        usage: sysMetrics.memory.usage,
      },
      cpu: {
        status: cpuLoad < 10 ? 'pass' : cpuLoad < 20 ? 'warn' : 'fail',
        load: sysMetrics.cpu,
      },
      disk: {
        status: 'pass',
      },
    },
  };

  if (checks.checks.memory.status === 'fail' || checks.checks.cpu.status === 'fail') {
    checks.status = 'unhealthy';
  } else if (checks.checks.cpu.status === 'warn') {
    checks.status = 'degraded';
  }

  return checks;
};

/**
 * 告警配置
 */
const alertConfig = {
  cpu: {
    warn: 80,
    critical: 90
  },
  memory: {
    warn: 85,
    critical: 95
  },
  responseTime: {
    warn: 500,
    critical: 1000
  },
  errorRate: {
    warn: 5,
    critical: 10
  }
};

/**
 * 告警历史
 */
const alertHistory = [];

/**
 * 检查告警条件
 * @param {Object} metrics - 系统指标
 */
const checkAlerts = (metrics) => {
  const alerts = [];
  const now = new Date().toISOString();

  // CPU告警
  const cpuLoad = parseFloat(metrics.system.cpu);
  if (cpuLoad >= alertConfig.cpu.critical) {
    alerts.push({
      level: 'critical',
      message: `CPU负载过高: ${cpuLoad}%`,
      timestamp: now
    });
  } else if (cpuLoad >= alertConfig.cpu.warn) {
    alerts.push({
      level: 'warning',
      message: `CPU负载警告: ${cpuLoad}%`,
      timestamp: now
    });
  }

  // 内存告警
  const memoryUsage = parseFloat(metrics.system.memory.usage);
  if (memoryUsage >= alertConfig.memory.critical) {
    alerts.push({
      level: 'critical',
      message: `内存使用率过高: ${memoryUsage}%`,
      timestamp: now
    });
  } else if (memoryUsage >= alertConfig.memory.warn) {
    alerts.push({
      level: 'warning',
      message: `内存使用率警告: ${memoryUsage}%`,
      timestamp: now
    });
  }

  // 响应时间告警
  if (metrics.application.responseTime) {
    const avgResponseTime = parseFloat(metrics.application.responseTime.avg);
    if (avgResponseTime >= alertConfig.responseTime.critical) {
      alerts.push({
        level: 'critical',
        message: `平均响应时间过长: ${avgResponseTime}ms`,
        timestamp: now
      });
    } else if (avgResponseTime >= alertConfig.responseTime.warn) {
      alerts.push({
        level: 'warning',
        message: `平均响应时间警告: ${avgResponseTime}ms`,
        timestamp: now
      });
    }
  }

  // 错误率告警
  const totalRequests = metrics.application.requests.total;
  const errorRequests = metrics.application.requests.error;
  if (totalRequests > 0) {
    const errorRate = (errorRequests / totalRequests) * 100;
    if (errorRate >= alertConfig.errorRate.critical) {
      alerts.push({
        level: 'critical',
        message: `错误率过高: ${errorRate.toFixed(2)}%`,
        timestamp: now
      });
    } else if (errorRate >= alertConfig.errorRate.warn) {
      alerts.push({
        level: 'warning',
        message: `错误率警告: ${errorRate.toFixed(2)}%`,
        timestamp: now
      });
    }
  }

  // 记录告警
  alerts.forEach(alert => {
    alertHistory.push(alert);
    if (alertHistory.length > 100) {
      alertHistory.shift();
    }

    // 记录告警日志
    if (alert.level === 'critical') {
      logger.error('系统告警', alert);
    } else {
      logger.warn('系统告警', alert);
    }

    // 这里可以添加告警通知（如邮件、短信、Slack等）
    // sendAlertNotification(alert);
  });

  return alerts;
};

/**
 * 定时上报指标
 * @param {number} interval - 上报间隔（毫秒）
 */
const startMetricsReporter = (interval = 60000) => {
  setInterval(() => {
    const data = getMetrics();
    logger.info('系统指标上报', data);

    // 检查告警
    checkAlerts(data);

    // 这里可以发送到外部监控系统（如Prometheus、DataDog等）
    // sendToMonitoringSystem(data);
  }, interval);
};

/**
 * 获取告警历史
 * @param {number} limit - 限制数量
 * @returns {Array} 告警历史
 */
const getAlertHistory = (limit = 50) => {
  return alertHistory.slice(-limit);
};

/**
 * 清除告警历史
 */
const clearAlertHistory = () => {
  alertHistory.length = 0;
};

/**
 * 链路追踪上下文
 */
class TraceContext {
  constructor() {
    this.traces = new Map();
  }

  /**
   * 开始追踪
   * @param {string} traceId - 追踪ID
   * @param {string} spanName - 跨度名称
   */
  startSpan(traceId, spanName) {
    const span = {
      traceId,
      spanId: Math.random().toString(36).substr(2, 9),
      name: spanName,
      startTime: Date.now(),
      endTime: null,
      duration: null,
      tags: {},
      logs: [],
    };

    if (!this.traces.has(traceId)) {
      this.traces.set(traceId, []);
    }
    this.traces.get(traceId).push(span);

    return span;
  }

  /**
   * 结束追踪
   * @param {Object} span - 跨度对象
   */
  endSpan(span) {
    span.endTime = Date.now();
    span.duration = span.endTime - span.startTime;
  }

  /**
   * 添加标签
   * @param {Object} span - 跨度对象
   * @param {string} key - 标签键
   * @param {*} value - 标签值
   */
  setTag(span, key, value) {
    span.tags[key] = value;
  }

  /**
   * 添加日志
   * @param {Object} span - 跨度对象
   * @param {string} message - 日志消息
   * @param {Object} fields - 日志字段
   */
  log(span, message, fields = {}) {
    span.logs.push({
      timestamp: Date.now(),
      message,
      fields,
    });
  }

  /**
   * 获取追踪数据
   * @param {string} traceId - 追踪ID
   */
  getTrace(traceId) {
    return this.traces.get(traceId) || [];
  }
}

const traceContext = new TraceContext();

/**
 * 链路追踪中间件
 */
const traceMiddleware = (req, res, next) => {
  const traceId = req.headers['x-trace-id'] || Math.random().toString(36).substr(2, 16);
  const span = traceContext.startSpan(traceId, `${req.method} ${req.path}`);

  req.traceId = traceId;
  req.span = span;

  traceContext.setTag(span, 'http.method', req.method);
  traceContext.setTag(span, 'http.url', req.originalUrl);
  traceContext.setTag(span, 'http.user_agent', req.get('User-Agent'));
  traceContext.setTag(span, 'http.remote_addr', req.ip);

  res.on('finish', () => {
    traceContext.setTag(span, 'http.status_code', res.statusCode);
    traceContext.endSpan(span);

    // 记录慢追踪
    if (span.duration > 1000) {
      logger.warn(`慢链路追踪: ${span.name} 耗时 ${span.duration}ms`, {
        traceId,
        span: span.name,
        duration: `${span.duration}ms`,
        tags: span.tags,
      });
    }
  });

  next();
};

/**
 * 生成 Prometheus 格式的指标
 */
const collectPrometheusMetrics = () => {
  const appMetrics = getAppMetrics();
  const sysMetrics = getSystemMetrics();
  
  const metrics = [
    // 请求指标
    `# HELP mixmlaal_requests_total Total number of requests`,
    `# TYPE mixmlaal_requests_total counter`,
    `mixmlaal_requests_total ${appMetrics.requests.total}`,
    `# HELP mixmlaal_requests_success Total number of successful requests`,
    `# TYPE mixmlaal_requests_success counter`,
    `mixmlaal_requests_success ${appMetrics.requests.success}`,
    `# HELP mixmlaal_requests_error Total number of error requests`,
    `# TYPE mixmlaal_requests_error counter`,
    `mixmlaal_requests_error ${appMetrics.requests.error}`,
    
    // 响应时间指标
    `# HELP mixmlaal_response_time_avg Average response time in milliseconds`,
    `# TYPE mixmlaal_response_time_avg gauge`,
    `mixmlaal_response_time_avg ${appMetrics.responseTime ? appMetrics.responseTime.avg : 0}`,
    `# HELP mixmlaal_response_time_max Maximum response time in milliseconds`,
    `# TYPE mixmlaal_response_time_max gauge`,
    `mixmlaal_response_time_max ${appMetrics.responseTime ? appMetrics.responseTime.max : 0}`,
    `# HELP mixmlaal_response_time_min Minimum response time in milliseconds`,
    `# TYPE mixmlaal_response_time_min gauge`,
    `mixmlaal_response_time_min ${appMetrics.responseTime ? appMetrics.responseTime.min : 0}`,
    
    // 系统指标
    `# HELP mixmlaal_system_cpu_load CPU load average`,
    `# TYPE mixmlaal_system_cpu_load gauge`,
    `mixmlaal_system_cpu_load ${sysMetrics.cpu}`,
    `# HELP mixmlaal_system_memory_usage Memory usage percentage`,
    `# TYPE mixmlaal_system_memory_usage gauge`,
    `mixmlaal_system_memory_usage ${parseFloat(sysMetrics.memory.usage)}`,
    `# HELP mixmlaal_system_uptime System uptime in hours`,
    `# TYPE mixmlaal_system_uptime gauge`,
    `mixmlaal_system_uptime ${parseFloat(sysMetrics.uptime)}`,
    
    // 应用指标
    `# HELP mixmlaal_app_uptime Application uptime in hours`,
    `# TYPE mixmlaal_app_uptime gauge`,
    `mixmlaal_app_uptime ${parseFloat(appMetrics.uptime)}`,
    `# HELP mixmlaal_app_memory_rss RSS memory usage in bytes`,
    `# TYPE mixmlaal_app_memory_rss gauge`,
    `mixmlaal_app_memory_rss ${appMetrics.memoryUsage.rss}`,
    `# HELP mixmlaal_app_memory_heap_total Heap total memory in bytes`,
    `# TYPE mixmlaal_app_memory_heap_total gauge`,
    `mixmlaal_app_memory_heap_total ${appMetrics.memoryUsage.heapTotal}`,
    `# HELP mixmlaal_app_memory_heap_used Heap used memory in bytes`,
    `# TYPE mixmlaal_app_memory_heap_used gauge`,
    `mixmlaal_app_memory_heap_used ${appMetrics.memoryUsage.heapUsed}`,
  ];
  
  // 端点指标
  Object.entries(appMetrics.endpoints).forEach(([endpoint, stats]) => {
    const sanitizedEndpoint = endpoint.replace(/[^a-zA-Z0-9_]/g, '_');
    metrics.push(`# HELP mixmlaal_endpoint_${sanitizedEndpoint}_count Number of requests for ${endpoint}`,
                `# TYPE mixmlaal_endpoint_${sanitizedEndpoint}_count counter`,
                `mixmlaal_endpoint_${sanitizedEndpoint}_count ${stats.count}`,
                `# HELP mixmlaal_endpoint_${sanitizedEndpoint}_avg_time Average response time for ${endpoint}`,
                `# TYPE mixmlaal_endpoint_${sanitizedEndpoint}_avg_time gauge`,
                `mixmlaal_endpoint_${sanitizedEndpoint}_avg_time ${parseFloat(stats.avgTime)}`,
                `# HELP mixmlaal_endpoint_${sanitizedEndpoint}_error_rate Error rate for ${endpoint}`,
                `# TYPE mixmlaal_endpoint_${sanitizedEndpoint}_error_rate gauge`,
                `mixmlaal_endpoint_${sanitizedEndpoint}_error_rate ${parseFloat(stats.errorRate)}`);
  });
  
  return metrics.join('\n');
};

module.exports = {
  performanceMonitor,
  errorMonitor,
  getMetrics,
  getSystemMetrics,
  getAppMetrics,
  resetMetrics,
  healthCheck,
  startMetricsReporter,
  traceMiddleware,
  traceContext,
  collectPrometheusMetrics,
  getAlertHistory,
  clearAlertHistory,
  checkAlerts,
  alertConfig,
};
