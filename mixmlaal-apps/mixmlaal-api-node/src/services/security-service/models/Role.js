const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Role = sequelize.define('Role', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'security_roles',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// 自动同步表结构
Role.sync({ alter: true });

module.exports = Role;