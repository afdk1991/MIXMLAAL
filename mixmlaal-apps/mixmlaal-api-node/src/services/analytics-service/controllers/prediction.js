const { Op, sequelize } = require('sequelize');
const Order = require('../models/Order');
const Task = require('../models/Task');

const predictionController = {
  // 预测订单量
  predictOrders: async (req, res) => {
    try {
      const { days = 7 } = req.query;

      // 获取历史订单数据
      const historicalData = await Order.findAll({
        attributes: [
          [sequelize.fn('DATE', sequelize.col('created_at')), 'date'],
          [sequelize.fn('COUNT', sequelize.col('id')), 'order_count']
        ],
        where: {
          created_at: {
            [Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 最近30天
          }
        },
        group: ['date'],
        order: [['date', 'ASC']]
      });

      // 计算历史平均值
      const totalOrders = historicalData.reduce((sum, item) => sum + parseInt(item.dataValues.order_count), 0);
      const avgOrdersPerDay = totalOrders / historicalData.length;

      // 简单预测：基于历史平均值
      const predictions = [];
      for (let i = 1; i <= parseInt(days); i++) {
        const predictDate = new Date();
        predictDate.setDate(predictDate.getDate() + i);
        
        predictions.push({
          date: predictDate.toISOString().split('T')[0],
          predicted_orders: Math.round(avgOrdersPerDay)
        });
      }

      res.json({
        code: 200,
        message: '预测订单量成功',
        data: {
          historical_data: historicalData.map(item => ({
            date: item.dataValues.date,
            order_count: parseInt(item.dataValues.order_count)
          })),
          predictions
        }
      });
    } catch (error) {
      res.status(500).json({
        code: 500,
        message: '预测订单量失败',
        data: null
      });
    }
  },

  // 预测需求
  predictDemand: async (req, res) => {
    try {
      const { days = 7 } = req.query;

      // 获取历史订单金额数据
      const historicalData = await Order.findAll({
        attributes: [
          [sequelize.fn('DATE', sequelize.col('created_at')), 'date'],
          [sequelize.fn('SUM', sequelize.col('total_amount')), 'total_amount']
        ],
        where: {
          created_at: {
            [Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 最近30天
          }
        },
        group: ['date'],
        order: [['date', 'ASC']]
      });

      // 计算历史平均金额
      const totalAmount = historicalData.reduce((sum, item) => sum + parseFloat(item.dataValues.total_amount) || 0, 0);
      const avgAmountPerDay = totalAmount / historicalData.length;

      // 简单预测：基于历史平均值
      const predictions = [];
      for (let i = 1; i <= parseInt(days); i++) {
        const predictDate = new Date();
        predictDate.setDate(predictDate.getDate() + i);
        
        predictions.push({
          date: predictDate.toISOString().split('T')[0],
          predicted_amount: parseFloat(avgAmountPerDay.toFixed(2))
        });
      }

      res.json({
        code: 200,
        message: '预测需求成功',
        data: {
          historical_data: historicalData.map(item => ({
            date: item.dataValues.date,
            total_amount: parseFloat(item.dataValues.total_amount) || 0
          })),
          predictions
        }
      });
    } catch (error) {
      res.status(500).json({
        code: 500,
        message: '预测需求失败',
        data: null
      });
    }
  },

  // 预测路径
  predictRoute: async (req, res) => {
    try {
      const { origin, destination } = req.query;

      if (!origin || !destination) {
        return res.json({
          code: 400,
          message: '缺少起点或终点参数',
          data: null
        });
      }

      // 这里简化处理，实际应该调用地图API进行路径规划
      // 并基于历史数据进行预测

      // 模拟预测结果
      const prediction = {
        origin: origin,
        destination: destination,
        estimated_distance: 10.5, // 公里
        estimated_time: 25, // 分钟
        estimated_traffic: '轻度拥堵',
        recommended_route: '推荐路线：沿主干道行驶'
      };

      res.json({
        code: 200,
        message: '预测路径成功',
        data: prediction
      });
    } catch (error) {
      res.status(500).json({
        code: 500,
        message: '预测路径失败',
        data: null
      });
    }
  }
};

module.exports = predictionController;