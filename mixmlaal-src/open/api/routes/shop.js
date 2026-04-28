/**
 * 商城路由
 * 版本: v1.0.0.0
 * 说明: 商品、购物车等商城相关接口
 */

const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const db = require('../utils/database.sqlite');
const cacheService = require('../utils/cache');

/**
 * @route   GET /api/v1/shop/products
 * @desc    获取商品列表
 * @access  Public
 */
router.get('/products', async (req, res) => {
  try {
    const { page = 1, limit = 10, category, keyword, sort = 'default' } = req.query;
    const offset = (page - 1) * limit;

    // 生成缓存键
    const cacheKey = cacheService.generateKey('products', page, limit, category || 'all', keyword || 'none', sort);

    // 尝试从缓存获取
    const cachedData = await cacheService.get(cacheKey);
    if (cachedData) {
      return res.json({
        status: 'success',
        data: cachedData,
        fromCache: true,
      });
    }

    let whereClause = 'WHERE status = 1';
    const params = [];

    if (category) {
      whereClause += ' AND category = ?';
      params.push(category);
    }

    if (keyword) {
      whereClause += ' AND (name LIKE ? OR description LIKE ?)';
      params.push(`%${keyword}%`, `%${keyword}%`);
    }

    // 排序
    let orderBy = 'ORDER BY createdAt DESC';
    if (sort === 'price_asc') {
      orderBy = 'ORDER BY price ASC';
    } else if (sort === 'price_desc') {
      orderBy = 'ORDER BY price DESC';
    } else if (sort === 'sales') {
      orderBy = 'ORDER BY sales DESC';
    } else if (sort === 'rating') {
      orderBy = 'ORDER BY rating DESC';
    }

    const countResult = await db.execute(
      `SELECT COUNT(*) as total FROM products ${whereClause}`,
      params,
    );

    const products = await db.execute(
      `SELECT productId, name, price, originalPrice, image, category, sales, rating, stock 
       FROM products ${whereClause} ${orderBy} LIMIT ? OFFSET ?`,
      [...params, parseInt(limit, 10), offset],
    );

    const responseData = {
      products,
      pagination: {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        total: countResult[0].total,
      },
    };

    // 缓存结果，有效期10分钟
    await cacheService.set(cacheKey, responseData, 600);

    res.json({
      status: 'success',
      data: responseData,
    });
  } catch (error) {
    console.error('获取商品列表错误:', error);
    res.status(500).json({
      status: 'error',
      message: '获取商品列表失败',
    });
  }
});

/**
 * @route   GET /api/v1/shop/products/:productId
 * @desc    获取商品详情
 * @access  Public
 */
router.get('/products/:productId', async (req, res) => {
  try {
    const { productId } = req.params;

    // 生成缓存键
    const cacheKey = cacheService.generateKey('product', productId);

    // 尝试从缓存获取
    const cachedData = await cacheService.get(cacheKey);
    if (cachedData) {
      return res.json({
        status: 'success',
        data: cachedData,
        fromCache: true,
      });
    }

    const products = await db.execute(
      'SELECT * FROM products WHERE productId = ? AND status = 1',
      [productId],
    );

    if (products.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: '商品不存在',
      });
    }

    const product = products[0];

    // 解析规格和图片
    const images = product.images ? JSON.parse(product.images) : [];
    const specs = product.specs ? JSON.parse(product.specs) : {};

    const responseData = {
      product: {
        ...product,
        images,
        specs,
      },
    };

    // 缓存结果，有效期30分钟
    await cacheService.set(cacheKey, responseData, 1800);

    res.json({
      status: 'success',
      data: responseData,
    });
  } catch (error) {
    console.error('获取商品详情错误:', error);
    res.status(500).json({
      status: 'error',
      message: '获取商品详情失败',
    });
  }
});

/**
 * @route   GET /api/v1/shop/categories
 * @desc    获取商品分类
 * @access  Public
 */
router.get('/categories', async (req, res) => {
  try {
    // 生成缓存键
    const cacheKey = cacheService.generateKey('categories');

    // 尝试从缓存获取
    const cachedData = await cacheService.get(cacheKey);
    if (cachedData) {
      return res.json({
        status: 'success',
        data: cachedData,
        fromCache: true,
      });
    }

    const categories = await db.execute(
      'SELECT * FROM categories WHERE status = 1 ORDER BY sortOrder ASC',
    );

    const responseData = { categories };

    // 缓存结果，有效期1小时
    await cacheService.set(cacheKey, responseData, 3600);

    res.json({
      status: 'success',
      data: responseData,
    });
  } catch (error) {
    console.error('获取分类错误:', error);
    res.status(500).json({
      status: 'error',
      message: '获取分类失败',
    });
  }
});

/**
 * @route   GET /api/v1/shop/cart
 * @desc    获取购物车
 * @access  Private
 */
router.get('/cart', authenticate, async (req, res) => {
  try {
    const userId = req.user.userId;

    const cartItems = await db.execute(
      `SELECT c.*, p.name, p.price, p.originalPrice, p.image, p.stock 
       FROM cart c 
       JOIN products p ON c.productId = p.productId 
       WHERE c.userId = ? AND c.status = 1`,
      [userId],
    );

    // 计算总价
    const totalAmount = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const totalCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    res.json({
      status: 'success',
      data: {
        items: cartItems,
        totalAmount,
        totalCount,
      },
    });
  } catch (error) {
    console.error('获取购物车错误:', error);
    res.status(500).json({
      status: 'error',
      message: '获取购物车失败',
    });
  }
});

/**
 * @route   POST /api/v1/shop/cart/add
 * @desc    添加商品到购物车
 * @access  Private
 */
router.post('/cart/add', authenticate, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { productId, quantity = 1, specs } = req.body;

    if (!productId || quantity < 1) {
      return res.status(400).json({
        status: 'error',
        message: '参数错误',
      });
    }

    // 检查商品是否存在
    const products = await db.execute(
      'SELECT * FROM products WHERE productId = ? AND status = 1',
      [productId],
    );

    if (products.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: '商品不存在',
      });
    }

    const product = products[0];

    // 检查库存
    if (product.stock < quantity) {
      return res.status(400).json({
        status: 'error',
        message: '库存不足',
      });
    }

    // 检查购物车是否已有该商品
    const existingItems = await db.execute(
      'SELECT * FROM cart WHERE userId = ? AND productId = ? AND status = 1',
      [userId, productId],
    );

    const now = new Date().toISOString();

    if (existingItems.length > 0) {
      // 更新数量
      const newQuantity = existingItems[0].quantity + quantity;
      await db.run(
        'UPDATE cart SET quantity = ?, updatedAt = ? WHERE id = ?',
        [newQuantity, now, existingItems[0].id],
      );
    } else {
      // 新增商品到购物车
      await db.run(
        'INSERT INTO cart (userId, productId, quantity, specs, status, createdAt, updatedAt) VALUES (?, ?, ?, ?, 1, ?, ?)',
        [userId, productId, quantity, JSON.stringify(specs || {}), now, now],
      );
    }

    res.json({
      status: 'success',
      message: '已添加到购物车',
      data: {
        productId,
        quantity,
      },
    });
  } catch (error) {
    console.error('添加购物车错误:', error);
    res.status(500).json({
      status: 'error',
      message: '添加购物车失败',
    });
  }
});

/**
 * @route   PUT /api/v1/shop/cart/update
 * @desc    更新购物车商品数量
 * @access  Private
 */
router.put('/cart/update', authenticate, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { cartId, quantity } = req.body;

    if (!cartId || quantity < 0) {
      return res.status(400).json({
        status: 'error',
        message: '参数错误',
      });
    }

    const now = new Date().toISOString();

    if (quantity === 0) {
      // 删除商品
      await db.run(
        'UPDATE cart SET status = 0, updatedAt = ? WHERE id = ? AND userId = ?',
        [now, cartId, userId],
      );
    } else {
      // 更新数量
      await db.run(
        'UPDATE cart SET quantity = ?, updatedAt = ? WHERE id = ? AND userId = ?',
        [quantity, now, cartId, userId],
      );
    }

    res.json({
      status: 'success',
      message: '更新成功',
    });
  } catch (error) {
    console.error('更新购物车错误:', error);
    res.status(500).json({
      status: 'error',
      message: '更新购物车失败',
    });
  }
});

/**
 * @route   DELETE /api/v1/shop/cart/:cartId
 * @desc    删除购物车商品
 * @access  Private
 */
router.delete('/cart/:cartId', authenticate, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { cartId } = req.params;

    const now = new Date().toISOString();
    await db.run(
      'UPDATE cart SET status = 0, updatedAt = ? WHERE id = ? AND userId = ?',
      [now, cartId, userId],
    );

    res.json({
      status: 'success',
      message: '删除成功',
    });
  } catch (error) {
    console.error('删除购物车商品错误:', error);
    res.status(500).json({
      status: 'error',
      message: '删除失败',
    });
  }
});

/**
 * @route   DELETE /api/v1/shop/cart/clear
 * @desc    清空购物车
 * @access  Private
 */
router.delete('/cart/clear', authenticate, async (req, res) => {
  try {
    const userId = req.user.userId;
    const now = new Date().toISOString();

    await db.run(
      'UPDATE cart SET status = 0, updatedAt = ? WHERE userId = ? AND status = 1',
      [now, userId],
    );

    res.json({
      status: 'success',
      message: '购物车已清空',
    });
  } catch (error) {
    console.error('清空购物车错误:', error);
    res.status(500).json({
      status: 'error',
      message: '清空购物车失败',
    });
  }
});

module.exports = router;
