/**
 * 行程订单数据模型
 * 版本: v1.0.0.0
 */

const db = require('../config/database');
const { generateId } = require('../../../../shared/utils');

class RideOrder {
  /**
   * 根据ID查找订单
   * @param {string} orderId - 订单ID
   * @returns {Promise<Object|null>}
   */
  static async findById(orderId) {
    const sql = `
      SELECT * FROM ride_orders 
      WHERE order_id = ?
    `;
    return await db.queryOne(sql, [orderId]);
  }

  /**
   * 创建订单
   * @param {Object} orderData - 订单数据
   * @returns {Promise<Object>}
   */
  static async create(orderData) {
    const orderId = generateId('RIDE');

    const sql = `
      INSERT INTO ride_orders (
        order_id, user_id, vehicle_type, status,
        from_name, from_address, from_lng, from_lat,
        to_name, to_address, to_lng, to_lat,
        estimated_price
      ) VALUES (?, ?, ?, 0, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const result = await db.insert(sql, [
      orderId,
      orderData.userId,
      orderData.vehicleType || 1,
      orderData.fromName,
      orderData.fromAddress,
      orderData.fromLng,
      orderData.fromLat,
      orderData.toName,
      orderData.toAddress,
      orderData.toLng,
      orderData.toLat,
      orderData.estimatedPrice,
    ]);

    return {
      orderId,
      insertId: result.insertId,
    };
  }

  /**
   * 更新订单状态
   * @param {string} orderId - 订单ID
   * @param {number} status - 状态码
   * @param {Object} extraData - 额外数据
   * @returns {Promise<Object>}
   */
  static async updateStatus(orderId, status, extraData = {}) {
    const statusTimeFields = {
      1: 'accepted_at',
      2: 'started_at',
      3: 'completed_at',
      4: 'cancelled_at',
    };

    let sql = 'UPDATE ride_orders SET status = ?';
    const params = [status];

    // 更新时间字段
    const timeField = statusTimeFields[status];
    if (timeField) {
      sql += `, ${timeField} = NOW()`;
    }

    // 更新额外数据
    if (extraData.driverId) {
      sql += ', driver_id = ?';
      params.push(extraData.driverId);
    }

    if (extraData.actualPrice) {
      sql += ', actual_price = ?';
      params.push(extraData.actualPrice);
    }

    if (extraData.cancelReason) {
      sql += ', cancel_reason = ?';
      params.push(extraData.cancelReason);
    }

    sql += ' WHERE order_id = ?';
    params.push(orderId);

    return await db.update(sql, params);
  }

  /**
   * 完成订单
   * @param {string} orderId - 订单ID
   * @param {Object} completeData - 完成数据
   * @returns {Promise<Object>}
   */
  static async complete(orderId, completeData) {
    const sql = `
      UPDATE ride_orders 
      SET status = 3,
          completed_at = NOW(),
          actual_price = ?,
          distance = ?,
          duration = ?,
          route_polyline = ?,
          platform_fee = ?,
          driver_income = ?
      WHERE order_id = ?
    `;

    return await db.update(sql, [
      completeData.actualPrice,
      completeData.distance,
      completeData.duration,
      completeData.routePolyline,
      completeData.platformFee,
      completeData.driverIncome,
      orderId,
    ]);
  }

  /**
   * 获取用户的订单列表
   * @param {string} userId - 用户ID
   * @param {Object} options - 查询选项
   * @returns {Promise<Object>}
   */
  static async findByUser(userId, options = {}) {
    const { page = 1, limit = 10, status } = options;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE user_id = ?';
    const params = [userId];

    if (status !== undefined) {
      whereClause += ' AND status = ?';
      params.push(status);
    }

    const countSql = `SELECT COUNT(*) as total FROM ride_orders ${whereClause}`;
    const listSql = `
      SELECT order_id, status, vehicle_type,
             from_name, from_address, to_name, to_address,
             estimated_price, actual_price, created_at, completed_at
      FROM ride_orders ${whereClause}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `;

    const [countResult, list] = await Promise.all([
      db.queryOne(countSql, params),
      db.query(listSql, [...params, limit, offset]),
    ]);

    return {
      list,
      pagination: {
        page,
        limit,
        total: countResult.total,
        totalPages: Math.ceil(countResult.total / limit),
      },
    };
  }

  /**
   * 获取司机的订单列表
   * @param {string} driverId - 司机ID
   * @param {Object} options - 查询选项
   * @returns {Promise<Object>}
   */
  static async findByDriver(driverId, options = {}) {
    const { page = 1, limit = 10, status } = options;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE driver_id = ?';
    const params = [driverId];

    if (status !== undefined) {
      whereClause += ' AND status = ?';
      params.push(status);
    }

    const countSql = `SELECT COUNT(*) as total FROM ride_orders ${whereClause}`;
    const listSql = `
      SELECT order_id, status, vehicle_type,
             from_name, to_name, actual_price, driver_income,
             created_at, completed_at
      FROM ride_orders ${whereClause}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `;

    const [countResult, list] = await Promise.all([
      db.queryOne(countSql, params),
      db.query(listSql, [...params, limit, offset]),
    ]);

    return {
      list,
      pagination: {
        page,
        limit,
        total: countResult.total,
        totalPages: Math.ceil(countResult.total / limit),
      },
    };
  }

  /**
   * 获取待接单订单列表
   * @param {Object} options - 查询选项
   * @returns {Promise<Array>}
   */
  static async findPendingOrders(options = {}) {
    const { limit = 20 } = options;

    // 简化版本：返回最近的待接单订单
    const sql = `
      SELECT order_id, from_name, from_address, from_lng, from_lat,
             to_name, to_address, to_lng, to_lat,
             estimated_price, vehicle_type, created_at
      FROM ride_orders
      WHERE status = 0
      ORDER BY created_at DESC
      LIMIT ?
    `;

    return await db.query(sql, [limit]);
  }

  /**
   * 接单
   * @param {string} orderId - 订单ID
   * @param {string} driverId - 司机ID
   * @returns {Promise<Object>}
   */
  static async accept(orderId, driverId) {
    const sql = `
      UPDATE ride_orders 
      SET status = 1, driver_id = ?, accepted_at = NOW()
      WHERE order_id = ? AND status = 0
    `;

    return await db.update(sql, [driverId, orderId]);
  }

  /**
   * 取消订单
   * @param {string} orderId - 订单ID
   * @param {string} reason - 取消原因
   * @returns {Promise<Object>}
   */
  static async cancel(orderId, reason) {
    const sql = `
      UPDATE ride_orders 
      SET status = 4, cancelled_at = NOW(), cancel_reason = ?
      WHERE order_id = ? AND status IN (0, 1)
    `;

    return await db.update(sql, [reason, orderId]);
  }
}

module.exports = RideOrder;
