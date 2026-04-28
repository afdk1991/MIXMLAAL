/**
 * 跑腿服务路由
 * 版本: v1.0.0.0
 * 说明: 跑腿订单、配送等相关接口
 */

const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const db = require('../utils/database.sqlite');

/**
 * @route   POST /api/v1/errand/estimate
 * @desc    预估跑腿价格
 * @access  Public
 */
router.post('/estimate', async (req, res) => {
  try {
    const { from, to, type = 'express', weight = 1, size = 'small' } = req.body;
    
    // 验证参数
    if (!from || !to) {
      return res.status(400).json({
        status: 'error',
        message: '出发地和目的地不能为空',
      });
    }
    
    // 价格计算
    const basePrice = 10;
    const distancePrice = 2; // 每公里
    const weightPrice = weight > 5 ? (weight - 5) * 2 : 0;
    const sizePrice = {
      small: 0,
      medium: 5,
      large: 10,
    }[size] || 0;
    
    // 模拟距离（实际应该使用地图服务计算）
    const distance = 3; // 公里
    
    const totalPrice = basePrice + (distance * distancePrice) + weightPrice + sizePrice;
    
    res.json({
      status: 'success',
      data: {
        from,
        to,
        type,
        weight,
        size,
        distance,
        estimatedDuration: Math.ceil(distance * 10), // 分钟
        price: {
          min: Math.floor(totalPrice * 0.9),
          max: Math.ceil(totalPrice * 1.1),
        },
        currency: 'CNY',
      },
    });
  } catch (error) {
    console.error('价格预估错误:', error);
    res.status(500).json({
      status: 'error',
      message: '价格预估失败',
    });
  }
});

/**
 * @route   POST /api/v1/errand/order
 * @desc    创建跑腿订单
 * @access  Private
 */
router.post('/order', authenticate, async (req, res) => {
  try {
    const { from, to, type, estimatedPrice, description, contactName, contactPhone, weight, size } = req.body;
    
    // 验证参数
    if (!from || !to || !contactName || !contactPhone) {
      return res.status(400).json({
        status: 'error',
        message: '缺少必要参数',
      });
    }
    
    // 生成订单ID
    const orderId = `ERRAND${Date.now()}`;
    const now = new Date().toISOString();
    
    // 保存订单到数据库
    await db.run(
      `INSERT INTO errandOrders (orderId, userId, fromAddress, toAddress, type, estimatedPrice, description, contactName, contactPhone, weight, size, status, paymentStatus, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        orderId,
        req.user.userId,
        from,
        to,
        type || 'express',
        estimatedPrice,
        description || '',
        contactName,
        contactPhone,
        weight || 1,
        size || 'small',
        'pending',
        'unpaid',
        now,
        now
      ]
    );
    
    res.status(201).json({
      status: 'success',
      message: '订单创建成功',
      data: {
        orderId,
        from,
        to,
        type: type || 'express',
        estimatedPrice,
        description: description || '',
        contactName,
        contactPhone,
        weight: weight || 1,
        size: size || 'small',
        status: 'pending',
        paymentStatus: 'unpaid',
        estimatedDuration: '30-40分钟',
      },
    });
  } catch (error) {
    console.error('创建订单错误:', error);
    res.status(500).json({
      status: 'error',
      message: '创建订单失败',
    });
  }
});

/**
 * @route   GET /api/v1/errand/order/:orderId/status
 * @desc    获取跑腿订单状态
 * @access  Private
 */
router.get('/order/:orderId/status', authenticate, async (req, res) => {
  try {
    const { orderId } = req.params;
    
    // 从数据库获取订单信息
    const orders = await db.execute(
      'SELECT * FROM errandOrders WHERE orderId = ?',
      [orderId]
    );
    
    if (orders.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: '订单不存在',
      });
    }
    
    const order = orders[0];
    
    // 构建响应数据
    const status = {
      orderId: order.orderId,
      status: order.status,
      from: order.fromAddress,
      to: order.toAddress,
      type: order.type,
      estimatedPrice: order.estimatedPrice,
      actualPrice: order.actualPrice,
      description: order.description,
      contactName: order.contactName,
      contactPhone: order.contactPhone,
      weight: order.weight,
      size: order.size,
      courier: order.courierId ? {
        courierId: order.courierId,
        name: '配送员',
        phone: '139****5678',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
      } : null,
      estimatedDuration: '30-40分钟',
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };
    
    res.json({
      status: 'success',
      data: status,
    });
  } catch (error) {
    console.error('获取订单状态错误:', error);
    res.status(500).json({
      status: 'error',
      message: '获取订单状态失败',
    });
  }
});

/**
 * @route   GET /api/v1/errand/user/history
 * @desc    获取用户跑腿订单历史
 * @access  Private
 */
router.get('/user/history', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    
    // 获取用户跑腿订单历史
    const orders = await db.execute(
      'SELECT * FROM errandOrders WHERE userId = ? ORDER BY createdAt DESC LIMIT ? OFFSET ?',
      [req.user.userId, parseInt(limit), parseInt(offset)]
    );
    
    // 获取总订单数
    const totalResult = await db.execute(
      'SELECT COUNT(*) as total FROM errandOrders WHERE userId = ?',
      [req.user.userId]
    );
    const total = totalResult[0].total;
    
    res.json({
      status: 'success',
      data: {
        orders,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('获取订单历史错误:', error);
    res.status(500).json({
      status: 'error',
      message: '获取订单历史失败',
    });
  }
});

module.exports = router;