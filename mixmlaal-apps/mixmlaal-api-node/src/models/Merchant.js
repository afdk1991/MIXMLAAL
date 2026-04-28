/**
 * 商家模型
 * 版本: v1.0.0.0
 */

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Merchant = sequelize.define('Merchant', {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    merchant_id: {
      type: DataTypes.STRING(32),
      allowNull: false,
      unique: true,
      comment: '商家唯一标识',
    },
    user_id: {
      type: DataTypes.STRING(32),
      allowNull: false,
      comment: '关联用户ID',
    },
    merchant_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: '商家名称',
    },
    contact_name: {
      type: DataTypes.STRING(50),
      comment: '联系人姓名',
    },
    contact_phone: {
      type: DataTypes.STRING(20),
      comment: '联系人电话',
    },
    business_license: {
      type: DataTypes.STRING(255),
      comment: '营业执照',
    },
    status: {
      type: DataTypes.TINYINT,
      defaultValue: 0,
      comment: '状态: 0-待审核, 1-正常, 2-禁用, 3-注销',
    },
    rating: {
      type: DataTypes.DECIMAL(2, 1),
      defaultValue: 5.0,
      comment: '评分 1.0-5.0',
    },
    total_sales: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0.00,
      comment: '总销售额',
    },
    balance: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00,
      comment: '账户余额',
    },
    audit_remark: {
      type: DataTypes.STRING(255),
      comment: '审核备注',
    },
  }, {
    tableName: 'merchants',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      { fields: ['user_id'] },
      { fields: ['status'] },
    ],
  });

  Merchant.associate = (models) => {
    Merchant.belongsTo(models.User, { foreignKey: 'user_id', targetKey: 'user_id' });
    Merchant.hasMany(models.Shop, { foreignKey: 'merchant_id', sourceKey: 'merchant_id' });
    Merchant.hasMany(models.Product, { foreignKey: 'merchant_id', sourceKey: 'merchant_id' });
  };

  return Merchant;
};