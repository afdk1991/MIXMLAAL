const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const chatbotController = require('../controllers/chatbot');

// 智能问答
router.post('/ask', authMiddleware, chatbotController.ask);

// 订单查询
router.get('/order/:order_no', authMiddleware, chatbotController.getOrderInfo);

// 配送查询
router.get('/delivery/:task_id', authMiddleware, chatbotController.getDeliveryInfo);

// 常见问题
router.get('/faq', authMiddleware, chatbotController.getFAQ);

// 对话历史
router.get('/history', authMiddleware, chatbotController.getHistory);
router.post('/history', authMiddleware, chatbotController.addHistory);

module.exports = router;