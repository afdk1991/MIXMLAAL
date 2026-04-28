/**
 * 用户数据模型
 * 版本: v1.0.0.0
 */

const db = require('../config/database');
const bcrypt = require('bcryptjs');
const { generateId } = require('../../../../shared/utils');

class User {
  /**
   * 根据ID查找用户
   * @param {string} userId - 用户ID
   * @returns {Promise<Object|null>}
   */
  static async findById(userId) {
    const sql = `
      SELECT user_id, phone, email, nickname, avatar, real_name, 
             gender, birthday, status, user_type, created_at, last_login_at
      FROM users 
      WHERE user_id = ? AND status != 2
    `;
    return await db.queryOne(sql, [userId]);
  }

  /**
   * 根据手机号查找用户
   * @param {string} phone - 手机号
   * @returns {Promise<Object|null>}
   */
  static async findByPhone(phone) {
    const sql = `
      SELECT user_id, phone, password_hash, status, user_type
      FROM users 
      WHERE phone = ?
    `;
    return await db.queryOne(sql, [phone]);
  }

  /**
   * 创建用户
   * @param {Object} userData - 用户数据
   * @returns {Promise<Object>}
   */
  static async create(userData) {
    const userId = generateId('USER');
    const passwordHash = await bcrypt.hash(userData.password, 10);

    const sql = `
      INSERT INTO users (user_id, phone, password_hash, nickname, status, user_type)
      VALUES (?, ?, ?, ?, 1, 1)
    `;

    const result = await db.insert(sql, [
      userId,
      userData.phone,
      passwordHash,
      userData.nickname || `用户${userData.phone.slice(-4)}`,
    ]);

    return {
      userId,
      insertId: result.insertId,
    };
  }

  /**
   * 更新用户信息
   * @param {string} userId - 用户ID
   * @param {Object} updateData - 更新数据
   * @returns {Promise<Object>}
   */
  static async update(userId, updateData) {
    const allowedFields = ['nickname', 'avatar', 'email', 'real_name', 'gender', 'birthday'];
    const fields = [];
    const values = [];

    for (const [key, value] of Object.entries(updateData)) {
      if (allowedFields.includes(key)) {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    }

    if (fields.length === 0) {
      return { affectedRows: 0 };
    }

    values.push(userId);
    const sql = `UPDATE users SET ${fields.join(', ')} WHERE user_id = ?`;
    return await db.update(sql, values);
  }

  /**
   * 更新登录时间
   * @param {string} userId - 用户ID
   * @returns {Promise<void>}
   */
  static async updateLoginTime(userId) {
    const sql = 'UPDATE users SET last_login_at = NOW() WHERE user_id = ?';
    await db.update(sql, [userId]);
  }

  /**
   * 验证密码
   * @param {string} password - 明文密码
   * @param {string} hash - 密码哈希
   * @returns {Promise<boolean>}
   */
  static async verifyPassword(password, hash) {
    return await bcrypt.compare(password, hash);
  }

  /**
   * 修改密码
   * @param {string} userId - 用户ID
   * @param {string} newPassword - 新密码
   * @returns {Promise<Object>}
   */
  static async changePassword(userId, newPassword) {
    const passwordHash = await bcrypt.hash(newPassword, 10);
    const sql = 'UPDATE users SET password_hash = ? WHERE user_id = ?';
    return await db.update(sql, [passwordHash, userId]);
  }

  /**
   * 获取用户列表（分页）
   * @param {Object} options - 查询选项
   * @returns {Promise<Object>}
   */
  static async findList(options = {}) {
    const { page = 1, limit = 20, status, userType } = options;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE status != 2';
    const params = [];

    if (status !== undefined) {
      whereClause += ' AND status = ?';
      params.push(status);
    }

    if (userType !== undefined) {
      whereClause += ' AND user_type = ?';
      params.push(userType);
    }

    const countSql = `SELECT COUNT(*) as total FROM users ${whereClause}`;
    const listSql = `
      SELECT user_id, phone, nickname, avatar, status, user_type, created_at
      FROM users ${whereClause}
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
}

module.exports = User;
