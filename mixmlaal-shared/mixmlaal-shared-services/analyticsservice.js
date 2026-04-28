/**
 * MIXMLAAL 数据分析服务 SDK
 * 版本: v2.0.0
 * 更新日期: 2026-04-26
 * 说明: 提供数据统计分析、报表生成、趋势分析、预测等功能
 */

class AnalyticsService {
  constructor(config = {}) {
    this.db = config.db;
    this.cache = config.cache || null;
    this.logger = config.logger || console;
    this.cacheTTL = config.cacheTTL || 300;
  }

  /**
   * 缓存辅助方法
   */
  async getCached(key, fetchFn) {
    if (!this.cache) return fetchFn();
    
    const cached = await this.cache.get(key);
    if (cached) return JSON.parse(cached);
    
    const data = await fetchFn();
    await this.cache.set(key, JSON.stringify(data), 'EX', this.cacheTTL);
    return data;
  }

  /**
   * 获取平台概览统计
   * @param {Object} options - 查询选项 {startDate, endDate, cached}
   * @returns {Promise<Object>} 概览统计数据
   */
  async getOverview(options = {}) {
    const cacheKey = `analytics:overview:${JSON.stringify(options)}`;
    
    return this.getCached(cacheKey, async () => {
      try {
        const { startDate = null, endDate = null } = options;

        let userSql = 'SELECT COUNT(*) as total FROM users WHERE status = 1';
        let orderSql = 'SELECT COUNT(*) as total FROM shop_orders';
        let salesSql = 'SELECT SUM(actual_amount) as total FROM shop_orders WHERE status = 3';
        let rideSql = 'SELECT COUNT(*) as total FROM ride_orders WHERE status = 3';
        let merchantSql = 'SELECT COUNT(*) as total FROM merchants WHERE status = 1';
        let driverSql = 'SELECT COUNT(*) as total FROM drivers WHERE status = 1';

        const params = [];
        if (startDate && endDate) {
          const dateCondition = ' AND created_at >= ? AND created_at <= ?';
          userSql += dateCondition;
          orderSql += dateCondition;
          salesSql += dateCondition;
          rideSql += dateCondition;
          merchantSql += dateCondition;
          driverSql += dateCondition;
          params.push(startDate, endDate, startDate, endDate, startDate, endDate, startDate, endDate, startDate, endDate, startDate, endDate);
        }

        const [users, orders, sales, rides, merchants, drivers] = await Promise.all([
          this.db.execute(userSql, params),
          this.db.execute(orderSql, params),
          this.db.execute(salesSql, params),
          this.db.execute(rideSql, params),
          this.db.execute(merchantSql, params),
          this.db.execute(driverSql, params),
        ]);

        const totalUsers = users[0]?.total || 0;
        const totalOrders = orders[0]?.total || 0;
        const totalSales = parseFloat(sales[0]?.total || 0);
        const totalRides = rides[0]?.total || 0;
        const totalMerchants = merchants[0]?.total || 0;
        const totalDrivers = drivers[0]?.total || 0;

        return {
          totalUsers,
          totalOrders,
          totalSales,
          totalRides,
          totalMerchants,
          totalDrivers,
          averageOrderValue: totalOrders > 0 ? (totalSales / totalOrders).toFixed(2) : 0,
          averageRideValue: totalRides > 0 ? (totalSales / totalRides).toFixed(2) : 0,
          timestamp: new Date().toISOString()
        };
      } catch (error) {
        this.logger.error('获取概览统计错误:', error);
        throw error;
      }
    });
  }

  /**
   * 获取订单趋势数据
   * @param {Object} options - 查询选项 {period, startDate, endDate, limit, cached}
   * @returns {Promise<Array>} 趋势数据
   */
  async getOrderTrend(options = {}) {
    const cacheKey = `analytics:order_trend:${JSON.stringify(options)}`;
    
    return this.getCached(cacheKey, async () => {
      try {
        const { period = 'day', startDate = null, endDate = null, limit = 30 } = options;

        let dateFormat, dateGroup;
        switch (period) {
          case 'hour':
            dateFormat = '%Y-%m-%d %H:00';
            dateGroup = '%Y-%m-%d %H';
            break;
          case 'week':
            dateFormat = '%Y-%u';
            dateGroup = '%Y-%u';
            break;
          case 'month':
            dateFormat = '%Y-%m';
            dateGroup = '%Y-%m';
            break;
          default:
            dateFormat = '%Y-%m-%d';
            dateGroup = '%Y-%m-%d';
        }

        let sql = `
          SELECT
            DATE_FORMAT(created_at, '${dateFormat}') as date,
            COUNT(*) as orderCount,
            SUM(actual_amount) as totalAmount
          FROM shop_orders
          WHERE 1=1
        `;
        const params = [];

        if (startDate && endDate) {
          sql += ' AND created_at >= ? AND created_at <= ?';
          params.push(startDate, endDate);
        }

        sql += ` GROUP BY DATE_FORMAT(created_at, '${dateGroup}') ORDER BY date DESC LIMIT ?`;
        params.push(parseInt(limit, 10));

        const results = await this.db.execute(sql, params);

        return results.map(r => ({
          date: r.date,
          orderCount: r.orderCount,
          totalAmount: parseFloat(r.totalAmount || 0),
        }));
      } catch (error) {
        this.logger.error('获取订单趋势错误:', error);
        throw error;
      }
    });
  }

  /**
   * 获取出行订单趋势
   * @param {Object} options - 查询选项
   * @returns {Promise<Array>} 趋势数据
   */
  async getRideTrend(options = {}) {
    const cacheKey = `analytics:ride_trend:${JSON.stringify(options)}`;
    
    return this.getCached(cacheKey, async () => {
      try {
        const { period = 'day', startDate = null, endDate = null, limit = 30 } = options;

        let dateFormat, dateGroup;
        switch (period) {
          case 'hour':
            dateFormat = '%Y-%m-%d %H:00';
            dateGroup = '%Y-%m-%d %H';
            break;
          case 'month':
            dateFormat = '%Y-%m';
            dateGroup = '%Y-%m';
            break;
          default:
            dateFormat = '%Y-%m-%d';
            dateGroup = '%Y-%m-%d';
        }

        let sql = `
          SELECT
            DATE_FORMAT(created_at, '${dateFormat}') as date,
            COUNT(*) as rideCount,
            SUM(distance) as totalDistance,
            SUM(amount) as totalAmount
          FROM ride_orders
          WHERE status = 3
        `;
        const params = [];

        if (startDate && endDate) {
          sql += ' AND created_at >= ? AND created_at <= ?';
          params.push(startDate, endDate);
        }

        sql += ` GROUP BY DATE_FORMAT(created_at, '${dateGroup}') ORDER BY date DESC LIMIT ?`;
        params.push(parseInt(limit, 10));

        const results = await this.db.execute(sql, params);

        return results.map(r => ({
          date: r.date,
          rideCount: r.rideCount,
          totalDistance: parseFloat(r.totalDistance || 0),
          totalAmount: parseFloat(r.totalAmount || 0),
        }));
      } catch (error) {
        this.logger.error('获取出行趋势错误:', error);
        throw error;
      }
    });
  }

  /**
   * 获取服务类型分布
   * @param {Object} options - 查询选项
   * @returns {Promise<Array>} 分布数据
   */
  async getServiceDistribution(options = {}) {
    const cacheKey = `analytics:service_dist:${JSON.stringify(options)}`;
    
    return this.getCached(cacheKey, async () => {
      try {
        const { startDate = null, endDate = null } = options;

        const conditions = [];
        const params = [];

        if (startDate && endDate) {
          conditions.push('created_at >= ? AND created_at <= ?');
          params.push(startDate, endDate);
        }

        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

        const [rides, foods, malls, errands] = await Promise.all([
          this.db.execute(
            `SELECT COUNT(*) as count, SUM(actual_price) as revenue FROM ride_orders ${whereClause}`,
            params,
          ),
          this.db.execute(
            `SELECT COUNT(*) as count, SUM(total_amount) as revenue FROM shop_orders ${whereClause}`,
            params,
          ),
          this.db.execute(
            `SELECT COUNT(*) as count, SUM(total_amount) as revenue FROM mall_orders ${whereClause}`,
            params,
          ),
          this.db.execute(
            `SELECT COUNT(*) as count, SUM(amount) as revenue FROM errand_orders ${whereClause}`,
            params,
          ),
        ]);

        return [
          { service: 'ride', label: '打车服务', count: rides[0]?.count || 0, revenue: parseFloat(rides[0]?.revenue || 0) },
          { service: 'food', label: '外卖服务', count: foods[0]?.count || 0, revenue: parseFloat(foods[0]?.revenue || 0) },
          { service: 'mall', label: '商城购物', count: malls[0]?.count || 0, revenue: parseFloat(malls[0]?.revenue || 0) },
          { service: 'errand', label: '跑腿服务', count: errands[0]?.count || 0, revenue: parseFloat(errands[0]?.revenue || 0) },
        ];
      } catch (error) {
        this.logger.error('获取服务分布错误:', error);
        throw error;
      }
    });
  }

  /**
   * 获取用户增长数据
   * @param {Object} options - 查询选项
   * @returns {Promise<Array>} 增长数据
   */
  async getUserGrowth(options = {}) {
    const cacheKey = `analytics:user_growth:${JSON.stringify(options)}`;
    
    return this.getCached(cacheKey, async () => {
      try {
        const { period = 'day', startDate = null, endDate = null, limit = 30 } = options;

        let dateFormat, dateGroup;
        switch (period) {
          case 'week':
            dateFormat = '%Y-%u';
            dateGroup = '%Y-%u';
            break;
          case 'month':
            dateFormat = '%Y-%m';
            dateGroup = '%Y-%m';
            break;
          default:
            dateFormat = '%Y-%m-%d';
            dateGroup = '%Y-%m-%d';
        }

        let sql = `
          SELECT
            DATE_FORMAT(created_at, '${dateFormat}') as date,
            COUNT(*) as userCount
          FROM users
          WHERE status = 1
        `;
        const params = [];

        if (startDate && endDate) {
          sql += ' AND created_at >= ? AND created_at <= ?';
          params.push(startDate, endDate);
        }

        sql += ` GROUP BY DATE_FORMAT(created_at, '${dateGroup}') ORDER BY date DESC LIMIT ?`;
        params.push(parseInt(limit, 10));

        const results = await this.db.execute(sql, params);

        return results.map(r => ({
          date: r.date,
          userCount: r.userCount,
        }));
      } catch (error) {
        this.logger.error('获取用户增长错误:', error);
        throw error;
      }
    });
  }

  /**
   * 获取销售排行榜
   * @param {Object} options - 查询选项
   * @returns {Promise<Object>} 排行榜数据
   */
  async getSalesRanking(options = {}) {
    const cacheKey = `analytics:sales_ranking:${JSON.stringify(options)}`;
    
    return this.getCached(cacheKey, async () => {
      try {
        const { period = 'day', startDate = null, endDate = null, limit = 10 } = options;

        let dateCondition = '';
        const params = [];

        if (startDate && endDate) {
          dateCondition = 'AND created_at >= ? AND created_at <= ?';
          params.push(startDate, endDate);
        }

        const [topProducts, topMerchants, topDrivers] = await Promise.all([
          this.db.execute(
            `SELECT
              oi.product_id,
              oi.product_name,
              SUM(oi.quantity) as totalQuantity,
              SUM(oi.total_amount) as totalRevenue
            FROM order_items oi
            JOIN shop_orders o ON oi.order_id = o.order_id
            WHERE o.status = 3 ${dateCondition}
            GROUP BY oi.product_id, oi.product_name
            ORDER BY totalRevenue DESC
            LIMIT ?`,
            [...params, parseInt(limit, 10)],
          ),
          this.db.execute(
            `SELECT
              o.merchant_id,
              m.name as merchantName,
              COUNT(*) as orderCount,
              SUM(o.actual_amount) as totalRevenue
            FROM shop_orders o
            JOIN merchants m ON o.merchant_id = m.merchant_id
            WHERE o.status = 3 ${dateCondition}
            GROUP BY o.merchant_id, m.name
            ORDER BY totalRevenue DESC
            LIMIT ?`,
            [...params, parseInt(limit, 10)],
          ),
          this.db.execute(
            `SELECT
              r.driver_id,
              d.name as driverName,
              COUNT(*) as rideCount,
              SUM(r.amount) as totalRevenue
            FROM ride_orders r
            JOIN drivers d ON r.driver_id = d.driver_id
            WHERE r.status = 3 ${dateCondition}
            GROUP BY r.driver_id, d.name
            ORDER BY totalRevenue DESC
            LIMIT ?`,
            [...params, parseInt(limit, 10)],
          ),
        ]);

        return {
          topProducts: topProducts.map(p => ({
            productId: p.product_id,
            productName: p.product_name,
            totalQuantity: p.totalQuantity,
            totalRevenue: parseFloat(p.totalRevenue || 0),
          })),
          topMerchants: topMerchants.map(m => ({
            merchantId: m.merchant_id,
            merchantName: m.merchantName,
            orderCount: m.orderCount,
            totalRevenue: parseFloat(m.totalRevenue || 0),
          })),
          topDrivers: topDrivers.map(d => ({
            driverId: d.driver_id,
            driverName: d.driverName,
            rideCount: d.rideCount,
            totalRevenue: parseFloat(d.totalRevenue || 0),
          })),
        };
      } catch (error) {
        this.logger.error('获取销售排行错误:', error);
        throw error;
      }
    });
  }

  /**
   * 获取用户活跃度统计
   * @param {Object} options - 查询选项
   * @returns {Promise<Object>} 活跃度数据
   */
  async getUserActivity(options = {}) {
    const cacheKey = `analytics:user_activity:${JSON.stringify(options)}`;
    
    return this.getCached(cacheKey, async () => {
      try {
        const { startDate = null, endDate = null } = options;

        let dateCondition = '';
        const params = [];

        if (startDate && endDate) {
          dateCondition = 'AND created_at >= ? AND created_at <= ?';
          params.push(startDate, endDate);
        }

        const [dailyActive, weeklyActive, monthlyActive, totalUsers] = await Promise.all([
          this.db.execute(
            `SELECT COUNT(DISTINCT user_id) as count
             FROM wallet_transactions
             WHERE type = 2 ${dateCondition}
             AND created_at >= DATE_SUB(NOW(), INTERVAL 1 DAY)`,
            params,
          ),
          this.db.execute(
            `SELECT COUNT(DISTINCT user_id) as count
             FROM wallet_transactions
             WHERE type = 2 ${dateCondition}
             AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)`,
            params,
          ),
          this.db.execute(
            `SELECT COUNT(DISTINCT user_id) as count
             FROM wallet_transactions
             WHERE type = 2 ${dateCondition}
             AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)`,
            params,
          ),
          this.db.execute('SELECT COUNT(*) as total FROM users WHERE status = 1'),
        ]);

        const total = totalUsers[0]?.total || 1;
        const daily = dailyActive[0]?.count || 0;
        const weekly = weeklyActive[0]?.count || 0;
        const monthly = monthlyActive[0]?.count || 0;

        return {
          dailyActive: daily,
          weeklyActive: weekly,
          monthlyActive: monthly,
          dailyRate: ((daily / total) * 100).toFixed(2),
          weeklyRate: ((weekly / total) * 100).toFixed(2),
          monthlyRate: ((monthly / total) * 100).toFixed(2),
          totalUsers: total,
        };
      } catch (error) {
        this.logger.error('获取用户活跃度错误:', error);
        throw error;
      }
    });
  }

  /**
   * 获取转化率数据
   * @param {Object} options - 查询选项
   * @returns {Promise<Object>} 转化率数据
   */
  async getConversionRates(options = {}) {
    const cacheKey = `analytics:conversion:${JSON.stringify(options)}`;
    
    return this.getCached(cacheKey, async () => {
      try {
        const { startDate = null, endDate = null } = options;

        let dateCondition = '';
        const params = [];

        if (startDate && endDate) {
          dateCondition = 'AND created_at >= ? AND created_at <= ?';
          params.push(startDate, endDate);
        }

        const [views, carts, checkouts, orders] = await Promise.all([
          this.db.execute(
            `SELECT COUNT(*) as count FROM browse_history WHERE 1=1 ${dateCondition}`,
            params,
          ),
          this.db.execute(
            `SELECT COUNT(*) as count FROM shopping_carts WHERE 1=1 ${dateCondition}`,
            params,
          ),
          this.db.execute(
            `SELECT COUNT(*) as count FROM shop_orders WHERE status >= 0 ${dateCondition}`,
            params,
          ),
          this.db.execute(
            `SELECT COUNT(*) as count FROM shop_orders WHERE status = 3 ${dateCondition}`,
            params,
          ),
        ]);

        const viewCount = views[0]?.count || 0;
        const cartCount = carts[0]?.count || 0;
        const checkoutCount = checkouts[0]?.count || 0;
        const orderCount = orders[0]?.count || 0;

        return {
          viewToCart: viewCount > 0 ? ((cartCount / viewCount) * 100).toFixed(2) : 0,
          cartToCheckout: cartCount > 0 ? ((checkoutCount / cartCount) * 100).toFixed(2) : 0,
          checkoutToOrder: checkoutCount > 0 ? ((orderCount / checkoutCount) * 100).toFixed(2) : 0,
          overallConversion: viewCount > 0 ? ((orderCount / viewCount) * 100).toFixed(2) : 0,
          raw: { views: viewCount, carts: cartCount, checkouts: checkoutCount, orders: orderCount }
        };
      } catch (error) {
        this.logger.error('获取转化率错误:', error);
        throw error;
      }
    });
  }

  /**
   * 获取实时数据面板
   * @returns {Promise<Object>} 实时数据
   */
  async getRealtimeDashboard() {
    const cacheKey = 'analytics:realtime';
    
    return this.getCached(cacheKey, async () => {
      try {
        const [[todayOrders], [todayRides], [todayRevenue], [activeUsers], [pendingOrders]] = await Promise.all([
          this.db.execute('SELECT COUNT(*) as count FROM shop_orders WHERE DATE(created_at) = CURDATE()'),
          this.db.execute('SELECT COUNT(*) as count FROM ride_orders WHERE DATE(created_at) = CURDATE()'),
          this.db.execute('SELECT SUM(actual_amount) as total FROM shop_orders WHERE DATE(created_at) = CURDATE() AND status = 3'),
          this.db.execute('SELECT COUNT(*) as count FROM users WHERE last_active_at >= DATE_SUB(NOW(), INTERVAL 5 MINUTE)'),
          this.db.execute('SELECT COUNT(*) as count FROM orders WHERE status IN (0, 1)'),
        ]);

        return {
          todayOrders: todayOrders[0]?.count || 0,
          todayRides: todayRides[0]?.count || 0,
          todayRevenue: parseFloat(todayRevenue[0]?.total || 0),
          activeUsers: activeUsers[0]?.count || 0,
          pendingOrders: pendingOrders[0]?.count || 0,
          timestamp: new Date().toISOString()
        };
      } catch (error) {
        this.logger.error('获取实时数据错误:', error);
        throw error;
      }
    });
  }

  /**
   * 生成数据报告
   * @param {Object} options - 报告选项
   * @returns {Promise<Object>} 报告数据
   */
  async generateReport(options = {}) {
    try {
      const { type = 'daily', startDate, endDate } = options;

      const [overview, orderTrend, userGrowth, serviceDist, ranking, conversion, activity] = await Promise.all([
        this.getOverview({ startDate, endDate }),
        this.getOrderTrend({ period: type === 'daily' ? 'day' : 'month', startDate, endDate }),
        this.getUserGrowth({ period: type === 'daily' ? 'day' : 'month', startDate, endDate }),
        this.getServiceDistribution({ startDate, endDate }),
        this.getSalesRanking({ startDate, endDate }),
        this.getConversionRates({ startDate, endDate }),
        this.getUserActivity({ startDate, endDate }),
      ]);

      return {
        reportType: type,
        period: { startDate, endDate },
        generatedAt: new Date().toISOString(),
        overview,
        orderTrend,
        userGrowth,
        serviceDistribution: serviceDist,
        salesRanking: ranking,
        conversionRates: conversion,
        userActivity: activity,
      };
    } catch (error) {
      this.logger.error('生成报告错误:', error);
      throw error;
    }
  }

  /**
   * 清除分析缓存
   * @param {string} pattern - 缓存键匹配模式
   */
  async clearCache(pattern = 'analytics:*') {
    if (!this.cache) return;
    const keys = await this.cache.keys(pattern);
    if (keys.length > 0) {
      await this.cache.del(...keys);
    }
    return keys.length;
  }
}

module.exports = AnalyticsService;
