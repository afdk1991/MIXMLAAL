const express = require('express');
const router = express.Router();

/**
 * 帮助中心模块路由
 * 对应域名: help.laal.top
 * 用途: 帮助中心入口
 */

// 获取帮助分类
router.get('/categories', (req, res) => {
  res.json({
    code: 200,
    message: 'success',
    data: [
      { id: 1, name: '账户管理', icon: 'user' },
      { id: 2, name: '购物指南', icon: 'shopping' },
      { id: 3, name: '支付方式', icon: 'payment' },
      { id: 4, name: '配送服务', icon: 'delivery' },
      { id: 5, name: '售后服务', icon: 'service' },
      { id: 6, name: '常见问题', icon: 'question' }
    ]
  });
});

// 获取帮助文章列表
router.get('/articles', (req, res) => {
  const { categoryId, page = 1, pageSize = 10 } = req.query;
  res.json({
    code: 200,
    message: 'success',
    data: {
      total: 100,
      page: parseInt(page),
      pageSize: parseInt(pageSize),
      articles: [
        {
          id: 1,
          title: '如何注册账户',
          categoryId: 1,
          categoryName: '账户管理',
          summary: '详细介绍注册账户的步骤和注意事项',
          views: 1000,
          createdAt: '2024-01-01T00:00:00Z'
        },
        {
          id: 2,
          title: '如何修改密码',
          categoryId: 1,
          categoryName: '账户管理',
          summary: '详细介绍修改密码的方法',
          views: 800,
          createdAt: '2024-01-02T00:00:00Z'
        },
        {
          id: 3,
          title: '购物流程',
          categoryId: 2,
          categoryName: '购物指南',
          summary: '详细介绍购物的完整流程',
          views: 1200,
          createdAt: '2024-01-03T00:00:00Z'
        }
      ]
    }
  });
});

// 获取帮助文章详情
router.get('/articles/:id', (req, res) => {
  const { id } = req.params;
  res.json({
    code: 200,
    message: 'success',
    data: {
      id: parseInt(id),
      title: '如何注册账户',
      categoryId: 1,
      categoryName: '账户管理',
      content: `# 如何注册账户

## 步骤1：访问注册页面

打开拉阿狸官网，点击右上角的"注册"按钮。

## 步骤2：填写注册信息

- 输入手机号码
- 设置密码
- 输入验证码
- 同意用户协议

## 步骤3：完成注册

点击"注册"按钮，完成注册流程。

## 注意事项

- 密码长度至少8位
- 手机号码必须真实有效
- 验证码有效期为5分钟`,
      views: 1001,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    }
  });
});

// 搜索帮助文章
router.get('/search', (req, res) => {
  const { keyword } = req.query;
  res.json({
    code: 200,
    message: 'success',
    data: [
      {
        id: 1,
        title: '如何注册账户',
        categoryName: '账户管理',
        summary: '详细介绍注册账户的步骤和注意事项'
      },
      {
        id: 4,
        title: '如何找回密码',
        categoryName: '账户管理',
        summary: '详细介绍找回密码的方法'
      }
    ]
  });
});

// 提交问题
router.post('/questions', (req, res) => {
  const { title, content, contact } = req.body;
  res.json({
    code: 200,
    message: '问题提交成功',
    data: {
      id: 1,
      title,
      content,
      contact,
      status: 'pending',
      createdAt: new Date().toISOString()
    }
  });
});

// 获取常见问题
router.get('/faq', (req, res) => {
  res.json({
    code: 200,
    message: 'success',
    data: [
      {
        id: 1,
        question: '如何注册账户？',
        answer: '打开拉阿狸官网，点击右上角的"注册"按钮，填写相关信息即可。'
      },
      {
        id: 2,
        question: '如何修改密码？',
        answer: '登录账户后，进入"个人中心"，点击"修改密码"即可。'
      },
      {
        id: 3,
        question: '支持哪些支付方式？',
        answer: '支持支付宝、微信支付、银行卡等多种支付方式。'
      }
    ]
  });
});

module.exports = router;