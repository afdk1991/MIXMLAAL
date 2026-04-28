const aiService = require('../services/aiService');

// AI控制器
class AIController {
  // 地址智能识别
  async recognizeAddress(req, res) {
    try {
      const { text } = req.body;
      
      if (!text) {
        return res.json({
          code: 400,
          message: '缺少文本参数',
          data: null
        });
      }
      
      const result = await aiService.recognizeAddress(text);
      
      if (!result.success) {
        return res.json({
          code: 400,
          message: result.message,
          data: null
        });
      }
      
      res.json({
        code: 200,
        message: '地址识别成功',
        data: result.data
      });
    } catch (error) {
      console.error('地址识别失败:', error);
      res.status(500).json({
        code: 500,
        message: '地址识别失败',
        data: null
      });
    }
  }

  // 语音识别
  async speechToText(req, res) {
    try {
      // 这里应该处理语音文件上传
      // 暂时模拟实现
      const result = await aiService.speechToText();
      
      if (!result.success) {
        return res.json({
          code: 400,
          message: result.message,
          data: null
        });
      }
      
      res.json({
        code: 200,
        message: '语音识别成功',
        data: result.data
      });
    } catch (error) {
      console.error('语音识别失败:', error);
      res.status(500).json({
        code: 500,
        message: '语音识别失败',
        data: null
      });
    }
  }

  // 文本转语音
  async textToSpeech(req, res) {
    try {
      const { text } = req.body;
      
      if (!text) {
        return res.json({
          code: 400,
          message: '缺少文本参数',
          data: null
        });
      }
      
      const result = await aiService.textToSpeech(text);
      
      if (!result.success) {
        return res.json({
          code: 400,
          message: result.message,
          data: null
        });
      }
      
      res.json({
        code: 200,
        message: '文本转语音成功',
        data: result.data
      });
    } catch (error) {
      console.error('文本转语音失败:', error);
      res.status(500).json({
        code: 500,
        message: '文本转语音失败',
        data: null
      });
    }
  }

  // 异常智能预警
  async predictAnomaly(req, res) {
    try {
      const data = req.body;
      
      const result = await aiService.predictAnomaly(data);
      
      if (!result.success) {
        return res.json({
          code: 400,
          message: result.message,
          data: null
        });
      }
      
      res.json({
        code: 200,
        message: '异常预警成功',
        data: result.data
      });
    } catch (error) {
      console.error('异常预警失败:', error);
      res.status(500).json({
        code: 500,
        message: '异常预警失败',
        data: null
      });
    }
  }

  // 智能客服
  async getCustomerServiceResponse(req, res) {
    try {
      const { question } = req.body;
      
      if (!question) {
        return res.json({
          code: 400,
          message: '缺少问题参数',
          data: null
        });
      }
      
      const result = await aiService.getCustomerServiceResponse(question);
      
      if (!result.success) {
        return res.json({
          code: 400,
          message: result.message,
          data: null
        });
      }
      
      res.json({
        code: 200,
        message: '智能客服回答成功',
        data: result.data
      });
    } catch (error) {
      console.error('智能客服回答失败:', error);
      res.status(500).json({
        code: 500,
        message: '智能客服回答失败',
        data: null
      });
    }
  }

  // 配送需求预测
  async predictDemand(req, res) {
    try {
      const data = req.body;
      
      const result = await aiService.predictDemand(data);
      
      if (!result.success) {
        return res.json({
          code: 400,
          message: result.message,
          data: null
        });
      }
      
      res.json({
        code: 200,
        message: '需求预测成功',
        data: result.data
      });
    } catch (error) {
      console.error('需求预测失败:', error);
      res.status(500).json({
        code: 500,
        message: '需求预测失败',
        data: null
      });
    }
  }

  // AI聊天服务
  async chatWithAI(req, res) {
    try {
      const { message, history = [] } = req.body;
      
      if (!message) {
        return res.json({
          code: 400,
          message: '缺少消息参数',
          data: null
        });
      }
      
      const result = await aiService.chatWithAI(message, history);
      
      if (!result.success) {
        return res.json({
          code: 400,
          message: result.message,
          data: null
        });
      }
      
      res.json({
        code: 200,
        message: 'AI聊天成功',
        data: result.data
      });
    } catch (error) {
      console.error('AI聊天失败:', error);
      res.status(500).json({
        code: 500,
        message: 'AI聊天失败',
        data: null
      });
    }
  }

  // AI订单分析
  async analyzeOrder(req, res) {
    try {
      const { orderId } = req.params;
      
      if (!orderId) {
        return res.json({
          code: 400,
          message: '缺少订单ID参数',
          data: null
        });
      }
      
      const result = await aiService.analyzeOrder(orderId);
      
      if (!result.success) {
        return res.json({
          code: 400,
          message: result.message,
          data: null
        });
      }
      
      res.json({
        code: 200,
        message: '订单分析成功',
        data: result.data
      });
    } catch (error) {
      console.error('订单分析失败:', error);
      res.status(500).json({
        code: 500,
        message: '订单分析失败',
        data: null
      });
    }
  }

  // AI图像识别
  async imageRecognition(req, res) {
    try {
      // 这里应该处理图像文件上传
      // 暂时模拟实现
      const result = await aiService.imageRecognition();
      
      if (!result.success) {
        return res.json({
          code: 400,
          message: result.message,
          data: null
        });
      }
      
      res.json({
        code: 200,
        message: '图像识别成功',
        data: result.data
      });
    } catch (error) {
      console.error('图像识别失败:', error);
      res.status(500).json({
        code: 500,
        message: '图像识别失败',
        data: null
      });
    }
  }

  // AI推荐系统
  async getRecommendations(req, res) {
    try {
      const { userId, type = 'all' } = req.query;
      
      const result = await aiService.getRecommendations(userId, type);
      
      if (!result.success) {
        return res.json({
          code: 400,
          message: result.message,
          data: null
        });
      }
      
      res.json({
        code: 200,
        message: '推荐成功',
        data: result.data
      });
    } catch (error) {
      console.error('推荐失败:', error);
      res.status(500).json({
        code: 500,
        message: '推荐失败',
        data: null
      });
    }
  }

  // AI多语言翻译
  async translateText(req, res) {
    try {
      const { text, targetLanguage = 'en' } = req.body;
      
      if (!text) {
        return res.json({
          code: 400,
          message: '缺少文本参数',
          data: null
        });
      }
      
      const result = await aiService.translateText(text, targetLanguage);
      
      if (!result.success) {
        return res.json({
          code: 400,
          message: result.message,
          data: null
        });
      }
      
      res.json({
        code: 200,
        message: '翻译成功',
        data: result.data
      });
    } catch (error) {
      console.error('翻译失败:', error);
      res.status(500).json({
        code: 500,
        message: '翻译失败',
        data: null
      });
    }
  }

  // AI情感分析
  async analyzeSentiment(req, res) {
    try {
      const { text } = req.body;
      
      if (!text) {
        return res.json({
          code: 400,
          message: '缺少文本参数',
          data: null
        });
      }
      
      const result = await aiService.analyzeSentiment(text);
      
      if (!result.success) {
        return res.json({
          code: 400,
          message: result.message,
          data: null
        });
      }
      
      res.json({
        code: 200,
        message: '情感分析成功',
        data: result.data
      });
    } catch (error) {
      console.error('情感分析失败:', error);
      res.status(500).json({
        code: 500,
        message: '情感分析失败',
        data: null
      });
    }
  }
}

module.exports = new AIController();