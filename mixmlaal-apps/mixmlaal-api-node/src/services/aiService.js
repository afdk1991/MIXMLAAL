const axios = require('axios');
const redis = require('../config/redis');

// AI服务
class AIService {
  constructor() {
    this.model = null;
    this.isModelLoaded = false;
  }

  // 加载AI模型
  async loadModel() {
    try {
      // 这里可以从文件或云存储加载训练好的模型
      // 暂时使用模拟模型
      this.model = {
        predict: this.mockPredict.bind(this),
        recommend: this.mockRecommend.bind(this)
      };
      this.isModelLoaded = true;
      console.log('AI模型加载成功');
    } catch (error) {
      console.error('AI模型加载失败:', error);
    }
  }

  // 模拟预测函数
  mockPredict(input) {
    // 模拟AI预测逻辑
    const { orders, vehicles, drivers, currentTime } = input;
    
    // 基于历史数据和实时因素的智能调度算法
    const assignments = [];
    
    orders.forEach(order => {
      let bestVehicle = null;
      let bestDriver = null;
      let bestScore = Infinity;
      
      // 遍历所有车辆
      vehicles.forEach(vehicle => {
        // 检查车辆是否可用
        if (vehicle.status !== 'available') return;
        
        // 计算车辆与订单的匹配度
        const vehicleScore = this.calculateVehicleScore(vehicle, order);
        
        // 遍历所有司机
        drivers.forEach(driver => {
          // 检查司机是否可用
          if (driver.status !== 'available') return;
          
          // 计算司机与订单的匹配度
          const driverScore = this.calculateDriverScore(driver, order);
          
          // 计算总得分
          const totalScore = vehicleScore + driverScore;
          
          // 更新最佳匹配
          if (totalScore < bestScore) {
            bestScore = totalScore;
            bestVehicle = vehicle;
            bestDriver = driver;
          }
        });
      });
      
      if (bestVehicle && bestDriver) {
        assignments.push({
          order_id: order.id,
          vehicle_id: bestVehicle.id,
          driver_id: bestDriver.id,
          score: bestScore,
          estimated_time: this.calculateEstimatedTime(order, bestVehicle, bestDriver)
        });
      }
    });
    
    return assignments;
  }

  // 计算车辆与订单的匹配度
  calculateVehicleScore(vehicle, order) {
    // 考虑车辆类型、容积、载重、位置等因素
    let score = 0;
    
    // 车辆类型匹配度
    if (order.type === vehicle.type) {
      score += 10;
    }
    
    // 容积匹配度
    if (vehicle.volume >= order.volume) {
      score += (vehicle.volume - order.volume) / vehicle.volume * 5;
    } else {
      score += 100; // 容积不足，惩罚
    }
    
    // 载重匹配度
    if (vehicle.weight_capacity >= order.weight) {
      score += (vehicle.weight_capacity - order.weight) / vehicle.weight_capacity * 5;
    } else {
      score += 100; // 载重不足，惩罚
    }
    
    // 位置匹配度
    if (vehicle.location && order.pickup_location) {
      const distance = this.calculateDistance(vehicle.location, order.pickup_location);
      score += distance * 0.1; // 距离越远，得分越高（惩罚）
    }
    
    return score;
  }

  // 计算司机与订单的匹配度
  calculateDriverScore(driver, order) {
    // 考虑司机经验、熟悉路线、工作时间、历史表现等因素
    let score = 0;
    
    // 司机经验
    score += (driver.experience || 0) * 0.5;
    
    // 熟悉路线
    if (driver.familiar_areas && driver.familiar_areas.includes(order.area)) {
      score += 5;
    }
    
    // 工作时间
    const now = new Date();
    const hour = now.getHours();
    if (driver.preferred_work_time) {
      const [start, end] = driver.preferred_work_time.split('-').map(Number);
      if (hour >= start && hour <= end) {
        score += 3;
      }
    }
    
    // 历史表现
    if (driver.rating) {
      score += (5 - driver.rating) * 2; // 评分越低，得分越高（惩罚）
    }
    
    // 位置匹配度
    if (driver.location && order.pickup_location) {
      const distance = this.calculateDistance(driver.location, order.pickup_location);
      score += distance * 0.1; // 距离越远，得分越高（惩罚）
    }
    
    return score;
  }

  // 计算距离（简化版）
  calculateDistance(point1, point2) {
    const R = 6371; // 地球半径（公里）
    const dLat = (point2.lat - point1.lat) * Math.PI / 180;
    const dLon = (point2.lng - point1.lng) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(point1.lat * Math.PI / 180) * Math.cos(point2.lat * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    return distance;
  }

  // 计算预计时间
  calculateEstimatedTime(order, vehicle, driver) {
    // 基于距离和历史数据计算预计时间
    if (order.pickup_location && order.delivery_location) {
      const distance = this.calculateDistance(order.pickup_location, order.delivery_location);
      const averageSpeed = 40; // 平均速度（公里/小时）
      const estimatedTime = distance / averageSpeed * 60; // 转换为分钟
      return Math.round(estimatedTime);
    }
    return 30; // 默认30分钟
  }

  // 模拟推荐函数
  mockRecommend(input) {
    const { user, context, history } = input;
    
    // 基于用户历史行为和上下文的个性化推荐
    const recommendations = [];
    
    // 推荐热门服务
    if (context.type === 'home') {
      recommendations.push({
        type: 'service',
        id: '1',
        name: '快速配送',
        description: '30分钟内送达',
        priority: 1
      });
      recommendations.push({
        type: 'service',
        id: '2',
        name: '预约配送',
        description: '指定时间送达',
        priority: 2
      });
    }
    
    // 基于历史订单推荐
    if (history && history.length > 0) {
      const recentOrders = history.slice(0, 3);
      recentOrders.forEach(order => {
        if (order.type === 'food') {
          recommendations.push({
            type: 'food',
            id: order.id,
            name: order.name,
            description: '您常点的美食',
            priority: 3
          });
        }
      });
    }
    
    // 基于位置推荐
    if (context.location) {
      recommendations.push({
        type: 'nearby',
        id: '3',
        name: '附近商家',
        description: '距离您最近的优质商家',
        priority: 4
      });
    }
    
    // 按优先级排序
    recommendations.sort((a, b) => a.priority - b.priority);
    
    return recommendations;
  }

  // 智能调度
  async intelligentDispatch(orders, vehicles, drivers, options = {}) {
    try {
      // 检查模型是否加载
      if (!this.isModelLoaded) {
        await this.loadModel();
      }
      
      // 生成缓存键
      const cacheKey = `ai:dispatch:${JSON.stringify({ orders, vehicles, drivers, options })}`;
      
      // 尝试从缓存获取结果
      const cachedResult = await redis.get(cacheKey);
      if (cachedResult) {
        return JSON.parse(cachedResult);
      }
      
      // 准备输入数据
      const input = {
        orders,
        vehicles,
        drivers,
        currentTime: new Date().toISOString(),
        options
      };
      
      // 使用模型预测
      const assignments = this.model.predict(input);
      
      // 缓存结果
      await redis.set(cacheKey, JSON.stringify(assignments), 'EX', 300); // 缓存5分钟
      
      return assignments;
    } catch (error) {
      console.error('智能调度失败:', error);
      // 失败时使用备用方案
      return this.fallbackDispatch(orders, vehicles, drivers);
    }
  }

  // 备用派车方案
  fallbackDispatch(orders, vehicles, drivers) {
    // 简单的轮询方案
    const assignments = [];
    let vehicleIndex = 0;
    let driverIndex = 0;
    
    orders.forEach(order => {
      // 找到可用的车辆
      let vehicle = null;
      for (let i = 0; i < vehicles.length; i++) {
        const idx = (vehicleIndex + i) % vehicles.length;
        if (vehicles[idx].status === 'available') {
          vehicle = vehicles[idx];
          vehicleIndex = idx + 1;
          break;
        }
      }
      
      // 找到可用的司机
      let driver = null;
      for (let i = 0; i < drivers.length; i++) {
        const idx = (driverIndex + i) % drivers.length;
        if (drivers[idx].status === 'available') {
          driver = drivers[idx];
          driverIndex = idx + 1;
          break;
        }
      }
      
      if (vehicle && driver) {
        assignments.push({
          order_id: order.id,
          vehicle_id: vehicle.id,
          driver_id: driver.id,
          score: 0
        });
      }
    });
    
    return assignments;
  }

  // 个性化推荐
  async getRecommendations(user, context, history) {
    try {
      // 检查模型是否加载
      if (!this.isModelLoaded) {
        await this.loadModel();
      }
      
      // 生成缓存键
      const cacheKey = `ai:recommendations:${user.id}:${context.type}`;
      
      // 尝试从缓存获取结果
      const cachedResult = await redis.get(cacheKey);
      if (cachedResult) {
        return JSON.parse(cachedResult);
      }
      
      // 准备输入数据
      const input = {
        user,
        context,
        history
      };
      
      // 使用模型推荐
      const recommendations = this.model.recommend(input);
      
      // 缓存结果
      await redis.set(cacheKey, JSON.stringify(recommendations), 'EX', 600); // 缓存10分钟
      
      return recommendations;
    } catch (error) {
      console.error('获取推荐失败:', error);
      return [];
    }
  }

  // 预测订单量
  async predictOrderVolume(timeRange, location) {
    try {
      // 基于时间和位置预测订单量
      // 这里可以使用更复杂的预测模型
      const baseVolume = 100;
      const timeFactor = this.calculateTimeFactor(timeRange);
      const locationFactor = this.calculateLocationFactor(location);
      
      const predictedVolume = Math.floor(baseVolume * timeFactor * locationFactor);
      
      return {
        success: true,
        data: {
          predicted_volume: predictedVolume,
          confidence: 0.85
        }
      };
    } catch (error) {
      console.error('订单量预测失败:', error);
      return {
        success: false,
        message: '订单量预测失败'
      };
    }
  }

  // 计算时间因素
  calculateTimeFactor(timeRange) {
    // 基于时间的因素计算
    const now = new Date();
    const hour = now.getHours();
    const dayOfWeek = now.getDay();
    
    // 高峰期（早晚上班时间）
    if ((hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19)) {
      return 1.5;
    }
    
    // 周末
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return 1.2;
    }
    
    // 深夜
    if (hour >= 0 && hour <= 6) {
      return 0.5;
    }
    
    // 正常时间
    return 1.0;
  }

  // 计算位置因素
  calculateLocationFactor(location) {
    // 基于位置的因素计算
    if (!location) return 1.0;
    
    // 商业区
    if (location.type === 'commercial') {
      return 1.3;
    }
    
    // 居民区
    if (location.type === 'residential') {
      return 1.1;
    }
    
    // 工业区
    if (location.type === 'industrial') {
      return 0.8;
    }
    
    // 其他地区
    return 1.0;
  }

  // 智能客服
  async getCustomerServiceResponse(question, context) {
    try {
      // 基于问题和上下文生成智能回复
      // 这里可以集成NLP模型
      const responses = {
        '订单状态': '您的订单正在配送中，预计30分钟内送达',
        '如何退款': '您可以在订单详情页申请退款，我们会在24小时内处理',
        '配送费用': '配送费用根据距离计算，起步价5元',
        '营业时间': '我们的营业时间是每天8:00-22:00',
        '联系客服': '您可以拨打客服电话400-123-4567，或在线咨询'
      };
      
      // 简单的关键词匹配
      for (const [key, value] of Object.entries(responses)) {
        if (question.includes(key)) {
          return {
            success: true,
            data: {
              response: value,
              confidence: 0.9
            }
          };
        }
      }
      
      // 无法匹配时的默认回复
      return {
        success: true,
        data: {
          response: '抱歉，我不太理解您的问题，请尝试重新描述或联系客服',
          confidence: 0.5
        }
      };
    } catch (error) {
      console.error('智能客服失败:', error);
      return {
        success: false,
        message: '智能客服服务暂时不可用'
      };
    }
  }
}

module.exports = new AIService();