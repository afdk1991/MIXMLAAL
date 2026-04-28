const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const mapController = require('../controllers/map');

// 地理编码
router.get('/geocode', authMiddleware, mapController.geocode);

// 逆地理编码
router.get('/reverse-geocode', authMiddleware, mapController.reverseGeocode);

// 货车路径规划
router.get('/truck-route', authMiddleware, mapController.truckRoute);

// 限行查询
router.get('/traffic-restriction', authMiddleware, mapController.trafficRestriction);

// 实时路况查询
router.get('/traffic-status', authMiddleware, mapController.trafficStatus);

// 周边搜索
router.get('/around-search', authMiddleware, mapController.aroundSearch);

module.exports = router;