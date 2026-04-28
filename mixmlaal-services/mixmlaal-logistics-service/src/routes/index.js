const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const vehicleController = require('../controllers/vehicle');
const orderController = require('../controllers/order');
const taskController = require('../controllers/task');
const trackController = require('../controllers/track');

// 车辆管理
router.get('/vehicles', authMiddleware, vehicleController.getVehicles);
router.post('/vehicles', authMiddleware, vehicleController.createVehicle);
router.get('/vehicles/:id', authMiddleware, vehicleController.getVehicleDetail);
router.put('/vehicles/:id', authMiddleware, vehicleController.updateVehicle);
router.delete('/vehicles/:id', authMiddleware, vehicleController.deleteVehicle);

// 订单管理
router.get('/orders', authMiddleware, orderController.getOrders);
router.post('/orders', authMiddleware, orderController.createOrder);
router.get('/orders/:id', authMiddleware, orderController.getOrderDetail);
router.put('/orders/:id', authMiddleware, orderController.updateOrder);
router.delete('/orders/:id', authMiddleware, orderController.deleteOrder);

// 任务管理
router.get('/tasks', authMiddleware, taskController.getTasks);
router.post('/tasks', authMiddleware, taskController.createTask);
router.get('/tasks/:id', authMiddleware, taskController.getTaskDetail);
router.put('/tasks/:id', authMiddleware, taskController.updateTask);
router.delete('/tasks/:id', authMiddleware, taskController.deleteTask);
router.put('/tasks/:id/status', authMiddleware, taskController.updateTaskStatus);

// 轨迹管理
router.get('/tracks', authMiddleware, trackController.getTracks);
router.post('/tracks', authMiddleware, trackController.createTrack);
router.get('/tracks/:id', authMiddleware, trackController.getTrackDetail);

module.exports = router;