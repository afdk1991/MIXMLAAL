const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Order = require('../models/Order');
const auth = require('../middleware/auth');

// 创建订单
router.post('/', auth, [
  body('type').notEmpty().withMessage('订单类型不能为空'),
  body('amount').isNumeric().withMessage('金额必须是数字'),
  body('serviceInfo').notEmpty().withMessage('服务信息不能为空')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ status: 'error', message: errors.array()[0].msg });
  }

  try {
    const { type, amount, serviceInfo, paymentMethod = 'online' } = req.body;

    // 创建订单
    const order = await Order.create({
      userId: req.user.userId,
      type,
      amount,
      serviceInfo: JSON.stringify(serviceInfo),
      paymentMethod,
      status: 'pending',
      paymentStatus: 'unpaid'
    });

    res.status(201).json({
      status: 'success',
      message: '订单创建成功',
      data: {
        orderId: order.id,
        type: order.type,
        amount: order.amount,
        status: order.status,
        paymentStatus: order.paymentStatus,
        createdAt: order.createdAt
      }
    });
  } catch (error) {
    console.error('创建订单失败:', error);
    res.status(500).json({ status: 'error', message: '创建订单失败' });
  }
});

// 获取用户订单列表
router.get('/user', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, type } = req.query;
    const offset = (page - 1) * limit;

    const where = {
      userId: req.user.userId
    };

    if (status) {
      where.status = status;
    }

    if (type) {
      where.type = type;
    }

    const orders = await Order.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      status: 'success',
      data: {
        orders: orders.rows.map(order => ({
          id: order.id,
          type: order.type,
          amount: order.amount,
          status: order.status,
          paymentStatus: order.paymentStatus,
          serviceInfo: JSON.parse(order.serviceInfo),
          createdAt: order.createdAt
        })),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: orders.count,
          totalPages: Math.ceil(orders.count / limit)
        }
      }
    });
  } catch (error) {
    console.error('获取订单列表失败:', error);
    res.status(500).json({ status: 'error', message: '获取订单列表失败' });
  }
});

// 获取订单详情
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);

    if (!order) {
      return res.status(404).json({ status: 'error', message: '订单不存在' });
    }

    // 检查权限
    if (order.userId !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ status: 'error', message: '权限不足' });
    }

    res.json({
      status: 'success',
      data: {
        id: order.id,
        type: order.type,
        amount: order.amount,
        status: order.status,
        paymentStatus: order.paymentStatus,
        serviceInfo: JSON.parse(order.serviceInfo),
        paymentMethod: order.paymentMethod,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt
      }
    });
  } catch (error) {
    console.error('获取订单详情失败:', error);
    res.status(500).json({ status: 'error', message: '获取订单详情失败' });
  }
});

// 更新订单状态
router.put('/:id/status', auth(['admin', 'driver', 'merchant']), [
  body('status').notEmpty().withMessage('状态不能为空')
], async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);

    if (!order) {
      return res.status(404).json({ status: 'error', message: '订单不存在' });
    }

    // 更新订单状态
    order.status = req.body.status;
    await order.save();

    res.json({
      status: 'success',
      message: '订单状态更新成功',
      data: {
        id: order.id,
        status: order.status
      }
    });
  } catch (error) {
    console.error('更新订单状态失败:', error);
    res.status(500).json({ status: 'error', message: '更新订单状态失败' });
  }
});

// 更新支付状态
router.put('/:id/payment-status', auth(['admin']), [
  body('paymentStatus').notEmpty().withMessage('支付状态不能为空')
], async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);

    if (!order) {
      return res.status(404).json({ status: 'error', message: '订单不存在' });
    }

    // 更新支付状态
    order.paymentStatus = req.body.paymentStatus;
    await order.save();

    res.json({
      status: 'success',
      message: '支付状态更新成功',
      data: {
        id: order.id,
        paymentStatus: order.paymentStatus
      }
    });
  } catch (error) {
    console.error('更新支付状态失败:', error);
    res.status(500).json({ status: 'error', message: '更新支付状态失败' });
  }
});

// 获取所有订单（管理员）
router.get('/', auth(['admin']), async (req, res) => {
  try {
    const { page = 1, limit = 10, status, type, userId } = req.query;
    const offset = (page - 1) * limit;

    const where = {};

    if (status) {
      where.status = status;
    }

    if (type) {
      where.type = type;
    }

    if (userId) {
      where.userId = userId;
    }

    const orders = await Order.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      status: 'success',
      data: {
        orders: orders.rows.map(order => ({
          id: order.id,
          userId: order.userId,
          type: order.type,
          amount: order.amount,
          status: order.status,
          paymentStatus: order.paymentStatus,
          serviceInfo: JSON.parse(order.serviceInfo),
          createdAt: order.createdAt
        })),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: orders.count,
          totalPages: Math.ceil(orders.count / limit)
        }
      }
    });
  } catch (error) {
    console.error('获取所有订单失败:', error);
    res.status(500).json({ status: 'error', message: '获取所有订单失败' });
  }
});

// 删除订单（管理员）
router.delete('/:id', auth(['admin']), async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);

    if (!order) {
      return res.status(404).json({ status: 'error', message: '订单不存在' });
    }

    await order.destroy();

    res.json({
      status: 'success',
      message: '订单删除成功'
    });
  } catch (error) {
    console.error('删除订单失败:', error);
    res.status(500).json({ status: 'error', message: '删除订单失败' });
  }
});

module.exports = router;