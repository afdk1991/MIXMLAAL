const express = require('express');
const router = express.Router();
const { Vehicle, Warehouse, OrderMain, OrderItem, Task, TaskPoint, SignRecord, Track, VehicleCost, DriverSalary } = require('../models/Logistics');
const User = require('../models/User');
const { Op } = require('sequelize');

// 车辆管理

// 获取车辆列表
router.get('/vehicles', async (req, res) => {
  try {
    const vehicles = await Vehicle.findAll({
      include: [{ model: Warehouse }]
    });
    res.json({ code: 200, data: vehicles, message: '获取车辆列表成功' });
  } catch (error) {
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

// 获取单个车辆信息
router.get('/vehicles/:id', async (req, res) => {
  try {
    const vehicle = await Vehicle.findByPk(req.params.id, {
      include: [{ model: Warehouse }]
    });
    if (!vehicle) {
      return res.status(404).json({ code: 404, message: '车辆不存在' });
    }
    res.json({ code: 200, data: vehicle, message: '获取车辆信息成功' });
  } catch (error) {
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

// 创建车辆
router.post('/vehicles', async (req, res) => {
  try {
    const vehicle = await Vehicle.create(req.body);
    res.json({ code: 200, data: vehicle, message: '创建车辆成功' });
  } catch (error) {
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

// 更新车辆信息
router.put('/vehicles/:id', async (req, res) => {
  try {
    const vehicle = await Vehicle.findByPk(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ code: 404, message: '车辆不存在' });
    }
    await vehicle.update(req.body);
    res.json({ code: 200, data: vehicle, message: '更新车辆信息成功' });
  } catch (error) {
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

// 删除车辆
router.delete('/vehicles/:id', async (req, res) => {
  try {
    const vehicle = await Vehicle.findByPk(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ code: 404, message: '车辆不存在' });
    }
    await vehicle.destroy();
    res.json({ code: 200, message: '删除车辆成功' });
  } catch (error) {
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

// 前置仓管理

// 获取前置仓列表
router.get('/warehouses', async (req, res) => {
  try {
    const warehouses = await Warehouse.findAll();
    res.json({ code: 200, data: warehouses, message: '获取前置仓列表成功' });
  } catch (error) {
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

// 获取单个前置仓信息
router.get('/warehouses/:id', async (req, res) => {
  try {
    const warehouse = await Warehouse.findByPk(req.params.id);
    if (!warehouse) {
      return res.status(404).json({ code: 404, message: '前置仓不存在' });
    }
    res.json({ code: 200, data: warehouse, message: '获取前置仓信息成功' });
  } catch (error) {
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

// 创建前置仓
router.post('/warehouses', async (req, res) => {
  try {
    const warehouse = await Warehouse.create(req.body);
    res.json({ code: 200, data: warehouse, message: '创建前置仓成功' });
  } catch (error) {
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

// 更新前置仓信息
router.put('/warehouses/:id', async (req, res) => {
  try {
    const warehouse = await Warehouse.findByPk(req.params.id);
    if (!warehouse) {
      return res.status(404).json({ code: 404, message: '前置仓不存在' });
    }
    await warehouse.update(req.body);
    res.json({ code: 200, data: warehouse, message: '更新前置仓信息成功' });
  } catch (error) {
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

// 删除前置仓
router.delete('/warehouses/:id', async (req, res) => {
  try {
    const warehouse = await Warehouse.findByPk(req.params.id);
    if (!warehouse) {
      return res.status(404).json({ code: 404, message: '前置仓不存在' });
    }
    await warehouse.destroy();
    res.json({ code: 200, message: '删除前置仓成功' });
  } catch (error) {
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

// 订单管理

// 获取订单列表
router.get('/orders', async (req, res) => {
  try {
    const { page = 1, limit = 10, status, warehouse_id } = req.query;
    const where = {};
    if (status) where.status = status;
    if (warehouse_id) where.warehouse_id = warehouse_id;

    const orders = await OrderMain.findAndCountAll({
      where,
      include: [{ model: OrderItem }],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
      order: [['created_at', 'DESC']]
    });

    res.json({ code: 200, data: { items: orders.rows, total: orders.count }, message: '获取订单列表成功' });
  } catch (error) {
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

// 获取单个订单信息
router.get('/orders/:id', async (req, res) => {
  try {
    const order = await OrderMain.findByPk(req.params.id, {
      include: [{ model: OrderItem }]
    });
    if (!order) {
      return res.status(404).json({ code: 404, message: '订单不存在' });
    }
    res.json({ code: 200, data: order, message: '获取订单信息成功' });
  } catch (error) {
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

// 创建订单
router.post('/orders', async (req, res) => {
  try {
    const { items, ...orderData } = req.body;
    const order = await OrderMain.create(orderData);
    
    if (items && items.length > 0) {
      for (const item of items) {
        await OrderItem.create({
          ...item,
          order_id: order.id
        });
      }
    }

    const orderWithItems = await OrderMain.findByPk(order.id, {
      include: [{ model: OrderItem }]
    });

    res.json({ code: 200, data: orderWithItems, message: '创建订单成功' });
  } catch (error) {
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

// 更新订单状态
router.put('/orders/:id/status', async (req, res) => {
  try {
    const order = await OrderMain.findByPk(req.params.id);
    if (!order) {
      return res.status(404).json({ code: 404, message: '订单不存在' });
    }
    await order.update({ status: req.body.status });
    res.json({ code: 200, data: order, message: '更新订单状态成功' });
  } catch (error) {
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

// 任务管理

// 获取任务列表
router.get('/tasks', async (req, res) => {
  try {
    const { page = 1, limit = 10, status, warehouse_id, driver_id } = req.query;
    const where = {};
    if (status) where.status = status;
    if (warehouse_id) where.warehouse_id = warehouse_id;
    if (driver_id) where.driver_id = driver_id;

    const tasks = await Task.findAndCountAll({
      where,
      include: [
        { model: Warehouse },
        { model: Vehicle },
        { model: User, as: 'driver' },
        { model: TaskPoint, include: [{ model: OrderMain }] }
      ],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
      order: [['created_at', 'DESC']]
    });

    res.json({ code: 200, data: { items: tasks.rows, total: tasks.count }, message: '获取任务列表成功' });
  } catch (error) {
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

// 获取单个任务信息
router.get('/tasks/:id', async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id, {
      include: [
        { model: Warehouse },
        { model: Vehicle },
        { model: User, as: 'driver' },
        { model: TaskPoint, include: [{ model: OrderMain }] }
      ]
    });
    if (!task) {
      return res.status(404).json({ code: 404, message: '任务不存在' });
    }
    res.json({ code: 200, data: task, message: '获取任务信息成功' });
  } catch (error) {
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

// 创建任务
router.post('/tasks', async (req, res) => {
  try {
    const { points, ...taskData } = req.body;
    const task = await Task.create(taskData);
    
    if (points && points.length > 0) {
      for (let i = 0; i < points.length; i++) {
        await TaskPoint.create({
          ...points[i],
          task_id: task.id,
          sequence: i + 1
        });
      }
    }

    const taskWithPoints = await Task.findByPk(task.id, {
      include: [
        { model: Warehouse },
        { model: Vehicle },
        { model: User, as: 'driver' },
        { model: TaskPoint, include: [{ model: OrderMain }] }
      ]
    });

    res.json({ code: 200, data: taskWithPoints, message: '创建任务成功' });
  } catch (error) {
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

// 更新任务状态
router.put('/tasks/:id/status', async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id);
    if (!task) {
      return res.status(404).json({ code: 404, message: '任务不存在' });
    }
    
    const { status, start_time, end_time } = req.body;
    await task.update({ 
      status, 
      ...(start_time && { start_time }),
      ...(end_time && { end_time })
    });
    
    res.json({ code: 200, data: task, message: '更新任务状态成功' });
  } catch (error) {
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

// 更新任务点位状态
router.put('/task-points/:id/status', async (req, res) => {
  try {
    const taskPoint = await TaskPoint.findByPk(req.params.id);
    if (!taskPoint) {
      return res.status(404).json({ code: 404, message: '任务点位不存在' });
    }
    
    const { status, actual_arrival_time, actual_departure_time } = req.body;
    await taskPoint.update({ 
      status, 
      ...(actual_arrival_time && { actual_arrival_time }),
      ...(actual_departure_time && { actual_departure_time })
    });
    
    res.json({ code: 200, data: taskPoint, message: '更新任务点位状态成功' });
  } catch (error) {
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

// 签收记录

// 创建签收记录
router.post('/sign-records', async (req, res) => {
  try {
    const signRecord = await SignRecord.create(req.body);
    res.json({ code: 200, data: signRecord, message: '创建签收记录成功' });
  } catch (error) {
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

// 获取签收记录
router.get('/sign-records', async (req, res) => {
  try {
    const { order_id, task_id } = req.query;
    const where = {};
    if (order_id) where.order_id = order_id;
    if (task_id) where.task_id = task_id;

    const signRecords = await SignRecord.findAll({
      where,
      include: [
        { model: TaskPoint },
        { model: OrderMain },
        { model: User, as: 'driver' }
      ]
    });

    res.json({ code: 200, data: signRecords, message: '获取签收记录成功' });
  } catch (error) {
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

// 轨迹管理

// 上传轨迹
router.post('/tracks', async (req, res) => {
  try {
    const track = await Track.create(req.body);
    res.json({ code: 200, data: track, message: '上传轨迹成功' });
  } catch (error) {
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

// 获取轨迹
router.get('/tracks', async (req, res) => {
  try {
    const { task_id, vehicle_id, driver_id } = req.query;
    const where = {};
    if (task_id) where.task_id = task_id;
    if (vehicle_id) where.vehicle_id = vehicle_id;
    if (driver_id) where.driver_id = driver_id;

    const tracks = await Track.findAll({
      where,
      order: [['timestamp', 'ASC']]
    });

    res.json({ code: 200, data: tracks, message: '获取轨迹成功' });
  } catch (error) {
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

// 成本管理

// 记录车辆成本
router.post('/vehicle-costs', async (req, res) => {
  try {
    const vehicleCost = await VehicleCost.create(req.body);
    res.json({ code: 200, data: vehicleCost, message: '记录车辆成本成功' });
  } catch (error) {
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

// 获取车辆成本
router.get('/vehicle-costs', async (req, res) => {
  try {
    const { vehicle_id, start_date, end_date } = req.query;
    const where = {};
    if (vehicle_id) where.vehicle_id = vehicle_id;
    if (start_date && end_date) {
      where.date = {
        [Op.between]: [start_date, end_date]
      };
    }

    const vehicleCosts = await VehicleCost.findAll({
      where,
      include: [{ model: Vehicle }],
      order: [['date', 'DESC']]
    });

    res.json({ code: 200, data: vehicleCosts, message: '获取车辆成本成功' });
  } catch (error) {
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

// 薪资管理

// 计算司机薪资
router.post('/driver-salaries/calculate', async (req, res) => {
  try {
    const { driver_id, period_start, period_end } = req.body;
    
    // 计算配送费和里程费
    const tasks = await Task.findAll({
      where: {
        driver_id,
        status: 'completed',
        start_time: {
          [Op.between]: [period_start, period_end]
        }
      }
    });

    let delivery_fee = 0;
    let mileage_fee = 0;
    
    tasks.forEach(task => {
      // 简单计算逻辑，实际应根据具体业务规则
      delivery_fee += tasks.length * 5; // 每单5元
      mileage_fee += (task.actual_distance || 0) * 1; // 每公里1元
    });

    // 创建薪资记录
    const driverSalary = await DriverSalary.create({
      driver_id,
      period_start,
      period_end,
      base_salary: 3000, // 假设基本工资3000
      delivery_fee,
      mileage_fee,
      bonus: 0,
      deduction: 0,
      total_salary: 3000 + delivery_fee + mileage_fee,
      status: 'calculated'
    });

    res.json({ code: 200, data: driverSalary, message: '计算司机薪资成功' });
  } catch (error) {
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

// 获取司机薪资
router.get('/driver-salaries', async (req, res) => {
  try {
    const { driver_id, status, period_start, period_end } = req.query;
    const where = {};
    if (driver_id) where.driver_id = driver_id;
    if (status) where.status = status;
    if (period_start && period_end) {
      where.period_start = {
        [Op.gte]: period_start
      };
      where.period_end = {
        [Op.lte]: period_end
      };
    }

    const driverSalaries = await DriverSalary.findAll({
      where,
      include: [{ model: User, as: 'driver' }],
      order: [['period_start', 'DESC']]
    });

    res.json({ code: 200, data: driverSalaries, message: '获取司机薪资成功' });
  } catch (error) {
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

module.exports = router;