const { DataTypes } = require('sequelize')
const { sequelize } = require('../../config/database')

const TravelOrder = sequelize.define('TravelOrder', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  order_no: {
    type: DataTypes.STRING(32),
    allowNull: false,
    unique: true,
    comment: '订单号'
  },
  user_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    comment: '用户ID'
  },
  driver_id: {
    type: DataTypes.BIGINT,
    allowNull: true,
    comment: '司机ID'
  },
  vehicle_id: {
    type: DataTypes.BIGINT,
    allowNull: true,
    comment: '车辆ID'
  },
  order_type: {
    type: DataTypes.ENUM('express', 'comfort', 'premium', 'carpool', 'ridehailing', 'chauffeur', 'rental'),
    allowNull: false,
    comment: '出行类型：express快车 comfort专车 premium豪轿 carpool拼车 ridehailing网约车 chauffeur代驾 rental租车'
  },
  start_location: {
    type: DataTypes.JSON,
    allowNull: false,
    comment: '出发地 {address, lat, lng}'
  },
  end_location: {
    type: DataTypes.JSON,
    allowNull: false,
    comment: '目的地 {address, lat, lng}'
  },
  start_time: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '出发时间'
  },
  estimated_distance: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    comment: '预估距离(公里)'
  },
  estimated_duration: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: '预估时长(分钟)'
  },
  actual_distance: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    comment: '实际距离(公里)'
  },
  actual_duration: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: '实际时长(分钟)'
  },
  base_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: '基础价格'
  },
  distance_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    comment: '里程费'
  },
  time_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    comment: '时长费'
  },
  total_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: '总价格'
  },
  discount_price: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    comment: '优惠金额'
  },
  actual_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: '实际支付金额'
  },
  status: {
    type: DataTypes.ENUM('pending', 'matching', 'accepted', 'arrived', 'started', 'completed', 'cancelled', 'refunded'),
    defaultValue: 'pending',
    comment: '订单状态'
  },
  payment_status: {
    type: DataTypes.ENUM('unpaid', 'paid', 'refunded'),
    defaultValue: 'unpaid',
    comment: '支付状态'
  },
  payment_method: {
    type: DataTypes.ENUM('wechat', 'alipay', 'balance', 'enterprise'),
    allowNull: true,
    comment: '支付方式'
  },
  passenger_count: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    comment: '乘客数量'
  },
  driver_rating: {
    type: DataTypes.DECIMAL(2, 1),
    allowNull: true,
    comment: '司机评分'
  },
  user_rating: {
    type: DataTypes.DECIMAL(2, 1),
    allowNull: true,
    comment: '用户评分'
  },
  driver_comment: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '司机评价'
  },
  user_comment: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '用户评价'
  },
  is_insurance: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: '是否购买保险'
  },
  insurance_amount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    comment: '保险金额'
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
  start_time_actual: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '实际出发时间'
  },
  end_time_actual: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '实际到达时间'
  },
  route_trace: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: '行程轨迹'
  },
  enterprise_id: {
    type: DataTypes.BIGINT,
    allowNull: true,
    comment: '企业ID(企业订单)'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '备注'
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
  tableName: 'travel_orders',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    { fields: ['order_no'] },
    { fields: ['user_id'] },
    { fields: ['driver_id'] },
    { fields: ['status'] },
    { fields: ['created_at'] }
  ]
})

module.exports = TravelOrder