const sequelize = require('../config/db');
require('../models');

async function syncDatabase() {
  try {
    console.log('开始同步数据库表结构...');
    
    await sequelize.sync({
      alter: true
    });
    
    console.log('数据库表结构同步完成');
  } catch (error) {
    console.error('同步数据库表结构失败:', error);
  } finally {
    await sequelize.close();
  }
}

if (require.main === module) {
  syncDatabase();
}

module.exports = syncDatabase;