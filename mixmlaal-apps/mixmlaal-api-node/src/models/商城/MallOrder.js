const { DataTypes } = require('sequelize')
const { sequelize } = require('../../config/database')

const MallOrder = sequelize.define('MallOrder', {
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
  shop_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    comment: '店铺ID'
  },
  order_type: {
    type: DataTypes.ENUM('ordinary', 'flash', 'preorder', 'group'),
    defaultValue: 'ordinary',
    comment: '订单类型 ordinary普通 flash秒杀 preorder预售 group团购'
  },
  group_id: {
    type: DataTypes.BIGINT,
    allowNull: true,
    comment: '团购ID'
  },
  status: {
    type: DataTypes.ENUM('pending', 'paid', 'shipped', 'delivered', 'completed', 'cancelled', 'refunded', 'refunding'),
    defaultValue: 'pending',
    comment: '订单状态 pending待支付 paid已支付 shipped已发货 delivered已收货 completed已完成 cancelled已取消 refunded已退款 refunding退款中'
  },
  payment_status: {
    type: DataTypes.ENUM('unpaid', 'paid', 'refunded', 'partial_refunded'),
    defaultValue: 'unpaid',
    comment: '支付状态'
  },
  payment_method: {
    type: DataTypes.ENUM('wechat', 'alipay', 'balance', 'enterprise', 'points'),
    allowNull: true,
    comment: '支付方式'
  },
  payment_time: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '支付时间'
  },
  total_quantity: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '商品总数量'
  },
  total_amount: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0,
    comment: '商品总金额'
  },
  freight_amount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    comment: '运费'
  },
  packaging_amount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    comment: '包装费'
  },
  discount_amount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    comment: '优惠金额'
  },
  coupon_amount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    comment: '优惠券金额'
  },
  points_amount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    comment: '积分抵扣金额'
  },
  shop_discount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    comment: '店铺优惠'
  },
  platform_discount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    comment: '平台优惠'
  },
  actual_amount: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0,
    comment: '实付金额'
  },
  cost_amount: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0,
    comment: '成本金额'
  },
  profit_amount: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0,
    comment: '利润金额'
  },
  commission_amount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    comment: '佣金金额'
  },
  delivery_type: {
    type: DataTypes.ENUM('pickup', 'delivery', 'express'),
    defaultValue: 'delivery',
    comment: '配送方式 pickup自提 delivery送货上门 express快递'
  },
  delivery_address: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: '收货地址 {contact_name, contact_phone, province, city, district, address, lat, lng}'
  },
  pickup_address: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: '自提地址 {contact_name, contact_phone, address}'
  },
  estimated_delivery_time: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '预计发货时间'
  },
  actual_delivery_time: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '实际发货时间'
  },
  received_time: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '收货时间'
  },
  complete_time: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '完成时间'
  },
  express_company: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: '快递公司'
  },
  express_no: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: '快递单号'
  },
  remark: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '订单备注'
  },
  user_rating: {
    type: DataTypes.DECIMAL(2, 1),
    allowNull: true,
    comment: '用户评分'
  },
  user_comment: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '用户评价'
  },
  is_rated: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: '是否已评价'
  },
  rating_time: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '评价时间'
  },
  is_invoice: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: '是否开发票'
  },
  invoice_type: {
    type: DataTypes.ENUM('normal', 'vat'),
    allowNull: true,
    comment: '发票类型 normal普通发票 vat增值税专用发票'
  },
  invoice_title: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: '发票抬头'
  },
  invoice_tax_no: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: '发票税号'
  },
  invoice_content: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: '发票内容'
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
  cancel_user_id: {
    type: DataTypes.BIGINT,
    allowNull: true,
    comment: '取消操作人ID'
  },
  refund_reason: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '退款原因'
  },
  refund_amount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: true,
    comment: '退款金额'
  },
  refund_time: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '退款时间'
  },
  refund_remark: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '退款备注'
  },
  source: {
    type: DataTypes.ENUM('h5', 'app', 'miniapp', 'pc'),
    defaultValue: 'h5',
    comment: '订单来源'
  },
  share_user_id: {
    type: DataTypes.BIGINT,
    allowNull: true,
    comment: '分享用户ID'
  },
  promotion_id: {
    type: DataTypes.BIGINT,
    allowNull: true,
    comment: '推广活动ID'
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
  tableName: 'mall_orders',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    { fields: ['order_no'] },
    { fields: ['user_id'] },
    { fields: ['shop_id'] },
    { fields: ['status'] },
    { fields: ['payment_status'] },
    { fields: ['created_at'] }
  ]
})

module.exports = MallOrder