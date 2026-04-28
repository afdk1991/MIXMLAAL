/**
 * 告警系统
 * 版本: v1.0.0.0
 * 说明: 系统指标告警、错误告警、阈值告警
 */

const { logger } = require('./logger');

class AlertSystem {
  constructor() {
    this.alerts = [];
    this.alertHistory = [];
    this.thresholds = {
      cpu: {
        warning: 5,
        critical: 10,
      },
      memory: {
        warning: 80,
        critical: 90,
      },
      responseTime: {
        warning: 500,
        critical: 1000,
      },
      errorRate: {
        warning: 5,
        critical: 10,
      },
    };
  }

  /**
   * 设置告警阈值
   * @param {object} thresholds 阈值配置
   */
  setThresholds(thresholds) {
    this.thresholds = { ...this.thresholds, ...thresholds };
  }

  /**
   * 检查系统指标并生成告警
   * @param {object} metrics 系统指标
   */
  checkMetrics(metrics) {
    const alerts = [];

    // 检查CPU负载
    if (metrics.system && metrics.system.cpu) {
      const cpuLoad = parseFloat(metrics.system.cpu);
      if (cpuLoad >= this.thresholds.cpu.critical) {
        alerts.push({
          level: 'critical',
          type: 'cpu',
          message: `CPU负载过高: ${cpuLoad}`,
          value: cpuLoad,
          threshold: this.thresholds.cpu.critical,
        });
      } else if (cpuLoad >= this.thresholds.cpu.warning) {
        alerts.push({
          level: 'warning',
          type: 'cpu',
          message: `CPU负载警告: ${cpuLoad}`,
          value: cpuLoad,
          threshold: this.thresholds.cpu.warning,
        });
      }
    }

    // 检查内存使用
    if (metrics.system && metrics.system.memory) {
      const memoryUsage = parseFloat(metrics.system.memory.usage);
      if (memoryUsage >= this.thresholds.memory.critical) {
        alerts.push({
          level: 'critical',
          type: 'memory',
          message: `内存使用过高: ${memoryUsage}%`,
          value: memoryUsage,
          threshold: this.thresholds.memory.critical,
        });
      } else if (memoryUsage >= this.thresholds.memory.warning) {
        alerts.push({
          level: 'warning',
          type: 'memory',
          message: `内存使用警告: ${memoryUsage}%`,
          value: memoryUsage,
          threshold: this.thresholds.memory.warning,
        });
      }
    }

    // 检查响应时间
    if (metrics.application && metrics.application.responseTime) {
      const avgResponseTime = parseFloat(metrics.application.responseTime.avg);
      if (avgResponseTime >= this.thresholds.responseTime.critical) {
        alerts.push({
          level: 'critical',
          type: 'responseTime',
          message: `平均响应时间过高: ${avgResponseTime}ms`,
          value: avgResponseTime,
          threshold: this.thresholds.responseTime.critical,
        });
      } else if (avgResponseTime >= this.thresholds.responseTime.warning) {
        alerts.push({
          level: 'warning',
          type: 'responseTime',
          message: `平均响应时间警告: ${avgResponseTime}ms`,
          value: avgResponseTime,
          threshold: this.thresholds.responseTime.warning,
        });
      }
    }

    // 检查错误率
    if (metrics.application && metrics.application.requests) {
      const { total, error } = metrics.application.requests;
      if (total > 0) {
        const errorRate = (error / total) * 100;
        if (errorRate >= this.thresholds.errorRate.critical) {
          alerts.push({
            level: 'critical',
            type: 'errorRate',
            message: `错误率过高: ${errorRate.toFixed(2)}%`,
            value: errorRate,
            threshold: this.thresholds.errorRate.critical,
          });
        } else if (errorRate >= this.thresholds.errorRate.warning) {
          alerts.push({
            level: 'warning',
            type: 'errorRate',
            message: `错误率警告: ${errorRate.toFixed(2)}%`,
            value: errorRate,
            threshold: this.thresholds.errorRate.warning,
          });
        }
      }
    }

    // 处理告警
    this.handleAlerts(alerts);
  }

  /**
   * 处理告警
   * @param {array} alerts 告警列表
   */
  handleAlerts(alerts) {
    alerts.forEach(alert => {
      // 检查是否已经存在相同的告警
      const existingAlert = this.alerts.find(a => a.type === alert.type && a.level === alert.level);
      if (!existingAlert) {
        // 添加新告警
        this.alerts.push(alert);
        this.alertHistory.push({
          ...alert,
          timestamp: new Date().toISOString(),
        });

        // 记录告警日志
        if (alert.level === 'critical') {
          logger.error(`[告警] ${alert.message}`, alert);
        } else {
          logger.warn(`[告警] ${alert.message}`, alert);
        }

        // 发送告警通知（可以集成邮件、短信、Slack等）
        this.sendAlertNotification(alert);
      }
    });

    // 清理已解决的告警
    this.cleanupResolvedAlerts();
  }

  /**
   * 清理已解决的告警
   */
  cleanupResolvedAlerts() {
    // 这里可以实现告警的自动解决逻辑
    // 例如，当指标恢复正常时，自动标记告警为已解决
  }

  /**
   * 发送告警通知
   * @param {object} alert 告警信息
   */
  sendAlertNotification(alert) {
    // 这里可以集成各种通知渠道
    // 例如：邮件、短信、Slack、微信等
    console.log(`[告警通知] ${alert.level.toUpperCase()}: ${alert.message}`);
  }

  /**
   * 获取当前告警
   * @returns {array} 当前告警列表
   */
  getCurrentAlerts() {
    return this.alerts;
  }

  /**
   * 获取告警历史
   * @param {number} limit 限制数量
   * @returns {array} 告警历史
   */
  getAlertHistory(limit = 100) {
    return this.alertHistory.slice(-limit);
  }

  /**
   * 清除所有告警
   */
  clearAlerts() {
    this.alerts = [];
  }

  /**
   * 清除告警历史
   */
  clearAlertHistory() {
    this.alertHistory = [];
  }
}

// 导出单例实例
module.exports = new AlertSystem();
