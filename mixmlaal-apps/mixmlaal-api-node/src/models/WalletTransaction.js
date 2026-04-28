/**
 * 钱包流水模型
 * 版本: v1.0.0.0
 */

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const WalletTransaction = sequelize.define('WalletTransaction', {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    transaction_id: {
      type: DataTypes.STRING(32),
      allowNull: false,
      unique: true,
      comment: '流水号',
    },
    user_id: {
      type: DataTypes.STRING(32),
      allowNull: false,
      comment: '用户ID',
    },
    type: {
      type: DataTypes.TINYINT,
      allowNull: false,
      comment: '类型: 1-充值, 2-消费, 3-退款, 4-提现, 5-收入',
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: '金额',
    },
    balance_before: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: '变动前余额',
    },
    balance_after: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: '变动后余额',
    },
    related_id: {
      type: DataTypes.STRING(32),
      comment: '关联业务ID',
    },
    related_type: {
      type: DataTypes.STRING(20),
      comment: '关联业务类型',
    },
    remark: {
      type: DataTypes.STRING(255),
      comment: '备注',
    },
  }, {
    tableName: 'wallet_transactions',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      { fields: ['user_id'] },
      { fields: ['type'] },
      { fields: ['created_at'] },
    ],
  });

  WalletTransaction.associate = (models) => {
    WalletTransaction.belongsTo(models.UserWallet, { foreignKey: 'user_id', targetKey: 'user_id' });
  };

  return WalletTransaction;
};