const { DataTypes } = require('sequelize')
const { sequelize } = require('../../config/database')

const Vehicle = sequelize.define('Vehicle', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  vehicle_no: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true,
    comment: '车牌号'
  },
  driver_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    comment: '车主ID'
  },
  brand: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: '品牌'
  },
  model: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: '型号'
  },
  color: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: '颜色'
  },
  vehicle_type: {
    type: DataTypes.ENUM('express', 'comfort', 'premium', 'electric', 'luxury'),
    allowNull: false,
    comment: '车辆类型 express快车 comfort专车 premium豪轿 electric电动车 luxury豪华'
  },
  seats: {
    type: DataTypes.INTEGER,
    defaultValue: 4,
    comment: '座位数'
  },
  registration_date: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '注册日期'
  },
  mileage: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0,
    comment: '行驶里程'
  },
  insurance_expire_date: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '保险到期日期'
  },
  inspection_expire_date: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '年检到期日期'
  },
  vehicle_license: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: '行驶证'
  },
  vehicle_photo: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: '车辆照片'
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'maintenance', 'scrapped'),
    defaultValue: 'active',
    comment: '状态 active可用 inactive停用 maintenance维修中 scrapped报废'
  },
  is_default: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: '是否为默认车辆'
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
  tableName: 'vehicles',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    { fields: ['vehicle_no'] },
    { fields: ['driver_id'] },
    { fields: ['status'] },
    { fields: ['vehicle_type'] }
  ]
})

module.exports = Vehicle