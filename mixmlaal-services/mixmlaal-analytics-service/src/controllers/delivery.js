const { Op, sequelize } = require('sequelize');
const Task = require('../models/Task');
const TaskPoint = require('../models/TaskPoint');
const Track = require('../models/Track');

const deliveryController = {
  // 获取配送概览
  getDeliveryOverview: async (req, res) => {
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

      // 总配送任务数
      const totalTasks = await Task.count({
        where
      });

      // 已完成的配送任务数
      const completedTasks = await Task.count({
        where: {
          ...where,
          status: 'completed'
        }
      });

      // 配送成功率
      const successRate = totalTasks > 0 ? (completedTasks / totalTasks * 100).toFixed(2) : 0;

      // 平均配送时间
      const avgDeliveryTime = await Task.findOne({
        attributes: [
          [sequelize.fn('AVG', sequelize.literal('TIMESTAMPDIFF(MINUTE, start_time, end_time)')), 'avg_time']
        ],
        where: {
          ...where,
          status: 'completed',
          start_time: { [Op.not]: null },
          end_time: { [Op.not]: null }
        }
      });

      res.json({
        code: 200,
        message: '获取配送概览成功',
        data: {
          total_tasks: totalTasks,
          completed_tasks: completedTasks,
          success_rate: successRate,
          avg_delivery_time: avgDeliveryTime?.dataValues.avg_time || 0
        }
      });
    } catch (error) {
      res.status(500).json({
        code: 500,
        message: '获取配送概览失败',
        data: null
      });
    }
  },

  // 获取配送时间分析
  getDeliveryTimeAnalysis: async (req, res) => {
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

      // 按时间段分析配送时间
      const timeAnalysis = await Task.findAll({
        attributes: [
          [sequelize.fn('HOUR', sequelize.col('start_time')), 'hour'],
          [sequelize.fn('AVG', sequelize.literal('TIMESTAMPDIFF(MINUTE, start_time, end_time)')), 'avg_time'],
          [sequelize.fn('COUNT', sequelize.col('id')), 'task_count']
        ],
        where: {
          ...where,
          status: 'completed',
          start_time: { [Op.not]: null },
          end_time: { [Op.not]: null }
        },
        group: ['hour'],
        order: [['hour', 'ASC']]
      });

      // 按日期分析配送时间
      const dateAnalysis = await Task.findAll({
        attributes: [
          [sequelize.fn('DATE', sequelize.col('start_time')), 'date'],
          [sequelize.fn('AVG', sequelize.literal('TIMESTAMPDIFF(MINUTE, start_time, end_time)')), 'avg_time'],
          [sequelize.fn('COUNT', sequelize.col('id')), 'task_count']
        ],
        where: {
          ...where,
          status: 'completed',
          start_time: { [Op.not]: null },
          end_time: { [Op.not]: null }
        },
        group: ['date'],
        order: [['date', 'ASC']]
      });

      res.json({
        code: 200,
        message: '获取配送时间分析成功',
        data: {
          time_analysis: timeAnalysis.map(item => ({
            hour: parseInt(item.dataValues.hour),
            avg_time: parseFloat(item.dataValues.avg_time) || 0,
            task_count: parseInt(item.dataValues.task_count)
          })),
          date_analysis: dateAnalysis.map(item => ({
            date: item.dataValues.date,
            avg_time: parseFloat(item.dataValues.avg_time) || 0,
            task_count: parseInt(item.dataValues.task_count)
          }))
        }
      });
    } catch (error) {
      res.status(500).json({
        code: 500,
        message: '获取配送时间分析失败',
        data: null
      });
    }
  },

  // 获取配送距离分析
  getDeliveryDistanceAnalysis: async (req, res) => {
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

      // 计算每辆车的总行驶距离
      const distanceAnalysis = await Task.findAll({
        attributes: [
          'vehicle_id',
          [sequelize.fn('COUNT', sequelize.col('id')), 'task_count']
        ],
        where,
        group: ['vehicle_id']
      });

      // 这里简化处理，实际应该根据轨迹数据计算距离
      // 由于轨迹数据可能很大，这里只返回车辆任务数

      res.json({
        code: 200,
        message: '获取配送距离分析成功',
        data: {
          vehicle_distance: distanceAnalysis.map(item => ({
            vehicle_id: item.vehicle_id,
            task_count: parseInt(item.dataValues.task_count)
          }))
        }
      });
    } catch (error) {
      res.status(500).json({
        code: 500,
        message: '获取配送距离分析失败',
        data: null
      });
    }
  },

  // 获取司机绩效分析
  getDriverPerformance: async (req, res) => {
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

      // 计算每个司机的绩效
      const driverPerformance = await Task.findAll({
        attributes: [
          'driver_id',
          [sequelize.fn('COUNT', sequelize.col('id')), 'task_count'],
          [sequelize.fn('SUM', sequelize.literal('CASE WHEN status = "completed" THEN 1 ELSE 0 END')), 'completed_count'],
          [sequelize.fn('AVG', sequelize.literal('TIMESTAMPDIFF(MINUTE, start_time, end_time)')), 'avg_time']
        ],
        where,
        group: ['driver_id']
      });

      // 计算绩效指标
      const performanceData = driverPerformance.map(item => {
        const taskCount = parseInt(item.dataValues.task_count);
        const completedCount = parseInt(item.dataValues.completed_count) || 0;
        const successRate = taskCount > 0 ? (completedCount / taskCount * 100).toFixed(2) : 0;
        
        return {
          driver_id: item.driver_id,
          task_count: taskCount,
          completed_count: completedCount,
          success_rate: successRate,
          avg_delivery_time: parseFloat(item.dataValues.avg_time) || 0
        };
      });

      // 按成功率排序
      performanceData.sort((a, b) => parseFloat(b.success_rate) - parseFloat(a.success_rate));

      res.json({
        code: 200,
        message: '获取司机绩效分析成功',
        data: performanceData
      });
    } catch (error) {
      res.status(500).json({
        code: 500,
        message: '获取司机绩效分析失败',
        data: null
      });
    }
  }
};

module.exports = deliveryController;