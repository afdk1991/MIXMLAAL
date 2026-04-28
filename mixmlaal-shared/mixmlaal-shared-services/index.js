/**
 * MIXMLAAL 共享服务模块导出
 * 版本: v2.0.0
 * 更新日期: 2026-04-26
 */

const PackageService = require('./packageservice');
const SubscriptionService = require('./subscriptionservice');
const WalletService = require('./walletservice');
const NotificationService = require('./notificationservice');
const AnalyticsService = require('./analyticsservice');
const ServiceClient = require('./service-client');
const { HealthCheck, ServiceMonitor } = require('./health-check');
const { MetricsCollector, metrics } = require('./metrics');

module.exports = {
  PackageService,
  SubscriptionService,
  WalletService,
  NotificationService,
  AnalyticsService,
  ServiceClient,
  HealthCheck,
  ServiceMonitor,
  MetricsCollector,
  metrics,
  createServiceClient: ServiceClient.createServiceClient,
  createHealthCheck: (options) => new HealthCheck(options),
  createServiceMonitor: (options) => new ServiceMonitor(options),
  createMetricsCollector: (options) => new MetricsCollector(options)
};

module.exports.default = module.exports;
