const express = require('express');
const router = express.Router();
const rideController = require('../controllers/rideController');
const { authMiddleware } = require('../middleware/auth');

router.get('/drivers', rideController.getDrivers);
router.post('/estimate', rideController.estimatePrice);
router.get('/vehicle-types', rideController.getVehicleTypes);

router.post('/order/create', authMiddleware, rideController.createRideOrder);
router.get('/order/:id', authMiddleware, rideController.getRideOrder);
router.get('/orders', authMiddleware, rideController.getRideList);
router.post('/order/:id/cancel', authMiddleware, rideController.cancelRideOrder);
router.get('/order/:orderId/driver-location', authMiddleware, rideController.getDriverLocation);
router.post('/order/:orderId/rate', authMiddleware, rideController.rateDriver);

module.exports = router;
