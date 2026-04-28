// 测试导入是否有问题
console.log('开始测试导入...');

try {
  const express = require('express');
  console.log('✅ express 导入成功');
} catch (error) {
  console.error('❌ express 导入失败:', error.message);
}

try {
  const cors = require('cors');
  console.log('✅ cors 导入成功');
} catch (error) {
  console.error('❌ cors 导入失败:', error.message);
}

try {
  const helmet = require('helmet');
  console.log('✅ helmet 导入成功');
} catch (error) {
  console.error('❌ helmet 导入失败:', error.message);
}

try {
  const morgan = require('morgan');
  console.log('✅ morgan 导入成功');
} catch (error) {
  console.error('❌ morgan 导入失败:', error.message);
}

try {
  const rateLimit = require('express-rate-limit');
  console.log('✅ express-rate-limit 导入成功');
} catch (error) {
  console.error('❌ express-rate-limit 导入失败:', error.message);
}

try {
  const session = require('express-session');
  console.log('✅ express-session 导入成功');
} catch (error) {
  console.error('❌ express-session 导入失败:', error.message);
}

try {
  const passport = require('passport');
  console.log('✅ passport 导入成功');
} catch (error) {
  console.error('❌ passport 导入失败:', error.message);
}

try {
  require('dotenv').config();
  console.log('✅ dotenv 导入成功');
} catch (error) {
  console.error('❌ dotenv 导入失败:', error.message);
}

try {
  const { swaggerUi, specs } = require('./src/config/swagger');
  console.log('✅ swagger 导入成功');
} catch (error) {
  console.error('❌ swagger 导入失败:', error.message);
}

try {
  const configCenter = require('./src/utils/config');
  console.log('✅ config 导入成功');
} catch (error) {
  console.error('❌ config 导入失败:', error.message);
}

try {
  const sequelizeDb = require('./models');
  console.log('✅ models 导入成功');
} catch (error) {
  console.error('❌ models 导入失败:', error.message);
}

try {
  const { httpLogger, errorLogger, businessLogger } = require('./src/utils/logger');
  console.log('✅ logger 导入成功');
} catch (error) {
  console.error('❌ logger 导入失败:', error.message);
}

try {
  const { performanceMonitor, errorMonitor, traceMiddleware, startMetricsReporter, getMetrics } = require('./src/utils/monitor');
  console.log('✅ monitor 导入成功');
} catch (error) {
  console.error('❌ monitor 导入失败:', error.message);
}

try {
  const cacheService = require('./src/utils/cache');
  console.log('✅ cache 导入成功');
} catch (error) {
  console.error('❌ cache 导入失败:', error.message);
}

try {
  const alertSystem = require('./src/utils/alerts');
  console.log('✅ alerts 导入成功');
} catch (error) {
  console.error('❌ alerts 导入失败:', error.message);
}

try {
  const authRoutes = require('./src/routes/auth');
  console.log('✅ auth routes 导入成功');
} catch (error) {
  console.error('❌ auth routes 导入失败:', error.message);
}

try {
  const userRoutes = require('./src/routes/user');
  console.log('✅ user routes 导入成功');
} catch (error) {
  console.error('❌ user routes 导入失败:', error.message);
}

try {
  const orderRoutes = require('./src/routes/order');
  console.log('✅ order routes 导入成功');
} catch (error) {
  console.error('❌ order routes 导入失败:', error.message);
}

try {
  const paymentRoutes = require('./src/routes/payment');
  console.log('✅ payment routes 导入成功');
} catch (error) {
  console.error('❌ payment routes 导入失败:', error.message);
}

try {
  const shopRoutes = require('./src/routes/shop');
  console.log('✅ shop routes 导入成功');
} catch (error) {
  console.error('❌ shop routes 导入失败:', error.message);
}

try {
  const rideRoutes = require('./src/routes/ride');
  console.log('✅ ride routes 导入成功');
} catch (error) {
  console.error('❌ ride routes 导入失败:', error.message);
}

try {
  const foodRoutes = require('./src/routes/food');
  console.log('✅ food routes 导入成功');
} catch (error) {
  console.error('❌ food routes 导入失败:', error.message);
}

try {
  const errandRoutes = require('./src/routes/errand');
  console.log('✅ errand routes 导入成功');
} catch (error) {
  console.error('❌ errand routes 导入失败:', error.message);
}

try {
  const mapRoutes = require('./src/routes/map');
  console.log('✅ map routes 导入成功');
} catch (error) {
  console.error('❌ map routes 导入失败:', error.message);
}

try {
  const roleRoutes = require('./src/routes/role');
  console.log('✅ role routes 导入成功');
} catch (error) {
  console.error('❌ role routes 导入失败:', error.message);
}

try {
  const permissionRoutes = require('./src/routes/permission');
  console.log('✅ permission routes 导入成功');
} catch (error) {
  console.error('❌ permission routes 导入失败:', error.message);
}

try {
  const logisticsRoutes = require('./src/routes/logistics');
  console.log('✅ logistics routes 导入成功');
} catch (error) {
  console.error('❌ logistics routes 导入失败:', error.message);
}

try {
  const aiRoutes = require('./src/routes/ai');
  console.log('✅ ai routes 导入成功');
} catch (error) {
  console.error('❌ ai routes 导入失败:', error.message);
}

console.log('导入测试完成');
