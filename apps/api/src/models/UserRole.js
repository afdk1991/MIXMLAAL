const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const UserRole = sequelize.define('UserRole', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.BIGINT,
    allowNull: false
  },
  role_id: {
    type: DataTypes.BIGINT,
    allowNull: false
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'user_roles',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = UserRole;