const express = require('express');
const router = express.Router();
const dispatchController = require('../controllers/dispatchController');
const { authMiddleware } = require('../middleware/auth');

// 智能路径优化
router.post('/optimize', authMiddleware, dispatchController.optimizeRoute);

// 批量路径优化
router.post('/batch-optimize', authMiddleware, dispatchController.batchOptimizeRoute);

// 地理编码
router.post('/geocode', authMiddleware, dispatchController.geocode);

// 逆地理编码
router.post('/regeocode', authMiddleware, dispatchController.regeocode);

// 实时路况
router.post('/traffic', authMiddleware, dispatchController.getTraffic);

module.exports = router;