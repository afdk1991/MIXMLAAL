const { DataTypes } = require('sequelize')
const { sequelize } = require('../../config/database')

const Driver = sequelize.define('Driver', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    unique: true,
    comment: '用户ID'
  },
  driver_no: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true,
    comment: '司机编号'
  },
  real_name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '真实姓名'
  },
  id_card: {
    type: DataTypes.STRING(18),
    allowNull: false,
    comment: '身份证号'
  },
  id_card_front: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: '身份证正面'
  },
  id_card_back: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: '身份证背面'
  },
  phone: {
    type: DataTypes.STRING(11),
    allowNull: false,
    comment: '手机号'
  },
  avatar: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: '头像'
  },
  gender: {
    type: DataTypes.TINYINT,
    defaultValue: 0,
    comment: '性别 0未知 1男 2女'
  },
  age: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: '年龄'
  },
  city: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: '所在城市'
  },
  driver_license: {
    type: DataTypes.STRING(20),
    allowNull: false,
    comment: '驾驶证号'
  },
  driver_license_type: {
    type: DataTypes.STRING(10),
    allowNull: false,
    comment: '准驾车型'
  },
  driver_license_front: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: '驾驶证正面'
  },
  driver_license_back: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: '驾驶证背面'
  },
  vehicle_license: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: '行驶证号'
  },
  vehicle_license_front: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: '行驶证正面'
  },
  vehicle_license_back: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: '行驶证背面'
  },
  online_status: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: '在线状态'
  },
  current_location: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: '当前位置 {lat, lng, address}'
  },
  order_status: {
    type: DataTypes.ENUM('available', 'busy', 'offline'),
    defaultValue: 'offline',
    comment: '接单状态 available可接单 busy工作中 offline离线'
  },
  driver_level: {
    type: DataTypes.ENUM('normal', 'silver', 'gold'),
    defaultValue: 'normal',
    comment: '司机等级 normal普通 silver银牌 gold金牌'
  },
  rating: {
    type: DataTypes.DECIMAL(3, 2),
    defaultValue: 5.0,
    comment: '评分'
  },
  total_orders: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '总订单数'
  },
  total_income: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0,
    comment: '总收入'
  },
  this_month_orders: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '本月订单数'
  },
  this_month_income: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0,
    comment: '本月收入'
  },
  audit_status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    defaultValue: 'pending',
    comment: '审核状态'
  },
  audit_time: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '审核时间'
  },
  auditremark: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '审核备注'
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: '是否启用'
  },
  last_order_time: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '最后接单时间'
  },
  balance: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0,
    comment: '余额'
  },
  total_withdraw: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0,
    comment: '累计提现'
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
  tableName: 'drivers',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    { fields: ['user_id'] },
    { fields: ['driver_no'] },
    { fields: ['online_status'] },
    { fields: ['order_status'] },
    { fields: ['driver_level'] }
  ]
})

module.exports = Driver