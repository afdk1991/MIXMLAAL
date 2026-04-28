/**
 * 通知模型
 * 版本: v1.0.0.0
 */

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Notification = sequelize.define('Notification', {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    notification_id: {
      type: DataTypes.STRING(32),
      allowNull: false,
      unique: true,
      comment: '通知唯一标识',
    },
    user_id: {
      type: DataTypes.STRING(32),
      allowNull: false,
      comment: '用户ID',
    },
    type: {
      type: DataTypes.STRING(20),
      allowNull: false,
      comment: '通知类型: system, order, payment, promotion',
    },
    title: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: '通知标题',
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: '通知内容',
    },
    data: {
      type: DataTypes.JSON,
      comment: '附加数据',
    },
    read: {
      type: DataTypes.TINYINT,
      defaultValue: 0,
      comment: '是否已读: 0-未读, 1-已读',
    },
  }, {
    tableName: 'notifications',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      { fields: ['user_id'] },
      { fields: ['type'] },
      { fields: ['read'] },
      { fields: ['created_at'] },
    ],
  });

  Notification.associate = (models) => {
    Notification.belongsTo(models.User, { foreignKey: 'user_id', targetKey: 'user_id' });
  };

  return Notification;
};