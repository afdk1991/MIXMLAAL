/**
 * 订单商品明细模型
 * 版本: v1.0.0.0
 */

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const OrderItem = sequelize.define('OrderItem', {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    order_id: {
      type: DataTypes.STRING(32),
      allowNull: false,
      comment: '订单ID',
    },
    product_id: {
      type: DataTypes.STRING(32),
      allowNull: false,
      comment: '商品ID',
    },
    product_name: {
      type: DataTypes.STRING(200),
      comment: '商品名称',
    },
    product_image: {
      type: DataTypes.STRING(255),
      comment: '商品图片',
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: '单价',
    },
    quantity: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      comment: '数量',
    },
    total_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: '小计金额',
    },
  }, {
    tableName: 'order_items',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      { fields: ['order_id'] },
      { fields: ['product_id'] },
    ],
  });

  OrderItem.associate = (models) => {
    OrderItem.belongsTo(models.ShopOrder, { foreignKey: 'order_id', targetKey: 'order_id' });
    OrderItem.belongsTo(models.Product, { foreignKey: 'product_id', targetKey: 'product_id' });
  };

  return OrderItem;
};