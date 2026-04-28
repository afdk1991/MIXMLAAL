// 检查模块导入
console.log('开始检查模块导入...');

try {
  console.log('1. 检查 express');
  require('express');
  console.log('✅ express 导入成功');
} catch (error) {
  console.error('❌ express 导入失败:', error.message);
}

try {
  console.log('2. 检查 cors');
  require('cors');
  console.log('✅ cors 导入成功');
} catch (error) {
  console.error('❌ cors 导入失败:', error.message);
}

try {
  console.log('3. 检查 helmet');
  require('helmet');
  console.log('✅ helmet 导入成功');
} catch (error) {
  console.error('❌ helmet 导入失败:', error.message);
}

try {
  console.log('4. 检查 morgan');
  require('morgan');
  console.log('✅ morgan 导入成功');
} catch (error) {
  console.error('❌ morgan 导入失败:', error.message);
}

try {
  console.log('5. 检查 express-rate-limit');
  require('express-rate-limit');
  console.log('✅ express-rate-limit 导入成功');
} catch (error) {
  console.error('❌ express-rate-limit 导入失败:', error.message);
}

try {
  console.log('6. 检查 express-session');
  require('express-session');
  console.log('✅ express-session 导入成功');
} catch (error) {
  console.error('❌ express-session 导入失败:', error.message);
}

try {
  console.log('7. 检查 passport');
  require('passport');
  console.log('✅ passport 导入成功');
} catch (error) {
  console.error('❌ passport 导入失败:', error.message);
}

try {
  console.log('8. 检查 dotenv');
  require('dotenv');
  console.log('✅ dotenv 导入成功');
} catch (error) {
  console.error('❌ dotenv 导入失败:', error.message);
}

try {
  console.log('9. 检查 swagger 配置');
  require('./src/config/swagger');
  console.log('✅ swagger 配置导入成功');
} catch (error) {
  console.error('❌ swagger 配置导入失败:', error.message);
}

try {
  console.log('10. 检查 config 模块');
  require('./src/utils/config');
  console.log('✅ config 模块导入成功');
} catch (error) {
  console.error('❌ config 模块导入失败:', error.message);
}

try {
  console.log('11. 检查 数据库模型');
  require('../models');
  console.log('✅ 数据库模型导入成功');
} catch (error) {
  console.error('❌ 数据库模型导入失败:', error.message);
}

try {
  console.log('12. 检查 logger 模块');
  require('./src/utils/logger');
  console.log('✅ logger 模块导入成功');
} catch (error) {
  console.error('❌ logger 模块导入失败:', error.message);
}

try {
  console.log('13. 检查 monitor 模块');
  require('./src/utils/monitor');
  console.log('✅ monitor 模块导入成功');
} catch (error) {
  console.error('❌ monitor 模块导入失败:', error.message);
}

try {
  console.log('14. 检查 cache 模块');
  require('./src/utils/cache');
  console.log('✅ cache 模块导入成功');
} catch (error) {
  console.error('❌ cache 模块导入失败:', error.message);
}

try {
  console.log('15. 检查 alerts 模块');
  require('./src/utils/alerts');
  console.log('✅ alerts 模块导入成功');
} catch (error) {
  console.error('❌ alerts 模块导入失败:', error.message);
}

try {
  console.log('16. 检查 路由模块');
  require('./src/routes/auth');
  require('./src/routes/user');
  require('./src/routes/order');
  require('./src/routes/payment');
  require('./src/routes/shop');
  require('./src/routes/ride');
  require('./src/routes/food');
  require('./src/routes/errand');
  require('./src/routes/map');
  require('./src/routes/role');
  require('./src/routes/permission');
  require('./src/routes/logistics');
  require('./src/routes/ai');
  console.log('✅ 路由模块导入成功');
} catch (error) {
  console.error('❌ 路由模块导入失败:', error.message);
}

console.log('模块检查完成');
