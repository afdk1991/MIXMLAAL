/**
 * 5G特色服务路由
 * 版本: v1.0.0.0
 * 说明: 5G网络下的实时定位和高速数据传输API
 */

const express = require('express');
const router = express.Router();
const FiveGController = require('../controllers/fiveGController');

// 获取5G网络状态
router.get('/status', FiveGController.getNetworkStatus);

// 实时定位（5G低延迟）
router.post('/location', FiveGController.realTimeLocation);

// 高速数据传输
router.post('/transfer', FiveGController.highSpeedDataTransfer);

// 5G网络优化建议
router.get('/optimization', FiveGController.getOptimizationSuggestions);

// 5G边缘计算服务
router.post('/edge-computing', FiveGController.edgeComputing);

// 5G网络覆盖查询
router.get('/coverage', FiveGController.getCoverage);

module.exports = router;