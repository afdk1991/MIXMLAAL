// 数据库分库分表配置

// 分库分表策略
const shardingConfig = {
  // 订单表分表策略
  order: {
    // 分表字段
    shardKey: 'userId',
    // 分表数量
    shardCount: 4,
    // 分表函数
    getShardIndex: (userId) => {
      return userId % 4;
    },
    // 生成表名
    getTableName: (userId) => {
      const index = userId % 4;
      return `orders_${index}`;
    }
  },
  // 用户表分表策略
  user: {
    shardKey: 'id',
    shardCount: 2,
    getShardIndex: (id) => {
      return id % 2;
    },
    getTableName: (id) => {
      const index = id % 2;
      return `users_${index}`;
    }
  },
  // 支付表分表策略
  payment: {
    shardKey: 'orderId',
    shardCount: 4,
    getShardIndex: (orderId) => {
      return orderId % 4;
    },
    getTableName: (orderId) => {
      const index = orderId % 4;
      return `payments_${index}`;
    }
  }
};

// 获取分表名
const getTableName = (table, shardValue) => {
  if (shardingConfig[table]) {
    return shardingConfig[table].getTableName(shardValue);
  }
  return table;
};

// 获取分库索引
const getShardIndex = (table, shardValue) => {
  if (shardingConfig[table]) {
    return shardingConfig[table].getShardIndex(shardValue);
  }
  return 0;
};

module.exports = {
  shardingConfig,
  getTableName,
  getShardIndex
};