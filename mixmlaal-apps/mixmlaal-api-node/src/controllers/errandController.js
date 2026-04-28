const { Order, DeliveryTrack, User, Address } = require('../models');
const { Op } = require('sequelize');
const crypto = require('crypto');

class ErrandController {
  calculateDistance(from, to) {
    const R = 6371000;
    const lat1 = from.lat * Math.PI / 180;
    const lat2 = to.lat * Math.PI / 180;
    const deltaLat = (to.lat - from.lat) * Math.PI / 180;
    const deltaLng = (to.lng - from.lng) * Math.PI / 180;

    const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
      Math.cos(lat1) * Math.cos(lat2) *
      Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  async estimatePrice(req, res) {
    try {
      const { from, to, weight = 1 } = req.body;

      if (!from || !to || !from.lat || !from.lng || !to.lat || !to.lng) {
        return res.json({
          code: 400,
          message: '缺少位置信息',
          data: null
        });
      }

      const basePrice = 5.00;
      const perKmPrice = 2.00;
      const perKgPrice = 1.00;

      const distance = this.calculateDistance(from, to);
      const estimatedPrice = basePrice + (distance / 1000) * perKmPrice + weight * perKgPrice;

      res.json({
        code: 200,
        message: '预估费用成功',
        data: {
          estimatedPrice: Math.round(estimatedPrice * 100) / 100,
          distance: Math.round(distance),
          weight: weight,
          basePrice: basePrice,
          perKmPrice: perKmPrice,
          perKgPrice: perKgPrice
        }
      });
    } catch (error) {
      console.error('预估费用失败:', error);
      res.status(500).json({
        code: 500,
        message: '预估费用失败',
        data: null
      });
    }
  }

  async createErrandOrder(req, res) {
    try {
      const userId = req.user.id;
      const { 
        from, to, weight = 1, remark, 
        pickupName, pickupPhone, 
        dropoffName, dropoffPhone 
      } = req.body;

      if (!from || !to || !from.lat || !from.lng || !to.lat || !to.lng) {
        return res.json({
          code: 400,
          message: '缺少位置信息',
          data: null
        });
      }

      const distance = this.calculateDistance(from, to);
      const basePrice = 5.00;
      const perKmPrice = 2.00;
      const perKgPrice = 1.00;
      const estimatedPrice = basePrice + (distance / 1000) * perKmPrice + weight * perKgPrice;

      const orderNo = 'ERRAND' + Date.now() + crypto.randomBytes(4).toString('hex').toUpperCase();

      const order = await Order.create({
        orderNo,
        userId,
        type: 'errand',
        status: 'pending',
        totalAmount: Math.round(estimatedPrice * 100) / 100,
        actualAmount: Math.round(estimatedPrice * 100) / 100,
        remark: JSON.stringify({
          from: from,
          to: to,
          weight: weight,
          pickupName: pickupName,
          pickupPhone: pickupPhone,
          dropoffName: dropoffName,
          dropoffPhone: dropoffPhone,
          remark: remark
        })
      });

      res.json({
        code: 200,
        message: '下单成功',
        data: {
          orderId: order.id,
          orderNo: order.orderNo,
          estimatedPrice: Math.round(estimatedPrice * 100) / 100,
          distance: Math.round(distance)
        }
      });
    } catch (error) {
      console.error('创建跑腿订单失败:', error);
      res.status(500).json({
        code: 500,
        message: '创建订单失败',
        data: null
      });
    }
  }

  async getErrandOrder(req, res) {
    try {
      const userId = req.user.id;
      const { orderId } = req.params;

      const order = await Order.findOne({
        where: { id: orderId, userId, type: 'errand' },
        include: [
          {
            model: User,
            as: 'deliveryMan',
            attributes: ['id', 'name', 'phone', 'avatar']
          }
        ]
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
        actualAmount: order.actualAmount,
        remark: order.remark ? JSON.parse(order.remark) : null,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        deliveryMan: order.deliveryMan
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

  async getErrandOrders(req, res) {
    try {
      const userId = req.user.id;
      const { page = 1, pageSize = 10, status } = req.query;

      const where = { userId, type: 'errand' };
      if (status) {
        where.status = status;
      }

      const { count, rows } = await Order.findAndCountAll({
        where,
        limit: parseInt(pageSize),
        offset: (parseInt(page) - 1) * parseInt(pageSize),
        order: [['createdAt', 'DESC']]
      });

      const orders = rows.map(order => ({
        id: order.id,
        orderNo: order.orderNo,
        status: order.status,
        totalAmount: order.totalAmount,
        createdAt: order.createdAt,
        remark: order.remark ? JSON.parse(order.remark) : null
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

  async cancelErrandOrder(req, res) {
    try {
      const userId = req.user.id;
      const { orderId } = req.params;
      const { reason } = req.body;

      const order = await Order.findOne({
        where: { id: orderId, userId, type: 'errand' }
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

  async getOrderTrack(req, res) {
    try {
      const userId = req.user.id;
      const { orderId } = req.params;

      const order = await Order.findOne({
        where: { id: orderId, userId, type: 'errand' }
      });

      if (!order) {
        return res.json({
          code: 404,
          message: '订单不存在',
          data: null
        });
      }

      const tracks = await DeliveryTrack.findAll({
        where: { orderId: order.id },
        order: [['timestamp', 'ASC']]
      });

      const trackData = tracks.map(track => ({
        latitude: track.latitude,
        longitude: track.longitude,
        status: track.status,
        timestamp: track.timestamp
      }));

      res.json({
        code: 200,
        message: '获取配送轨迹成功',
        data: trackData
      });
    } catch (error) {
      console.error('获取配送轨迹失败:', error);
      res.status(500).json({
        code: 500,
        message: '获取配送轨迹失败',
        data: null
      });
    }
  }

  async rateOrder(req, res) {
    try {
      const userId = req.user.id;
      const { orderId, rating, content, images } = req.body;

      const order = await Order.findOne({
        where: { id: orderId, userId, type: 'errand' }
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
        const driver = await User.findByPk(order.deliveryManId);
        if (driver) {
          const newRating = (parseFloat(driver.rating || 5.0) + parseFloat(rating)) / 2;
          await driver.update({ rating: Math.round(newRating * 10) / 10 });
        }
      }

      await order.update({ 
        remark: order.remark + `\n[用户评价] ${rating}星 - ${content || ''}`,
        rated: true
      });

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

  async getErrandTypes(req, res) {
    try {
      const errandTypes = [
        {
          id: 1,
          name: '文件传递',
          description: '重要文件、合同等快速传递',
          icon: '📄',
          minPrice: 5
        },
        {
          id: 2,
          name: '物品代购',
          description: '代买零食、药品、日用品等',
          icon: '🛒',
          minPrice: 8
        },
        {
          id: 3,
          name: '快递取送',
          description: '代取快递、寄送包裹',
          icon: '📦',
          minPrice: 6
        },
        {
          id: 4,
          name: '餐饮配送',
          description: '代买餐饮并配送',
          icon: '🍔',
          minPrice: 10
        },
        {
          id: 5,
          name: '其他服务',
          description: '其他个性化跑腿服务',
          icon: '📋',
          minPrice: 15
        }
      ];

      res.json({
        code: 200,
        message: '获取跑腿类型成功',
        data: errandTypes
      });
    } catch (error) {
      console.error('获取跑腿类型失败:', error);
      res.status(500).json({
        code: 500,
        message: '获取跑腿类型失败',
        data: null
      });
    }
  }
}

module.exports = new ErrandController();
