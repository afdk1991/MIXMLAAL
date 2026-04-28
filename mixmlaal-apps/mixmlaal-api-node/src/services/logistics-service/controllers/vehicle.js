const Vehicle = require('../models/Vehicle');

const vehicleController = {
  // 获取车辆列表
  getVehicles: async (req, res) => {
    try {
      const { page = 1, page_size = 10, status, type } = req.query;
      const offset = (page - 1) * page_size;

      const where = {};
      if (status) {
        where.status = status;
      }
      if (type) {
        where.type = type;
      }

      const { count, rows } = await Vehicle.findAndCountAll({
        where,
        limit: parseInt(page_size),
        offset: parseInt(offset),
        order: [['created_at', 'DESC']]
      });

      res.json({
        code: 200,
        message: '获取车辆列表成功',
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
        message: '获取车辆列表失败',
        data: null
      });
    }
  },

  // 创建车辆
  createVehicle: async (req, res) => {
    const vehicleData = req.body;

    try {
      const vehicle = await Vehicle.create(vehicleData);

      res.json({
        code: 200,
        message: '创建车辆成功',
        data: vehicle
      });
    } catch (error) {
      res.status(500).json({
        code: 500,
        message: '创建车辆失败',
        data: null
      });
    }
  },

  // 获取车辆详情
  getVehicleDetail: async (req, res) => {
    const { id } = req.params;

    try {
      const vehicle = await Vehicle.findByPk(id);

      if (!vehicle) {
        return res.json({
          code: 404,
          message: '车辆不存在',
          data: null
        });
      }

      res.json({
        code: 200,
        message: '获取车辆详情成功',
        data: vehicle
      });
    } catch (error) {
      res.status(500).json({
        code: 500,
        message: '获取车辆详情失败',
        data: null
      });
    }
  },

  // 更新车辆
  updateVehicle: async (req, res) => {
    const { id } = req.params;
    const vehicleData = req.body;

    try {
      const vehicle = await Vehicle.findByPk(id);

      if (!vehicle) {
        return res.json({
          code: 404,
          message: '车辆不存在',
          data: null
        });
      }

      await vehicle.update(vehicleData);

      res.json({
        code: 200,
        message: '更新车辆成功',
        data: vehicle
      });
    } catch (error) {
      res.status(500).json({
        code: 500,
        message: '更新车辆失败',
        data: null
      });
    }
  },

  // 删除车辆
  deleteVehicle: async (req, res) => {
    const { id } = req.params;

    try {
      const vehicle = await Vehicle.findByPk(id);

      if (!vehicle) {
        return res.json({
          code: 404,
          message: '车辆不存在',
          data: null
        });
      }

      await vehicle.destroy();

      res.json({
        code: 200,
        message: '删除车辆成功',
        data: null
      });
    } catch (error) {
      res.status(500).json({
        code: 500,
        message: '删除车辆失败',
        data: null
      });
    }
  }
};

module.exports = vehicleController;