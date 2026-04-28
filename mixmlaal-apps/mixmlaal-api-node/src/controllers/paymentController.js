const { Payment, Order, Wallet, WalletTransaction } = require('../models');
const { Op } = require('sequelize');
const crypto = require('crypto');

class PaymentController {
  async wechatPay(req, res) {
    try {
      const userId = req.user.id;
      const { orderNo, amount } = req.body;

      if (!orderNo || !amount) {
        return res.json({
          code: 400,
          message: '缺少必要参数',
          data: null
        });
      }

      const order = await Order.findOne({ where: { orderNo } });
      if (!order) {
        return res.json({
          code: 404,
          message: '订单不存在',
          data: null
        });
      }

      if (order.userId !== userId) {
        return res.json({
          code: 403,
          message: '无权支付此订单',
          data: null
        });
      }

      const paymentNo = 'WX' + Date.now() + crypto.randomBytes(4).toString('hex').toUpperCase();

      const payment = await Payment.create({
        paymentNo,
        orderNo,
        userId,
        amount,
        method: 'wechat',
        status: 'pending'
      });

      res.json({
        code: 200,
        message: '微信支付下单成功',
        data: {
          paymentNo,
          orderNo,
          amount,
          payUrl: `weixin://wxpay/bizpayurl?pr=${paymentNo}`,
          qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=weixin://wxpay/bizpayurl?pr=${paymentNo}`
        }
      });
    } catch (error) {
      console.error('微信支付下单失败:', error);
      res.status(500).json({
        code: 500,
        message: '支付下单失败',
        data: null
      });
    }
  }

  async wechatNotify(req, res) {
    try {
      const { paymentNo, transactionId, status } = req.body;

      const payment = await Payment.findOne({ where: { paymentNo } });
      if (!payment) {
        return res.json({ code: 404, message: '支付记录不存在' });
      }

      if (status === 'success') {
        await payment.update({ status: 'completed', transactionId });

        const order = await Order.findOne({ where: { orderNo: payment.orderNo } });
        if (order) {
          await order.update({ status: 'paid', payTime: new Date() });
        }
      }

      res.json({ code: 200, message: '回调处理成功' });
    } catch (error) {
      console.error('微信支付回调处理失败:', error);
      res.status(500).json({ code: 500, message: '回调处理失败' });
    }
  }

  async alipay(req, res) {
    try {
      const userId = req.user.id;
      const { orderNo, amount } = req.body;

      if (!orderNo || !amount) {
        return res.json({
          code: 400,
          message: '缺少必要参数',
          data: null
        });
      }

      const order = await Order.findOne({ where: { orderNo } });
      if (!order) {
        return res.json({
          code: 404,
          message: '订单不存在',
          data: null
        });
      }

      if (order.userId !== userId) {
        return res.json({
          code: 403,
          message: '无权支付此订单',
          data: null
        });
      }

      const paymentNo = 'ALI' + Date.now() + crypto.randomBytes(4).toString('hex').toUpperCase();

      const payment = await Payment.create({
        paymentNo,
        orderNo,
        userId,
        amount,
        method: 'alipay',
        status: 'pending'
      });

      res.json({
        code: 200,
        message: '支付宝支付下单成功',
        data: {
          paymentNo,
          orderNo,
          amount,
          payUrl: `alipay://alipay.com?order=${paymentNo}`
        }
      });
    } catch (error) {
      console.error('支付宝支付下单失败:', error);
      res.status(500).json({
        code: 500,
        message: '支付下单失败',
        data: null
      });
    }
  }

  async alipayNotify(req, res) {
    try {
      const { paymentNo, transactionId, status } = req.body;

      const payment = await Payment.findOne({ where: { paymentNo } });
      if (!payment) {
        return res.json({ code: 404, message: '支付记录不存在' });
      }

      if (status === 'success') {
        await payment.update({ status: 'completed', transactionId });

        const order = await Order.findOne({ where: { orderNo: payment.orderNo } });
        if (order) {
          await order.update({ status: 'paid', payTime: new Date() });
        }
      }

      res.json({ code: 200, message: '回调处理成功' });
    } catch (error) {
      console.error('支付宝支付回调处理失败:', error);
      res.status(500).json({ code: 500, message: '回调处理失败' });
    }
  }

  async getPaymentStatus(req, res) {
    try {
      const userId = req.user.id;
      const { orderNo } = req.params;

      const payment = await Payment.findOne({
        where: { orderNo, userId },
        order: [['createdAt', 'DESC']]
      });

      if (!payment) {
        return res.json({
          code: 404,
          message: '支付记录不存在',
          data: null
        });
      }

      res.json({
        code: 200,
        message: '获取支付状态成功',
        data: {
          paymentNo: payment.paymentNo,
          orderNo: payment.orderNo,
          amount: payment.amount,
          method: payment.method,
          status: payment.status,
          transactionId: payment.transactionId,
          createdAt: payment.createdAt,
          updatedAt: payment.updatedAt
        }
      });
    } catch (error) {
      console.error('获取支付状态失败:', error);
      res.status(500).json({
        code: 500,
        message: '获取支付状态失败',
        data: null
      });
    }
  }

  async refund(req, res) {
    try {
      const userId = req.user.id;
      const { orderNo, reason } = req.body;

      const order = await Order.findOne({ where: { orderNo } });
      if (!order) {
        return res.json({
          code: 404,
          message: '订单不存在',
          data: null
        });
      }

      if (order.userId !== userId) {
        return res.json({
          code: 403,
          message: '无权申请退款',
          data: null
        });
      }

      if (!['paid', 'processing'].includes(order.status)) {
        return res.json({
          code: 400,
          message: '当前状态无法申请退款',
          data: null
        });
      }

      const refundNo = 'REF' + Date.now() + crypto.randomBytes(4).toString('hex').toUpperCase();

      await order.update({ status: 'refunding' });

      res.json({
        code: 200,
        message: '退款申请已提交',
        data: {
          refundNo,
          orderNo,
          amount: order.totalAmount,
          reason
        }
      });
    } catch (error) {
      console.error('申请退款失败:', error);
      res.status(500).json({
        code: 500,
        message: '申请退款失败',
        data: null
      });
    }
  }

  async getPaymentHistory(req, res) {
    try {
      const userId = req.user.id;
      const { page = 1, pageSize = 10, status } = req.query;

      const where = { userId };
      if (status) {
        where.status = status;
      }

      const { count, rows } = await Payment.findAndCountAll({
        where,
        limit: parseInt(pageSize),
        offset: (parseInt(page) - 1) * parseInt(pageSize),
        order: [['createdAt', 'DESC']]
      });

      res.json({
        code: 200,
        message: '获取支付历史成功',
        data: {
          items: rows,
          total: count,
          page: parseInt(page),
          pageSize: parseInt(pageSize)
        }
      });
    } catch (error) {
      console.error('获取支付历史失败:', error);
      res.status(500).json({
        code: 500,
        message: '获取支付历史失败',
        data: null
      });
    }
  }
}

module.exports = new PaymentController();
