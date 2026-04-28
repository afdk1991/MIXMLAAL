const { GrowthTask, UserTaskProgress, User, PointHistory, MembershipLevel } = require('../models');
const cache = require('../config/redis');

class GrowthTaskController {
  async getTasks(req, res) {
    try {
      const userId = req.user.id;
      const user = await User.findByPk(userId);
      
      const tasks = await GrowthTask.findAll({
        where: { isActive: true },
        order: [['sortOrder', 'ASC']]
      });
      
      const userProgress = await UserTaskProgress.findAll({
        where: { userId },
        include: [{ model: GrowthTask, as: 'task' }]
      });
      
      const now = new Date();
      const taskMap = {};
      
      for (const progress of userProgress) {
        const shouldReset = progress.periodEnd && progress.periodEnd < now;
        if (shouldReset && progress.status !== 'pending') {
          await progress.update({
            progress: 0,
            status: 'pending',
            periodStart: now,
            periodEnd: getNextPeriodEnd(progress.task.type, now)
          });
        }
        taskMap[progress.taskId] = progress;
      }
      
      const result = tasks.map(task => {
        const progress = taskMap[task.id];
        const userLevel = user.membershipLevel;
        const levelIndex = ['normal', 'bronze', 'silver', 'gold', 'platinum'].indexOf(userLevel);
        const taskLevelIndex = ['normal', 'bronze', 'silver', 'gold', 'platinum'].indexOf(task.level);
        const isUnlocked = levelIndex >= taskLevelIndex;
        
        return {
          id: task.id,
          name: task.name,
          description: task.description,
          type: task.type,
          category: task.category,
          target: task.target,
          progress: progress ? progress.progress : 0,
          rewardPoints: task.rewardPoints,
          rewardGrowthPoints: task.rewardGrowthPoints,
          icon: task.icon,
          status: progress ? progress.status : 'pending',
          isUnlocked,
          isCompleted: progress && progress.status === 'completed',
          isClaimed: progress && progress.status === 'claimed'
        };
      });
      
      res.json({
        code: 200,
        message: '获取任务列表成功',
        data: result
      });
    } catch (error) {
      console.error('获取任务列表失败:', error);
      res.status(500).json({
        code: 500,
        message: '获取任务列表失败',
        data: null
      });
    }
  }

  async claimReward(req, res) {
    try {
      const userId = req.user.id;
      const { taskId } = req.body;
      
      const task = await GrowthTask.findByPk(taskId);
      if (!task) {
        return res.json({
          code: 404,
          message: '任务不存在',
          data: null
        });
      }
      
      const progress = await UserTaskProgress.findOne({
        where: { userId, taskId }
      });
      
      if (!progress || progress.status !== 'completed') {
        return res.json({
          code: 400,
          message: '任务未完成或不存在',
          data: null
        });
      }
      
      if (progress.status === 'claimed') {
        return res.json({
          code: 400,
          message: '奖励已领取',
          data: null
        });
      }
      
      const transaction = await User.sequelize.transaction();
      
      try {
        const user = await User.findByPk(userId, { transaction });
        
        await user.update({
          points: user.points + task.rewardPoints,
          growthPoints: (user.growthPoints || 0) + task.rewardGrowthPoints
        }, { transaction });
        
        await PointHistory.create({
          userId,
          points: task.rewardPoints,
          type: 'earn',
          reason: `完成任务：${task.name}`
        }, { transaction });
        
        await progress.update({
          status: 'claimed',
          claimedAt: new Date()
        }, { transaction });
        
        await transaction.commit();
        
        await cache.del(`user_points:${userId}`);
        await cache.del(`user_membership:${userId}`);
        
        res.json({
          code: 200,
          message: '领取奖励成功',
          data: {
            points: user.points + task.rewardPoints,
            growthPoints: (user.growthPoints || 0) + task.rewardGrowthPoints
          }
        });
      } catch (error) {
        await transaction.rollback();
        throw error;
      }
    } catch (error) {
      console.error('领取奖励失败:', error);
      res.status(500).json({
        code: 500,
        message: '领取奖励失败',
        data: null
      });
    }
  }

  async updateProgress(req, res) {
    try {
      const userId = req.user.id;
      const { category, count = 1 } = req.body;
      
      const user = await User.findByPk(userId);
      const now = new Date();
      
      const tasks = await GrowthTask.findAll({
        where: {
          category,
          isActive: true
        }
      });
      
      for (const task of tasks) {
        const userLevelIndex = ['normal', 'bronze', 'silver', 'gold', 'platinum'].indexOf(user.membershipLevel);
        const taskLevelIndex = ['normal', 'bronze', 'silver', 'gold', 'platinum'].indexOf(task.level);
        
        if (userLevelIndex < taskLevelIndex) {
          continue;
        }
        
        let progress = await UserTaskProgress.findOne({
          where: { userId, taskId: task.id }
        });
        
        if (!progress) {
          progress = await UserTaskProgress.create({
            userId,
            taskId: task.id,
            progress: 0,
            status: 'in_progress',
            periodStart: now,
            periodEnd: getNextPeriodEnd(task.type, now)
          });
        }
        
        if (progress.status === 'claimed') {
          if (task.type !== 'once') {
            progress = await UserTaskProgress.create({
              userId,
              taskId: task.id,
              progress: count,
              status: count >= task.target ? 'completed' : 'in_progress',
              periodStart: now,
              periodEnd: getNextPeriodEnd(task.type, now),
              completedAt: count >= task.target ? now : null
            });
          }
          continue;
        }
        
        const shouldReset = progress.periodEnd && progress.periodEnd < now;
        if (shouldReset) {
          progress = await UserTaskProgress.create({
            userId,
            taskId: task.id,
            progress: count,
            status: count >= task.target ? 'completed' : 'in_progress',
            periodStart: now,
            periodEnd: getNextPeriodEnd(task.type, now),
            completedAt: count >= task.target ? now : null
          });
          continue;
        }
        
        if (progress.status === 'completed') {
          continue;
        }
        
        const newProgress = Math.min(progress.progress + count, task.target);
        const status = newProgress >= task.target ? 'completed' : 'in_progress';
        
        await progress.update({
          progress: newProgress,
          status,
          completedAt: status === 'completed' ? now : null
        });
      }
      
      res.json({
        code: 200,
        message: '更新进度成功',
        data: null
      });
    } catch (error) {
      console.error('更新进度失败:', error);
      res.status(500).json({
        code: 500,
        message: '更新进度失败',
        data: null
      });
    }
  }

  async getProgress(req, res) {
    try {
      const userId = req.user.id;
      
      const progress = await UserTaskProgress.findAll({
        where: { userId },
        include: [{ model: GrowthTask, as: 'task' }],
        order: [['createdAt', 'DESC']]
      });
      
      res.json({
        code: 200,
        message: '获取任务进度成功',
        data: progress
      });
    } catch (error) {
      console.error('获取任务进度失败:', error);
      res.status(500).json({
        code: 500,
        message: '获取任务进度失败',
        data: null
      });
    }
  }
}

function getNextPeriodEnd(type, now) {
  const end = new Date(now);
  
  switch (type) {
    case 'daily':
      end.setDate(end.getDate() + 1);
      end.setHours(0, 0, 0, 0);
      break;
    case 'weekly':
      const dayOfWeek = end.getDay();
      const daysUntilSunday = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;
      end.setDate(end.getDate() + daysUntilSunday);
      end.setHours(23, 59, 59, 999);
      break;
    case 'monthly':
      end.setMonth(end.getMonth() + 1);
      end.setDate(1);
      end.setHours(0, 0, 0, 0);
      break;
    default:
      return null;
  }
  
  return end;
}

module.exports = new GrowthTaskController();