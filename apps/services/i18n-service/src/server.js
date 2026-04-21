const express = require('express');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const cors = require('cors');
const Redis = require('redis');
const Consul = require('consul');
const mysql = require('mysql2/promise');
const { Kafka } = require('kafkajs');
const winston = require('winston');
const expressWinston = require('express-winston');
const dotenv = require('dotenv');
const axios = require('axios');
const Joi = require('joi');
const i18next = require('i18next');
const Backend = require('i18next-fs-backend');
const middleware = require('i18next-http-middleware');
const fs = require('fs-extra');
const path = require('path');

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
    new winston.transports.File({ filename: 'logs/i18n-service.log' }),
    new winston.transports.Console()
  ]
});

// 初始化Express应用
const app = express();
const PORT = process.env.I18N_SERVICE_PORT || 3022;

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
  clientId: 'i18n-service',
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
    // 语言表
    await dbConnection.execute(`
      CREATE TABLE IF NOT EXISTS languages (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        code VARCHAR(10) NOT NULL,
        name VARCHAR(50) NOT NULL,
        native_name VARCHAR(50) NOT NULL,
        is_default BOOLEAN DEFAULT FALSE,
        status VARCHAR(20) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // 翻译键表
    await dbConnection.execute(`
      CREATE TABLE IF NOT EXISTS translation_keys (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        key_name VARCHAR(255) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // 翻译值表
    await dbConnection.execute(`
      CREATE TABLE IF NOT EXISTS translations (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        key_id BIGINT NOT NULL,
        language_code VARCHAR(10) NOT NULL,
        value TEXT NOT NULL,
        status VARCHAR(20) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (key_id) REFERENCES translation_keys(id),
        UNIQUE KEY unique_key_language (key_id, language_code)
      )
    `);

    // 本地化设置表
    await dbConnection.execute(`
      CREATE TABLE IF NOT EXISTS localization_settings (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        setting_key VARCHAR(100) NOT NULL,
        setting_value TEXT NOT NULL,
        language_code VARCHAR(10),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_setting_language (setting_key, language_code)
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
      name: 'i18n-service',
      id: `i18n-service-${uuid.v4()}`,
      address: 'i18n-service',
      port: PORT,
      tags: ['i18n', 'internationalization', 'localization'],
      check: {
        http: `http://i18n-service:${PORT}/health`,
        interval: '10s',
        timeout: '5s'
      }
    });
    logger.info('Service registered with Consul');
  } catch (error) {
    logger.error('Service registration error:', error);
  }
}

// 初始化i18next
function initI18next() {
  i18next
    .use(Backend)
    .use(middleware.LanguageDetector)
    .init({
      lng: 'zh-CN',
      fallbackLng: 'en-US',
      preload: ['zh-CN', 'en-US', 'ja-JP', 'ko-KR', 'fr-FR', 'es-ES', 'de-DE', 'ru-RU'],
      backend: {
        loadPath: path.join(__dirname, '../locales/{{lng}}/{{ns}}.json'),
        addPath: path.join(__dirname, '../locales/{{lng}}/{{ns}}.missing.json')
      },
      ns: ['common', 'user', 'ride', 'ecommerce', 'payment', 'order', 'social', 'food', 'errand'],
      defaultNS: 'common',
      interpolation: {
        escapeValue: false
      }
    });

  logger.info('i18next initialized successfully');
}

// 创建本地化目录
function createLocaleDirectories() {
  const localesPath = path.join(__dirname, '../locales');
  const languages = ['zh-CN', 'en-US', 'ja-JP', 'ko-KR', 'fr-FR', 'es-ES', 'de-DE', 'ru-RU'];
  const namespaces = ['common', 'user', 'ride', 'ecommerce', 'payment', 'order', 'social', 'food', 'errand'];

  languages.forEach(lang => {
    namespaces.forEach(ns => {
      const dirPath = path.join(localesPath, lang);
      const filePath = path.join(dirPath, `${ns}.json`);
      
      // 创建目录
      fs.ensureDirSync(dirPath);
      
      // 创建默认文件
      if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, '{}');
      }
    });
  });

  logger.info('Locale directories created successfully');
}

// 语言管理
class LanguageManager {
  // 获取所有语言
  async getLanguages() {
    try {
      const [rows] = await dbConnection.execute('SELECT * FROM languages');
      return rows.map(row => ({
        code: row.code,
        name: row.name,
        nativeName: row.native_name,
        isDefault: row.is_default,
        status: row.status
      }));
    } catch (error) {
      logger.error('Error getting languages:', error);
      throw error;
    }
  }

  // 添加语言
  async addLanguage(languageData) {
    try {
      const { code, name, nativeName, isDefault } = languageData;

      // 检查语言是否已存在
      const [existing] = await dbConnection.execute(
        'SELECT * FROM languages WHERE code = ?',
        [code]
      );

      if (existing.length > 0) {
        throw new Error('Language already exists');
      }

      // 如果设置为默认语言，先将其他语言设置为非默认
      if (isDefault) {
        await dbConnection.execute(
          'UPDATE languages SET is_default = ?',
          [false]
        );
      }

      // 添加语言
      await dbConnection.execute(
        'INSERT INTO languages (code, name, native_name, is_default) VALUES (?, ?, ?, ?)',
        [code, name, nativeName, isDefault]
      );

      // 创建语言目录
      const localesPath = path.join(__dirname, '../locales', code);
      fs.ensureDirSync(localesPath);

      return { code, name, nativeName, isDefault };
    } catch (error) {
      logger.error('Error adding language:', error);
      throw error;
    }
  }

  // 更新语言
  async updateLanguage(code, languageData) {
    try {
      const { name, nativeName, isDefault, status } = languageData;

      // 如果设置为默认语言，先将其他语言设置为非默认
      if (isDefault) {
        await dbConnection.execute(
          'UPDATE languages SET is_default = ?',
          [false]
        );
      }

      // 更新语言
      await dbConnection.execute(
        'UPDATE languages SET name = ?, native_name = ?, is_default = ?, status = ? WHERE code = ?',
        [name, nativeName, isDefault, status, code]
      );

      return { code, name, nativeName, isDefault, status };
    } catch (error) {
      logger.error('Error updating language:', error);
      throw error;
    }
  }

  // 删除语言
  async deleteLanguage(code) {
    try {
      // 检查是否为默认语言
      const [rows] = await dbConnection.execute(
        'SELECT is_default FROM languages WHERE code = ?',
        [code]
      );

      if (rows.length > 0 && rows[0].is_default) {
        throw new Error('Cannot delete default language');
      }

      // 删除语言
      await dbConnection.execute(
        'DELETE FROM languages WHERE code = ?',
        [code]
      );

      // 删除语言目录
      const localesPath = path.join(__dirname, '../locales', code);
      if (fs.existsSync(localesPath)) {
        fs.removeSync(localesPath);
      }

      return { success: true };
    } catch (error) {
      logger.error('Error deleting language:', error);
      throw error;
    }
  }
}

// 翻译管理
class TranslationManager {
  // 获取所有翻译键
  async getTranslationKeys() {
    try {
      const [rows] = await dbConnection.execute('SELECT * FROM translation_keys');
      return rows.map(row => ({
        id: row.id,
        keyName: row.key_name,
        description: row.description
      }));
    } catch (error) {
      logger.error('Error getting translation keys:', error);
      throw error;
    }
  }

  // 添加翻译键
  async addTranslationKey(keyData) {
    try {
      const { keyName, description } = keyData;

      // 检查键是否已存在
      const [existing] = await dbConnection.execute(
        'SELECT * FROM translation_keys WHERE key_name = ?',
        [keyName]
      );

      if (existing.length > 0) {
        throw new Error('Translation key already exists');
      }

      // 添加翻译键
      const [result] = await dbConnection.execute(
        'INSERT INTO translation_keys (key_name, description) VALUES (?, ?)',
        [keyName, description]
      );

      return { id: result.insertId, keyName, description };
    } catch (error) {
      logger.error('Error adding translation key:', error);
      throw error;
    }
  }

  // 获取翻译
  async getTranslations(languageCode) {
    try {
      const [rows] = await dbConnection.execute(
        `SELECT tk.key_name, t.value 
         FROM translation_keys tk
         LEFT JOIN translations t ON tk.id = t.key_id AND t.language_code = ?`,
        [languageCode]
      );

      const translations = {};
      rows.forEach(row => {
        if (row.value) {
          translations[row.key_name] = row.value;
        }
      });

      return translations;
    } catch (error) {
      logger.error('Error getting translations:', error);
      throw error;
    }
  }

  // 添加翻译
  async addTranslation(translationData) {
    try {
      const { keyName, languageCode, value } = translationData;

      // 查找键ID
      const [keyRows] = await dbConnection.execute(
        'SELECT id FROM translation_keys WHERE key_name = ?',
        [keyName]
      );

      if (keyRows.length === 0) {
        throw new Error('Translation key not found');
      }

      const keyId = keyRows[0].id;

      // 检查翻译是否已存在
      const [existing] = await dbConnection.execute(
        'SELECT * FROM translations WHERE key_id = ? AND language_code = ?',
        [keyId, languageCode]
      );

      if (existing.length > 0) {
        // 更新翻译
        await dbConnection.execute(
          'UPDATE translations SET value = ? WHERE key_id = ? AND language_code = ?',
          [value, keyId, languageCode]
        );
      } else {
        // 添加翻译
        await dbConnection.execute(
          'INSERT INTO translations (key_id, language_code, value) VALUES (?, ?, ?)',
          [keyId, languageCode, value]
        );
      }

      // 更新本地文件
      await this.updateLocalTranslationFile(languageCode);

      return { keyName, languageCode, value };
    } catch (error) {
      logger.error('Error adding translation:', error);
      throw error;
    }
  }

  // 更新本地翻译文件
  async updateLocalTranslationFile(languageCode) {
    try {
      const translations = await this.getTranslations(languageCode);
      const filePath = path.join(__dirname, '../locales', languageCode, 'common.json');
      fs.writeFileSync(filePath, JSON.stringify(translations, null, 2));
    } catch (error) {
      logger.error('Error updating local translation file:', error);
      throw error;
    }
  }

  // 批量导入翻译
  async importTranslations(languageCode, translations) {
    try {
      for (const [keyName, value] of Object.entries(translations)) {
        await this.addTranslation({ keyName, languageCode, value });
      }
      return { success: true, count: Object.keys(translations).length };
    } catch (error) {
      logger.error('Error importing translations:', error);
      throw error;
    }
  }
}

// 本地化设置管理
class LocalizationManager {
  // 获取本地化设置
  async getSettings(languageCode) {
    try {
      const [rows] = await dbConnection.execute(
        'SELECT setting_key, setting_value FROM localization_settings WHERE language_code = ?',
        [languageCode]
      );

      const settings = {};
      rows.forEach(row => {
        settings[row.setting_key] = row.setting_value;
      });

      return settings;
    } catch (error) {
      logger.error('Error getting localization settings:', error);
      throw error;
    }
  }

  // 设置本地化设置
  async setSetting(settingData) {
    try {
      const { key, value, languageCode } = settingData;

      // 检查设置是否已存在
      const [existing] = await dbConnection.execute(
        'SELECT * FROM localization_settings WHERE setting_key = ? AND language_code = ?',
        [key, languageCode]
      );

      if (existing.length > 0) {
        // 更新设置
        await dbConnection.execute(
          'UPDATE localization_settings SET setting_value = ? WHERE setting_key = ? AND language_code = ?',
          [value, key, languageCode]
        );
      } else {
        // 添加设置
        await dbConnection.execute(
          'INSERT INTO localization_settings (setting_key, setting_value, language_code) VALUES (?, ?, ?)',
          [key, value, languageCode]
        );
      }

      return { key, value, languageCode };
    } catch (error) {
      logger.error('Error setting localization setting:', error);
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
    createLocaleDirectories();
    initI18next();
    logger.info('Service initialized successfully');
  } catch (error) {
    logger.error('Service initialization error:', error);
    process.exit(1);
  }
}

// 初始化实例
const languageManager = new LanguageManager();
const translationManager = new TranslationManager();
const localizationManager = new LocalizationManager();

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'i18n-service' });
});

// 获取所有语言
app.get('/api/v1/languages', async (req, res) => {
  try {
    const languages = await languageManager.getLanguages();
    res.json({ code: 200, data: languages });
  } catch (error) {
    logger.error('Error getting languages:', error);
    res.status(500).json({ code: 500, message: 'Internal server error' });
  }
});

// 添加语言
app.post('/api/v1/languages', async (req, res) => {
  try {
    const { code, name, nativeName, isDefault } = req.body;

    // 验证请求参数
    const schema = Joi.object({
      code: Joi.string().required(),
      name: Joi.string().required(),
      nativeName: Joi.string().required(),
      isDefault: Joi.boolean().optional()
    });

    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ code: 400, message: error.details[0].message });
    }

    const language = await languageManager.addLanguage({
      code,
      name,
      nativeName,
      isDefault: isDefault || false
    });

    res.json({ code: 200, data: language });
  } catch (error) {
    logger.error('Error adding language:', error);
    res.status(400).json({ code: 400, message: error.message });
  }
});

// 更新语言
app.put('/api/v1/languages/:code', async (req, res) => {
  try {
    const { code } = req.params;
    const { name, nativeName, isDefault, status } = req.body;

    // 验证请求参数
    const schema = Joi.object({
      name: Joi.string().required(),
      nativeName: Joi.string().required(),
      isDefault: Joi.boolean().optional(),
      status: Joi.string().optional()
    });

    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ code: 400, message: error.details[0].message });
    }

    const language = await languageManager.updateLanguage(code, {
      name,
      nativeName,
      isDefault: isDefault || false,
      status: status || 'active'
    });

    res.json({ code: 200, data: language });
  } catch (error) {
    logger.error('Error updating language:', error);
    res.status(400).json({ code: 400, message: error.message });
  }
});

// 删除语言
app.delete('/api/v1/languages/:code', async (req, res) => {
  try {
    const { code } = req.params;

    const result = await languageManager.deleteLanguage(code);
    res.json({ code: 200, data: result });
  } catch (error) {
    logger.error('Error deleting language:', error);
    res.status(400).json({ code: 400, message: error.message });
  }
});

// 获取所有翻译键
app.get('/api/v1/translation-keys', async (req, res) => {
  try {
    const keys = await translationManager.getTranslationKeys();
    res.json({ code: 200, data: keys });
  } catch (error) {
    logger.error('Error getting translation keys:', error);
    res.status(500).json({ code: 500, message: 'Internal server error' });
  }
});

// 添加翻译键
app.post('/api/v1/translation-keys', async (req, res) => {
  try {
    const { keyName, description } = req.body;

    // 验证请求参数
    const schema = Joi.object({
      keyName: Joi.string().required(),
      description: Joi.string().optional()
    });

    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ code: 400, message: error.details[0].message });
    }

    const key = await translationManager.addTranslationKey({ keyName, description });
    res.json({ code: 200, data: key });
  } catch (error) {
    logger.error('Error adding translation key:', error);
    res.status(400).json({ code: 400, message: error.message });
  }
});

// 获取翻译
app.get('/api/v1/translations/:languageCode', async (req, res) => {
  try {
    const { languageCode } = req.params;

    const translations = await translationManager.getTranslations(languageCode);
    res.json({ code: 200, data: translations });
  } catch (error) {
    logger.error('Error getting translations:', error);
    res.status(500).json({ code: 500, message: 'Internal server error' });
  }
});

// 添加翻译
app.post('/api/v1/translations', async (req, res) => {
  try {
    const { keyName, languageCode, value } = req.body;

    // 验证请求参数
    const schema = Joi.object({
      keyName: Joi.string().required(),
      languageCode: Joi.string().required(),
      value: Joi.string().required()
    });

    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ code: 400, message: error.details[0].message });
    }

    const translation = await translationManager.addTranslation({ keyName, languageCode, value });
    res.json({ code: 200, data: translation });
  } catch (error) {
    logger.error('Error adding translation:', error);
    res.status(400).json({ code: 400, message: error.message });
  }
});

// 批量导入翻译
app.post('/api/v1/translations/import/:languageCode', async (req, res) => {
  try {
    const { languageCode } = req.params;
    const translations = req.body;

    if (!translations || typeof translations !== 'object') {
      return res.status(400).json({ code: 400, message: 'Invalid translations format' });
    }

    const result = await translationManager.importTranslations(languageCode, translations);
    res.json({ code: 200, data: result });
  } catch (error) {
    logger.error('Error importing translations:', error);
    res.status(400).json({ code: 400, message: error.message });
  }
});

// 获取本地化设置
app.get('/api/v1/localization/settings/:languageCode', async (req, res) => {
  try {
    const { languageCode } = req.params;

    const settings = await localizationManager.getSettings(languageCode);
    res.json({ code: 200, data: settings });
  } catch (error) {
    logger.error('Error getting localization settings:', error);
    res.status(500).json({ code: 500, message: 'Internal server error' });
  }
});

// 设置本地化设置
app.post('/api/v1/localization/settings', async (req, res) => {
  try {
    const { key, value, languageCode } = req.body;

    // 验证请求参数
    const schema = Joi.object({
      key: Joi.string().required(),
      value: Joi.string().required(),
      languageCode: Joi.string().required()
    });

    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ code: 400, message: error.details[0].message });
    }

    const setting = await localizationManager.setSetting({ key, value, languageCode });
    res.json({ code: 200, data: setting });
  } catch (error) {
    logger.error('Error setting localization setting:', error);
    res.status(400).json({ code: 400, message: error.message });
  }
});

// 翻译API
app.get('/api/v1/translate', async (req, res) => {
  try {
    const { key, language = 'zh-CN' } = req.query;

    if (!key) {
      return res.status(400).json({ code: 400, message: 'Missing translation key' });
    }

    // 从Redis缓存获取
    const cacheKey = `translation:${language}:${key}`;
    const cachedTranslation = await redisClient.get(cacheKey);

    if (cachedTranslation) {
      return res.json({ code: 200, data: { key, value: cachedTranslation, language } });
    }

    // 从数据库获取
    const [rows] = await dbConnection.execute(
      `SELECT t.value 
       FROM translation_keys tk
       JOIN translations t ON tk.id = t.key_id
       WHERE tk.key_name = ? AND t.language_code = ?`,
      [key, language]
    );

    if (rows.length === 0) {
      return res.status(404).json({ code: 404, message: 'Translation not found' });
    }

    const translation = rows[0].value;

    // 缓存翻译
    await redisClient.set(cacheKey, translation, { EX: 3600 });

    res.json({ code: 200, data: { key, value: translation, language } });
  } catch (error) {
    logger.error('Error translating:', error);
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
    
    app.listen(PORT, () => {
      logger.info(`i18n service running on port ${PORT}`);
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