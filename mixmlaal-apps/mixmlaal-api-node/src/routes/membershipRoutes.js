const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const membershipController = require('../controllers/membershipController');

// 会员等级相关接口
router.get('/levels', membershipController.getMembershipLevels);
router.get('/levels/:id', membershipController.getMembershipLevelById);

// 会员相关接口
router.get('/user', authMiddleware, membershipController.getUserMembership);
router.post('/upgrade', authMiddleware, membershipController.upgradeMembership);
router.post('/renew', authMiddleware, membershipController.renewMembership);

// 积分相关接口
router.get('/points', authMiddleware, membershipController.getUserPoints);
router.get('/points/history', authMiddleware, membershipController.getPointHistory);
router.post('/points/earn', authMiddleware, membershipController.earnPoints);
router.post('/points/spend', authMiddleware, membershipController.spendPoints);

module.exports = router;