/**
 * 电商订单模型
 * 版本: v1.0.0.0
 */

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ShopOrder = sequelize.define('ShopOrder', {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    order_id: {
      type: DataTypes.STRING(32),
      allowNull: false,
      unique: true,
      comment: '订单唯一标识',
    },
    user_id: {
      type: DataTypes.STRING(32),
      allowNull: false,
      comment: '用户ID',
    },
    merchant_id: {
      type: DataTypes.STRING(32),
      allowNull: false,
      comment: '商家ID',
    },
    status: {
      type: DataTypes.TINYINT,
      defaultValue: 0,
      comment: '状态: 0-待支付, 1-待发货, 2-待收货, 3-已完成, 4-已取消',
    },
    total_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: '商品总金额',
    },
    delivery_fee: {
      type: DataTypes.DECIMAL(8, 2),
      defaultValue: 0.00,
      comment: '运费',
    },
    discount_amount: {
      type: DataTypes.DECIMAL(8, 2),
      defaultValue: 0.00,
      comment: '优惠金额',
    },
    actual_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: '实付金额',
    },
    receiver_name: {
      type: DataTypes.STRING(50),
      comment: '收货人',
    },
    receiver_phone: {
      type: DataTypes.STRING(20),
      comment: '收货电话',
    },
    receiver_address: {
      type: DataTypes.STRING(255),
      comment: '收货地址',
    },
    delivery_company: {
      type: DataTypes.STRING(50),
      comment: '快递公司',
    },
    delivery_no: {
      type: DataTypes.STRING(50),
      comment: '快递单号',
    },
    delivered_at: {
      type: DataTypes.DATE,
      comment: '发货时间',
    },
    received_at: {
      type: DataTypes.DATE,
      comment: '收货时间',
    },
    remark: {
      type: DataTypes.STRING(255),
      comment: '订单备注',
    },
  }, {
    tableName: 'shop_orders',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      { fields: ['user_id'] },
      { fields: ['merchant_id'] },
      { fields: ['status'] },
      { fields: ['created_at'] },
    ],
  });

  ShopOrder.associate = (models) => {
    ShopOrder.belongsTo(models.User, { foreignKey: 'user_id', targetKey: 'user_id' });
    ShopOrder.hasMany(models.OrderItem, { foreignKey: 'order_id', targetKey: 'order_id' });
  };

  return ShopOrder;
};