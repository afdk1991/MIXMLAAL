const { Order, Address, DeliveryTrack } = require('../models');
const Sequelize = require('sequelize');
const { Op } = Sequelize;
const routeService = require('../services/routeService');
const cache = require('../config/redis');

// 订单控制器
class OrderController {
  // 获取订单列表
  async getOrders(req, res) {
    try {
      const userId = req.user.id;
      const { page = 1, pageSize = 10, status, deliveryManId } = req.query;
      
      // 生成缓存键
      const cacheKey = `orders:${userId}:${page}:${pageSize}:${status || 'all'}:${deliveryManId || 'all'}`;
      
      // 尝试从缓存获取
      const cachedData = await cache.get(cacheKey);
      if (cachedData) {
        return res.json(cachedData);
      }
      
      const where = {};
      
      // 如果是配送员，只查询分配给自己的订单
      if (req.user.role === 'delivery') {
        where.deliveryManId = userId;
      } else if (deliveryManId) {
        where.deliveryManId = deliveryManId;
      }
      
      if (status) {
        where.status = status;
      }
      
      const { count, rows } = await Order.findAndCountAll({
        where,
        limit: parseInt(pageSize),
        offset: (parseInt(page) - 1) * parseInt(pageSize),
        order: [['createdAt', 'DESC']],
        include: [{
          model: Address,
          attributes: ['name', 'phone', 'address', 'latitude', 'longitude']
        }]
      });
      
      const responseData = {
        code: 200,
        message: '获取订单列表成功',
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
      console.error('获取订单列表失败:', error);
      res.status(500).json({
        code: 500,
        message: '获取订单列表失败',
        data: null
      });
    }
  }

  // 获取订单详情
  async getOrderById(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      
      // 生成缓存键
      const cacheKey = `order:${id}:${userId}`;
      
      // 尝试从缓存获取
      const cachedData = await cache.get(cacheKey);
      if (cachedData) {
        return res.json(cachedData);
      }
      
      const order = await Order.findOne({
        where: { id },
        include: [{
          model: Address,
          attributes: ['name', 'phone', 'address', 'latitude', 'longitude']
        }]
      });
      
      if (!order) {
        return res.json({
          code: 404,
          message: '订单不存在',
          data: null
        });
      }
      
      // 检查权限
      if (req.user.role === 'delivery' && order.deliveryManId !== userId) {
        return res.json({
          code: 403,
          message: '无权访问此订单',
          data: null
        });
      }
      
      const responseData = {
        code: 200,
        message: '获取订单详情成功',
        data: order
      };
      
      // 缓存结果
      await cache.set(cacheKey, responseData, 600);
      
      res.json(responseData);
    } catch (error) {
      console.error('获取订单详情失败:', error);
      res.status(500).json({
        code: 500,
        message: '获取订单详情失败',
        data: null
      });
    }
  }

  // 创建订单
  async createOrder(req, res) {
    try {
      const userId = req.user.id;
      const orderData = req.body;
      
      // 生成订单号
      const orderNo = 'ORD' + Date.now() + Math.floor(Math.random() * 1000);
      
      const order = await Order.create({
        ...orderData,
        orderNo,
        userId
      });
      
      // 清除缓存
      await cache.delPattern(`orders:${userId}:*`);
      
      res.json({
        code: 200,
        message: '创建订单成功',
        data: order
      });
    } catch (error) {
      console.error('创建订单失败:', error);
      res.status(500).json({
        code: 500,
        message: '创建订单失败',
        data: null
      });
    }
  }

  // 更新订单
  async updateOrder(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const orderData = req.body;
      
      const order = await Order.findByPk(id);
      
      if (!order) {
        return res.json({
          code: 404,
          message: '订单不存在',
          data: null
        });
      }
      
      // 检查权限
      if (req.user.role === 'delivery' && order.deliveryManId !== userId) {
        return res.json({
          code: 403,
          message: '无权修改此订单',
          data: null
        });
      }
      
      await order.update(orderData);
      
      // 清除缓存
      await cache.delPattern(`orders:${userId}:*`);
      await cache.del(`order:${id}:${userId}`);
      
      res.json({
        code: 200,
        message: '更新订单成功',
        data: order
      });
    } catch (error) {
      console.error('更新订单失败:', error);
      res.status(500).json({
        code: 500,
        message: '更新订单失败',
        data: null
      });
    }
  }

  // 删除订单
  async deleteOrder(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      
      const order = await Order.findByPk(id);
      
      if (!order) {
        return res.json({
          code: 404,
          message: '订单不存在',
          data: null
        });
      }
      
      // 检查权限
      if (req.user.role === 'delivery' && order.deliveryManId !== userId) {
        return res.json({
          code: 403,
          message: '无权删除此订单',
          data: null
        });
      }
      
      await order.destroy();
      
      // 清除缓存
      await cache.delPattern(`orders:${userId}:*`);
      await cache.del(`order:${id}:${userId}`);
      
      res.json({
        code: 200,
        message: '删除订单成功',
        data: null
      });
    } catch (error) {
      console.error('删除订单失败:', error);
      res.status(500).json({
        code: 500,
        message: '删除订单失败',
        data: null
      });
    }
  }

  // 分配订单
  async assignOrder(req, res) {
    try {
      const { id, deliveryManId } = req.body;
      
      const order = await Order.findByPk(id);
      
      if (!order) {
        return res.json({
          code: 404,
          message: '订单不存在',
          data: null
        });
      }
      
      await order.update({
        deliveryManId,
        status: 'processing'
      });
      
      // 清除缓存
      await cache.delPattern(`orders:*`);
      await cache.del(`order:${id}:*`);
      
      res.json({
        code: 200,
        message: '分配订单成功',
        data: order
      });
    } catch (error) {
      console.error('分配订单失败:', error);
      res.status(500).json({
        code: 500,
        message: '分配订单失败',
        data: null
      });
    }
  }

  // 更新配送状态
  async updateDeliveryStatus(req, res) {
    try {
      const userId = req.user.id;
      const { id, status, latitude, longitude } = req.body;
      
      const order = await Order.findByPk(id);
      
      if (!order) {
        return res.json({
          code: 404,
          message: '订单不存在',
          data: null
        });
      }
      
      // 检查权限
      if (req.user.role === 'delivery' && order.deliveryManId !== userId) {
        return res.json({
          code: 403,
          message: '无权修改此订单',
          data: null
        });
      }
      
      await order.update({ status });
      
      // 记录配送轨迹
      if (latitude && longitude) {
        await DeliveryTrack.create({
          orderId: id,
          deliveryManId: order.deliveryManId,
          latitude,
          longitude,
          status
        });
      }
      
      // 清除缓存
      await cache.delPattern(`orders:${userId}:*`);
      await cache.del(`order:${id}:${userId}`);
      
      res.json({
        code: 200,
        message: '更新配送状态成功',
        data: order
      });
    } catch (error) {
      console.error('更新配送状态失败:', error);
      res.status(500).json({
        code: 500,
        message: '更新配送状态失败',
        data: null
      });
    }
  }

  // 获取配送轨迹
  async getDeliveryTrack(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      
      const order = await Order.findByPk(id);
      
      if (!order) {
        return res.json({
          code: 404,
          message: '订单不存在',
          data: null
        });
      }
      
      // 检查权限
      if (req.user.role === 'delivery' && order.deliveryManId !== userId) {
        return res.json({
          code: 403,
          message: '无权访问此订单',
          data: null
        });
      }
      
      const tracks = await DeliveryTrack.findAll({
        where: { orderId: id },
        order: [['timestamp', 'ASC']]
      });
      
      res.json({
        code: 200,
        message: '获取配送轨迹成功',
        data: tracks
      });
    } catch (error) {
      console.error('获取配送轨迹失败:', error);
      res.status(500).json({
        code: 500,
        message: '获取配送轨迹失败',
        data: null
      });
    }
  }

  // 获取订单统计信息
  async getOrderStats(req, res) {
    try {
      const userId = req.user.id;
      const { startDate, endDate } = req.query;
      
      // 生成缓存键
      const cacheKey = `order_stats:${userId}:${startDate || 'all'}:${endDate || 'all'}`;
      
      // 尝试从缓存获取
      const cachedData = await cache.get(cacheKey);
      if (cachedData) {
        return res.json(cachedData);
      }
      
      const where = {};
      
      // 如果是配送员，只查询分配给自己的订单
      if (req.user.role === 'delivery') {
        where.deliveryManId = userId;
      }
      
      // 时间范围过滤
      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) {
          where.createdAt[Op.gte] = new Date(startDate);
        }
        if (endDate) {
          where.createdAt[Op.lte] = new Date(endDate);
        }
      }
      
      // 获取订单统计信息
      const stats = await Order.findAll({
        where,
        attributes: [
          'status',
          [Sequelize.fn('COUNT', Sequelize.col('id')), 'count'],
          [Sequelize.fn('SUM', Sequelize.col('totalAmount')), 'totalAmount']
        ],
        group: ['status']
      });
      
      // 获取总订单数和总金额
      const totalStats = await Order.findOne({
        where,
        attributes: [
          [Sequelize.fn('COUNT', Sequelize.col('id')), 'totalCount'],
          [Sequelize.fn('SUM', Sequelize.col('totalAmount')), 'totalAmount']
        ]
      });
      
      const responseData = {
        code: 200,
        message: '获取订单统计信息成功',
        data: {
          statusStats: stats,
          totalStats: totalStats ? {
            totalCount: parseInt(totalStats.dataValues.totalCount) || 0,
            totalAmount: parseFloat(totalStats.dataValues.totalAmount) || 0
          } : {
            totalCount: 0,
            totalAmount: 0
          }
        }
      };
      
      // 缓存结果
      await cache.set(cacheKey, responseData, 3600);
      
      res.json(responseData);
    } catch (error) {
      console.error('获取订单统计信息失败:', error);
      res.status(500).json({
        code: 500,
        message: '获取订单统计信息失败',
        data: null
      });
    }
  }
}

module.exports = new OrderController();