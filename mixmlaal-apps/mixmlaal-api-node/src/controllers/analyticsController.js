/**
 * 数据统计控制器
 * 版本: v1.0.0.0
 * 说明: 提供用户、订单、销售等数据统计功能
 */

const { AnalyticsService } = require('../services/analyticsService');

class AnalyticsController {
  /**
   * 获取用户统计数据
   * @param {Object} req - 请求对象
   * @param {Object} res - 响应对象
   */
  static async getUserStats(req, res) {
    try {
      const stats = await AnalyticsService.getUserStats();
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

  /**
   * 获取订单统计数据
   * @param {Object} req - 请求对象
   * @param {Object} res - 响应对象
   */
  static async getOrderStats(req, res) {
    try {
      const { startDate, endDate } = req.query;
      const stats = await AnalyticsService.getOrderStats(startDate, endDate);
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

  /**
   * 获取销售统计数据
   * @param {Object} req - 请求对象
   * @param {Object} res - 响应对象
   */
  static async getSalesStats(req, res) {
    try {
      const { startDate, endDate } = req.query;
      const stats = await AnalyticsService.getSalesStats(startDate, endDate);
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

  /**
   * 获取商品统计数据
   * @param {Object} req - 请求对象
   * @param {Object} res - 响应对象
   */
  static async getProductStats(req, res) {
    try {
      const stats = await AnalyticsService.getProductStats();
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

  /**
   * 获取服务统计数据
   * @param {Object} req - 请求对象
   * @param {Object} res - 响应对象
   */
  static async getServiceStats(req, res) {
    try {
      const { serviceType } = req.query;
      const stats = await AnalyticsService.getServiceStats(serviceType);
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

  /**
   * 获取趋势分析数据
   * @param {Object} req - 请求对象
   * @param {Object} res - 响应对象
   */
  static async getTrendAnalysis(req, res) {
    try {
      const { period, type } = req.query;
      const trend = await AnalyticsService.getTrendAnalysis(period, type);
      res.json({
        success: true,
        data: trend
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * 获取预测分析数据
   * @param {Object} req - 请求对象
   * @param {Object} res - 响应对象
   */
  static async getPredictionAnalysis(req, res) {
    try {
      const { days } = req.query;
      const prediction = await AnalyticsService.getPredictionAnalysis(parseInt(days) || 7);
      res.json({
        success: true,
        data: prediction
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
}

module.exports = AnalyticsController;