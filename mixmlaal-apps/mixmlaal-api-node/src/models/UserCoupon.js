/**
 * 用户优惠券模型
 * 版本: v1.0.0.0
 */

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const UserCoupon = sequelize.define('UserCoupon', {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.STRING(32),
      allowNull: false,
      comment: '用户ID',
    },
    coupon_id: {
      type: DataTypes.STRING(32),
      allowNull: false,
      comment: '优惠券ID',
    },
    status: {
      type: DataTypes.TINYINT,
      defaultValue: 1,
      comment: '状态: 1-未使用, 2-已使用, 3-已过期',
    },
    obtained_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      comment: '获取时间',
    },
    used_at: {
      type: DataTypes.DATE,
      comment: '使用时间',
    },
  }, {
    tableName: 'user_coupons',
    timestamps: false,
    indexes: [
      { fields: ['user_id'] },
      { fields: ['coupon_id'] },
      { fields: ['status'] },
    ],
  });

  UserCoupon.associate = (models) => {
    UserCoupon.belongsTo(models.User, { foreignKey: 'user_id', targetKey: 'user_id' });
    UserCoupon.belongsTo(models.Coupon, { foreignKey: 'coupon_id', targetKey: 'coupon_id' });
  };

  return UserCoupon;
};