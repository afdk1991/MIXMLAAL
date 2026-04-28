/**
 * 浏览历史模型
 * 版本: v1.0.0.0
 */

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const BrowseHistory = sequelize.define('BrowseHistory', {
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
      comment: '浏览目标ID',
    },
    target_type: {
      type: DataTypes.STRING(20),
      allowNull: false,
      comment: '目标类型: product, shop, post',
    },
    viewed_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      comment: '浏览时间',
    },
  }, {
    tableName: 'browse_history',
    timestamps: false,
    indexes: [
      { fields: ['user_id'] },
      { fields: ['target_id', 'target_type'] },
      { fields: ['viewed_at'] },
    ],
  });

  BrowseHistory.associate = (models) => {
    BrowseHistory.belongsTo(models.User, { foreignKey: 'user_id', targetKey: 'user_id' });
  };

  return BrowseHistory;
};