const { Op, sequelize } = require('sequelize');
const Order = require('../models/Order');
const Task = require('../models/Task');
const FAQ = require('../models/FAQ');
const ChatHistory = require('../models/ChatHistory');

// 模拟AI回答的逻辑
const getAIResponse = (question) => {
  // 简单的关键词匹配
  const lowerQuestion = question.toLowerCase();
  
  if (lowerQuestion.includes('订单') || lowerQuestion.includes('order')) {
    return '您可以告诉我订单号，我为您查询订单状态。';
  } else if (lowerQuestion.includes('配送') || lowerQuestion.includes('delivery')) {
    return '您可以告诉我配送任务ID，我为您查询配送进度。';
  } else if (lowerQuestion.includes('发货') || lowerQuestion.includes('shipping')) {
    return '一般情况下，订单会在24小时内发货，请耐心等待。';
  } else if (lowerQuestion.includes('退款') || lowerQuestion.includes('refund')) {
    return '如需退款，请在订单详情页申请，我们会在3-5个工作日内处理。';
  } else if (lowerQuestion.includes('客服') || lowerQuestion.includes('service')) {
    return '人工客服工作时间为9:00-21:00，您可以在工作时间联系我们。';
  } else if (lowerQuestion.includes('谢谢') || lowerQuestion.includes('thank')) {
    return '不客气，很高兴为您服务！';
  } else {
    return '抱歉，我不太理解您的问题。您可以尝试询问关于订单、配送、退款等方面的问题，或者联系人工客服获取帮助。';
  }
};

const chatbotController = {
  // 智能问答
  ask: async (req, res) => {
    const { user } = req;
    const { question } = req.body;

    try {
      // 获取AI回答
      const answer = getAIResponse(question);

      // 保存对话历史
      await ChatHistory.create({
        user_id: user.id,
        question,
        answer
      });

      res.json({
        code: 200,
        message: '获取回答成功',
        data: {
          question,
          answer
        }
      });
    } catch (error) {
      res.status(500).json({
        code: 500,
        message: '获取回答失败',
        data: null
      });
    }
  },

  // 订单查询
  getOrderInfo: async (req, res) => {
    const { order_no } = req.params;

    try {
      const order = await Order.findOne({
        where: {
          order_no
        }
      });

      if (!order) {
        return res.json({
          code: 404,
          message: '订单不存在',
          data: null
        });
      }

      res.json({
        code: 200,
        message: '获取订单信息成功',
        data: order
      });
    } catch (error) {
      res.status(500).json({
        code: 500,
        message: '获取订单信息失败',
        data: null
      });
    }
  },

  // 配送查询
  getDeliveryInfo: async (req, res) => {
    const { task_id } = req.params;

    try {
      const task = await Task.findByPk(task_id);

      if (!task) {
        return res.json({
          code: 404,
          message: '配送任务不存在',
          data: null
        });
      }

      res.json({
        code: 200,
        message: '获取配送信息成功',
        data: task
      });
    } catch (error) {
      res.status(500).json({
        code: 500,
        message: '获取配送信息失败',
        data: null
      });
    }
  },

  // 获取常见问题
  getFAQ: async (req, res) => {
    try {
      const faqs = await FAQ.findAll();

      res.json({
        code: 200,
        message: '获取常见问题成功',
        data: faqs
      });
    } catch (error) {
      res.status(500).json({
        code: 500,
        message: '获取常见问题失败',
        data: null
      });
    }
  },

  // 获取对话历史
  getHistory: async (req, res) => {
    const { user } = req;
    const { page = 1, page_size = 20 } = req.query;
    const offset = (page - 1) * page_size;

    try {
      const { count, rows } = await ChatHistory.findAndCountAll({
        where: {
          user_id: user.id
        },
        limit: parseInt(page_size),
        offset: parseInt(offset),
        order: [['created_at', 'DESC']]
      });

      res.json({
        code: 200,
        message: '获取对话历史成功',
        data: {
          items: rows,
          total: count,
          page: parseInt(page),
          page_size: parseInt(page_size)
        }
      });
    } catch (error) {
      res.status(500).json({
        code: 500,
        message: '获取对话历史失败',
        data: null
      });
    }
  },

  // 添加对话历史
  addHistory: async (req, res) => {
    const { user } = req;
    const { question, answer } = req.body;

    try {
      const chatHistory = await ChatHistory.create({
        user_id: user.id,
        question,
        answer
      });

      res.json({
        code: 200,
        message: '添加对话历史成功',
        data: chatHistory
      });
    } catch (error) {
      res.status(500).json({
        code: 500,
        message: '添加对话历史失败',
        data: null
      });
    }
  }
};

module.exports = chatbotController;