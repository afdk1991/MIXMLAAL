const axios = require('axios');
const socketIO = require('socket.io-client');

// 5G服务客户端
class FiveGService {
  constructor() {
    this.baseURL = process.env.FIVE_G_SERVICE_URL || 'http://localhost:3002';
    this.socketURL = process.env.FIVE_G_SERVICE_SOCKET_URL || 'ws://localhost:3002';
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
    });
    this.socket = null;
  }

  // 初始化WebSocket连接
  initSocket() {
    if (!this.socket) {
      this.socket = socketIO(this.socketURL, {
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000
      });

      this.socket.on('connect', () => {
        console.log('5G服务WebSocket连接成功');
      });

      this.socket.on('disconnect', () => {
        console.log('5G服务WebSocket连接断开');
      });

      this.socket.on('error', (error) => {
        console.error('5G服务WebSocket错误:', error);
      });
    }
    return this.socket;
  }

  // 注册客户端
  registerClient(type, id) {
    const socket = this.initSocket();
    socket.emit('register', { type, id });
  }

  // 发送位置更新
  sendPositionUpdate(vehicleId, latitude, longitude, speed, direction) {
    const socket = this.initSocket();
    socket.emit('position_update', {
      vehicleId,
      latitude,
      longitude,
      speed,
      direction
    });
  }

  // 发送订单状态更新
  sendOrderStatusUpdate(orderId, status) {
    const socket = this.initSocket();
    socket.emit('order_status_update', {
      orderId,
      status
    });
  }

  // 发送指令响应
  sendCommandResponse(commandId, status, message) {
    const socket = this.initSocket();
    socket.emit('command_response', {
      commandId,
      status,
      message
    });
  }

  // 监听位置更新
  onPositionUpdate(callback) {
    const socket = this.initSocket();
    socket.on('position_updated', callback);
  }

  // 监听订单状态更新
  onOrderStatusUpdate(callback) {
    const socket = this.initSocket();
    socket.on('order_status_updated', callback);
  }

  // 监听调度指令
  onDispatchCommand(callback) {
    const socket = this.initSocket();
    socket.on('dispatch_command', callback);
  }

  // 监听指令响应
  onCommandResponse(callback) {
    const socket = this.initSocket();
    socket.on('command_response', callback);
  }

  // 获取车辆位置
  async getVehiclePosition(vehicleId) {
    try {
      const response = await this.client.get(`/vehicles/position?vehicleId=${vehicleId}`);
      return response.data;
    } catch (error) {
      console.error('获取车辆位置失败:', error);
      throw error;
    }
  }

  // 获取所有车辆位置
  async getAllVehiclePositions() {
    try {
      const response = await this.client.get('/vehicles/position');
      return response.data;
    } catch (error) {
      console.error('获取所有车辆位置失败:', error);
      throw error;
    }
  }

  // 获取订单状态
  async getOrderStatus(orderId) {
    try {
      const response = await this.client.get(`/orders/status?orderId=${orderId}`);
      return response.data;
    } catch (error) {
      console.error('获取订单状态失败:', error);
      throw error;
    }
  }

  // 获取所有订单状态
  async getAllOrderStatuses() {
    try {
      const response = await this.client.get('/orders/status');
      return response.data;
    } catch (error) {
      console.error('获取所有订单状态失败:', error);
      throw error;
    }
  }

  // 发送调度指令
  async sendDispatchCommand(vehicleId, command, data) {
    try {
      const response = await this.client.post('/dispatch/command', {
        vehicleId,
        command,
        data
      });
      return response.data;
    } catch (error) {
      console.error('发送调度指令失败:', error);
      throw error;
    }
  }

  // 健康检查
  async healthCheck() {
    try {
      const response = await this.client.get('/health');
      return response.data;
    } catch (error) {
      console.error('5G服务健康检查失败:', error);
      throw error;
    }
  }
}

module.exports = new FiveGService();