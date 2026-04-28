# MIXMLAAL 项目部署文档

## 1. 环境要求

### 1.1 系统要求
- **操作系统**：Windows 10/11、Linux (Ubuntu 20.04+)、macOS 10.15+
- **Node.js**：v18.0.0 或更高版本
- **npm**：v9.0.0 或更高版本
- **Docker**（可选）：v20.0.0 或更高版本（用于容器化部署）

### 1.2 硬件要求
- **CPU**：至少 2 核
- **内存**：至少 4GB
- **存储空间**：至少 20GB

## 2. 部署步骤

### 2.1 克隆项目
```bash
git clone https://github.com/your-repo/mixmlaal-app.git
cd mixmlaal-app
```

### 2.2 安装依赖

#### 2.2.1 项目根目录依赖
```bash
npm install
```

#### 2.2.2 前端依赖
```bash
cd apps/frontend
npm install
```

#### 2.2.3 后端API依赖
```bash
cd ../api
npm install
npm install -D pm2
```

### 2.3 配置环境变量

#### 2.3.1 前端环境变量
创建 `apps/frontend/.env` 文件：
```env
VITE_API_BASE_URL=http://localhost:8085
VITE_APP_TITLE=MIXMLAAL
```

#### 2.3.2 后端API环境变量
创建 `apps/api/.env` 文件：
```env
PORT=8085
NODE_ENV=production
JWT_SECRET=your-jwt-secret-key
JWT_EXPIRES_IN=24h

# 数据库配置（可选）
DATABASE_URL=sqlite://./database.sqlite

# Redis配置（可选）
REDIS_URL=redis://localhost:6379
```

### 2.4 构建项目

#### 2.4.1 构建前端
```bash
cd apps/frontend
npm run build
```

#### 2.4.2 构建后端API
```bash
cd ../api
npm run build
```

### 2.5 启动服务

#### 2.5.1 启动后端API服务
```bash
cd apps/api
npm start
```

#### 2.5.2 启动前端开发服务器（开发环境）
```bash
cd apps/frontend
npm run dev
```

#### 2.5.3 部署前端生产构建
将 `apps/frontend/dist` 目录部署到静态文件服务器（如 Nginx、Apache 等）。

## 3. Docker 容器化部署

### 3.1 构建 Docker 镜像
```bash
docker-compose -f docker-compose.prod.yml build
```

### 3.2 启动 Docker 容器
```bash
docker-compose -f docker-compose.prod.yml up -d
```

### 3.3 查看容器状态
```bash
docker-compose -f docker-compose.prod.yml ps
```

### 3.4 停止 Docker 容器
```bash
docker-compose -f docker-compose.prod.yml down
```

## 4. PM2 Cluster 模式部署（生产环境推荐）

### 4.1 PM2 简介
PM2 是一个 Node.js 进程管理器，支持 **Cluster 模式**，可以实现：
- 多进程运行（利用多核 CPU）
- 进程自动重启
- 负载均衡
- 日志管理
- 源代码保护（进程隔离）

### 4.2 PM2 安装
```bash
npm install -D pm2
```

### 4.3 PM2 配置文件
项目根目录已包含 `ecosystem.config.js` 配置文件：

```javascript
module.exports = {
  apps: [{
    name: 'mixmlaal-api',
    script: './src/app.js',
    instances: 'max',           // 最大实例数（推荐设为 CPU 核心数）
    exec_mode: 'cluster',       // 集群模式
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};
```

### 4.4 PM2 命令

#### 4.4.1 启动服务
```bash
cd mixmlaal-apps/mixmlaal-api-node
pm2 start ecosystem.config.js --env production
```

#### 4.4.2 查看进程状态
```bash
pm2 list
pm2 monit
```

#### 4.4.3 查看日志
```bash
pm2 logs mixmlaal-api
```

#### 4.4.4 重启服务
```bash
pm2 restart mixmlaal-api
```

#### 4.4.5 停止服务
```bash
pm2 stop mixmlaal-api
```

#### 4.4.6 保存进程列表
```bash
pm2 save
```

#### 4.4.7 设置开机自启
```bash
pm2 startup
pm2 save
```

### 4.5 PM2 集群配置参数说明

| 参数 | 说明 | 推荐值 |
|------|------|--------|
| `instances` | 实例数量 | `'max'` 或 CPU 核心数 |
| `exec_mode` | 运行模式 | `'cluster'` |
| `max_memory_restart` | 内存阈值 | `'1G'` |
| `error_file` | 错误日志路径 | `'./logs/error.log'` |
| `out_file` | 输出日志路径 | `'./logs/out.log'` |
| `autorestart` | 自动重启 | `true` |
| `max_restarts` | 最大重启次数 | `10` |

### 4.6 源代码保护原理

使用 PM2 Cluster 模式后：
- 进程通过 **PID 隔离**，无法直接通过 `ps` 查看源码结构
- 日志写入由 PM2 管理，应用程序不直接操作文件系统结构
- 多进程通过 **IPC 通信**，外部无法直接访问进程内存空间

## 5. Nginx 配置

### 5.1 基本配置
创建 `nginx/conf.d/default.conf` 文件：
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        root /usr/share/nginx/html;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://api:8085;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## 6. 监控配置

### 6.1 Prometheus 配置
查看 `monitoring/prometheus/prometheus.yml` 文件，确保配置正确。

### 6.2 Alertmanager 配置
查看 `monitoring/alertmanager/alertmanager.yml` 文件，确保配置正确。

## 7. 故障排查

### 7.1 常见问题

#### 7.1.1 端口占用
如果端口 8085 被占用：
```bash
# 查找占用80的进程
lsof -i :8085

# 终止占用端口的进程
kill -9 <进程ID>
```

#### 7.1.2 依赖安装失败
尝试清除 npm 缓存：
```bash
npm cache clean --force
npm install
```

#### 7.1.3 数据库连接问题
确保数据库服务正在运行，并且配置正确。

### 7.2 日志查看

#### 7.2.1 后端API日志（PM2）
```bash
pm2 logs mixmlaal-api
```

#### 7.2.2 后端API日志（Docker）
```bash
docker-compose -f docker-compose.prod.yml logs api
```

#### 7.2.3 前端开发服务器日志
```bash
cd apps/frontend
npm run dev
```

#### 7.2.4 Docker 容器日志
```bash
docker-compose -f docker-compose.prod.yml logs
```

## 8. 性能优化

### 8.1 前端优化
- 启用 gzip 压缩
- 使用 CDN 加速静态资源
- 启用浏览器缓存
- 优化图片大小和格式

### 8.2 后端优化
- 启用 Redis 缓存
- 优化数据库查询
- 启用 API 缓存
- 使用 PM2 Cluster 负载均衡

## 9. 安全措施

### 9.1 前端安全
- 启用 HTTPS
- 实现 CSRF 保护
- 防止 XSS 攻击
- 验证用户输入

### 9.2 后端安全
- 使用 HTTPS
- 实现 JWT 认证
- 防止 SQL 注入
- 限制 API 请求频率
- 定期更新依赖
- **使用 PM2 Cluster 模式保护源代码**

## 10. 部署检查清单

- [ ] 环境变量配置正确
- [ ] 依赖安装成功
- [ ] PM2 安装完成
- [ ] 前端构建成功
- [ ] 后端API启动成功（PM2 Cluster 模式）
- [ ] 数据库连接正常
- [ ] 监控配置正确
- [ ] 安全措施到位
- [ ] 性能优化完成

## 11. 版本管理

### 11.1 版本号格式
```
v<主版本>.<次版本>.<补丁版本>.<构建版本>
例如：v1.0.0.0
```

### 11.2 发布流程
1. 合并代码到主分支
2. 更新版本号
3. 构建项目
4. 使用 PM2 重启服务（或 Docker 重新部署）
5. 部署到测试环境
6. 测试通过后部署到生产环境
7. 记录发布日志

## 12. 联系方式

- **技术支持**：support@mixmlaal.com
- **问题反馈**：issues@mixmlaal.com
- **紧急联系人**：+86 13800138000

---

**文档版本**：MIXMLAAL-0.0.0.6
**最后更新**：2026-04-26
