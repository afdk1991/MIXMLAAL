const express = require('express');
const router = express.Router();
const errandController = require('../controllers/errandController');
const { authMiddleware } = require('../middleware/auth');

router.post('/estimate', errandController.estimatePrice);
router.get('/types', errandController.getErrandTypes);

router.post('/order', authMiddleware, errandController.createErrandOrder);
router.get('/order/:orderId', authMiddleware, errandController.getErrandOrder);
router.get('/orders', authMiddleware, errandController.getErrandOrders);
router.post('/order/:orderId/cancel', authMiddleware, errandController.cancelErrandOrder);
router.get('/order/:orderId/track', authMiddleware, errandController.getOrderTrack);
router.post('/order/:orderId/rate', authMiddleware, errandController.rateOrder);

module.exports = router;
