# MIXMLAAL API 文档

## 1. 概述

本文档描述了 MIXMLAAL 项目的 API 接口设计，包括认证、用户管理、服务调用等功能。

## 2. 认证 API

### 2.1 注册

**URL**: `/api/v1/auth/register`
**方法**: `POST`
**描述**: 用户注册

**请求体**:
```json
{
  "phone": "13800138000",
  "password": "password123",
  "smsCode": "123456"
}
```

**响应**:
```json
{
  "status": "success",
  "message": "注册成功",
  "data": {
    "userId": "1",
    "phone": "13800138000",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 2.2 登录

**URL**: `/api/v1/auth/login`
**方法**: `POST`
**描述**: 用户登录

**请求体**:
```json
{
  "phone": "13800138000",
  "password": "password123"
}
```

**响应**:
```json
{
  "status": "success",
  "message": "登录成功",
  "data": {
    "userId": "1",
    "phone": "13800138000",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 2.3 刷新令牌

**URL**: `/api/v1/auth/refresh`
**方法**: `POST`
**描述**: 刷新访问令牌

**请求体**:
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**响应**:
```json
{
  "status": "success",
  "message": "令牌刷新成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 2.4 登出

**URL**: `/api/v1/auth/logout`
**方法**: `POST`
**描述**: 用户登出
**认证**: 需要 JWT 令牌

**响应**:
```json
{
  "status": "success",
  "message": "登出成功"
}
```

## 3. 用户 API

### 3.1 获取用户信息

**URL**: `/api/v1/user/profile`
**方法**: `GET`
**描述**: 获取当前用户信息
**认证**: 需要 JWT 令牌

**响应**:
```json
{
  "status": "success",
  "data": {
    "userId": "1",
    "phone": "13800138000",
    "nickname": "张三",
    "gender": "male",
    "email": "zhangsan@example.com",
    "avatar": "https://example.com/avatar.jpg",
    "createdAt": "2023-01-01T00:00:00.000Z"
  }
}
```

### 3.2 更新用户信息

**URL**: `/api/v1/user/profile`
**方法**: `PUT`
**描述**: 更新用户信息
**认证**: 需要 JWT 令牌

**请求体**:
```json
{
  "nickname": "张三",
  "gender": "male",
  "email": "zhangsan@example.com"
}
```

**响应**:
```json
{
  "status": "success",
  "message": "更新成功",
  "data": {
    "userId": "1",
    "phone": "13800138000",
    "nickname": "张三",
    "gender": "male",
    "email": "zhangsan@example.com",
    "avatar": "https://example.com/avatar.jpg",
    "createdAt": "2023-01-01T00:00:00.000Z"
  }
}
```

### 3.3 更新密码

**URL**: `/api/v1/user/password`
**方法**: `PUT`
**描述**: 更新用户密码
**认证**: 需要 JWT 令牌

**请求体**:
```json
{
  "oldPassword": "password123",
  "newPassword": "newpassword123"
}
```

**响应**:
```json
{
  "status": "success",
  "message": "密码更新成功"
}
```

## 4. AI API

### 4.1 智能推荐

**URL**: `/api/v1/ai/recommendations`
**方法**: `GET`
**描述**: 获取智能推荐
**认证**: 需要 JWT 令牌

**查询参数**:
- `algorithm`: 推荐算法类型 (collaborative, content, hybrid)
- `limit`: 推荐数量

**响应**:
```json
{
  "status": "success",
  "data": {
    "recommendations": [
      {
        "id": "1",
        "title": "推荐服务 1",
        "type": "ride",
        "score": 0.95
      },
      {
        "id": "2",
        "title": "推荐服务 2",
        "type": "food",
        "score": 0.92
      }
    ]
  }
}
```

### 4.2 智能客服

**URL**: `/api/v1/ai/chat`
**方法**: `POST`
**描述**: 智能客服聊天
**认证**: 需要 JWT 令牌

**请求体**:
```json
{
  "message": "如何使用打车服务？",
  "type": "general"
}
```

**响应**:
```json
{
  "status": "success",
  "data": {
    "response": "您可以通过以下步骤使用打车服务：1. 打开应用 2. 点击打车图标 3. 输入起点和终点 4. 选择车型 5. 确认叫车"
  }
}
```

## 5. 打车服务 API

### 5.1 叫车

**URL**: `/api/v1/ride/request`
**方法**: `POST`
**描述**: 发起打车请求
**认证**: 需要 JWT 令牌

**请求体**:
```json
{
  "startLocation": {
    "latitude": 39.9042,
    "longitude": 116.4074,
    "address": "北京市东城区"
  },
  "endLocation": {
    "latitude": 39.9142,
    "longitude": 116.4174,
    "address": "北京市西城区"
  },
  "carType": "standard"
}
```

**响应**:
```json
{
  "status": "success",
  "message": "叫车成功",
  "data": {
    "orderId": "1",
    "driverId": "1",
    "driverName": "李四",
    "carNumber": "京A12345",
    "estimatedTime": "5分钟",
    "estimatedPrice": "20元"
  }
}
```

### 5.2 获取行程列表

**URL**: `/api/v1/ride/history`
**方法**: `GET`
**描述**: 获取用户行程列表
**认证**: 需要 JWT 令牌

**响应**:
```json
{
  "status": "success",
  "data": {
    "trips": [
      {
        "id": "1",
        "startLocation": "北京市东城区",
        "endLocation": "北京市西城区",
        "startTime": "2023-01-01T08:00:00.000Z",
        "endTime": "2023-01-01T08:30:00.000Z",
        "price": "25元",
        "status": "completed"
      }
    ]
  }
}
```

## 6. 外卖服务 API

### 6.1 获取商家列表

**URL**: `/api/v1/food/merchants`
**方法**: `GET`
**描述**: 获取附近商家列表

**查询参数**:
- `latitude`: 纬度
- `longitude`: 经度
- `category`: 商家类别
- `page`: 页码
- `limit`: 每页数量

**响应**:
```json
{
  "status": "success",
  "data": {
    "merchants": [
      {
        "id": "1",
        "name": "肯德基",
        "address": "北京市东城区",
        "rating": 4.5,
        "distance": "100米",
        "deliveryTime": "30分钟",
        "minOrder": "20元"
      }
    ],
    "total": 100,
    "page": 1,
    "limit": 10
  }
}
```

### 6.2 下单

**URL**: `/api/v1/food/order`
**方法**: `POST`
**描述**: 提交外卖订单
**认证**: 需要 JWT 令牌

**请求体**:
```json
{
  "merchantId": "1",
  "items": [
    {
      "id": "1",
      "name": "汉堡",
      "quantity": 2,
      "price": 15
    }
  ],
  "addressId": "1",
  "paymentMethod": "wechat"
}
```

**响应**:
```json
{
  "status": "success",
  "message": "下单成功",
  "data": {
    "orderId": "1",
    "totalPrice": "30元",
    "estimatedTime": "30分钟"
  }
}
```

## 7. 商城服务 API

### 7.1 获取商品列表

**URL**: `/api/v1/shop/products`
**方法**: `GET`
**描述**: 获取商品列表

**查询参数**:
- `category`: 商品类别
- `page`: 页码
- `limit`: 每页数量
- `sort`: 排序方式

**响应**:
```json
{
  "status": "success",
  "data": {
    "products": [
      {
        "id": "1",
        "name": "手机",
        "price": "3999元",
        "stock": 100,
        "image": "https://example.com/product.jpg"
      }
    ],
    "total": 100,
    "page": 1,
    "limit": 10
  }
}
```

### 7.2 加入购物车

**URL**: `/api/v1/shop/cart`
**方法**: `POST`
**描述**: 加入购物车
**认证**: 需要 JWT 令牌

**请求体**:
```json
{
  "productId": "1",
  "quantity": 1
}
```

**响应**:
```json
{
  "status": "success",
  "message": "加入购物车成功"
}
```

## 8. 跑腿服务 API

### 8.1 发布任务

**URL**: `/api/v1/errand/task`
**方法**: `POST`
**描述**: 发布跑腿任务
**认证**: 需要 JWT 令牌

**请求体**:
```json
{
  "title": "取快递",
  "description": "取快递并送到家",
  "startLocation": {
    "latitude": 39.9042,
    "longitude": 116.4074,
    "address": "北京市东城区"
  },
  "endLocation": {
    "latitude": 39.9142,
    "longitude": 116.4174,
    "address": "北京市西城区"
  },
  "reward": "20元",
  "deadline": "2023-01-01T12:00:00.000Z"
}
```

**响应**:
```json
{
  "status": "success",
  "message": "任务发布成功",
  "data": {
    "taskId": "1"
  }
}
```

### 8.2 获取任务列表

**URL**: `/api/v1/errand/tasks`
**方法**: `GET`
**描述**: 获取跑腿任务列表

**查询参数**:
- `status`: 任务状态
- `page`: 页码
- `limit`: 每页数量

**响应**:
```json
{
  "status": "success",
  "data": {
    "tasks": [
      {
        "id": "1",
        "title": "取快递",
        "reward": "20元",
        "distance": "2公里",
        "status": "pending"
      }
    ],
    "total": 10,
    "page": 1,
    "limit": 10
  }
}
```

## 9. 内容管理 API

### 9.1 获取内容列表

**URL**: `/api/v1/content`
**方法**: `GET`
**描述**: 获取内容列表
**认证**: 需要 JWT 令牌

**查询参数**:
- `page`: 页码（默认1）
- `limit`: 每页数量（默认10）
- `type`: 内容类型
- `status`: 内容状态
- `search`: 搜索关键词

**响应**:
```json
{
  "success": true,
  "data": {
    "contents": [
      {
        "id": 1,
        "title": "测试内容",
        "content": "内容详情",
        "type": "article",
        "status": "published",
        "authorId": "USER_123",
        "createdAt": "2023-01-01T00:00:00.000Z"
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

### 9.2 获取单个内容

**URL**: `/api/v1/content/:id`
**方法**: `GET`
**描述**: 获取单个内容详情
**认证**: 需要 JWT 令牌

**响应**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "测试内容",
    "content": "内容详情",
    "type": "article",
    "status": "published",
    "authorId": "USER_123",
    "createdAt": "2023-01-01T00:00:00.000Z"
  }
}
```

### 9.3 创建内容

**URL**: `/api/v1/content`
**方法**: `POST`
**描述**: 创建新内容
**认证**: 需要 JWT 令牌

**请求体**:
```json
{
  "title": "新内容",
  "content": "内容详情",
  "type": "article",
  "status": "draft",
  "tags": ["标签1", "标签2"],
  "metadata": {"key": "value"}
}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "新内容",
    "content": "内容详情",
    "type": "article",
    "status": "draft",
    "authorId": "USER_123",
    "createdAt": "2023-01-01T00:00:00.000Z"
  }
}
```

### 9.4 更新内容

**URL**: `/api/v1/content/:id`
**方法**: `PUT`
**描述**: 更新内容
**认证**: 需要 JWT 令牌

**请求体**:
```json
{
  "title": "更新的内容",
  "content": "更新的内容详情",
  "status": "published"
}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "更新的内容",
    "content": "更新的内容详情",
    "type": "article",
    "status": "published",
    "authorId": "USER_123",
    "createdAt": "2023-01-01T00:00:00.000Z"
  }
}
```

### 9.5 删除内容

**URL**: `/api/v1/content/:id`
**方法**: `DELETE`
**描述**: 删除内容
**认证**: 需要 JWT 令牌

**响应**:
```json
{
  "success": true,
  "message": "内容删除成功"
}
```

## 10. AI 服务 API

### 10.1 AI聊天接口

**URL**: `/api/v1/ai/chat`
**方法**: `POST`
**描述**: AI聊天接口
**认证**: 需要 JWT 令牌和 API 密钥

**请求体**:
```json
{
  "message": "Hello, AI!",
  "model": "gpt-3.5-turbo"
}
```

**响应**:
```json
{
  "code": 200,
  "message": "聊天请求处理成功",
  "data": {
    "id": "chat-1234567890",
    "model": "gpt-3.5-turbo",
    "message": "AI响应: Hello, AI!",
    "timestamp": "2023-01-01T00:00:00.000Z"
  }
}
```

### 10.2 AI图像生成接口

**URL**: `/api/v1/ai/image`
**方法**: `POST`
**描述**: AI图像生成接口
**认证**: 需要 JWT 令牌和 API 密钥

**请求体**:
```json
{
  "prompt": "一只可爱的猫",
  "size": "1024x1024"
}
```

**响应**:
```json
{
  "code": 200,
  "message": "图像生成请求处理成功",
  "data": {
    "id": "image-1234567890",
    "prompt": "一只可爱的猫",
    "size": "1024x1024",
    "imageUrl": "https://api.example.com/images/1234567890.png",
    "timestamp": "2023-01-01T00:00:00.000Z"
  }
}
```

### 10.3 AI语音转文本接口

**URL**: `/api/v1/ai/speech-to-text`
**方法**: `POST`
**描述**: AI语音转文本接口
**认证**: 需要 JWT 令牌和 API 密钥

**请求体**:
```json
{
  "audioUrl": "https://example.com/audio.mp3",
  "language": "zh-CN"
}
```

**响应**:
```json
{
  "code": 200,
  "message": "语音转文本请求处理成功",
  "data": {
    "id": "speech-1234567890",
    "audioUrl": "https://example.com/audio.mp3",
    "language": "zh-CN",
    "text": "这是一段语音转文本的示例内容",
    "timestamp": "2023-01-01T00:00:00.000Z"
  }
}
```

### 10.4 AI文本转语音接口

**URL**: `/api/v1/ai/text-to-speech`
**方法**: `POST`
**描述**: AI文本转语音接口
**认证**: 需要 JWT 令牌和 API 密钥

**请求体**:
```json
{
  "text": "这是一段文本转语音的示例内容",
  "voice": "default"
}
```

**响应**:
```json
{
  "code": 200,
  "message": "文本转语音请求处理成功",
  "data": {
    "id": "tts-1234567890",
    "text": "这是一段文本转语音的示例内容",
    "voice": "default",
    "audioUrl": "https://api.example.com/audio/1234567890.mp3",
    "timestamp": "2023-01-01T00:00:00.000Z"
  }
}
```

### 10.5 AI翻译接口

**URL**: `/api/v1/ai/translate`
**方法**: `POST`
**描述**: AI翻译接口
**认证**: 需要 JWT 令牌和 API 密钥

**请求体**:
```json
{
  "text": "Hello, world!",
  "source": "auto",
  "target": "zh-CN"
}
```

**响应**:
```json
{
  "code": 200,
  "message": "翻译请求处理成功",
  "data": {
    "id": "translate-1234567890",
    "text": "Hello, world!",
    "source": "auto",
    "target": "zh-CN",
    "translatedText": "你好，世界！",
    "timestamp": "2023-01-01T00:00:00.000Z"
  }
}
```

### 10.6 AI分析接口

**URL**: `/api/v1/ai/analyze`
**方法**: `POST`
**描述**: AI分析接口
**认证**: 需要 JWT 令牌和 API 密钥

**请求体**:
```json
{
  "text": "这个产品非常好，我很喜欢",
  "type": "sentiment"
}
```

**响应**:
```json
{
  "code": 200,
  "message": "分析请求处理成功",
  "data": {
    "id": "analyze-1234567890",
    "text": "这个产品非常好，我很喜欢",
    "type": "sentiment",
    "result": {
      "sentiment": "positive",
      "score": 0.85
    },
    "timestamp": "2023-01-01T00:00:00.000Z"
  }
}
```

## 11. 合规服务 API

### 11.1 合规检查接口

**URL**: `/api/v1/compliance/check`
**方法**: `POST`
**描述**: 合规检查接口
**认证**: 需要 JWT 令牌

**请求体**:
```json
{
  "type": "data-privacy",
  "data": {"userId": "123"}
}
```

**响应**:
```json
{
  "code": 200,
  "message": "合规检查请求处理成功",
  "data": {
    "id": "compliance-1234567890",
    "type": "data-privacy",
    "status": "compliant",
    "message": "合规检查通过",
    "timestamp": "2023-01-01T00:00:00.000Z"
  }
}
```

### 11.2 合规配置接口

**URL**: `/api/v1/compliance/config`
**方法**: `GET`
**描述**: 合规配置接口
**认证**: 需要 JWT 令牌

**响应**:
```json
{
  "code": 200,
  "message": "合规配置获取成功",
  "data": {
    "id": "compliance-config",
    "version": "0.0.0.4",
    "rules": [
      {
        "id": "rule-1",
        "name": "数据隐私保护",
        "description": "保护用户数据隐私",
        "status": "enabled"
      },
      {
        "id": "rule-2",
        "name": "支付合规",
        "description": "反洗钱合规检查",
        "status": "enabled"
      },
      {
        "id": "rule-3",
        "name": "人车双证校验",
        "description": "网约车人车双证校验",
        "status": "enabled"
      },
      {
        "id": "rule-4",
        "name": "抽成上限管控",
        "description": "抽成上限27%管控",
        "status": "enabled"
      }
    ],
    "timestamp": "2023-01-01T00:00:00.000Z"
  }
}
```

### 11.3 合规报告接口

**URL**: `/api/v1/compliance/report`
**方法**: `POST`
**描述**: 合规报告接口
**认证**: 需要 JWT 令牌和管理员权限

**请求体**:
```json
{
  "startDate": "2023-01-01",
  "endDate": "2023-01-31",
  "type": "all"
}
```

**响应**:
```json
{
  "code": 200,
  "message": "合规报告生成成功",
  "data": {
    "id": "report-1234567890",
    "startDate": "2023-01-01",
    "endDate": "2023-01-31",
    "type": "all",
    "totalChecks": 1000,
    "compliantChecks": 950,
    "nonCompliantChecks": 50,
    "complianceRate": 95,
    "details": [
      {
        "category": "数据隐私",
        "compliant": 98,
        "nonCompliant": 2,
        "rate": 98
      },
      {
        "category": "支付合规",
        "compliant": 96,
        "nonCompliant": 4,
        "rate": 96
      },
      {
        "category": "人车双证",
        "compliant": 94,
        "nonCompliant": 6,
        "rate": 94
      },
      {
        "category": "抽成管控",
        "compliant": 92,
        "nonCompliant": 8,
        "rate": 92
      }
    ],
    "timestamp": "2023-01-01T00:00:00.000Z"
  }
}
```

### 11.4 合规日志接口

**URL**: `/api/v1/compliance/logs`
**方法**: `GET`
**描述**: 合规日志接口
**认证**: 需要 JWT 令牌和管理员权限

**查询参数**:
- `startDate`: 开始日期
- `endDate`: 结束日期
- `type`: 日志类型

**响应**:
```json
{
  "code": 200,
  "message": "合规日志获取成功",
  "data": {
    "logs": [
      {
        "id": "log-1",
        "type": "data-privacy",
        "message": "用户数据隐私检查通过",
        "status": "success",
        "timestamp": "2023-01-01T00:00:00.000Z"
      },
      {
        "id": "log-2",
        "type": "payment",
        "message": "支付交易合规检查通过",
        "status": "success",
        "timestamp": "2023-01-01T00:00:00.000Z"
      }
    ],
    "total": 2
  }
}
```

### 11.5 合规规则管理接口

**URL**: `/api/v1/compliance/rules`
**方法**: `POST`
**描述**: 合规规则管理接口
**认证**: 需要 JWT 令牌和管理员权限

**请求体**:
```json
{
  "action": "create",
  "rule": {
    "name": "新规则",
    "description": "新规则描述",
    "status": "enabled"
  }
}
```

**响应**:
```json
{
  "code": 200,
  "message": "合规规则管理请求处理成功",
  "data": {
    "id": "rule-1234567890",
    "action": "create",
    "rule": {
      "name": "新规则",
      "description": "新规则描述",
      "status": "enabled"
    },
    "status": "success",
    "message": "规则创建成功",
    "timestamp": "2023-01-01T00:00:00.000Z"
  }
}
```

## 12. 权限管理 API

### 12.1 获取权限列表

**URL**: `/api/v1/permission/permissions`
**方法**: `GET`
**描述**: 获取权限列表
**认证**: 需要 JWT 令牌，且角色为 admin

**响应**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "用户管理",
      "code": "user:manage",
      "description": "管理用户信息",
      "category": "用户"
    }
  ]
}
```

### 12.2 创建权限

**URL**: `/api/v1/permission/permissions`
**方法**: `POST`
**描述**: 创建新权限
**认证**: 需要 JWT 令牌，且角色为 admin

**请求体**:
```json
{
  "name": "内容管理",
  "code": "content:manage",
  "description": "管理内容信息",
  "category": "内容"
}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "内容管理",
    "code": "content:manage",
    "description": "管理内容信息",
    "category": "内容"
  }
}
```

### 12.3 获取角色列表

**URL**: `/api/v1/permission/roles`
**方法**: `GET`
**描述**: 获取角色列表
**认证**: 需要 JWT 令牌，且角色为 admin

**响应**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "超级管理员",
      "code": "super_admin",
      "description": "拥有所有权限的超级管理员"
    }
  ]
}
```

### 12.4 创建角色

**URL**: `/api/v1/permission/roles`
**方法**: `POST`
**描述**: 创建新角色
**认证**: 需要 JWT 令牌，且角色为 admin

**请求体**:
```json
{
  "name": "编辑",
  "code": "editor",
  "description": "拥有编辑权限的角色",
  "permissions": [1, 2, 3]
}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "编辑",
    "code": "editor",
    "description": "拥有编辑权限的角色"
  }
}
```

### 12.5 分配角色权限

**URL**: `/api/v1/permission/roles/:id/permissions`
**方法**: `POST`
**描述**: 为角色分配权限
**认证**: 需要 JWT 令牌，且角色为 admin

**请求体**:
```json
{
  "permissions": [1, 2, 3]
}
```

**响应**:
```json
{
  "success": true,
  "message": "权限分配成功"
}
```

## 13. 通用 API

### 13.1 健康检查

**URL**: `/api/v1/health`
**方法**: `GET`
**描述**: 服务健康检查

**响应**:
```json
{
  "status": "success",
  "data": {
    "service": "api-gateway",
    "status": "healthy",
    "timestamp": "2023-01-01T00:00:00.000Z",
    "services": {
      "user": "healthy",
      "ride": "healthy",
      "food": "healthy"
    }
  }
}
```

### 13.2 获取配置

**URL**: `/api/v1/common/config`
**方法**: `GET`
**描述**: 获取系统配置

**响应**:
```json
{
  "status": "success",
  "data": {
    "appVersion": "1.0.0",
    "minAppVersion": "1.0.0",
    "features": {
      "ride": true,
      "food": true,
      "mall": true,
      "errand": true
    }
  }
}
```

### 13.3 获取告警历史

**URL**: `/api/v1/alerts`
**方法**: `GET`
**描述**: 获取系统告警历史

**查询参数**:
- `limit`: 限制数量（默认50）

**响应**:
```json
{
  "status": "success",
  "data": [
    {
      "level": "warning",
      "message": "CPU负载警告: 85%",
      "timestamp": "2023-01-01T00:00:00.000Z"
    },
    {
      "level": "critical",
      "message": "内存使用率过高: 95%",
      "timestamp": "2023-01-01T00:05:00.000Z"
    }
  ]
}
```

## 14. 会员和积分系统 API

### 14.1 会员等级相关接口

#### 14.1.1 获取所有会员等级

**URL**: `/api/v1/membership/levels`
**方法**: `GET`
**描述**: 获取所有会员等级

**响应**:
```json
{
  "code": 200,
  "message": "获取会员等级列表成功",
  "data": [
    {
      "id": 1,
      "name": "普通会员",
      "level": "normal",
      "price": 0,
      "duration": 0,
      "discount": 0,
      "pointsMultiplier": 1.0,
      "benefits": "基础权益"
    },
    {
      "id": 2,
      "name": "青铜会员",
      "level": "bronze",
      "price": 99,
      "duration": 30,
      "discount": 5,
      "pointsMultiplier": 1.2,
      "benefits": "5%折扣，1.2倍积分"
    }
  ]
}
```

#### 14.1.2 获取单个会员等级

**URL**: `/api/v1/membership/levels/:id`
**方法**: `GET`
**描述**: 获取单个会员等级详情

**响应**:
```json
{
  "code": 200,
  "message": "获取会员等级成功",
  "data": {
    "id": 2,
    "name": "青铜会员",
    "level": "bronze",
    "price": 99,
    "duration": 30,
    "discount": 5,
    "pointsMultiplier": 1.2,
    "benefits": "5%折扣，1.2倍积分"
  }
}
```

### 14.2 会员相关接口

#### 14.2.1 获取用户会员信息

**URL**: `/api/v1/membership/user`
**方法**: `GET`
**描述**: 获取当前用户的会员信息
**认证**: 需要 JWT 令牌

**响应**:
```json
{
  "code": 200,
  "message": "获取用户会员信息成功",
  "data": {
    "id": 1,
    "name": "张三",
    "membershipLevel": "bronze",
    "membershipExpiry": "2023-12-31T00:00:00.000Z"
  }
}
```

#### 14.2.2 升级会员等级

**URL**: `/api/v1/membership/upgrade`
**方法**: `POST`
**描述**: 升级用户会员等级
**认证**: 需要 JWT 令牌

**请求体**:
```json
{
  "levelId": 2
}
```

**响应**:
```json
{
  "code": 200,
  "message": "升级会员等级成功",
  "data": {
    "membershipLevel": "bronze",
    "membershipExpiry": "2023-12-31T00:00:00.000Z"
  }
}
```

#### 14.2.3 续费会员

**URL**: `/api/v1/membership/renew`
**方法**: `POST`
**描述**: 续费会员
**认证**: 需要 JWT 令牌

**请求体**:
```json
{
  "months": 3
}
```

**响应**:
```json
{
  "code": 200,
  "message": "续费会员成功",
  "data": {
    "membershipExpiry": "2024-03-31T00:00:00.000Z"
  }
}
```

### 14.3 积分相关接口

#### 14.3.1 获取用户积分

**URL**: `/api/v1/membership/points`
**方法**: `GET`
**描述**: 获取当前用户的积分
**认证**: 需要 JWT 令牌

**响应**:
```json
{
  "code": 200,
  "message": "获取用户积分成功",
  "data": {
    "id": 1,
    "name": "张三",
    "points": 1000
  }
}
```

#### 14.3.2 获取积分历史

**URL**: `/api/v1/membership/points/history`
**方法**: `GET`
**描述**: 获取用户的积分历史
**认证**: 需要 JWT 令牌

**查询参数**:
- `page`: 页码（默认1）
- `pageSize`: 每页数量（默认10）

**响应**:
```json
{
  "code": 200,
  "message": "获取积分历史成功",
  "data": {
    "items": [
      {
        "id": 1,
        "userId": 1,
        "points": 100,
        "type": "earn",
        "reason": "首次注册奖励",
        "orderId": null,
        "createdAt": "2023-01-01T00:00:00.000Z"
      },
      {
        "id": 2,
        "userId": 1,
        "points": -50,
        "type": "spend",
        "reason": "兑换优惠券",
        "orderId": null,
        "createdAt": "2023-01-02T00:00:00.000Z"
      }
    ],
    "total": 2,
    "page": 1,
    "pageSize": 10
  }
}
```

#### 14.3.3 增加积分

**URL**: `/api/v1/membership/points/earn`
**方法**: `POST`
**描述**: 增加用户积分
**认证**: 需要 JWT 令牌

**请求体**:
```json
{
  "points": 100,
  "reason": "完成订单奖励",
  "orderId": 1
}
```

**响应**:
```json
{
  "code": 200,
  "message": "增加积分成功",
  "data": {
    "points": 1050
  }
}
```

#### 14.3.4 消耗积分

**URL**: `/api/v1/membership/points/spend`
**方法**: `POST`
**描述**: 消耗用户积分
**认证**: 需要 JWT 令牌

**请求体**:
```json
{
  "points": 50,
  "reason": "兑换优惠券",
  "orderId": null
}
```

**响应**:
```json
{
  "code": 200,
  "message": "消耗积分成功",
  "data": {
    "points": 1000
  }
}
```

## 15. 错误码

| 错误码 | 描述 |
|-------|------|
| 400 | 请求参数错误 |
| 401 | 未授权 |
| 403 | 禁止访问 |
| 404 | 资源不存在 |
| 429 | 请求过于频繁 |
| 500 | 服务器内部错误 |
| 503 | 服务不可用 |

## 16. 认证方式

所有需要认证的 API 接口都需要在请求头中添加 `Authorization` 字段，格式为 `Bearer {token}`。

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
