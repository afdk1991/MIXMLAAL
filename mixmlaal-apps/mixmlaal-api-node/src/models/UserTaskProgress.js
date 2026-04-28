const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const UserTaskProgress = sequelize.define('UserTaskProgress', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'user_id',
    comment: '用户ID'
  },
  taskId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'task_id',
    comment: '任务ID'
  },
  progress: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: '当前进度'
  },
  status: {
    type: DataTypes.ENUM('pending', 'in_progress', 'completed', 'claimed'),
    allowNull: false,
    defaultValue: 'pending',
    comment: '状态：pending待开始，in_progress进行中，completed已完成，claimed已领取奖励'
  },
  completedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'completed_at',
    comment: '完成时间'
  },
  claimedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'claimed_at',
    comment: '奖励领取时间'
  },
  periodStart: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'period_start',
    comment: '周期开始时间（用于每日/每周/每月任务）'
  },
  periodEnd: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'period_end',
    comment: '周期结束时间（用于每日/每周/每月任务）'
  }
}, {
  tableName: 'user_task_progress',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      name: 'idx_user_task_progress_user_id',
      fields: ['user_id']
    },
    {
      name: 'idx_user_task_progress_task_id',
      fields: ['task_id']
    },
    {
      name: 'idx_user_task_progress_status',
      fields: ['status']
    },
    {
      name: 'idx_user_task_progress_user_task',
      fields: ['user_id', 'task_id']
    }
  ]
});

module.exports = UserTaskProgress;