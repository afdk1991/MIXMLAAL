/**
 * MIXMLAAL API Server
 * 版本: v1.0.0.0
 * 说明: 后端API服务入口
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

// 加载环境变量
require('dotenv').config();

// 导入监控和日志中间件
const { httpLogger, errorLogger, businessLogger } = require('./utils/logger');
const { performanceMonitor, errorMonitor, traceMiddleware, startMetricsReporter } = require('./utils/monitor');
const cacheService = require('./utils/cache');

// 创建Express应用
const app = express();
const PORT = process.env.PORT || 3001;

// 中间件配置
// 增强的安全头配置
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      fontSrc: ["'self'"],
      connectSrc: ["'self'"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      formAction: ["'self'"],
      baseUri: ["'self'"],
      blockAllMixedContent: [],
      upgradeInsecureRequests: [],
    },
  },
  referrerPolicy: {
    policy: 'strict-origin-when-cross-origin',
  },
  permissionsPolicy: {
    features: {
      fullscreen: ["'self'"],
      vibrate: ["'none'"],
      payment: ["'self'"],
      syncXhr: ["'none'"],
      camera: ["'none'"],
      microphone: ["'none'"],
      geolocation: ["'none'"],
      midi: ["'none'"],
      notifications: ["'none'"],
      push: ["'none'"],
      speaker: ["'none'"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
  xssFilter: true,
  frameguard: {
    action: 'deny',
  },
  noSniff: true,
  dnsPrefetchControl: {
    allow: false,
  },
  hidePoweredBy: true,
}));

// 跨域配置
const allowedOrigins = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['http://localhost:8080', 'http://localhost:8082', 'http://localhost:3000', 'http://localhost:3002'];
app.use(cors({
  origin: (origin, callback) => {
    // 生产环境必须明确白名单，禁止 null 或未配置的 origin
    if (process.env.NODE_ENV === 'production') {
      if (!origin || !allowedOrigins.includes(origin)) {
        return callback(new Error('Not allowed by CORS'));
      }
    } else {
      // 开发环境允许 localhost 或无 origin（如 Postman）
      if (origin && !allowedOrigins.includes(origin)) {
        return callback(new Error('Not allowed by CORS'));
      }
    }
    callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Trace-Id'],
  credentials: true,
  maxAge: 86400,
}));

// 日志配置
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(httpLogger); // HTTP请求日志

// JSON解析
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 监控中间件
app.use(traceMiddleware); // 链路追踪
app.use(performanceMonitor); // 性能监控

// 强制HTTPS（生产环境）
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.headers['x-forwarded-proto'] !== 'https') {
      return res.redirect(`https://${req.hostname}${req.url}`);
    }
    next();
  });
}

// HSTS配置
app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  next();
});

// 静态文件服务
const path = require('path');
// 生产环境服务dist目录，开发环境服务public目录
const staticPath = process.env.NODE_ENV === 'production'
  ? path.join(__dirname, '../../../dist')
  : path.join(__dirname, '../../../public');
app.use(express.static(staticPath));

// 添加src目录静态文件服务（用于开发环境访问页面）
const srcPath = path.join(__dirname, '../../');
app.use('/src', express.static(srcPath));

// 添加assets目录静态文件服务
const assetsPath = path.join(__dirname, '../../../assets');
app.use('/assets', express.static(assetsPath));

// 限流配置
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100, // 每IP最多100请求
  message: {
    status: 'error',
    code: 'RATE_LIMIT_EXCEEDED',
    message: '请求过于频繁，请稍后再试',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    status: 'error',
    code: 'STRICT_RATE_LIMIT_EXCEEDED',
    message: '该接口请求次数已达上限，请15分钟后再试',
  },
});

const loginLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  skipSuccessfulRequests: true,
  message: {
    status: 'error',
    code: 'LOGIN_RATE_LIMIT_EXCEEDED',
    message: '登录失败次数过多，请1小时后再试',
  },
});

app.use('/api/', generalLimiter);

// 路由导入
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const orderRoutes = require('./routes/order');
const paymentRoutes = require('./routes/payment');
const shopRoutes = require('./routes/shop');
const rideRoutes = require('./routes/ride');
const foodRoutes = require('./routes/food');
const errandRoutes = require('./routes/errand');
const mapRoutes = require('./routes/map');

// API路由注册
app.use('/api/v1/auth', loginLimiter, authRoutes);
app.use('/api/v1/user', userRoutes);
app.use('/api/v1/order', orderRoutes);
app.use('/api/v1/payment', strictLimiter, paymentRoutes);
app.use('/api/v1/ride', rideRoutes);
app.use('/api/v1/food', foodRoutes);
app.use('/api/v1/errand', errandRoutes);
app.use('/api/v1/shop', shopRoutes);
app.use('/api/v1/map', mapRoutes);

// 健康检查
app.get('/api/v1/health', async (req, res) => {
  const healthcheck = {
    status: 'success',
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: process.env.npm_package_version || '1.0.0.0',
    },
  };

  try {
    // 检查数据库连接
    try {
      const db = require('./utils/database');
      const health = await db.healthCheck();
      healthcheck.data.database = health.status === 'healthy' ? 'connected' : 'disconnected';
      if (health.status !== 'healthy') {
        healthcheck.data.status = 'degraded';
      }
    } catch (error) {
      healthcheck.data.database = 'disconnected';
      healthcheck.data.status = 'degraded';
    }
  } catch (error) {
    healthcheck.data.status = 'degraded';
  }

  res.json(healthcheck);
});

// Prometheus 指标端点
app.get('/metrics', (req, res) => {
  try {
    const { collectPrometheusMetrics } = require('./utils/monitor');
    const metrics = collectPrometheusMetrics();
    res.set('Content-Type', 'text/plain');
    res.send(metrics);
  } catch (error) {
    console.error('Prometheus 指标生成失败:', error);
    res.status(500).send('Failed to generate metrics');
  }
});

// 告警历史端点
app.get('/api/v1/alerts', (req, res) => {
  try {
    const { getAlertHistory } = require('./utils/monitor');
    const limit = parseInt(req.query.limit, 10) || 50;
    const alerts = getAlertHistory(limit);
    res.json({
      status: 'success',
      data: alerts
    });
  } catch (error) {
    console.error('获取告警历史失败:', error);
    res.status(500).json({
      status: 'error',
      message: '获取告警历史失败'
    });
  }
});

// 404 处理
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: '接口不存在',
  });
});

// 错误监控中间件
app.use(errorMonitor);

// 错误处理中间件
app.use((err, req, res, _next) => {
  errorLogger(err, {
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
  });

  // 处理特定错误类型
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      status: 'error',
      code: 'VALIDATION_ERROR',
      message: err.message || '参数验证失败',
    });
  }

  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      status: 'error',
      code: 'UNAUTHORIZED',
      message: '未授权访问',
    });
  }

  if (err.name === 'ForbiddenError') {
    return res.status(403).json({
      status: 'error',
      code: 'FORBIDDEN',
      message: '禁止访问',
    });
  }

  if (err.code === 'RATE_LIMIT_EXCEEDED') {
    return res.status(429).json({
      status: 'error',
      code: 'RATE_LIMIT_EXCEEDED',
      message: err.message,
    });
  }

  // 默认错误响应
  const statusCode = err.statusCode || err.status || 500;
  res.status(statusCode).json({
    status: 'error',
    code: err.code || 'INTERNAL_ERROR',
    message: process.env.NODE_ENV === 'production'
      ? '服务器内部错误'
      : err.message || '服务器内部错误',
  });
});

// 启动服务（仅当直接运行时）
let server;
if (require.main === module) {
  const startApp = async () => {
    try {
      console.log('开始启动服务器...');

      // 初始化SQLite数据库
      const sqliteDB = require('./utils/database.sqlite');
      try {
        await sqliteDB.initDB();
        console.log('✅ SQLite数据库初始化成功');
      } catch (dbError) {
        console.warn('⚠️ 数据库初始化失败:', dbError.message);
      }

      // 初始化Redis缓存
      try {
        await cacheService.init();
        console.log('✅ Redis缓存初始化成功');
      } catch (cacheError) {
        console.warn('⚠️ Redis缓存初始化失败:', cacheError.message);
      }

      // 启动服务器
      console.log(`正在启动服务器，监听端口 ${PORT}...`);
      try {
        server = app.listen(PORT, '0.0.0.0', () => {
          console.log(`🚀 MIXMLAAL API Server running on port ${PORT}`);
          console.log(`📡 API地址: http://localhost:${PORT}/api/v1`);
          console.log(`📊 健康检查: http://localhost:${PORT}/api/v1/health`);
        });

        server.on('error', error => {
          console.error('服务器启动错误:', error);
          if (error.code === 'EADDRINUSE') {
            console.error(`端口 ${PORT} 已被占用`);
          }
        });

        server.on('listening', () => {
          console.log('服务器正在监听...');
        });
        console.log('服务器启动代码执行完成');
      } catch (error) {
        console.error('服务器启动过程中发生错误:', error);
        console.error('错误堆栈:', error.stack);
      }
    } catch (error) {
      console.error('服务器启动失败:', error);
      console.error('错误堆栈:', error.stack);
      console.trace('调用堆栈:');
    }
  };

  startApp().catch(err => {
    console.error('服务器启动失败:', err);
    console.error('错误堆栈:', err.stack);
    console.trace('调用堆栈:');
    // 即使出错也不退出进程，让nodemon可以继续监视文件变化
    console.warn('服务器启动遇到错误，但将继续运行以支持开发模式');
  });
}

// 导出app和启动服务器的方法
module.exports = {
  app,
  startServer: async () => {
    if (!server) {
      // 初始化数据库连接池
      const db = require('./utils/database');
      try {
        await db.initPools();
        console.log('数据库连接池初始化成功');
      } catch (error) {
        console.warn('数据库初始化失败，将在无数据库模式下运行:', error.message);
      }

      // 初始化Redis缓存
      try {
        await cacheService.init();
        console.log('Redis缓存初始化成功');
      } catch (cacheError) {
        console.warn('Redis缓存初始化失败:', cacheError.message);
      }

      server = app.listen(PORT, '0.0.0.0', () => {
        businessLogger('服务器启动', {
          port: PORT,
          url: `http://localhost:${PORT}/api/v1`,
        });
        console.log(`🚀 MIXMLAAL API Server running on port ${PORT}`);
        console.log(`📡 API地址: http://localhost:${PORT}/api/v1`);
        // 启动指标报告器
        startMetricsReporter();
        businessLogger('监控系统启动', {
          interval: '60秒',
        });
        console.log(`📊 监控系统已启动，指标每60秒上报一次`);
      });
    }
    return server;
  },
  closeServer: callback => {
    if (server) {
      server.close(callback);
    } else {
      callback();
    }
  },
};
