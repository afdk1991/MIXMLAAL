const { Shop, Order, OrderItem, Address, DeliveryTrack, User, Product } = require('../models');
const { Op } = require('sequelize');
const crypto = require('crypto');

class FoodController {
  async getMerchants(req, res) {
    try {
      const { page = 1, limit = 20, category = null, keyword = null, sort = 'rating' } = req.query;

      const where = { status: 'open' };
      if (category) {
        where.categoryId = category;
      }
      if (keyword) {
        where[Op.or] = [
          { name: { [Op.like]: `%${keyword}%` } },
          { description: { [Op.like]: `%${keyword}%` } }
        ];
      }

      const orderBy = [];
      switch (sort) {
        case 'rating':
          orderBy.push(['rating', 'DESC']);
          break;
        case 'sales':
          orderBy.push(['sales', 'DESC']);
          break;
        case 'distance':
          orderBy.push(['distance', 'ASC']);
          break;
        default:
          orderBy.push(['rating', 'DESC']);
      }

      const { count, rows } = await Shop.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset: (parseInt(page) - 1) * parseInt(limit),
        order: orderBy
      });

      const merchants = rows.map(shop => ({
        id: shop.id,
        name: shop.name,
        description: shop.description,
        logo: shop.logo,
        address: shop.address,
        phone: shop.phone,
        rating: shop.rating,
        sales: shop.sales || 0,
        status: shop.status
      }));

      res.json({
        code: 200,
        message: '获取商家列表成功',
        data: {
          items: merchants,
          total: count,
          page: parseInt(page),
          pageSize: parseInt(limit)
        }
      });
    } catch (error) {
      console.error('获取商家列表失败:', error);
      res.status(500).json({
        code: 500,
        message: '获取商家列表失败',
        data: null
      });
    }
  }

  async getMerchantMenu(req, res) {
    try {
      const { merchantId } = req.params;

      const shop = await Shop.findByPk(merchantId);
      if (!shop) {
        return res.json({
          code: 404,
          message: '商家不存在',
          data: null
        });
      }

      const products = await Product.findAll({
        where: { shopId: merchantId, status: 'active' },
        order: [['sales', 'DESC']]
      });

      const menu = {
        merchant: {
          id: shop.id,
          name: shop.name,
          logo: shop.logo,
          rating: shop.rating
        },
        products: products.map(p => ({
          id: p.id,
          name: p.name,
          description: p.description,
          price: p.price,
          stock: p.stock,
          images: p.images,
          sales: p.sales,
          rating: p.rating
        }))
      };

      res.json({
        code: 200,
        message: '获取菜单成功',
        data: menu
      });
    } catch (error) {
      console.error('获取菜单失败:', error);
      res.status(500).json({
        code: 500,
        message: '获取菜单失败',
        data: null
      });
    }
  }

  async createFoodOrder(req, res) {
    try {
      const userId = req.user.id;
      const { merchantId, items, addressId, remark } = req.body;

      if (!merchantId || !items || !Array.isArray(items) || items.length === 0 || !addressId) {
        return res.json({
          code: 400,
          message: '缺少必要参数',
          data: null
        });
      }

      const shop = await Shop.findByPk(merchantId);
      if (!shop) {
        return res.json({
          code: 404,
          message: '商家不存在',
          data: null
        });
      }

      if (shop.status !== 'open') {
        return res.json({
          code: 400,
          message: '商家当前未营业',
          data: null
        });
      }

      const address = await Address.findByPk(addressId);
      if (!address || address.userId !== userId) {
        return res.json({
          code: 404,
          message: '收货地址不存在',
          data: null
        });
      }

      let totalAmount = 0;
      const orderItems = [];

      for (const item of items) {
        const product = await Product.findByPk(item.productId);
        if (!product) {
          return res.json({
            code: 404,
            message: `商品 ${item.productId} 不存在`,
            data: null
          });
        }

        if (product.stock < item.quantity) {
          return res.json({
            code: 400,
            message: `商品 ${product.name} 库存不足`,
            data: null
          });
        }

        const subtotal = product.price * item.quantity;
        totalAmount += subtotal;

        orderItems.push({
          productId: product.id,
          productName: product.name,
          price: product.price,
          quantity: item.quantity,
          subtotal: subtotal
        });

        await product.update({ stock: product.stock - item.quantity, sales: product.sales + item.quantity });
      }

      const orderNo = 'FOOD' + Date.now() + crypto.randomBytes(4).toString('hex').toUpperCase();

      const order = await Order.create({
        orderNo,
        userId,
        shopId: merchantId,
        addressId,
        type: 'food',
        status: 'pending',
        totalAmount,
        actualAmount: totalAmount,
        remark: remark || ''
      });

      for (const item of orderItems) {
        await OrderItem.create({
          orderId: order.id,
          productId: item.productId,
          productName: item.productName,
          price: item.price,
          quantity: item.quantity,
          subtotal: item.subtotal
        });
      }

      await shop.update({ sales: (shop.sales || 0) + 1 });

      res.json({
        code: 200,
        message: '下单成功',
        data: {
          orderId: order.id,
          orderNo: order.orderNo,
          totalAmount: totalAmount
        }
      });
    } catch (error) {
      console.error('创建外卖订单失败:', error);
      res.status(500).json({
        code: 500,
        message: '创建订单失败',
        data: null
      });
    }
  }

  async getFoodOrder(req, res) {
    try {
      const userId = req.user.id;
      const { orderId } = req.params;

      const order = await Order.findOne({
        where: { id: orderId, userId, type: 'food' },
        include: [
          {
            model: Shop,
            attributes: ['id', 'name', 'logo', 'phone']
          },
          {
            model: Address,
            attributes: ['id', 'name', 'phone', 'address', 'latitude', 'longitude']
          },
          {
            model: OrderItem,
            attributes: ['id', 'productName', 'price', 'quantity', 'subtotal']
          },
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
        remark: order.remark,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        merchant: order.Shop,
        address: order.Address,
        items: order.OrderItems,
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

  async getFoodOrders(req, res) {
    try {
      const userId = req.user.id;
      const { page = 1, pageSize = 10, status } = req.query;

      const where = { userId, type: 'food' };
      if (status) {
        where.status = status;
      }

      const { count, rows } = await Order.findAndCountAll({
        where,
        include: [
          {
            model: Shop,
            attributes: ['id', 'name', 'logo']
          }
        ],
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
        merchant: order.Shop
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

  async cancelFoodOrder(req, res) {
    try {
      const userId = req.user.id;
      const { orderId } = req.params;
      const { reason } = req.body;

      const order = await Order.findOne({
        where: { id: orderId, userId, type: 'food' }
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

      const items = await OrderItem.findAll({ where: { orderId: order.id } });
      for (const item of items) {
        await Product.increment('stock', {
          by: item.quantity,
          where: { id: item.productId }
        });
        await Product.decrement('sales', {
          by: item.quantity,
          where: { id: item.productId }
        });
      }

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
        where: { id: orderId, userId, type: 'food' }
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
        where: { id: orderId, userId, type: 'food' }
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

      if (order.Shop) {
        const shop = await Shop.findByPk(order.shopId);
        if (shop) {
          const newRating = (parseFloat(shop.rating) + parseFloat(rating)) / 2;
          await shop.update({ rating: Math.round(newRating * 10) / 10 });
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
}

module.exports = new FoodController();
