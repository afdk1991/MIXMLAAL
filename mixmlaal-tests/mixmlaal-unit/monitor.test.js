/**
 * 监控模块单元测试
 * 版本: v1.0.0.0
 * 说明: 性能监控、告警机制测试
 */

const { 
  getMetrics, 
  getSystemMetrics, 
  getAppMetrics, 
  resetMetrics, 
  healthCheck, 
  getAlertHistory, 
  clearAlertHistory, 
  checkAlerts,
  alertConfig 
} = require('../../src/open/api/utils/monitor');

describe('监控模块测试', () => {
  beforeEach(() => {
    // 重置指标
    resetMetrics();
    // 清除告警历史
    clearAlertHistory();
  });

  describe('系统指标', () => {
    test('应获取系统指标', () => {
      const metrics = getSystemMetrics();
      expect(metrics).toHaveProperty('cpu');
      expect(metrics).toHaveProperty('memory');
      expect(metrics).toHaveProperty('uptime');
      expect(metrics).toHaveProperty('platform');
      expect(metrics).toHaveProperty('arch');
    });

    test('内存指标应包含正确的属性', () => {
      const metrics = getSystemMetrics();
      expect(metrics.memory).toHaveProperty('total');
      expect(metrics.memory).toHaveProperty('used');
      expect(metrics.memory).toHaveProperty('free');
      expect(metrics.memory).toHaveProperty('usage');
    });
  });

  describe('应用指标', () => {
    test('应获取应用指标', () => {
      const metrics = getAppMetrics();
      expect(metrics).toHaveProperty('requests');
      expect(metrics).toHaveProperty('responseTime');
      expect(metrics).toHaveProperty('endpoints');
      expect(metrics).toHaveProperty('errors');
      expect(metrics).toHaveProperty('uptime');
      expect(metrics).toHaveProperty('memoryUsage');
    });

    test('请求指标应包含正确的属性', () => {
      const metrics = getAppMetrics();
      expect(metrics.requests).toHaveProperty('total');
      expect(metrics.requests).toHaveProperty('success');
      expect(metrics.requests).toHaveProperty('error');
    });
  });

  describe('完整指标', () => {
    test('应获取完整的监控指标', () => {
      const metrics = getMetrics();
      expect(metrics).toHaveProperty('timestamp');
      expect(metrics).toHaveProperty('system');
      expect(metrics).toHaveProperty('application');
    });
  });

  describe('健康检查', () => {
    test('应返回健康状态', () => {
      const health = healthCheck();
      expect(health).toHaveProperty('status');
      expect(health).toHaveProperty('checks');
      expect(health.checks).toHaveProperty('memory');
      expect(health.checks).toHaveProperty('cpu');
      expect(health.checks).toHaveProperty('disk');
    });
  });

  describe('告警机制', () => {
    test('告警配置应包含正确的阈值', () => {
      expect(alertConfig).toHaveProperty('cpu');
      expect(alertConfig).toHaveProperty('memory');
      expect(alertConfig).toHaveProperty('responseTime');
      expect(alertConfig).toHaveProperty('errorRate');
    });

    test('应检查告警条件', () => {
      const metrics = getMetrics();
      const alerts = checkAlerts(metrics);
      expect(Array.isArray(alerts)).toBe(true);
    });

    test('应获取告警历史', () => {
      const alerts = getAlertHistory();
      expect(Array.isArray(alerts)).toBe(true);
    });

    test('应清除告警历史', () => {
      clearAlertHistory();
      const alerts = getAlertHistory();
      expect(alerts.length).toBe(0);
    });
  });

  describe('告警阈值测试', () => {
    test('CPU负载告警', () => {
      const mockMetrics = {
        system: {
          cpu: '85.5',
          memory: {
            usage: '50.0'
          }
        },
        application: {
          responseTime: {
            avg: '200'
          },
          requests: {
            total: 100,
            error: 0
          }
        }
      };

      const alerts = checkAlerts(mockMetrics);
      expect(alerts.length).toBeGreaterThan(0);
    });

    test('内存使用告警', () => {
      const mockMetrics = {
        system: {
          cpu: '50.0',
          memory: {
            usage: '90.0'
          }
        },
        application: {
          responseTime: {
            avg: '200'
          },
          requests: {
            total: 100,
            error: 0
          }
        }
      };

      const alerts = checkAlerts(mockMetrics);
      expect(alerts.length).toBeGreaterThan(0);
    });

    test('响应时间告警', () => {
      const mockMetrics = {
        system: {
          cpu: '50.0',
          memory: {
            usage: '50.0'
          }
        },
        application: {
          responseTime: {
            avg: '600'
          },
          requests: {
            total: 100,
            error: 0
          }
        }
      };

      const alerts = checkAlerts(mockMetrics);
      expect(alerts.length).toBeGreaterThan(0);
    });

    test('错误率告警', () => {
      const mockMetrics = {
        system: {
          cpu: '50.0',
          memory: {
            usage: '50.0'
          }
        },
        application: {
          responseTime: {
            avg: '200'
          },
          requests: {
            total: 100,
            error: 8
          }
        }
      };

      const alerts = checkAlerts(mockMetrics);
      expect(alerts.length).toBeGreaterThan(0);
    });
  });
});
