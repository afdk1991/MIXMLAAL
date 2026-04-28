/**
 * 行程位置记录模型
 * 版本: v1.0.0.0
 */

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const RideLocation = sequelize.define('RideLocation', {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    order_id: {
      type: DataTypes.STRING(32),
      allowNull: false,
      comment: '订单ID',
    },
    driver_id: {
      type: DataTypes.STRING(32),
      allowNull: false,
      comment: '司机ID',
    },
    lng: {
      type: DataTypes.DECIMAL(10, 7),
      allowNull: false,
      comment: '经度',
    },
    lat: {
      type: DataTypes.DECIMAL(10, 7),
      allowNull: false,
      comment: '纬度',
    },
    accuracy: {
      type: DataTypes.FLOAT,
      comment: '精度(米)',
    },
    speed: {
      type: DataTypes.FLOAT,
      comment: '速度(m/s)',
    },
    direction: {
      type: DataTypes.FLOAT,
      comment: '方向(度)',
    },
  }, {
    tableName: 'ride_locations',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      { fields: ['order_id'] },
      { fields: ['driver_id'] },
      { fields: ['created_at'] },
    ],
  });

  RideLocation.associate = (models) => {
    RideLocation.belongsTo(models.RideOrder, { foreignKey: 'order_id', targetKey: 'order_id' });
    RideLocation.belongsTo(models.Driver, { foreignKey: 'driver_id', targetKey: 'driver_id' });
  };

  return RideLocation;
};