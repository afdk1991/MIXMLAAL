const express = require('express');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const jwksRsa = require('jwks-rsa');
const passport = require('passport');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const forge = require('node-forge');
const uuid = require('uuid');
const Redis = require('redis');
const Consul = require('consul');
const mysql = require('mysql2/promise');
const { Kafka } = require('kafkajs');
const winston = require('winston');
const expressWinston = require('express-winston');
const dotenv = require('dotenv');
const axios = require('axios');
const Joi = require('joi');
const { body, validationResult } = require('express-validator');

// 加载环境变量
dotenv.config();

// 配置日志
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/security-service.log' }),
    new winston.transports.Console()
  ]
});

// 初始化Express应用
const app = express();
const PORT = process.env.SECURITY_SERVICE_PORT || 3020;

// 中间件
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());
app.use(cors());

// 速率限制
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100, // 每个IP限制100个请求
  message: {
    code: 429,
    message: '请求过于频繁，请稍后再试'
  }
});
app.use('/api', limiter);

// 日志中间件
app.use(expressWinston.logger({
  winstonInstance: logger,
  meta: true,
  msg: 'HTTP {{req.method}} {{req.url}} {{res.statusCode}} {{res.responseTime}}ms',
  expressFormat: true,
  colorize: false
}));

// 初始化Redis客户端
const redisClient = Redis.createClient({
  url: `redis://${process.env.REDIS_HOST || 'redis'}:${process.env.REDIS_PORT || 6379}`
});

// 初始化Consul客户端
const consul = new Consul({
  host: process.env.CONSUL_HOST || 'consul',
  port: process.env.CONSUL_PORT || 8500
});

// 初始化Kafka客户端
const kafka = new Kafka({
  clientId: 'security-service',
  brokers: [`${process.env.KAFKA_HOST || 'kafka'}:${process.env.KAFKA_PORT || 9092}`]
});

// 初始化数据库连接
let dbConnection;

// 数据库连接
async function connectDB() {
  try {
    dbConnection = await mysql.createConnection({
      host: process.env.MYSQL_HOST || 'mysql',
      port: process.env.MYSQL_PORT || 3306,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE
    });
    logger.info('Database connected successfully');
  } catch (error) {
    logger.error('Database connection error:', error);
    throw error;
  }
}

// 初始化表结构
async function initTables() {
  try {
    // 安全审计日志表
    await dbConnection.execute(`
      CREATE TABLE IF NOT EXISTS security_audit_logs (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        event_type VARCHAR(50) NOT NULL,
        user_id VARCHAR(36),
        resource VARCHAR(255),
        action VARCHAR(50),
        ip_address VARCHAR(50),
        user_agent VARCHAR(255),
        status VARCHAR(20),
        details TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 零信任访问控制表
    await dbConnection.execute(`
      CREATE TABLE IF NOT EXISTS zero_trust_policies (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        policy_name VARCHAR(100) NOT NULL,
        policy_type VARCHAR(50) NOT NULL,
        conditions TEXT NOT NULL,
        action VARCHAR(50) NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // 数据合规记录
    await dbConnection.execute(`
      CREATE TABLE IF NOT EXISTS data_compliance_records (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        data_type VARCHAR(50) NOT NULL,
        data_operation VARCHAR(50) NOT NULL,
        user_id VARCHAR(36),
        status VARCHAR(20),
        compliance_result VARCHAR(50),
        details TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // API密钥管理
    await dbConnection.execute(`
      CREATE TABLE IF NOT EXISTS api_keys (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        key_id VARCHAR(36) NOT NULL,
        key_hash VARCHAR(255) NOT NULL,
        user_id VARCHAR(36),
        permissions TEXT NOT NULL,
        expires_at DATETIME,
        is_revoked BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_used_at TIMESTAMP
      )
    `);

    logger.info('Tables initialized successfully');
  } catch (error) {
    logger.error('Table initialization error:', error);
    throw error;
  }
}

// 服务注册
async function registerService() {
  try {
    await consul.agent.service.register({
      name: 'security-service',
      id: `security-service-${uuid.v4()}`,
      address: 'security-service',
      port: PORT,
      tags: ['security', 'zero-trust', 'compliance'],
      check: {
        http: `http://security-service:${PORT}/health`,
        interval: '10s',
        timeout: '5s'
      }
    });
    logger.info('Service registered with Consul');
  } catch (error) {
    logger.error('Service registration error:', error);
  }
}

// 零信任架构实现
class ZeroTrustArchitecture {
  constructor() {
    this.policies = [];
  }

  // 加载策略
  async loadPolicies() {
    try {
      const [rows] = await dbConnection.execute(
        'SELECT * FROM zero_trust_policies WHERE is_active = ?',
        [true]
      );
      this.policies = rows;
      logger.info(`Loaded ${rows.length} zero trust policies`);
    } catch (error) {
      logger.error('Error loading zero trust policies:', error);
    }
  }

  // 评估访问请求
  async evaluateAccessRequest(request) {
    try {
      // 基本验证
      if (!request.user_id || !request.resource || !request.action) {
        return { allowed: false, reason: 'Missing required fields' };
      }

      // 检查IP地址
      const ipRisk = await this.checkIPRisk(request.ip_address);
      if (ipRisk.highRisk) {
        return { allowed: false, reason: 'High risk IP address' };
      }

      // 检查用户设备
      const deviceRisk = await this.checkDeviceRisk(request.user_agent);
      if (deviceRisk.highRisk) {
        return { allowed: false, reason: 'High risk device' };
      }

      // 检查用户行为
      const behaviorRisk = await this.checkUserBehavior(request.user_id);
      if (behaviorRisk.highRisk) {
        return { allowed: false, reason: 'Suspicious user behavior' };
      }

      // 应用零信任策略
      for (const policy of this.policies) {
        const conditions = JSON.parse(policy.conditions);
        if (this.matchesConditions(request, conditions)) {
          return { allowed: policy.action === 'allow', reason: `Policy ${policy.policy_name} applied` };
        }
      }

      // 默认拒绝
      return { allowed: false, reason: 'No matching policy found' };
    } catch (error) {
      logger.error('Error evaluating access request:', error);
      return { allowed: false, reason: 'Internal error' };
    }
  }

  // 检查IP风险
  async checkIPRisk(ipAddress) {
    try {
      // 这里可以集成外部IP风险评估服务
      // 简单实现：检查是否在黑名单中
      const blacklisted = await redisClient.get(`blacklisted_ip:${ipAddress}`);
      return { highRisk: !!blacklisted };
    } catch (error) {
      logger.error('Error checking IP risk:', error);
      return { highRisk: false };
    }
  }

  // 检查设备风险
  async checkDeviceRisk(userAgent) {
    try {
      // 简单实现：检查是否为已知的安全设备
      const deviceHash = crypto.createHash('md5').update(userAgent).digest('hex');
      const trusted = await redisClient.get(`trusted_device:${deviceHash}`);
      return { highRisk: !trusted };
    } catch (error) {
      logger.error('Error checking device risk:', error);
      return { highRisk: false };
    }
  }

  // 检查用户行为
  async checkUserBehavior(userId) {
    try {
      // 简单实现：检查用户最近的失败登录次数
      const failedAttempts = await redisClient.get(`failed_login:${userId}`);
      return { highRisk: failedAttempts && parseInt(failedAttempts) > 3 };
    } catch (error) {
      logger.error('Error checking user behavior:', error);
      return { highRisk: false };
    }
  }

  // 检查条件匹配
  matchesConditions(request, conditions) {
    // 简单实现：检查请求是否匹配条件
    for (const [key, value] of Object.entries(conditions)) {
      if (request[key] !== value) {
        return false;
      }
    }
    return true;
  }
}

// 数据合规实现
class DataCompliance {
  // 检查数据操作合规性
  async checkCompliance(dataType, operation, userId) {
    try {
      // 数据类型合规性检查
      const dataTypeRules = {
        'personal': ['read', 'update'],
        'financial': ['read', 'update'],
        'health': ['read', 'update'],
        'location': ['read', 'update']
      };

      if (!dataTypeRules[dataType] || !dataTypeRules[dataType].includes(operation)) {
        return {
          compliant: false,
          reason: 'Operation not allowed for this data type'
        };
      }

      // 记录合规检查
      await dbConnection.execute(
        'INSERT INTO data_compliance_records (data_type, data_operation, user_id, status, compliance_result, details) VALUES (?, ?, ?, ?, ?, ?)',
        [dataType, operation, userId, 'completed', 'compliant', JSON.stringify({ dataType, operation, userId })]
      );

      return { compliant: true, reason: 'Compliance check passed' };
    } catch (error) {
      logger.error('Error checking data compliance:', error);
      return { compliant: false, reason: 'Internal error' };
    }
  }

  // 生成合规报告
  async generateComplianceReport(startDate, endDate) {
    try {
      const [rows] = await dbConnection.execute(
        'SELECT * FROM data_compliance_records WHERE created_at BETWEEN ? AND ?',
        [startDate, endDate]
      );

      const report = {
        totalRecords: rows.length,
        compliantRecords: rows.filter(r => r.compliance_result === 'compliant').length,
        nonCompliantRecords: rows.filter(r => r.compliance_result !== 'compliant').length,
        records: rows
      };

      return report;
    } catch (error) {
      logger.error('Error generating compliance report:', error);
      throw error;
    }
  }
}

// 安全审计
class SecurityAudit {
  // 记录审计日志
  async logEvent(eventType, userId, resource, action, ipAddress, userAgent, status, details) {
    try {
      await dbConnection.execute(
        'INSERT INTO security_audit_logs (event_type, user_id, resource, action, ip_address, user_agent, status, details) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [eventType, userId, resource, action, ipAddress, userAgent, status, JSON.stringify(details)]
      );

      // 发送审计事件到Kafka
      const producer = kafka.producer();
      await producer.connect();
      await producer.send({
        topic: 'security-audit-events',
        messages: [{
          key: eventType,
          value: JSON.stringify({ eventType, userId, resource, action, ipAddress, userAgent, status, details, timestamp: new Date().toISOString() })
        }]
      });
      await producer.disconnect();
    } catch (error) {
      logger.error('Error logging security event:', error);
    }
  }

  // 查询审计日志
  async queryLogs(filters) {
    try {
      let query = 'SELECT * FROM security_audit_logs WHERE 1=1';
      const params = [];

      if (filters.eventType) {
        query += ' AND event_type = ?';
        params.push(filters.eventType);
      }

      if (filters.userId) {
        query += ' AND user_id = ?';
        params.push(filters.userId);
      }

      if (filters.startDate) {
        query += ' AND created_at >= ?';
        params.push(filters.startDate);
      }

      if (filters.endDate) {
        query += ' AND created_at <= ?';
        params.push(filters.endDate);
      }

      query += ' ORDER BY created_at DESC';

      const [rows] = await dbConnection.execute(query, params);
      return rows;
    } catch (error) {
      logger.error('Error querying security logs:', error);
      throw error;
    }
  }
}

// 初始化服务
async function initService() {
  try {
    await connectDB();
    await initTables();
    await registerService();
    await redisClient.connect();
    logger.info('Service initialized successfully');
  } catch (error) {
    logger.error('Service initialization error:', error);
    process.exit(1);
  }
}

// 初始化实例
const zeroTrust = new ZeroTrustArchitecture();
const dataCompliance = new DataCompliance();
const securityAudit = new SecurityAudit();

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'security-service' });
});

// 零信任访问控制
app.post('/api/v1/zero-trust/access', async (req, res) => {
  try {
    const { user_id, resource, action, ip_address, user_agent } = req.body;

    // 验证请求参数
    const schema = Joi.object({
      user_id: Joi.string().required(),
      resource: Joi.string().required(),
      action: Joi.string().required(),
      ip_address: Joi.string().ip().required(),
      user_agent: Joi.string().required()
    });

    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ code: 400, message: error.details[0].message });
    }

    // 评估访问请求
    const result = await zeroTrust.evaluateAccessRequest({
      user_id,
      resource,
      action,
      ip_address,
      user_agent
    });

    // 记录审计日志
    await securityAudit.logEvent(
      'access_control',
      user_id,
      resource,
      action,
      ip_address,
      user_agent,
      result.allowed ? 'success' : 'failure',
      { reason: result.reason }
    );

    res.json({ code: 200, data: result });
  } catch (error) {
    logger.error('Error in zero trust access control:', error);
    res.status(500).json({ code: 500, message: 'Internal server error' });
  }
});

// 数据合规检查
app.post('/api/v1/compliance/check', async (req, res) => {
  try {
    const { data_type, operation, user_id } = req.body;

    // 验证请求参数
    const schema = Joi.object({
      data_type: Joi.string().required(),
      operation: Joi.string().required(),
      user_id: Joi.string().required()
    });

    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ code: 400, message: error.details[0].message });
    }

    // 检查合规性
    const result = await dataCompliance.checkCompliance(data_type, operation, user_id);

    // 记录审计日志
    await securityAudit.logEvent(
      'data_compliance',
      user_id,
      data_type,
      operation,
      req.ip,
      req.headers['user-agent'],
      result.compliant ? 'success' : 'failure',
      { reason: result.reason }
    );

    res.json({ code: 200, data: result });
  } catch (error) {
    logger.error('Error in data compliance check:', error);
    res.status(500).json({ code: 500, message: 'Internal server error' });
  }
});

// 生成合规报告
app.get('/api/v1/compliance/report', async (req, res) => {
  try {
    const { start_date, end_date } = req.query;

    if (!start_date || !end_date) {
      return res.status(400).json({ code: 400, message: 'Missing start_date or end_date' });
    }

    // 生成报告
    const report = await dataCompliance.generateComplianceReport(start_date, end_date);

    res.json({ code: 200, data: report });
  } catch (error) {
    logger.error('Error generating compliance report:', error);
    res.status(500).json({ code: 500, message: 'Internal server error' });
  }
});

// 安全审计日志查询
app.get('/api/v1/audit/logs', async (req, res) => {
  try {
    const filters = {
      eventType: req.query.event_type,
      userId: req.query.user_id,
      startDate: req.query.start_date,
      endDate: req.query.end_date
    };

    // 查询日志
    const logs = await securityAudit.queryLogs(filters);

    res.json({ code: 200, data: logs });
  } catch (error) {
    logger.error('Error querying audit logs:', error);
    res.status(500).json({ code: 500, message: 'Internal server error' });
  }
});

// API密钥管理
app.post('/api/v1/api-keys', async (req, res) => {
  try {
    const { user_id, permissions, expires_at } = req.body;

    // 验证请求参数
    const schema = Joi.object({
      user_id: Joi.string().required(),
      permissions: Joi.array().items(Joi.string()).required(),
      expires_at: Joi.date().optional()
    });

    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ code: 400, message: error.details[0].message });
    }

    // 生成API密钥
    const keyId = uuid.v4();
    const secret = crypto.randomBytes(32).toString('hex');
    const keyHash = await bcrypt.hash(secret, 10);

    // 存储API密钥
    await dbConnection.execute(
      'INSERT INTO api_keys (key_id, key_hash, user_id, permissions, expires_at) VALUES (?, ?, ?, ?, ?)',
      [keyId, keyHash, user_id, JSON.stringify(permissions), expires_at]
    );

    // 记录审计日志
    await securityAudit.logEvent(
      'api_key_created',
      user_id,
      'api_keys',
      'create',
      req.ip,
      req.headers['user-agent'],
      'success',
      { keyId }
    );

    res.json({ code: 200, data: { keyId, secret } });
  } catch (error) {
    logger.error('Error creating API key:', error);
    res.status(500).json({ code: 500, message: 'Internal server error' });
  }
});

// 验证API密钥
app.post('/api/v1/api-keys/verify', async (req, res) => {
  try {
    const { keyId, secret } = req.body;

    // 验证请求参数
    const schema = Joi.object({
      keyId: Joi.string().required(),
      secret: Joi.string().required()
    });

    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ code: 400, message: error.details[0].message });
    }

    // 查询API密钥
    const [rows] = await dbConnection.execute(
      'SELECT * FROM api_keys WHERE key_id = ? AND is_revoked = ?',
      [keyId, false]
    );

    if (rows.length === 0) {
      return res.status(401).json({ code: 401, message: 'Invalid API key' });
    }

    const key = rows[0];

    // 检查是否过期
    if (key.expires_at && new Date(key.expires_at) < new Date()) {
      return res.status(401).json({ code: 401, message: 'API key expired' });
    }

    // 验证密钥
    const isValid = await bcrypt.compare(secret, key.key_hash);
    if (!isValid) {
      return res.status(401).json({ code: 401, message: 'Invalid API key' });
    }

    // 更新最后使用时间
    await dbConnection.execute(
      'UPDATE api_keys SET last_used_at = ? WHERE key_id = ?',
      [new Date(), keyId]
    );

    res.json({ code: 200, data: { valid: true, permissions: JSON.parse(key.permissions) } });
  } catch (error) {
    logger.error('Error verifying API key:', error);
    res.status(500).json({ code: 500, message: 'Internal server error' });
  }
});

// 错误处理中间件
app.use((err, req, res, next) => {
  logger.error('Error:', err);
  res.status(500).json({ code: 500, message: 'Internal server error' });
});

// 启动服务
async function startServer() {
  try {
    await initService();
    await zeroTrust.loadPolicies();
    
    app.listen(PORT, () => {
      logger.info(`Security service running on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Error starting server:', error);
    process.exit(1);
  }
}

// 启动服务
startServer();

// 优雅关闭
process.on('SIGINT', async () => {
  logger.info('Shutting down service...');
  try {
    await redisClient.disconnect();
    if (dbConnection) {
      await dbConnection.end();
    }
    logger.info('Service shut down successfully');
    process.exit(0);
  } catch (error) {
    logger.error('Error during shutdown:', error);
    process.exit(1);
  }
});