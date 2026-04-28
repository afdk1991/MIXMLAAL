const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'locked'),
    allowNull: false,
    defaultValue: 'active'
  },
  role_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  tableName: 'security_users',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// 自动同步表结构
User.sync({ alter: true });

module.exports = User;