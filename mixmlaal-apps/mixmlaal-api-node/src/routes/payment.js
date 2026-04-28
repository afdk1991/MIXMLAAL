const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { authMiddleware } = require('../middleware/auth');

// 微信支付
router.post('/wechat', authMiddleware, paymentController.wechatPay);
router.post('/wechat/notify', paymentController.wechatNotify);

// 支付宝支付
router.post('/alipay', authMiddleware, paymentController.alipay);
router.post('/alipay/notify', paymentController.alipayNotify);

// 支付状态查询
router.get('/status/:orderNo', authMiddleware, paymentController.getPaymentStatus);

module.exports = router;