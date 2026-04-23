const { DataTypes } = require('sequelize')
const { sequelize } = require('../../config/database')

const Cart = sequelize.define('Cart', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
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
  product_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    comment: '商品ID'
  },
  sku_id: {
    type: DataTypes.BIGINT,
    allowNull: true,
    comment: 'SKU ID'
  },
  quantity: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    comment: '数量'
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: '单价'
  },
  total_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: '小计'
  },
  specifications: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: '规格信息 {name: value}'
  },
  is_selected: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: '是否选中'
  },
  is_gift: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: '是否赠品'
  },
  gift_id: {
    type: DataTypes.BIGINT,
    allowNull: true,
    comment: '赠品ID'
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
  tableName: 'carts',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    { fields: ['user_id'] },
    { fields: ['shop_id'] },
    { fields: ['product_id'] },
    { fields: ['user_id', 'product_id'] }
  ]
})

module.exports = Cart