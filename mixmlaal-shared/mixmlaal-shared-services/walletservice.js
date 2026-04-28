/**
 * 钱包服务
 * 版本: v2.0.0
 * 说明: 管理用户钱包、充值、提现、交易记录
 */

class WalletService {
  constructor(db, cache = null) {
    this.db = db;
    this.cache = cache;
    this.cacheTTL = 60;
    this.walletCache = new Map();
  }

  async getCached(key) {
    if (!this.cache) return null;
    const cached = this.walletCache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTTL * 1000) {
      return cached.data;
    }
    return null;
  }

  setCache(key, data) {
    this.walletCache.set(key, { data, timestamp: Date.now() });
  }

  clearCache(userId = null) {
    if (!userId) {
      this.walletCache.clear();
      return;
    }
    this.walletCache.delete(`wallet:${userId}`);
    this.walletCache.delete(`transactions:${userId}`);
  }

  async getWallet(userId) {
    const cacheKey = `wallet:${userId}`;
    const cached = await this.getCached(cacheKey);
    if (cached) return cached;

    try {
      const wallets = await this.db.execute(
        'SELECT * FROM user_wallets WHERE user_id = ?',
        [userId],
      );

      if (wallets.length === 0) {
        const wallet = await this.createWallet(userId);
        this.setCache(cacheKey, wallet);
        return wallet;
      }

      this.setCache(cacheKey, wallets[0]);
      return wallets[0];
    } catch (error) {
      console.error('获取钱包错误:', error);
      throw error;
    }
  }

  async createWallet(userId) {
    try {
      const walletId = `WALLET${Date.now()}`;
      const now = new Date().toISOString();

      await this.db.run(
        `INSERT INTO user_wallets (user_id, balance, frozen_amount, total_recharge, total_consume, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [userId, 0.00, 0.00, 0.00, 0.00, now, now],
      );

      return {
        user_id: userId,
        balance: 0.00,
        frozen_amount: 0.00,
        total_recharge: 0.00,
        total_consume: 0.00,
      };
    } catch (error) {
      console.error('创建钱包错误:', error);
      throw error;
    }
  }

  async recharge(userId, amount, method = 'wechat') {
    try {
      const wallet = await this.getWallet(userId);
      const balanceBefore = parseFloat(wallet.balance);
      const balanceAfter = balanceBefore + parseFloat(amount);

      await this.db.run(
        `UPDATE user_wallets SET balance = ?, total_recharge = total_recharge + ?, updated_at = ? WHERE user_id = ?`,
        [balanceAfter, amount, new Date().toISOString(), userId],
      );

      const transactionId = `TXN${Date.now()}`;
      const now = new Date().toISOString();

      await this.db.run(
        `INSERT INTO wallet_transactions (transaction_id, user_id, type, amount, balance_before, balance_after, related_type, remark, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [transactionId, userId, 1, amount, balanceBefore, balanceAfter, 'recharge', `充值${amount}元`, now],
      );

      this.clearCache(userId);

      return {
        transactionId,
        userId,
        type: 1,
        amount,
        balanceBefore,
        balanceAfter,
        createdAt: now,
      };
    } catch (error) {
      console.error('充值错误:', error);
      throw error;
    }
  }

  async consume(userId, amount, relatedId, relatedType, remark = '') {
    try {
      const wallet = await this.getWallet(userId);
      const balanceBefore = parseFloat(wallet.balance);
      const balanceAfter = balanceBefore - parseFloat(amount);

      if (balanceAfter < 0) {
        throw new Error('余额不足');
      }

      await this.db.run(
        `UPDATE user_wallets SET balance = ?, total_consume = total_consume + ?, updated_at = ? WHERE user_id = ?`,
        [balanceAfter, amount, new Date().toISOString(), userId],
      );

      const transactionId = `TXN${Date.now()}`;
      const now = new Date().toISOString();

      await this.db.run(
        `INSERT INTO wallet_transactions (transaction_id, user_id, type, amount, balance_before, balance_after, related_id, related_type, remark, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [transactionId, userId, 2, amount, balanceBefore, balanceAfter, relatedId, relatedType, remark, now],
      );

      this.clearCache(userId);

      return {
        transactionId,
        userId,
        type: 2,
        amount,
        balanceBefore,
        balanceAfter,
        createdAt: now,
      };
    } catch (error) {
      console.error('消费错误:', error);
      throw error;
    }
  }

  async refund(userId, amount, relatedId, relatedType) {
    try {
      const wallet = await this.getWallet(userId);
      const balanceBefore = parseFloat(wallet.balance);
      const balanceAfter = balanceBefore + parseFloat(amount);

      await this.db.run(
        `UPDATE user_wallets SET balance = ?, updated_at = ? WHERE user_id = ?`,
        [balanceAfter, new Date().toISOString(), userId],
      );

      const transactionId = `TXN${Date.now()}`;
      const now = new Date().toISOString();

      await this.db.run(
        `INSERT INTO wallet_transactions (transaction_id, user_id, type, amount, balance_before, balance_after, related_id, related_type, remark, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [transactionId, userId, 3, amount, balanceBefore, balanceAfter, relatedId, relatedType, '退款', now],
      );

      this.clearCache(userId);

      return {
        transactionId,
        userId,
        type: 3,
        amount,
        balanceBefore,
        balanceAfter,
        createdAt: now,
      };
    } catch (error) {
      console.error('退款错误:', error);
      throw error;
    }
  }

  async getTransactions(userId, options = {}) {
    const cacheKey = `transactions:${userId}:${JSON.stringify(options)}`;
    const cached = await this.getCached(cacheKey);
    if (cached) return cached;

    try {
      const { page = 1, limit = 20, type = null } = options;
      const offset = (page - 1) * limit;

      let sql = 'SELECT * FROM wallet_transactions WHERE user_id = ?';
      const params = [userId];

      if (type !== null) {
        sql += ' AND type = ?';
        params.push(type);
      }

      sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
      params.push(parseInt(limit, 10), parseInt(offset, 10));

      const transactions = await this.db.execute(sql, params);

      let countSql = 'SELECT COUNT(*) as total FROM wallet_transactions WHERE user_id = ?';
      const countParams = [userId];

      if (type !== null) {
        countSql += ' AND type = ?';
        countParams.push(type);
      }

      const totalResult = await this.db.execute(countSql, countParams);
      const total = totalResult[0].total;

      const result = {
        transactions,
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
      console.error('获取交易记录错误:', error);
      throw error;
    }
  }

  async withdraw(userId, amount, bankCard) {
    try {
      const wallet = await this.getWallet(userId);
      const balance = parseFloat(wallet.balance);

      if (balance < parseFloat(amount)) {
        throw new Error('余额不足，无法提现');
      }

      const minWithdrawal = 100;
      if (parseFloat(amount) < minWithdrawal) {
        throw new Error(`最低提现金额为${minWithdrawal}元`);
      }

      const frozenAmount = parseFloat(wallet.frozen_amount) + parseFloat(amount);
      const newBalance = balance - parseFloat(amount);

      await this.db.run(
        `UPDATE user_wallets SET balance = ?, frozen_amount = ?, updated_at = ? WHERE user_id = ?`,
        [newBalance, frozenAmount, new Date().toISOString(), userId],
      );

      const transactionId = `TXN${Date.now()}`;
      const now = new Date().toISOString();

      await this.db.run(
        `INSERT INTO wallet_transactions (transaction_id, user_id, type, amount, balance_before, balance_after, related_type, remark, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [transactionId, userId, 4, amount, balance, newBalance, 'withdraw', `提现到银行卡${bankCard}`, now],
      );

      this.clearCache(userId);

      return {
        transactionId,
        userId,
        type: 4,
        amount,
        status: 'pending',
        createdAt: now,
      };
    } catch (error) {
      console.error('提现错误:', error);
      throw error;
    }
  }

  async getBalance(userId) {
    const wallet = await this.getWallet(userId);
    return {
      balance: parseFloat(wallet.balance),
      frozen: parseFloat(wallet.frozen_amount),
      available: parseFloat(wallet.balance) - parseFloat(wallet.frozen_amount),
    };
  }

  async getTransactionStats(userId, startDate, endDate) {
    try {
      const result = await this.db.execute(
        `SELECT type, COUNT(*) as count, SUM(amount) as total
         FROM wallet_transactions
         WHERE user_id = ? AND created_at BETWEEN ? AND ?
         GROUP BY type`,
        [userId, startDate, endDate],
      );
      return result;
    } catch (error) {
      console.error('获取交易统计错误:', error);
      throw error;
    }
  }
}

module.exports = WalletService;