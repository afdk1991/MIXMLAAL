/**
 * 订单路由
 * 版本: v1.0.0.0
 * 说明: 订单创建、查询、管理相关接口
 */

const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const db = require('../utils/database.sqlite');
const XLSX = require('xlsx');

/**
 * @route   POST /api/v1/order/create
 * @desc    创建订单
 * @access  Private
 */
router.post('/create', authMiddleware, async (req, res) => {
  try {
    // 开发环境下允许测试token
    const authHeader = req.headers.authorization;
    let userId = 'test-user';
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      if (token !== 'test-token') {
        // 验证真实token
        const decoded = await require('../middleware/auth').verifyAccessToken(token);
        if (!decoded) {
          return res.status(401).json({
            status: 'error',
            code: 'TOKEN_INVALID',
            message: 'Token无效或已过期',
          });
        }
        userId = decoded.userId;
      }
    }

    const { type, totalAmount, remark } = req.body;

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
      [orderId, userId, type, 'pending', totalAmount, now, now],
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
router.get('/:orderId', authMiddleware, async (req, res) => {
  try {
    const { orderId } = req.params;

    // 从数据库查询订单
    const orders = await db.execute(
      'SELECT * FROM orders WHERE orderId = ? AND userId = ?',
      [orderId, req.user.userId],
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

    // 如果是服务套餐订单，获取详细信息
    if (order.type === 'package') {
      const packages = await db.execute(
        'SELECT * FROM servicePackages WHERE packageId = ?',
        [orderId],
      );
      if (packages.length > 0) {
        const servicePackage = packages[0];
        orderData.foodOrderId = servicePackage.foodOrderId;
        orderData.foodInfo = JSON.parse(servicePackage.foodInfo);
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
router.post('/:orderId/cancel', authMiddleware, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { reason } = req.body;

    // 检查订单是否存在且属于当前用户
    const orders = await db.execute(
      'SELECT * FROM orders WHERE orderId = ? AND userId = ?',
      [orderId, req.user.userId],
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
      ['cancelled', now, orderId],
    );

    // 如果是服务套餐订单，同时更新服务套餐状态
    if (order.type === 'package') {
      await db.run(
        'UPDATE servicePackages SET status = ?, updatedAt = ? WHERE packageId = ?',
        ['cancelled', now, orderId],
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
router.get('/list', authMiddleware, async (req, res) => {
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
      [...params, parseInt(limit, 10), parseInt(offset, 10)],
    );

    // 获取总订单数
    const totalResult = await db.execute(
      `SELECT COUNT(*) as total FROM orders ${whereClause}`,
      params,
    );
    const total = totalResult[0].total;

    res.json({
      status: 'success',
      data: {
        orders,
        pagination: {
          page: parseInt(page, 10),
          limit: parseInt(limit, 10),
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
router.put('/:orderId/status', authMiddleware, async (req, res) => {
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
      [orderId, req.user.userId],
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
      [status, now, orderId],
    );

    // 如果是服务套餐订单，同时更新服务套餐状态
    const order = orders[0];
    if (order.type === 'package') {
      await db.run(
        'UPDATE servicePackages SET status = ?, updatedAt = ? WHERE packageId = ?',
        [status, now, orderId],
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

/**
 * @route   GET /api/v1/order/export
 * @desc    导出订单数据
 * @access  Private
 */
router.get('/export', authMiddleware, async (req, res) => {
  try {
    // 检查用户权限（假设只有管理员可以导出数据）
    const userId = req.user.userId;
    const users = await db.execute('SELECT * FROM users WHERE userId = ?', [userId]);
    const user = users[0];
    
    if (!user || user.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: '没有权限导出数据'
      });
    }
    
    // 获取所有订单数据
    const allOrders = await db.execute('SELECT * FROM orders');
    
    // 转换为Excel格式
    const worksheet = XLSX.utils.json_to_sheet(allOrders);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, '订单数据');
    
    // 生成Excel文件
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });
    
    // 设置响应头
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=orders-${new Date().toISOString().split('T')[0]}.xlsx`);
    res.setHeader('Content-Length', excelBuffer.length);
    
    // 发送Excel文件
    res.send(excelBuffer);
  } catch (error) {
    console.error('导出订单数据错误:', error);
    res.status(500).json({
      status: 'error',
      message: '导出订单数据失败'
    });
  }
});

module.exports = router;
