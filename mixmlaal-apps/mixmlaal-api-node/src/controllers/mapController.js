/**
 * 地图服务控制器
 * 版本: v1.0.0.0
 * 说明: 提供地点搜索、路径规划、定位等地图相关功能
 */

const { MapService } = require('../services/mapService');

class MapController {
  /**
   * 搜索地点
   * @param {Object} req - 请求对象
   * @param {Object} res - 响应对象
   */
  static async searchPlaces(req, res) {
    try {
      const { keyword, location, radius } = req.query;
      const places = await MapService.searchPlaces(keyword, location, radius);
      res.json({
        success: true,
        data: places
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * 获取路径规划
   * @param {Object} req - 请求对象
   * @param {Object} res - 响应对象
   */
  static async getRoute(req, res) {
    try {
      const { origin, destination, mode } = req.body;
      const route = await MapService.getRoute(origin, destination, mode);
      res.json({
        success: true,
        data: route
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * 获取地理编码
   * @param {Object} req - 请求对象
   * @param {Object} res - 响应对象
   */
  static async geocode(req, res) {
    try {
      const { address } = req.query;
      const location = await MapService.geocode(address);
      res.json({
        success: true,
        data: location
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * 获取逆地理编码
   * @param {Object} req - 请求对象
   * @param {Object} res - 响应对象
   */
  static async reverseGeocode(req, res) {
    try {
      const { latitude, longitude } = req.query;
      const address = await MapService.reverseGeocode(latitude, longitude);
      res.json({
        success: true,
        data: address
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * 获取附近服务
   * @param {Object} req - 请求对象
   * @param {Object} res - 响应对象
   */
  static async getNearbyServices(req, res) {
    try {
      const { latitude, longitude, serviceType, radius } = req.query;
      const services = await MapService.getNearbyServices(latitude, longitude, serviceType, radius);
      res.json({
        success: true,
        data: services
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * 计算两点之间的距离
   * @param {Object} req - 请求对象
   * @param {Object} res - 响应对象
   */
  static async calculateDistance(req, res) {
    try {
      const { origin, destination } = req.body;
      const distance = await MapService.calculateDistance(origin, destination);
      res.json({
        success: true,
        data: distance
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
}

module.exports = MapController;