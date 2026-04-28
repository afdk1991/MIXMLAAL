const { Coupon, UserCoupon, User, Order } = require('../models');
const { Op } = require('sequelize');
const crypto = require('crypto');

class CouponController {
  async getAvailableCoupons(req, res) {
    try {
      const coupons = await Coupon.findAll({
        where: {
          status: 'active',
          remainCount: { [Op.gt]: 0 },
          startTime: { [Op.lte]: new Date() },
          endTime: { [Op.gte]: new Date() }
        },
        order: [['sort', 'ASC']]
      });

      const availableCoupons = coupons.map(coupon => ({
        id: coupon.id,
        name: coupon.name,
        type: coupon.type,
        value: coupon.value,
        minAmount: coupon.minAmount,
        totalCount: coupon.totalCount,
        remainCount: coupon.remainCount,
        startTime: coupon.startTime,
        endTime: coupon.endTime
      }));

      res.json({
        code: 200,
        message: '获取可用优惠券成功',
        data: availableCoupons
      });
    } catch (error) {
      console.error('获取可用优惠券失败:', error);
      res.status(500).json({
        code: 500,
        message: '获取可用优惠券失败',
        data: null
      });
    }
  }

  async getUserCoupons(req, res) {
    try {
      const userId = req.user.id;
      const { status = 'all' } = req.query;

      const where = { userId };
      if (status !== 'all') {
        where.status = status;
      }

      const userCoupons = await UserCoupon.findAll({
        where,
        include: [{
          model: Coupon,
          attributes: ['id', 'name', 'type', 'value', 'minAmount', 'endTime']
        }],
        order: [['createdAt', 'DESC']]
      });

      const coupons = userCoupons.map(uc => ({
        id: uc.id,
        couponId: uc.couponId,
        status: uc.status,
        usedAt: uc.usedAt,
        orderId: uc.orderId,
        createdAt: uc.createdAt,
        coupon: uc.Coupon
      }));

      res.json({
        code: 200,
        message: '获取用户优惠券成功',
        data: coupons
      });
    } catch (error) {
      console.error('获取用户优惠券失败:', error);
      res.status(500).json({
        code: 500,
        message: '获取用户优惠券失败',
        data: null
      });
    }
  }

  async claimCoupon(req, res) {
    try {
      const userId = req.user.id;
      const { couponId } = req.body;

      if (!couponId) {
        return res.json({
          code: 400,
          message: '缺少优惠券ID',
          data: null
        });
      }

      const coupon = await Coupon.findByPk(couponId);
      if (!coupon) {
        return res.json({
          code: 404,
          message: '优惠券不存在',
          data: null
        });
      }

      if (coupon.status !== 'active') {
        return res.json({
          code: 400,
          message: '优惠券已失效',
          data: null
        });
      }

      if (coupon.remainCount <= 0) {
        return res.json({
          code: 400,
          message: '优惠券已领完',
          data: null
        });
      }

      if (new Date() < coupon.startTime || new Date() > coupon.endTime) {
        return res.json({
          code: 400,
          message: '优惠券不在有效期内',
          data: null
        });
      }

      const existing = await UserCoupon.findOne({
        where: { userId, couponId, status: 'unused' }
      });

      if (existing) {
        return res.json({
          code: 400,
          message: '您已领取过该优惠券',
          data: null
        });
      }

      await coupon.decrement('remainCount');

      const userCoupon = await UserCoupon.create({
        userId,
        couponId,
        status: 'unused'
      });

      res.json({
        code: 200,
        message: '领取优惠券成功',
        data: {
          id: userCoupon.id,
          couponId: userCoupon.couponId,
          status: userCoupon.status,
          coupon: {
            id: coupon.id,
            name: coupon.name,
            type: coupon.type,
            value: coupon.value,
            minAmount: coupon.minAmount,
            endTime: coupon.endTime
          }
        }
      });
    } catch (error) {
      console.error('领取优惠券失败:', error);
      res.status(500).json({
        code: 500,
        message: '领取优惠券失败',
        data: null
      });
    }
  }

  async useCoupon(req, res) {
    try {
      const userId = req.user.id;
      const { userCouponId, orderId, orderAmount } = req.body;

      if (!userCouponId || !orderId || !orderAmount) {
        return res.json({
          code: 400,
          message: '缺少必要参数',
          data: null
        });
      }

      const userCoupon = await UserCoupon.findOne({
        where: { id: userCouponId, userId, status: 'unused' },
        include: [Coupon]
      });

      if (!userCoupon) {
        return res.json({
          code: 404,
          message: '优惠券不存在或已使用',
          data: null
        });
      }

      const coupon = userCoupon.Coupon;
      if (!coupon) {
        return res.json({
          code: 404,
          message: '优惠券信息不存在',
          data: null
        });
      }

      if (new Date() > coupon.endTime) {
        await userCoupon.update({ status: 'expired' });
        return res.json({
          code: 400,
          message: '优惠券已过期',
          data: null
        });
      }

      if (orderAmount < coupon.minAmount) {
        return res.json({
          code: 400,
          message: `订单金额不足${coupon.minAmount}元，无法使用此优惠券`,
          data: null
        });
      }

      let discountAmount = 0;
      if (coupon.type === 'cash') {
        discountAmount = coupon.value;
      } else if (coupon.type === 'discount') {
        discountAmount = orderAmount * (coupon.value / 100);
      }

      discountAmount = Math.min(discountAmount, orderAmount);

      await userCoupon.update({
        status: 'used',
        usedAt: new Date(),
        orderId
      });

      res.json({
        code: 200,
        message: '使用优惠券成功',
        data: {
          userCouponId: userCoupon.id,
          discountAmount: Math.round(discountAmount * 100) / 100,
          finalAmount: Math.round((orderAmount - discountAmount) * 100) / 100
        }
      });
    } catch (error) {
      console.error('使用优惠券失败:', error);
      res.status(500).json({
        code: 500,
        message: '使用优惠券失败',
        data: null
      });
    }
  }

  async createCoupon(req, res) {
    try {
      const { name, type, value, minAmount, totalCount, startTime, endTime, status = 'active' } = req.body;

      if (!name || !type || !value || !totalCount || !startTime || !endTime) {
        return res.json({
          code: 400,
          message: '缺少必要参数',
          data: null
        });
      }

      const coupon = await Coupon.create({
        name,
        type,
        value,
        minAmount,
        totalCount,
        remainCount: totalCount,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        status
      });

      res.json({
        code: 200,
        message: '创建优惠券成功',
        data: coupon
      });
    } catch (error) {
      console.error('创建优惠券失败:', error);
      res.status(500).json({
        code: 500,
        message: '创建优惠券失败',
        data: null
      });
    }
  }

  async getCouponStats(req, res) {
    try {
      const stats = await Coupon.findAll({
        attributes: [
          'id',
          'name',
          'type',
          'value',
          'totalCount',
          'remainCount',
          'status'
        ],
        order: [['createdAt', 'DESC']]
      });

      res.json({
        code: 200,
        message: '获取优惠券统计成功',
        data: stats
      });
    } catch (error) {
      console.error('获取优惠券统计失败:', error);
      res.status(500).json({
        code: 500,
        message: '获取优惠券统计失败',
        data: null
      });
    }
  }

  async updateCoupon(req, res) {
    try {
      const { couponId } = req.params;
      const { name, type, value, minAmount, status } = req.body;

      const coupon = await Coupon.findByPk(couponId);
      if (!coupon) {
        return res.json({
          code: 404,
          message: '优惠券不存在',
          data: null
        });
      }

      await coupon.update({
        name: name || coupon.name,
        type: type || coupon.type,
        value: value || coupon.value,
        minAmount: minAmount || coupon.minAmount,
        status: status || coupon.status
      });

      res.json({
        code: 200,
        message: '更新优惠券成功',
        data: coupon
      });
    } catch (error) {
      console.error('更新优惠券失败:', error);
      res.status(500).json({
        code: 500,
        message: '更新优惠券失败',
        data: null
      });
    }
  }

  async deleteCoupon(req, res) {
    try {
      const { couponId } = req.params;

      const coupon = await Coupon.findByPk(couponId);
      if (!coupon) {
        return res.json({
          code: 404,
          message: '优惠券不存在',
          data: null
        });
      }

      await coupon.destroy();

      res.json({
        code: 200,
        message: '删除优惠券成功',
        data: null
      });
    } catch (error) {
      console.error('删除优惠券失败:', error);
      res.status(500).json({
        code: 500,
        message: '删除优惠券失败',
        data: null
      });
    }
  }
}

module.exports = new CouponController();
