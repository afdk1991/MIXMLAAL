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
const tf = require('@tensorflow/tfjs-node');
const ml5 = require('ml5');
const math = require('mathjs');
const Papa = require('papaparse');
const csv = require('csv-parser');
const d3 = require('d3');
const mongoose = require('mongoose');
const AWS = require('aws-sdk');
const fs = require('fs');
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
    new winston.transports.File({ filename: 'logs/ai-service.log' }),
    new winston.transports.Console()
  ]
});

// 初始化Express应用
const app = express();
const PORT = process.env.AI_SERVICE_PORT || 3023;

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
  clientId: 'ai-service',
  brokers: [`${process.env.KAFKA_HOST || 'kafka'}:${process.env.KAFKA_PORT || 9092}`]
});

// 初始化数据库连接
let dbConnection;

// 连接MongoDB
mongoose.connect(
  process.env.MONGO_URI || 'mongodb://mongo:27017/mixmlaal',
  {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }
).then(() => {
  logger.info('MongoDB connected successfully');
}).catch(error => {
  logger.error('MongoDB connection error:', error);
});

// 定义MongoDB模型
const PredictionSchema = new mongoose.Schema({
  modelId: String,
  input: Object,
  output: Object,
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const AnalysisSchema = new mongoose.Schema({
  analysisType: String,
  data: Object,
  result: Object,
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const ModelSchema = new mongoose.Schema({
  name: String,
  type: String,
  status: String,
  accuracy: Number,
  createdBy: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const Prediction = mongoose.model('Prediction', PredictionSchema);
const Analysis = mongoose.model('Analysis', AnalysisSchema);
const Model = mongoose.model('Model', ModelSchema);

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
    // AI模型表
    await dbConnection.execute(`
      CREATE TABLE IF NOT EXISTS ai_models (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        type VARCHAR(50) NOT NULL,
        status VARCHAR(20) DEFAULT 'created',
        accuracy DOUBLE DEFAULT 0,
        model_path VARCHAR(255),
        created_by VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // 预测结果表
    await dbConnection.execute(`
      CREATE TABLE IF NOT EXISTS ai_predictions (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        model_id BIGINT NOT NULL,
        input_data TEXT NOT NULL,
        output_data TEXT NOT NULL,
        prediction_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (model_id) REFERENCES ai_models(id)
      )
    `);

    // 分析结果表
    await dbConnection.execute(`
      CREATE TABLE IF NOT EXISTS ai_analyses (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        analysis_type VARCHAR(100) NOT NULL,
        data_source VARCHAR(255),
        result TEXT NOT NULL,
        analysis_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
      name: 'ai-service',
      id: `ai-service-${uuid.v4()}`,
      address: 'ai-service',
      port: PORT,
      tags: ['ai', 'machine-learning', 'data-analysis'],
      check: {
        http: `http://ai-service:${PORT}/health`,
        interval: '10s',
        timeout: '5s'
      }
    });
    logger.info('Service registered with Consul');
  } catch (error) {
    logger.error('Service registration error:', error);
  }
}

// AI模型管理
class ModelManager {
  // 加载模型
  async loadModel(modelId) {
    try {
      const [rows] = await dbConnection.execute(
        'SELECT model_path FROM ai_models WHERE id = ?',
        [modelId]
      );

      if (rows.length === 0) {
        throw new Error('Model not found');
      }

      const modelPath = rows[0].model_path;
      const model = await tf.loadLayersModel(`file://${modelPath}`);
      return model;
    } catch (error) {
      logger.error('Error loading model:', error);
      throw error;
    }
  }

  // 训练模型
  async trainModel(modelData) {
    try {
      const { name, type, trainingData } = modelData;

      // 保存模型信息
      const [result] = await dbConnection.execute(
        'INSERT INTO ai_models (name, type, status) VALUES (?, ?, ?)',
        [name, type, 'training']
      );

      const modelId = result.insertId;

      // 模拟训练过程
      setTimeout(async () => {
        // 训练完成后更新状态
        await dbConnection.execute(
          'UPDATE ai_models SET status = ?, accuracy = ? WHERE id = ?',
          ['trained', 0.95, modelId]
        );

        // 保存模型路径
        const modelPath = path.join(__dirname, '../models', `${modelId}.json`);
        await dbConnection.execute(
          'UPDATE ai_models SET model_path = ? WHERE id = ?',
          [modelPath, modelId]
        );
      }, 5000);

      return { modelId, name, type, status: 'training' };
    } catch (error) {
      logger.error('Error training model:', error);
      throw error;
    }
  }

  // 获取模型列表
  async getModels() {
    try {
      const [rows] = await dbConnection.execute('SELECT * FROM ai_models');
      return rows.map(row => ({
        id: row.id,
        name: row.name,
        type: row.type,
        status: row.status,
        accuracy: row.accuracy,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      }));
    } catch (error) {
      logger.error('Error getting models:', error);
      throw error;
    }
  }

  // 删除模型
  async deleteModel(modelId) {
    try {
      // 查找模型路径
      const [rows] = await dbConnection.execute(
        'SELECT model_path FROM ai_models WHERE id = ?',
        [modelId]
      );

      if (rows.length > 0 && rows[0].model_path) {
        // 删除模型文件
        if (fs.existsSync(rows[0].model_path)) {
          fs.unlinkSync(rows[0].model_path);
        }
      }

      // 删除模型记录
      await dbConnection.execute(
        'DELETE FROM ai_models WHERE id = ?',
        [modelId]
      );

      return { success: true };
    } catch (error) {
      logger.error('Error deleting model:', error);
      throw error;
    }
  }
}

// 预测管理
class PredictionManager {
  // 执行预测
  async predict(modelId, inputData) {
    try {
      // 加载模型
      const modelManager = new ModelManager();
      const model = await modelManager.loadModel(modelId);

      // 准备输入数据
      const inputTensor = tf.tensor2d([inputData]);

      // 执行预测
      const outputTensor = model.predict(inputTensor);
      const outputData = await outputTensor.data();

      // 保存预测结果
      await dbConnection.execute(
        'INSERT INTO ai_predictions (model_id, input_data, output_data) VALUES (?, ?, ?)',
        [modelId, JSON.stringify(inputData), JSON.stringify(Array.from(outputData))]
      );

      // 保存到MongoDB
      await Prediction.create({
        modelId,
        input: inputData,
        output: Array.from(outputData)
      });

      return { prediction: Array.from(outputData) };
    } catch (error) {
      logger.error('Error making prediction:', error);
      throw error;
    }
  }

  // 获取预测历史
  async getPredictions(modelId) {
    try {
      const [rows] = await dbConnection.execute(
        'SELECT * FROM ai_predictions WHERE model_id = ? ORDER BY prediction_time DESC',
        [modelId]
      );

      return rows.map(row => ({
        id: row.id,
        inputData: JSON.parse(row.input_data),
        outputData: JSON.parse(row.output_data),
        predictionTime: row.prediction_time
      }));
    } catch (error) {
      logger.error('Error getting predictions:', error);
      throw error;
    }
  }
}

// 数据分析管理
class AnalysisManager {
  // 执行数据分析
  async analyze(analysisType, dataSource) {
    try {
      let result;

      switch (analysisType) {
        case 'sales':
          result = await this.analyzeSales(dataSource);
          break;
        case 'user':
          result = await this.analyzeUserBehavior(dataSource);
          break;
        case 'traffic':
          result = await this.analyzeTraffic(dataSource);
          break;
        case 'recommendation':
          result = await this.analyzeRecommendations(dataSource);
          break;
        default:
          throw new Error('Unsupported analysis type');
      }

      // 保存分析结果
      await dbConnection.execute(
        'INSERT INTO ai_analyses (analysis_type, data_source, result) VALUES (?, ?, ?)',
        [analysisType, dataSource, JSON.stringify(result)]
      );

      // 保存到MongoDB
      await Analysis.create({
        analysisType,
        data: dataSource,
        result
      });

      return result;
    } catch (error) {
      logger.error('Error performing analysis:', error);
      throw error;
    }
  }

  // 销售分析
  async analyzeSales(dataSource) {
    // 模拟销售数据分析
    return {
      totalSales: 1000000,
      averageOrderValue: 250,
      topProducts: [
        { productId: 'P001', name: 'Product 1', sales: 250000 },
        { productId: 'P002', name: 'Product 2', sales: 150000 },
        { productId: 'P003', name: 'Product 3', sales: 100000 }
      ],
      salesTrend: [
        { month: 'Jan', sales: 80000 },
        { month: 'Feb', sales: 85000 },
        { month: 'Mar', sales: 90000 },
        { month: 'Apr', sales: 95000 },
        { month: 'May', sales: 100000 },
        { month: 'Jun', sales: 105000 }
      ]
    };
  }

  // 用户行为分析
  async analyzeUserBehavior(dataSource) {
    // 模拟用户行为分析
    return {
      totalUsers: 100000,
      activeUsers: 75000,
      averageSessionDuration: 120,
      topPages: [
        { page: '/home', visits: 50000 },
        { page: '/products', visits: 40000 },
        { page: '/cart', visits: 30000 }
      ],
      userRetention: {
        day1: 80,
        day7: 60,
        day30: 40
      }
    };
  }

  // 交通分析
  async analyzeTraffic(dataSource) {
    // 模拟交通分析
    return {
      totalTrips: 50000,
      averageTripDuration: 15,
      peakHours: [
        { hour: '7-9', trips: 10000 },
        { hour: '17-19', trips: 12000 }
      ],
      popularRoutes: [
        { route: 'Route 1', trips: 5000 },
        { route: 'Route 2', trips: 4500 },
        { route: 'Route 3', trips: 4000 }
      ]
    };
  }

  // 推荐分析
  async analyzeRecommendations(dataSource) {
    // 模拟推荐分析
    return {
      recommendationAccuracy: 0.85,
      clickThroughRate: 0.15,
      conversionRate: 0.05,
      topRecommendations: [
        { productId: 'P001', recommendationCount: 10000, clickCount: 1500 },
        { productId: 'P002', recommendationCount: 9000, clickCount: 1350 },
        { productId: 'P003', recommendationCount: 8000, clickCount: 1200 }
      ]
    };
  }

  // 获取分析历史
  async getAnalyses(analysisType) {
    try {
      const [rows] = await dbConnection.execute(
        'SELECT * FROM ai_analyses WHERE analysis_type = ? ORDER BY analysis_time DESC',
        [analysisType]
      );

      return rows.map(row => ({
        id: row.id,
        analysisType: row.analysis_type,
        dataSource: row.data_source,
        result: JSON.parse(row.result),
        analysisTime: row.analysis_time
      }));
    } catch (error) {
      logger.error('Error getting analyses:', error);
      throw error;
    }
  }
}

// 智能推荐管理
class RecommendationManager {
  // 获取推荐
  async getRecommendations(userId, recommendationType) {
    try {
      // 模拟推荐算法
      let recommendations;

      switch (recommendationType) {
        case 'products':
          recommendations = await this.recommendProducts(userId);
          break;
        case 'rides':
          recommendations = await this.recommendRides(userId);
          break;
        case 'food':
          recommendations = await this.recommendFood(userId);
          break;
        default:
          throw new Error('Unsupported recommendation type');
      }

      return recommendations;
    } catch (error) {
      logger.error('Error getting recommendations:', error);
      throw error;
    }
  }

  // 推荐商品
  async recommendProducts(userId) {
    // 模拟商品推荐
    return [
      { productId: 'P001', name: 'Product 1', score: 0.95 },
      { productId: 'P002', name: 'Product 2', score: 0.90 },
      { productId: 'P003', name: 'Product 3', score: 0.85 },
      { productId: 'P004', name: 'Product 4', score: 0.80 },
      { productId: 'P005', name: 'Product 5', score: 0.75 }
    ];
  }

  // 推荐行程
  async recommendRides(userId) {
    // 模拟行程推荐
    return [
      { rideId: 'R001', destination: 'Downtown', score: 0.92 },
      { rideId: 'R002', destination: 'Airport', score: 0.88 },
      { rideId: 'R003', destination: 'Shopping Mall', score: 0.85 },
      { rideId: 'R004', destination: 'Park', score: 0.80 },
      { rideId: 'R005', destination: 'Train Station', score: 0.75 }
    ];
  }

  // 推荐美食
  async recommendFood(userId) {
    // 模拟美食推荐
    return [
      { restaurantId: 'F001', name: 'Restaurant 1', score: 0.94 },
      { restaurantId: 'F002', name: 'Restaurant 2', score: 0.90 },
      { restaurantId: 'F003', name: 'Restaurant 3', score: 0.86 },
      { restaurantId: 'F004', name: 'Restaurant 4', score: 0.82 },
      { restaurantId: 'F005', name: 'Restaurant 5', score: 0.78 }
    ];
  }
}

// 初始化服务
async function initService() {
  try {
    await connectDB();
    await initTables();
    await registerService();
    await redisClient.connect();
    
    // 创建模型目录
    const modelsDir = path.join(__dirname, '../models');
    if (!fs.existsSync(modelsDir)) {
      fs.mkdirSync(modelsDir, { recursive: true });
    }

    logger.info('Service initialized successfully');
  } catch (error) {
    logger.error('Service initialization error:', error);
    process.exit(1);
  }
}

// 初始化实例
const modelManager = new ModelManager();
const predictionManager = new PredictionManager();
const analysisManager = new AnalysisManager();
const recommendationManager = new RecommendationManager();

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'ai-service' });
});

// 获取模型列表
app.get('/api/v1/models', async (req, res) => {
  try {
    const models = await modelManager.getModels();
    res.json({ code: 200, data: models });
  } catch (error) {
    logger.error('Error getting models:', error);
    res.status(500).json({ code: 500, message: 'Internal server error' });
  }
});

// 创建模型
app.post('/api/v1/models', async (req, res) => {
  try {
    const { name, type, trainingData } = req.body;

    // 验证请求参数
    const schema = Joi.object({
      name: Joi.string().required(),
      type: Joi.string().required(),
      trainingData: Joi.object().optional()
    });

    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ code: 400, message: error.details[0].message });
    }

    const model = await modelManager.trainModel({ name, type, trainingData });
    res.json({ code: 200, data: model });
  } catch (error) {
    logger.error('Error creating model:', error);
    res.status(400).json({ code: 400, message: error.message });
  }
});

// 删除模型
app.delete('/api/v1/models/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await modelManager.deleteModel(id);
    res.json({ code: 200, data: result });
  } catch (error) {
    logger.error('Error deleting model:', error);
    res.status(400).json({ code: 400, message: error.message });
  }
});

// 执行预测
app.post('/api/v1/predict/:modelId', async (req, res) => {
  try {
    const { modelId } = req.params;
    const inputData = req.body;

    if (!inputData || typeof inputData !== 'object') {
      return res.status(400).json({ code: 400, message: 'Invalid input data' });
    }

    const result = await predictionManager.predict(modelId, inputData);
    res.json({ code: 200, data: result });
  } catch (error) {
    logger.error('Error making prediction:', error);
    res.status(400).json({ code: 400, message: error.message });
  }
});

// 获取预测历史
app.get('/api/v1/predictions/:modelId', async (req, res) => {
  try {
    const { modelId } = req.params;

    const predictions = await predictionManager.getPredictions(modelId);
    res.json({ code: 200, data: predictions });
  } catch (error) {
    logger.error('Error getting predictions:', error);
    res.status(500).json({ code: 500, message: 'Internal server error' });
  }
});

// 执行数据分析
app.post('/api/v1/analyze', async (req, res) => {
  try {
    const { analysisType, dataSource } = req.body;

    // 验证请求参数
    const schema = Joi.object({
      analysisType: Joi.string().required(),
      dataSource: Joi.string().optional()
    });

    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ code: 400, message: error.details[0].message });
    }

    const result = await analysisManager.analyze(analysisType, dataSource);
    res.json({ code: 200, data: result });
  } catch (error) {
    logger.error('Error performing analysis:', error);
    res.status(400).json({ code: 400, message: error.message });
  }
});

// 获取分析历史
app.get('/api/v1/analyses/:analysisType', async (req, res) => {
  try {
    const { analysisType } = req.params;

    const analyses = await analysisManager.getAnalyses(analysisType);
    res.json({ code: 200, data: analyses });
  } catch (error) {
    logger.error('Error getting analyses:', error);
    res.status(500).json({ code: 500, message: 'Internal server error' });
  }
});

// 获取推荐
app.get('/api/v1/recommendations/:userId/:type', async (req, res) => {
  try {
    const { userId, type } = req.params;

    const recommendations = await recommendationManager.getRecommendations(userId, type);
    res.json({ code: 200, data: recommendations });
  } catch (error) {
    logger.error('Error getting recommendations:', error);
    res.status(400).json({ code: 400, message: error.message });
  }
});

// 智能客服
app.post('/api/v1/chatbot', async (req, res) => {
  try {
    const { message, userId } = req.body;

    // 验证请求参数
    const schema = Joi.object({
      message: Joi.string().required(),
      userId: Joi.string().optional()
    });

    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ code: 400, message: error.details[0].message });
    }

    // 模拟智能客服响应
    const response = {
      message: `您的问题是: ${message}`,
      response: '这是智能客服的自动回复，我们会尽快处理您的问题。',
      confidence: 0.95
    };

    res.json({ code: 200, data: response });
  } catch (error) {
    logger.error('Error in chatbot:', error);
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
      logger.info(`AI service running on port ${PORT}`);
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
    await mongoose.disconnect();
    logger.info('Service shut down successfully');
    process.exit(0);
  } catch (error) {
    logger.error('Error during shutdown:', error);
    process.exit(1);
  }
});