/**
 * 出行路由
 * 版本: v1.1.0.0
 * 说明: 网约车、出租车等出行服务相关接口，集成高德地图服务
 */

const express = require('express');
const router = express.Router();
const MapService = require('../services/mapService');
const { authenticate } = require('../middleware/auth');
const db = require('../utils/database.sqlite');

/**
 * @route   POST /api/v1/ride/estimate
 * @desc    预估价格
 * @access  Public
 */
router.post('/estimate', async (req, res) => {
  try {
    const { from, to, type = 'express' } = req.body;

    // 参数验证
    if (!from || !to) {
      return res.status(400).json({
        status: 'error',
        message: '出发地和目的地不能为空',
      });
    }

    // 获取起点和终点坐标
    const [fromLocation, toLocation] = await Promise.all([
      MapService.geocode(from),
      MapService.geocode(to),
    ]);

    // 路径规划获取实际距离和时长
    const route = await MapService.drivingRoute(
      `${fromLocation.lng},${fromLocation.lat}`,
      `${toLocation.lng},${toLocation.lat}`,
    );

    const distance = route.distance / 1000; // 转换为公里
    const duration = Math.ceil(route.duration / 60); // 转换为分钟

    // 价格计算（基于实际距离）
    const priceMap = {
      express: { base: 12, perKm: 2.5, min: 25, max: 35 },
      premium: { base: 20, perKm: 4.0, min: 45, max: 55 },
      luxury: { base: 35, perKm: 6.5, min: 80, max: 100 },
      taxi: { base: 14, perKm: 2.8, min: 30, max: 40 },
    };

    const pricing = priceMap[type] || priceMap.express;
    const estimatedPrice = pricing.base + (distance * pricing.perKm);
    const price = {
      min: Math.max(pricing.min, Math.floor(estimatedPrice * 0.9)),
      max: Math.max(pricing.max, Math.ceil(estimatedPrice * 1.1)),
    };

    res.json({
      status: 'success',
      data: {
        from,
        to,
        fromLocation,
        toLocation,
        type,
        distance: parseFloat(distance.toFixed(1)),
        duration,
        price,
        currency: 'CNY',
        route: {
          polyline: route.polyline,
          steps: route.steps || [],
        },
      },
    });
  } catch (error) {
    console.error('价格预估错误:', error);
    res.status(500).json({
      status: 'error',
      message: '价格预估失败',
    });
  }
});

/**
 * @route   POST /api/v1/ride/request
 * @desc    请求叫车
 * @access  Private
 */
router.post('/request', authenticate, async (req, res) => {
  try {
    const { from, to, type, estimatedPrice, fromLocation, toLocation } = req.body;

    // 如果没有提供坐标，进行地理编码
    let startLoc = fromLocation;
    let endLoc = toLocation;

    if (!startLoc || !endLoc) {
      [startLoc, endLoc] = await Promise.all([
        MapService.geocode(from),
        MapService.geocode(to),
      ]);
    }

    // 生成行程ID
    const rideId = `RIDE${Date.now()}`;
    const now = new Date().toISOString();

    // 计算距离和时长
    const route = await MapService.drivingRoute(
      `${startLoc.lng},${startLoc.lat}`,
      `${endLoc.lng},${endLoc.lat}`
    );

    // 保存行程记录到数据库
    await db.run(
      `INSERT INTO rideOrders (orderId, userId, fromAddress, toAddress, fromLng, fromLat, toLng, toLat, distance, duration, type, estimatedPrice, status, paymentStatus, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        rideId,
        req.user.userId,
        from,
        to,
        startLoc.lng,
        startLoc.lat,
        endLoc.lng,
        endLoc.lat,
        route.distance / 1000, // 转换为公里
        Math.ceil(route.duration / 60), // 转换为分钟
        type,
        estimatedPrice,
        'searching',
        'unpaid',
        now,
        now
      ]
    );

    res.status(201).json({
      status: 'success',
      message: '叫车请求已提交',
      data: {
        rideId,
        from,
        to,
        fromLocation: startLoc,
        toLocation: endLoc,
        type,
        estimatedPrice,
        status: 'searching',
        estimatedArrival: 5,
      },
    });
  } catch (error) {
    console.error('叫车请求错误:', error);
    res.status(500).json({
      status: 'error',
      message: '叫车请求失败',
    });
  }
});

/**
 * @route   GET /api/v1/ride/:rideId/status
 * @desc    获取行程状态
 * @access  Private
 */
router.get('/:rideId/status', authenticate, async (req, res) => {
  try {
    const { rideId } = req.params;

    // 从数据库获取行程信息
    const rideOrders = await db.execute(
      'SELECT * FROM rideOrders WHERE orderId = ?',
      [rideId]
    );

    if (rideOrders.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: '行程不存在',
      });
    }

    const ride = rideOrders[0];

    // 构建响应数据
    const status = {
      rideId: ride.orderId,
      status: ride.status,
      from: ride.fromAddress,
      to: ride.toAddress,
      type: ride.type,
      estimatedPrice: ride.estimatedPrice,
      actualPrice: ride.actualPrice,
      distance: ride.distance,
      duration: ride.duration,
      driver: ride.driverId ? {
        driverId: ride.driverId,
        name: '张师傅', // 模拟司机信息
        phone: '138****1234',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
        rating: 4.9,
        car: {
          model: '丰田凯美瑞',
          color: '黑色',
          plate: '京A·12345',
        },
      } : null,
      location: ride.status === 'ongoing' ? {
        lat: parseFloat(ride.fromLat) + (parseFloat(ride.toLat) - parseFloat(ride.fromLat)) * 0.5,
        lng: parseFloat(ride.fromLng) + (parseFloat(ride.toLng) - parseFloat(ride.fromLng)) * 0.5,
      } : null,
      estimatedArrival: ride.status === 'searching' ? 5 : 0,
      route: ride.status === 'ongoing' ? {
        remainingDistance: ride.distance * 0.5,
        remainingDuration: Math.ceil(ride.duration * 0.5),
      } : null,
      startTime: ride.startTime,
      endTime: ride.endTime,
    };

    res.json({
      status: 'success',
      data: status,
    });
  } catch (error) {
    console.error('获取行程状态错误:', error);
    res.status(500).json({
      status: 'error',
      message: '获取行程状态失败',
    });
  }
});

/**
 * @route   GET /api/v1/ride/nearby-drivers
 * @desc    获取附近司机
 * @access  Private
 */
router.get('/nearby-drivers', authenticate, async (req, res) => {
  try {
    const { lng, lat } = req.query;

    if (!lng || !lat) {
      return res.status(400).json({
        status: 'error',
        message: '缺少位置参数',
      });
    }

    // 模拟附近司机数据
    const drivers = [
      {
        driverId: 'D001',
        name: '李师傅',
        rating: 4.8,
        car: { model: '大众帕萨特', color: '白色', plate: '京B·56789' },
        location: { lng: parseFloat(lng) + 0.002, lat: parseFloat(lat) + 0.001 },
        distance: 320,
        eta: 2,
      },
      {
        driverId: 'D002',
        name: '王师傅',
        rating: 4.9,
        car: { model: '丰田卡罗拉', color: '银色', plate: '京C·98765' },
        location: { lng: parseFloat(lng) - 0.001, lat: parseFloat(lat) + 0.002 },
        distance: 580,
        eta: 4,
      },
    ];

    res.json({
      status: 'success',
      data: {
        drivers,
        total: drivers.length,
      },
    });
  } catch (error) {
    console.error('获取附近司机错误:', error);
    res.status(500).json({
      status: 'error',
      message: '获取附近司机失败',
    });
  }
});

/**
 * @route   GET /api/v1/ride/search-location
 * @desc    搜索地点
 * @access  Public
 */
router.get('/search-location', async (req, res) => {
  try {
    const { keywords, lng, lat } = req.query;

    if (!keywords) {
      return res.status(400).json({
        status: 'error',
        message: '缺少搜索关键词',
      });
    }

    const location = lng && lat ? `${lng},${lat}` : '116.4074,39.9042';
    const pois = await MapService.searchPOI(keywords, location, 10000);

    res.json({
      status: 'success',
      data: {
        keywords,
        pois: pois.slice(0, 10),
      },
    });
  } catch (error) {
    console.error('搜索地点错误:', error);
    res.status(500).json({
      status: 'error',
      message: '搜索地点失败',
    });
  }
});

/**
 * @route   GET /api/v1/ride/reverse-geocode
 * @desc    逆地理编码
 * @access  Public
 */
router.get('/reverse-geocode', async (req, res) => {
  try {
    const { lng, lat } = req.query;

    if (!lng || !lat) {
      return res.status(400).json({
        status: 'error',
        message: '缺少坐标参数',
      });
    }

    const address = await MapService.reverseGeocode(parseFloat(lng), parseFloat(lat));

    res.json({
      status: 'success',
      data: {
        lng: parseFloat(lng),
        lat: parseFloat(lat),
        address,
      },
    });
  } catch (error) {
    console.error('逆地理编码错误:', error);
    res.status(500).json({
      status: 'error',
      message: '逆地理编码失败',
    });
  }
});

/**
 * @route   PUT /api/v1/ride/:rideId/status
 * @desc    更新行程状态
 * @access  Private
 */
router.put('/:rideId/status', authenticate, async (req, res) => {
  try {
    const { rideId } = req.params;
    const { status, driverId, actualPrice } = req.body;

    // 验证状态值
    const validStatuses = ['searching', 'accepted', 'ongoing', 'completed', 'cancelled'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        status: 'error',
        message: '无效的状态值',
      });
    }

    // 从数据库获取行程信息
    const rideOrders = await db.execute(
      'SELECT * FROM rideOrders WHERE orderId = ?',
      [rideId]
    );

    if (rideOrders.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: '行程不存在',
      });
    }

    const ride = rideOrders[0];
    const now = new Date().toISOString();
    const updateData = {
      status,
      updatedAt: now,
    };

    // 根据状态更新其他字段
    if (status === 'accepted' && driverId) {
      updateData.driverId = driverId;
    }
    if (status === 'ongoing') {
      updateData.startTime = now;
    }
    if (status === 'completed') {
      updateData.endTime = now;
      updateData.paymentStatus = 'paid';
      if (actualPrice) {
        updateData.actualPrice = actualPrice;
      }
    }

    // 构建SQL语句
    const fields = Object.keys(updateData);
    const values = Object.values(updateData);
    const placeholders = fields.map((field, index) => `${field} = ?`).join(', ');
    values.push(rideId);

    await db.run(
      `UPDATE rideOrders SET ${placeholders} WHERE orderId = ?`,
      values
    );

    // 获取更新后的行程信息
    const updatedRide = (await db.execute(
      'SELECT * FROM rideOrders WHERE orderId = ?',
      [rideId]
    ))[0];

    res.json({
      status: 'success',
      message: '行程状态已更新',
      data: {
        rideId: updatedRide.orderId,
        status: updatedRide.status,
        driverId: updatedRide.driverId,
        actualPrice: updatedRide.actualPrice,
        startTime: updatedRide.startTime,
        endTime: updatedRide.endTime,
        updatedAt: updatedRide.updatedAt,
      },
    });
  } catch (error) {
    console.error('更新行程状态错误:', error);
    res.status(500).json({
      status: 'error',
      message: '更新行程状态失败',
    });
  }
});

/**
 * @route   GET /api/v1/ride/user/history
 * @desc    获取用户行程历史
 * @access  Private
 */
router.get('/user/history', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    // 获取用户行程历史
    const rides = await db.execute(
      'SELECT * FROM rideOrders WHERE userId = ? ORDER BY createdAt DESC LIMIT ? OFFSET ?',
      [req.user.userId, parseInt(limit), parseInt(offset)]
    );

    // 获取总行程数
    const totalResult = await db.execute(
      'SELECT COUNT(*) as total FROM rideOrders WHERE userId = ?',
      [req.user.userId]
    );
    const total = totalResult[0].total;

    res.json({
      status: 'success',
      data: {
        rides,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('获取行程历史错误:', error);
    res.status(500).json({
      status: 'error',
      message: '获取行程历史失败',
    });
  }
});

module.exports = router;
