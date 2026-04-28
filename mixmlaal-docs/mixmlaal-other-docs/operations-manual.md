# MIXMLAAL 运维手册

## 1. 概述

本文档为 MIXMLAAL 项目的运维手册，包含系统部署、监控、故障处理等内容，旨在帮助运维人员快速上手和维护系统。

## 2. 系统架构

### 2.1 整体架构

MIXMLAAL 采用微服务架构，主要组件包括：

- **API 服务**：处理客户端请求，提供 RESTful API
- **数据库**：MySQL 主从架构，处理数据存储
- **缓存**：Redis 集群，提供缓存服务
- **监控系统**：Prometheus + Grafana + Alertmanager，实现系统监控和告警
- **CI/CD**：GitHub Actions，实现自动化构建和部署

### 2.2 服务依赖

| 服务 | 版本 | 用途 | 依赖关系 |
|------|------|------|----------|
| Node.js | 18+ | 运行环境 | 核心依赖 |
| MySQL | 8.0+ | 数据存储 | API 服务 |
| Redis | 7.0+ | 缓存服务 | API 服务 |
| Prometheus | 2.43.0 | 监控数据采集 | - |
| Grafana | 9.5.2 | 监控可视化 | Prometheus |
| Alertmanager | 0.25.0 | 告警管理 | Prometheus |

## 3. 部署指南

### 3.1 环境准备

#### 3.1.1 服务器要求

- **CPU**：至少 4 核
- **内存**：至少 8GB
- **存储**：至少 50GB SSD
- **网络**：公网 IP，带宽 10Mbps+  
- **操作系统**：Ubuntu 20.04 LTS 或 CentOS 7+

#### 3.1.2 依赖安装

```bash
# Ubuntu
sudo apt update
sudo apt install -y docker.io docker-compose git

# CentOS
sudo yum update
sudo yum install -y docker docker-compose git
sudo systemctl start docker
sudo systemctl enable docker
```

### 3.2 部署流程

#### 3.2.1 代码拉取

```bash
git clone https://github.com/your-username/mixmlaal-app.git
cd mixmlaal-app
```

#### 3.2.2 环境配置

复制环境变量文件并修改配置：

```bash
cp .env.example .env
# 编辑 .env 文件，配置数据库、Redis 等信息
```

#### 3.2.3 启动服务

**启动主应用**：

```bash
docker-compose up -d
```

**启动监控系统**：

```bash
docker-compose -f docker-compose.monitoring.yml up -d
```

#### 3.2.4 验证部署

- 应用服务：访问 `http://服务器IP:3001/api/v1/health`
- Grafana：访问 `http://服务器IP:3000`（默认账号密码：admin/admin123）
- Prometheus：访问 `http://服务器IP:9090`
- Alertmanager：访问 `http://服务器IP:9093`

## 4. 监控系统

### 4.1 监控指标

系统监控主要包括以下指标：

- **系统指标**：CPU 负载、内存使用率、磁盘使用率、网络流量
- **应用指标**：请求量、响应时间、错误率、接口性能
- **数据库指标**：连接数、查询性能、慢查询
- **缓存指标**：缓存命中率、内存使用

### 4.2 Grafana 仪表板

系统预置了 MIXMLAAL 监控仪表板，包含以下面板：

- **系统概览**：CPU、内存、磁盘等系统指标
- **应用性能**：请求量、响应时间、错误率
- **接口性能**：各接口的响应时间和错误率
- **数据库状态**：数据库连接和查询性能
- **缓存状态**：Redis 缓存使用情况

### 4.3 告警机制

#### 4.3.1 告警规则

系统配置了以下告警规则：

| 告警类型 | 警告阈值 | 严重阈值 | 持续时间 |
|---------|---------|---------|----------|
| CPU 负载 | 80% | 90% | 5分钟/3分钟 |
| 内存使用 | 85% | 95% | 5分钟/3分钟 |
| 响应时间 | 500ms | 1000ms | 5分钟/3分钟 |
| 错误率 | 5% | 10% | 5分钟/3分钟 |

#### 4.3.2 告警通知

告警通知配置：

- **Email**：发送邮件通知到指定邮箱
- **Slack**：发送通知到 Slack 频道
- **Webhook**：支持自定义 webhook 通知

### 4.4 监控工具使用

#### 4.4.1 Prometheus

- **地址**：`http://服务器IP:9090`
- **功能**：查看监控指标、执行 PromQL 查询
- **常用查询**：
  - `mixmlaal_requests_total`：总请求数
  - `mixmlaal_response_time_avg`：平均响应时间
  - `mixmlaal_system_cpu_load`：CPU 负载
  - `mixmlaal_system_memory_usage`：内存使用率

#### 4.4.2 Grafana

- **地址**：`http://服务器IP:3000`
- **默认账号**：admin/admin123
- **功能**：查看仪表板、配置告警、导出报告
- **预置仪表板**：MIXMLAAL 系统监控

#### 4.4.3 Alertmanager

- **地址**：`http://服务器IP:9093`
- **功能**：管理告警、配置通知渠道

## 5. 故障处理

### 5.1 常见问题

| 问题 | 可能原因 | 解决方案 |
|------|---------|----------|
| API 服务无法启动 | 端口被占用 | 检查端口占用，修改配置 |
| 数据库连接失败 | 数据库服务未启动 | 启动数据库服务，检查连接配置 |
| Redis 连接失败 | Redis 服务未启动 | 启动 Redis 服务，检查连接配置 |
| 监控系统无数据 | Prometheus 配置错误 | 检查 Prometheus 配置，确保目标可达 |
| 告警未触发 | 告警规则配置错误 | 检查告警规则配置，验证阈值设置 |

### 5.2 故障排查流程

1. **查看日志**：
   ```bash
   docker-compose logs api
   docker-compose logs db
   docker-compose logs redis
   ```

2. **检查服务状态**：
   ```bash
   docker-compose ps
   ```

3. **健康检查**：
   ```bash
   curl http://localhost:3001/api/v1/health
   ```

4. **监控系统检查**：
   - 查看 Grafana 仪表板
   - 检查 Prometheus 指标
   - 查看 Alertmanager 告警

5. **数据库检查**：
   ```bash
   docker exec -it mixmlaal-db mysql -u root -p
   ```

6. **缓存检查**：
   ```bash
   docker exec -it mixmlaal-redis redis-cli
   ```

### 5.3 紧急恢复

1. **服务重启**：
   ```bash
   docker-compose restart api
   ```

2. **服务重建**：
   ```bash
   docker-compose down
   docker-compose up -d
   ```

3. **数据备份**：
   ```bash
   docker exec -it mixmlaal-db mysqldump -u root -p mixmlaal > backup.sql
   ```

4. **数据恢复**：
   ```bash
   docker exec -i mixmlaal-db mysql -u root -p mixmlaal < backup.sql
   ```

## 6. 性能优化

### 6.1 系统优化

- **调整数据库连接池**：根据服务器配置调整 `DB_CONNECTION_LIMIT`
- **优化 Redis 配置**：调整内存限制和持久化策略
- **配置负载均衡**：使用 Nginx 或负载均衡器分散流量
- **启用 CDN**：静态资源使用 CDN 加速

### 6.2 应用优化

- **代码优化**：减少不必要的计算和IO操作
- **缓存策略**：合理使用 Redis 缓存，设置适当的过期时间
- **数据库优化**：添加索引，优化查询语句
- **并发处理**：使用异步处理和队列系统

### 6.3 监控优化

- **调整监控频率**：根据业务需求调整 Prometheus 抓取间隔
- **优化告警规则**：根据实际情况调整告警阈值
- **添加自定义指标**：根据业务特点添加自定义监控指标

## 7. 安全管理

### 7.1 安全配置

- **HTTPS**：启用 SSL 证书，强制使用 HTTPS
- **防火墙**：配置防火墙规则，只开放必要端口
- **密码策略**：使用强密码，定期更换
- **访问控制**：限制敏感接口的访问权限

### 7.2 日志管理

- **日志收集**：使用 ELK 或类似系统收集和分析日志
- **日志轮转**：配置日志轮转，避免日志文件过大
- **日志备份**：定期备份日志文件

### 7.3 漏洞扫描

- **定期扫描**：使用安全扫描工具定期扫描系统漏洞
- **依赖检查**：定期检查第三方依赖的安全漏洞
- **安全更新**：及时更新系统和依赖包

## 8. 日常维护

### 8.1 定期任务

- **备份数据**：每日备份数据库和关键配置
- **检查系统状态**：每日检查系统运行状态和监控指标
- **更新依赖**：定期更新系统和依赖包
- **性能分析**：定期分析系统性能，优化配置

### 8.2 版本管理

- **代码版本**：使用 Git 管理代码版本
- **部署版本**：记录每次部署的版本信息
- **回滚策略**：制定版本回滚策略，确保出现问题时能快速回滚

### 8.3 文档更新

- **更新文档**：及时更新运维文档，记录系统变更
- **知识共享**：将运维经验和问题解决方案记录到文档中

## 9. 附录

### 9.1 常用命令

```bash
# 启动所有服务
docker-compose up -d

# 停止所有服务
docker-compose down

# 查看服务状态
docker-compose ps

# 查看服务日志
docker-compose logs [服务名]

# 进入容器
docker exec -it [容器名] bash

# 重启服务
docker-compose restart [服务名]

# 构建服务
docker-compose build [服务名]
```

### 9.2 环境变量

| 变量名 | 描述 | 默认值 |
|-------|------|--------|
| PORT | API 服务端口 | 3001 |
| DB_HOST | 数据库主机 | localhost |
| DB_PORT | 数据库端口 | 3306 |
| DB_NAME | 数据库名称 | mixmlaal |
| DB_USER | 数据库用户名 | root |
| DB_PASSWORD | 数据库密码 | - |
| REDIS_HOST | Redis 主机 | localhost |
| REDIS_PORT | Redis 端口 | 6379 |
| REDIS_PASSWORD | Redis 密码 | - |
| JWT_SECRET | JWT 密钥 | - |
| NODE_ENV | 运行环境 | development |

### 9.3 监控指标说明

| 指标名 | 描述 | 单位 |
|-------|------|------|
| mixmlaal_requests_total | 总请求数 | 次 |
| mixmlaal_requests_success | 成功请求数 | 次 |
| mixmlaal_requests_error | 错误请求数 | 次 |
| mixmlaal_response_time_avg | 平均响应时间 | ms |
| mixmlaal_response_time_max | 最大响应时间 | ms |
| mixmlaal_response_time_min | 最小响应时间 | ms |
| mixmlaal_system_cpu_load | CPU 负载 | % |
| mixmlaal_system_memory_usage | 内存使用率 | % |
| mixmlaal_app_uptime | 应用运行时间 | h |
| mixmlaal_app_memory_rss | 应用内存使用 | bytes |

## 10. 联系方式

- **技术支持**：support@laal.top
- **紧急联系**：138-0013-8000
- **GitHub Issues**：https://github.com/your-username/mixmlaal-app/issues
