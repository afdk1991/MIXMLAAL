const Task = require('../models/Task');
const TaskPoint = require('../models/TaskPoint');

const taskController = {
  // 获取任务列表
  getTasks: async (req, res) => {
    try {
      const { page = 1, page_size = 10, status, vehicle_id, driver_id } = req.query;
      const offset = (page - 1) * page_size;

      const where = {};
      if (status) {
        where.status = status;
      }
      if (vehicle_id) {
        where.vehicle_id = vehicle_id;
      }
      if (driver_id) {
        where.driver_id = driver_id;
      }

      const { count, rows } = await Task.findAndCountAll({
        where,
        limit: parseInt(page_size),
        offset: parseInt(offset),
        order: [['created_at', 'DESC']],
        include: [TaskPoint]
      });

      res.json({
        code: 200,
        message: '获取任务列表成功',
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
        message: '获取任务列表失败',
        data: null
      });
    }
  },

  // 创建任务
  createTask: async (req, res) => {
    const taskData = req.body;
    const { points } = taskData;

    try {
      // 开始事务
      const transaction = await Task.sequelize.transaction();

      try {
        // 创建任务
        const task = await Task.create(
          {
            warehouse_id: taskData.warehouse_id,
            vehicle_id: taskData.vehicle_id,
            driver_id: taskData.driver_id
          },
          { transaction }
        );

        // 创建任务点
        if (points && points.length > 0) {
          const taskPoints = points.map(point => ({
            task_id: task.id,
            order_id: point.order_id,
            sequence: point.sequence
          }));
          await TaskPoint.bulkCreate(taskPoints, { transaction });
        }

        // 提交事务
        await transaction.commit();

        // 重新查询任务，包含任务点
        const createdTask = await Task.findByPk(task.id, {
          include: [TaskPoint]
        });

        res.json({
          code: 200,
          message: '创建任务成功',
          data: createdTask
        });
      } catch (error) {
        // 回滚事务
        await transaction.rollback();
        throw error;
      }
    } catch (error) {
      res.status(500).json({
        code: 500,
        message: '创建任务失败',
        data: null
      });
    }
  },

  // 获取任务详情
  getTaskDetail: async (req, res) => {
    const { id } = req.params;

    try {
      const task = await Task.findByPk(id, {
        include: [TaskPoint]
      });

      if (!task) {
        return res.json({
          code: 404,
          message: '任务不存在',
          data: null
        });
      }

      res.json({
        code: 200,
        message: '获取任务详情成功',
        data: task
      });
    } catch (error) {
      res.status(500).json({
        code: 500,
        message: '获取任务详情失败',
        data: null
      });
    }
  },

  // 更新任务
  updateTask: async (req, res) => {
    const { id } = req.params;
    const taskData = req.body;

    try {
      const task = await Task.findByPk(id);

      if (!task) {
        return res.json({
          code: 404,
          message: '任务不存在',
          data: null
        });
      }

      await task.update(taskData);

      // 重新查询任务，包含任务点
      const updatedTask = await Task.findByPk(id, {
        include: [TaskPoint]
      });

      res.json({
        code: 200,
        message: '更新任务成功',
        data: updatedTask
      });
    } catch (error) {
      res.status(500).json({
        code: 500,
        message: '更新任务失败',
        data: null
      });
    }
  },

  // 删除任务
  deleteTask: async (req, res) => {
    const { id } = req.params;

    try {
      // 开始事务
      const transaction = await Task.sequelize.transaction();

      try {
        // 删除任务点
        await TaskPoint.destroy({ where: { task_id: id }, transaction });

        // 删除任务
        const task = await Task.findByPk(id, { transaction });
        if (!task) {
          await transaction.rollback();
          return res.json({
            code: 404,
            message: '任务不存在',
            data: null
          });
        }

        await task.destroy({ transaction });

        // 提交事务
        await transaction.commit();

        res.json({
          code: 200,
          message: '删除任务成功',
          data: null
        });
      } catch (error) {
        // 回滚事务
        await transaction.rollback();
        throw error;
      }
    } catch (error) {
      res.status(500).json({
        code: 500,
        message: '删除任务失败',
        data: null
      });
    }
  },

  // 更新任务状态
  updateTaskStatus: async (req, res) => {
    const { id } = req.params;
    const { status, start_time, end_time } = req.body;

    try {
      const task = await Task.findByPk(id);

      if (!task) {
        return res.json({
          code: 404,
          message: '任务不存在',
          data: null
        });
      }

      const updateData = { status };
      if (start_time) {
        updateData.start_time = start_time;
      }
      if (end_time) {
        updateData.end_time = end_time;
      }

      await task.update(updateData);

      res.json({
        code: 200,
        message: '更新任务状态成功',
        data: task
      });
    } catch (error) {
      res.status(500).json({
        code: 500,
        message: '更新任务状态失败',
        data: null
      });
    }
  }
};

module.exports = taskController;