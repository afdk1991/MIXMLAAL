/**
 * 地图服务路由
 * 版本: v1.0.0.0
 */

const express = require('express');
const router = express.Router();
const MapController = require('../controllers/mapController');
const auth = require('../middleware/auth');

// 搜索地点
router.get('/search', MapController.searchPlaces);

// 获取路径规划
router.post('/route', MapController.getRoute);

// 获取地理编码
router.get('/geocode', MapController.geocode);

// 获取逆地理编码
router.get('/reverse-geocode', MapController.reverseGeocode);

// 获取附近服务
router.get('/nearby', MapController.getNearbyServices);

// 计算两点之间的距离
router.post('/distance', MapController.calculateDistance);

module.exports = router;