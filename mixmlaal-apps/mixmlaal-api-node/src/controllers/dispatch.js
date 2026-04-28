const dispatchService = require('../services/dispatchService');
const aiService = require('../services/aiService');

const dispatchController = {
  // 智能派车
  intelligentDispatch: async (req, res) => {
    const { orders, vehicles, drivers, options } = req.body;

    if (!orders || !vehicles || !drivers) {
      return res.json({
        code: 400,
        message: '缺少必要参数',
        data: null
      });
    }

    try {
      // 使用AI服务进行智能调度
      const assignments = await aiService.intelligentDispatch(orders, vehicles, drivers, options);
      
      res.json({
        code: 200,
        message: '智能派车成功',
        data: assignments
      });
    } catch (error) {
      res.status(500).json({
        code: 500,
        message: '智能派车失败',
        data: null
      });
    }
  },

  // 路线优化
  optimizeRoute: async (req, res) => {
    const { waypoints } = req.body;

    if (!waypoints || waypoints.length < 2) {
      return res.json({
        code: 400,
        message: '至少需要两个路标点',
        data: null
      });
    }

    try {
      const result = await dispatchService.optimizeRoute(waypoints);
      
      if (result.success) {
        res.json({
          code: 200,
          message: '路线优化成功',
          data: result.data
        });
      } else {
        res.json({
          code: 400,
          message: result.message,
          data: null
        });
      }
    } catch (error) {
      res.status(500).json({
        code: 500,
        message: '路线优化失败',
        data: null
      });
    }
  },

  // 预测订单量
  predictOrderVolume: async (req, res) => {
    const { timeRange, location } = req.query;

    try {
      // 使用AI服务进行订单量预测
      const result = await aiService.predictOrderVolume(timeRange, location);
      
      if (result.success) {
        res.json({
          code: 200,
          message: '订单量预测成功',
          data: result.data
        });
      } else {
        res.json({
          code: 400,
          message: result.message,
          data: null
        });
      }
    } catch (error) {
      res.status(500).json({
        code: 500,
        message: '订单量预测失败',
        data: null
      });
    }
  },

  // 获取调度统计
  getDispatchStatistics: async (req, res) => {
    try {
      // 这里可以从数据库获取调度统计数据
      // 暂时返回模拟数据
      const statistics = {
        total_assignments: 1234,
        average_score: 85.5,
        success_rate: 0.98,
        average_response_time: 0.5,
        top_drivers: [
          { id: 1, name: '张三', score: 95.5 },
          { id: 2, name: '李四', score: 92.3 },
          { id: 3, name: '王五', score: 90.1 }
        ],
        top_vehicles: [
          { id: 1, license_plate: '京A12345', score: 94.2 },
          { id: 2, license_plate: '京B67890', score: 91.8 },
          { id: 3, license_plate: '京C24680', score: 89.5 }
        ]
      };
      
      res.json({
        code: 200,
        message: '获取调度统计成功',
        data: statistics
      });
    } catch (error) {
      res.status(500).json({
        code: 500,
        message: '获取调度统计失败',
        data: null
      });
    }
  },

  // 获取个性化推荐
  getRecommendations: async (req, res) => {
    const { user, context, history } = req.body;

    if (!user) {
      return res.json({
        code: 400,
        message: '缺少用户信息',
        data: null
      });
    }

    try {
      // 使用AI服务获取个性化推荐
      const recommendations = await aiService.getRecommendations(user, context || {}, history || []);
      
      res.json({
        code: 200,
        message: '获取个性化推荐成功',
        data: recommendations
      });
    } catch (error) {
      res.status(500).json({
        code: 500,
        message: '获取个性化推荐失败',
        data: null
      });
    }
  },

  // 智能客服
  getCustomerServiceResponse: async (req, res) => {
    const { question, context } = req.body;

    if (!question) {
      return res.json({
        code: 400,
        message: '缺少问题内容',
        data: null
      });
    }

    try {
      // 使用AI服务获取智能客服回复
      const result = await aiService.getCustomerServiceResponse(question, context || {});
      
      if (result.success) {
        res.json({
          code: 200,
          message: '获取智能客服回复成功',
          data: result.data
        });
      } else {
        res.json({
          code: 400,
          message: result.message,
          data: null
        });
      }
    } catch (error) {
      res.status(500).json({
        code: 500,
        message: '获取智能客服回复失败',
        data: null
      });
    }
  }
};

module.exports = dispatchController;