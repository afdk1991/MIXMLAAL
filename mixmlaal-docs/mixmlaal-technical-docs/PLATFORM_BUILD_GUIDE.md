# MIXMLAAL 多平台构建指南

## 概述

本项目支持以下移动平台：
- **Android** (通过 Capacitor)
- **iOS** (通过 Capacitor)
- **鸿蒙系统 (HarmonyOS)**
- **微信小程序**
- **支付宝小程序**
- **百度小程序**
- **字节跳动小程序 (抖音/今日头条)**
- **拼多多小程序**
- **美团小程序**
- **QQ小程序**
- **快手小程序**

## 快速开始

### 安装依赖

```bash
npm install
```

### 全平台构建

```bash
npm run build:all
```

## 各平台构建说明

### 1. Web 应用

```bash
npm run build
```

输出目录: `dist/`

### 2. Android 应用

```bash
# 首次添加平台
npx cap add android

# 同步资源
npx cap sync android

# 打开 Android Studio
npx cap open android
```

### 3. iOS 应用 (仅 macOS)

```bash
# 首次添加平台
npx cap add ios

# 同步资源
npx cap sync ios

# 打开 Xcode
npx cap open ios
```

### 4. 鸿蒙系统应用

```bash
npm run build:harmony
```

输出目录: `harmony/`

使用 DevEco Studio 打开 `harmony/` 目录进行开发和构建。

### 5. 多平台小程序

```bash
npm run build:miniapp
```

输出目录: `dist-miniapp/`

包含以下平台:
- `dist-miniapp/wechat/` - 微信小程序
- `dist-miniapp/alipay/` - 支付宝小程序
- `dist-miniapp/baidu/` - 百度小程序
- `dist-miniapp/bytedance/` - 字节跳动小程序
- `dist-miniapp/pinduoduo/` - 拼多多小程序
- `dist-miniapp/meituan/` - 美团小程序
- `dist-miniapp/qq/` - QQ小程序
- `dist-miniapp/kuaishou/` - 快手小程序

## 小程序平台策略（三大业务方向）

根据电商、本地生活、内容三大业务方向，配置最适配、流量最稳的小程序平台优先级。

### 一、电商类（卖货/带货/商城）

| 优先级 | 平台 | 适用场景 | 核心优势 |
|-------|------|---------|---------|
| 1 | **微信小程序** | 私域运营、复购裂变 | 朋友圈/社群/视频号联动，复购和裂变最成熟 |
| 2 | **抖音小程序** | 直播带货、短视频种草 | 即时转化极强，适合爆品、直播电商 |
| 3 | **快手小程序** | 下沉市场电商 | 直播带货转化稳定，客单价偏低但走量快 |
| 4 | **支付宝小程序** | 高客单价、本地零售 | 信任度高，适合生鲜到家、本地零售 |
| 5 | **拼多多小程序** | 社交拼团、低价日用 | 纯社交拼团、低价走量，适合农产品 |

### 二、本地生活类（餐饮/到店/团购/同城服务）

| 优先级 | 平台 | 适用场景 | 核心优势 |
|-------|------|---------|---------|
| 1 | **微信小程序** | 到店核销、会员运营 | 社群运营、附近的小程序引流，本地商家标配 |
| 2 | **抖音小程序** | 探店、团购、LBS | 同城流量，LBS精准推送给周边用户 |
| 3 | **支付宝小程序** | 支付即会员、外卖到店 | 城市服务入口，官方扶持多 |
| 4 | **百度智能小程序** | 搜索找店、地图引流 | 靠"搜索+地图"抓附近主动找店的用户 |
| 5 | **美团小程序** | 餐饮、丽人、休闲娱乐 | 成熟本地生活生态 |

### 三、内容类（资讯/短视频/图文/知识付费）

| 优先级 | 平台 | 适用场景 | 核心优势 |
|-------|------|---------|---------|
| 1 | **微信小程序** | 粉丝沉淀、知识付费 | 绑定公众号/视频号，社群传播，适合长文 |
| 2 | **抖音/头条小程序** | 信息流推荐、曝光 | 短视频挂载内容，流量大、曝光快 |
| 3 | **百度智能小程序** | 搜索流量、工具型内容 | 靠搜索关键词获取内容流量 |
| 4 | **QQ小程序** | 年轻用户、轻内容 | 年轻用户集中，适合二次元/娱乐向 |
| 5 | **快手小程序** | 泛内容、下沉用户 | 接地气的泛内容，下沉用户粘性高 |

### 四、综合推荐方案

| 需求场景 | 推荐组合 | 说明 |
|---------|---------|------|
| 稳+私域 | 微信小程序 | 私域运营最强，复购和裂变最成熟 |
| 流量+爆单 | 抖音小程序 | 直播带货、短视频种草，即时转化极强 |
| 本地到店 | 微信 + 抖音 + 支付宝 | 三端覆盖到店核销、团购、LBS |
| 全网覆盖 | uni-app 一次开发 | 一套代码发布到所有平台 |

### 五、平台适配说明

小程序使用统一的平台适配器 (`miniapp/platforms/adapter.js`)，自动识别并适配不同小程序平台。

## 环境要求

- Node.js >= 18.0.0
- npm >= 8.0.0

### Android 开发
- Android Studio
- JDK 11+
- Android SDK API 21+

### iOS 开发
- macOS
- Xcode 14+
- CocoaPods

### 鸿蒙开发
- DevEco Studio
- HarmonyOS SDK 4.0+

### 小程序开发
- 对应平台开发者工具

## 项目结构

```
mixmlaal-app/
├── android/              # Android 原生代码
├── ios/                  # iOS 原生代码
├── harmony/              # 鸿蒙应用项目
├── miniapp/              # 小程序源码
│   ├── platforms/        # 各平台配置
│   │   ├── wechat/
│   │   ├── alipay/
│   │   ├── baidu/
│   │   ├── bytedance/
│   │   ├── pinduoduo/
│   │   ├── meituan/
│   │   ├── qq/
│   │   └── kuaishou/
│   └── adapter.js        # 平台适配器
├── dist/                 # Web 构建输出
├── dist-miniapp/         # 小程序构建输出
└── scripts/
    └── build/            # 构建脚本
```

## 常见问题

### 鸿蒙构建失败
确保 dist 目录已生成，先运行 `npm run build` 再运行 `npm run build:harmony`。

### 小程序平台适配问题
参考各平台官方文档，使用 `platform.adapter` 进行平台判断。

### Capacitor 同步问题
确保 Web 构建已完成，运行 `npx cap sync` 同步资源。

## 技术支持

- 项目文档: `docs/`
- API 文档: `docs/API.md`
- 架构文档: `docs/ARCHITECTURE.md`
