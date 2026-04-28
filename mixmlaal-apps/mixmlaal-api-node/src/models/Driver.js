/**
 * 司机模型
 * 版本: v1.0.0.0
 */

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Driver = sequelize.define('Driver', {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    driver_id: {
      type: DataTypes.STRING(32),
      allowNull: false,
      unique: true,
      comment: '司机唯一标识',
    },
    user_id: {
      type: DataTypes.STRING(32),
      allowNull: false,
      comment: '关联用户ID',
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
    total_trips: {
      type: DataTypes.INTEGER.UNSIGNED,
      defaultValue: 0,
      comment: '总接单数',
    },
    total_income: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00,
      comment: '总收入',
    },
    balance: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00,
      comment: '账户余额',
    },
    id_card_front: {
      type: DataTypes.STRING(255),
      comment: '身份证正面',
    },
    id_card_back: {
      type: DataTypes.STRING(255),
      comment: '身份证反面',
    },
    driver_license: {
      type: DataTypes.STRING(255),
      comment: '驾驶证',
    },
    vehicle_license: {
      type: DataTypes.STRING(255),
      comment: '行驶证',
    },
    audit_remark: {
      type: DataTypes.STRING(255),
      comment: '审核备注',
    },
  }, {
    tableName: 'drivers',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      { fields: ['user_id'] },
      { fields: ['status'] },
    ],
  });

  Driver.associate = (models) => {
    Driver.belongsTo(models.User, { foreignKey: 'user_id', targetKey: 'user_id' });
    Driver.hasMany(models.DriverVehicle, { foreignKey: 'driver_id', sourceKey: 'driver_id' });
    Driver.hasMany(models.RideOrder, { foreignKey: 'driver_id', sourceKey: 'driver_id' });
  };

  return Driver;
};