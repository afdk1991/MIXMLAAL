const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const RolePermission = sequelize.define('RolePermission', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  role_id: {
    type: DataTypes.BIGINT,
    allowNull: false
  },
  permission_id: {
    type: DataTypes.BIGINT,
    allowNull: false
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'role_permissions',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = RolePermission;