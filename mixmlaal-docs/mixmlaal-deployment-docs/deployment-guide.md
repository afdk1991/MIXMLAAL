# MIXMLAAL 部署指南

## 1. 环境要求

### 1.1 系统要求
- **操作系统**：Ubuntu 20.04+ / CentOS 7+ / Windows Server 2016+
- **CPU**：4核及以上
- **内存**：8GB及以上
- **存储空间**：50GB及以上
- **网络**：公网IP，开放80/443端口

### 1.2 软件要求
- **Node.js**：16.14.0+ (推荐 18.x)
- **npm**：8.0.0+ 或 **yarn**：1.22.0+
- **MySQL**：5.7+ 或 **PostgreSQL**：12+
- **Redis**：6.0+
- **Nginx**：1.18.0+ (推荐)
- **Docker**：20.10.0+ (可选)

## 2. 部署前准备

### 2.1 域名配置
1. **域名购买**：从域名服务商购买域名
2. **DNS配置**：将域名解析到服务器IP
3. **SSL证书**：申请SSL证书（推荐 Let's Encrypt）

### 2.2 数据库准备
1. **创建数据库**：
   ```sql
   CREATE DATABASE mixmlaal CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

2. **创建用户**：
   ```sql
   CREATE USER 'mixmlaal'@'localhost' IDENTIFIED BY 'your_password';
   GRANT ALL PRIVILEGES ON mixmlaal.* TO 'mixmlaal'@'localhost';
   FLUSH PRIVILEGES;
   ```

### 2.3 环境变量配置
创建 `.env` 文件：
```env
# 服务器配置
NODE_ENV=production
PORT=3000

# MySQL配置
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=mixmlaal
MYSQL_PASSWORD=your_password
MYSQL_DATABASE=mixmlaal

# MongoDB配置
MONGODB_URI=mongodb://localhost:27017/mixmlaal

# Redis配置
REDIS_HOST=localhost
REDIS_PORT=6379

# 认证配置
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d

# 邮箱配置
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_password

# 支付配置
WECHAT_APPID=your_wechat_appid
WECHAT_MCHID=your_wechat_mchid
WECHAT_KEY=your_wechat_key

ALIPAY_APPID=your_alipay_appid
ALIPAY_PRIVATE_KEY=your_alipay_private_key
ALIPAY_PUBLIC_KEY=your_alipay_public_key

# 文件存储
UPLOAD_PATH=/var/www/mixmlaal/uploads
MAX_UPLOAD_SIZE=10mb

# 日志配置
LOG_LEVEL=info
LOG_FILE=/var/log/mixmlaal.log
```

## 3. 部署方式

### 3.1 传统部署

#### 步骤1：克隆代码
```bash
git clone <项目地址>
cd MIXMLAAL
```

#### 步骤2：安装依赖
```bash
# 安装根目录依赖
npm install

# 安装所有应用依赖
npm run install:all
```

#### 步骤3：构建项目
```bash
# 构建所有应用
npm run build
```

#### 步骤4：启动服务
```bash
# 启动API服务
npm run start:api

# 启动前端服务（可选，推荐使用Nginx）
npm run start:frontend

# 启动管理后台
npm run start:admin

# 启动其他应用
npm run start:driver
npm run start:h5
npm run start:merchant
npm run start:react-admin
```

### 3.2 Docker部署

#### 步骤1：创建Dockerfile
```dockerfile
# 后端Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --only=production

COPY . .

EXPOSE 3000

CMD ["npm", "start"]

# 前端Dockerfile
FROM node:18-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

#### 步骤2：创建docker-compose.yml
```yaml
version: '3.8'

services:
  api:
    build:
      context: ./apps/api
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - MYSQL_HOST=mysql
      - MYSQL_PORT=3306
      - MYSQL_USER=mixmlaal
      - MYSQL_PASSWORD=your_password
      - MYSQL_DATABASE=mixmlaal
      - MONGODB_URI=mongodb://mongodb:27017/mixmlaal
      - REDIS_HOST=redis
      - REDIS_PORT=6379
    depends_on:
      - mysql
      - mongodb
      - redis

  frontend:
    build:
      context: ./apps/frontend
    ports:
      - "80:80"
    depends_on:
      - api

  admin:
    build:
      context: ./apps/admin
    ports:
      - "8080:80"
    depends_on:
      - api

  mysql:
    image: mysql:5.7
    environment:
      - MYSQL_ROOT_PASSWORD=root_password
      - MYSQL_DATABASE=mixmlaal
      - MYSQL_USER=mixmlaal
      - MYSQL_PASSWORD=your_password
    volumes:
      - mysql-data:/var/lib/mysql

  mongodb:
    image: mongo:5
    volumes:
      - mongodb-data:/data/db

  redis:
    image: redis:6
    volumes:
      - redis-data:/data

volumes:
  mysql-data:
  mongodb-data:
  redis-data:
```

#### 步骤3：启动服务
```bash
docker-compose up -d
```

### 3.3 Nginx配置

创建Nginx配置文件 `/etc/nginx/sites-available/mixmlaal`：
```nginx
server {
    listen 80;
    server_name example.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name example.com;

    ssl_certificate /etc/letsencrypt/live/example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;

    # 前端配置
    location / {
        root /var/www/mixmlaal/apps/frontend/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # 管理后台配置
    location /admin {
        root /var/www/mixmlaal/apps/admin/dist;
        index index.html;
        try_files $uri $uri/ /admin/index.html;
    }

    # 后端API配置
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # 文件上传配置
    location /uploads {
        alias /var/www/mixmlaal/uploads;
        expires 30d;
        add_header Cache-Control "public, max-age=2592000";
    }
}
```

启用配置：
```bash
sudo ln -s /etc/nginx/sites-available/mixmlaal /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 4. 服务管理

### 4.1 使用PM2管理

```bash
# 安装PM2
npm install -g pm2

# 启动服务
pm run build
pm run start:api

# 查看状态
pm run status

# 重启服务
npm run restart

# 停止服务
npm run stop
```

### 4.2 系统服务配置

创建systemd服务文件 `/etc/systemd/system/mixmlaal-api.service`：
```ini
[Unit]
Description=Mixmlaal API Service
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/mixmlaal/apps/api
ExecStart=/usr/bin/node server.js
Restart=on-failure
Environment=NODE_ENV=production
Environment=PORT=3000
Environment=MYSQL_HOST=localhost
Environment=MYSQL_PORT=3306
Environment=MYSQL_USER=mixmlaal
Environment=MYSQL_PASSWORD=your_password
Environment=MYSQL_DATABASE=mixmlaal

[Install]
WantedBy=multi-user.target
```

启用服务：
```bash
sudo systemctl enable mixmlaal-api
sudo systemctl start mixmlaal-api
sudo systemctl status mixmlaal-api
```

## 5. 数据库管理

### 5.1 数据备份

```bash
# 备份MySQL数据库
mysqldump -u mixmlaal -p mixmlaal > mixmlaal_mysql_$(date +%Y%m%d).sql

# 备份MongoDB数据库
mongodump --db mixmlaal --out mixmlaal_mongodb_$(date +%Y%m%d)

# 恢复MySQL数据库
mysql -u mixmlaal -p mixmlaal < mixmlaal_mysql_20260420.sql

# 恢复MongoDB数据库
mongorestore --db mixmlaal mixmlaal_mongodb_20260420/mixmlaal
```

### 5.2 数据迁移

```bash
# 运行迁移
cd apps/api
npx sequelize db:migrate

# 回滚迁移
npx sequelize db:migrate:undo
```

## 6. 监控与日志

### 6.1 日志管理

```bash
# 查看API日志
tail -f /var/log/mixmlaal.log

# 查看Nginx日志
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

### 6.2 性能监控

#### 使用Prometheus + Grafana
1. **安装Prometheus**
2. **安装Grafana**
3. **配置监控指标**
4. **创建监控面板**

#### 健康检查

```bash
# 检查API健康状态
curl http://localhost:3000/api/health

# 检查数据库连接
mysql -u mixmlaal -p -e "SELECT 1"

# 检查MongoDB连接
mongo -u mixmlaal -p --authenticationDatabase mixmlaal --eval "db.stats()"

# 检查Redis连接
redis-cli ping
```

## 7. 安全配置

### 7.1 防火墙配置

```bash
# 开放必要端口
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow 3000
sudo ufw enable
```

### 7.2 HTTPS配置

```bash
# 安装Certbot
sudo apt install certbot python3-certbot-nginx

# 申请SSL证书
sudo certbot --nginx -d example.com

# 自动续期
sudo certbot renew --dry-run
```

### 7.3 安全加固

- **禁用root登录**
- **使用SSH密钥认证**
- **设置强密码策略**
- **定期更新系统**
- **安装安全补丁**

## 8. 常见问题

### 8.1 服务启动失败

- **检查端口占用**：`lsof -i :3000`
- **检查环境变量**：`cat .env`
- **检查数据库连接**：`mysql -u mixmlaal -p`
- **检查日志**：`tail -f /var/log/mixmlaal.log`

### 8.2 数据库连接失败

- **检查数据库服务**：`sudo systemctl status mysql`
- **检查数据库用户权限**：`mysql -u mixmlaal -p`
- **检查数据库配置**：`.env` 文件中的数据库配置

### 8.3 前端访问后端API失败

- **检查CORS配置**：API服务的CORS设置
- **检查Nginx配置**：代理设置是否正确
- **检查网络连接**：防火墙是否开放端口

### 8.4 上传文件失败

- **检查文件权限**：`chmod -R 755 /var/www/mixmlaal/uploads`
- **检查文件大小限制**：Nginx和Node.js的文件大小限制
- **检查磁盘空间**：`df -h`

## 9. 升级与维护

### 9.1 版本升级

```bash
# 拉取最新代码
git pull

# 安装依赖
npm run install:all

# 构建项目
npm run build

# 重启服务
npm run start:api
```

### 9.2 定期维护

- **备份数据库**：每周一次
- **清理日志**：每月一次
- **更新依赖**：每月一次
- **系统更新**：每月一次

### 9.3 故障排查

1. **查看日志**：分析错误信息
2. **检查监控**：查看系统性能指标
3. **测试连接**：检查各服务的连接状态
4. **回滚操作**：必要时回滚到稳定版本

## 10. 集群部署

### 10.1 负载均衡

使用Nginx或HAProxy配置负载均衡：

```nginx
upstream mixmlaal_api {
    server 127.0.0.1:3000;
    server 127.0.0.1:3001;
    server 127.0.0.1:3002;
}

server {
    listen 80;
    server_name api.example.com;

    location / {
        proxy_pass http://mixmlaal_api;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 10.2 数据库集群

- **主从复制**：提高读取性能
- **读写分离**：优化数据库负载
- **高可用集群**：确保服务可靠性

## 11. 部署检查清单

### 11.1 基础配置
- [ ] 系统环境配置
- [ ] 数据库配置
- [ ] 环境变量配置
- [ ] 域名解析配置
- [ ] SSL证书配置

### 11.2 服务配置
- [ ] API服务启动
- [ ] 前端服务部署
- [ ] 管理后台部署
- [ ] 其他应用部署
- [ ] Nginx配置
- [ ] 防火墙配置
- [ ] 服务监控配置

### 11.3 安全配置
- [ ] HTTPS配置
- [ ] 数据库密码设置
- [ ] 服务账户权限
- [ ] 日志安全配置
- [ ] 备份策略配置

### 11.4 功能测试
- [ ] API接口测试
- [ ] 前端功能测试
- [ ] 管理后台功能测试
- [ ] 支付功能测试
- [ ] 文件上传测试
- [ ] 数据备份测试

---

**文档版本**：2.0.0
**最后更新**：2026-04-25
