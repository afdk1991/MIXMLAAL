const express = require('express')
const router = express.Router()
const travelController = require('../../controllers/出行/travel')
const { authMiddleware } = require('../../middleware/auth')

// 创建出行订单
router.post('/travel/orders', authMiddleware, travelController.createOrder)

// 获取出行订单列表
router.get('/travel/orders', authMiddleware, travelController.getOrderList)

// 获取出行订单详情
router.get('/travel/orders/:id', authMiddleware, travelController.getOrderDetail)

// 更新订单状态
router.put('/travel/orders/:id/status', authMiddleware, travelController.updateOrderStatus)

// 取消订单
router.post('/travel/orders/:id/cancel', authMiddleware, travelController.cancelOrder)

// 评价订单
router.post('/travel/orders/:id/rate', authMiddleware, travelController.rateOrder)

// 估算价格
router.post('/travel/estimate', authMiddleware, travelController.estimatePrice)

module.exports = router