const Order = require('../models/Order');

const orderController = {
  // 获取订单列表
  getOrders: async (req, res) => {
    try {
      const { page = 1, page_size = 10, status, customer_id } = req.query;
      const offset = (page - 1) * page_size;

      const where = {};
      if (status) {
        where.status = status;
      }
      if (customer_id) {
        where.customer_id = customer_id;
      }

      const { count, rows } = await Order.findAndCountAll({
        where,
        limit: parseInt(page_size),
        offset: parseInt(offset),
        order: [['created_at', 'DESC']]
      });

      res.json({
        code: 200,
        message: '获取订单列表成功',
        data: {
          items: rows,
          total: count,
          page: parseInt(page),
          page_size: parseInt(page_size)
        }
      });
    } catch (error) {
      res.status(500).json({
        code: 500,
        message: '获取订单列表失败',
        data: null
      });
    }
  },

  // 创建订单
  createOrder: async (req, res) => {
    const orderData = req.body;

    try {
      const order = await Order.create(orderData);

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

  // 获取订单详情
  getOrderDetail: async (req, res) => {
    const { id } = req.params;

    try {
      const order = await Order.findByPk(id);

      if (!order) {
        return res.json({
          code: 404,
          message: '订单不存在',
          data: null
        });
      }

      res.json({
        code: 200,
        message: '获取订单详情成功',
        data: order
      });
    } catch (error) {
      res.status(500).json({
        code: 500,
        message: '获取订单详情失败',
        data: null
      });
    }
  },

  // 更新订单
  updateOrder: async (req, res) => {
    const { id } = req.params;
    const orderData = req.body;

    try {
      const order = await Order.findByPk(id);

      if (!order) {
        return res.json({
          code: 404,
          message: '订单不存在',
          data: null
        });
      }

      await order.update(orderData);

      res.json({
        code: 200,
        message: '更新订单成功',
        data: order
      });
    } catch (error) {
      res.status(500).json({
        code: 500,
        message: '更新订单失败',
        data: null
      });
    }
  },

  // 删除订单
  deleteOrder: async (req, res) => {
    const { id } = req.params;

    try {
      const order = await Order.findByPk(id);

      if (!order) {
        return res.json({
          code: 404,
          message: '订单不存在',
          data: null
        });
      }

      await order.destroy();

      res.json({
        code: 200,
        message: '删除订单成功',
        data: null
      });
    } catch (error) {
      res.status(500).json({
        code: 500,
        message: '删除订单失败',
        data: null
      });
    }
  }
};

module.exports = orderController;