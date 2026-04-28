const express = require('express');
const router = express.Router();

/**
 * 代码生成工具模块路由
 * 对应域名: dnpj.laal.top
 * 用途: 代码生成工具入口
 */

// 获取代码生成模板
router.get('/templates', (req, res) => {
  res.json({
    code: 200,
    message: 'success',
    data: [
      {
        id: 1,
        name: 'React组件',
        description: '生成React组件代码',
        language: 'JavaScript',
        category: '前端'
      },
      {
        id: 2,
        name: 'Vue组件',
        description: '生成Vue组件代码',
        language: 'JavaScript',
        category: '前端'
      },
      {
        id: 3,
        name: 'Express API',
        description: '生成Express API代码',
        language: 'JavaScript',
        category: '后端'
      },
      {
        id: 4,
        name: 'MySQL模型',
        description: '生成MySQL模型代码',
        language: 'JavaScript',
        category: '后端'
      }
    ]
  });
});

// 生成代码
router.post('/generate', (req, res) => {
  const { templateId, params } = req.body;
  res.json({
    code: 200,
    message: '代码生成成功',
    data: {
      templateId,
      generatedCode: `// 生成的代码示例
${templateId === 1 ? `import React from 'react';

const ${params.componentName || 'MyComponent'} = () => {
  return (
    <div>
      <h1>Hello, World!</h1>
    </div>
  );
};

export default ${params.componentName || 'MyComponent'};` : templateId === 2 ? `<template>
  <div>
    <h1>Hello, World!</h1>
  </div>
</template>

<script>
export default {
  name: '${params.componentName || 'MyComponent'}'
};
</script>` : templateId === 3 ? `const express = require('express');
const router = express.Router();

router.get('/${params.endpoint || 'test'}', (req, res) => {
  res.json({
    code: 200,
    message: 'success',
    data: {}  
  });
});

module.exports = router;` : `const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('${params.modelName || 'User'}', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    }
  });
};`}`,
      downloadUrl: 'https://dnpj.laal.top/download/code.zip',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    }
  });
});

// 获取代码生成历史
router.get('/history', (req, res) => {
  res.json({
    code: 200,
    message: 'success',
    data: [
      {
        id: 1,
        templateName: 'React组件',
        generatedAt: '2024-01-01T00:00:00Z',
        downloadUrl: 'https://dnpj.laal.top/download/code_1.zip'
      },
      {
        id: 2,
        templateName: 'Express API',
        generatedAt: '2024-01-02T00:00:00Z',
        downloadUrl: 'https://dnpj.laal.top/download/code_2.zip'
      }
    ]
  });
});

// 代码格式化
router.post('/format', (req, res) => {
  const { code, language } = req.body;
  res.json({
    code: 200,
    message: '代码格式化成功',
    data: {
      formattedCode: code.replace(/\s+/g, ' ').trim(),
      language
    }
  });
});

// 代码压缩
router.post('/minify', (req, res) => {
  const { code, language } = req.body;
  res.json({
    code: 200,
    message: '代码压缩成功',
    data: {
      minifiedCode: code.replace(/\s+/g, '').trim(),
      language,
      originalSize: code.length,
      minifiedSize: code.replace(/\s+/g, '').trim().length
    }
  });
});

module.exports = router;