/**
 * 退款记录模型
 * 版本: v1.0.0.0
 */

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Refund = sequelize.define('Refund', {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    refund_id: {
      type: DataTypes.STRING(32),
      allowNull: false,
      unique: true,
      comment: '退款单号',
    },
    payment_id: {
      type: DataTypes.STRING(32),
      allowNull: false,
      comment: '支付单号',
    },
    order_id: {
      type: DataTypes.STRING(32),
      allowNull: false,
      comment: '订单ID',
    },
    user_id: {
      type: DataTypes.STRING(32),
      allowNull: false,
      comment: '用户ID',
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: '退款金额',
    },
    reason: {
      type: DataTypes.STRING(255),
      comment: '退款原因',
    },
    status: {
      type: DataTypes.TINYINT,
      defaultValue: 0,
      comment: '状态: 0-处理中, 1-退款成功, 2-退款失败',
    },
    third_party_id: {
      type: DataTypes.STRING(64),
      comment: '第三方退款单号',
    },
    completed_at: {
      type: DataTypes.DATE,
      comment: '完成时间',
    },
  }, {
    tableName: 'refunds',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      { fields: ['payment_id'] },
      { fields: ['order_id'] },
      { fields: ['status'] },
    ],
  });

  Refund.associate = (models) => {
    Refund.belongsTo(models.Payment, { foreignKey: 'payment_id', targetKey: 'payment_id' });
    Refund.belongsTo(models.User, { foreignKey: 'user_id', targetKey: 'user_id' });
  };

  return Refund;
};