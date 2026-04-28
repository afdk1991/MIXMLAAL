const { Op, sequelize } = require('sequelize');
const Vehicle = require('../models/Vehicle');
const Task = require('../models/Task');

const vehicleController = {
  // 获取车辆概览
  getVehicleOverview: async (req, res) => {
    try {
      // 总车辆数
      const totalVehicles = await Vehicle.count();

      // 车辆状态分布
      const vehicleStatus = await Vehicle.findAll({
        attributes: [
          'status',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        group: ['status']
      });

      // 车辆类型分布
      const vehicleType = await Vehicle.findAll({
        attributes: [
          'type',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        group: ['type']
      });

      res.json({
        code: 200,
        message: '获取车辆概览成功',
        data: {
          total_vehicles: totalVehicles,
          status_distribution: vehicleStatus.map(item => ({
            status: item.status,
            count: parseInt(item.dataValues.count)
          })),
          type_distribution: vehicleType.map(item => ({
            type: item.type,
            count: parseInt(item.dataValues.count)
          }))
        }
      });
    } catch (error) {
      res.status(500).json({
        code: 500,
        message: '获取车辆概览失败',
        data: null
      });
    }
  },

  // 获取车辆利用率
  getVehicleUtilization: async (req, res) => {
    try {
      const { start_date, end_date } = req.query;

      const where = {};
      if (start_date) {
        where.created_at = { [Op.gte]: new Date(start_date) };
      }
      if (end_date) {
        where.created_at = { 
          ...where.created_at, 
          [Op.lte]: new Date(end_date)
        };
      }

      // 计算每辆车的任务数
      const vehicleTasks = await Task.findAll({
        attributes: [
          'vehicle_id',
          [sequelize.fn('COUNT', sequelize.col('id')), 'task_count'],
          [sequelize.fn('SUM', sequelize.literal('TIMESTAMPDIFF(HOUR, start_time, end_time)')), 'total_hours']
        ],
        where,
        group: ['vehicle_id']
      });

      // 获取所有车辆信息
      const vehicles = await Vehicle.findAll();

      // 计算利用率
      const utilizationData = vehicles.map(vehicle => {
        const vehicleTask = vehicleTasks.find(task => task.vehicle_id === vehicle.id);
        return {
          id: vehicle.id,
          license_plate: vehicle.license_plate,
          brand: vehicle.brand,
          model: vehicle.model,
          type: vehicle.type,
          status: vehicle.status,
          task_count: vehicleTask ? parseInt(vehicleTask.dataValues.task_count) : 0,
          total_hours: vehicleTask ? parseFloat(vehicleTask.dataValues.total_hours) || 0 : 0,
          utilization: vehicleTask ? (parseFloat(vehicleTask.dataValues.total_hours) / 168 * 100).toFixed(2) : 0 // 按周计算利用率
        };
      });

      // 计算平均利用率
      const totalUtilization = utilizationData.reduce((sum, item) => sum + parseFloat(item.utilization), 0);
      const avgUtilization = utilizationData.length > 0 ? (totalUtilization / utilizationData.length).toFixed(2) : 0;

      res.json({
        code: 200,
        message: '获取车辆利用率成功',
        data: {
          avg_utilization: avgUtilization,
          vehicles: utilizationData
        }
      });
    } catch (error) {
      res.status(500).json({
        code: 500,
        message: '获取车辆利用率失败',
        data: null
      });
    }
  },

  // 获取车辆维护情况
  getVehicleMaintenance: async (req, res) => {
    try {
      const { start_date, end_date } = req.query;

      const where = {};
      if (start_date) {
        where.last_maintenance = { [Op.gte]: new Date(start_date) };
      }
      if (end_date) {
        where.last_maintenance = { 
          ...where.last_maintenance, 
          [Op.lte]: new Date(end_date)
        };
      }

      // 获取需要维护的车辆
      const vehiclesNeedingMaintenance = await Vehicle.findAll({
        where: {
          ...where,
          status: 'maintenance'
        }
      });

      // 获取最近维护的车辆
      const recentlyMaintainedVehicles = await Vehicle.findAll({
        where: {
          ...where,
          last_maintenance: { [Op.not]: null }
        },
        order: [['last_maintenance', 'DESC']],
        limit: 10
      });

      // 计算维护间隔
      const maintenanceIntervals = await Vehicle.findAll({
        where: {
          last_maintenance: { [Op.not]: null }
        }
      });

      const intervals = maintenanceIntervals.map(vehicle => {
        const daysSinceMaintenance = Math.floor((new Date() - new Date(vehicle.last_maintenance)) / (1000 * 60 * 60 * 24));
        return {
          id: vehicle.id,
          license_plate: vehicle.license_plate,
          last_maintenance: vehicle.last_maintenance,
          days_since_maintenance: daysSinceMaintenance,
          next_maintenance_due: daysSinceMaintenance > 30 ? '需要维护' : '正常'
        };
      });

      res.json({
        code: 200,
        message: '获取车辆维护情况成功',
        data: {
          vehicles_needing_maintenance: vehiclesNeedingMaintenance.length,
          recently_maintained_vehicles: recentlyMaintainedVehicles.map(item => ({
            id: item.id,
            license_plate: item.license_plate,
            last_maintenance: item.last_maintenance
          })),
          maintenance_intervals: intervals
        }
      });
    } catch (error) {
      res.status(500).json({
        code: 500,
        message: '获取车辆维护情况失败',
        data: null
      });
    }
  }
};

module.exports = vehicleController;