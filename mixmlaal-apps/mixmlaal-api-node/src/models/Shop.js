/**
 * 店铺模型
 * 版本: v1.0.0.0
 */

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Shop = sequelize.define('Shop', {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    shop_id: {
      type: DataTypes.STRING(32),
      allowNull: false,
      unique: true,
      comment: '店铺唯一标识',
    },
    merchant_id: {
      type: DataTypes.STRING(32),
      allowNull: false,
      comment: '商家ID',
    },
    shop_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: '店铺名称',
    },
    description: {
      type: DataTypes.TEXT,
      comment: '店铺描述',
    },
    logo: {
      type: DataTypes.STRING(255),
      comment: '店铺logo',
    },
    cover_image: {
      type: DataTypes.STRING(255),
      comment: '店铺封面',
    },
    status: {
      type: DataTypes.TINYINT,
      defaultValue: 1,
      comment: '状态: 0-关闭, 1-正常',
    },
  }, {
    tableName: 'shops',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      { fields: ['merchant_id'] },
      { fields: ['status'] },
    ],
  });

  Shop.associate = (models) => {
    Shop.belongsTo(models.Merchant, { foreignKey: 'merchant_id', targetKey: 'merchant_id' });
  };

  return Shop;
};