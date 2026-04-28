/**
 * 外卖服务路由
 * 版本: v1.0.0.0
 * 说明: 外卖订单、商家管理、配送等相关接口
 */

const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const db = require('../utils/database.sqlite');

/**
 * @route   GET /api/v1/food/merchants
 * @desc    获取附近商家
 * @access  Public
 */
router.get('/merchants', async (req, res) => {
  try {
    const { lng, lat, category, page = 1, limit = 20 } = req.query;
    
    // 验证参数
    if (!lng || !lat) {
      return res.status(400).json({
        status: 'error',
        message: '缺少位置参数',
      });
    }
    
    // 模拟商家数据
    const merchants = [
      {
        merchantId: 'M001',
        name: '麦当劳',
        rating: 4.5,
        sales: 1234,
        deliveryFee: 5,
        minOrder: 20,
        deliveryTime: '30-40分钟',
        category: '快餐',
        address: '北京市朝阳区建国路88号',
        location: { lng: parseFloat(lng) + 0.001, lat: parseFloat(lat) + 0.001 },
        distance: 800,
        image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400',
      },
      {
        merchantId: 'M002',
        name: '肯德基',
        rating: 4.3,
        sales: 987,
        deliveryFee: 6,
        minOrder: 25,
        deliveryTime: '25-35分钟',
        category: '快餐',
        address: '北京市朝阳区建国路99号',
        location: { lng: parseFloat(lng) - 0.002, lat: parseFloat(lat) + 0.001 },
        distance: 1200,
        image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400',
      },
      {
        merchantId: 'M003',
        name: '必胜客',
        rating: 4.6,
        sales: 765,
        deliveryFee: 7,
        minOrder: 30,
        deliveryTime: '35-45分钟',
        category: '披萨',
        address: '北京市朝阳区建国路100号',
        location: { lng: parseFloat(lng) + 0.001, lat: parseFloat(lat) - 0.002 },
        distance: 1500,
        image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400',
      },
    ];
    
    // 过滤商家
    let filteredMerchants = merchants;
    if (category) {
      filteredMerchants = merchants.filter(merchant => merchant.category === category);
    }
    
    // 分页
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedMerchants = filteredMerchants.slice(startIndex, endIndex);
    
    res.json({
      status: 'success',
      data: {
        merchants: paginatedMerchants,
        total: filteredMerchants.length,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(filteredMerchants.length / limit),
        },
      },
    });
  } catch (error) {
    console.error('获取商家错误:', error);
    res.status(500).json({
      status: 'error',
      message: '获取商家失败',
    });
  }
});

/**
 * @route   GET /api/v1/food/merchants/:merchantId/menu
 * @desc    获取商家菜单
 * @access  Public
 */
router.get('/merchants/:merchantId/menu', async (req, res) => {
  try {
    const { merchantId } = req.params;
    
    // 模拟菜单数据
    const menus = {
      M001: {
        merchantId: 'M001',
        name: '麦当劳',
        categories: [
          {
            categoryId: 'C001',
            name: '汉堡',
            items: [
              {
                itemId: 'I001',
                name: '巨无霸',
                price: 25.5,
                description: '双层牛肉汉堡',
                image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200',
                tags: ['热销', '招牌'],
              },
              {
                itemId: 'I002',
                name: '麦辣鸡腿堡',
                price: 22.5,
                description: '香辣鸡腿汉堡',
                image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200',
                tags: ['热销'],
              },
            ],
          },
          {
            categoryId: 'C002',
            name: '饮料',
            items: [
              {
                itemId: 'I003',
                name: '可口可乐',
                price: 9.5,
                description: '中杯',
                image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200',
              },
              {
                itemId: 'I004',
                name: '雪碧',
                price: 9.5,
                description: '中杯',
                image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200',
              },
            ],
          },
        ],
      },
      M002: {
        merchantId: 'M002',
        name: '肯德基',
        categories: [
          {
            categoryId: 'C001',
            name: '炸鸡',
            items: [
              {
                itemId: 'I005',
                name: '原味鸡',
                price: 12.5,
                description: '经典原味鸡',
                image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200',
                tags: ['热销'],
              },
              {
                itemId: 'I006',
                name: '香辣鸡翅',
                price: 19.5,
                description: '两对',
                image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200',
                tags: ['热销'],
              },
            ],
          },
        ],
      },
    };
    
    const menu = menus[merchantId];
    if (!menu) {
      return res.status(404).json({
        status: 'error',
        message: '商家不存在',
      });
    }
    
    res.json({
      status: 'success',
      data: menu,
    });
  } catch (error) {
    console.error('获取菜单错误:', error);
    res.status(500).json({
      status: 'error',
      message: '获取菜单失败',
    });
  }
});

/**
 * @route   POST /api/v1/food/order
 * @desc    创建外卖订单
 * @access  Private
 */
router.post('/order', authenticate, async (req, res) => {
  try {
    const { merchantId, items, address, phone, name, paymentMethod = 'online' } = req.body;
    
    // 验证参数
    if (!merchantId || !items || !items.length || !address || !phone || !name) {
      return res.status(400).json({
        status: 'error',
        message: '缺少必要参数',
      });
    }
    
    // 生成订单ID
    const orderId = `FOOD${Date.now()}`;
    const now = new Date().toISOString();
    
    // 计算订单金额
    let totalAmount = 0;
    items.forEach(item => {
      totalAmount += item.price * item.quantity;
    });
    
    // 添加配送费
    const deliveryFee = 5;
    const finalAmount = totalAmount + deliveryFee;
    
    // 保存订单到数据库
    await db.run(
      `INSERT INTO foodOrders (orderId, userId, merchantId, items, address, phone, name, totalAmount, deliveryFee, finalAmount, paymentMethod, status, paymentStatus, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        orderId,
        req.user.userId,
        merchantId,
        JSON.stringify(items),
        address,
        phone,
        name,
        totalAmount,
        deliveryFee,
        finalAmount,
        paymentMethod,
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
        merchantId,
        items,
        address,
        phone,
        name,
        totalAmount,
        deliveryFee,
        finalAmount,
        paymentMethod,
        status: 'pending',
        paymentStatus: 'unpaid',
        estimatedDeliveryTime: '30-40分钟',
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
 * @route   GET /api/v1/food/order/:orderId/status
 * @desc    获取外卖订单状态
 * @access  Private
 */
router.get('/order/:orderId/status', authenticate, async (req, res) => {
  try {
    const { orderId } = req.params;
    
    // 从数据库获取订单信息
    const orders = await db.execute(
      'SELECT * FROM foodOrders WHERE orderId = ?',
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
      merchantId: order.merchantId,
      items: JSON.parse(order.items),
      address: order.address,
      phone: order.phone,
      name: order.name,
      totalAmount: order.totalAmount,
      deliveryFee: order.deliveryFee,
      finalAmount: order.finalAmount,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      courier: order.courierId ? {
        courierId: order.courierId,
        name: '配送员',
        phone: '139****5678',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
      } : null,
      estimatedDeliveryTime: '30-40分钟',
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
 * @route   GET /api/v1/food/user/history
 * @desc    获取用户外卖订单历史
 * @access  Private
 */
router.get('/user/history', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    
    // 获取用户外卖订单历史
    const orders = await db.execute(
      'SELECT * FROM foodOrders WHERE userId = ? ORDER BY createdAt DESC LIMIT ? OFFSET ?',
      [req.user.userId, parseInt(limit), parseInt(offset)]
    );
    
    // 格式化订单数据
    const formattedOrders = orders.map(order => ({
      ...order,
      items: JSON.parse(order.items),
    }));
    
    // 获取总订单数
    const totalResult = await db.execute(
      'SELECT COUNT(*) as total FROM foodOrders WHERE userId = ?',
      [req.user.userId]
    );
    const total = totalResult[0].total;
    
    res.json({
      status: 'success',
      data: {
        orders: formattedOrders,
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