/**
 * 物流服务控制器
 * 版本: v1.0.0.0
 * 说明: 提供配送追踪、状态更新等物流相关功能
 */

const { Op, sequelize } = require('sequelize');
const Logistics = require('../models/Logistics');
const DeliveryTrack = require('../models/DeliveryTrack');

class LogisticsController {
  /**
   * 获取物流信息
   * @param {Object} req - 请求对象
   * @param {Object} res - 响应对象
   */
  static async getLogisticsInfo(req, res) {
    try {
      const { orderId } = req.params;
      const logistics = await Logistics.findOne({ where: { orderId } });
      
      if (!logistics) {
        return res.status(404).json({
          success: false,
          error: '物流信息不存在'
        });
      }

      const tracks = await DeliveryTrack.findAll({ 
        where: { logisticsId: logistics.id },
        order: [['timestamp', 'ASC']]
      });

      res.json({
        success: true,
        data: {
          logistics,
          tracks
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * 更新物流状态
   * @param {Object} req - 请求对象
   * @param {Object} res - 响应对象
   */
  static async updateLogisticsStatus(req, res) {
    try {
      const { orderId } = req.params;
      const { status, location, description } = req.body;

      const logistics = await Logistics.findOne({ where: { orderId } });
      
      if (!logistics) {
        return res.status(404).json({
          success: false,
          error: '物流信息不存在'
        });
      }

      // 更新物流状态
      await logistics.update({ status });

      // 添加配送轨迹
      await DeliveryTrack.create({
        logisticsId: logistics.id,
        status,
        location,
        description,
        timestamp: new Date()
      });

      res.json({
        success: true,
        data: logistics
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * 获取配送轨迹
   * @param {Object} req - 请求对象
   * @param {Object} res - 响应对象
   */
  static async getDeliveryTrack(req, res) {
    try {
      const { orderId } = req.params;
      const logistics = await Logistics.findOne({ where: { orderId } });
      
      if (!logistics) {
        return res.status(404).json({
          success: false,
          error: '物流信息不存在'
        });
      }

      const tracks = await DeliveryTrack.findAll({ 
        where: { logisticsId: logistics.id },
        order: [['timestamp', 'ASC']]
      });

      res.json({
        success: true,
        data: tracks
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * 创建物流信息
   * @param {Object} req - 请求对象
   * @param {Object} res - 响应对象
   */
  static async createLogistics(req, res) {
    try {
      const { orderId, carrier, trackingNumber, status } = req.body;

      const logistics = await Logistics.create({
        orderId,
        carrier,
        trackingNumber,
        status: status || 'pending'
      });

      // 添加初始轨迹
      await DeliveryTrack.create({
        logisticsId: logistics.id,
        status: logistics.status,
        description: '物流信息已创建',
        timestamp: new Date()
      });

      res.json({
        success: true,
        data: logistics
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * 获取物流统计
   * @param {Object} req - 请求对象
   * @param {Object} res - 响应对象
   */
  static async getLogisticsStats(req, res) {
    try {
      const { startDate, endDate } = req.query;
      
      const stats = await Logistics.findAll({
        attributes: [
          'status',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        group: ['status'],
        where: {
          createdAt: {
            [Op.between]: [startDate, endDate]
          }
        }
      });

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
}

module.exports = LogisticsController;