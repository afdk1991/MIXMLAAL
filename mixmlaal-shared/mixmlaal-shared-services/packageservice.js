/**
 * 服务套餐服务
 * 版本: v2.0.0
 * 说明: 管理服务套餐的创建、查询、更新和删除
 */

class PackageService {
  constructor(db, cache = null) {
    this.db = db;
    this.cache = cache;
    this.cacheTTL = 300;
    this.packageCache = new Map();
  }

  async getCached(key) {
    if (!this.cache) return null;
    const cached = this.packageCache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTTL * 1000) {
      return cached.data;
    }
    return null;
  }

  setCache(key, data) {
    this.packageCache.set(key, { data, timestamp: Date.now() });
  }

  clearCache(userId = null) {
    if (!userId) {
      this.packageCache.clear();
      return;
    }
    for (const key of this.packageCache.keys()) {
      if (key.includes(userId)) {
        this.packageCache.delete(key);
      }
    }
  }

  async createPackage(packageData) {
    try {
      const packageId = `PACKAGE${Date.now()}`;
      const now = new Date().toISOString();

      await this.db.run(
        `INSERT INTO servicePackages (packageId, userId, rideId, foodOrderId, rideInfo, foodInfo, totalAmount, paymentMethod, status, paymentStatus, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          packageId,
          packageData.userId,
          packageData.rideId,
          packageData.foodOrderId,
          JSON.stringify(packageData.rideInfo),
          JSON.stringify(packageData.foodInfo),
          packageData.totalAmount,
          packageData.paymentMethod || 'online',
          packageData.status || 'pending',
          packageData.paymentStatus || 'unpaid',
          now,
          now,
        ],
      );

      this.clearCache(packageData.userId);

      return {
        ...packageData,
        packageId,
        createdAt: now,
        updatedAt: now
      };
    } catch (error) {
      console.error('创建服务套餐错误:', error);
      throw error;
    }
  }

  async getPackage(packageId) {
    const cacheKey = `package:${packageId}`;
    const cached = await this.getCached(cacheKey);
    if (cached) return cached;

    try {
      const packages = await this.db.execute(
        'SELECT * FROM servicePackages WHERE packageId = ?',
        [packageId],
      );

      if (packages.length === 0) {
        return null;
      }

      const pkg = packages[0];
      pkg.rideInfo = typeof pkg.rideInfo === 'string' ? JSON.parse(pkg.rideInfo) : pkg.rideInfo;
      pkg.foodInfo = typeof pkg.foodInfo === 'string' ? JSON.parse(pkg.foodInfo) : pkg.foodInfo;

      this.setCache(cacheKey, pkg);
      return pkg;
    } catch (error) {
      console.error('获取服务套餐错误:', error);
      throw error;
    }
  }

  async getUserPackages(userId, options = {}) {
    const cacheKey = `user_packages:${userId}:${JSON.stringify(options)}`;
    const cached = await this.getCached(cacheKey);
    if (cached) return cached;

    try {
      const { page = 1, limit = 10, status = null, paymentStatus = null } = options;
      const offset = (page - 1) * limit;

      let sql = 'SELECT * FROM servicePackages WHERE userId = ?';
      const params = [userId];

      if (status !== null) {
        sql += ' AND status = ?';
        params.push(status);
      }

      if (paymentStatus !== null) {
        sql += ' AND paymentStatus = ?';
        params.push(paymentStatus);
      }

      sql += ' ORDER BY createdAt DESC LIMIT ? OFFSET ?';
      params.push(parseInt(limit, 10), parseInt(offset, 10));

      const packages = await this.db.execute(sql, params);

      const parsedPackages = packages.map(pkg => ({
        ...pkg,
        rideInfo: typeof pkg.rideInfo === 'string' ? JSON.parse(pkg.rideInfo) : pkg.rideInfo,
        foodInfo: typeof pkg.foodInfo === 'string' ? JSON.parse(pkg.foodInfo) : pkg.foodInfo,
      }));

      let countSql = 'SELECT COUNT(*) as total FROM servicePackages WHERE userId = ?';
      const countParams = [userId];

      if (status !== null) {
        countSql += ' AND status = ?';
        countParams.push(status);
      }

      if (paymentStatus !== null) {
        countSql += ' AND paymentStatus = ?';
        countParams.push(paymentStatus);
      }

      const totalResult = await this.db.execute(countSql, countParams);
      const total = totalResult[0].total;

      const result = {
        packages: parsedPackages,
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
      console.error('获取用户服务套餐错误:', error);
      throw error;
    }
  }

  async updatePackage(packageId, updates) {
    try {
      const updateFields = [];
      const updateValues = [];

      if (updates.status !== undefined) {
        updateFields.push('status = ?');
        updateValues.push(updates.status);
      }
      if (updates.paymentStatus !== undefined) {
        updateFields.push('paymentStatus = ?');
        updateValues.push(updates.paymentStatus);
      }

      if (updateFields.length > 0) {
        updateFields.push('updatedAt = ?');
        updateValues.push(new Date().toISOString());
        updateValues.push(packageId);

        const sql = `UPDATE servicePackages SET ${updateFields.join(', ')} WHERE packageId = ?`;
        await this.db.run(sql, updateValues);
      }

      this.packageCache.delete(`package:${packageId}`);
      return this.getPackage(packageId);
    } catch (error) {
      console.error('更新服务套餐错误:', error);
      throw error;
    }
  }

  async deletePackage(packageId) {
    try {
      const pkg = await this.getPackage(packageId);
      await this.db.run(
        'DELETE FROM servicePackages WHERE packageId = ?',
        [packageId],
      );

      if (pkg) {
        this.clearCache(pkg.userId);
      }

      return true;
    } catch (error) {
      console.error('删除服务套餐错误:', error);
      throw error;
    }
  }

  async getPackageStats(userId) {
    try {
      const result = await this.db.execute(
        `SELECT status, paymentStatus, COUNT(*) as count, SUM(totalAmount) as totalAmount
         FROM servicePackages
         WHERE userId = ?
         GROUP BY status, paymentStatus`,
        [userId],
      );
      return result;
    } catch (error) {
      console.error('获取套餐统计错误:', error);
      throw error;
    }
  }

  async getPendingPaymentPackages(userId) {
    try {
      const packages = await this.db.execute(
        `SELECT * FROM servicePackages
         WHERE userId = ? AND paymentStatus = 'unpaid'
         ORDER BY createdAt DESC`,
        [userId],
      );

      return packages.map(pkg => ({
        ...pkg,
        rideInfo: typeof pkg.rideInfo === 'string' ? JSON.parse(pkg.rideInfo) : pkg.rideInfo,
        foodInfo: typeof pkg.foodInfo === 'string' ? JSON.parse(pkg.foodInfo) : pkg.foodInfo,
      }));
    } catch (error) {
      console.error('获取待支付套餐错误:', error);
      throw error;
    }
  }
}

module.exports = PackageService;