const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

// 车辆模型
const Vehicle = sequelize.define('Vehicle', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  license_plate: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true
  },
  brand: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  model: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  vehicle_type: {
    type: DataTypes.ENUM('fuel', 'electric'),
    allowNull: false
  },
  volume: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  weight_capacity: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  height: {
    type: DataTypes.FLOAT
  },
  length: {
    type: DataTypes.FLOAT
  },
  width: {
    type: DataTypes.FLOAT
  },
  can_enter_garage: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  warehouse_id: {
    type: DataTypes.INTEGER
  },
  status: {
    type: DataTypes.ENUM('available', 'maintenance', 'in_use'),
    defaultValue: 'available'
  },
  maintenance_date: {
    type: DataTypes.DATE
  },
  inspection_date: {
    type: DataTypes.DATE
  },
  insurance_date: {
    type: DataTypes.DATE
  }
}, {
  tableName: 'vehicle',
  timestamps: true
});

// 前置仓模型
const Warehouse = sequelize.define('Warehouse', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  address: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  contact_name: {
    type: DataTypes.STRING(50)
  },
  contact_phone: {
    type: DataTypes.STRING(20)
  },
  longitude: {
    type: DataTypes.FLOAT
  },
  latitude: {
    type: DataTypes.FLOAT
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive'),
    defaultValue: 'active'
  }
}, {
  tableName: 'warehouse',
  timestamps: true
});

// 订单主模型
const OrderMain = sequelize.define('OrderMain', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  order_no: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  warehouse_id: {
    type: DataTypes.INTEGER
  },
  customer_name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  customer_phone: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  customer_address: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  longitude: {
    type: DataTypes.FLOAT
  },
  latitude: {
    type: DataTypes.FLOAT
  },
  total_amount: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  order_type: {
    type: DataTypes.ENUM('normal', 'express', 'fresh'),
    defaultValue: 'normal'
  },
  status: {
    type: DataTypes.ENUM('pending', 'processing', 'delivered', 'cancelled'),
    defaultValue: 'pending'
  },
  delivery_time: {
    type: DataTypes.DATE
  }
}, {
  tableName: 'order_main',
  timestamps: true
});

// 订单商品模型
const OrderItem = sequelize.define('OrderItem', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  order_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  product_name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  unit_price: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  total_price: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  weight: {
    type: DataTypes.FLOAT
  },
  volume: {
    type: DataTypes.FLOAT
  }
}, {
  tableName: 'order_item',
  timestamps: true
});

// 发车任务模型
const Task = sequelize.define('Task', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  task_no: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  warehouse_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  vehicle_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  driver_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'in_transit', 'completed', 'cancelled'),
    defaultValue: 'pending'
  },
  estimated_distance: {
    type: DataTypes.FLOAT
  },
  estimated_duration: {
    type: DataTypes.INTEGER
  },
  actual_distance: {
    type: DataTypes.FLOAT
  },
  actual_duration: {
    type: DataTypes.INTEGER
  },
  start_time: {
    type: DataTypes.DATE
  },
  end_time: {
    type: DataTypes.DATE
  }
}, {
  tableName: 'task',
  timestamps: true
});

// 任务点位模型
const TaskPoint = sequelize.define('TaskPoint', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  task_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  order_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  sequence: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'delivering', 'completed', 'failed'),
    defaultValue: 'pending'
  },
  estimated_arrival_time: {
    type: DataTypes.DATE
  },
  actual_arrival_time: {
    type: DataTypes.DATE
  },
  actual_departure_time: {
    type: DataTypes.DATE
  }
}, {
  tableName: 'task_point',
  timestamps: true
});

// 签收记录模型
const SignRecord = sequelize.define('SignRecord', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  task_point_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  order_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  driver_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  sign_type: {
    type: DataTypes.ENUM('handwritten', 'photo', 'digital'),
    allowNull: false
  },
  sign_content: {
    type: DataTypes.STRING(255)
  },
  sign_time: {
    type: DataTypes.DATE,
    allowNull: false
  },
  exception_type: {
    type: DataTypes.ENUM('none', 'rejection', 'no_one', 'address_error', 'other')
  },
  exception_note: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'sign_record',
  timestamps: true
});

// 行驶轨迹模型
const Track = sequelize.define('Track', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  task_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  vehicle_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  driver_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  longitude: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  latitude: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  speed: {
    type: DataTypes.FLOAT
  },
  direction: {
    type: DataTypes.FLOAT
  },
  timestamp: {
    type: DataTypes.DATE,
    allowNull: false
  }
}, {
  tableName: 'track',
  timestamps: true
});

// 车辆成本模型
const VehicleCost = sequelize.define('VehicleCost', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  vehicle_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  cost_type: {
    type: DataTypes.ENUM('fuel', 'maintenance', 'insurance', 'fine', 'other'),
    allowNull: false
  },
  amount: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'vehicle_cost',
  timestamps: true
});

// 司机薪资模型
const DriverSalary = sequelize.define('DriverSalary', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  driver_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  period_start: {
    type: DataTypes.DATE,
    allowNull: false
  },
  period_end: {
    type: DataTypes.DATE,
    allowNull: false
  },
  base_salary: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  },
  delivery_fee: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  },
  mileage_fee: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  },
  bonus: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  },
  deduction: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  },
  total_salary: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  },
  status: {
    type: DataTypes.ENUM('pending', 'calculated', 'paid'),
    defaultValue: 'pending'
  }
}, {
  tableName: 'driver_salary',
  timestamps: true
});

// 关联关系
Vehicle.belongsTo(Warehouse, { foreignKey: 'warehouse_id' });
Warehouse.hasMany(Vehicle, { foreignKey: 'warehouse_id' });

OrderMain.belongsTo(Warehouse, { foreignKey: 'warehouse_id' });
Warehouse.hasMany(OrderMain, { foreignKey: 'warehouse_id' });

OrderItem.belongsTo(OrderMain, { foreignKey: 'order_id' });
OrderMain.hasMany(OrderItem, { foreignKey: 'order_id' });

Task.belongsTo(Warehouse, { foreignKey: 'warehouse_id' });
Task.belongsTo(Vehicle, { foreignKey: 'vehicle_id' });
Task.belongsTo(require('./User'), { foreignKey: 'driver_id' });

TaskPoint.belongsTo(Task, { foreignKey: 'task_id' });
TaskPoint.belongsTo(OrderMain, { foreignKey: 'order_id' });
Task.hasMany(TaskPoint, { foreignKey: 'task_id' });

SignRecord.belongsTo(TaskPoint, { foreignKey: 'task_point_id' });
SignRecord.belongsTo(OrderMain, { foreignKey: 'order_id' });
SignRecord.belongsTo(require('./User'), { foreignKey: 'driver_id' });

Track.belongsTo(Task, { foreignKey: 'task_id' });
Track.belongsTo(Vehicle, { foreignKey: 'vehicle_id' });
Track.belongsTo(require('./User'), { foreignKey: 'driver_id' });

VehicleCost.belongsTo(Vehicle, { foreignKey: 'vehicle_id' });
Vehicle.hasMany(VehicleCost, { foreignKey: 'vehicle_id' });

DriverSalary.belongsTo(require('./User'), { foreignKey: 'driver_id' });

module.exports = {
  Vehicle,
  Warehouse,
  OrderMain,
  OrderItem,
  Task,
  TaskPoint,
  SignRecord,
  Track,
  VehicleCost,
  DriverSalary
};