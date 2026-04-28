/**
 * Swagger 配置
 * 版本: v1.0.0.0
 * 说明: Swagger/OpenAPI 文档配置
 */

const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// Swagger 配置选项
const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'MIXMLAAL API',
      version: '1.0.0.0',
      description: 'MIXMLAAL 后端API文档',
      contact: {
        name: 'MIXMLAAL Team',
        email: 'admin@mixmlaal.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:3001/api/v1',
        description: '开发环境',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT认证',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            userId: {
              type: 'string',
              description: '用户ID',
            },
            phone: {
              type: 'string',
              description: '手机号',
            },
            email: {
              type: 'string',
              description: '邮箱',
            },
            nickname: {
              type: 'string',
              description: '昵称',
            },
            avatar: {
              type: 'string',
              description: '头像',
            },
            level: {
              type: 'integer',
              description: '用户等级',
            },
            points: {
              type: 'integer',
              description: '积分',
            },
            balance: {
              type: 'number',
              description: '余额',
            },
            status: {
              type: 'integer',
              description: '状态',
            },
          },
        },
        Order: {
          type: 'object',
          properties: {
            orderId: {
              type: 'string',
              description: '订单ID',
            },
            userId: {
              type: 'string',
              description: '用户ID',
            },
            type: {
              type: 'string',
              description: '订单类型',
            },
            status: {
              type: 'string',
              description: '订单状态',
            },
            amount: {
              type: 'number',
              description: '订单金额',
            },
            createdAt: {
              type: 'string',
              description: '创建时间',
            },
            updatedAt: {
              type: 'string',
              description: '更新时间',
            },
          },
        },
        Product: {
          type: 'object',
          properties: {
            productId: {
              type: 'string',
              description: '商品ID',
            },
            name: {
              type: 'string',
              description: '商品名称',
            },
            description: {
              type: 'string',
              description: '商品描述',
            },
            price: {
              type: 'number',
              description: '商品价格',
            },
            originalPrice: {
              type: 'number',
              description: '原价',
            },
            image: {
              type: 'string',
              description: '商品图片',
            },
            category: {
              type: 'string',
              description: '商品分类',
            },
            stock: {
              type: 'integer',
              description: '库存',
            },
            sales: {
              type: 'integer',
              description: '销量',
            },
            rating: {
              type: 'number',
              description: '评分',
            },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.js'], // 扫描路由文件
};

// 生成Swagger文档
const specs = swaggerJsdoc(options);

// 导出Swagger配置
module.exports = {
  swaggerUi,
  specs,
};
