const { Op, sequelize } = require('sequelize');
const Order = require('../models/Order');
const Product = require('../models/Product');
const OrderItem = require('../models/OrderItem');
const multer = require('multer');
const XLSX = require('xlsx');
const fs = require('fs');

const orderController = {
  // 获取订单概览
  getOrderOverview: async (req, res) => {
    try {
      const { start_date, end_date } = req.query;

      const where = {};
      if (start_date) {
        where.created_at = { [Op.gte]: new Date(start_date) };
      }
      if (end_date) {
        where.created_at = { 
          ...where.created_at, 
          [Op.lte]: new Date(end_date)
        };
      }

      // 总订单数
      const totalOrders = await Order.count({
        where
      });

      // 总销售额
      const totalAmount = await Order.sum('total_amount', {
        where
      });

      // 订单状态分布
      const orderStatus = await Order.findAll({
        attributes: [
          'status',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        where,
        group: ['status']
      });

      // 平均订单金额
      const avgAmount = await Order.findOne({
        attributes: [
          [sequelize.fn('AVG', sequelize.col('total_amount')), 'avg_amount']
        ],
        where
      });

      res.json({
        code: 200,
        message: '获取订单概览成功',
        data: {
          total_orders: totalOrders,
          total_amount: totalAmount || 0,
          avg_amount: avgAmount?.dataValues.avg_amount || 0,
          status_distribution: orderStatus.map(item => ({
            status: item.status,
            count: parseInt(item.dataValues.count)
          }))
        }
      });
    } catch (error) {
      res.status(500).json({
        code: 500,
        message: '获取订单概览失败',
        data: null
      });
    }
  },

  // 获取订单趋势
  getOrderTrend: async (req, res) => {
    try {
      const { start_date, end_date, interval = 'day' } = req.query;

      const where = {};
      if (start_date) {
        where.created_at = { [Op.gte]: new Date(start_date) };
      }
      if (end_date) {
        where.created_at = { 
          ...where.created_at, 
          [Op.lte]: new Date(end_date)
        };
      }

      let dateFormat = '%Y-%m-%d';
      if (interval === 'week') {
        dateFormat = '%Y-%u'; // ISO周
      } else if (interval === 'month') {
        dateFormat = '%Y-%m';
      }

      const orderTrend = await Order.findAll({
        attributes: [
          [sequelize.fn('DATE_FORMAT', sequelize.col('created_at'), dateFormat), 'date'],
          [sequelize.fn('COUNT', sequelize.col('id')), 'order_count'],
          [sequelize.fn('SUM', sequelize.col('total_amount')), 'total_amount']
        ],
        where,
        group: ['date'],
        order: [['date', 'ASC']]
      });

      res.json({
        code: 200,
        message: '获取订单趋势成功',
        data: orderTrend.map(item => ({
          date: item.dataValues.date,
          order_count: parseInt(item.dataValues.order_count),
          total_amount: parseFloat(item.dataValues.total_amount) || 0
        }))
      });
    } catch (error) {
      res.status(500).json({
        code: 500,
        message: '获取订单趋势失败',
        data: null
      });
    }
  },

  // 获取热销产品
  getTopProducts: async (req, res) => {
    try {
      const { start_date, end_date, limit = 10 } = req.query;

      const where = {};
      if (start_date) {
        where['$Order.created_at$'] = { [Op.gte]: new Date(start_date) };
      }
      if (end_date) {
        where['$Order.created_at$'] = { 
          ...where['$Order.created_at$'], 
          [Op.lte]: new Date(end_date)
        };
      }

      const topProducts = await Product.findAll({
        attributes: [
          'id',
          'name',
          'price',
          [sequelize.fn('SUM', sequelize.col('OrderItem.quantity')), 'total_quantity'],
          [sequelize.fn('SUM', sequelize.col('OrderItem.quantity') * sequelize.col('Product.price')), 'total_amount']
        ],
        include: [
          {
            model: OrderItem,
            include: [
              {
                model: Order,
                where
              }
            ]
          }
        ],
        group: ['Product.id'],
        order: [[sequelize.fn('SUM', sequelize.col('OrderItem.quantity')), 'DESC']],
        limit: parseInt(limit)
      });

      res.json({
        code: 200,
        message: '获取热销产品成功',
        data: topProducts.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          total_quantity: parseInt(item.dataValues.total_quantity) || 0,
          total_amount: parseFloat(item.dataValues.total_amount) || 0
        }))
      });
    } catch (error) {
      res.status(500).json({
        code: 500,
        message: '获取热销产品失败',
        data: null
      });
    }
  },

  // 导出订单数据
  exportOrderData: async (req, res) => {
    try {
      const { start_date, end_date } = req.query;

      const where = {};
      if (start_date) {
        where.created_at = { [Op.gte]: new Date(start_date) };
      }
      if (end_date) {
        where.created_at = { 
          ...where.created_at, 
          [Op.lte]: new Date(end_date)
        };
      }

      const orders = await Order.findAll({
        where,
        include: [
          {
            model: OrderItem,
            include: [Product]
          }
        ],
        order: [['created_at', 'DESC']]
      });

      // 准备导出数据
      const exportData = orders.map(order => {
        const items = order.OrderItems.map(item => ({
          product_name: item.Product.name,
          quantity: item.quantity,
          price: item.price,
          subtotal: item.quantity * item.price
        }));

        return {
          order_no: order.order_no,
          customer_name: order.customer_name,
          customer_phone: order.customer_phone,
          customer_address: order.customer_address,
          total_amount: order.total_amount,
          status: order.status,
          created_at: order.created_at,
          items: items
        };
      });

      // 创建Excel文件
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      XLSX.utils.book_append_sheet(workbook, worksheet, '订单数据');

      // 生成文件名
      const filename = `orders_${Date.now()}.xlsx`;
      const filepath = `./tmp/${filename}`;

      // 确保tmp目录存在
      if (!fs.existsSync('./tmp')) {
        fs.mkdirSync('./tmp', { recursive: true });
      }

      // 写入文件
      XLSX.writeFile(workbook, filepath);

      // 发送文件
      res.download(filepath, filename, (err) => {
        if (err) {
          console.error('下载文件失败:', err);
          res.status(500).json({
            code: 500,
            message: '导出订单数据失败',
            data: null
          });
        }

        // 删除临时文件
        fs.unlinkSync(filepath);
      });
    } catch (error) {
      res.status(500).json({
        code: 500,
        message: '导出订单数据失败',
        data: null
      });
    }
  }
};

module.exports = orderController;