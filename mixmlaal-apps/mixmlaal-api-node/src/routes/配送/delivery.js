const express = require('express')
const router = express.Router()
const deliveryController = require('../../controllers/配送/delivery')
const { authMiddleware } = require('../../middleware/auth')

// 创建配送订单
router.post('/delivery/orders', authMiddleware, deliveryController.createOrder)

// 获取配送订单列表
router.get('/delivery/orders', authMiddleware, deliveryController.getOrderList)

// 获取配送订单详情
router.get('/delivery/orders/:id', authMiddleware, deliveryController.getOrderDetail)

// 取消配送订单
router.post('/delivery/orders/:id/cancel', authMiddleware, deliveryController.cancelOrder)

// 确认取货
router.post('/delivery/orders/:id/pickup', authMiddleware, deliveryController.confirmPickup)

// 确认送达
router.post('/delivery/orders/:id/delivery', authMiddleware, deliveryController.confirmDelivery)

// 获取配送员位置
router.get('/delivery/orders/:id/location', authMiddleware, deliveryController.getDeliveryPersonLocation)

// 评价配送
router.post('/delivery/orders/:id/rate', authMiddleware, deliveryController.rateDelivery)

module.exports = router