/**
 * 订单路由
 * 版本: v1.0.0.0
 * 说明: 订单创建、查询、管理相关接口
 */

const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const db = require('../utils/database.sqlite');

/**
 * @route   POST /api/v1/order/create
 * @desc    创建订单
 * @access  Private
 */
router.post('/create', authenticate, async (req, res) => {
  try {
    const { type, items, totalAmount, remark } = req.body;

    // 参数验证
    if (!type || !totalAmount) {
      return res.status(400).json({
        status: 'error',
        message: '缺少必要参数',
      });
    }

    // 生成订单号
    const orderId = `ORD${Date.now()}`;
    const now = new Date().toISOString();

    // 保存订单到数据库
    await db.run(
      'INSERT INTO orders (orderId, userId, type, status, amount, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [orderId, req.user.userId, type, 'pending', totalAmount, now, now]
    );

    res.status(201).json({
      status: 'success',
      message: '订单创建成功',
      data: {
        orderId,
        type,
        totalAmount,
        status: 'pending',
        remark,
        createdAt: now,
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
 * @route   GET /api/v1/order/:orderId
 * @desc    获取订单详情
 * @access  Private
 */
router.get('/:orderId', authenticate, async (req, res) => {
  try {
    const { orderId } = req.params;

    // 从数据库查询订单
    const orders = await db.execute(
      'SELECT * FROM orders WHERE orderId = ? AND userId = ?',
      [orderId, req.user.userId]
    );

    if (orders.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: '订单不存在',
      });
    }

    const order = orders[0];

    // 构建订单响应数据
    const orderData = {
      orderId: order.orderId,
      type: order.type,
      status: order.status,
      totalAmount: order.amount,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };

    // 如果是出行订单，获取详细信息
    if (order.type === 'ride') {
      const rideOrders = await db.execute(
        'SELECT * FROM rideOrders WHERE orderId = ?',
        [orderId]
      );
      if (rideOrders.length > 0) {
        const rideOrder = rideOrders[0];
        orderData.items = [{
          name: `${rideOrder.type}服务`,
          from: rideOrder.fromAddress,
          to: rideOrder.toAddress,
          amount: rideOrder.estimatedPrice || rideOrder.actualPrice || order.amount,
        }];
        orderData.completedAt = rideOrder.endTime;
      }
    }

    res.json({
      status: 'success',
      data: { order: orderData },
    });
  } catch (error) {
    console.error('获取订单详情错误:', error);
    res.status(500).json({
      status: 'error',
      message: '获取订单详情失败',
    });
  }
});

/**
 * @route   POST /api/v1/order/:orderId/cancel
 * @desc    取消订单
 * @access  Private
 */
router.post('/:orderId/cancel', authenticate, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { reason } = req.body;

    // 检查订单是否存在且属于当前用户
    const orders = await db.execute(
      'SELECT * FROM orders WHERE orderId = ? AND userId = ?',
      [orderId, req.user.userId]
    );

    if (orders.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: '订单不存在',
      });
    }

    const order = orders[0];
    if (order.status === 'completed' || order.status === 'cancelled') {
      return res.status(400).json({
        status: 'error',
        message: '订单状态不允许取消',
      });
    }

    // 更新订单状态为已取消
    const now = new Date().toISOString();
    await db.run(
      'UPDATE orders SET status = ?, updatedAt = ? WHERE orderId = ?',
      ['cancelled', now, orderId]
    );

    // 如果是出行订单，同时更新出行订单状态
    if (order.type === 'ride') {
      await db.run(
        'UPDATE rideOrders SET status = ?, updatedAt = ? WHERE orderId = ?',
        ['cancelled', now, orderId]
      );
    }

    res.json({
      status: 'success',
      message: '订单取消成功',
      data: { orderId, reason },
    });
  } catch (error) {
    console.error('取消订单错误:', error);
    res.status(500).json({
      status: 'error',
      message: '取消订单失败',
    });
  }
});

/**
 * @route   GET /api/v1/order/list
 * @desc    获取用户订单列表
 * @access  Private
 */
router.get('/list', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 10, type, status } = req.query;
    const offset = (page - 1) * limit;

    // 构建查询条件
    let whereClause = 'WHERE userId = ?';
    const params = [req.user.userId];

    if (type) {
      whereClause += ' AND type = ?';
      params.push(type);
    }

    if (status) {
      whereClause += ' AND status = ?';
      params.push(status);
    }

    // 获取订单列表
    const orders = await db.execute(
      `SELECT * FROM orders ${whereClause} ORDER BY createdAt DESC LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), parseInt(offset)]
    );

    // 获取总订单数
    const totalResult = await db.execute(
      `SELECT COUNT(*) as total FROM orders ${whereClause}`,
      params
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
    console.error('获取订单列表错误:', error);
    res.status(500).json({
      status: 'error',
      message: '获取订单列表失败',
    });
  }
});

/**
 * @route   PUT /api/v1/order/:orderId/status
 * @desc    更新订单状态
 * @access  Private
 */
router.put('/:orderId/status', authenticate, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    // 验证状态值
    const validStatuses = ['pending', 'processing', 'shipped', 'completed', 'cancelled', 'refunding', 'refunded'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        status: 'error',
        message: '无效的状态值',
      });
    }

    // 检查订单是否存在且属于当前用户
    const orders = await db.execute(
      'SELECT * FROM orders WHERE orderId = ? AND userId = ?',
      [orderId, req.user.userId]
    );

    if (orders.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: '订单不存在',
      });
    }

    // 更新订单状态
    const now = new Date().toISOString();
    await db.run(
      'UPDATE orders SET status = ?, updatedAt = ? WHERE orderId = ?',
      [status, now, orderId]
    );

    // 如果是出行订单，同时更新出行订单状态
    const order = orders[0];
    if (order.type === 'ride') {
      await db.run(
        'UPDATE rideOrders SET status = ?, updatedAt = ? WHERE orderId = ?',
        [status, now, orderId]
      );
    }

    res.json({
      status: 'success',
      message: '订单状态已更新',
      data: {
        orderId,
        status,
        updatedAt: now,
      },
    });
  } catch (error) {
    console.error('更新订单状态错误:', error);
    res.status(500).json({
      status: 'error',
      message: '更新订单状态失败',
    });
  }
});

module.exports = router;
