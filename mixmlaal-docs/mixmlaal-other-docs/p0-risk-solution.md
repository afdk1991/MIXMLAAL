# MIXMLAAL P0 风险详细解决方案

| 属性 | 内容 |
|------|------|
| **文档版本** | v1.0 |
| **编制时间** | 2025-01-15 |
| **风险级别** | P0（最高优先级） |
| **适用阶段** | 止血 → 加固 → 优化 |

---

## 一、API Gateway 高可用方案

### 1.1 问题根源分析

```
┌─────────────────────────────────────────────────────────────┐
│                    当前单点风险                               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│     用户请求                                                │
│        │                                                    │
│        ▼                                                    │
│   ┌─────────┐                                              │
│   │ Gateway │  ←── 单点入口                                │
│   │ Single  │                                              │
│   └────┬────┘                                              │
│        │                                                   │
│        ▼                                                   │
│   ┌─────────────────────────────────────────┐              │
│   │  • 限流熔断失效                          │              │
│   │  • 认证鉴权中断                          │              │
│   │  • 路由转发不可用                        │              │
│   └─────────────────────────────────────────┘              │
│                                                             │
│   影响范围：100% 用户请求失败                               │
│   恢复时间：依赖故障节点重启                                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 架构设计

#### 推荐方案：Nginx + 多 Gateway 实例 + Keepalived

```
┌─────────────────────────────────────────────────────────────────────┐
│                          高可用架构                                  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│                        用户请求                                      │
│                           │                                         │
│                           ▼                                         │
│                    ┌──────────────┐                                │
│                    │  DNS 轮询     │                                │
│                    │  (或 SLB)    │                                │
│                    └──────┬───────┘                                │
│                           │                                         │
│              ┌─────────────┴─────────────┐                          │
│              │                           │                          │
│              ▼                           ▼                          │
│     ┌───────────────┐            ┌───────────────┐                 │
│     │  Nginx L7    │            │  Nginx L7    │                 │
│     │  (VIP:22080) │            │  (VIP:22080) │                 │
│     │  Node-1      │            │  Node-2      │                 │
│     └───────┬──────┘            └───────┬──────┘                 │
│             │                            │                         │
│             │     ┌─────────────┐        │                         │
│             │     │ Keepalived  │        │                         │
│             │     │  VIP 漂移   │        │                         │
│             │     └─────────────┘        │                         │
│             └─────────────┬───────────────┘                         │
│                           │                                          │
│              ┌────────────┴────────────┐                            │
│              │                          │                            │
│              ▼                          ▼                            │
│     ┌───────────────┐            ┌───────────────┐                   │
│     │  Gateway     │            │  Gateway     │                   │
│     │  Instance-1  │◄──────────►│  Instance-2  │                   │
│     │  :3000       │  健康检查   │  :3000       │                   │
│     └───────────────┘            └───────────────┘                   │
│              │                          │                            │
│              │                          │                            │
│              ▼                          ▼                            │
│     ┌────────────────────────────────────────────────┐              │
│     │                 微服务集群                      │              │
│     │  user │ order │ payment │ driver │ ...        │              │
│     └────────────────────────────────────────────────┘              │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 1.3 具体配置示例

#### 1.3.1 Nginx 负载均衡配置

```nginx
# /etc/nginx/conf.d/gateway-ha.conf

# 上游 Gateway 服务组
upstream gateway_backend {
    # 最小连接数策略，避免单点过载
    least_conn;
    
    # Gateway 实例 1
    server 10.0.1.10:3000 weight=100 max_fails=3 fail_timeout=30s;
    
    # Gateway 实例 2
    server 10.0.1.11:3000 weight=100 max_fails=3 fail_timeout=30s;
    
    # Gateway 实例 3（可选，用于更高可用）
    server 10.0.1.12:3000 weight=100 max_fails=3 fail_timeout=30s backup;
    
    # 保持连接
    keepalive 64;
}

# 限流配置 - 放在 http 层级
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=100r/s;
limit_req_zone $server_name zone=server_limit:10m rate=500r/s;

server {
    listen 22080;
    server_name _;
    
    # 请求体大小限制
    client_max_body_size 10M;
    client_body_timeout 30s;
    
    # 开启 gzip 压缩
    gzip on;
    gzip_types application/json application/javascript text/css;
    
    # 通用日志格式
    log_format gateway_log '$remote_addr - $remote_user [$time_local] '
                          '"$request" $status $body_bytes_sent '
                          '"$http_referer" "$http_user_agent" '
                          'rt=$request_time uct="$upstream_connect_time" '
                          'uht="$upstream_header_time" urt="$upstream_response_time"';
    
    access_log /var/log/nginx/gateway_access.log gateway_log;
    error_log /var/log/nginx/gateway_error.log warn;
    
    # 健康检查端点（Nginx Plus 或 openresty 支持）
    location /health {
        return 200 'OK';
        add_header Content-Type text/plain;
    }
    
    # 限流应用
    location /api/ {
        # 全局限流
        limit_req zone=api_limit burst=200 nodelay;
        limit_req zone=server_limit burst=1000 nodelay;
        
        # 超时配置
        proxy_connect_timeout 5s;
        proxy_send_timeout 30s;
        proxy_read_timeout 30s;
        
        # 代理设置
        proxy_pass http://gateway_backend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Connection "";
        
        # 熔断标记（根据上游响应动态调整）
        proxy_intercept_errors on;
        error_page 502 503 504 = @fallback;
    }
    
    # 静态资源直接返回
    location /static/ {
        alias /data/static/;
        expires 7d;
        add_header Cache-Control "public, immutable";
    }
    
    # 降级处理
    location @fallback {
        default_type application/json;
        return 503 '{"code":503,"message":"Service temporarily unavailable","data":null}';
    }
}
```

#### 1.3.2 Keepalived 配置（VIP 漂移）

```bash
# /etc/keepalived/keepalived.conf (Node-1)

global_defs {
    router_id nginx_master
    script_user root
    enable_script_security
}

# 健康检查脚本
vrrp_script check_nginx {
    script "/usr/local/bin/check_nginx.sh"
    interval 2
    weight -50
    fall 2
    rise 1
}

vrrp_instance VI_1 {
    state MASTER
    interface eth0                    # 网卡名称
    virtual_router_id 51
    priority 100
    advert_int 1
    unicast_peer {
        10.0.1.11                     # Node-2 IP
    }
    
    # 认证
    authentication {
        auth_type PASS
        auth_pass mixla_secret_key
    }
    
    # 虚拟 IP
    virtual_ipaddress {
        10.0.1.100/24                 # VIP 地址
    }
    
    # 跟踪脚本
    track_script {
        check_nginx
    }
    
    # 切换通知
    notify_master "/usr/local/bin/notify_master.sh"
    notify_backup "/usr/local/bin/notify_backup.sh"
    notify_fault "/usr/local/bin/notify_fault.sh"
}
```

```bash
#!/bin/bash
# /usr/local/bin/check_nginx.sh - Nginx 健康检查脚本

nginx_process=$(pgrep -f "nginx: master")
if [ -z "$nginx_process" ]; then
    # Nginx 未运行，尝试启动
    systemctl start nginx
    sleep 2
    nginx_process=$(pgrep -f "nginx: master")
    if [ -z "$nginx_process" ]; then
        exit 1
    fi
fi

# 检查端口监听
nc -z 127.0.0.1 22080 > /dev/null 2>&1
if [ $? -ne 0 ]; then
    exit 1
fi

# 检查后端 Gateway 健康
curl -s http://127.0.0.1:22080/health > /dev/null 2>&1
if [ $? -ne 0 ]; then
    exit 1
fi

exit 0
```

```bash
# /etc/keepalived/keepalived.conf (Node-2)

global_defs {
    router_id nginx_backup
    script_user root
    enable_script_security
}

vrrp_script check_nginx {
    script "/usr/local/bin/check_nginx.sh"
    interval 2
    weight -50
}

vrrp_instance VI_1 {
    state BACKUP
    interface eth0
    virtual_router_id 51
    priority 90                       # BACKUP 优先级较低
    advert_int 1
    unicast_peer {
        10.0.1.10                     # Node-1 IP
    }
    
    authentication {
        auth_type PASS
        auth_pass mixla_secret_key
    }
    
    virtual_ipaddress {
        10.0.1.100/24
    }
    
    track_script {
        check_nginx
    }
}
```

#### 1.3.3 Docker Compose 本地开发/测试环境

```yaml
# docker-compose.yml (开发/测试环境)

version: '3.8'

services:
  # Nginx 负载均衡器
  nginx-lb:
    image: nginx:1.25-alpine
    container_name: nginx-lb
    ports:
      - "22080:22080"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/conf.d:/etc/nginx/conf.d:ro
    depends_on:
      gateway-1:
        condition: service_healthy
      gateway-2:
        condition: service_healthy
    networks:
      - mixla-net
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:22080/health"]
      interval: 10s
      timeout: 5s
      retries: 3

  # Gateway 实例 1
  gateway-1:
    build:
      context: ./services/gateway
      dockerfile: Dockerfile
    container_name: gateway-1
    environment:
      - NODE_ENV=production
      - PORT=3000
      - INSTANCE_ID=gateway-1
    ports:
      - "3001:3000"
    depends_on:
      - redis
      - mysql
    networks:
      - mixla-net
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 10s
      timeout: 5s
      retries: 3
      start_period: 30s

  # Gateway 实例 2
  gateway-2:
    build:
      context: ./services/gateway
      dockerfile: Dockerfile
    container_name: gateway-2
    environment:
      - NODE_ENV=production
      - PORT=3000
      - INSTANCE_ID=gateway-2
    ports:
      - "3002:3000"
    depends_on:
      - redis
      - mysql
    networks:
      - mixla-net
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 10s
      timeout: 5s
      retries: 3
      start_period: 30s

  # Redis 缓存
  redis:
    image: redis:7-alpine
    networks:
      - mixla-net
    restart: unless-stopped

  # MySQL 数据库
  mysql:
    image: mysql:8.0
    environment:
      - MYSQL_ROOT_PASSWORD=root_secret
    networks:
      - mixla-net
    restart: unless-stopped
    volumes:
      - mysql-data:/var/lib/mysql

networks:
  mixla-net:
    driver: bridge

volumes:
  mysql-data:
```

### 1.4 实施步骤

| 阶段 | 任务 | 时长 | 操作 |
|------|------|------|------|
| **阶段1** | 环境准备 | 0.5天 | 准备 2 台 Nginx 服务器（VM 或物理机） |
| **阶段2** | 配置部署 | 0.5天 | 部署 Nginx + Keepalived，配置 VIP |
| **阶段3** | Gateway 改造 | 1天 | 改造 Gateway 支持多实例部署 |
| **阶段4** | 流量切换 | 1天 | 配置 DNS 解析到 VIP，灰度切换流量 |
| **阶段5** | 验证测试 | 1天 | 故障演练、恢复演练 |
| **阶段6** | 监控配置 | 0.5天 | 配置 Nginx 监控告警 |

**详细步骤：**

```bash
# 步骤 1：在两台 Nginx 服务器上安装 Nginx 和 Keepalived

# Ubuntu/Debian
apt-get update && apt-get install -y nginx keepalived curl nc

# CentOS/RHEL
yum install -y nginx keepalived curl nc

# 步骤 2：配置 Nginx（参考上方配置）

# 步骤 3：配置 Keepalived（参考上方配置）

# 步骤 4：启动服务
systemctl enable nginx keepalived
systemctl start nginx keepalived

# 步骤 5：验证 VIP 绑定
ip addr show eth0 | grep 10.0.1.100

# 步骤 6：测试故障切换
# 在 Master 节点执行
systemctl stop keepalived
# 观察 VIP 是否漂移到 Backup 节点
ip addr show eth0 | grep 10.0.1.100  # 应在 Backup 节点上
```

### 1.5 回滚方案

```
┌─────────────────────────────────────────────────────────────┐
│                      回滚执行流程                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. 一键回滚脚本                                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ #!/bin/bash                                           │  │
│  │ # rollback_gateway.sh                                │  │
│  │                                                       │  │
│  │ # 停止 Keepalived                                     │  │
│  │ systemctl stop keepalived                            │  │
│  │                                                       │  │
│  │ # 恢复原始 Nginx 配置                                 │  │
│  │ cp /etc/nginx/nginx.conf.backup /etc/nginx/nginx.conf│  │
│  │                                                       │  │
│  │ # 重启 Nginx                                           │  │
│  │ systemctl restart nginx                              │  │
│  │                                                       │  │
│  │ # 恢复 DNS 解析                                       │  │
│  │ # 修改 DNS 记录指向单节点                              │  │
│  │                                                       │  │
│  │ echo "Rollback completed"                            │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  2. 回滚判定条件                                            │
│  • 错误率持续 > 5% 超过 5 分钟                             │
│  • P99 延迟 > 2s 持续 10 分钟                              │
│  • 人工确认后执行                                          │
│                                                             │
│  3. 回滚后验证                                              │
│  • 检查原始服务健康状态                                     │
│  • 确认 DNS 解析正常                                       │
│  • 确认请求可正常访问                                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 二、Kafka 消息可靠性方案

### 2.1 问题根源分析

```
┌─────────────────────────────────────────────────────────────┐
│                    Kafka 消息可靠性风险                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  生产者端                                                   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  ✗ acks=0/1 时消息可能丢失                          │   │
│  │  ✗ 重试机制未配置                                   │   │
│  │  ✗ 幂等性未开启                                     │   │
│  │  ✗ 批处理配置不当                                   │   │
│  └─────────────────────────────────────────────────────┘   │
│                         │                                   │
│                         ▼                                   │
│                    Kafka Broker                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  ✗ 副本数 < 3                                       │   │
│  │  ✗ min.insync.replicas = 1                         │   │
│  │  ✗ 分区数不合理                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                         │                                   │
│                         ▼                                   │
│  消费者端                                                   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  ✗ auto.commit = true 自动提交                     │   │
│  │  ✗ 消费逻辑未实现幂等                               │   │
│  │  ✗ 手动提交 offset 时机不当                         │   │
│  │  ✗ 死信队列缺失                                    │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 生产者配置优化

#### 2.2.1 Kafka Producer 核心配置

```javascript
// src/config/kafka/producer.config.js

module.exports = {
  //  brokers 集群地址
  brokers: process.env.KAFKA_BROKERS?.split(',') || ['localhost:9092'],
  
  // 连接重试配置
  reconnect: {
    maxRetries: 10,
    initialRetryTime: 100,
    maxRetryTime: 30000,
  },
  
  // 生产者客户端 ID
  clientId: 'mixla-producer',
  
  // 生产者配置
  producer: {
    // ============================================
    // 可靠性关键配置
    // ============================================
    
    // acks 配置：确保消息持久化
    // acks=0: 不等待响应，速度最快，风险最高
    // acks=1: 等待 leader 确认，风险中等
    // acks=all/-1: 等待所有 ISR 副本确认，风险最低
    acks: -1,
    
    // 消息重试次数（网络抖动时自动重试）
    retries: 3,
    
    // 重试间隔时间
    retry: {
      initialRetryTime: 100,
      retries: 8,
    },
    
    // 开启幂等性（防止生产者重复发送）
    enableIdempotence: true,
    
    // 幂等性最大请求数
    maxInFlightRequestsPerConnection: 5,
    
    // ============================================
    // 性能优化配置
    // ============================================
    
    // 压缩算法（推荐 lz4 或 zstd）
    compression: 'lz4',
    
    // 批处理配置
    batching: {
      // 批量发送延迟（ms）
      lingerMs: 5,
      // 批量大小
      size: 16384,
    },
    
    // 请求超时
    requestTimeout: 30000,
    
    // 事务超时
    transactionTimeout: 60000,
  },
  
  // 默认 topic 配置
  defaultTopicConfig: {
    replicationFactor: 3,
    config: {
      // 最小同步副本数
      'min.insync.replicas': '2',
      // 消息保留时间（小时）
      'retention.hours': '168',
      // cleanup policy
      'cleanup.policy': 'delete',
    },
  },
};
```

#### 2.2.2 高可靠消息发送实现

```javascript
// src/services/kafka/KafkaProducerService.js

const { Kafka, logLevel, Partitioners } = require('kafkajs');
const { producerConfig } = require('../config/kafka/producer.config');

class KafkaProducerService {
  constructor() {
    this.kafka = new Kafka({
      clientId: producerConfig.clientId,
      brokers: producerConfig.brokers,
      logLevel: logLevel.WARN,
      retry: producerConfig.reconnect,
    });
    
    this.producer = this.kafka.producer({
      ...producerConfig.producer,
      createPartitioner: Partitioners.LegacyPartitioner,
      allowAutoTopicCreation: false,
    });
    
    this.isConnected = false;
  }

  /**
   * 初始化生产者连接
   */
  async connect() {
    if (this.isConnected) return;
    
    try {
      await this.producer.connect();
      this.isConnected = true;
      console.log('[KafkaProducer] Connected successfully');
    } catch (error) {
      console.error('[KafkaProducer] Connection failed:', error);
      throw error;
    }
  }

  /**
   * 断开连接
   */
  async disconnect() {
    if (!this.isConnected) return;
    
    await this.producer.disconnect();
    this.isConnected = false;
    console.log('[KafkaProducer] Disconnected');
  }

  /**
   * 发送消息（带重试和幂等保证）
   * @param {string} topic - Topic 名称
   * @param {Object} message - 消息内容
   * @param {Object} options - 发送选项
   * @returns {Promise<Object>} 发送结果
   */
  async send(topic, message, options = {}) {
    if (!this.isConnected) {
      await this.connect();
    }

    const messageRecord = {
      topic,
      messages: [
        {
          key: options.key || message.id || null,
          value: JSON.stringify({
            ...message,
            timestamp: Date.now(),
            producerId: producerConfig.clientId,
          }),
          headers: {
            'correlation-id': options.correlationId || this.generateUUID(),
            'content-type': 'application/json',
            'retry-count': '0',
            ...options.headers,
          },
        },
      ],
      ...options,
    };

    try {
      // 使用事务发送确保幂等性
      const result = await this.sendWithRetry(messageRecord, options.retryCount || 3);
      return result;
    } catch (error) {
      console.error('[KafkaProducer] Send failed:', {
        topic,
        error: error.message,
        messageId: message.id,
      });
      
      // 发送失败时记录到本地重试队列
      await this.handleSendFailure(topic, message, error);
      throw error;
    }
  }

  /**
   * 带重试的发送
   */
  async sendWithRetry(messageRecord, maxRetries, currentRetry = 0) {
    try {
      const result = await this.producer.send(messageRecord);
      
      // 记录成功日志
      console.log('[KafkaProducer] Message sent:', {
        topic: messageRecord.topic,
        partition: result[0]?.partition,
        offset: result[0]?.offset,
      });
      
      return result;
    } catch (error) {
      if (currentRetry < maxRetries) {
        currentRetry++;
        console.warn(`[KafkaProducer] Retry ${currentRetry}/${maxRetries}:`, error.message);
        
        // 指数退避
        const delay = Math.min(1000 * Math.pow(2, currentRetry), 10000);
        await this.sleep(delay);
        
        return this.sendWithRetry(messageRecord, maxRetries, currentRetry);
      }
      
      throw error;
    }
  }

  /**
   * 事务性发送（用于需要原子性的场景）
   */
  async sendInTransaction(topic, messages, transactionId) {
    const admin = this.kafka.admin();
    await admin.connect();
    
    try {
      await admin.createPartitions({
        topic,
        partitions: [{ count: 6 }], // 确保分区数足够
      });
    } finally {
      await admin.disconnect();
    }

    const transaction = await this.producer.transaction(transactionId);
    
    try {
      const results = [];
      
      for (const message of messages) {
        const result = await transaction.send({
          topic,
          messages: [
            {
              key: message.key,
              value: JSON.stringify(message.value),
              headers: message.headers || {},
            },
          ],
        });
        results.push(result);
      }
      
      // 提交事务
      await transaction.commit();
      
      console.log('[KafkaProducer] Transaction committed:', {
        transactionId,
        messageCount: messages.length,
      });
      
      return results;
    } catch (error) {
      // 回滚事务
      await transaction.abort();
      console.error('[KafkaProducer] Transaction aborted:', {
        transactionId,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * 处理发送失败（记录到本地队列待重试）
   */
  async handleSendFailure(topic, message, error) {
    // 可以接入本地文件队列或 Redis 队列
    const failedMessage = {
      topic,
      message,
      error: error.message,
      failedAt: new Date().toISOString(),
      retryCount: 0,
    };
    
    // 写入本地失败日志（生产环境建议使用 Redis 队列）
    const logFile = `/var/log/kafka/failed_messages_${new Date().toISOString().split('T')[0]}.log`;
    const logLine = JSON.stringify(failedMessage) + '\n';
    
    // 使用 fs 同步写入（简化版）
    const fs = require('fs');
    const dir = '/var/log/kafka';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.appendFileSync(logFile, logLine);
    
    // 触发告警
    await this.sendAlert('KAFKA_SEND_FAILURE', failedMessage);
  }

  /**
   * 发送告警通知
   */
  async sendAlert(type, data) {
    // 接入监控系统
    console.error(`[ALERT] ${type}:`, JSON.stringify(data));
  }

  generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

module.exports = new KafkaProducerService();
```

### 2.3 消费者配置与实现

#### 2.3.1 Kafka Consumer 配置

```javascript
// src/config/kafka/consumer.config.js

module.exports = {
  // 消费者组 ID（相同 Group ID 的消费者共享消费）
  groupId: 'mixla-consumer-group',
  
  // 消费者配置
  consumer: {
    // ============================================
    // 可靠性关键配置
    // ============================================
    
    // 是否自动提交 offset（生产环境必须 false）
    sessionTimeout: 30000,
    heartbeatInterval: 3000,
    
    // 手动提交 offset
    autoCommit: false,
    
    // 最大拉取消息数（根据处理能力调整）
    maxPollRecords: 100,
    
    // 最大拉取间隔（ms）
    maxPollIntervalMs: 300000,
    
    // 从最早位置消费（新消费者组从头开始）
    autoOffsetReset: 'earliest',
    
    // 允许自动创建 topic
    allowAutoTopicCreation: false,
    
    // 事务性 ID（用于 Exactly-Once）
    transactionId: null,
  },
  
  // 消费者线程数
  concurrency: 3,
  
  // 死信队列配置
  deadLetter: {
    // 死信 Topic
    topic: 'dlq.topic',
    // 最大重试次数
    maxRetries: 3,
    // 重试间隔（指数退避）
    retryIntervals: [1000, 5000, 30000],
  },
};
```

#### 2.3.2 高可靠消息消费实现

```javascript
// src/services/kafka/KafkaConsumerService.js

const { Kafka, logLevel, PartitionAssigners } = require('kafkajs');
const { consumerConfig } = require('../config/kafka/consumer.config');
const DeadLetterService = require('./DeadLetterService');

class KafkaConsumerService {
  constructor() {
    this.kafka = new Kafka({
      clientId: `${consumerConfig.groupId}-client`,
      brokers: process.env.KAFKA_BROKERS?.split(',') || ['localhost:9092'],
      logLevel: logLevel.WARN,
      retry: {
        initialRetryTime: 100,
        retries: 8,
      },
    });

    this.consumer = this.kafka.consumer({
      groupId: consumerConfig.groupId,
      sessionTimeout: consumerConfig.consumer.sessionTimeout,
      heartbeatInterval: consumerConfig.consumer.heartbeatInterval,
      maxPollRecords: consumerConfig.consumer.maxPollRecords,
      maxPollIntervalMs: consumerConfig.consumer.maxPollIntervalMs,
      autoCommit: consumerConfig.consumer.autoCommit,
      autoOffsetReset: consumerConfig.consumer.autoOffsetReset,
      allowAutoTopicCreation: consumerConfig.consumer.allowAutoTopicCreation,
    });

    this.deadLetterService = new DeadLetterService(this.kafka);
    this.messageHandlers = new Map();
    this.isRunning = false;
  }

  /**
   * 注册消息处理器
   * @param {string} topic - Topic 名称
   * @param {Function} handler - 消息处理函数
   */
  registerHandler(topic, handler) {
    this.messageHandlers.set(topic, handler);
    console.log(`[KafkaConsumer] Handler registered for topic: ${topic}`);
  }

  /**
   * 启动消费者
   */
  async start() {
    if (this.isRunning) {
      console.warn('[KafkaConsumer] Already running');
      return;
    }

    await this.consumer.connect();
    console.log('[KafkaConsumer] Connected');

    // 订阅所有已注册 handler 的 topic
    const topics = Array.from(this.messageHandlers.keys());
    if (topics.length > 0) {
      await this.consumer.subscribe({
        topics,
        fromBeginning: consumerConfig.consumer.autoOffsetReset === 'earliest',
      });
      console.log(`[KafkaConsumer] Subscribed to topics: ${topics.join(', ')}`);
    }

    this.isRunning = true;

    await this.consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        await this.processMessage(topic, partition, message);
      },
    });
  }

  /**
   * 处理单条消息
   */
  async processMessage(topic, partition, message) {
    const startTime = Date.now();
    const messageId = message.key?.toString() || `${topic}-${partition}-${message.offset}`;
    
    let retryCount = 0;
    const headers = message.headers || {};
    if (headers['retry-count']) {
      retryCount = parseInt(headers['retry-count'].toString(), 10);
    }

    try {
      // 解析消息内容
      const payload = JSON.parse(message.value.toString());
      
      console.log(`[KafkaConsumer] Processing message:`, {
        topic,
        partition,
        offset: message.offset,
        messageId: payload.id,
        retryCount,
      });

      // 获取对应 topic 的处理器
      const handler = this.messageHandlers.get(topic);
      if (!handler) {
        console.warn(`[KafkaConsumer] No handler for topic: ${topic}`);
        return;
      }

      // 执行处理逻辑
      await this.executeWithTimeout(
        handler,
        payload,
        30000 // 30s 超时
      );

      // 手动提交 offset（处理成功后才提交）
      await this.commitOffset(topic, partition, message.offset);

      const duration = Date.now() - startTime;
      console.log(`[KafkaConsumer] Message processed:`, {
        topic,
        offset: message.offset,
        duration,
      });

    } catch (error) {
      console.error(`[KafkaConsumer] Message processing failed:`, {
        topic,
        partition,
        offset: message.offset,
        error: error.message,
        retryCount,
      });

      // 判断是否需要发送到死信队列
      const maxRetries = consumerConfig.deadLetter.maxRetries;
      if (retryCount >= maxRetries) {
        // 发送到死信队列
        await this.deadLetterService.sendToDLQ(topic, message, error, 'MAX_RETRIES_EXCEEDED');
        await this.commitOffset(topic, partition, message.offset);
      } else {
        // 计算下次重试时间
        const retryIntervals = consumerConfig.deadLetter.retryIntervals;
        const delay = retryIntervals[Math.min(retryCount, retryIntervals.length - 1)];
        
        // 延迟重试（通过 scheduleRetry 实现）
        await this.scheduleRetry(topic, message, retryCount + 1, delay);
        await this.commitOffset(topic, partition, message.offset);
      }
    }
  }

  /**
   * 带超时的执行
   */
  executeWithTimeout(handler, payload, timeout) {
    return Promise.race([
      handler(payload),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Handler timeout')), timeout)
      ),
    ]);
  }

  /**
   * 延迟重试
   */
  async scheduleRetry(topic, message, retryCount, delay) {
    console.log(`[KafkaConsumer] Scheduling retry in ${delay}ms`, {
      topic,
      retryCount,
    });

    setTimeout(async () => {
      try {
        // 创建新的 producer 用于重试
        const producer = this.kafka.producer();
        await producer.connect();
        
        await producer.send({
          topic,
          messages: [
            {
              key: message.key,
              value: message.value,
              headers: {
                ...message.headers,
                'retry-count': retryCount.toString(),
                'retry-timestamp': Date.now().toString(),
              },
            },
          ],
        });
        
        await producer.disconnect();
      } catch (error) {
        console.error(`[KafkaConsumer] Retry scheduling failed:`, error);
      }
    }, delay);
  }

  /**
   * 提交 offset
   */
  async commitOffset(topic, partition, offset) {
    await this.consumer.commitOffsets([
      {
        topic,
        partition,
        offset: (BigInt(offset) + BigInt(1)).toString(), // 提交下一条消息的 offset
      },
    ]);
  }

  /**
   * 停止消费者
   */
  async stop() {
    if (!this.isRunning) return;
    
    await this.consumer.disconnect();
    this.isRunning = false;
    console.log('[KafkaConsumer] Stopped');
  }
}

module.exports = new KafkaConsumerService();
```

#### 2.3.3 死信队列服务

```javascript
// src/services/kafka/DeadLetterService.js

class DeadLetterService {
  constructor(kafka) {
    this.kafka = kafka;
    this.dlqTopic = consumerConfig?.deadLetter?.topic || 'dlq.mixla';
  }

  /**
   * 发送消息到死信队列
   */
  async sendToDLQ(originalTopic, message, error, reason) {
    const producer = this.kafka.producer();
    await producer.connect();

    try {
      const dlqMessage = {
        originalTopic,
        originalPartition: message.partition,
        originalOffset: message.offset,
        key: message.key?.toString(),
        value: message.value.toString(),
        headers: message.headers || {},
        error: {
          message: error.message,
          stack: error.stack,
        },
        reason,
        failedAt: new Date().toISOString(),
        dlqVersion: '1.0',
      };

      // 发送到死信 Topic（使用原始 Topic 作为 key，便于后续分析）
      await producer.send({
        topic: this.dlqTopic,
        messages: [
          {
            key: originalTopic,
            value: JSON.stringify(dlqMessage),
            headers: {
              'original-topic': originalTopic,
              'reason': reason,
              'dlq-timestamp': Date.now().toString(),
            },
          },
        ],
      });

      console.warn(`[DeadLetterService] Message sent to DLQ:`, {
        originalTopic,
        originalOffset: message.offset,
        reason,
      });

    } finally {
      await producer.disconnect();
    }
  }

  /**
   * 消费死信队列（人工处理）
   */
  async consumeDLQ(handler) {
    const consumer = this.kafka.consumer({ groupId: 'dlq-processor' });
    await consumer.connect();
    await consumer.subscribe({ topic: this.dlqTopic, fromBeginning: false });

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        const dlqMessage = JSON.parse(message.value.toString());
        console.log(`[DeadLetterService] Processing DLQ message:`, dlqMessage);
        
        try {
          await handler(dlqMessage);
          
          // 处理成功后可以删除或标记已处理
          await this.markAsProcessed(message);
        } catch (error) {
          console.error(`[DeadLetterService] DLQ processing failed:`, error);
        }
      },
    });
  }

  /**
   * 标记消息已处理
   */
  async markAsProcessed(message) {
    // 可以写入数据库或删除消息
    console.log(`[DeadLetterService] Message marked as processed`);
  }
}

module.exports = DeadLetterService;
```

### 2.4 Kafka Topic 创建脚本

```bash
#!/bin/bash
# scripts/kafka/create-topics.sh

KAFKA_BROKERS="${KAFKA_BROKERS:-localhost:9092}"

# 定义所有 Topic
TOPICS=(
  # 订单相关
  "order.created:6:3"
  "order.paid:6:3"
  "order.completed:6:3"
  "order.cancelled:6:3"
  
  # 支付相关
  "payment.succeeded:6:3"
  "payment.failed:6:3"
  "payment.refunded:6:3"
  
  # 用户相关
  "user.registered:3:3"
  "user.authenticated:3:3"
  
  # 位置相关
  "driver.location:9:3"
  "rider.location:9:3"
  
  # 死信队列
  "dlq.mixla:3:3"
)

# 创建 Topic 函数
create_topic() {
  local topic_name=$1
  local partitions=$2
  local replication=$3
  
  echo "Creating topic: $topic_name (partitions=$partitions, replication=$replication)"
  
  kafka-topics.sh --create \
    --bootstrap-server "$KAFKA_BROKERS" \
    --topic "$topic_name" \
    --partitions "$partitions" \
    --replication-factor "$replication" \
    --config "min.insync.replicas=2" \
    --config "retention.ms=604800000" \
    --config "cleanup.policy=delete" \
    2>/dev/null || echo "Topic $topic_name already exists"
}

# 遍历创建
for topic_config in "${TOPICS[@]}"; do
  IFS=':' read -r name partitions replication <<< "$topic_config"
  create_topic "$name" "$partitions" "$replication"
done

# 验证
echo ""
echo "=== Topic List ==="
kafka-topics.sh --list --bootstrap-server "$KAFKA_BROKERS"
```

### 2.5 监控指标

```javascript
// src/services/kafka/KafkaMonitorService.js

const { Kafka, logLevel } = require('kafkajs');

class KafkaMonitorService {
  constructor() {
    this.kafka = new Kafka({
      clientId: 'kafka-monitor',
      brokers: process.env.KAFKA_BROKERS?.split(',') || ['localhost:9092'],
      logLevel: logLevel.ERROR,
    });
    
    this.admin = this.kafka.admin();
    this.metrics = {
      producer: {},
      consumer: {},
      topic: {},
    };
  }

  /**
   * 获取 Topic 消费延迟
   */
  async getConsumerLag(topic, groupId) {
    const offsets = await this.admin.fetchOffsets({ groupId, topic });
    const earliest = await this.admin.fetchTopicOffsets(topic, 'earliest');
    const latest = await this.admin.fetchTopicOffsets(topic, 'latest');
    
    return offsets.map((offset, index) => ({
      partition: offset.partition,
      currentOffset: parseInt(offset.offset),
      earliestOffset: parseInt(earliest[index].offset),
      latestOffset: parseInt(latest[index].offset),
      lag: parseInt(latest[index].offset) - parseInt(offset.offset),
    }));
  }

  /**
   * 获取所有 Topic 的健康状态
   */
  async getTopicHealth() {
    const topics = await this.admin.listTopics();
    const healthReport = [];

    for (const topic of topics) {
      if (topic.startsWith('__')) continue; // 跳过内部 Topic
      
      const describeResult = await this.admin.describeTopics({ topics: [topic] });
      const topicInfo = describeResult.topics[0];
      
      healthReport.push({
        name: topic,
        partitions: topicInfo.partitions.length,
        inSyncReplicas: topicInfo.partitions.filter(
          p => p.isr && p.isr.length >= 2
        ).length,
        underReplicated: topicInfo.partitions.filter(
          p => !p.isr || p.isr.length < 2
        ).length,
      });
    }

    return healthReport;
  }

  /**
   * 获取生产者和消费者指标
   */
  async collectMetrics() {
    const consumerGroups = await this.admin.listGroups();
    
    for (const group of consumerGroups.groups) {
      const offsets = await this.admin.listGroupOffsets({ groupId: group.groupId });
      
      this.metrics.consumer[group.groupId] = {
        members: group.members.length,
        state: group.state,
        topics: Object.keys(offsets.partitions || {}),
      };
    }

    return this.metrics;
  }

  /**
   * 生成监控报告
   */
  async generateReport() {
    console.log('=== Kafka Health Report ===');
    
    const health = await this.getTopicHealth();
    const consumerGroups = await this.collectMetrics();
    
    console.log('\n## Topic Health:');
    health.forEach(topic => {
      const status = topic.underReplicated === 0 ? '✓ Healthy' : '✗ Unhealthy';
      console.log(`  ${topic.name}: ${status} (${topic.partitions} partitions, ${topic.inSyncReplicas} in-sync)`);
    });
    
    console.log('\n## Consumer Groups:');
    Object.entries(consumerGroups).forEach(([groupId, info]) => {
      console.log(`  ${groupId}: ${info.state} (${info.members} members)`);
    });
  }
}

module.exports = new KafkaMonitorService();
```

**关键监控指标清单：**

| 指标 | 告警阈值 | 说明 |
|------|----------|------|
| consumer_lag | > 10000 | 消费延迟过高 |
| produce_error_rate | > 1% | 生产失败率 |
| under_replicated_partitions | > 0 | 分区副本不足 |
| offline_partitions | > 0 | 存在离线分区 |
| message_retry_rate | > 5% | 重试率过高 |
| dlq_message_count | > 100 | 死信消息积压 |

---

## 三、数据库双写一致性方案

### 3.1 问题根源分析

```
┌─────────────────────────────────────────────────────────────┐
│                 MySQL + Redis 双写一致性问题                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  问题场景1：写操作时序问题                                    │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                                                       │   │
│  │  T1: 更新 MySQL (成功)                               │   │
│  │   │                                                  │   │
│  │   ▼                                                  │   │
│  │  T2: 写入 Redis (失败)  ←── 此时 Redis 数据过期      │   │
│  │   │                                                  │   │
│  │   ▼                                                  │   │
│  │  结果：数据库已更新，缓存仍是旧值                      │   │
│  │                                                       │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  问题场景2：并发读写导致数据不一致                            │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                                                       │   │
│  │  Thread A: 读取旧值 → Thread B: 更新数据库 → ...     │   │
│  │      ↓                                               │   │
│  │  Thread B: 删除缓存 → Thread A: 写入旧值到缓存         │   │
│  │      ↓                                               │   │
│  │  结果：缓存中保存了过期数据                             │   │
│  │                                                       │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  问题场景3：缓存穿透                                        │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                                                       │   │
│  │  大量请求查询不存在的数据 → 每次都查询数据库           │   │
│  │  → 数据库压力过大 → 服务雪崩                          │   │
│  │                                                       │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 延迟双删策略实现

#### 3.2.1 核心实现代码

```javascript
// src/services/cache/DualWriteCacheService.js

const Redis = require('ioredis');
const mysql = require('mysql2/promise');
const { v4: uuidv4 } = require('uuid');

class DualWriteCacheService {
  constructor() {
    this.redis = null;
    this.mysql = null;
    
    // 配置参数
    this.config = {
      // 第一次删除缓存后延迟多久再删除
      firstDeleteDelay: 100,        // ms
      
      // 重试配置
      retryCount: 3,
      retryDelay: 200,              // ms
      
      // 缓存默认过期时间
      defaultTTL: 3600,            // 1 hour
      
      // 分布式锁配置
      lockTTL: 5000,               // 5s
      lockRetryDelay: 50,
    };
  }

  /**
   * 初始化连接
   */
  async initialize() {
    // MySQL 连接池
    this.mysql = mysql.createPool({
      host: process.env.MYSQL_HOST,
      port: process.env.MYSQL_PORT || 3306,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
      waitForConnections: true,
      connectionLimit: 20,
      queueLimit: 0,
    });

    // Redis 连接
    this.redis = new Redis({
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD,
      db: process.env.REDIS_DB || 0,
      retryStrategy: (times) => Math.min(times * 50, 2000),
      maxRetriesPerRequest: 3,
    });

    // 连接测试
    await this.redis.ping();
    console.log('[DualWriteCache] Redis connected');
  }

  /**
   * ============================================================
   * 核心方法：延迟双删（更新操作）
   * ============================================================
   */
  async updateWithDualWrite(tableName, id, data, cacheKey) {
    const traceId = uuidv4();
    console.log(`[DualWriteCache][${traceId}] Starting dual write update`, { tableName, id });

    // 1. 获取分布式锁（防止并发更新）
    const lockKey = `lock:${cacheKey}`;
    const lockAcquired = await this.acquireLock(lockKey);
    
    if (!lockAcquired) {
      throw new Error('Failed to acquire lock for update');
    }

    try {
      // 2. 第一次删除缓存（删除可能存在的旧数据）
      await this.deleteCache(cacheKey);
      console.log(`[DualWriteCache][${traceId}] First cache delete completed`);

      // 3. 更新 MySQL 数据库
      await this.updateDatabase(tableName, id, data);
      console.log(`[DualWriteCache][${traceId}] Database update completed`);

      // 4. 延迟双删 - 异步删除缓存（处理并发场景）
      setTimeout(async () => {
        try {
          await this.deleteCacheWithRetry(cacheKey);
          console.log(`[DualWriteCache][${traceId}] Second cache delete completed`);
        } catch (error) {
          console.error(`[DualWriteCache][${traceId}] Second delete failed:`, error);
          // 记录错误但不阻塞主流程
          await this.logFailedDelete(cacheKey, error);
        }
      }, this.config.firstDeleteDelay);

      return true;
    } finally {
      // 5. 释放分布式锁
      await this.releaseLock(lockKey);
    }
  }

  /**
   * ============================================================
   * 核心方法：延迟双删（删除操作）
   * ============================================================
   */
  async deleteWithDualWrite(tableName, id, cacheKey) {
    const traceId = uuidv4();
    console.log(`[DualWriteCache][${traceId}] Starting dual write delete`, { tableName, id });

    // 1. 获取分布式锁
    const lockKey = `lock:${cacheKey}`;
    const lockAcquired = await this.acquireLock(lockKey);
    
    if (!lockAcquired) {
      throw new Error('Failed to acquire lock for delete');
    }

    try {
      // 2. 删除数据库记录
      await this.deleteFromDatabase(tableName, id);
      console.log(`[DualWriteCache][${traceId}] Database delete completed`);

      // 3. 删除缓存
      await this.deleteCache(cacheKey);
      console.log(`[DualWriteCache][${traceId}] Cache delete completed`);

      return true;
    } finally {
      await this.releaseLock(lockKey);
    }
  }

  /**
   * ============================================================
   * 读操作：Cache Aside 模式
   * ============================================================
   */
  async getWithCacheAside(tableName, id, cacheKey, options = {}) {
    const traceId = uuidv4();
    const { cacheFirst = true } = options;

    // 1. 先查缓存
    let cached = await this.getFromCache(cacheKey);
    
    if (cached !== null) {
      console.log(`[DualWriteCache][${traceId}] Cache hit: ${cacheKey}`);
      return cached;
    }

    console.log(`[DualWriteCache][${traceId}] Cache miss, querying database`);

    // 2. 缓存未命中，查询数据库
    const data = await this.queryFromDatabase(tableName, id);
    
    if (data === null) {
      // 数据不存在，写入空值防止缓存穿透
      console.log(`[DualWriteCache][${traceId}] Data not found, caching null`);
      await this.setNullValue(cacheKey);
      return null;
    }

    // 3. 写入缓存
    await this.setCache(cacheKey, data, this.config.defaultTTL);
    console.log(`[DualWriteCache][${traceId}] Data cached: ${cacheKey}`);

    return data;
  }

  // ==================== 私有方法 ====================

  /**
   * 获取分布式锁
   */
  async acquireLock(lockKey, ttl = this.config.lockTTL) {
    const lockValue = uuidv4();
    const result = await this.redis.set(lockKey, lockValue, 'PX', ttl, 'NX');
    
    if (result === 'OK') {
      this.currentLockValue = lockValue; // 用于释放锁
      return true;
    }
    
    // 尝试等待重试
    for (let i = 0; i < 10; i++) {
      await this.sleep(this.config.lockRetryDelay);
      const retryResult = await this.redis.set(lockKey, lockValue, 'PX', ttl, 'NX');
      if (retryResult === 'OK') {
        this.currentLockValue = lockValue;
        return true;
      }
    }
    
    return false;
  }

  /**
   * 释放分布式锁
   */
  async releaseLock(lockKey) {
    if (!this.currentLockValue) return;
    
    // 使用 Lua 脚本确保只释放自己的锁
    const script = `
      if redis.call("get", KEYS[1]) == ARGV[1] then
        return redis.call("del", KEYS[1])
      else
        return 0
      end
    `;
    
    await this.redis.eval(script, 1, lockKey, this.currentLockValue);
    this.currentLockValue = null;
  }

  /**
   * 从缓存获取
   */
  async getFromCache(cacheKey) {
    const value = await this.redis.get(cacheKey);
    
    if (value === null) return null;
    
    try {
      const parsed = JSON.parse(value);
      // 检查是否为null值标记
      if (parsed && parsed.__null_marker__) {
        return null;
      }
      return parsed;
    } catch {
      return value;
    }
  }

  /**
   * 设置缓存
   */
  async setCache(cacheKey, data, ttl) {
    const value = typeof data === 'string' ? data : JSON.stringify(data);
    await this.redis.setex(cacheKey, ttl, value);
  }

  /**
   * 设置空值（防止缓存穿透）
   */
  async setNullValue(cacheKey, ttl = 60) {
    await this.redis.setex(cacheKey, ttl, JSON.stringify({ __null_marker__: true }));
  }

  /**
   * 删除缓存
   */
  async deleteCache(cacheKey) {
    await this.redis.del(cacheKey);
  }

  /**
   * 带重试的缓存删除
   */
  async deleteCacheWithRetry(cacheKey) {
    for (let i = 0; i < this.config.retryCount; i++) {
      try {
        await this.redis.del(cacheKey);
        return;
      } catch (error) {
        if (i === this.config.retryCount - 1) throw error;
        await this.sleep(this.config.retryDelay);
      }
    }
  }

  /**
   * 更新数据库
   */
  async updateDatabase(tableName, id, data) {
    const fields = Object.keys(data);
    const values = Object.values(data);
    const setClause = fields.map(f => `${f} = ?`).join(', ');
    
    const [result] = await this.mysql.execute(
      `UPDATE ${tableName} SET ${setClause}, updated_at = NOW() WHERE id = ?`,
      [...values, id]
    );
    
    if (result.affectedRows === 0) {
      throw new Error(`Record not found: ${tableName}.${id}`);
    }
    
    return result;
  }

  /**
   * 删除数据库记录
   */
  async deleteFromDatabase(tableName, id) {
    const [result] = await this.mysql.execute(
      `DELETE FROM ${tableName} WHERE id = ?`,
      [id]
    );
    
    if (result.affectedRows === 0) {
      throw new Error(`Record not found: ${tableName}.${id}`);
    }
    
    return result;
  }

  /**
   * 从数据库查询
   */
  async queryFromDatabase(tableName, id) {
    const [rows] = await this.mysql.execute(
      `SELECT * FROM ${tableName} WHERE id = ?`,
      [id]
    );
    
    return rows.length > 0 ? rows[0] : null;
  }

  /**
   * 记录删除失败日志
   */
  async logFailedDelete(cacheKey, error) {
    const logEntry = {
      cacheKey,
      error: error.message,
      timestamp: new Date().toISOString(),
    };
    
    // 写入 Redis 日志
    await this.redis.lpush('cache:failed_deletes', JSON.stringify(logEntry));
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = new DualWriteCacheService();
```

#### 3.2.2 在服务中使用

```javascript
// src/services/UserService.js

const DualWriteCacheService = require('./cache/DualWriteCacheService');

class UserService {
  constructor() {
    this.cache = DualWriteCacheService;
  }

  /**
   * 更新用户信息
   */
  async updateUser(userId, updateData) {
    const cacheKey = `user:${userId}`;
    
    // 使用延迟双删策略更新
    await this.cache.updateWithDualWrite(
      'users',           // 表名
      userId,            // ID
      updateData,        // 更新的数据
      cacheKey           // 缓存 key
    );

    return { success: true, userId };
  }

  /**
   * 删除用户
   */
  async deleteUser(userId) {
    const cacheKey = `user:${userId}`;
    
    await this.cache.deleteWithDualWrite(
      'users',
      userId,
      cacheKey
    );

    return { success: true };
  }

  /**
   * 获取用户信息（Cache Aside）
   */
  async getUser(userId) {
    const cacheKey = `user:${userId}`;
    
    return await this.cache.getWithCacheAside(
      'users',
      userId,
      cacheKey,
      { cacheFirst: true }
    );
  }
}

module.exports = new UserService();
```

### 3.3 最终一致性保障机制

#### 3.3.1 数据校验定时任务

```javascript
// src/jobs/DataConsistencyCheckJob.js

const mysql = require('mysql2/promise');
const Redis = require('ioredis');

class DataConsistencyCheckJob {
  constructor() {
    this.mysql = null;
    this.redis = null;
    
    // 配置
    this.config = {
      batchSize: 100,
      checkInterval: 3600000, // 1小时
      inconsistencyThreshold: 0.01, // 1% 容忍度
    };
    
    // 需要校验的表和缓存映射
    this.tablesToCheck = [
      { table: 'users', cacheKeyPrefix: 'user:', idField: 'id' },
      { table: 'orders', cacheKeyPrefix: 'order:', idField: 'id' },
      { table: 'products', cacheKeyPrefix: 'product:', idField: 'id' },
    ];
  }

  async initialize() {
    this.mysql = mysql.createPool({
      host: process.env.MYSQL_HOST,
      database: process.env.MYSQL_DATABASE,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
    });

    this.redis = new Redis({
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
    });
  }

  /**
   * 执行一致性检查
   */
  async run() {
    console.log('[ConsistencyCheck] Starting data consistency check');
    
    const report = {
      startTime: new Date().toISOString(),
      tables: [],
      totalChecked: 0,
      inconsistencies: 0,
    };

    for (const tableConfig of this.tablesToCheck) {
      const tableReport = await this.checkTable(tableConfig);
      report.tables.push(tableReport);
      report.totalChecked += tableReport.checked;
      report.inconsistencies += tableReport.inconsistencies;
    }

    report.endTime = new Date().toISOString();
    report.inconsistencyRate = (report.inconsistencies / report.totalChecked * 100).toFixed(2) + '%';

    // 生成报告
    await this.generateReport(report);

    // 如果不一致率超过阈值，发送告警
    if (parseFloat(report.inconsistencyRate) > this.config.inconsistencyThreshold * 100) {
      await this.sendAlert(report);
    }

    return report;
  }

  /**
   * 检查单个表
   */
  async checkTable(tableConfig) {
    const { table, cacheKeyPrefix, idField } = tableConfig;
    let checked = 0;
    let inconsistencies = [];
    let offset = 0;

    while (true) {
      // 分批查询数据库
      const [rows] = await this.mysql.execute(
        `SELECT * FROM ${table} WHERE ${idField} > ? ORDER BY ${idField} LIMIT ?`,
        [offset, this.config.batchSize]
      );

      if (rows.length === 0) break;

      for (const row of rows) {
        const cacheKey = `${cacheKeyPrefix}${row[idField]}`;
        const cached = await this.redis.get(cacheKey);
        
        checked++;
        offset = row[idField];

        // 检查一致性
        if (cached !== null) {
          try {
            const cachedData = JSON.parse(cached);
            
            // 比较关键字段（排除 updated_at 等动态字段）
            const dbVersion = this.normalizeForComparison(row);
            const cacheVersion = this.normalizeForComparison(cachedData);
            
            if (JSON.stringify(dbVersion) !== JSON.stringify(cacheVersion)) {
              inconsistencies.push({
                id: row[id_field],
                cacheKey,
                dbData: row,
                cachedData,
                difference: this.findDifference(row, cachedData),
              });
              
              // 自动修复
              await this.autoFix(cacheKey, row);
            }
          } catch (error) {
            console.error(`[ConsistencyCheck] Parse error for ${cacheKey}:`, error);
          }
        }
      }
    }

    return {
      table,
      checked,
      inconsistencies: inconsistencies.length,
      inconsistencyList: inconsistencies,
    };
  }

  /**
   * 标准化用于比较的数据
   */
  normalizeForComparison(data) {
    if (!data || typeof data !== 'object') return data;
    
    const normalized = { ...data };
    
    // 移除不需要比较的字段
    delete normalized.updated_at;
    delete normalized.__v;
    
    // 转换日期字段
    ['created_at', 'updated_at', 'timestamp'].forEach(field => {
      if (normalized[field]) {
        normalized[field] = new Date(normalized[field]).getTime();
      }
    });

    return normalized;
  }

  /**
   * 查找差异
   */
  findDifference(dbData, cachedData) {
    const differences = [];
    const allKeys = new Set([...Object.keys(dbData), ...Object.keys(cachedData)]);
    
    for (const key of allKeys) {
      if (JSON.stringify(dbData[key]) !== JSON.stringify(cachedData[key])) {
        differences.push({
          field: key,
          dbValue: dbData[key],
          cacheValue: cachedData[key],
        });
      }
    }

    return differences;
  }

  /**
   * 自动修复不一致
   */
  async autoFix(cacheKey, dbData) {
    try {
      await this.redis.setex(
        cacheKey,
        3600, // 1小时
        JSON.stringify(dbData)
      );
      console.log(`[ConsistencyCheck] Auto-fixed: ${cacheKey}`);
    } catch (error) {
      console.error(`[ConsistencyCheck] Auto-fix failed for ${cacheKey}:`, error);
    }
  }

  /**
   * 生成报告
   */
  async generateReport(report) {
    const reportKey = `consistency_report_${Date.now()}`;
    await this.redis.setex(reportKey, 86400, JSON.stringify(report));
    
    console.log('[ConsistencyCheck] Report generated:', report);
  }

  /**
   * 发送告警
   */
  async sendAlert(report) {
    const alertMessage = `
⚠️ 数据一致性告警

检测时间: ${report.startTime}
检查表数: ${report.tables.length}
检查记录: ${report.totalChecked}
不一致记录: ${report.inconsistencies}
不一致率: ${report.inconsistencyRate}

详情:
${report.tables.map(t => `- ${t.table}: ${t.inconsistencies}/${t.checked}`).join('\n')}
`;

    // 接入告警系统
    console.error('[ALERT] Data Consistency Issue:', alertMessage);
  }
}

// 定时执行
const job = new DataConsistencyCheckJob();
job.initialize().then(() => {
  setInterval(() => job.run(), job.config.checkInterval);
  job.run(); // 立即执行一次
});

module.exports = job;
```

#### 3.3.2 异步补偿队列

```javascript
// src/services/consistency/ConsistencyCompensator.js

const Redis = require('ioredis');

/**
 * 数据一致性补偿器
 * 处理延迟双删失败的场景
 */
class ConsistencyCompensator {
  constructor() {
    this.redis = new Redis({
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
    });
    
    this.config = {
      // 补偿队列名称
      compensateQueue: 'consistency:compensate',
      // 最大重试次数
      maxRetries: 3,
      // 处理间隔
      processInterval: 5000,
    };
  }

  /**
   * 添加补偿任务
   */
  async addCompensateTask(operation) {
    const task = {
      ...operation,
      addedAt: new Date().toISOString(),
      retries: 0,
      id: require('uuid').v4(),
    };

    await this.redis.lpush(this.compensateQueue, JSON.stringify(task));
    console.log('[Compensator] Task added:', task.id);
  }

  /**
   * 处理补偿队列
   */
  async processQueue() {
    while (true) {
      try {
        const taskJson = await this.redis.rpop(this.compensateQueue);
        
        if (!taskJson) {
          await this.sleep(this.config.processInterval);
          continue;
        }

        const task = JSON.parse(taskJson);
        await this.processTask(task);
        
      } catch (error) {
        console.error('[Compensator] Process error:', error);
        await this.sleep(this.config.processInterval);
      }
    }
  }

  /**
   * 处理单个补偿任务
   */
  async processTask(task) {
    console.log(`[Compensator] Processing task: ${task.id}`, task);

    try {
      switch (task.type) {
        case 'DELETE_CACHE':
          await this.compensateDelete(task);
          break;
        case 'UPDATE_CACHE':
          await this.compensateUpdate(task);
          break;
        case 'INVALIDATE_CACHE':
          await this.compensateInvalidate(task);
          break;
        default:
          console.warn(`[Compensator] Unknown task type: ${task.type}`);
      }
      
      console.log(`[Compensator] Task completed: ${task.id}`);
      
    } catch (error) {
      console.error(`[Compensator] Task failed: ${task.id}`, error);
      
      // 增加重试次数后放回队列
      task.retries++;
      task.lastError = error.message;
      task.lastRetryAt = new Date().toISOString();
      
      if (task.retries < this.config.maxRetries) {
        await this.redis.lpush(this.compensateQueue, JSON.stringify(task));
      } else {
        // 超过最大重试次数，移到死信队列
        await this.redis.lpush('consistency:dlq', JSON.stringify(task));
        console.error(`[Compensator] Task moved to DLQ: ${task.id}`);
      }
    }
  }

  /**
   * 补偿删除缓存
   */
  async compensateDelete(task) {
    await this.redis.del(task.cacheKey);
  }

  /**
   * 补偿更新缓存
   */
  async compensateUpdate(task) {
    await this.redis.setex(
      task.cacheKey,
      task.ttl || 3600,
      JSON.stringify(task.data)
    );
  }

  /**
   * 补偿失效缓存
   */
  async compensateInvalidate(task) {
    // 使缓存数据过期
    const current = await this.redis.get(task.cacheKey);
    if (current) {
      await this.redis.setex(task.cacheKey, 1, current); // 1秒后过期
    }
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = new ConsistencyCompensator();
```

### 3.4 缓存保护机制

```javascript
// src/middleware/CacheProtectionMiddleware.js

/**
 * 缓存保护中间件
 * 防止缓存穿透、击穿、雪崩
 */

class CacheProtectionMiddleware {
  constructor(redis) {
    this.redis = redis;
    
    // 配置
    this.config = {
      // 空值缓存时间
      nullValueTTL: 60,
      // 热点数据过期时间
      hotKeyTTL: 300,
      // 分布式锁参数
      lockTTL: 5000,
      lockRetry: 3,
    };
  }

  /**
   * 缓存穿透保护：空值标记
   */
  isNullMarker(value) {
    if (!value) return false;
    try {
      const parsed = JSON.parse(value);
      return parsed && parsed.__null_marker__ === true;
    } catch {
      return false;
    }
  }

  /**
   * 缓存击穿保护：分布式锁 + 热点数据永不过期
   */
  async getWithLock(key, fetchFn, ttl = 3600) {
    // 1. 先查缓存
    const cached = await this.redis.get(key);
    
    if (cached !== null) {
      if (this.isNullMarker(cached)) {
        return null; // 空值，直接返回
      }
      return JSON.parse(cached);
    }

    // 2. 缓存未命中，获取分布式锁
    const lockKey = `lock:${key}`;
    const lockValue = require('uuid').v4();
    
    const acquired = await this.redis.set(
      lockKey,
      lockValue,
      'PX',
      this.config.lockTTL,
      'NX'
    );

    if (!acquired) {
      // 未获取到锁，等待后重试
      await new Promise(r => setTimeout(r, 100));
      return this.getWithLock(key, fetchFn, ttl);
    }

    try {
      // 3. 获取锁成功，从数据库加载
      const data = await fetchFn();
      
      if (data === null) {
        // 缓存空值
        await this.redis.setex(
          key,
          this.config.nullValueTTL,
          JSON.stringify({ __null_marker__: true })
        );
        return null;
      }

      // 4. 写入缓存
      await this.redis.setex(key, ttl, JSON.stringify(data));
      return data;
      
    } finally {
      // 5. 释放锁
      await this.redis.eval(
        `if redis.call("get", KEYS[1]) == ARGV[1] then return redis.call("del", KEYS[1]) else return 0 end`,
        1,
        lockKey,
        lockValue
      );
    }
  }

  /**
   * 缓存雪崩保护：过期时间加随机值
   */
  calculateTTL(baseTTL, variancePercent = 20) {
    const variance = baseTTL * (variancePercent / 100);
    const randomFactor = Math.random() * variance;
    return Math.floor(baseTTL + randomFactor);
  }

  /**
   * 批量获取（减少 Redis 连接数）
   */
  async mget(keys) {
    if (keys.length === 0) return [];
    
    const pipeline = this.redis.pipeline();
    keys.forEach(key => pipeline.get(key));
    const results = await pipeline.exec();
    
    return results.map(([err, value]) => {
      if (err || !value) return null;
      if (this.isNullMarker(value)) return null;
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    });
  }

  /**
   * 批量设置
   */
  async mset(keyValuePairs, defaultTTL) {
    if (Object.keys(keyValuePairs).length === 0) return;
    
    const pipeline = this.redis.pipeline();
    
    Object.entries(keyValuePairs).forEach(([key, value]) => {
      const ttl = this.calculateTTL(defaultTTL);
      const serialized = typeof value === 'string' ? value : JSON.stringify(value);
      pipeline.setex(key, ttl, serialized);
    });
    
    await pipeline.exec();
  }
}

module.exports = CacheProtectionMiddleware;
```

---

## 四、服务熔断和降级方案

### 4.1 问题根源分析

```
┌─────────────────────────────────────────────────────────────┐
│                   服务调用无熔断风险                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  典型故障传播链：                                            │
│                                                             │
│  ┌─────────┐                                               │
│  │  用户   │                                                │
│  └────┬────┘                                               │
│       │                                                    │
│       ▼                                                    │
│  ┌─────────┐      ┌─────────┐      ┌─────────┐             │
│  │ Gateway │ ───→ │ Service │ ───→ │ Service │             │
│  └─────────┘      │    A    │      │    B    │             │
│                   └────┬────┘      └────┬────┘             │
│                        │                │                  │
│                        │    ┌─────────┐  │                  │
│                        └───→│ Service │←─┘                  │
│                             │    C    │                     │
│                             └────┬────┘                     │
│                                  │                          │
│                                  ▼                          │
│                             ┌─────────┐                    │
│                             │ 数据库   │                    │
│                             │ 超时/宕机│                    │
│                             └─────────┘                    │
│                                  │                          │
│                                  ▼                          │
│  故障结果：                                               │
│  • Service C 超时                                        │
│  • Service B 等待堆积                                    │
│  • Service A 资源耗尽                                     │
│  • Gateway 请求堆积                                       │
│  • 整个系统不可用                                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 熔断器选型

#### Node.js 熔断器对比

| 熔断器库 | 特性 | 适用场景 | 推荐指数 |
|----------|------|----------|----------|
| **opossum** | 功能完整、社区活跃 | 通用场景 | ⭐⭐⭐⭐⭐ |
| circuit-breaker-js | 轻量级 | 简单场景 | ⭐⭐⭐ |
| Hystrix | 功能丰富 | 兼容 Java 风格 | ⭐⭐⭐ |
| node-retry | 简单重试 | 无熔断需求 | ⭐⭐ |

**推荐：opossum**（功能完整、性能良好、文档完善）

### 4.3 opossum 熔断器实现

#### 4.3.1 基础熔断器封装

```javascript
// src/services/circuitBreaker/CircuitBreakerFactory.js

const CircuitBreaker = require('opossum');
const { v4: uuidv4 } = require('uuid');

class CircuitBreakerFactory {
  constructor() {
    this.breakers = new Map();
    
    // 默认配置
    this.defaultOptions = {
      // 熔断器配置
      timeout: 3000,                    // 请求超时（ms）
      errorThresholdPercentage: 50,     // 错误率阈值（%）
      resetTimeout: 30000,              // 熔断后尝试恢复时间（ms）
      
      // 容量配置
      capacity: Infinity,               // 并发请求上限
      maxConcurrent: Infinity,         // 最大并发数
      
      // 统计配置
      volumeThreshold: 10,              // 触发熔断的最小请求数
      
      // 缓存配置
      enableCache: false,               // 是否启用结果缓存
      cacheMaxAge: 5000,               // 缓存时间（ms）
      
      // 降级函数必须提供
      allowCustomFallbacks: true,
    };
  }

  /**
   * 创建熔断器
   * @param {string} name - 熔断器名称
   * @param {Object} options - 配置选项
   */
  create(name, options = {}) {
    // 如果已存在，直接返回
    if (this.breakers.has(name)) {
      return this.breakers.get(name);
    }

    const breakerOptions = {
      ...this.defaultOptions,
      ...options,
    };

    const breaker = new CircuitBreaker(this.defaultAction.bind(this), breakerOptions);
    
    // 事件监听
    this.setupBreakerEvents(breaker, name);
    
    this.breakers.set(name, breaker);
    console.log(`[CircuitBreaker] Created: ${name}`, breakerOptions);

    return breaker;
  }

  /**
   * 创建带降级函数的熔断器
   */
  createWithFallback(name, action, fallback, options = {}) {
    const breaker = this.create(name, options);
    
    breaker.on('fallback', (result) => {
      console.warn(`[CircuitBreaker] Fallback triggered: ${name}`);
    });

    return {
      breaker,
      
      // 执行带熔断保护的调用
      async fire(...args) {
        return breaker.fire(action, ...args, fallback);
      },
      
      // 仅执行动作（使用默认降级）
      async execute(actionFn, fallbackFn, ...args) {
        const wrappedAction = async () => actionFn(...args);
        const wrappedFallback = async () => fallbackFn ? fallbackFn(...args) : null;
        
        return breaker.execute(wrappedAction, wrappedFallback);
      },
    };
  }

  /**
   * 获取熔断器
   */
  get(name) {
    return this.breakers.get(name);
  }

  /**
   * 获取熔断器状态
   */
  getStatus(name) {
    const breaker = this.breakers.get(name);
    if (!breaker) return null;

    const stats = breaker.stats;
    
    return {
      name,
      enabled: breaker.enabled,
      status: breaker.status,
      // 统计数据
      metrics: {
        fires: stats.fires,
        successes: stats.successes,
        failures: stats.failures,
        fallbacks: stats.fallbacks,
        rejections: stats.rejects,
        timeouts: stats.timeouts,
      },
      // 计算指标
      calculated: {
        errorRate: stats.fires > 0 ? (stats.failures / stats.fires * 100).toFixed(2) + '%' : '0%',
        avgResponseTime: stats.latencyMean ? stats.latencyMean.toFixed(2) + 'ms' : 'N/A',
      },
    };
  }

  /**
   * 获取所有熔断器状态
   */
  getAllStatus() {
    const status = {};
    for (const [name] of this.breakers) {
      status[name] = this.getStatus(name);
    }
    return status;
  }

  /**
   * 启用/禁用熔断器
   */
  setEnabled(name, enabled) {
    const breaker = this.breakers.get(name);
    if (breaker) {
      breaker.enabled = enabled;
      console.log(`[CircuitBreaker] ${name} ${enabled ? 'enabled' : 'disabled'}`);
    }
  }

  /**
   * 重置熔断器统计
   */
  reset(name) {
    const breaker = this.breakers.get(name);
    if (breaker) {
      breaker.reset();
      console.log(`[CircuitBreaker] Reset: ${name}`);
    }
  }

  /**
   * 默认动作（需要外部传入）
   */
  defaultAction() {
    throw new Error('Action not implemented');
  }

  /**
   * 设置熔断器事件监听
   */
  setupBreakerEvents(breaker, name) {
    // 熔断打开
    breaker.on('open', () => {
      console.error(`[CircuitBreaker][ALERT] ${name} OPEN`);
      this.sendAlert('CIRCUIT_OPEN', { breaker: name });
    });

    // 熔断关闭
    breaker.on('close', () => {
      console.log(`[CircuitBreaker] ${name} CLOSED`);
    });

    // 熔断半开
    breaker.on('halfOpen', () => {
      console.warn(`[CircuitBreaker] ${name} HALF_OPEN`);
    });

    // 执行成功
    breaker.on('success', (result, latency) => {
      // console.debug(`[CircuitBreaker] ${name} SUCCESS (${latency}ms)`);
    });

    // 执行失败
    breaker.on('failure', (err, latency) => {
      console.warn(`[CircuitBreaker] ${name} FAILURE (${latency}ms):`, err.message);
    });

    // 超时
    breaker.on('timeout', (err) => {
      console.warn(`[CircuitBreaker] ${name} TIMEOUT:`, err.message);
    });

    // 拒绝
    breaker.on('reject', (err) => {
      console.warn(`[CircuitBreaker] ${name} REJECTED`);
    });

    // 降级
    breaker.on('fallback', (result) => {
      console.warn(`[CircuitBreaker] ${name} FALLBACK`);
    });

    // 缓存命中
    breaker.on('cacheHit', () => {
      // console.debug(`[CircuitBreaker] ${name} CACHE_HIT`);
    });

    // 缓存未命中
    breaker.on('cacheMiss', () => {
      // console.debug(`[CircuitBreaker] ${name} CACHE_MISS`);
    });
  }

  /**
   * 发送告警
   */
  sendAlert(type, data) {
    console.error(`[CircuitBreaker][ALERT] ${type}:`, JSON.stringify(data));
    // 可以接入钉钉/飞书/Slack 等告警渠道
  }
}

module.exports = new CircuitBreakerFactory();
```

#### 4.3.2 HTTP 服务调用熔断封装

```javascript
// src/services/circuitBreaker/HttpCircuitBreaker.js

const CircuitBreakerFactory = require('./CircuitBreakerFactory');
const axios = require('axios');

class HttpCircuitBreaker {
  constructor() {
    this.factory = CircuitBreakerFactory;
    
    // 预定义的熔断器配置
    this.presetConfigs = {
      // 快速失败：支付服务
      payment: {
        timeout: 5000,
        errorThresholdPercentage: 30,
        resetTimeout: 60000,
        volumeThreshold: 5,
      },
      
      // 标准：订单服务
      order: {
        timeout: 3000,
        errorThresholdPercentage: 50,
        resetTimeout: 30000,
        volumeThreshold: 10,
      },
      
      // 宽松：AI 服务
      ai: {
        timeout: 30000,
        errorThresholdPercentage: 70,
        resetTimeout: 60000,
        volumeThreshold: 3,
      },
      
      // 严格：核心服务
      core: {
        timeout: 2000,
        errorThresholdPercentage: 40,
        resetTimeout: 30000,
        volumeThreshold: 10,
      },
    };
  }

  /**
   * 创建 HTTP 调用熔断器
   * @param {string} name - 服务名称
   * @param {string} baseURL - 服务地址
   * @param {Object} options - 额外配置
   */
  create(name, baseURL, options = {}) {
    const presetKey = options.preset || 'order';
    const presetConfig = this.presetConfigs[presetKey] || this.presetConfigs.order;
    
    const breaker = this.factory.create(name, {
      ...presetConfig,
      ...options,
    });

    // HTTP 客户端
    const httpClient = axios.create({
      baseURL,
      timeout: presetConfig.timeout,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // 创建包装后的方法
    const wrappedClient = {};

    // 包装常用 HTTP 方法
    ['get', 'post', 'put', 'patch', 'delete'].forEach(method => {
      wrappedClient[method] = async (url, data, config = {}) => {
        return breaker.fire(
          this.httpAction,
          this.httpFallback,
          method,
          url,
          data,
          { ...config, httpClient }
        );
      };
    });

    return {
      breaker,
      client: wrappedClient,
      
      // 直接调用方法
      async request(method, url, data, config) {
        return breaker.fire(
          this.httpAction,
          this.httpFallback,
          method,
          url,
          data,
          { ...config, httpClient }
        );
      },
    };
  }

  /**
   * HTTP 动作
   */
  async httpAction(method, url, data, { httpClient }) {
    const response = await httpClient[method](url, data);
    return response.data;
  }

  /**
   * HTTP 降级处理
   */
  async httpFallback(method, url, data, context, error) {
    console.error(`[HttpCircuitBreaker] Fallback triggered: ${method} ${url}`, {
      error: error.message,
    });
    
    // 根据不同接口返回不同的降级数据
    const fallbackResponses = {
      // 订单服务降级
      'order': {
        success: false,
        code: 'SERVICE_UNAVAILABLE',
        message: '服务暂时不可用，请稍后重试',
        data: null,
      },
      
      // 支付服务降级
      'payment': {
        success: false,
        code: 'PAYMENT_UNAVAILABLE',
        message: '支付服务暂时不可用',
        data: null,
        fallback: true,
      },
      
      // 用户服务降级
      'user': {
        success: false,
        code: 'USER_SERVICE_UNAVAILABLE',
        message: '用户服务暂时不可用',
        data: null,
      },
      
      // 默认降级
      'default': {
        success: false,
        code: 'SERVICE_UNAVAILABLE',
        message: '服务暂时不可用',
        data: null,
      },
    };

    // 根据 URL 路径匹配降级响应
    for (const [key, response] of Object.entries(fallbackResponses)) {
      if (url.includes(key)) {
        return response;
      }
    }

    return fallbackResponses.default;
  }

  /**
   * 创建带缓存的调用
   */
  createCached(name, baseURL, cacheConfig = {}) {
    const { ttl = 60000, cacheKeyFn } = cacheConfig;
    
    const breaker = this.factory.create(name, {
      enableCache: true,
      cacheMaxAge: ttl,
      ...this.presetConfigs.order,
    });

    const httpClient = axios.create({
      baseURL,
      timeout: 3000,
    });

    return {
      breaker,
      
      async get(url, params = {}) {
        const cacheKey = cacheKeyFn ? cacheKeyFn(url, params) : url;
        
        return breaker.fire(
          async () => {
            const response = await httpClient.get(url, { params });
            return response.data;
          },
          async () => null, // 降级返回 null
          cacheKey
        );
      },
    };
  }
}

module.exports = new HttpCircuitBreaker();
```

#### 4.3.3 服务调用熔断配置

```javascript
// src/config/circuitBreaker.config.js

module.exports = {
  // 全局默认配置
  default: {
    timeout: 3000,
    errorThresholdPercentage: 50,
    resetTimeout: 30000,
    volumeThreshold: 10,
  },

  // 特定服务配置
  services: {
    // 用户服务 - 标准配置
    'user-service': {
      timeout: 3000,
      errorThresholdPercentage: 50,
      resetTimeout: 30000,
      volumeThreshold: 10,
      fallback: 'userServiceFallback',
    },

    // 订单服务 - 关键服务，配置较严格
    'order-service': {
      timeout: 2000,
      errorThresholdPercentage: 40,
      resetTimeout: 30000,
      volumeThreshold: 10,
      fallback: 'orderServiceFallback',
    },

    // 支付服务 - 最高可靠性要求
    'payment-service': {
      timeout: 5000,
      errorThresholdPercentage: 30,
      resetTimeout: 60000,
      volumeThreshold: 5,
      fallback: 'paymentServiceFallback',
      // 支付服务禁止完全降级，返回错误
      fallbackType: 'error',
    },

    // 司机服务 - 实时性要求高
    'driver-service': {
      timeout: 1000,
      errorThresholdPercentage: 50,
      resetTimeout: 20000,
      volumeThreshold: 20,
      fallback: 'driverServiceFallback',
    },

    // AI 服务 - 可接受高延迟
    'ai-service': {
      timeout: 30000,
      errorThresholdPercentage: 70,
      resetTimeout: 60000,
      volumeThreshold: 3,
      fallback: 'aiServiceFallback',
      // AI 服务可以返回默认响应
      fallbackType: 'default',
    },

    // 商品服务 - 读多写少
    'product-service': {
      timeout: 2000,
      errorThresholdPercentage: 50,
      resetTimeout: 30000,
      volumeThreshold: 10,
      fallback: 'productServiceFallback',
      // 允许返回缓存的旧数据
      fallbackType: 'cache',
    },
  },

  // 降级函数定义
  fallbacks: {
    // 用户服务降级
    userServiceFallback: async () => ({
      success: false,
      code: 'USER_SERVICE_UNAVAILABLE',
      message: '用户服务暂时不可用',
      data: {
        userId: null,
        isGuest: true,
      },
    }),

    // 订单服务降级
    orderServiceFallback: async () => ({
      success: false,
      code: 'ORDER_SERVICE_UNAVAILABLE',
      message: '订单服务暂时不可用，请稍后重试',
      data: null,
    }),

    // 支付服务降级
    paymentServiceFallback: async () => ({
      success: false,
      code: 'PAYMENT_UNAVAILABLE',
      message: '支付服务暂时不可用，请选择其他支付方式',
      data: {
        retryable: true,
        alternativeMethods: ['wallet', 'cash'],
      },
    }),

    // 司机服务降级
    driverServiceFallback: async () => ({
      success: false,
      code: 'DRIVER_SERVICE_UNAVAILABLE',
      message: '司机服务暂时不可用',
      data: {
        availableDrivers: 0,
        estimatedWait: null,
      },
    }),

    // AI 服务降级
    aiServiceFallback: async () => ({
      success: true,
      code: 'AI_FALLBACK',
      message: 'AI服务降级，返回默认结果',
      data: {
        recommendation: [],
        personalized: false,
        defaultResponse: true,
      },
    }),

    // 商品服务降级
    productServiceFallback: async (cacheKey, cachedData) => ({
      success: true,
      code: 'CACHED_RESPONSE',
      message: '商品数据可能存在延迟',
      data: cachedData || [],
      cached: true,
    }),
  },

  // 告警配置
  alert: {
    enabled: true,
    threshold: {
      // 熔断打开时告警
      circuitOpen: true,
      // 错误率超过阈值告警
      errorRateAbove: 80,
      // 延迟过高告警
      latencyAbove: 5000,
    },
    channels: ['log', 'webhook'],
    webhookUrl: process.env.ALERT_WEBHOOK_URL,
  },
};
```

#### 4.3.4 熔断器初始化和注册

```javascript
// src/services/circuitBreaker/initializeCircuitBreakers.js

const HttpCircuitBreaker = require('./HttpCircuitBreaker');
const CircuitBreakerFactory = require('./CircuitBreakerFactory');
const breakerConfig = require('../config/circuitBreaker.config');

/**
 * 初始化所有熔断器
 */
function initializeCircuitBreakers() {
  const httpBreaker = HttpCircuitBreaker;
  const registered = [];

  // 遍历配置注册熔断器
  Object.entries(breakerConfig.services).forEach(([serviceName, config]) => {
    const baseURL = process.env[`${serviceName.toUpperCase().replace(/-/g, '_')}_URL`] 
      || `http://${serviceName}:3000`;
    
    // 获取降级函数
    const fallbackFn = breakerConfig.fallbacks[config.fallback];
    
    // 创建熔断器
    const wrapper = httpBreaker.create(serviceName, baseURL, {
      preset: serviceName.includes('payment') ? 'payment' 
            : serviceName.includes('ai') ? 'ai'
            : serviceName.includes('driver') ? 'driver'
            : 'order',
      ...config,
    });

    registered.push({
      name: serviceName,
      baseURL,
      status: 'initialized',
    });

    console.log(`[CircuitBreaker] Registered: ${serviceName} -> ${baseURL}`);
  });

  // 定期输出熔断器状态
  setInterval(() => {
    const status = CircuitBreakerFactory.getAllStatus();
    const summary = Object.entries(status).map(([name, info]) => ({
      name,
      status: info.status,
      errorRate: info.calculated.errorRate,
      avgResponseTime: info.calculated.avgResponseTime,
    }));
    
    console.log('[CircuitBreaker] Status Summary:', JSON.stringify(summary, null, 2));
  }, 60000); // 每分钟输出一次

  return registered;
}

module.exports = { initializeCircuitBreakers };
```

### 4.4 降级策略设计

```
┌─────────────────────────────────────────────────────────────┐
│                      多级降级策略                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Level 0: 正常访问                                          │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  用户请求 → 服务 → 返回数据                           │   │
│  └─────────────────────────────────────────────────────┘   │
│                           │                                 │
│                           ▼                                 │
│  Level 1: 熔断触发，返回本地缓存                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  用户请求 → 熔断器 → 降级函数 → 返回缓存数据           │   │
│  │                       ↓                              │   │
│  │              [标注 fallback=true]                    │   │
│  └─────────────────────────────────────────────────────┘   │
│                           │                                 │
│                           ▼                                 │
│  Level 2: 缓存也失效，返回默认数据                            │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  用户请求 → 降级函数 → 返回默认/空数据                │   │
│  │                       ↓                              │   │
│  │              [标注 default=true]                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                           │                                 │
│                           ▼                                 │
│  Level 3: 完全不可用，返回友好提示                            │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  用户请求 → 返回 {code:503, message:友好提示}        │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 4.5 熔断监控和告警

```javascript
// src/services/circuitBreaker/CircuitBreakerMonitor.js

const CircuitBreakerFactory = require('./CircuitBreakerFactory');
const fs = require('fs');

class CircuitBreakerMonitor {
  constructor() {
    this.alertHistory = [];
    this.alertCooldown = 60000; // 告警冷却时间（1分钟）
    this.lastAlertTime = {};
  }

  /**
   * 启动监控
   */
  start() {
    // 每 10 秒检查一次熔断器状态
    this.interval = setInterval(() => this.check(), 10000);
    console.log('[CircuitBreakerMonitor] Started');
  }

  /**
   * 停止监控
   */
  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    console.log('[CircuitBreakerMonitor] Stopped');
  }

  /**
   * 检查所有熔断器状态
   */
  async check() {
    const status = CircuitBreakerFactory.getAllStatus();
    
    for (const [name, info] of Object.entries(status)) {
      // 检查熔断打开
      if (info.status === 'OPEN') {
        await this.alert('CIRCUIT_OPEN', name, info);
      }
      
      // 检查错误率
      const errorRate = parseFloat(info.calculated.errorRate);
      if (errorRate > 50 && info.status !== 'OPEN') {
        await this.alert('HIGH_ERROR_RATE', name, { ...info, errorRate });
      }
      
      // 检查延迟
      const avgResponseTime = parseFloat(info.calculated.avgResponseTime);
      if (avgResponseTime > 5000) {
        await this.alert('HIGH_LATENCY', name, { ...info, avgResponseTime });
      }
    }

    // 生成监控报告
    this.generateReport(status);
  }

  /**
   * 发送告警
   */
  async alert(type, breakerName, data) {
    // 检查冷却时间
    const lastAlert = this.lastAlertTime[`${type}:${breakerName}`];
    if (lastAlert && Date.now() - lastAlert < this.alertCooldown) {
      return;
    }

    const alert = {
      id: require('uuid').v4(),
      type,
      breakerName,
      data,
      timestamp: new Date().toISOString(),
    };

    this.lastAlertTime[`${type}:${breakerName}`] = Date.now();
    this.alertHistory.push(alert);

    // 保留最近 1000 条告警
    if (this.alertHistory.length > 1000) {
      this.alertHistory = this.alertHistory.slice(-1000);
    }

    // 输出告警日志
    console.error(`[CircuitBreakerMonitor][ALERT] ${type}:`, JSON.stringify(alert, null, 2));

    // 发送到告警渠道
    await this.sendAlertNotification(alert);
  }

  /**
   * 发送告警通知
   */
  async sendAlertNotification(alert) {
    const message = this.formatAlertMessage(alert);
    
    // 发送到各渠道
    const channels = process.env.ALERT_CHANNELS?.split(',') || ['log'];
    
    if (channels.includes('log')) {
      console.error('[ALERT]', message);
    }
    
    if (channels.includes('webhook') && process.env.ALERT_WEBHOOK_URL) {
      await this.sendWebhook(process.env.ALERT_WEBHOOK_URL, alert);
    }
  }

  /**
   * 格式化告警消息
   */
  formatAlertMessage(alert) {
    const typeMessages = {
      CIRCUIT_OPEN: `🔴 熔断器打开: ${alert.breakerName}`,
      HIGH_ERROR_RATE: `🟠 高错误率: ${alert.breakerName} (${alert.data.errorRate}%)`,
      HIGH_LATENCY: `🟡 高延迟: ${alert.breakerName} (${alert.data.avgResponseTime}ms)`,
    };
    
    return `${typeMessages[alert.type] || alert.type}\n` +
           `时间: ${alert.timestamp}\n` +
           `详情: ${JSON.stringify(alert.data)}`;
  }

  /**
   * 发送 Webhook
   */
  async sendWebhook(url, data) {
    try {
      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.error('[CircuitBreakerMonitor] Webhook failed:', error);
    }
  }

  /**
   * 生成监控报告
   */
  generateReport(status) {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        total: Object.keys(status).length,
        open: Object.values(status).filter(s => s.status === 'OPEN').length,
        halfOpen: Object.values(status).filter(s => s.status === 'HALF_OPEN').length,
        closed: Object.values(status).filter(s => s.status === 'CLOSED').length,
      },
      circuits: status,
      recentAlerts: this.alertHistory.slice(-10),
    };

    // 写入日志文件
    const logDir = '/var/log/circuit-breaker';
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    const logFile = `${logDir}/status_${new Date().toISOString().split('T')[0]}.json`;
    fs.appendFileSync(logFile, JSON.stringify(report) + '\n');
  }

  /**
   * 获取监控状态 API
   */
  getStatus() {
    return {
      circuits: CircuitBreakerFactory.getAllStatus(),
      alertHistory: this.alertHistory.slice(-50),
      summary: {
        total: Object.keys(CircuitBreakerFactory.getAllStatus()).length,
        open: Object.values(CircuitBreakerFactory.getAllStatus()).filter(s => s.status === 'OPEN').length,
      },
    };
  }
}

module.exports = new CircuitBreakerMonitor();
```

**关键熔断指标告警阈值：**

| 指标 | 告警阈值 | 严重程度 | 处理建议 |
|------|----------|----------|----------|
| 熔断器状态 | OPEN | 🔴 严重 | 立即检查下游服务 |
| 错误率 | > 50% | 🟠 警告 | 增加监控，准备降级 |
| P99 延迟 | > 5000ms | 🟡 注意 | 性能优化 |
| 并发数 | > 容量 80% | 🟡 注意 | 扩容准备 |
| 拒绝率 | > 10% | 🟠 警告 | 熔断生效中 |

---

## 五、完整实施检查清单

### 5.1 API Gateway 高可用

| 检查项 | 状态 | 验证方法 |
|--------|------|----------|
| Nginx 安装完成 | ☐ | `nginx -v` |
| Keepalived 安装完成 | ☐ | `keepalived -v` |
| VIP 可正常绑定 | ☐ | `ip addr` |
| 故障切换测试通过 | ☐ | 停止主节点 |
| 流量切换验证 | ☐ | 观察日志 |
| 回滚方案已测试 | ☐ | 执行回滚脚本 |

### 5.2 Kafka 消息可靠性

| 检查项 | 状态 | 验证方法 |
|--------|------|----------|
| Producer 配置 acks=all | ☐ | 检查配置 |
| 幂等性已开启 | ☐ | 检查配置 |
| Consumer autoCommit=false | ☐ | 检查配置 |
| 死信队列已创建 | ☐ | `kafka-topics.sh` |
| 消息处理幂等性实现 | ☐ | 代码审查 |
| 监控指标已配置 | ☐ | Grafana 验证 |

### 5.3 数据库双写一致性

| 检查项 | 状态 | 验证方法 |
|--------|------|----------|
| 延迟双删策略实现 | ☐ | 代码审查 |
| 分布式锁已实现 | ☐ | 并发测试 |
| 空值缓存已实现 | ☐ | 穿透测试 |
| 一致性检查定时任务 | ☐ | 观察日志 |
| 自动修复机制 | ☐ | 模拟不一致 |

### 5.4 服务熔断降级

| 检查项 | 状态 | 验证方法 |
|--------|------|----------|
| 熔断器库已集成 | ☐ | `npm list opossum` |
| 关键服务已配置熔断 | ☐ | 代码审查 |
| 降级函数已实现 | ☐ | 触发熔断测试 |
| 监控告警已配置 | ☐ | 模拟告警 |
| 熔断恢复测试通过 | ☐ | 恢复服务观察 |

---

## 六、紧急回滚指南

### 6.1 一键回滚脚本

```bash
#!/bin/bash
# scripts/emergency/rollback.sh

set -e

echo "=== MIXMLAAL Emergency Rollback ==="
echo "Starting rollback at $(date)"

# 回滚步骤
rollback_step() {
  echo "[$(date)] $1"
}

# 1. 停止高可用 Nginx
rollback_step "Stopping Keepalived..."
ssh root@nginx1 "systemctl stop keepalived" 2>/dev/null || true
ssh root@nginx2 "systemctl stop keepalived" 2>/dev/null || true

# 2. 恢复原始 Nginx 配置
rollback_step "Restoring original Nginx config..."
ssh root@nginx1 "cp /etc/nginx/nginx.conf.backup /etc/nginx/nginx.conf"
ssh root@nginx1 "systemctl restart nginx"

# 3. 恢复原始 Gateway 配置（单实例模式）
rollback_step "Restoring single Gateway mode..."
kubectl scale deployment gateway-deployment --replicas=1

# 4. 重置 Kafka 配置
rollback_step "Resetting Kafka producer config..."
kubectl delete configmap kafka-producer-config
kubectl create configmap kafka-producer-config --from-file=backup/kafka/producer.config.js

# 5. 禁用熔断器
rollback_step "Disabling circuit breakers..."
curl -X POST http://localhost:3000/admin/circuit-breakers/disable

# 6. 重启相关服务
rollback_step "Restarting services..."
kubectl rollout restart deployment/gateway-deployment
kubectl rollout restart deployment/order-service

# 7. 验证
rollback_step "Verifying rollback..."
sleep 30
GATEWAY_HEALTH=$(curl -s http://localhost:22080/health || echo "FAILED")
if [[ "$GATEWAY_HEALTH" == "OK" ]]; then
  echo "✓ Rollback completed successfully"
else
  echo "✗ Rollback verification failed"
  exit 1
fi

echo "=== Rollback completed at $(date) ==="
```

### 6.2 紧急联系人

| 角色 | 职责 | 联系方式 |
|------|------|----------|
| 值班 SRE | 故障响应 | @sre-oncall |
| 架构师 | 技术决策 | @architect |
| 运维负责人 | 环境操作 | @ops-lead |
| 开发负责人 | 代码问题 | @dev-lead |

---

**文档版本：** v1.0  
**编制时间：** 2025-01-15  
**下次审查：** 2025-02-15  
**维护人：** MIXMLAAL 技术团队
