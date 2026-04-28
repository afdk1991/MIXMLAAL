/**
 * 订阅服务
 * 版本: v2.0.0
 * 说明: 管理用户订阅的创建、查询、更新和删除
 */

class SubscriptionService {
  constructor(db, cache = null) {
    this.db = db;
    this.cache = cache;
    this.cacheTTL = 300;
    this.subscriptionCache = new Map();
  }

  async getCached(key) {
    if (!this.cache) return null;
    const cached = this.subscriptionCache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTTL * 1000) {
      return cached.data;
    }
    return null;
  }

  setCache(key, data) {
    this.subscriptionCache.set(key, { data, timestamp: Date.now() });
  }

  clearCache(userId = null) {
    if (!userId) {
      this.subscriptionCache.clear();
      return;
    }
    for (const key of this.subscriptionCache.keys()) {
      if (key.includes(userId)) {
        this.subscriptionCache.delete(key);
      }
    }
  }

  async createSubscription(subscriptionData) {
    try {
      const subscriptionId = `SUB${Date.now()}`;
      const now = new Date().toISOString();

      await this.db.run(
        `INSERT INTO subscriptions (subscriptionId, userId, packageId, packageName, subscribeTime, expireTime, status, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          subscriptionId,
          subscriptionData.userId,
          subscriptionData.packageId,
          subscriptionData.packageName,
          subscriptionData.subscribeTime || now,
          subscriptionData.expireTime,
          subscriptionData.status || 'active',
          now,
          now,
        ],
      );

      this.clearCache(subscriptionData.userId);

      return {
        ...subscriptionData,
        subscriptionId,
        createdAt: now,
        updatedAt: now
      };
    } catch (error) {
      console.error('创建订阅错误:', error);
      throw error;
    }
  }

  async getSubscription(subscriptionId) {
    const cacheKey = `subscription:${subscriptionId}`;
    const cached = await this.getCached(cacheKey);
    if (cached) return cached;

    try {
      const subscriptions = await this.db.execute(
        'SELECT * FROM subscriptions WHERE subscriptionId = ?',
        [subscriptionId],
      );

      if (subscriptions.length === 0) {
        return null;
      }

      this.setCache(cacheKey, subscriptions[0]);
      return subscriptions[0];
    } catch (error) {
      console.error('获取订阅错误:', error);
      throw error;
    }
  }

  async getUserSubscriptions(userId, options = {}) {
    const cacheKey = `user_subscriptions:${userId}:${JSON.stringify(options)}`;
    const cached = await this.getCached(cacheKey);
    if (cached) return cached;

    try {
      const { page = 1, limit = 10, status = null } = options;
      const offset = (page - 1) * limit;

      let sql = 'SELECT * FROM subscriptions WHERE userId = ?';
      const params = [userId];

      if (status !== null) {
        sql += ' AND status = ?';
        params.push(status);
      }

      sql += ' ORDER BY createdAt DESC LIMIT ? OFFSET ?';
      params.push(parseInt(limit, 10), parseInt(offset, 10));

      const subscriptions = await this.db.execute(sql, params);

      let countSql = 'SELECT COUNT(*) as total FROM subscriptions WHERE userId = ?';
      const countParams = [userId];

      if (status !== null) {
        countSql += ' AND status = ?';
        countParams.push(status);
      }

      const totalResult = await this.db.execute(countSql, countParams);
      const total = totalResult[0].total;

      const result = {
        subscriptions,
        pagination: {
          page: parseInt(page, 10),
          limit: parseInt(limit, 10),
          total,
          totalPages: Math.ceil(total / limit),
        },
      };

      this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error('获取用户订阅错误:', error);
      throw error;
    }
  }

  async updateSubscription(subscriptionId, updates) {
    try {
      const updateFields = [];
      const updateValues = [];

      if (updates.status !== undefined) {
        updateFields.push('status = ?');
        updateValues.push(updates.status);
      }
      if (updates.expireTime !== undefined) {
        updateFields.push('expireTime = ?');
        updateValues.push(updates.expireTime);
      }

      if (updateFields.length > 0) {
        updateFields.push('updatedAt = ?');
        updateValues.push(new Date().toISOString());
        updateValues.push(subscriptionId);

        const sql = `UPDATE subscriptions SET ${updateFields.join(', ')} WHERE subscriptionId = ?`;
        await this.db.run(sql, updateValues);
      }

      this.subscriptionCache.delete(`subscription:${subscriptionId}`);
      return this.getSubscription(subscriptionId);
    } catch (error) {
      console.error('更新订阅错误:', error);
      throw error;
    }
  }

  async deleteSubscription(subscriptionId) {
    try {
      const subscription = await this.getSubscription(subscriptionId);
      await this.db.run(
        'DELETE FROM subscriptions WHERE subscriptionId = ?',
        [subscriptionId],
      );

      if (subscription) {
        this.clearCache(subscription.userId);
      }

      return true;
    } catch (error) {
      console.error('删除订阅错误:', error);
      throw error;
    }
  }

  async checkSubscriptionExpiry(subscriptionId) {
    try {
      const subscription = await this.getSubscription(subscriptionId);
      if (!subscription) {
        return true;
      }

      const now = new Date();
      const expireTime = new Date(subscription.expireTime);

      if (now > expireTime) {
        await this.updateSubscription(subscriptionId, { status: 'expired' });
        return true;
      }

      return false;
    } catch (error) {
      console.error('检查订阅过期错误:', error);
      throw error;
    }
  }

  async getActiveSubscription(userId) {
    try {
      const subscriptions = await this.db.execute(
        `SELECT * FROM subscriptions WHERE userId = ? AND status = 'active' AND expireTime > ? ORDER BY expireTime DESC LIMIT 1`,
        [userId, new Date().toISOString()],
      );

      return subscriptions.length > 0 ? subscriptions[0] : null;
    } catch (error) {
      console.error('获取有效订阅错误:', error);
      throw error;
    }
  }

  async renewSubscription(subscriptionId, newExpireTime) {
    try {
      const subscription = await this.getSubscription(subscriptionId);
      if (!subscription) {
        throw new Error('订阅不存在');
      }

      await this.updateSubscription(subscriptionId, {
        expireTime: newExpireTime,
        status: 'active'
      });

      this.clearCache(subscription.userId);
      return this.getSubscription(subscriptionId);
    } catch (error) {
      console.error('续订订阅错误:', error);
      throw error;
    }
  }

  async getExpiringSubscriptions(userId, daysThreshold = 7) {
    try {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + daysThreshold);

      const subscriptions = await this.db.execute(
        `SELECT * FROM subscriptions
         WHERE userId = ? AND status = 'active' AND expireTime <= ? AND expireTime > ?
         ORDER BY expireTime ASC`,
        [userId, futureDate.toISOString(), new Date().toISOString()],
      );

      return subscriptions;
    } catch (error) {
      console.error('获取即将过期订阅错误:', error);
      throw error;
    }
  }
}

module.exports = SubscriptionService;