const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const GrowthTask = sequelize.define('GrowthTask', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: '任务名称'
  },
  description: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: '任务描述'
  },
  type: {
    type: DataTypes.ENUM('daily', 'weekly', 'monthly', 'once'),
    allowNull: false,
    defaultValue: 'once',
    comment: '任务类型：daily每日任务，weekly每周任务，monthly每月任务，once一次性任务'
  },
  category: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '任务分类：order消费，review评价，share分享，login登录，promotion推广'
  },
  target: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '目标值，如订单数量、评价数量等'
  },
  rewardPoints: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '奖励积分'
  },
  rewardGrowthPoints: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: '奖励成长值'
  },
  icon: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: '任务图标'
  },
  level: {
    type: DataTypes.ENUM('normal', 'bronze', 'silver', 'gold', 'platinum'),
    allowNull: false,
    defaultValue: 'normal',
    comment: '任务需要的最低会员等级'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    comment: '是否激活'
  },
  sortOrder: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: '排序'
  }
}, {
  tableName: 'growth_tasks',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      name: 'idx_growth_tasks_type',
      fields: ['type']
    },
    {
      name: 'idx_growth_tasks_category',
      fields: ['category']
    },
    {
      name: 'idx_growth_tasks_is_active',
      fields: ['is_active']
    }
  ]
});

module.exports = GrowthTask;