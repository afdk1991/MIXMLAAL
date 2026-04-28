const { DataTypes } = require('sequelize')
const { sequelize } = require('../../config/database')

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  product_no: {
    type: DataTypes.STRING(32),
    allowNull: false,
    unique: true,
    comment: '商品编号'
  },
  shop_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    comment: '店铺ID'
  },
  category_id: {
    type: DataTypes.BIGINT,
    allowNull: true,
    comment: '分类ID'
  },
  product_name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: '商品名称'
  },
  product_image: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: '商品图片'
  },
  product_images: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: '商品图片列表'
  },
  product_type: {
    type: DataTypes.ENUM('standard', 'variants', 'package'),
    defaultValue: 'standard',
    comment: '商品类型 standard标准商品 variants多规格 package套餐'
  },
  category_path: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: '分类路径'
  },
  brand: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: '品牌'
  },
  unit: {
    type: DataTypes.STRING(20),
    defaultValue: '件',
    comment: '单位'
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: '售价'
  },
  original_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    comment: '原价'
  },
  cost: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    comment: '成本'
  },
  profit: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    comment: '利润'
  },
  stock: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '库存'
  },
  stock_warning: {
    type: DataTypes.INTEGER,
    defaultValue: 10,
    comment: '库存预警值'
  },
  sales: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '销量'
  },
  month_sales: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '月销量'
  },
  weight: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    comment: '重量(kg)'
  },
  volume: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    comment: '体积(m³)'
  },
  barcode: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: '条形码'
  },
  qrcode: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: '二维码'
  },
  specifications: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: '规格信息 [{name, value, price, stock}]'
  },
  attributes: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: '属性信息 [{name, value}]'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '商品描述'
  },
  details: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '商品详情'
  },
  images: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: '详情图片'
  },
  tags: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: '标签'
  },
  is_on_sale: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: '是否上架'
  },
  is_recommend: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: '是否推荐'
  },
  is_new: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: '是否新品'
  },
  is_hot: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: '是否热销'
  },
  is_free_shipping: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: '是否包邮'
  },
  min_order_quantity: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    comment: '最小购买数量'
  },
  max_order_quantity: {
    type: DataTypes.INTEGER,
    defaultValue: 99,
    comment: '最大购买数量'
  },
  rating: {
    type: DataTypes.DECIMAL(3, 2),
    defaultValue: 5.0,
    comment: '评分'
  },
  review_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '评价数'
  },
  view_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '浏览数'
  },
  favorite_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '收藏数'
  },
  share_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '分享数'
  },
  sort: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '排序'
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected', 'active', 'inactive', 'deleted'),
    defaultValue: 'pending',
    comment: '状态 pending待审核 approved已通过 rejected已拒绝 active上架 inactive下架 deleted删除'
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
  shelf_time: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '上架时间'
  },
  off_shelf_time: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '下架时间'
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
  tableName: 'products',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    { fields: ['product_no'] },
    { fields: ['shop_id'] },
    { fields: ['category_id'] },
    { fields: ['is_on_sale'] },
    { fields: ['is_recommend'] },
    { fields: ['is_hot'] },
    { fields: ['status'] },
    { fields: ['created_at'] }
  ]
})

module.exports = Product