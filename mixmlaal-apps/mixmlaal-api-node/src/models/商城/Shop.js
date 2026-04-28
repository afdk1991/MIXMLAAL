const { DataTypes } = require('sequelize')
const { sequelize } = require('../../config/database')

const Shop = sequelize.define('Shop', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  merchant_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    comment: '商家ID'
  },
  shop_no: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true,
    comment: '店铺编号'
  },
  shop_name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: '店铺名称'
  },
  shop_logo: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: '店铺Logo'
  },
  shop_banner: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: '店铺横幅'
  },
  shop_type: {
    type: DataTypes.ENUM('fresh', 'supermarket', 'restaurant', 'snack', 'premade', 'specialty', 'service', 'other'),
    allowNull: false,
    comment: '店铺类型 fresh生鲜 supermarket商超 restaurant餐饮 snack小吃 premade预制菜 specialty特产 service便民服务 other其他'
  },
  contact_name: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: '联系人姓名'
  },
  contact_phone: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: '联系电话'
  },
  province: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: '省份'
  },
  city: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: '城市'
  },
  district: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: '区县'
  },
  address: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: '详细地址'
  },
  location: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: '经纬度 {lat, lng}'
  },
  business_hours: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: '营业时间'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '店铺描述'
  },
  service_fee: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0,
    comment: '服务费'
  },
  commission_rate: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 10,
    comment: '抽成比例(%)'
  },
  min_order_amount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    comment: '最小订单金额'
  },
  delivery_fee: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    comment: '配送费'
  },
  free_delivery_threshold: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    comment: '免配送费门槛'
  },
  avg_delivery_time: {
    type: DataTypes.INTEGER,
    defaultValue: 30,
    comment: '平均配送时间(分钟)'
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
  total_sales: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0,
    comment: '总销售额'
  },
  month_orders: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '本月订单数'
  },
  month_sales: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0,
    comment: '本月销售额'
  },
  shop_level: {
    type: DataTypes.ENUM('normal', 'silver', 'gold', 'diamoand'),
    defaultValue: 'normal',
    comment: '店铺等级'
  },
  is_main: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: '是否总店'
  },
  parent_shop_id: {
    type: DataTypes.BIGINT,
    allowNull: true,
    comment: '总店ID'
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected', 'active', 'inactive', 'frozen'),
    defaultValue: 'pending',
    comment: '状态 pending待审核 approved已通过 rejected已拒绝 active营业中 inactive休息中 frozen已冻结'
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
  is_promotion: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: '是否推广'
  },
  sort: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '排序'
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
  tableName: 'shops',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    { fields: ['shop_no'] },
    { fields: ['merchant_id'] },
    { fields: ['shop_type'] },
    { fields: ['status'] },
    { fields: ['shop_level'] },
    { fields: ['created_at'] }
  ]
})

module.exports = Shop