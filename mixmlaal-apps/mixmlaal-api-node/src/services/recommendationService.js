/**
 * 推荐系统服务
 * 版本: v1.0.0.0
 * 说明: 基于用户行为和上下文的个性化推荐服务
 */

const db = require('../utils/database.sqlite');

class RecommendationService {
  /**
   * 获取个性化服务推荐
   * @param {string} userId - 用户ID
   * @param {Object} context - 上下文信息（位置、时间等）
   * @returns {Promise<Array>} 推荐的服务列表
   */
  static async getPersonalizedRecommendations(userId, context = {}) {
    try {
      // 1. 获取用户历史行为数据
      const userHistory = await this.getUserHistory(userId);
      
      // 2. 分析用户偏好
      const userPreferences = this.analyzeUserPreferences(userHistory);
      
      // 3. 获取上下文相关的服务
      const contextServices = await this.getContextServices(context);
      
      // 4. 综合推荐
      const recommendations = this.generateRecommendations(
        userPreferences,
        contextServices,
        context
      );
      
      return recommendations;
    } catch (error) {
      console.error('获取个性化推荐错误:', error);
      // 返回默认推荐
      return this.getDefaultRecommendations(context);
    }
  }

  /**
   * 获取用户历史行为数据
   * @param {string} userId - 用户ID
   * @returns {Promise<Object>} 用户历史行为数据
   */
  static async getUserHistory(userId) {
    try {
      // 获取用户的服务套餐历史
      const packages = await db.execute(
        'SELECT * FROM servicePackages WHERE userId = ? ORDER BY createdAt DESC LIMIT 20',
        [userId]
      );
      
      // 获取用户的出行订单历史
      const rideOrders = await db.execute(
        'SELECT * FROM rideOrders WHERE userId = ? ORDER BY createdAt DESC LIMIT 20',
        [userId]
      );
      
      // 获取用户的外卖订单历史
      const foodOrders = await db.execute(
        'SELECT * FROM foodOrders WHERE userId = ? ORDER BY createdAt DESC LIMIT 20',
        [userId]
      );
      
      return {
        packages,
        rideOrders,
        foodOrders
      };
    } catch (error) {
      console.error('获取用户历史错误:', error);
      return {
        packages: [],
        rideOrders: [],
        foodOrders: []
      };
    }
  }

  /**
   * 分析用户偏好
   * @param {Object} userHistory - 用户历史行为数据
   * @returns {Object} 用户偏好分析结果
   */
  static analyzeUserPreferences(userHistory) {
    const preferences = {
      rideTypes: {},
      foodCategories: {},
      timePatterns: {},
      locationPatterns: []
    };

    // 分析出行偏好
    userHistory.rideOrders.forEach(order => {
      const rideType = order.type || 'express';
      preferences.rideTypes[rideType] = (preferences.rideTypes[rideType] || 0) + 1;
      
      // 分析时间模式
      const hour = new Date(order.createdAt).getHours();
      preferences.timePatterns[hour] = (preferences.timePatterns[hour] || 0) + 1;
      
      // 分析位置模式
      if (order.fromLng && order.fromLat) {
        preferences.locationPatterns.push({
          lng: order.fromLng,
          lat: order.fromLat,
          type: 'from'
        });
      }
      if (order.toLng && order.toLat) {
        preferences.locationPatterns.push({
          lng: order.toLng,
          lat: order.toLat,
          type: 'to'
        });
      }
    });

    // 分析外卖偏好
    userHistory.foodOrders.forEach(order => {
      try {
        const items = JSON.parse(order.items);
        items.forEach(item => {
          // 简单的分类推断
          const category = this.inferFoodCategory(item.name);
          preferences.foodCategories[category] = (preferences.foodCategories[category] || 0) + 1;
        });
      } catch (error) {
        console.error('解析订单项目错误:', error);
      }
    });

    return preferences;
  }

  /**
   * 推断食物分类
   * @param {string} foodName - 食物名称
   * @returns {string} 食物分类
   */
  static inferFoodCategory(foodName) {
    const categories = {
      '快餐': ['汉堡', '薯条', '炸鸡', '披萨', '三明治', '快餐'],
      '中餐': ['米饭', '面条', '炒菜', '火锅', '中餐'],
      '西餐': ['牛排', '意面', '沙拉', '西餐'],
      '日料': ['寿司', '刺身', '拉面', '日料'],
      '甜点': ['蛋糕', '冰淇淋', '甜点', '奶茶'],
      '饮品': ['咖啡', '茶', '饮料', '果汁']
    };

    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => foodName.includes(keyword))) {
        return category;
      }
    }

    return '其他';
  }

  /**
   * 获取上下文相关的服务
   * @param {Object} context - 上下文信息
   * @returns {Promise<Array>} 上下文相关的服务
   */
  static async getContextServices(context) {
    try {
      const { lng, lat, radius = 5000, time } = context;
      
      // 模拟上下文相关服务
      const services = [];
      
      // 添加出行服务
      services.push({
        type: 'ride',
        name: '网约车',
        description: '快速便捷的出行服务',
        relevance: 0.8,
        contextMatch: true
      });
      
      // 添加外卖服务
      services.push({
        type: 'food',
        name: '外卖',
        description: '附近的美食送达',
        relevance: 0.7,
        contextMatch: true
      });
      
      // 添加服务套餐
      services.push({
        type: 'package',
        name: '服务套餐',
        description: '出行+美食一站式服务',
        relevance: 0.9,
        contextMatch: true
      });
      
      return services;
    } catch (error) {
      console.error('获取上下文服务错误:', error);
      return [];
    }
  }

  /**
   * 生成推荐
   * @param {Object} userPreferences - 用户偏好
   * @param {Array} contextServices - 上下文相关服务
   * @param {Object} context - 上下文信息
   * @returns {Array} 推荐列表
   */
  static generateRecommendations(userPreferences, contextServices, context) {
    const recommendations = [];
    
    // 1. 基于用户偏好的推荐
    if (Object.keys(userPreferences.rideTypes).length > 0) {
      const preferredRideType = Object.keys(userPreferences.rideTypes).reduce((a, b) => 
        userPreferences.rideTypes[a] > userPreferences.rideTypes[b] ? a : b
      );
      
      recommendations.push({
        type: 'ride',
        name: `${preferredRideType}出行`,
        description: `基于您的偏好推荐${preferredRideType}服务`,
        score: 0.9,
        reason: '根据您的历史出行记录'
      });
    }
    
    if (Object.keys(userPreferences.foodCategories).length > 0) {
      const preferredFoodCategory = Object.keys(userPreferences.foodCategories).reduce((a, b) => 
        userPreferences.foodCategories[a] > userPreferences.foodCategories[b] ? a : b
      );
      
      recommendations.push({
        type: 'food',
        name: `${preferredFoodCategory}外卖`,
        description: `基于您的偏好推荐${preferredFoodCategory}`,
        score: 0.85,
        reason: '根据您的历史点餐记录'
      });
    }
    
    // 2. 基于上下文的推荐
    contextServices.forEach(service => {
      recommendations.push({
        type: service.type,
        name: service.name,
        description: service.description,
        score: service.relevance,
        reason: '基于当前上下文'
      });
    });
    
    // 3. 服务套餐推荐
    recommendations.push({
      type: 'package',
      name: '出行+美食套餐',
      description: '一站式服务套餐，享受优惠',
      score: 0.8,
      reason: '为您提供便捷的一站式服务'
    });
    
    // 按分数排序
    return recommendations.sort((a, b) => b.score - a.score).slice(0, 5);
  }

  /**
   * 获取默认推荐
   * @param {Object} context - 上下文信息
   * @returns {Array} 默认推荐列表
   */
  static getDefaultRecommendations(context) {
    return [
      {
        type: 'package',
        name: '出行+美食套餐',
        description: '一站式服务套餐，享受优惠',
        score: 0.9,
        reason: '热门推荐'
      },
      {
        type: 'ride',
        name: '网约车',
        description: '快速便捷的出行服务',
        score: 0.8,
        reason: '热门推荐'
      },
      {
        type: 'food',
        name: '外卖',
        description: '附近的美食送达',
        score: 0.75,
        reason: '热门推荐'
      }
    ];
  }

  /**
   * 获取基于位置的服务推荐
   * @param {number} lng - 经度
   * @param {number} lat - 纬度
   * @param {number} radius - 搜索半径
   * @returns {Promise<Object>} 位置相关的服务推荐
   */
  static async getLocationBasedRecommendations(lng, lat, radius = 5000) {
    try {
      // 模拟位置相关推荐
      return {
        vehicles: [
          {
            vehicleId: 'V001',
            type: 'taxi',
            driver: {
              driverId: 'D001',
              name: '李师傅',
              rating: 4.8,
              car: { model: '大众帕萨特', color: '白色', plate: '京B·56789' },
            },
            location: { lng: lng + 0.002, lat: lat + 0.001 },
            distance: 320,
            eta: 2,
          },
          {
            vehicleId: 'V002',
            type: 'taxi',
            driver: {
              driverId: 'D002',
              name: '王师傅',
              rating: 4.9,
              car: { model: '丰田卡罗拉', color: '银色', plate: '京C·98765' },
            },
            location: { lng: lng - 0.001, lat: lat + 0.002 },
            distance: 580,
            eta: 4,
          },
        ],
        merchants: [
          {
            merchantId: 'M001',
            name: '麦当劳',
            rating: 4.5,
            sales: 1234,
            deliveryFee: 5,
            minOrder: 20,
            deliveryTime: '30-40分钟',
            category: '快餐',
            address: '北京市朝阳区建国路88号',
            location: { lng: lng + 0.001, lat: lat + 0.001 },
            distance: 800,
            image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400',
          },
          {
            merchantId: 'M002',
            name: '肯德基',
            rating: 4.3,
            sales: 987,
            deliveryFee: 6,
            minOrder: 25,
            deliveryTime: '25-35分钟',
            category: '快餐',
            address: '北京市朝阳区建国路99号',
            location: { lng: lng - 0.002, lat: lat + 0.001 },
            distance: 1200,
            image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400',
          },
        ]
      };
    } catch (error) {
      console.error('获取位置推荐错误:', error);
      return {
        vehicles: [],
        merchants: []
      };
    }
  }
}

module.exports = RecommendationService;