const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// 获取订单列表
router.get('/', authMiddleware, orderController.getOrders);

// 获取订单详情
router.get('/:id', authMiddleware, orderController.getOrderById);

// 创建订单
router.post('/', authMiddleware, orderController.createOrder);

// 更新订单
router.put('/:id', authMiddleware, orderController.updateOrder);

// 删除订单
router.delete('/:id', authMiddleware, orderController.deleteOrder);

// 分配订单
router.post('/assign', authMiddleware, adminMiddleware, orderController.assignOrder);

// 更新配送状态
router.put('/:id/status', authMiddleware, orderController.updateDeliveryStatus);

// 获取配送轨迹
router.get('/:id/track', authMiddleware, orderController.getDeliveryTrack);

// 获取订单统计信息
router.get('/stats', authMiddleware, orderController.getOrderStats);

module.exports = router;