/**
 * 支付路由
 * 版本: v1.1.0.0
 * 说明: 支付相关接口，集成微信支付、支付宝
 */

const express = require('express');
const router = express.Router();
const xml2js = require('xml2js');
const PaymentService = require('../services/paymentService');
const { authenticate } = require('../middleware/auth');
const db = require('../utils/database.sqlite');

// 微信支付回调需要原始 body 解析
const rawBodyParser = express.raw({ type: 'application/xml', limit: '1mb' });

// 生成支付ID
const generatePaymentId = () => `PAY${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

/**
 * @route   POST /api/v1/payment/create
 * @desc    创建支付
 * @access  Private
 */
router.post('/create', authenticate, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { orderId, amount, channel, description, openId, returnUrl } = req.body;

    // 参数验证
    if (!orderId || !amount || !channel) {
      return res.status(400).json({
        status: 'error',
        message: '缺少必要参数',
      });
    }

    // 验证支付渠道
    const validChannels = ['wechat', 'alipay'];
    if (!validChannels.includes(channel)) {
      return res.status(400).json({
        status: 'error',
        message: '不支持的支付渠道',
      });
    }

    // 生成支付记录
    const paymentId = generatePaymentId();
    const now = new Date().toISOString();

    await db.run(
      'INSERT INTO payments (paymentId, orderId, userId, amount, channel, status, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [paymentId, orderId, userId, amount, channel, 'pending', now],
    );

    let paymentResult;

    if (channel === 'wechat') {
      paymentResult = await PaymentService.createWechatPayment({
        orderId,
        amount,
        description: description || '米小米拉阿狸订单',
        openId,
      });
    } else if (channel === 'alipay') {
      paymentResult = await PaymentService.createAlipayPayment({
        orderId,
        amount,
        subject: description || '米小米拉阿狸订单',
        returnUrl: returnUrl || 'https://mixm.top/payment/success',
      });
    }

    if (!paymentResult.success) {
      // 更新支付状态为失败
      await db.run(
        'UPDATE payments SET status = ?, updatedAt = ? WHERE paymentId = ?',
        ['failed', now, paymentId],
      );
      return res.status(500).json({
        status: 'error',
        message: '创建支付订单失败',
      });
    }

    // 更新支付记录
    await db.run(
      'UPDATE payments SET tradeNo = ?, updatedAt = ? WHERE paymentId = ?',
      [paymentResult.prepayId || paymentResult.payUrl, now, paymentId],
    );

    res.status(201).json({
      status: 'success',
      message: '支付创建成功',
      data: {
        ...paymentResult,
        paymentId,
      },
    });
  } catch (error) {
    console.error('创建支付错误:', error);
    res.status(500).json({
      status: 'error',
      message: '创建支付失败',
    });
  }
});

/**
 * @route   POST /api/v1/payment/notify/wechat
 * @desc    微信支付回调通知
 * @access  Public
 */
router.post('/notify/wechat', rawBodyParser, async (req, res) => {
  try {
    // 解析 XML
    const xmlString = req.body.toString('utf8');
    const parser = new xml2js.Parser({ explicitArray: false, ignoreAttrs: true });
    const result = await parser.parseStringPromise(xmlString);
    const notifyData = result.xml || {};

    console.log('微信支付回调数据:', notifyData);

    // 验证签名
    const isValid = PaymentService.verifyWechatNotify(notifyData);
    if (!isValid) {
      console.error('微信支付回调签名验证失败');
      res.set('Content-Type', 'application/xml');
      return res.send('<xml><return_code><![CDATA[FAIL]]></return_code><return_msg><![CDATA[签名验证失败]]></return_msg></xml>');
    }

    const { out_trade_no: outTradeNo, transaction_id: transactionId, result_code: resultCode } = notifyData;

    if (resultCode === 'SUCCESS') {
      const now = new Date().toISOString();

      // 更新支付记录为成功
      await db.run(
        'UPDATE payments SET status = ?, tradeNo = ?, paidAt = ?, updatedAt = ? WHERE orderId = ? AND channel = ?',
        ['success', transactionId, now, now, outTradeNo, 'wechat'],
      );

      // 更新订单状态为已支付
      await db.run(
        'UPDATE orders SET status = ?, updatedAt = ? WHERE orderId = ?',
        ['paid', now, outTradeNo],
      );

      console.log('微信支付成功:', outTradeNo, transactionId);
    }

    // 返回成功响应给微信
    res.set('Content-Type', 'application/xml');
    res.send('<xml><return_code><![CDATA[SUCCESS]]></return_code><return_msg><![CDATA[OK]]></return_msg></xml>');
  } catch (error) {
    console.error('微信支付回调处理错误:', error);
    res.set('Content-Type', 'application/xml');
    res.send('<xml><return_code><![CDATA[FAIL]]></return_code><return_msg><![CDATA[处理失败]]></return_msg></xml>');
  }
});

/**
 * @route   POST /api/v1/payment/notify/alipay
 * @desc    支付宝支付回调通知
 * @access  Public
 */
router.post('/notify/alipay', async (req, res) => {
  try {
    const notifyData = req.body;

    // 验证签名
    const isValid = PaymentService.verifyAlipayNotify(notifyData);
    if (!isValid) {
      console.error('支付宝支付回调签名验证失败');
      return res.status(400).send('fail');
    }

    const { out_trade_no: outTradeNo, trade_no: tradeNo, trade_status: tradeStatus } = notifyData;

    if (tradeStatus === 'TRADE_SUCCESS' || tradeStatus === 'TRADE_FINISHED') {
      const now = new Date().toISOString();

      // 更新支付记录为成功
      await db.run(
        'UPDATE payments SET status = ?, tradeNo = ?, paidAt = ?, updatedAt = ? WHERE orderId = ? AND channel = ?',
        ['success', tradeNo, now, now, outTradeNo, 'alipay'],
      );

      // 更新订单状态为已支付
      await db.run(
        'UPDATE orders SET status = ?, updatedAt = ? WHERE orderId = ?',
        ['paid', now, outTradeNo],
      );

      console.log('支付宝支付成功:', outTradeNo, tradeNo);
    }

    // 返回成功响应给支付宝
    res.send('success');
  } catch (error) {
    console.error('支付宝支付回调处理错误:', error);
    res.send('fail');
  }
});

/**
 * @route   GET /api/v1/payment/status/:paymentId
 * @desc    查询支付状态
 * @access  Private
 */
router.get('/status/:paymentId', authenticate, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { paymentId } = req.params;

    const payments = await db.execute(
      'SELECT * FROM payments WHERE paymentId = ? AND userId = ?',
      [paymentId, userId],
    );

    if (payments.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: '支付记录不存在',
      });
    }

    const payment = payments[0];

    res.json({
      status: 'success',
      data: {
        paymentId: payment.paymentId,
        orderId: payment.orderId,
        amount: payment.amount,
        channel: payment.channel,
        status: payment.status,
        tradeNo: payment.tradeNo,
        createdAt: payment.createdAt,
        paidAt: payment.paidAt,
      },
    });
  } catch (error) {
    console.error('查询支付状态错误:', error);
    res.status(500).json({
      status: 'error',
      message: '查询支付状态失败',
    });
  }
});

/**
 * @route   GET /api/v1/payment/list
 * @desc    获取用户支付记录列表
 * @access  Private
 */
router.get('/list', authenticate, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const payments = await db.execute(
      'SELECT * FROM payments WHERE userId = ? ORDER BY createdAt DESC LIMIT ? OFFSET ?',
      [userId, parseInt(limit, 10), offset],
    );

    const countResult = await db.execute(
      'SELECT COUNT(*) as total FROM payments WHERE userId = ?',
      [userId],
    );

    res.json({
      status: 'success',
      data: {
        payments,
        pagination: {
          page: parseInt(page, 10),
          limit: parseInt(limit, 10),
          total: countResult[0].total,
        },
      },
    });
  } catch (error) {
    console.error('获取支付列表错误:', error);
    res.status(500).json({
      status: 'error',
      message: '获取支付列表失败',
    });
  }
});

/**
 * @route   POST /api/v1/payment/refund
 * @desc    申请退款
 * @access  Private
 */
router.post('/refund', authenticate, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { paymentId, orderId, amount, reason } = req.body;

    if (!paymentId || !orderId || !amount) {
      return res.status(400).json({
        status: 'error',
        message: '缺少必要参数',
      });
    }

    // 检查支付记录是否存在且属于当前用户
    const payments = await db.execute(
      'SELECT * FROM payments WHERE paymentId = ? AND userId = ? AND status = ?',
      [paymentId, userId, 'success'],
    );

    if (payments.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: '支付记录不存在或无法退款',
      });
    }

    const refundResult = await PaymentService.refund({
      paymentId,
      orderId,
      amount,
      reason: reason || '用户申请退款',
    });

    if (!refundResult.success) {
      return res.status(500).json({
        status: 'error',
        message: '退款申请失败',
      });
    }

    // 更新支付状态为退款中
    const now = new Date().toISOString();
    await db.run(
      'UPDATE payments SET status = ?, updatedAt = ? WHERE paymentId = ?',
      ['refunding', now, paymentId],
    );

    res.json({
      status: 'success',
      message: '退款申请已提交',
      data: refundResult,
    });
  } catch (error) {
    console.error('申请退款错误:', error);
    res.status(500).json({
      status: 'error',
      message: '申请退款失败',
    });
  }
});

module.exports = router;
