const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// Swagger配置
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: '前置仓轻客配送系统API',
      description: '前置仓轻客配送系统的API文档',
      version: '1.0.0',
    },
    servers: [
      {
        url: 'http://localhost:8080',
        description: '本地开发服务器',
      },
    ],
  },
  apis: ['./src/routes/*.js', './src/controllers/*.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// 导出Swagger配置
module.exports = {
  swaggerSpec,
  swaggerUi,
};

// 生成Swagger文档
if (require.main === module) {
  console.log('生成Swagger文档...');
  console.log(swaggerSpec);
  console.log('Swagger文档生成成功！');
}