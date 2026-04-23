const { DataTypes } = require('sequelize')
const { sequelize } = require('../../config/database')

const DeliveryPerson = sequelize.define('DeliveryPerson', {
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
  person_no: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true,
    comment: '配送员编号'
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
  delivery_type: {
    type: DataTypes.ENUM('fulltime', 'parttime'),
    defaultValue: 'parttime',
    comment: '配送类型 fulltime专职 parttime兼职'
  },
  vehicle_type: {
    type: DataTypes.ENUM('foot', 'bike', 'electric', 'motorcycle', 'car'),
    defaultValue: 'electric',
    comment: '出行方式 foot步行 bike自行车 electric电动车 motorcycle摩托车 car汽车'
  },
  vehicle_no: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: '车辆牌号'
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
  person_level: {
    type: DataTypes.ENUM('normal', 'silver', 'gold'),
    defaultValue: 'normal',
    comment: '配送员等级 normal普通 silver银牌 gold金牌'
  },
  rating: {
    type: DataTypes.DECIMAL(3, 2),
    defaultValue: 5.0,
    comment: '评分'
  },
  total_orders: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '总配送单数'
  },
  total_income: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0,
    comment: '总收入'
  },
  this_month_orders: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '本月配送单数'
  },
  this_month_income: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0,
    comment: '本月收入'
  },
  today_orders: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '今日配送单数'
  },
  today_income: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0,
    comment: '今日收入'
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
  audit_remark: {
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
  good_rating_rate: {
    type: DataTypes.DECIMAL(5, 4),
    defaultValue: 0,
    comment: '好评率'
  },
  on_time_rate: {
    type: DataTypes.DECIMAL(5, 4),
    defaultValue: 0,
    comment: '准时率'
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
  tableName: 'delivery_persons',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    { fields: ['user_id'] },
    { fields: ['person_no'] },
    { fields: ['online_status'] },
    { fields: ['order_status'] },
    { fields: ['person_level'] }
  ]
})

module.exports = DeliveryPerson