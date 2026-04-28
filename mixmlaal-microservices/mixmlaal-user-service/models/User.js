const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM('user', 'admin', 'driver', 'merchant'),
    defaultValue: 'user'
  },
  thirdPartyId: {
    type: DataTypes.STRING(100),
    unique: true,
    allowNull: true
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'users',
  timestamps: true
});

// 同步模型到数据库
const syncUserModel = async () => {
  try {
    await User.sync({ alter: true });
    console.log('用户模型同步成功');
  } catch (error) {
    console.error('用户模型同步失败:', error);
  }
};

module.exports = User;
module.exports.syncUserModel = syncUserModel;