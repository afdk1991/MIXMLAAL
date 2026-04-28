const { Order, Driver, DriverVehicle, RideLocation, User } = require('../models');
const { Op } = require('sequelize');
const crypto = require('crypto');

class RideController {
  async getDrivers(req, res) {
    try {
      const { page = 1, limit = 20, vehicleType } = req.query;

      const where = { status: 'online' };
      if (vehicleType) {
        where.vehicleType = parseInt(vehicleType);
      }

      const { count, rows } = await Driver.findAndCountAll({
        where,
        include: [{
          model: DriverVehicle,
          as: 'vehicle',
          where: { isActive: true },
          required: true
        }],
        limit: parseInt(limit),
        offset: (parseInt(page) - 1) * parseInt(limit),
        order: [['rating', 'DESC']]
      });

      const drivers = rows.map(d => ({
        id: d.id,
        name: d.name,
        phone: d.phone,
        rating: d.rating,
        vehicle: d.vehicle ? {
          plateNumber: d.vehicle.plateNumber,
          vehicleType: d.vehicle.vehicleType,
          brand: d.vehicle.brand,
          model: d.vehicle.model,
          color: d.vehicle.color
        } : null
      }));

      res.json({
        code: 200,
        message: '获取司机列表成功',
        data: {
          items: drivers,
          total: count,
          page: parseInt(page),
          pageSize: parseInt(limit)
        }
      });
    } catch (error) {
      console.error('获取司机列表失败:', error);
      res.status(500).json({
        code: 500,
        message: '获取司机列表失败',
        data: null
      });
    }
  }

  async estimatePrice(req, res) {
    try {
      const { fromLat, fromLng, toLat, toLng, vehicleType = 1 } = req.body;

      if (!fromLat || !fromLng || !toLat || !toLng) {
        return res.json({
          code: 400,
          message: '缺少位置信息',
          data: null
        });
      }

      const basePrice = { 1: 8, 2: 15, 3: 25, 4: 10 };
      const perKmPrice = { 1: 2.5, 2: 4, 3: 6, 4: 3 };

      const distance = this.calculateDistance(
        parseFloat(fromLat), parseFloat(fromLng),
        parseFloat(toLat), parseFloat(toLng)
      );

      const price = (basePrice[vehicleType] || 8) + (distance * (perKmPrice[vehicleType] || 2.5));

      res.json({
        code: 200,
        message: '估价成功',
        data: {
          distance: Math.round(distance * 100) / 100,
          estimatedPrice: Math.round(price * 100) / 100,
          vehicleType,
          basePrice: basePrice[vehicleType] || 8,
          perKmPrice: perKmPrice[vehicleType] || 2.5
        }
      });
    } catch (error) {
      console.error('估价失败:', error);
      res.status(500).json({
        code: 500,
        message: '估价失败',
        data: null
      });
    }
  }

  calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371;
    const dLat = this.deg2rad(lat2 - lat1);
    const dLng = this.deg2rad(lng2 - lng1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  deg2rad(deg) {
    return deg * (Math.PI / 180);
  }

  async createRideOrder(req, res) {
    try {
      const userId = req.user.id;
      const { fromLat, fromLng, fromAddress, toLat, toLng, toAddress, vehicleType = 1, remark } = req.body;

      if (!fromLat || !fromLng || !toLat || !toLng || !fromAddress || !toAddress) {
        return res.json({
          code: 400,
          message: '缺少必要参数',
          data: null
        });
      }

      const distance = this.calculateDistance(fromLat, fromLng, toLat, toLng);
      const basePrice = { 1: 8, 2: 15, 3: 25, 4: 10 };
      const perKmPrice = { 1: 2.5, 2: 4, 3: 6, 4: 3 };
      const estimatedPrice = (basePrice[vehicleType] || 8) + (distance * (perKmPrice[vehicleType] || 2.5));

      const orderNo = 'RIDE' + Date.now() + crypto.randomBytes(4).toString('hex').toUpperCase();

      const order = await Order.create({
        orderNo,
        userId,
        type: 'ride',
        status: 'pending',
        totalAmount: Math.round(estimatedPrice * 100) / 100,
        remark: JSON.stringify({
          from: { lat: fromLat, lng: fromLng, address: fromAddress },
          to: { lat: toLat, lng: toLng, address: toAddress },
          vehicleType,
          distance: Math.round(distance * 100) / 100
        })
      });

      res.json({
        code: 200,
        message: '下单成功',
        data: {
          orderId: order.id,
          orderNo: order.orderNo,
          estimatedPrice: Math.round(estimatedPrice * 100) / 100,
          distance: Math.round(distance * 100) / 100
        }
      });
    } catch (error) {
      console.error('创建订单失败:', error);
      res.status(500).json({
        code: 500,
        message: '创建订单失败',
        data: null
      });
    }
  }

  async getRideOrder(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      const order = await Order.findOne({
        where: { id, userId, type: 'ride' },
        include: [{
          model: User,
          as: 'deliveryMan',
          attributes: ['id', 'name', 'phone', 'avatar', 'rating']
        }]
      });

      if (!order) {
        return res.json({
          code: 404,
          message: '订单不存在',
          data: null
        });
      }

      const orderDetail = {
        id: order.id,
        orderNo: order.orderNo,
        status: order.status,
        totalAmount: order.totalAmount,
        remark: order.remark ? JSON.parse(order.remark) : null,
        createdAt: order.createdAt,
        driver: order.deliveryMan ? {
          id: order.deliveryMan.id,
          name: order.deliveryMan.name,
          phone: order.deliveryMan.phone,
          avatar: order.deliveryMan.avatar,
          rating: order.deliveryMan.rating
        } : null
      };

      res.json({
        code: 200,
        message: '获取订单成功',
        data: orderDetail
      });
    } catch (error) {
      console.error('获取订单失败:', error);
      res.status(500).json({
        code: 500,
        message: '获取订单失败',
        data: null
      });
    }
  }

  async getRideList(req, res) {
    try {
      const userId = req.user.id;
      const { page = 1, pageSize = 10, status } = req.query;

      const where = { userId, type: 'ride' };
      if (status) {
        where.status = status;
      }

      const { count, rows } = await Order.findAndCountAll({
        where,
        limit: parseInt(pageSize),
        offset: (parseInt(page) - 1) * parseInt(pageSize),
        order: [['createdAt', 'DESC']]
      });

      const orders = rows.map(o => ({
        id: o.id,
        orderNo: o.orderNo,
        status: o.status,
        totalAmount: o.totalAmount,
        remark: o.remark ? JSON.parse(o.remark) : null,
        createdAt: o.createdAt
      }));

      res.json({
        code: 200,
        message: '获取订单列表成功',
        data: {
          items: orders,
          total: count,
          page: parseInt(page),
          pageSize: parseInt(pageSize)
        }
      });
    } catch (error) {
      console.error('获取订单列表失败:', error);
      res.status(500).json({
        code: 500,
        message: '获取订单列表失败',
        data: null
      });
    }
  }

  async cancelRideOrder(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const { reason } = req.body;

      const order = await Order.findOne({
        where: { id, userId, type: 'ride' }
      });

      if (!order) {
        return res.json({
          code: 404,
          message: '订单不存在',
          data: null
        });
      }

      if (!['pending', 'paid'].includes(order.status)) {
        return res.json({
          code: 400,
          message: '当前状态无法取消',
          data: null
        });
      }

      await order.update({ status: 'cancelled' });

      res.json({
        code: 200,
        message: '取消订单成功',
        data: null
      });
    } catch (error) {
      console.error('取消订单失败:', error);
      res.status(500).json({
        code: 500,
        message: '取消订单失败',
        data: null
      });
    }
  }

  async getDriverLocation(req, res) {
    try {
      const userId = req.user.id;
      const { orderId } = req.params;

      const order = await Order.findOne({
        where: { id: orderId, userId, type: 'ride' }
      });

      if (!order) {
        return res.json({
          code: 404,
          message: '订单不存在',
          data: null
        });
      }

      if (!order.deliveryManId) {
        return res.json({
          code: 400,
          message: '司机尚未接单',
          data: null
        });
      }

      const locations = await RideLocation.findAll({
        where: {
          orderId: order.id,
          driverId: order.deliveryManId
        },
        order: [['timestamp', 'DESC']],
        limit: 1
      });

      const latest = locations[0];

      res.json({
        code: 200,
        message: '获取位置成功',
        data: latest ? {
          latitude: latest.latitude,
          longitude: latest.longitude,
          timestamp: latest.timestamp
        } : null
      });
    } catch (error) {
      console.error('获取位置失败:', error);
      res.status(500).json({
        code: 500,
        message: '获取位置失败',
        data: null
      });
    }
  }

  async getVehicleTypes(req, res) {
    try {
      const vehicleTypes = [
        { id: 1, name: '经济型', description: '紧凑型轿车，舒适实惠', basePrice: 8, perKm: 2.5, capacity: 4, image: '/images/vehicle_economy.png' },
        { id: 2, name: '舒适型', description: '中型轿车，空间宽敞', basePrice: 15, perKm: 4, capacity: 4, image: '/images/vehicle_comfort.png' },
        { id: 3, name: '商务型', description: '高端商务车型', basePrice: 25, perKm: 6, capacity: 4, image: '/images/vehicle_business.png' },
        { id: 4, name: '快车', description: '经济实惠，快速出发', basePrice: 10, perKm: 3, capacity: 4, image: '/images/vehicle_express.png' }
      ];

      res.json({
        code: 200,
        message: '获取车型成功',
        data: vehicleTypes
      });
    } catch (error) {
      console.error('获取车型失败:', error);
      res.status(500).json({
        code: 500,
        message: '获取车型失败',
        data: null
      });
    }
  }

  async rateDriver(req, res) {
    try {
      const userId = req.user.id;
      const { orderId, rating, comment } = req.body;

      const order = await Order.findOne({
        where: { id: orderId, userId, type: 'ride' }
      });

      if (!order) {
        return res.json({
          code: 404,
          message: '订单不存在',
          data: null
        });
      }

      if (order.status !== 'completed') {
        return res.json({
          code: 400,
          message: '订单尚未完成',
          data: null
        });
      }

      if (order.deliveryManId) {
        const driver = await Driver.findByPk(order.deliveryManId);
        if (driver) {
          const newRating = (parseFloat(driver.rating) + parseFloat(rating)) / 2;
          await driver.update({ rating: Math.round(newRating * 10) / 10 });
        }
      }

      await order.update({ remark: order.remark + `\n[用户评价] ${rating}星 - ${comment || ''}` });

      res.json({
        code: 200,
        message: '评价成功',
        data: null
      });
    } catch (error) {
      console.error('评价失败:', error);
      res.status(500).json({
        code: 500,
        message: '评价失败',
        data: null
      });
    }
  }
}

module.exports = new RideController();
