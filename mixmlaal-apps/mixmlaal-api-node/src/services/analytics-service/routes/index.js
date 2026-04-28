const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const orderController = require('../controllers/order');
const vehicleController = require('../controllers/vehicle');
const deliveryController = require('../controllers/delivery');
const predictionController = require('../controllers/prediction');

// 订单分析
router.get('/orders/overview', authMiddleware, orderController.getOrderOverview);
router.get('/orders/trend', authMiddleware, orderController.getOrderTrend);
router.get('/orders/top-products', authMiddleware, orderController.getTopProducts);
router.get('/orders/export', authMiddleware, orderController.exportOrderData);

// 车辆分析
router.get('/vehicles/overview', authMiddleware, vehicleController.getVehicleOverview);
router.get('/vehicles/utilization', authMiddleware, vehicleController.getVehicleUtilization);
router.get('/vehicles/maintenance', authMiddleware, vehicleController.getVehicleMaintenance);

// 配送分析
router.get('/delivery/overview', authMiddleware, deliveryController.getDeliveryOverview);
router.get('/delivery/time', authMiddleware, deliveryController.getDeliveryTimeAnalysis);
router.get('/delivery/distance', authMiddleware, deliveryController.getDeliveryDistanceAnalysis);
router.get('/delivery/performance', authMiddleware, deliveryController.getDriverPerformance);

// 预测分析
router.get('/prediction/orders', authMiddleware, predictionController.predictOrders);
router.get('/prediction/demand', authMiddleware, predictionController.predictDemand);
router.get('/prediction/route', authMiddleware, predictionController.predictRoute);

module.exports = router;