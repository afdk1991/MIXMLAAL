const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { authMiddleware } = require('../middleware/auth');

// 地址智能识别
router.post('/recognize-address', authMiddleware, aiController.recognizeAddress);

// 语音识别
router.post('/speech-to-text', authMiddleware, aiController.speechToText);

// 文本转语音
router.post('/text-to-speech', authMiddleware, aiController.textToSpeech);

// 异常智能预警
router.post('/predict-anomaly', authMiddleware, aiController.predictAnomaly);

// 智能客服
router.post('/customer-service', authMiddleware, aiController.getCustomerServiceResponse);

// 配送需求预测
router.post('/predict-demand', authMiddleware, aiController.predictDemand);

module.exports = router;