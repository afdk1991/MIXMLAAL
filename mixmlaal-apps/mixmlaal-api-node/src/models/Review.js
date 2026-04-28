/**
 * 评价模型
 * 版本: v1.0.0.0
 */

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Review = sequelize.define('Review', {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    review_id: {
      type: DataTypes.STRING(32),
      allowNull: false,
      unique: true,
      comment: '评价唯一标识',
    },
    user_id: {
      type: DataTypes.STRING(32),
      allowNull: false,
      comment: '用户ID',
    },
    target_id: {
      type: DataTypes.STRING(32),
      allowNull: false,
      comment: '评价目标ID',
    },
    target_type: {
      type: DataTypes.STRING(20),
      allowNull: false,
      comment: '目标类型: product, driver, merchant',
    },
    rating: {
      type: DataTypes.TINYINT,
      allowNull: false,
      comment: '评分 1-5',
    },
    content: {
      type: DataTypes.TEXT,
      comment: '评价内容',
    },
    images: {
      type: DataTypes.JSON,
      comment: '评价图片',
    },
    status: {
      type: DataTypes.TINYINT,
      defaultValue: 1,
      comment: '状态: 0-删除, 1-正常',
    },
  }, {
    tableName: 'reviews',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      { fields: ['user_id'] },
      { fields: ['target_id', 'target_type'] },
      { fields: ['rating'] },
      { fields: ['status'] },
    ],
  });

  Review.associate = (models) => {
    Review.belongsTo(models.User, { foreignKey: 'user_id', targetKey: 'user_id' });
  };

  return Review;
};