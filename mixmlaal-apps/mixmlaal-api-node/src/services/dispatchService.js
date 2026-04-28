const axios = require('axios');
const { cache } = require('../config/redis');

// 智能调度服务
class DispatchService {
  constructor() {
    this.model = null;
    this.isModelLoaded = false;
  }

  // 加载模型
  async loadModel() {
    try {
      // 这里可以从文件或云存储加载训练好的模型
      // 暂时使用模拟模型
      this.model = {
        predict: this.mockPredict.bind(this)
      };
      this.isModelLoaded = true;
      console.log('智能调度模型加载成功');
    } catch (error) {
      console.error('智能调度模型加载失败:', error);
    }
  }

  // 模拟预测函数
  mockPredict(input) {
    // 模拟预测逻辑
    const { orders, vehicles, drivers, currentTime } = input;
    
    // 简单的贪心算法：为每个订单选择最合适的车辆和司机
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
          score: bestScore
        });
      }
    });
    
    return assignments;
  }

  // 计算车辆与订单的匹配度
  calculateVehicleScore(vehicle, order) {
    // 考虑车辆类型、容积、载重等因素
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
    
    return score;
  }

  // 计算司机与订单的匹配度
  calculateDriverScore(driver, order) {
    // 考虑司机经验、熟悉路线、工作时间等因素
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
    
    return score;
  }

  // 智能派车
  async intelligentDispatch(orders, vehicles, drivers, options = {}) {
    try {
      // 检查模型是否加载
      if (!this.isModelLoaded) {
        await this.loadModel();
      }
      
      // 生成缓存键
      const cacheKey = `dispatch:${JSON.stringify({ orders, vehicles, drivers, options })}`;
      
      // 尝试从缓存获取结果
      const cachedResult = await cache.get(cacheKey);
      if (cachedResult) {
        return cachedResult;
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
      await cache.set(cacheKey, assignments, 300); // 缓存5分钟
      
      return assignments;
    } catch (error) {
      console.error('智能派车失败:', error);
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

  // 路线优化
  async optimizeRoute(waypoints) {
    try {
      // 使用高德地图API进行路线优化
      const origin = waypoints[0];
      const destination = waypoints[waypoints.length - 1];
      const waypointsStr = waypoints.slice(1, -1).map(w => `${w.lng},${w.lat}`).join('|');
      
      const response = await axios.get('https://restapi.amap.com/v3/direction/driving', {
        params: {
          key: process.env.AMAP_KEY || 'your-amap-key',
          origin: `${origin.lng},${origin.lat}`,
          destination: `${destination.lng},${destination.lat}`,
          waypoints: waypointsStr,
          strategy: 0 // 最快路线
        }
      });
      
      if (response.data.status === '1') {
        return {
          success: true,
          data: response.data.route
        };
      } else {
        return {
          success: false,
          message: '路线优化失败'
        };
      }
    } catch (error) {
      console.error('路线优化失败:', error);
      return {
        success: false,
        message: '路线优化请求失败'
      };
    }
  }

  // 预测订单量
  async predictOrderVolume(timeRange) {
    try {
      // 这里可以使用历史数据和时间特征进行预测
      // 暂时返回模拟数据
      return {
        success: true,
        data: {
          predicted_volume: Math.floor(Math.random() * 100) + 50,
          confidence: 0.8
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
}

module.exports = new DispatchService();