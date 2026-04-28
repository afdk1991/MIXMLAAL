const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const helmet = require('helmet');
const cors = require('cors');
const uuid = require('uuid');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// 安全中间件
app.use(helmet());

// 跨域中间件
app.use(cors());

// 解析请求体
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 存储连接的客户端
const clients = new Map();

// 存储车辆位置数据
const vehiclePositions = new Map();

// 存储订单状态
const orderStatus = new Map();

// 健康检查
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: Date.now(),
    connectedClients: clients.size,
    trackedVehicles: vehiclePositions.size
  });
});

// 获取车辆位置
app.get('/vehicles/position', (req, res) => {
  const { vehicleId } = req.query;
  
  if (vehicleId) {
    const position = vehiclePositions.get(vehicleId);
    if (position) {
      return res.json({
        code: 200,
        message: '获取车辆位置成功',
        data: position
      });
    } else {
      return res.status(404).json({
        code: 404,
        message: '车辆位置不存在',
        data: null
      });
    }
  }
  
  // 返回所有车辆位置
  const positions = Array.from(vehiclePositions.entries()).map(([id, pos]) => ({
    vehicleId: id,
    ...pos
  }));
  
  res.json({
    code: 200,
    message: '获取所有车辆位置成功',
    data: positions
  });
});

// 获取订单状态
app.get('/orders/status', (req, res) => {
  const { orderId } = req.query;
  
  if (orderId) {
    const status = orderStatus.get(orderId);
    if (status) {
      return res.json({
        code: 200,
        message: '获取订单状态成功',
        data: status
      });
    } else {
      return res.status(404).json({
        code: 404,
        message: '订单状态不存在',
        data: null
      });
    }
  }
  
  // 返回所有订单状态
  const statuses = Array.from(orderStatus.entries()).map(([id, status]) => ({
    orderId: id,
    ...status
  }));
  
  res.json({
    code: 200,
    message: '获取所有订单状态成功',
    data: statuses
  });
});

// 发送调度指令
app.post('/dispatch/command', (req, res) => {
  const { vehicleId, command, data } = req.body;
  
  if (!vehicleId || !command) {
    return res.status(400).json({
      code: 400,
      message: '缺少必要参数',
      data: null
    });
  }
  
  const client = clients.get(vehicleId);
  if (client) {
    const commandId = uuid.v4();
    const commandData = {
      id: commandId,
      command,
      data,
      timestamp: Date.now()
    };
    
    client.emit('dispatch_command', commandData);
    
    res.json({
      code: 200,
      message: '调度指令发送成功',
      data: {
        commandId,
        vehicleId,
        command
      }
    });
  } else {
    res.status(404).json({
      code: 404,
      message: '车辆未连接',
      data: null
    });
  }
});

// WebSocket连接处理
io.on('connection', (socket) => {
  console.log('新客户端连接:', socket.id);
  
  // 注册客户端
  socket.on('register', (data) => {
    const { type, id } = data;
    if (type && id) {
      clients.set(id, socket);
      socket.clientType = type;
      socket.clientId = id;
      console.log(`客户端注册: ${type} ${id}`);
      
      // 发送注册成功消息
      socket.emit('register_success', {
        id: socket.id,
        clientId: id,
        type: type,
        timestamp: Date.now()
      });
    }
  });
  
  // 接收位置数据
  socket.on('position_update', (data) => {
    const { vehicleId, latitude, longitude, speed, direction, timestamp } = data;
    
    if (vehicleId && latitude && longitude) {
      const position = {
        latitude,
        longitude,
        speed: speed || 0,
        direction: direction || 0,
        timestamp: timestamp || Date.now()
      };
      
      // 更新车辆位置
      vehiclePositions.set(vehicleId, position);
      
      // 广播位置更新
      io.emit('position_updated', {
        vehicleId,
        ...position
      });
      
      console.log(`车辆位置更新: ${vehicleId} (${latitude}, ${longitude})`);
    }
  });
  
  // 接收订单状态更新
  socket.on('order_status_update', (data) => {
    const { orderId, status, timestamp } = data;
    
    if (orderId && status) {
      const orderData = {
        status,
        timestamp: timestamp || Date.now()
      };
      
      // 更新订单状态
      orderStatus.set(orderId, orderData);
      
      // 广播订单状态更新
      io.emit('order_status_updated', {
        orderId,
        ...orderData
      });
      
      console.log(`订单状态更新: ${orderId} - ${status}`);
    }
  });
  
  // 接收调度指令响应
  socket.on('command_response', (data) => {
    const { commandId, status, message, timestamp } = data;
    
    if (commandId) {
      // 广播指令响应
      io.emit('command_response', {
        commandId,
        status,
        message,
        timestamp: timestamp || Date.now()
      });
      
      console.log(`指令响应: ${commandId} - ${status}`);
    }
  });
  
  // 断开连接处理
  socket.on('disconnect', () => {
    console.log('客户端断开连接:', socket.id);
    
    // 从客户端列表中移除
    if (socket.clientId) {
      clients.delete(socket.clientId);
      console.log(`客户端断开: ${socket.clientType} ${socket.clientId}`);
    }
  });
});

// 404处理
app.use((req, res) => {
  res.status(404).json({
    code: 404,
    message: '接口不存在',
    data: null
  });
});

// 错误处理
app.use((err, req, res, next) => {
  console.error('错误:', err);
  res.status(500).json({
    code: 500,
    message: '服务器内部错误',
    data: null
  });
});

const PORT = process.env.PORT || 3002;

server.listen(PORT, () => {
  console.log(`5G服务运行在端口 ${PORT}`);
  console.log(`健康检查: http://localhost:${PORT}/health`);
  console.log(`获取车辆位置: GET http://localhost:${PORT}/vehicles/position`);
  console.log(`获取订单状态: GET http://localhost:${PORT}/orders/status`);
  console.log(`发送调度指令: POST http://localhost:${PORT}/dispatch/command`);
  console.log(`WebSocket服务: ws://localhost:${PORT}`);
});

module.exports = app;