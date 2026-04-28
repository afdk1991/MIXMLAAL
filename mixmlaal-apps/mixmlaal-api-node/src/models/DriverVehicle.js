/**
 * 司机车辆模型
 * 版本: v1.0.0.0
 */

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const DriverVehicle = sequelize.define('DriverVehicle', {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    driver_id: {
      type: DataTypes.STRING(32),
      allowNull: false,
      comment: '司机ID',
    },
    vehicle_type: {
      type: DataTypes.TINYINT,
      defaultValue: 1,
      comment: '车型: 1-快车, 2-专车, 3-豪华车, 4-出租车',
    },
    brand: {
      type: DataTypes.STRING(50),
      comment: '品牌',
    },
    model: {
      type: DataTypes.STRING(50),
      comment: '型号',
    },
    color: {
      type: DataTypes.STRING(20),
      comment: '颜色',
    },
    plate_number: {
      type: DataTypes.STRING(20),
      allowNull: false,
      comment: '车牌号',
    },
    seat_count: {
      type: DataTypes.TINYINT,
      defaultValue: 4,
      comment: '座位数',
    },
    vehicle_images: {
      type: DataTypes.JSON,
      comment: '车辆照片',
    },
    is_active: {
      type: DataTypes.TINYINT,
      defaultValue: 1,
      comment: '是否启用: 0-否, 1-是',
    },
  }, {
    tableName: 'driver_vehicles',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      { fields: ['driver_id'] },
      { fields: ['plate_number'] },
    ],
  });

  DriverVehicle.associate = (models) => {
    DriverVehicle.belongsTo(models.Driver, { foreignKey: 'driver_id', targetKey: 'driver_id' });
  };

  return DriverVehicle;
};