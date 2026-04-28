/**
 * 用户钱包模型
 * 版本: v1.0.0.0
 */

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const UserWallet = sequelize.define('UserWallet', {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.STRING(32),
      allowNull: false,
      unique: true,
      comment: '用户ID',
    },
    balance: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00,
      comment: '余额',
    },
    frozen_amount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00,
      comment: '冻结金额',
    },
    total_recharge: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00,
      comment: '累计充值',
    },
    total_consume: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00,
      comment: '累计消费',
    },
  }, {
    tableName: 'user_wallets',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      { fields: ['user_id'] },
    ],
  });

  UserWallet.associate = (models) => {
    UserWallet.belongsTo(models.User, { foreignKey: 'user_id', targetKey: 'user_id' });
    UserWallet.hasMany(models.WalletTransaction, { foreignKey: 'user_id', sourceKey: 'user_id' });
  };

  return UserWallet;
};