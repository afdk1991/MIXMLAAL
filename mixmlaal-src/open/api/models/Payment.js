/**
 * 支付数据模型
 * 版本: v1.0.0.0
 */

const db = require('../config/database');
const { generateId } = require('../../../../shared/utils');

class Payment {
  /**
   * 根据ID查找支付记录
   * @param {string} paymentId - 支付ID
   * @returns {Promise<Object|null>}
   */
  static async findById(paymentId) {
    const sql = `
      SELECT * FROM payments 
      WHERE payment_id = ?
    `;
    return await db.queryOne(sql, [paymentId]);
  }

  /**
   * 根据订单查找支付记录
   * @param {string} orderId - 订单ID
   * @param {number} orderType - 订单类型
   * @returns {Promise<Object|null>}
   */
  static async findByOrder(orderId, orderType) {
    const sql = `
      SELECT * FROM payments 
      WHERE order_id = ? AND order_type = ?
      ORDER BY created_at DESC
      LIMIT 1
    `;
    return await db.queryOne(sql, [orderId, orderType]);
  }

  /**
   * 创建支付记录
   * @param {Object} paymentData - 支付数据
   * @returns {Promise<Object>}
   */
  static async create(paymentData) {
    const paymentId = generateId('PAY');

    const sql = `
      INSERT INTO payments (
        payment_id, order_id, order_type, user_id,
        channel, amount, status, expired_at
      ) VALUES (?, ?, ?, ?, ?, ?, 0, DATE_ADD(NOW(), INTERVAL 30 MINUTE))
    `;

    const result = await db.insert(sql, [
      paymentId,
      paymentData.orderId,
      paymentData.orderType,
      paymentData.userId,
      paymentData.channel,
      paymentData.amount,
    ]);

    return {
      paymentId,
      insertId: result.insertId,
    };
  }

  /**
   * 更新支付状态为成功
   * @param {string} paymentId - 支付ID
   * @param {Object} payData - 支付数据
   * @returns {Promise<Object>}
   */
  static async markAsPaid(paymentId, payData) {
    const sql = `
      UPDATE payments 
      SET status = 1,
          paid_at = NOW(),
          third_party_id = ?,
          third_party_data = ?
      WHERE payment_id = ? AND status = 0
    `;

    return await db.update(sql, [
      payData.thirdPartyId,
      JSON.stringify(payData.thirdPartyData || {}),
      paymentId,
    ]);
  }

  /**
   * 更新支付状态为失败
   * @param {string} paymentId - 支付ID
   * @returns {Promise<Object>}
   */
  static async markAsFailed(paymentId) {
    const sql = `
      UPDATE payments 
      SET status = 2
      WHERE payment_id = ? AND status = 0
    `;

    return await db.update(sql, [paymentId]);
  }

  /**
   * 更新支付状态为已退款
   * @param {string} paymentId - 支付ID
   * @returns {Promise<Object>}
   */
  static async markAsRefunded(paymentId) {
    const sql = `
      UPDATE payments 
      SET status = 3
      WHERE payment_id = ? AND status = 1
    `;

    return await db.update(sql, [paymentId]);
  }

  /**
   * 获取用户的支付记录列表
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

    const countSql = `SELECT COUNT(*) as total FROM payments ${whereClause}`;
    const listSql = `
      SELECT payment_id, order_id, order_type, channel,
             amount, status, paid_at, created_at
      FROM payments ${whereClause}
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
   * 创建退款记录
   * @param {Object} refundData - 退款数据
   * @returns {Promise<Object>}
   */
  static async createRefund(refundData) {
    const refundId = generateId('REF');

    const sql = `
      INSERT INTO refunds (
        refund_id, payment_id, order_id, user_id,
        amount, reason, status
      ) VALUES (?, ?, ?, ?, ?, ?, 0)
    `;

    const result = await db.insert(sql, [
      refundId,
      refundData.paymentId,
      refundData.orderId,
      refundData.userId,
      refundData.amount,
      refundData.reason,
    ]);

    return {
      refundId,
      insertId: result.insertId,
    };
  }

  /**
   * 更新退款状态为成功
   * @param {string} refundId - 退款ID
   * @param {string} thirdPartyId - 第三方退款单号
   * @returns {Promise<Object>}
   */
  static async markRefundAsCompleted(refundId, thirdPartyId) {
    const sql = `
      UPDATE refunds 
      SET status = 1,
          completed_at = NOW(),
          third_party_id = ?
      WHERE refund_id = ? AND status = 0
    `;

    return await db.update(sql, [thirdPartyId, refundId]);
  }

  /**
   * 获取退款记录
   * @param {string} refundId - 退款ID
   * @returns {Promise<Object|null>}
   */
  static async findRefundById(refundId) {
    const sql = `
      SELECT * FROM refunds 
      WHERE refund_id = ?
    `;
    return await db.queryOne(sql, [refundId]);
  }
}

module.exports = Payment;
