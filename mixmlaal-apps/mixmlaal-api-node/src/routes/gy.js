const express = require('express');
const router = express.Router();

/**
 * 工具模块路由
 * 对应域名: gy.laal.top
 * 用途: 工具模块入口
 */

// 获取工具列表
router.get('/tools', (req, res) => {
  res.json({
    code: 200,
    message: 'success',
    data: [
      {
        id: 1,
        name: 'JSON格式化',
        description: '格式化JSON数据',
        category: '开发工具',
        icon: 'json'
      },
      {
        id: 2,
        name: 'Base64编码解码',
        description: 'Base64编码和解码',
        category: '开发工具',
        icon: 'base64'
      },
      {
        id: 3,
        name: '颜色转换器',
        description: '颜色格式转换',
        category: '设计工具',
        icon: 'color'
      },
      {
        id: 4,
        name: '时间戳转换',
        description: '时间戳与日期转换',
        category: '开发工具',
        icon: 'time'
      },
      {
        id: 5,
        name: 'URL编码解码',
        description: 'URL编码和解码',
        category: '开发工具',
        icon: 'url'
      },
      {
        id: 6,
        name: '正则表达式测试',
        description: '测试正则表达式',
        category: '开发工具',
        icon: 'regex'
      }
    ]
  });
});

// JSON格式化
router.post('/json/format', (req, res) => {
  try {
    const { json } = req.body;
    const parsed = JSON.parse(json);
    const formatted = JSON.stringify(parsed, null, 2);
    res.json({
      code: 200,
      message: '格式化成功',
      data: {
        formatted,
        originalSize: json.length,
        formattedSize: formatted.length
      }
    });
  } catch (error) {
    res.json({
      code: 400,
      message: 'JSON格式错误',
      data: null
    });
  }
});

// Base64编码
router.post('/base64/encode', (req, res) => {
  const { text } = req.body;
  const encoded = Buffer.from(text).toString('base64');
  res.json({
    code: 200,
    message: '编码成功',
    data: {
      original: text,
      encoded
    }
  });
});

// Base64解码
router.post('/base64/decode', (req, res) => {
  try {
    const { encoded } = req.body;
    const decoded = Buffer.from(encoded, 'base64').toString('utf8');
    res.json({
      code: 200,
      message: '解码成功',
      data: {
        encoded,
        decoded
      }
    });
  } catch (error) {
    res.json({
      code: 400,
      message: 'Base64格式错误',
      data: null
    });
  }
});

// 颜色转换
router.post('/color/convert', (req, res) => {
  const { color, fromFormat, toFormat } = req.body;
  res.json({
    code: 200,
    message: '转换成功',
    data: {
      original: color,
      fromFormat,
      toFormat,
      result: color // 模拟转换结果
    }
  });
});

// 时间戳转换
router.post('/time/convert', (req, res) => {
  const { timestamp, toFormat } = req.body;
  const date = new Date(parseInt(timestamp));
  res.json({
    code: 200,
    message: '转换成功',
    data: {
      timestamp,
      date: date.toISOString(),
      formatted: date.toLocaleString()
    }
  });
});

// URL编码
router.post('/url/encode', (req, res) => {
  const { url } = req.body;
  const encoded = encodeURIComponent(url);
  res.json({
    code: 200,
    message: '编码成功',
    data: {
      original: url,
      encoded
    }
  });
});

// URL解码
router.post('/url/decode', (req, res) => {
  const { encoded } = req.body;
  const decoded = decodeURIComponent(encoded);
  res.json({
    code: 200,
    message: '解码成功',
    data: {
      encoded,
      decoded
    }
  });
});

module.exports = router;