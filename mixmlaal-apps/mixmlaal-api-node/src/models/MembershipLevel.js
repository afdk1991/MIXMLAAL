const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const MembershipLevel = sequelize.define('MembershipLevel', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  level: {
    type: DataTypes.ENUM('normal', 'bronze', 'silver', 'gold', 'platinum'),
    allowNull: false,
    unique: true
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  duration: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '会员有效期（天）'
  },
  discount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '折扣百分比'
  },
  pointsMultiplier: {
    type: DataTypes.DECIMAL(3, 2),
    allowNull: false,
    comment: '积分倍数'
  },
  benefits: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '会员权益'
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'membership_levels',
  timestamps: true
});

module.exports = MembershipLevel;