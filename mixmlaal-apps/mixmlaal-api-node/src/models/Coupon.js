/**
 * 优惠券模型
 * 版本: v1.0.0.0
 */

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Coupon = sequelize.define('Coupon', {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    coupon_id: {
      type: DataTypes.STRING(32),
      allowNull: false,
      unique: true,
      comment: '优惠券唯一标识',
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: '优惠券名称',
    },
    type: {
      type: DataTypes.TINYINT,
      allowNull: false,
      comment: '类型: 1-满减券, 2-折扣券',
    },
    value: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: '优惠金额或折扣',
    },
    min_amount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
      comment: '最低使用金额',
    },
    start_time: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: '开始时间',
    },
    end_time: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: '结束时间',
    },
    status: {
      type: DataTypes.TINYINT,
      defaultValue: 1,
      comment: '状态: 0-无效, 1-有效',
    },
  }, {
    tableName: 'coupons',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      { fields: ['status'] },
      { fields: ['start_time', 'end_time'] },
    ],
  });

  Coupon.associate = (models) => {
    Coupon.hasMany(models.UserCoupon, { foreignKey: 'coupon_id', sourceKey: 'coupon_id' });
  };

  return Coupon;
};