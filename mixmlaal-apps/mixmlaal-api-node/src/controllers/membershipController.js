const { User, PointHistory, MembershipLevel } = require('../models');
const cache = require('../config/redis');

// 会员系统控制器
class MembershipController {
  // 获取所有会员等级
  async getMembershipLevels(req, res) {
    try {
      // 生成缓存键
      const cacheKey = 'membership_levels';
      
      // 尝试从缓存获取
      const cachedData = await cache.get(cacheKey);
      if (cachedData) {
        return res.json(cachedData);
      }
      
      const levels = await MembershipLevel.findAll({
        order: [['id', 'ASC']]
      });
      
      const responseData = {
        code: 200,
        message: '获取会员等级列表成功',
        data: levels
      };
      
      // 缓存结果
      await cache.set(cacheKey, responseData, 3600);
      
      res.json(responseData);
    } catch (error) {
      console.error('获取会员等级列表失败:', error);
      res.status(500).json({
        code: 500,
        message: '获取会员等级列表失败',
        data: null
      });
    }
  }

  // 获取单个会员等级
  async getMembershipLevelById(req, res) {
    try {
      const { id } = req.params;
      
      // 生成缓存键
      const cacheKey = `membership_level:${id}`;
      
      // 尝试从缓存获取
      const cachedData = await cache.get(cacheKey);
      if (cachedData) {
        return res.json(cachedData);
      }
      
      const level = await MembershipLevel.findByPk(id);
      
      if (!level) {
        return res.json({
          code: 404,
          message: '会员等级不存在',
          data: null
        });
      }
      
      const responseData = {
        code: 200,
        message: '获取会员等级成功',
        data: level
      };
      
      // 缓存结果
      await cache.set(cacheKey, responseData, 3600);
      
      res.json(responseData);
    } catch (error) {
      console.error('获取会员等级失败:', error);
      res.status(500).json({
        code: 500,
        message: '获取会员等级失败',
        data: null
      });
    }
  }

  // 获取用户会员信息
  async getUserMembership(req, res) {
    try {
      const userId = req.user.id;
      
      // 生成缓存键
      const cacheKey = `user_membership:${userId}`;
      
      // 尝试从缓存获取
      const cachedData = await cache.get(cacheKey);
      if (cachedData) {
        return res.json(cachedData);
      }
      
      const user = await User.findByPk(userId, {
        attributes: ['id', 'name', 'membershipLevel', 'membershipExpiry']
      });
      
      const responseData = {
        code: 200,
        message: '获取用户会员信息成功',
        data: user
      };
      
      // 缓存结果
      await cache.set(cacheKey, responseData, 300);
      
      res.json(responseData);
    } catch (error) {
      console.error('获取用户会员信息失败:', error);
      res.status(500).json({
        code: 500,
        message: '获取用户会员信息失败',
        data: null
      });
    }
  }

  // 升级会员等级
  async upgradeMembership(req, res) {
    try {
      const userId = req.user.id;
      const { levelId } = req.body;
      
      const level = await MembershipLevel.findByPk(levelId);
      if (!level) {
        return res.json({
          code: 404,
          message: '会员等级不存在',
          data: null
        });
      }
      
      const user = await User.findByPk(userId);
      
      // 计算会员到期时间
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + level.duration);
      
      await user.update({
        membershipLevel: level.level,
        membershipExpiry: expiryDate
      });
      
      // 清除缓存
      await cache.del(`user_membership:${userId}`);
      
      res.json({
        code: 200,
        message: '升级会员等级成功',
        data: {
          membershipLevel: level.level,
          membershipExpiry: expiryDate
        }
      });
    } catch (error) {
      console.error('升级会员等级失败:', error);
      res.status(500).json({
        code: 500,
        message: '升级会员等级失败',
        data: null
      });
    }
  }

  // 续费会员
  async renewMembership(req, res) {
    try {
      const userId = req.user.id;
      const { months } = req.body;
      
      const user = await User.findByPk(userId);
      
      // 计算新的到期时间
      const expiryDate = user.membershipExpiry || new Date();
      expiryDate.setMonth(expiryDate.getMonth() + months);
      
      await user.update({
        membershipExpiry: expiryDate
      });
      
      // 清除缓存
      await cache.del(`user_membership:${userId}`);
      
      res.json({
        code: 200,
        message: '续费会员成功',
        data: {
          membershipExpiry: expiryDate
        }
      });
    } catch (error) {
      console.error('续费会员失败:', error);
      res.status(500).json({
        code: 500,
        message: '续费会员失败',
        data: null
      });
    }
  }

  // 获取用户积分
  async getUserPoints(req, res) {
    try {
      const userId = req.user.id;
      
      // 生成缓存键
      const cacheKey = `user_points:${userId}`;
      
      // 尝试从缓存获取
      const cachedData = await cache.get(cacheKey);
      if (cachedData) {
        return res.json(cachedData);
      }
      
      const user = await User.findByPk(userId, {
        attributes: ['id', 'name', 'points']
      });
      
      const responseData = {
        code: 200,
        message: '获取用户积分成功',
        data: user
      };
      
      // 缓存结果
      await cache.set(cacheKey, responseData, 300);
      
      res.json(responseData);
    } catch (error) {
      console.error('获取用户积分失败:', error);
      res.status(500).json({
        code: 500,
        message: '获取用户积分失败',
        data: null
      });
    }
  }

  // 获取用户积分历史
  async getPointHistory(req, res) {
    try {
      const userId = req.user.id;
      const { page = 1, pageSize = 10 } = req.query;
      
      // 生成缓存键
      const cacheKey = `point_history:${userId}:${page}:${pageSize}`;
      
      // 尝试从缓存获取
      const cachedData = await cache.get(cacheKey);
      if (cachedData) {
        return res.json(cachedData);
      }
      
      const { count, rows } = await PointHistory.findAndCountAll({
        where: { userId },
        limit: parseInt(pageSize),
        offset: (parseInt(page) - 1) * parseInt(pageSize),
        order: [['createdAt', 'DESC']]
      });
      
      const responseData = {
        code: 200,
        message: '获取积分历史成功',
        data: {
          items: rows,
          total: count,
          page: parseInt(page),
          pageSize: parseInt(pageSize)
        }
      };
      
      // 缓存结果
      await cache.set(cacheKey, responseData, 300);
      
      res.json(responseData);
    } catch (error) {
      console.error('获取积分历史失败:', error);
      res.status(500).json({
        code: 500,
        message: '获取积分历史失败',
        data: null
      });
    }
  }

  // 增加积分
  async earnPoints(req, res) {
    try {
      const userId = req.user.id;
      const { points, reason, orderId } = req.body;
      
      if (points <= 0) {
        return res.json({
          code: 400,
          message: '积分必须大于0',
          data: null
        });
      }
      
      // 开始事务
      const transaction = await User.sequelize.transaction();
      
      try {
        // 更新用户积分
        const user = await User.findByPk(userId, { transaction });
        const newPoints = user.points + points;
        await user.update({ points: newPoints }, { transaction });
        
        // 记录积分历史
        await PointHistory.create({
          userId,
          points,
          type: 'earn',
          reason,
          orderId
        }, { transaction });
        
        // 提交事务
        await transaction.commit();
        
        // 清除缓存
        await cache.del(`user_points:${userId}`);
        await cache.delPattern(`point_history:${userId}:*`);
        
        res.json({
          code: 200,
          message: '增加积分成功',
          data: {
            points: newPoints
          }
        });
      } catch (error) {
        // 回滚事务
        await transaction.rollback();
        throw error;
      }
    } catch (error) {
      console.error('增加积分失败:', error);
      res.status(500).json({
        code: 500,
        message: '增加积分失败',
        data: null
      });
    }
  }

  // 消耗积分
  async spendPoints(req, res) {
    try {
      const userId = req.user.id;
      const { points, reason, orderId } = req.body;
      
      if (points <= 0) {
        return res.json({
          code: 400,
          message: '积分必须大于0',
          data: null
        });
      }
      
      // 开始事务
      const transaction = await User.sequelize.transaction();
      
      try {
        // 更新用户积分
        const user = await User.findByPk(userId, { transaction });
        
        if (user.points < points) {
          await transaction.rollback();
          return res.json({
            code: 400,
            message: '积分不足',
            data: null
          });
        }
        
        const newPoints = user.points - points;
        await user.update({ points: newPoints }, { transaction });
        
        // 记录积分历史
        await PointHistory.create({
          userId,
          points: -points,
          type: 'spend',
          reason,
          orderId
        }, { transaction });
        
        // 提交事务
        await transaction.commit();
        
        // 清除缓存
        await cache.del(`user_points:${userId}`);
        await cache.delPattern(`point_history:${userId}:*`);
        
        res.json({
          code: 200,
          message: '消耗积分成功',
          data: {
            points: newPoints
          }
        });
      } catch (error) {
        // 回滚事务
        await transaction.rollback();
        throw error;
      }
    } catch (error) {
      console.error('消耗积分失败:', error);
      res.status(500).json({
        code: 500,
        message: '消耗积分失败',
        data: null
      });
    }
  }
}

module.exports = new MembershipController();