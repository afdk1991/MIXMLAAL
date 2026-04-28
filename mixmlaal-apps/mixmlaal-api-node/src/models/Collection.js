/**
 * 收藏模型
 * 版本: v1.0.0.0
 */

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Collection = sequelize.define('Collection', {
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
    target_id: {
      type: DataTypes.STRING(32),
      allowNull: false,
      comment: '收藏目标ID',
    },
    target_type: {
      type: DataTypes.STRING(20),
      allowNull: false,
      comment: '目标类型: product, shop, post',
    },
  }, {
    tableName: 'collections',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      { fields: ['user_id'] },
      { fields: ['target_id', 'target_type'] },
    ],
  });

  Collection.associate = (models) => {
    Collection.belongsTo(models.User, { foreignKey: 'user_id', targetKey: 'user_id' });
  };

  return Collection;
};