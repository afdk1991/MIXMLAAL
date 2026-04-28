const { DataTypes } = require('sequelize')
const { sequelize } = require('../../config/database')

const DeliveryOrder = sequelize.define('DeliveryOrder', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  order_no: {
    type: DataTypes.STRING(32),
    allowNull: false,
    unique: true,
    comment: '配送订单号'
  },
  source_order_no: {
    type: DataTypes.STRING(32),
    allowNull: true,
    comment: '来源订单号(商城/餐饮订单)'
  },
  source_type: {
    type: DataTypes.ENUM('mall', 'restaurant', 'pickup', 'express', 'enterprise'),
    allowNull: true,
    comment: '来源类型 mall商城 restaurant餐饮 pickup代取 express快递 enterprise企业'
  },
  user_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    comment: '用户ID'
  },
  merchant_id: {
    type: DataTypes.BIGINT,
    allowNull: true,
    comment: '商家ID'
  },
  delivery_person_id: {
    type: DataTypes.BIGINT,
    allowNull: true,
    comment: '配送员ID'
  },
  pickup_address: {
    type: DataTypes.JSON,
    allowNull: false,
    comment: '取货地址 {address, lat, lng, contact_name, contact_phone}'
  },
  delivery_address: {
    type: DataTypes.JSON,
    allowNull: false,
    comment: '送货地址 {address, lat, lng, contact_name, contact_phone}'
  },
  distance: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    comment: '配送距离(公里)'
  },
  estimated_pickup_time: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '预计取货时间'
  },
  estimated_delivery_time: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '预计送达时间'
  },
  actual_pickup_time: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '实际取货时间'
  },
  actual_delivery_time: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '实际送达时间'
  },
  delivery_type: {
    type: DataTypes.ENUM('instant', 'scheduled', 'reserved'),
    defaultValue: 'instant',
    comment: '配送类型 instant即时配送 scheduled预约配送 reserved代跑腿'
  },
  weight: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    comment: '物品重量(公斤)'
  },
  base_price: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    comment: '基础配送费'
  },
  distance_price: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    comment: '里程费'
  },
  weight_price: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    comment: '重量费'
  },
  tips: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    comment: '小费'
  },
  total_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: '总费用'
  },
  merchant_discount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    comment: '商家补贴'
  },
  platform_discount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    comment: '平台补贴'
  },
  actual_pay: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: '实际支付'
  },
  status: {
    type: DataTypes.ENUM('pending', 'matched', 'picking', 'picked', 'delivering', 'completed', 'cancelled', 'exception'),
    defaultValue: 'pending',
    comment: '配送状态'
  },
  payment_status: {
    type: DataTypes.ENUM('unpaid', 'paid', 'refunded'),
    defaultValue: 'unpaid',
    comment: '支付状态'
  },
  payment_method: {
    type: DataTypes.ENUM('wechat', 'alipay', 'balance'),
    allowNull: true,
    comment: '支付方式'
  },
  is_urgent: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: '是否加急'
  },
  urgent_fee: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    comment: '加急费'
  },
  is_insurance: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: '是否保价'
  },
  insurance_fee: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    comment: '保价费'
  },
  is_cold_chain: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: '是否冷链'
  },
  delivery_person_rating: {
    type: DataTypes.DECIMAL(2, 1),
    allowNull: true,
    comment: '配送员评分'
  },
  delivery_person_comment: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '配送员评价'
  },
  cancel_reason: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '取消原因'
  },
  cancel_time: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '取消时间'
  },
  exception_reason: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '异常原因'
  },
  goods_desc: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '物品描述'
  },
  pickup_code: {
    type: DataTypes.STRING(6),
    allowNull: true,
    comment: '取货码'
  },
  delivery_code: {
    type: DataTypes.STRING(6),
    allowNull: true,
    comment: '送货码'
  },
  route_trace: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: '配送轨迹'
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
  tableName: 'delivery_orders',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    { fields: ['order_no'] },
    { fields: ['user_id'] },
    { fields: ['delivery_person_id'] },
    { fields: ['status'] },
    { fields: ['created_at'] }
  ]
})

module.exports = DeliveryOrder