const express = require('express');
const router = express.Router();
const foodController = require('../controllers/foodController');
const { authMiddleware } = require('../middleware/auth');

router.get('/merchants', foodController.getMerchants);
router.get('/merchants/:merchantId/menu', foodController.getMerchantMenu);

router.post('/order', authMiddleware, foodController.createFoodOrder);
router.get('/order/:orderId', authMiddleware, foodController.getFoodOrder);
router.get('/orders', authMiddleware, foodController.getFoodOrders);
router.post('/order/:orderId/cancel', authMiddleware, foodController.cancelFoodOrder);
router.get('/order/:orderId/track', authMiddleware, foodController.getOrderTrack);
router.post('/order/:orderId/rate', authMiddleware, foodController.rateOrder);

module.exports = router;
