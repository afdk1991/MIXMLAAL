const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/database')

const Menu = sequelize.define('Menu', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  code: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  path: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  icon: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  parent_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: null
  },
  sort: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive'),
    allowNull: false,
    defaultValue: 'active'
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'menus',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
})

// 定义关联关系
Menu.associate = (models) => {
  Menu.hasMany(models.Menu, {
    foreignKey: 'parent_id',
    as: 'children'
  })
  Menu.belongsTo(models.Menu, {
    foreignKey: 'parent_id',
    as: 'parent'
  })
}

module.exports = Menu