const routeService = require('../services/routeService');
const mapService = require('../services/mapService');
const { Address } = require('../models');

// 调度控制器
class DispatchController {
  // 智能路径优化
  async optimizeRoute(req, res) {
    try {
      const { origin, destinations, options } = req.body;
      
      if (!origin || !destinations || destinations.length === 0) {
        return res.json({
          code: 400,
          message: '缺少必要参数',
          data: null
        });
      }
      
      // 优化路径
      const result = await routeService.optimizeRoute(origin, destinations, options);
      
      if (!result.success) {
        return res.json({
          code: 400,
          message: result.message,
          data: null
        });
      }
      
      res.json({
        code: 200,
        message: '路径优化成功',
        data: result.data
      });
    } catch (error) {
      console.error('路径优化失败:', error);
      res.status(500).json({
        code: 500,
        message: '路径优化失败',
        data: null
      });
    }
  }

  // 批量路径优化
  async batchOptimizeRoute(req, res) {
    try {
      const { origin, addressIds, options } = req.body;
      
      if (!origin || !addressIds || addressIds.length === 0) {
        return res.json({
          code: 400,
          message: '缺少必要参数',
          data: null
        });
      }
      
      // 获取地址信息
      const addresses = await Address.findAll({
        where: { id: addressIds },
        attributes: ['id', 'name', 'phone', 'address', 'latitude', 'longitude', 'priority', 'deliveryTime']
      });
      
      // 转换为坐标点
      const destinations = addresses.map(address => ({
        id: address.id,
        name: address.name,
        phone: address.phone,
        address: address.address,
        latitude: address.latitude,
        longitude: address.longitude,
        priority: address.priority,
        deliveryTime: address.deliveryTime
      }));
      
      // 优化路径
      const result = await routeService.optimizeRoute(origin, destinations, options);
      
      if (!result.success) {
        return res.json({
          code: 400,
          message: result.message,
          data: null
        });
      }
      
      res.json({
        code: 200,
        message: '批量路径优化成功',
        data: result.data
      });
    } catch (error) {
      console.error('批量路径优化失败:', error);
      res.status(500).json({
        code: 500,
        message: '批量路径优化失败',
        data: null
      });
    }
  }

  // 地理编码
  async geocode(req, res) {
    try {
      const { address } = req.body;
      
      if (!address) {
        return res.json({
          code: 400,
          message: '缺少地址参数',
          data: null
        });
      }
      
      const result = await mapService.geocode(address);
      
      if (!result) {
        return res.json({
          code: 400,
          message: '地理编码失败',
          data: null
        });
      }
      
      res.json({
        code: 200,
        message: '地理编码成功',
        data: result
      });
    } catch (error) {
      console.error('地理编码失败:', error);
      res.status(500).json({
        code: 500,
        message: '地理编码失败',
        data: null
      });
    }
  }

  // 逆地理编码
  async regeocode(req, res) {
    try {
      const { latitude, longitude } = req.body;
      
      if (!latitude || !longitude) {
        return res.json({
          code: 400,
          message: '缺少经纬度参数',
          data: null
        });
      }
      
      const result = await mapService.regeocode(latitude, longitude);
      
      if (!result) {
        return res.json({
          code: 400,
          message: '逆地理编码失败',
          data: null
        });
      }
      
      res.json({
        code: 200,
        message: '逆地理编码成功',
        data: result
      });
    } catch (error) {
      console.error('逆地理编码失败:', error);
      res.status(500).json({
        code: 500,
        message: '逆地理编码失败',
        data: null
      });
    }
  }

  // 实时路况
  async getTraffic(req, res) {
    try {
      const { latitude, longitude } = req.body;
      
      if (!latitude || !longitude) {
        return res.json({
          code: 400,
          message: '缺少经纬度参数',
          data: null
        });
      }
      
      const result = await mapService.traffic({ latitude, longitude });
      
      if (!result) {
        return res.json({
          code: 400,
          message: '获取实时路况失败',
          data: null
        });
      }
      
      res.json({
        code: 200,
        message: '获取实时路况成功',
        data: result
      });
    } catch (error) {
      console.error('获取实时路况失败:', error);
      res.status(500).json({
        code: 500,
        message: '获取实时路况失败',
        data: null
      });
    }
  }
}

module.exports = new DispatchController();