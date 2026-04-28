const express = require('express');
const router = express.Router();
const couponController = require('../controllers/couponController');
const { authMiddleware } = require('../middleware/auth');

router.get('/available', couponController.getAvailableCoupons);
router.get('/list', authMiddleware, couponController.getUserCoupons);
router.post('/claim', authMiddleware, couponController.claimCoupon);
router.post('/use', authMiddleware, couponController.useCoupon);

// 管理员接口
router.post('/create', authMiddleware, couponController.createCoupon);
router.get('/stats', authMiddleware, couponController.getCouponStats);
router.put('/:couponId', authMiddleware, couponController.updateCoupon);
router.delete('/:couponId', authMiddleware, couponController.deleteCoupon);

module.exports = router;
