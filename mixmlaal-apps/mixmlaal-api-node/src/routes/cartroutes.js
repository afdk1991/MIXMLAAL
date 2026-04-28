const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { authMiddleware } = require('../middleware/auth');

// 购物车相关路由
router.get('/cart', authMiddleware, cartController.getCart);
router.post('/cart', authMiddleware, cartController.addToCart);
router.put('/cart', authMiddleware, cartController.updateCartItem);
router.delete('/cart/:productId', authMiddleware, cartController.removeFromCart);
router.delete('/cart', authMiddleware, cartController.clearCart);

module.exports = router;