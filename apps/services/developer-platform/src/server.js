const express = require('express');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
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
const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const marked = require('marked');
const fs = require('fs-extra');
const multer = require('multer');
const archiver = require('archiver');
const mime = require('mime-types');

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
    new winston.transports.File({ filename: 'logs/developer-platform.log' }),
    new winston.transports.Console()
  ]
});

// 初始化Express应用
const app = express();
const PORT = process.env.DEVELOPER_PLATFORM_PORT || 3021;

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
  clientId: 'developer-platform',
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
      user: process.env.MYSQL_USER || 'mixmlaal',
      password: process.env.MYSQL_PASSWORD || 'mixmlaal',
      database: process.env.MYSQL_DATABASE || 'mixmlaal'
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
    // 开发者表
    await dbConnection.execute(`
      CREATE TABLE IF NOT EXISTS developers (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        developer_id VARCHAR(36) NOT NULL,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        organization VARCHAR(100),
        website VARCHAR(255),
        is_verified BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // 应用表
    await dbConnection.execute(`
      CREATE TABLE IF NOT EXISTS applications (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        app_id VARCHAR(36) NOT NULL,
        developer_id VARCHAR(36) NOT NULL,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        redirect_uri VARCHAR(255),
        client_id VARCHAR(36) NOT NULL,
        client_secret VARCHAR(255) NOT NULL,
        status VARCHAR(20) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // API密钥表
    await dbConnection.execute(`
      CREATE TABLE IF NOT EXISTS api_keys (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        key_id VARCHAR(36) NOT NULL,
        app_id VARCHAR(36) NOT NULL,
        developer_id VARCHAR(36) NOT NULL,
        key_hash VARCHAR(255) NOT NULL,
        permissions TEXT NOT NULL,
        expires_at DATETIME,
        is_revoked BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_used_at TIMESTAMP
      )
    `);

    // SDK表
    await dbConnection.execute(`
      CREATE TABLE IF NOT EXISTS sdks (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        sdk_id VARCHAR(36) NOT NULL,
        name VARCHAR(100) NOT NULL,
        version VARCHAR(20) NOT NULL,
        language VARCHAR(50) NOT NULL,
        description TEXT,
        download_url VARCHAR(255),
        documentation_url VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // 文档表
    await dbConnection.execute(`
      CREATE TABLE IF NOT EXISTS documentation (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        doc_id VARCHAR(36) NOT NULL,
        title VARCHAR(100) NOT NULL,
        content TEXT NOT NULL,
        type VARCHAR(50) NOT NULL,
        version VARCHAR(20) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // 社区帖子表
    await dbConnection.execute(`
      CREATE TABLE IF NOT EXISTS community_posts (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        post_id VARCHAR(36) NOT NULL,
        developer_id VARCHAR(36) NOT NULL,
        title VARCHAR(200) NOT NULL,
        content TEXT NOT NULL,
        category VARCHAR(50),
        status VARCHAR(20) DEFAULT 'published',
        view_count INT DEFAULT 0,
        like_count INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
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
      name: 'developer-platform',
      id: `developer-platform-${uuid.v4()}`,
      address: 'developer-platform',
      port: PORT,
      tags: ['developer', 'platform', 'api', 'community'],
      check: {
        http: `http://developer-platform:${PORT}/health`,
        interval: '10s',
        timeout: '5s'
      }
    });
    logger.info('Service registered with Consul');
  } catch (error) {
    logger.error('Service registration error:', error);
  }
}

// Swagger配置
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'MixMLAAL Developer Platform API',
      version: '1.0.0',
      description: 'API documentation for MixMLAAL Developer Platform'
    },
    servers: [
      {
        url: `http://localhost:${PORT}/api/v1`
      }
    ]
  },
  apis: ['./src/routes/*.js']
};

const swaggerDocs = swaggerJSDoc(swaggerOptions);
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// 开发者管理
class DeveloperManager {
  // 注册开发者
  async registerDeveloper(developerData) {
    try {
      const { name, email, password, organization, website } = developerData;

      // 检查邮箱是否已存在
      const [existing] = await dbConnection.execute(
        'SELECT * FROM developers WHERE email = ?',
        [email]
      );

      if (existing.length > 0) {
        throw new Error('Email already registered');
      }

      // 密码加密
      const passwordHash = await bcrypt.hash(password, 10);
      const developerId = uuid.v4();

      // 创建开发者
      await dbConnection.execute(
        'INSERT INTO developers (developer_id, name, email, password_hash, organization, website) VALUES (?, ?, ?, ?, ?, ?)',
        [developerId, name, email, passwordHash, organization, website]
      );

      return { developerId, name, email, organization, website };
    } catch (error) {
      logger.error('Error registering developer:', error);
      throw error;
    }
  }

  // 开发者登录
  async loginDeveloper(email, password) {
    try {
      // 查找开发者
      const [rows] = await dbConnection.execute(
        'SELECT * FROM developers WHERE email = ?',
        [email]
      );

      if (rows.length === 0) {
        throw new Error('Invalid email or password');
      }

      const developer = rows[0];

      // 验证密码
      const isValid = await bcrypt.compare(password, developer.password_hash);
      if (!isValid) {
        throw new Error('Invalid email or password');
      }

      // 生成JWT令牌
      const token = jwt.sign(
        { developerId: developer.developer_id, email: developer.email },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );

      return { token, developer: {
        developerId: developer.developer_id,
        name: developer.name,
        email: developer.email,
        organization: developer.organization,
        website: developer.website
      }};
    } catch (error) {
      logger.error('Error logging in developer:', error);
      throw error;
    }
  }

  // 获取开发者信息
  async getDeveloper(developerId) {
    try {
      const [rows] = await dbConnection.execute(
        'SELECT * FROM developers WHERE developer_id = ?',
        [developerId]
      );

      if (rows.length === 0) {
        throw new Error('Developer not found');
      }

      const developer = rows[0];
      return {
        developerId: developer.developer_id,
        name: developer.name,
        email: developer.email,
        organization: developer.organization,
        website: developer.website,
        isVerified: developer.is_verified,
        createdAt: developer.created_at
      };
    } catch (error) {
      logger.error('Error getting developer:', error);
      throw error;
    }
  }
}

// 应用管理
class ApplicationManager {
  // 创建应用
  async createApplication(developerId, appData) {
    try {
      const { name, description, redirect_uri } = appData;

      // 生成应用ID和客户端凭证
      const appId = uuid.v4();
      const clientId = uuid.v4();
      const clientSecret = crypto.randomBytes(32).toString('hex');
      const clientSecretHash = await bcrypt.hash(clientSecret, 10);

      // 创建应用
      await dbConnection.execute(
        'INSERT INTO applications (app_id, developer_id, name, description, redirect_uri, client_id, client_secret) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [appId, developerId, name, description, redirect_uri, clientId, clientSecretHash]
      );

      return { appId, clientId, clientSecret, name, description, redirect_uri };
    } catch (error) {
      logger.error('Error creating application:', error);
      throw error;
    }
  }

  // 获取应用列表
  async getApplications(developerId) {
    try {
      const [rows] = await dbConnection.execute(
        'SELECT * FROM applications WHERE developer_id = ?',
        [developerId]
      );

      return rows.map(row => ({
        appId: row.app_id,
        name: row.name,
        description: row.description,
        redirectUri: row.redirect_uri,
        clientId: row.client_id,
        status: row.status,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      }));
    } catch (error) {
      logger.error('Error getting applications:', error);
      throw error;
    }
  }

  // 获取应用详情
  async getApplication(appId, developerId) {
    try {
      const [rows] = await dbConnection.execute(
        'SELECT * FROM applications WHERE app_id = ? AND developer_id = ?',
        [appId, developerId]
      );

      if (rows.length === 0) {
        throw new Error('Application not found');
      }

      const app = rows[0];
      return {
        appId: app.app_id,
        name: app.name,
        description: app.description,
        redirectUri: app.redirect_uri,
        clientId: app.client_id,
        status: app.status,
        createdAt: app.created_at,
        updatedAt: app.updated_at
      };
    } catch (error) {
      logger.error('Error getting application:', error);
      throw error;
    }
  }
}

// API密钥管理
class APIKeyManager {
  // 创建API密钥
  async createAPIKey(appId, developerId, permissions, expiresAt) {
    try {
      // 生成API密钥
      const keyId = uuid.v4();
      const secret = crypto.randomBytes(32).toString('hex');
      const keyHash = await bcrypt.hash(secret, 10);

      // 存储API密钥
      await dbConnection.execute(
        'INSERT INTO api_keys (key_id, app_id, developer_id, key_hash, permissions, expires_at) VALUES (?, ?, ?, ?, ?, ?)',
        [keyId, appId, developerId, keyHash, JSON.stringify(permissions), expiresAt]
      );

      return { keyId, secret, permissions, expiresAt };
    } catch (error) {
      logger.error('Error creating API key:', error);
      throw error;
    }
  }

  // 获取API密钥列表
  async getAPIKeys(developerId) {
    try {
      const [rows] = await dbConnection.execute(
        'SELECT * FROM api_keys WHERE developer_id = ?',
        [developerId]
      );

      return rows.map(row => ({
        keyId: row.key_id,
        appId: row.app_id,
        permissions: JSON.parse(row.permissions),
        expiresAt: row.expires_at,
        isRevoked: row.is_revoked,
        createdAt: row.created_at,
        lastUsedAt: row.last_used_at
      }));
    } catch (error) {
      logger.error('Error getting API keys:', error);
      throw error;
    }
  }

  // 撤销API密钥
  async revokeAPIKey(keyId, developerId) {
    try {
      const [result] = await dbConnection.execute(
        'UPDATE api_keys SET is_revoked = ? WHERE key_id = ? AND developer_id = ?',
        [true, keyId, developerId]
      );

      if (result.affectedRows === 0) {
        throw new Error('API key not found');
      }

      return { success: true };
    } catch (error) {
      logger.error('Error revoking API key:', error);
      throw error;
    }
  }
}

// SDK管理
class SDKManager {
  // 创建SDK
  async createSDK(sdkData) {
    try {
      const { name, version, language, description, downloadUrl, documentationUrl } = sdkData;

      const sdkId = uuid.v4();

      await dbConnection.execute(
        'INSERT INTO sdks (sdk_id, name, version, language, description, download_url, documentation_url) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [sdkId, name, version, language, description, downloadUrl, documentationUrl]
      );

      return { sdkId, name, version, language, description, downloadUrl, documentationUrl };
    } catch (error) {
      logger.error('Error creating SDK:', error);
      throw error;
    }
  }

  // 获取SDK列表
  async getSDKs() {
    try {
      const [rows] = await dbConnection.execute('SELECT * FROM sdks ORDER BY created_at DESC');

      return rows.map(row => ({
        sdkId: row.sdk_id,
        name: row.name,
        version: row.version,
        language: row.language,
        description: row.description,
        downloadUrl: row.download_url,
        documentationUrl: row.documentation_url,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      }));
    } catch (error) {
      logger.error('Error getting SDKs:', error);
      throw error;
    }
  }

  // 获取SDK详情
  async getSDK(sdkId) {
    try {
      const [rows] = await dbConnection.execute(
        'SELECT * FROM sdks WHERE sdk_id = ?',
        [sdkId]
      );

      if (rows.length === 0) {
        throw new Error('SDK not found');
      }

      const sdk = rows[0];
      return {
        sdkId: sdk.sdk_id,
        name: sdk.name,
        version: sdk.version,
        language: sdk.language,
        description: sdk.description,
        downloadUrl: sdk.download_url,
        documentationUrl: sdk.documentation_url,
        createdAt: sdk.created_at,
        updatedAt: sdk.updated_at
      };
    } catch (error) {
      logger.error('Error getting SDK:', error);
      throw error;
    }
  }
}

// 文档管理
class DocumentationManager {
  // 创建文档
  async createDocumentation(docData) {
    try {
      const { title, content, type, version } = docData;

      const docId = uuid.v4();

      await dbConnection.execute(
        'INSERT INTO documentation (doc_id, title, content, type, version) VALUES (?, ?, ?, ?, ?)',
        [docId, title, content, type, version]
      );

      return { docId, title, content, type, version };
    } catch (error) {
      logger.error('Error creating documentation:', error);
      throw error;
    }
  }

  // 获取文档列表
  async getDocumentation() {
    try {
      const [rows] = await dbConnection.execute('SELECT * FROM documentation ORDER BY created_at DESC');

      return rows.map(row => ({
        docId: row.doc_id,
        title: row.title,
        type: row.type,
        version: row.version,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      }));
    } catch (error) {
      logger.error('Error getting documentation:', error);
      throw error;
    }
  }

  // 获取文档详情
  async getDocumentationById(docId) {
    try {
      const [rows] = await dbConnection.execute(
        'SELECT * FROM documentation WHERE doc_id = ?',
        [docId]
      );

      if (rows.length === 0) {
        throw new Error('Documentation not found');
      }

      const doc = rows[0];
      return {
        docId: doc.doc_id,
        title: doc.title,
        content: doc.content,
        type: doc.type,
        version: doc.version,
        createdAt: doc.created_at,
        updatedAt: doc.updated_at
      };
    } catch (error) {
      logger.error('Error getting documentation:', error);
      throw error;
    }
  }
}

// 社区管理
class CommunityManager {
  // 创建帖子
  async createPost(developerId, postData) {
    try {
      const { title, content, category } = postData;

      const postId = uuid.v4();

      await dbConnection.execute(
        'INSERT INTO community_posts (post_id, developer_id, title, content, category) VALUES (?, ?, ?, ?, ?)',
        [postId, developerId, title, content, category]
      );

      return { postId, title, content, category };
    } catch (error) {
      logger.error('Error creating post:', error);
      throw error;
    }
  }

  // 获取帖子列表
  async getPosts() {
    try {
      const [rows] = await dbConnection.execute('SELECT * FROM community_posts WHERE status = ? ORDER BY created_at DESC', ['published']);

      return rows.map(row => ({
        postId: row.post_id,
        developerId: row.developer_id,
        title: row.title,
        category: row.category,
        viewCount: row.view_count,
        likeCount: row.like_count,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      }));
    } catch (error) {
      logger.error('Error getting posts:', error);
      throw error;
    }
  }

  // 获取帖子详情
  async getPost(postId) {
    try {
      // 更新浏览次数
      await dbConnection.execute(
        'UPDATE community_posts SET view_count = view_count + 1 WHERE post_id = ?',
        [postId]
      );

      const [rows] = await dbConnection.execute(
        'SELECT * FROM community_posts WHERE post_id = ?',
        [postId]
      );

      if (rows.length === 0) {
        throw new Error('Post not found');
      }

      const post = rows[0];
      return {
        postId: post.post_id,
        developerId: post.developer_id,
        title: post.title,
        content: post.content,
        category: post.category,
        viewCount: post.view_count,
        likeCount: post.like_count,
        createdAt: post.created_at,
        updatedAt: post.updated_at
      };
    } catch (error) {
      logger.error('Error getting post:', error);
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
const developerManager = new DeveloperManager();
const applicationManager = new ApplicationManager();
const apiKeyManager = new APIKeyManager();
const sdkManager = new SDKManager();
const documentationManager = new DocumentationManager();
const communityManager = new CommunityManager();

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'developer-platform' });
});

// 开发者注册
app.post('/api/v1/developers/register', async (req, res) => {
  try {
    const { name, email, password, organization, website } = req.body;

    // 验证请求参数
    const schema = Joi.object({
      name: Joi.string().required(),
      email: Joi.string().email().required(),
      password: Joi.string().min(6).required(),
      organization: Joi.string().optional(),
      website: Joi.string().optional()
    });

    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ code: 400, message: error.details[0].message });
    }

    // 注册开发者
    const result = await developerManager.registerDeveloper({
      name,
      email,
      password,
      organization,
      website
    });

    res.json({ code: 200, data: result });
  } catch (error) {
    logger.error('Error registering developer:', error);
    res.status(400).json({ code: 400, message: error.message });
  }
});

// 开发者登录
app.post('/api/v1/developers/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // 验证请求参数
    const schema = Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().required()
    });

    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ code: 400, message: error.details[0].message });
    }

    // 登录
    const result = await developerManager.loginDeveloper(email, password);

    res.json({ code: 200, data: result });
  } catch (error) {
    logger.error('Error logging in developer:', error);
    res.status(401).json({ code: 401, message: error.message });
  }
});

// 获取开发者信息
app.get('/api/v1/developers/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ code: 401, message: 'Missing authorization token' });
    }

    // 验证token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const developerId = decoded.developerId;

    // 获取开发者信息
    const developer = await developerManager.getDeveloper(developerId);

    res.json({ code: 200, data: developer });
  } catch (error) {
    logger.error('Error getting developer info:', error);
    res.status(401).json({ code: 401, message: 'Invalid or expired token' });
  }
});

// 创建应用
app.post('/api/v1/applications', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ code: 401, message: 'Missing authorization token' });
    }

    // 验证token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const developerId = decoded.developerId;

    const { name, description, redirect_uri } = req.body;

    // 验证请求参数
    const schema = Joi.object({
      name: Joi.string().required(),
      description: Joi.string().optional(),
      redirect_uri: Joi.string().optional()
    });

    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ code: 400, message: error.details[0].message });
    }

    // 创建应用
    const result = await applicationManager.createApplication(developerId, {
      name,
      description,
      redirect_uri
    });

    res.json({ code: 200, data: result });
  } catch (error) {
    logger.error('Error creating application:', error);
    res.status(400).json({ code: 400, message: error.message });
  }
});

// 获取应用列表
app.get('/api/v1/applications', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ code: 401, message: 'Missing authorization token' });
    }

    // 验证token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const developerId = decoded.developerId;

    // 获取应用列表
    const applications = await applicationManager.getApplications(developerId);

    res.json({ code: 200, data: applications });
  } catch (error) {
    logger.error('Error getting applications:', error);
    res.status(401).json({ code: 401, message: 'Invalid or expired token' });
  }
});

// 获取应用详情
app.get('/api/v1/applications/:appId', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ code: 401, message: 'Missing authorization token' });
    }

    // 验证token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const developerId = decoded.developerId;

    const { appId } = req.params;

    // 获取应用详情
    const application = await applicationManager.getApplication(appId, developerId);

    res.json({ code: 200, data: application });
  } catch (error) {
    logger.error('Error getting application:', error);
    res.status(400).json({ code: 400, message: error.message });
  }
});

// 创建API密钥
app.post('/api/v1/api-keys', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ code: 401, message: 'Missing authorization token' });
    }

    // 验证token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const developerId = decoded.developerId;

    const { appId, permissions, expires_at } = req.body;

    // 验证请求参数
    const schema = Joi.object({
      appId: Joi.string().required(),
      permissions: Joi.array().items(Joi.string()).required(),
      expires_at: Joi.date().optional()
    });

    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ code: 400, message: error.details[0].message });
    }

    // 创建API密钥
    const result = await apiKeyManager.createAPIKey(appId, developerId, permissions, expires_at);

    res.json({ code: 200, data: result });
  } catch (error) {
    logger.error('Error creating API key:', error);
    res.status(400).json({ code: 400, message: error.message });
  }
});

// 获取API密钥列表
app.get('/api/v1/api-keys', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ code: 401, message: 'Missing authorization token' });
    }

    // 验证token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const developerId = decoded.developerId;

    // 获取API密钥列表
    const apiKeys = await apiKeyManager.getAPIKeys(developerId);

    res.json({ code: 200, data: apiKeys });
  } catch (error) {
    logger.error('Error getting API keys:', error);
    res.status(401).json({ code: 401, message: 'Invalid or expired token' });
  }
});

// 撤销API密钥
app.delete('/api/v1/api-keys/:keyId', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ code: 401, message: 'Missing authorization token' });
    }

    // 验证token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const developerId = decoded.developerId;

    const { keyId } = req.params;

    // 撤销API密钥
    const result = await apiKeyManager.revokeAPIKey(keyId, developerId);

    res.json({ code: 200, data: result });
  } catch (error) {
    logger.error('Error revoking API key:', error);
    res.status(400).json({ code: 400, message: error.message });
  }
});

// 获取SDK列表
app.get('/api/v1/sdks', async (req, res) => {
  try {
    // 获取SDK列表
    const sdks = await sdkManager.getSDKs();

    res.json({ code: 200, data: sdks });
  } catch (error) {
    logger.error('Error getting SDKs:', error);
    res.status(500).json({ code: 500, message: 'Internal server error' });
  }
});

// 获取SDK详情
app.get('/api/v1/sdks/:sdkId', async (req, res) => {
  try {
    const { sdkId } = req.params;

    // 获取SDK详情
    const sdk = await sdkManager.getSDK(sdkId);

    res.json({ code: 200, data: sdk });
  } catch (error) {
    logger.error('Error getting SDK:', error);
    res.status(400).json({ code: 400, message: error.message });
  }
});

// 获取文档列表
app.get('/api/v1/documentation', async (req, res) => {
  try {
    // 获取文档列表
    const docs = await documentationManager.getDocumentation();

    res.json({ code: 200, data: docs });
  } catch (error) {
    logger.error('Error getting documentation:', error);
    res.status(500).json({ code: 500, message: 'Internal server error' });
  }
});

// 获取文档详情
app.get('/api/v1/documentation/:docId', async (req, res) => {
  try {
    const { docId } = req.params;

    // 获取文档详情
    const doc = await documentationManager.getDocumentationById(docId);

    res.json({ code: 200, data: doc });
  } catch (error) {
    logger.error('Error getting documentation:', error);
    res.status(400).json({ code: 400, message: error.message });
  }
});

// 创建社区帖子
app.post('/api/v1/community/posts', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ code: 401, message: 'Missing authorization token' });
    }

    // 验证token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const developerId = decoded.developerId;

    const { title, content, category } = req.body;

    // 验证请求参数
    const schema = Joi.object({
      title: Joi.string().required(),
      content: Joi.string().required(),
      category: Joi.string().optional()
    });

    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ code: 400, message: error.details[0].message });
    }

    // 创建帖子
    const result = await communityManager.createPost(developerId, {
      title,
      content,
      category
    });

    res.json({ code: 200, data: result });
  } catch (error) {
    logger.error('Error creating post:', error);
    res.status(400).json({ code: 400, message: error.message });
  }
});

// 获取社区帖子列表
app.get('/api/v1/community/posts', async (req, res) => {
  try {
    // 获取帖子列表
    const posts = await communityManager.getPosts();

    res.json({ code: 200, data: posts });
  } catch (error) {
    logger.error('Error getting posts:', error);
    res.status(500).json({ code: 500, message: 'Internal server error' });
  }
});

// 获取社区帖子详情
app.get('/api/v1/community/posts/:postId', async (req, res) => {
  try {
    const { postId } = req.params;

    // 获取帖子详情
    const post = await communityManager.getPost(postId);

    res.json({ code: 200, data: post });
  } catch (error) {
    logger.error('Error getting post:', error);
    res.status(400).json({ code: 400, message: error.message });
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
    
    app.listen(PORT, () => {
      logger.info(`Developer platform service running on port ${PORT}`);
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