const Track = require('../models/Track');

const trackController = {
  // 获取轨迹列表
  getTracks: async (req, res) => {
    try {
      const { task_id, vehicle_id, page = 1, page_size = 100 } = req.query;
      const offset = (page - 1) * page_size;

      const where = {};
      if (task_id) {
        where.task_id = task_id;
      }
      if (vehicle_id) {
        where.vehicle_id = vehicle_id;
      }

      const { count, rows } = await Track.findAndCountAll({
        where,
        limit: parseInt(page_size),
        offset: parseInt(offset),
        order: [['timestamp', 'ASC']]
      });

      res.json({
        code: 200,
        message: '获取轨迹列表成功',
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
        message: '获取轨迹列表失败',
        data: null
      });
    }
  },

  // 创建轨迹
  createTrack: async (req, res) => {
    const trackData = req.body;

    try {
      const track = await Track.create(trackData);

      res.json({
        code: 200,
        message: '创建轨迹成功',
        data: track
      });
    } catch (error) {
      res.status(500).json({
        code: 500,
        message: '创建轨迹失败',
        data: null
      });
    }
  },

  // 获取轨迹详情
  getTrackDetail: async (req, res) => {
    const { id } = req.params;

    try {
      const track = await Track.findByPk(id);

      if (!track) {
        return res.json({
          code: 404,
          message: '轨迹不存在',
          data: null
        });
      }

      res.json({
        code: 200,
        message: '获取轨迹详情成功',
        data: track
      });
    } catch (error) {
      res.status(500).json({
        code: 500,
        message: '获取轨迹详情失败',
        data: null
      });
    }
  }
};

module.exports = trackController;