/**
 * 区块链服务路由
 * 版本: v1.0.0.0
 * 说明: 积分上链和支付区块链化API
 */

const express = require('express');
const router = express.Router();
const BlockchainController = require('../controllers/blockchainController');

// 积分上链
router.post('/points/mint', BlockchainController.mintPoints);

// 积分兑换
router.post('/points/redeem', BlockchainController.redeemPoints);

// 区块链支付
router.post('/payment', BlockchainController.blockchainPayment);

// 查询交易记录
router.get('/transactions', BlockchainController.getTransactions);

// 获取区块链账户信息
router.get('/account/:userId', BlockchainController.getAccountInfo);

// 智能合约交互
router.post('/contract/interact', BlockchainController.interactWithContract);

module.exports = router;