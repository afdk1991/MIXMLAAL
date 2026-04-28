# MIXMLAAL 部署检查清单

| 属性 | 内容 |
|------|------|
| **文档版本** | v1.0 |
| **编制时间** | 2025-01-15 |
| **检查类型** | 部署前验收 |
| **适用范围** | 生产环境部署 |

---

## 一、环境准备检查

### 1.1 硬件资源检查

#### 服务器资源要求

| 服务类型 | 最低配置 | 推荐配置 | 数量 | 检查项 |
|----------|----------|----------|------|--------|
| **K8s Master** | 4核8G | 8核16G | 3 | CPU/内存/磁盘 |
| **K8s Worker** | 8核16G | 16核32G | 10+ | CPU/内存/磁盘 |
| **MySQL 主库** | 16核32G | 32核64G | 1 | SSD 500G+ |
| **MySQL 从库** | 8核16G | 16核32G | 2 | SSD 500G+ |
| **Redis** | 8核16G | 16核32G | 3 | 内存512G+ |
| **Kafka** | 8核16G | 16核32G | 3 | SSD 1T+ |
| **ES 集群** | 8核16G | 16核32G | 3 | SSD 2T+ |

#### 检查脚本

```bash
#!/bin/bash
# 服务器资源检查脚本

echo "=== 服务器资源检查 ==="

# CPU 检查
echo "CPU 核心数: $(nproc)"

# 内存检查
echo "内存总量: $(free -h | grep Mem | awk '{print $2}')"
echo "内存使用: $(free -h | grep Mem | awk '{print $3}')"

# 磁盘检查
echo "磁盘空间:"
df -h | grep -v tmpfs

# 网络检查
echo "网络连接:"
netstat -i | tail -n +3

# 系统版本
echo "操作系统版本:"
cat /etc/os-release | head -3
```

#### 检查清单

- [ ] CPU 核心数满足要求
- [ ] 内存容量满足要求
- [ ] 磁盘空间满足要求（根分区 / 100G，数据盘 /data 500G+）
- [ ] 网络带宽满足要求（千兆网络）
- [ ] 操作系统版本符合要求（CentOS 7.9+ / Ubuntu 20.04+）
- [ ] 主机名规范配置
- [ ] 时区配置正确（Asia/Shanghai）
- [ ] NTP 时间同步服务运行正常

### 1.2 软件依赖检查

#### Docker 检查

```bash
# 检查 Docker 版本
docker --version
# 期望: Docker version 20.10.x 或更高

# 检查 Docker 服务状态
systemctl status docker
# 期望: active (running)

# 检查 Docker 配置
docker info | grep -E "Server Version|Storage Driver|Kernel Version"
```

#### Kubernetes 检查

```bash
# 检查 kubelet 版本
kubelet --version
# 期望: Kubernetes v1.28.x

# 检查 kubectl
kubectl version --client
kubectl version --short
```

#### 中间件检查

| 中间件 | 版本要求 | 检查命令 | 验证方式 |
|--------|----------|----------|----------|
| MySQL | 8.0.35+ | `mysql --version` | 登录验证 |
| Redis | 7.0+ | `redis-cli --version` | 连接测试 |
| Kafka | 3.6+ | `kafka-topics.sh --version` | 版本验证 |
| Elasticsearch | 8.x | `curl -s localhost:9200` | 健康检查 |

#### 检查清单

- [ ] Docker 已安装且版本 ≥ 20.10
- [ ] Docker 服务运行正常
- [ ] Kubernetes 已安装且版本 ≥ 1.28
- [ ] kubectl 可正常访问集群
- [ ] MySQL 8.0+ 已安装
- [ ] Redis 7.0+ 已安装
- [ ] Kafka 3.6+ 已安装
- [ ] Elasticsearch 8.x 已安装
- [ ] 所有中间件端口未被占用

---

## 二、服务依赖检查

### 2.1 内部服务依赖

#### 服务调用依赖图

```
┌─────────────────────────────────────────────────────────┐
│                 服务依赖关系图                            │
├─────────────────────────────────────────────────────────┤
│                                                         │
│                    [API Gateway]                        │
│                         │                               │
│         ┌───────────────┼───────────────┐              │
│         │               │               │              │
│         ▼               ▼               ▼              │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐          │
│  │user-service│ │order-svc  │  │payment-svc│          │
│  └─────┬─────┘  └─────┬─────┘  └─────┬─────┘          │
│        │              │               │                │
│        └──────────────┼───────────────┘                │
│                       ▼                                 │
│              ┌───────────────┐                        │
│              │   MySQL       │                        │
│              └───────────────┘                        │
│                       │                                 │
│                       ▼                                 │
│              ┌───────────────┐                        │
│              │    Redis     │                        │
│              └───────────────┘                        │
│                       │                                 │
│                       ▼                                 │
│              ┌───────────────┐                        │
│              │    Kafka     │                        │
│              └───────────────┘                        │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

#### 依赖检查清单

| 序号 | 检查项 | 检查方法 | 期望结果 |
|------|--------|----------|----------|
| 1 | Gateway → User 服务 | curl 健康检查 | HTTP 200 |
| 2 | Gateway → Order 服务 | curl 健康检查 | HTTP 200 |
| 3 | Gateway → Payment 服务 | curl 健康检查 | HTTP 200 |
| 4 | Order → User 服务 | 服务发现 | 可发现 |
| 5 | Order → Payment 服务 | 服务发现 | 可发现 |
| 6 | Payment → Order 服务 | 服务发现 | 可发现 |
| 7 | 所有服务 → MySQL | 连接测试 | 连接成功 |
| 8 | 所有服务 → Redis | 连接测试 | 连接成功 |
| 9 | 所有服务 → Kafka | 连接测试 | 连接成功 |

### 2.2 外部依赖检查

#### 第三方服务

| 服务 | 检查方式 | 验证URL/命令 | 备用方案 |
|------|----------|--------------|----------|
| 微信支付 | API 调用 | `/v3/pay/transactions/native` | 沙箱环境 |
| 支付宝 | API 调用 | `/api/alipay/trade/page` | 沙箱环境 |
| 短信服务 | API 调用 | 发送测试短信 | 备用通道 |
| 地图服务 | API 调用 | 坐标转换 | 备用服务商 |
| 推送服务 | API 调用 | 推送测试 | 应用内通知 |

#### 检查清单

- [ ] 微信支付商户号已申请并配置
- [ ] 支付宝商户号已申请并配置
- [ ] 短信服务账号已申请
- [ ] 地图服务 API Key 已配置
- [ ] 极光/友盟推送已配置
- [ ] 所有第三方密钥已配置到 Vault
- [ ] 第三方服务回调地址已配置
- [ ] 外部网络访问白名单已配置

---

## 三、配置项检查

### 3.1 环境变量检查

#### 必须配置的环境变量

```yaml
# 数据库配置
DATABASE_HOST: "mysql-master.mixla.svc.cluster.local"
DATABASE_PORT: "3306"
DATABASE_NAME: "mixla_prod"
DATABASE_USERNAME: "mixla_user"
DATABASE_PASSWORD: "***"  # Vault 管理
DATABASE_POOL_MIN: "10"
DATABASE_POOL_MAX: "50"

# Redis 配置
REDIS_HOST: "redis.mixla.svc.cluster.local"
REDIS_PORT: "6379"
REDIS_PASSWORD: "***"  # Vault 管理
REDIS_DB: "0"

# Kafka 配置
KAFKA_BROKERS: "kafka-0:9092,kafka-1:9092,kafka-2:9092"
KAFKA_USERNAME: "mixla"
KAFKA_PASSWORD: "***"  # Vault 管理

# 应用配置
APP_ENV: "production"
APP_PORT: "8080"
APP_LOG_LEVEL: "info"
NODE_ENV: "production"

# 安全配置
JWT_SECRET: "***"  # Vault 管理
JWT_EXPIRES_IN: "15m"
REFRESH_TOKEN_EXPIRES_IN: "7d"

# 第三方配置
WECHAT_APP_ID: "***"
WECHAT_MCH_ID: "***"
ALIPAY_APP_ID: "***"

# 监控配置
PROMETHEUS_ENABLED: "true"
JAEGER_ENDPOINT: "http://jaeger:14268/api/traces"
```

#### 检查清单

- [ ] 所有环境变量已配置
- [ ] 敏感信息使用 Vault 管理
- [ ] 数据库连接配置正确
- [ ] Redis 连接配置正确
- [ ] Kafka 连接配置正确
- [ ] JWT 密钥已配置（至少 32 位）
- [ ] 第三方 API Key 已配置
- [ ] 日志级别配置正确（生产环境为 info）

### 3.2 配置文件检查

#### 配置文件模板

```
/opt/mixla/
├── config/
│   ├── app.yaml              # 应用主配置
│   ├── database.yaml         # 数据库配置
│   ├── redis.yaml           # Redis 配置
│   ├── kafka.yaml           # Kafka 配置
│   └── logging.yaml         # 日志配置
├── secrets/
│   └── .secrets.yaml         # 敏感配置（Vault 注入）
└── certs/
    ├── server.crt            # SSL 证书
    └── server.key            # SSL 私钥
```

#### 检查清单

- [ ] 配置文件存在且格式正确
- [ ] 生产配置文件与测试配置分离
- [ ] SSL 证书有效期 > 30 天
- [ ] 日志文件路径配置正确
- [ ] 配置文件权限设置为 600

### 3.3 Kubernetes 配置检查

#### Deployment 检查

```yaml
# 示例 Deployment 配置检查项
apiVersion: apps/v1
kind: Deployment
metadata:
  name: user-service
  namespace: mixla-prod
spec:
  replicas: 3                    # ✅ 检查副本数 ≥ 2
  selector:
    matchLabels:
      app: user-service
  strategy:
    type: RollingUpdate         # ✅ 使用滚动更新
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  template:
    spec:
      containers:
        - name: user-service
          resources:
            requests:           # ✅ 检查资源配置
              cpu: "500m"
              memory: "512Mi"
            limits:
              cpu: "2000m"
              memory: "2Gi"
          livenessProbe:        # ✅ 检查存活探针
            httpGet:
              path: /health
              port: 8080
            initialDelaySeconds: 30
            periodSeconds: 10
          readinessProbe:       # ✅ 检查就绪探针
            httpGet:
              path: /ready
              port: 8080
            initialDelaySeconds: 5
            periodSeconds: 5
```

#### 检查清单

- [ ] 所有 Deployment 已配置副本数 ≥ 2
- [ ] 所有 Deployment 已配置存活探针
- [ ] 所有 Deployment 已配置就绪探针
- [ ] 所有 Deployment 已配置资源限制
- [ ] 使用滚动更新策略
- [ ] PodDisruptionBudget 已配置
- [ ] HPA 自动扩缩容已配置

---

## 四、安全检查

### 4.1 网络安全

#### 检查项

| 检查项 | 检查方法 | 标准 |
|--------|----------|------|
| 网络策略 | 检查 NetworkPolicy | 默认拒绝，精确放行 |
| 防火墙规则 | iptables -L | 仅开放必要端口 |
| SSL/TLS | 检查证书配置 | TLS 1.2+ |
| HTTPS | 强制 HTTPS | HTTP 自动跳转 |

#### 网络策略示例

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: user-service-network-policy
  namespace: mixla-prod
spec:
  podSelector:
    matchLabels:
      app: user-service
  policyTypes:
    - Ingress
    - Egress
  ingress:
    - from:
        - namespaceSelector:
            matchLabels:
              name: mixla-prod
        - podSelector:
            matchLabels:
              app: api-gateway
      ports:
        - protocol: TCP
          port: 8080
  egress:
    - to:
        - podSelector:
            matchLabels:
              app: mysql
      ports:
        - protocol: TCP
          port: 3306
```

#### 检查清单

- [ ] Kubernetes 网络策略已配置
- [ ] 默认命名空间策略为拒绝
- [ ] 服务间通信受网络策略控制
- [ ] 外部访问仅通过 Ingress
- [ ] 数据库端口仅内网可访问
- [ ] Redis 端口仅内网可访问

### 4.2 身份认证

#### 检查清单

- [ ] API 网关启用 JWT 认证
- [ ] 服务间调用使用 mTLS（可选）
- [ ] Kubernetes RBAC 权限已配置
- [ ] Docker Registry 认证已配置
- [ ] 运维人员 SSH 密钥已配置
- [ ] 运维人员 sudo 权限已审查

### 4.3 敏感数据

#### 检查清单

- [ ] 数据库密码已更新为强密码
- [ ] Redis 密码已配置
- [ ] Kafka 认证已配置
- [ ] API 密钥已存储到 Vault
- [ ] 日志中无敏感信息（密码、Token）
- [ ] 环境变量中无明文密钥
- [ ] Git 仓库无敏感信息提交记录

### 4.4 安全扫描

```bash
# 容器镜像安全扫描
trivy image mixla/user-service:latest
# 期望: 无 HIGH/CRITICAL 漏洞

# K8s 安全扫描
kube-bench run --targets=master
# 期望: 所有检查项通过

# 依赖漏洞扫描
npm audit --production
# 或
yarn audit --production
```

#### 检查清单

- [ ] 所有基础镜像已扫描
- [ ] 所有应用镜像已扫描
- [ ] 无 HIGH/CRITICAL 漏洞
- [ ] Kubernetes CIS 基线检查通过

---

## 五、监控和日志检查

### 5.1 监控检查

#### 监控指标覆盖

| 指标类型 | 监控项 | 告警阈值 |
|----------|--------|----------|
| **基础设施** | CPU 使用率 | > 80% 持续 5min |
| 基础设施 | 内存使用率 | > 85% 持续 5min |
| 基础设施 | 磁盘使用率 | > 80% |
| 基础设施 | 网络流量 | > 1Gbps |
| **应用** | 服务可用性 | < 99.9% |
| 应用 | 接口响应时间 P99 | > 500ms |
| 应用 | 错误率 | > 1% |
| 应用 | JVM GC 频率 | > 10次/min |
| **数据库** | 连接数 | > 80% 最大连接 |
| 数据库 | 查询延迟 | > 100ms |
| 数据库 | 慢查询数 | > 10/分钟 |
| **缓存** | 命中率 | < 80% |
| 缓存 | 内存使用 | > 90% |
| **消息队列** | 消费延迟 | > 1min |
| 消息队列 | 消息堆积 | > 10000 |

#### 检查清单

- [ ] Prometheus 已部署并运行
- [ ] Grafana 已部署并运行
- [ ] Node Exporter 已部署
- [ ] MySQL Exporter 已部署
- [ ] Redis Exporter 已部署
- [ ] Kafka Exporter 已部署
- [ ] 应用指标已暴露（/metrics）
- [ ] 告警规则已配置
- [ ] 告警通知已配置（钉钉/企微/电话）
- [ ] Dashboard 已配置

### 5.2 日志检查

#### 日志配置标准

```yaml
# 日志格式（JSON）
{
  "timestamp": "2025-01-15T10:30:00.000Z",
  "level": "info",
  "service": "user-service",
  "trace_id": "abc123",
  "span_id": "def456",
  "message": "User login successful",
  "user_id": "10001",
  "ip": "192.168.1.1"
}
```

#### 检查清单

- [ ] 日志系统 ELK 已部署
- [ ] 日志格式统一为 JSON
- [ ] 日志级别配置正确
- [ ] 日志包含必要字段（trace_id, span_id）
- [ ] 日志保留策略已配置（30天）
- [ ] 敏感信息已脱敏
- [ ] 日志聚合查询已验证

### 5.3 链路追踪检查

#### 检查清单

- [ ] Jaeger 已部署并运行
- [ ] 应用已集成 OpenTelemetry SDK
- [ ] 采样策略已配置（10% 采样 + 100% 错误）
- [ ] 服务依赖图可正常显示
- [ ] Trace 数据可正常查询

---

## 六、上线前验收测试

### 6.1 功能测试

#### 冒烟测试

| 序号 | 测试项 | 测试方法 | 预期结果 |
|------|--------|----------|----------|
| 1 | 用户注册 | POST /api/v1/auth/register | 注册成功，返回 Token |
| 2 | 用户登录 | POST /api/v1/auth/login | 登录成功，返回 Token |
| 3 | 创建订单 | POST /api/v1/orders | 订单创建成功 |
| 4 | 订单支付 | POST /api/v1/payments | 支付跳转成功 |
| 5 | 订单查询 | GET /api/v1/orders/{id} | 返回订单详情 |
| 6 | 商家列表 | GET /api/v1/merchants | 返回商家列表 |
| 7 | 商品详情 | GET /api/v1/products/{id} | 返回商品详情 |
| 8 | 地图定位 | POST /api/v1/location | 返回位置信息 |

#### 检查清单

- [ ] 冒烟测试用例 100% 通过
- [ ] 核心业务流程测试通过
- [ ] 异常流程测试通过

### 6.2 性能测试

#### 性能指标要求

| 指标 | 要求 | 测试方法 |
|------|------|----------|
| 首页加载 | < 2s | Lighthouse |
| API P99 延迟 | < 200ms | JMeter/Artillery |
| 并发用户 | 10000 | JMeter 压测 |
| TPS | > 5000 | JMeter 压测 |
| 错误率 | < 0.1% | JMeter 压测 |

#### 检查清单

- [ ] 负载测试已执行（模拟 10000 并发）
- [ ] 峰值测试已执行（模拟 5 倍峰值）
- [ ] 持续压测已执行（30 分钟）
- [ ] 性能指标满足要求
- [ ] 无内存泄漏
- [ ] 数据库连接池无泄漏

### 6.3 安全测试

#### 检查清单

- [ ] SQL 注入测试通过
- [ ] XSS 攻击测试通过
- [ ] CSRF 防护测试通过
- [ ] 接口限流测试通过
- [ ] 敏感接口认证测试通过
- [ ] 文件上传安全测试通过

### 6.4 灾备演练

#### 检查清单

- [ ] 数据库主从切换演练完成
- [ ] Redis 主从切换演练完成
- [ ] Kafka 故障转移演练完成
- [ ] 服务故障恢复演练完成
- [ ] 数据恢复演练完成（RPO/RTO 验证）

---

## 七、部署确认签字

### 7.1 检查结果汇总

| 检查类别 | 检查项数 | 通过数 | 通过率 |
|----------|----------|--------|--------|
| 环境准备 | 20 |  |  |
| 服务依赖 | 15 |  |  |
| 配置项 | 20 |  |  |
| 安全 | 15 |  |  |
| 监控日志 | 15 |  |  |
| 功能测试 | 30 |  |  |
| 性能测试 | 10 |  |  |
| 安全测试 | 10 |  |  |

### 7.2 上线签字

| 角色 | 姓名 | 日期 | 签字 |
|------|------|------|------|
| 项目经理 | | | |
| 技术负责人 | | | |
| 运维负责人 | | | |
| 测试负责人 | | | |
| 安全负责人 | | | |

### 7.3 回滚计划

| 回滚条件 | 回滚方案 | 负责人 |
|----------|----------|--------|
| 可用性 < 99% | 立即回滚到上一版本 | 运维负责人 |
| P0 故障 30min 未解决 | 启动回滚流程 | 技术负责人 |
| 数据丢失 | 停止部署，恢复数据 | DBA |

---

*文档结束*
