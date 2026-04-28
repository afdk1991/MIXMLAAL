# MIXMLAAL 本地开发部署指南（无 Docker）

本文档提供在 Windows 上不使用 Docker 的本地部署方案。

## 前置要求

### 1. 安装 Node.js 20+
```powershell
winget install OpenJS.NodeJS.LTS
```

### 2. 安装 Python 3.11+
```powershell
winget install Python.Python.3.11
```

### 3. 安装 MySQL 8.0
```powershell
winget install Oracle.MySQL
```
或使用 [XAMPP](https://www.apachefriends.org/) 集成环境（包含 MySQL、PHP、Tomcat）

### 4. 安装 Redis
```powershell
winget install Redis.Redis
```
或使用 [Memurai](https://www.memurai.com/)（Windows 原生 Redis 替代）

### 5. 安装 Nginx
```powershell
winget install NGINX.NGINX
```

## 数据库初始化

```powershell
# 创建数据库
mysql -u root -p
CREATE DATABASE mixmlaal CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'mixmlaal'@'localhost' IDENTIFIED BY 'mixmlaal123';
GRANT ALL PRIVILEGES ON mixmlaal.* TO 'mixmlaal'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

## 启动服务

### 启动 MySQL
```powershell
net start mysql80
```

### 启动 Redis
```powershell
net start redis
```

### 启动 API 服务
```powershell
cd f:\MIXMLAAL\mixmlaal-apps\mixmlaal-api-node
npm install
npm run dev
```

### 启动前端
```powershell
# 新开终端
cd f:\MIXMLAAL\mixmlaal-apps\mixmlaal-frontend-vue
npm install
npm run dev
```

### 配置 Nginx 子路径路由

编辑 `C:\nginx\conf\nginx.conf`，添加以下配置：

```nginx
server {
    listen 80;
    server_name laal.top;

    # 前端主站
    location / {
        proxy_pass http://127.0.0.1:3000;
    }

    # API 服务
    location /api/ {
        rewrite ^/api/(.*)$ /$1 break;
        proxy_pass http://127.0.0.1:8080;
    }

    # 管理后台
    location /admin/ {
        proxy_pass http://127.0.0.1:3001/;
    }

    # 司机端
    location /driver/ {
        proxy_pass http://127.0.0.1:3003/;
    }

    # 商户端
    location /merchant/ {
        proxy_pass http://127.0.0.1:3004/;
    }

    # H5 移动端
    location /h5/ {
        proxy_pass http://127.0.0.1:3005/;
    }
}
```

### 启动 Nginx
```powershell
nginx -t
nginx
```

## 访问地址

- 主站: http://laal.top/
- API: http://laal.top/api/
- 管理后台: http://laal.top/admin/
- 司机端: http://laal.top/driver/
- 商户端: http://laal.top/merchant/
- H5移动端: http://laal.top/h5/

## 域名 hosts 配置

编辑 `C:\Windows\System32\drivers\etc\hosts`：
```
127.0.0.1 laal.top
```
