const express = require('express');
const router = express.Router();

/**
 * 支付结算模块路由
 * 对应域名: pay.laal.top
 * 用途: 支付结算入口
 */

// 获取支付方式
router.get('/methods', (req, res) => {
  res.json({
    code: 200,
    message: 'success',
    data: [
      {
        id: 1,
        name: '支付宝',
        code: 'alipay',
        icon: 'https://img.laal.top/icons/alipay.png',
        status: 'active'
      },
      {
        id: 2,
        name: '微信支付',
        code: 'wechat',
        icon: 'https://img.laal.top/icons/wechat.png',
        status: 'active'
      },
      {
        id: 3,
        name: '银行卡',
        code: 'bank',
        icon: 'https://img.laal.top/icons/bank.png',
        status: 'active'
      }
    ]
  });
});

// 创建支付订单
router.post('/create', (req, res) => {
  const { amount, orderId, payMethod, description } = req.body;
  res.json({
    code: 200,
    message: '支付订单创建成功',
    data: {
      paymentId: 'pay-123456',
      orderId,
      amount,
      payMethod,
      description,
      payUrl: 'https://pay.laal.top/pay/pay-123456',
      qrCode: 'https://pay.laal.top/qr/pay-123456',
      expireAt: new Date(Date.now() + 30 * 60 * 1000).toISOString()
    }
  });
});

// 查询支付状态
router.get('/status/:id', (req, res) => {
  const { id } = req.params;
  res.json({
    code: 200,
    message: 'success',
    data: {
      paymentId: id,
      status: 'success',
      amount: 6999,
      payMethod: 'alipay',
      paidAt: new Date().toISOString(),
      transactionId: 'TRX-123456'
    }
  });
});

// 支付回调
router.post('/callback', (req, res) => {
  const { paymentId, status, transactionId } = req.body;
  res.json({
    code: 200,
    message: '回调处理成功',
    data: {
      paymentId,
      status,
      transactionId
    }
  });
});

// 退款
router.post('/refund', (req, res) => {
  const { paymentId, amount, reason } = req.body;
  res.json({
    code: 200,
    message: '退款申请成功',
    data: {
      refundId: 'refund-123456',
      paymentId,
      amount,
      reason,
      status: 'pending',
      createdAt: new Date().toISOString()
    }
  });
});

// 查询退款状态
router.get('/refund/:id', (req, res) => {
  const { id } = req.params;
  res.json({
    code: 200,
    message: 'success',
    data: {
      refundId: id,
      paymentId: 'pay-123456',
      amount: 6999,
      status: 'success',
      refundedAt: new Date().toISOString(),
      transactionId: 'REFUND-123456'
    }
  });
});

// 获取支付记录
router.get('/records', (req, res) => {
  res.json({
    code: 200,
    message: 'success',
    data: {
      total: 10,
      page: 1,
      pageSize: 10,
      records: [
        {
          id: 1,
          paymentId: 'pay-123456',
          orderId: 'order-123456',
          amount: 6999,
          payMethod: 'alipay',
          status: 'success',
          createdAt: '2024-01-01T00:00:00Z',
          paidAt: '2024-01-01T00:01:00Z'
        },
        {
          id: 2,
          paymentId: 'pay-789012',
          orderId: 'order-789012',
          amount: 1999,
          payMethod: 'wechat',
          status: 'success',
          createdAt: '2024-01-02T00:00:00Z',
          paidAt: '2024-01-02T00:01:00Z'
        }
      ]
    }
  });
});

module.exports = router;