# MIXMLAAL 小程序

## 项目简介

MIXMLAAL是一款一站式出行生活服务平台小程序，集成了网约车、电商购物、支付、司机端等核心功能，支持微信、支付宝、百度、抖音等多平台运行。

## 功能模块

### 用户端
- **首页** - 服务入口、快速叫车、热门商品
- **出行** - 网约车叫车、行程管理
- **商城** - 商品浏览、购物车、下单
- **我的** - 个人中心、订单、钱包、优惠券

### 司机端
- **司机中心** - 在线接单、订单管理、收入统计

## 多平台支持

| 平台 | 状态 | 说明 |
|------|------|------|
| 微信小程序 | ✅ 已上线 | 生态最成熟，私域流量运营首选 |
| 支付宝小程序 | ✅ 已适配 | 支付信任+金融服务能力强 |
| 百度智能小程序 | ✅ 已适配 | 搜索流量入口，AI能力集成 |
| 抖音小程序 | ✅ 已适配 | 内容电商爆发，流量红利明显 |
| 快手小程序 | 🔲 待开发 | 下沉市场+直播电商 |
| 鸿蒙原子化服务 | 🔲 待开发 | 华为生态，跨设备协同 |

详细平台信息请参考 [docs/小程序平台大全.md](../docs/小程序平台大全.md)。

## 技术栈
- 微信小程序原生开发
- JavaScript ES6+
- WXSS/CSS3
- UniApp/Taro（多端框架）

## 项目结构
```
miniapp/
├── components/          # 公共组件
│   ├── loading/        # 加载组件
│   ├── navbar/         # 导航栏组件
│   ├── order-card/     # 订单卡片
│   └── product-card/   # 商品卡片
├── pages/              # 页面
│   ├── index/          # 首页
│   ├── ride/           # 叫车
│   ├── shop/           # 商城
│   ├── cart/           # 购物车
│   ├── user/           # 个人中心
│   ├── order/          # 订单
│   ├── payment/        # 支付
│   ├── wallet/         # 钱包
│   ├── coupon/         # 优惠券
│   ├── driver/         # 司机端
│   └── ...
├── platforms/          # 平台适配器
│   ├── adapter.js      # 统一适配器
│   ├── wechat/         # 微信配置
│   ├── alipay/         # 支付宝配置
│   ├── baidu/          # 百度配置
│   └── bytedance/      # 抖音配置
├── utils/              # 工具类
│   ├── request.js      # 网络请求
│   ├── api.js          # API接口
│   ├── util.js         # 工具函数
│   ├── storage.js      # 存储管理
│   └── auth.js         # 认证管理
├── app.js              # 应用入口
├── app.json            # 应用配置
└── sitemap.json        # 站点地图
```

## 平台适配器使用

项目使用统一的平台适配器 (`platforms/adapter.js`)，自动识别并适配不同小程序平台：

```javascript
const platform = require('./platforms/adapter.js');

// 请求网络
platform.request({
  url: 'https://api.example.com/data',
  success: (res) => {
    console.log(res.data);
  }
});

// 显示提示
platform.showToast({
  title: '操作成功',
  icon: 'success'
});

// 存储数据
platform.setStorageSync('token', 'your-token');
const token = platform.getStorageSync('token');
```

## 本地预览步骤

### 微信小程序
1. 安装微信开发者工具：https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html
2. 打开微信开发者工具，点击"导入项目"
3. 选择项目目录：`f:\wp.laal.top_iMBh4\mixmlaal-app\miniapp`
4. 填写AppID（测试可使用测试号）
5. 点击"导入"

### 其他平台
使用对应平台的开发者工具导入 `miniapp` 目录即可。

## 注意事项
1. 首次使用需要在 `app.js` 中配置正确的 `baseUrl`
2. 部分功能需要后端API支持
3. 地图功能需要申请腾讯地图Key并在小程序后台配置

## 后端API接口

### 认证相关
- POST /auth/login - 用户登录
- POST /auth/register - 用户注册
- POST /auth/wechat - 微信登录

### 用户相关
- GET /user/profile - 获取用户信息
- POST /user/profile - 更新用户信息
- GET /user/wallet - 获取钱包信息
- GET /user/coupons - 获取优惠券

### 出行相关
- POST /ride/estimate - 预估价格
- POST /ride/request - 发起叫车
- GET /ride/{id}/status - 获取行程状态

### 商城相关
- GET /shop/categories - 获取分类
- GET /shop/products - 获取商品列表
- GET /shop/product/{id} - 获取商品详情

### 订单相关
- GET /order/list - 获取订单列表
- GET /order/{id}/detail - 获取订单详情
- POST /order/{id}/cancel - 取消订单

### 支付相关
- POST /payment/create - 创建支付
- GET /payment/wechat/{orderId} - 获取微信支付参数

## 更新日志
### v1.0.0
- 初始版本发布
- 完成用户端核心功能
- 完成司机端基础功能
- 完成微信、支付宝、百度、抖音四平台适配
