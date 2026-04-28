const Order = require('../models/Order');
const User = require('../models/User');
const Address = require('../models/address');
const redis = require('../config/redis');

const customerController = {
  // 获取订单列表
  getOrders: async (req, res) => {
    const customerId = req.user?.id;

    if (!customerId) {
      return res.json({
        code: 401,
        message: '未授权',
        data: null
      });
    }

    try {
      const { page = 1, page_size = 10, status } = req.query;
      const offset = (page - 1) * page_size;

      // 生成缓存键
      const cacheKey = `orders:${customerId}:${page}:${page_size}:${status || 'all'}`;
      
      // 尝试从缓存获取
      const cachedData = await redis.get(cacheKey);
      if (cachedData) {
        return res.json(JSON.parse(cachedData));
      }

      const where = { customer_id: customerId };
      if (status) {
        where.status = status;
      }

      const { count, rows } = await Order.findAndCountAll({
        where,
        limit: parseInt(page_size),
        offset: parseInt(offset),
        order: [['created_at', 'DESC']],
        attributes: ['id', 'order_no', 'total_amount', 'status', 'created_at', 'paid_at'] // 只查询需要的字段
      });

      const responseData = {
        code: 200,
        message: '获取订单列表成功',
        data: {
          items: rows,
          total: count,
          page: parseInt(page),
          page_size: parseInt(page_size)
        }
      };

      // 缓存结果，有效期5分钟
      await redis.set(cacheKey, JSON.stringify(responseData), 'EX', 300);

      res.json(responseData);
    } catch (error) {
      res.status(500).json({
        code: 500,
        message: '获取订单列表失败',
        data: null
      });
    }
  },

  // 获取订单详情
  getOrderDetail: async (req, res) => {
    const { id } = req.params;
    const customerId = req.user?.id;

    if (!customerId) {
      return res.json({
        code: 401,
        message: '未授权',
        data: null
      });
    }

    try {
      // 生成缓存键
      const cacheKey = `order:${id}:${customerId}`;
      
      // 尝试从缓存获取
      const cachedData = await redis.get(cacheKey);
      if (cachedData) {
        return res.json(JSON.parse(cachedData));
      }

      const order = await Order.findByPk(id, {
        where: { customer_id: customerId },
        attributes: ['id', 'order_no', 'total_amount', 'status', 'created_at', 'paid_at', 'payment_method', 'address_id'] // 只查询需要的字段
      });

      if (!order) {
        return res.json({
          code: 404,
          message: '订单不存在',
          data: null
        });
      }

      const responseData = {
        code: 200,
        message: '获取订单详情成功',
        data: order
      };

      // 缓存结果，有效期10分钟
      await redis.set(cacheKey, JSON.stringify(responseData), 'EX', 600);

      res.json(responseData);
    } catch (error) {
      res.status(500).json({
        code: 500,
        message: '获取订单详情失败',
        data: null
      });
    }
  },

  // 创建订单
  createOrder: async (req, res) => {
    const customerId = req.user?.id;
    const orderData = req.body;

    if (!customerId) {
      return res.json({
        code: 401,
        message: '未授权',
        data: null
      });
    }

    try {
      const order = await Order.create({
        ...orderData,
        customer_id: customerId
      });

      // 清除相关缓存
      const cachePattern = `orders:${customerId}:*`;
      const keys = await redis.keys(cachePattern);
      if (keys.length > 0) {
        await redis.del(keys);
      }

      res.json({
        code: 200,
        message: '创建订单成功',
        data: order
      });
    } catch (error) {
      res.status(500).json({
        code: 500,
        message: '创建订单失败',
        data: null
      });
    }
  },

  // 订单追踪
  trackOrder: async (req, res) => {
    const { id } = req.params;
    const customerId = req.user?.id;

    if (!customerId) {
      return res.json({
        code: 401,
        message: '未授权',
        data: null
      });
    }

    try {
      const order = await Order.findByPk(id, {
        where: { customer_id: customerId }
      });

      if (!order) {
        return res.json({
          code: 404,
          message: '订单不存在',
          data: null
        });
      }

      // 这里可以添加追踪逻辑，比如获取司机位置、配送状态等
      const trackInfo = {
        order_id: order.id,
        status: order.status,
        driver_info: {
          name: '张三',
          phone: '13800138000',
          vehicle: '京A12345 福田奥铃CTS'
        },
        current_location: '北京市朝阳区建国路88号',
        estimated_time: '20分钟',
        route: [
          { location: '北京市朝阳区建国路88号', time: '2023-12-01 10:00:00' },
          { location: '北京市朝阳区建国路99号', time: '2023-12-01 10:10:00' },
          { location: '北京市朝阳区建国路100号', time: '2023-12-01 10:20:00' }
        ]
      };

      res.json({
        code: 200,
        message: '获取订单追踪成功',
        data: trackInfo
      });
    } catch (error) {
      res.status(500).json({
        code: 500,
        message: '获取订单追踪失败',
        data: null
      });
    }
  },

  // 支付订单
  payOrder: async (req, res) => {
    const { id } = req.params;
    const { payment_method } = req.body;
    const customerId = req.user?.id;

    if (!customerId) {
      return res.json({
        code: 401,
        message: '未授权',
        data: null
      });
    }

    try {
      const order = await Order.findByPk(id, {
        where: { customer_id: customerId }
      });

      if (!order) {
        return res.json({
          code: 404,
          message: '订单不存在',
          data: null
        });
      }

      // 更新订单状态为已支付
      await order.update({
        status: 'paid',
        payment_method,
        paid_at: new Date()
      });

      // 清除相关缓存
      const cachePattern = `orders:${customerId}:*`;
      const keys = await redis.keys(cachePattern);
      if (keys.length > 0) {
        await redis.del(keys);
      }
      await redis.del(`order:${id}:${customerId}`);

      res.json({
        code: 200,
        message: '支付成功',
        data: order
      });
    } catch (error) {
      res.status(500).json({
        code: 500,
        message: '支付失败',
        data: null
      });
    }
  },

  // 获取客户信息
  getProfile: async (req, res) => {
    const customerId = req.user?.id;

    if (!customerId) {
      return res.json({
        code: 401,
        message: '未授权',
        data: null
      });
    }

    try {
      // 生成缓存键
      const cacheKey = `customer:${customerId}`;
      
      // 尝试从缓存获取
      const cachedData = await redis.get(cacheKey);
      if (cachedData) {
        return res.json(JSON.parse(cachedData));
      }

      const user = await User.findByPk(customerId, {
        attributes: ['id', 'username', 'name', 'phone', 'email', 'createdAt'] // 只查询需要的字段
      });

      if (!user) {
        return res.json({
          code: 404,
          message: '用户不存在',
          data: null
        });
      }

      const responseData = {
        code: 200,
        message: '获取用户信息成功',
        data: user
      };

      // 缓存结果，有效期30分钟
      await redis.set(cacheKey, JSON.stringify(responseData), 'EX', 1800);

      res.json(responseData);
    } catch (error) {
      res.status(500).json({
        code: 500,
        message: '获取客户信息失败',
        data: null
      });
    }
  },

  // 更新客户信息
  updateProfile: async (req, res) => {
    const customerId = req.user?.id;
    const profileData = req.body;

    if (!customerId) {
      return res.json({
        code: 401,
        message: '未授权',
        data: null
      });
    }

    try {
      const user = await User.findByPk(customerId);

      if (!user) {
        return res.json({
          code: 404,
          message: '用户不存在',
          data: null
        });
      }

      await user.update(profileData);

      // 清除相关缓存
      await redis.del(`customer:${customerId}`);

      res.json({
        code: 200,
        message: '更新用户信息成功',
        data: user
      });
    } catch (error) {
      res.status(500).json({
        code: 500,
        message: '更新客户信息失败',
        data: null
      });
    }
  },

  // 获取地址列表
  getAddresses: async (req, res) => {
    const customerId = req.user?.id;

    if (!customerId) {
      return res.json({
        code: 401,
        message: '未授权',
        data: null
      });
    }

    try {
      // 生成缓存键
      const cacheKey = `addresses:${customerId}`;
      
      // 尝试从缓存获取
      const cachedData = await redis.get(cacheKey);
      if (cachedData) {
        return res.json(JSON.parse(cachedData));
      }

      const addresses = await Address.findAll({
        where: { userId: customerId },
        attributes: ['id', 'name', 'phone', 'province', 'city', 'district', 'detail', 'isDefault', 'createdAt'] // 只查询需要的字段
      });

      const responseData = {
        code: 200,
        message: '获取地址列表成功',
        data: addresses
      };

      // 缓存结果，有效期10分钟
      await redis.set(cacheKey, JSON.stringify(responseData), 'EX', 600);

      res.json(responseData);
    } catch (error) {
      res.status(500).json({
        code: 500,
        message: '获取地址列表失败',
        data: null
      });
    }
  },

  // 添加地址
  addAddress: async (req, res) => {
    const customerId = req.user?.id;
    const addressData = req.body;

    if (!customerId) {
      return res.json({
        code: 401,
        message: '未授权',
        data: null
      });
    }

    try {
      const address = await Address.create({
        ...addressData,
        userId: customerId
      });

      // 清除相关缓存
      await redis.del(`addresses:${customerId}`);

      res.json({
        code: 200,
        message: '添加地址成功',
        data: address
      });
    } catch (error) {
      res.status(500).json({
        code: 500,
        message: '添加地址失败',
        data: null
      });
    }
  },

  // 更新地址
  updateAddress: async (req, res) => {
    const { id } = req.params;
    const customerId = req.user?.id;
    const addressData = req.body;

    if (!customerId) {
      return res.json({
        code: 401,
        message: '未授权',
        data: null
      });
    }

    try {
      const address = await Address.findByPk(id, {
        where: { userId: customerId }
      });

      if (!address) {
        return res.json({
          code: 404,
          message: '地址不存在',
          data: null
        });
      }

      await address.update(addressData);

      // 清除相关缓存
      await redis.del(`addresses:${customerId}`);

      res.json({
        code: 200,
        message: '更新地址成功',
        data: address
      });
    } catch (error) {
      res.status(500).json({
        code: 500,
        message: '更新地址失败',
        data: null
      });
    }
  },

  // 删除地址
  deleteAddress: async (req, res) => {
    const { id } = req.params;
    const customerId = req.user?.id;

    if (!customerId) {
      return res.json({
        code: 401,
        message: '未授权',
        data: null
      });
    }

    try {
      const address = await Address.findByPk(id, {
        where: { userId: customerId }
      });

      if (!address) {
        return res.json({
          code: 404,
          message: '地址不存在',
          data: null
        });
      }

      await address.destroy();

      // 清除相关缓存
      await redis.del(`addresses:${customerId}`);

      res.json({
        code: 200,
        message: '删除地址成功',
        data: null
      });
    } catch (error) {
      res.status(500).json({
        code: 500,
        message: '删除地址失败',
        data: null
      });
    }
  }
};

module.exports = customerController;