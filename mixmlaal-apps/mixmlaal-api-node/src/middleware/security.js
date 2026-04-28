/**
 * 安全中间件配置
 * 版本: v1.0.0.0
 * 说明: Helmet安全头、CORS、API限流等安全配置
 */

const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');

/**
 * Helmet安全头配置
 * 基于OWASP 2025安全规范
 */
const helmetConfig = {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://cdn.laal.top'],
      scriptSrc: ["'self'", 'https://cdn.laal.top'],
      imgSrc: ["'self'", 'data:', 'https://cdn.laal.top', 'https://img.laal.top'],
      connectSrc: ["'self'", 'https://api.laal.top', 'https://restapi.amap.com'],
      fontSrc: ["'self'", 'https://cdn.laal.top'],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  dnsPrefetchControl: { allow: false },
  frameguard: { action: 'deny' },
  hidePoweredBy: true,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
  ieNoOpen: true,
  noSniff: true,
  originAgentCluster: true,
  permittedCrossDomainPolicies: { permittedPolicies: 'none' },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  xssFilter: true,
};

/**
 * CORS配置
 */
const corsConfig = {
  origin: (origin, callback) => {
    const allowedOrigins = process.env.CORS_ORIGIN
      ? process.env.CORS_ORIGIN.split(',')
      : ['https://mixm.top', 'https://*.mixm.top', 'http://localhost:3000', 'http://localhost:3002', 'http://localhost:8082'];

    if (!origin || allowedOrigins.some(allowed => {
      if (allowed.includes('*')) {
        const regex = new RegExp(allowed.replace('*', '.*'));
        return regex.test(origin);
      }
      return allowed === origin;
    })) {
      callback(null, true);
    } else {
      callback(new Error('不允许的跨域请求'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  credentials: true,
  maxAge: 86400,
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

/**
 * 通用API限流配置
 */
const generalLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100,
  message: {
    status: 'error',
    code: 'RATE_LIMIT_EXCEEDED',
    message: '请求过于频繁，请稍后再试',
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      status: 'error',
      code: 'RATE_LIMIT_EXCEEDED',
      message: '请求过于频繁，请稍后再试',
      retryAfter: Math.ceil(req.rateLimit.resetTime / 1000),
    });
  },
});

/**
 * 严格限流配置（用于敏感接口）
 */
const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    status: 'error',
    code: 'STRICT_RATE_LIMIT_EXCEEDED',
    message: '该接口请求次数已达上限，请15分钟后再试',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * 登录接口限流配置
 */
const loginLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  skipSuccessfulRequests: true,
  message: {
    status: 'error',
    code: 'LOGIN_RATE_LIMIT_EXCEEDED',
    message: '登录失败次数过多，请1小时后再试',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * 短信验证码限流配置
 */
const smsLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 1,
  message: {
    status: 'error',
    code: 'SMS_RATE_LIMIT_EXCEEDED',
    message: '短信发送过于频繁，请1分钟后再试',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * IP黑名单中间件
 */
const ipBlacklist = new Set();

const ipBlacklistMiddleware = (req, res, next) => {
  const clientIp = req.ip || req.connection.remoteAddress;
  if (ipBlacklist.has(clientIp)) {
    return res.status(403).json({
      status: 'error',
      code: 'IP_BLOCKED',
      message: '您的IP已被封禁',
    });
  }
  next();
};

/**
 * 添加IP到黑名单
 */
const addToBlacklist = (ip, duration = 24 * 60 * 60 * 1000) => {
  ipBlacklist.add(ip);
  setTimeout(() => {
    ipBlacklist.delete(ip);
  }, duration);
};

/**
 * 请求大小限制中间件
 */
const requestSizeLimit = {
  json: express.json({ limit: '10mb' }),
  urlencoded: express.urlencoded({ extended: true, limit: '10mb' }),
};

module.exports = {
  helmetConfig,
  corsConfig,
  generalLimiter,
  strictLimiter,
  loginLimiter,
  smsLimiter,
  ipBlacklistMiddleware,
  addToBlacklist,
  requestSizeLimit,
  helmet: () => helmet(helmetConfig),
  cors: () => cors(corsConfig),
};
