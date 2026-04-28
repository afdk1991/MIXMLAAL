// 调试脚本
console.log('开始调试 server.js 文件...');

// 逐步加载模块
const modules = [
  { name: 'express', path: 'express' },
  { name: 'cors', path: 'cors' },
  { name: 'helmet', path: 'helmet' },
  { name: 'morgan', path: 'morgan' },
  { name: 'rateLimit', path: 'express-rate-limit' },
  { name: 'dotenv', path: 'dotenv' },
  { name: 'logger', path: './src/utils/logger' },
  { name: 'monitor', path: './src/utils/monitor' },
  { name: 'cacheService', path: './src/utils/cache' },
  { name: 'database', path: './src/utils/database' },
  { name: 'database.sqlite', path: './src/utils/database.sqlite' },
  { name: 'encryption', path: './src/utils/encryption' },
  { name: 'authRoutes', path: './src/routes/auth' },
  { name: 'userRoutes', path: './src/routes/user' },
  { name: 'orderRoutes', path: './src/routes/order' },
  { name: 'paymentRoutes', path: './src/routes/payment' },
  { name: 'shopRoutes', path: './src/routes/shop' },
  { name: 'rideRoutes', path: './src/routes/ride' },
  { name: 'foodRoutes', path: './src/routes/food' },
  { name: 'errandRoutes', path: './src/routes/errand' },
  { name: 'mapRoutes', path: './src/routes/map' },
];

async function loadModules() {
  for (const module of modules) {
    try {
      console.log(`正在加载 ${module.name} 模块...`);
      require(module.path);
      console.log(`✅ ${module.name} 模块加载成功`);
    } catch (error) {
      console.error(`❌ ${module.name} 模块加载失败:`, error.message);
      console.error('错误堆栈:', error.stack);
      return false;
    }
  }
  console.log('所有模块加载成功！');
  return true;
}

loadModules().then(success => {
  if (success) {
    console.log('调试完成，所有模块都能正常加载');
  } else {
    console.log('调试失败，存在模块加载问题');
  }
});
