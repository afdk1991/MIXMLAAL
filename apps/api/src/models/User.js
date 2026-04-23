const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  phone: {
    type: DataTypes.STRING(11),
    unique: true,
    allowNull: false
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  nickname: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  avatar: {
    type: DataTypes.STRING(255)
  },
  gender: {
    type: DataTypes.TINYINT,
    defaultValue: 0 // 0:未知, 1:男, 2:女
  },
  birthday: {
    type: DataTypes.DATE
  },
  email: {
    type: DataTypes.STRING(100),
    unique: true
  },
  real_name: {
    type: DataTypes.STRING(50)
  },
  id_card: {
    type: DataTypes.STRING(18),
    unique: true
  },
  user_level: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  user_points: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  balance: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00
  },
  status: {
    type: DataTypes.TINYINT,
    defaultValue: 1 // 1:正常, 0:禁用
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    onUpdate: DataTypes.NOW
  }
}, {
  tableName: 'users',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = User;