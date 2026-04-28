const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customer');

// 获取订单列表
router.get('/orders', customerController.getOrders);

// 获取订单详情
router.get('/orders/:id', customerController.getOrderDetail);

// 创建订单
router.post('/orders', customerController.createOrder);

// 订单追踪
router.get('/orders/:id/track', customerController.trackOrder);

// 支付订单
router.post('/orders/:id/pay', customerController.payOrder);

// 获取客户信息
router.get('/profile', customerController.getProfile);

// 更新客户信息
router.put('/profile', customerController.updateProfile);

// 获取地址列表
router.get('/addresses', customerController.getAddresses);

// 添加地址
router.post('/addresses', customerController.addAddress);

// 更新地址
router.put('/addresses/:id', customerController.updateAddress);

// 删除地址
router.delete('/addresses/:id', customerController.deleteAddress);

module.exports = router;