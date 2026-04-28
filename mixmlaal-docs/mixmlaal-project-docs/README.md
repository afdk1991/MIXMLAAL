# MIXMLAAL 全栈项目

这是一个完整的全栈项目，包含多个应用和服务，支持多端开发和部署。

## 项目状态

✅ **已完成** - 所有核心功能已实现并通过测试验证

## 项目结构

```
.
├── apps/                # 应用目录
│   ├── admin/          # Vue管理后台
│   ├── api/            # Node.js API服务
│   ├── driver/         # 司机端应用
│   ├── frontend/       # 前端应用
│   ├── h5/             # H5移动端应用
│   ├── merchant/       # 商家端应用
│   └── react-admin/    # React管理后台
├── docs/               # 文档目录
├── shared/             # 共享代码
├── tests/              # 测试文件
├── .env.example        # 环境变量示例
├── package.json        # 项目配置
└── README.md           # 项目说明
```

## 技术栈

### 后端
- Node.js + Express.js
- MongoDB + Mongoose
- MySQL + Sequelize
- Redis (缓存)
- JWT (认证)

### 前端
- Vue 3 + Vite
- React + UmiJS
- Tailwind CSS
- Ant Design

### 部署
- Docker
- Kubernetes
- Nginx

## 核心功能

### API服务
- 用户认证与授权
- 多角色权限管理
- 数据统计与分析
- 多端数据同步
- 实时通信

### 管理后台
- 仪表盘数据展示
- 用户管理
- 角色管理
- 权限管理
- 数据统计分析

### 前端应用
- 多端适配
- 响应式设计
- 离线支持
- 性能优化
- 国际化

## 安装与运行

### 安装依赖

```bash
# 安装根目录依赖
npm install

# 安装所有应用依赖
npm run install:all
```

### 运行开发服务器

```bash
# 运行API服务
npm run dev:api

# 运行Vue管理后台
npm run dev:admin

# 运行前端应用
npm run dev:frontend

# 运行司机端应用
npm run dev:driver

# 运行H5应用
npm run dev:h5

# 运行商家端应用
npm run dev:merchant

# 运行React管理后台
npm run dev:react-admin
```

### 构建生产版本

```bash
# 构建所有应用
npm run build
```

## 环境配置

复制 `.env.example` 文件为 `.env` 并配置相应的环境变量：

```env
# 数据库配置
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=password
MYSQL_DATABASE=mixmlaal

MONGODB_URI=mongodb://localhost:27017/mixmlaal

# Redis配置
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT配置
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# 服务器配置
PORT=3000
NODE_ENV=development
```

## 测试

```bash
# 运行所有测试
npm test

# 运行API测试
npm run test:api
```

## 部署

### 使用Docker部署

```bash
# 构建镜像
docker build -t mixmlaal .

# 运行容器
docker run -p 3000:3000 mixmlaal
```

### 使用Docker Compose部署

```bash
docker-compose up -d
```

## 文档

详细文档请查看 `docs` 目录：

- API文档
- 部署指南
- 开发指南
- 架构设计
- 测试策略

## 许可证

ISC

---
*项目完成时间: 2026年4月25日*
*状态: 已完成*
