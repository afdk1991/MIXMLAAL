# MIXMLAAL 性能优化建议

| 属性 | 内容 |
|------|------|
| **文档版本** | v1.0 |
| **编制时间** | 2025-01-15 |
| **优化类型 | 全栈性能优化 |
| **适用范围 | 全部系统组件 |

---

## 一、性能优化全景

### 1.1 性能指标体系

```
┌─────────────────────────────────────────────────────────┐
│                  性能指标金字塔                          │
├─────────────────────────────────────────────────────────┤
│                                                         │
│                      用户体验                            │
│                   (首屏时间/响应时间)                     │
│                        │▲                               │
│                    ┌───┴───┐                            │
│                    │业务指标│                            │
│                (TPS/QPS/并发)                           │
│                        │▲                               │
│                    ┌───┴───┐                            │
│                    │系统指标│                            │
│                (CPU/内存/IO)                            │
│                        │▲                               │
│                    ┌───┴───┐                            │
│                    │应用指标│                            │
│              (延迟/吞吐/错误率)                          │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 1.2 核心性能目标

| 指标类别 | 指标名称 | 当前基线 | 优化目标 | 优先级 |
|----------|----------|----------|----------|--------|
| **前端** | 首屏加载时间 | 3s | < 2s | P0 |
| 前端 | TTFP | 1.5s | < 1s | P1 |
| 前端 | FCP | 2s | < 1.5s | P1 |
| **API** | P50 延迟 | 100ms | < 50ms | P0 |
| API | P99 延迟 | 500ms | < 200ms | P0 |
| API | P999 延迟 | 1s | < 500ms | P1 |
| **业务** | 系统吞吐量 | 5000 TPS | > 10000 TPS | P0 |
| 业务 | 错误率 | 0.5% | < 0.1% | P0 |
| 业务 | 可用性 | 99.9% | > 99.95% | P0 |

---

## 二、前端性能优化

### 2.1 资源加载优化

#### 2.1.1 代码分割策略

```javascript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        // 路由级代码分割
        manualChunks: {
          'vue-vendor': ['vue', 'vue-router', 'pinia'],
          'element-plus': ['element-plus'],
          'utils': ['lodash-es', 'axios', 'dayjs']
        }
      }
    },
    // 分包大小限制
    chunkSizeWarningLimit: 500, // KB
    // CSS 代码分割
    cssCodeSplit: true
  }
});
```

#### 2.1.2 懒加载配置

```typescript
// router/index.ts
const routes = [
  {
    path: '/',
    component: () => import(/* webpackChunkName: "home" */ '@/views/Home.vue')
  },
  {
    path: '/order',
    component: () => import(/* webpackChunkName: "order" */ '@/views/Order.vue'),
    children: [
      {
        path: 'create',
        component: () => import(/* webpackChunkName: "order-create" */ '@/views/OrderCreate.vue')
      },
      {
        path: 'list',
        component: () => import(/* webpackChunkName: "order-list" */ '@/views/OrderList.vue')
      }
    ]
  }
];
```

#### 优化效果预估

| 优化项 | 当前 | 优化后 | 提升 |
|--------|------|--------|------|
| 初始 bundle 大小 | 2.5MB | 300KB | -88% |
| 首屏加载时间 | 3s | 1.5s | 50% |
| JS 执行时间 | 800ms | 200ms | 75% |

### 2.2 缓存策略

#### 2.2.1 HTTP 缓存配置

```nginx
# nginx.conf
server {
    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        
        # 源站验证
        add_header ETag $upstream_etag;
        if_modified_since exact;
    }
    
    # HTML 不缓存
    location ~* \.html$ {
        expires -1;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }
    
    # API 接口
    location /api/ {
        proxy_cache_valid 200 1m;
        add_header Cache-Control "private";
    }
}
```

#### 2.2.2 浏览器缓存策略

```typescript
// src/utils/cache.ts
export const cacheManager = {
  // 静态资源配置
  assets: {
    storage: 'localStorage',
    prefix: 'assets_',
    ttl: 365 * 24 * 60 * 60 * 1000 // 1年
  },
  
  // 用户数据缓存
  userData: {
    storage: 'sessionStorage',
    prefix: 'user_',
    ttl: 30 * 60 * 1000 // 30分钟
  },
  
  // API 响应缓存
  apiCache: {
    storage: 'memory', // 内存缓存
    maxSize: 100,
    ttl: 5 * 60 * 1000 // 5分钟
  }
};
```

### 2.3 图片优化

```typescript
// src/utils/imageOptimization.ts

// 响应式图片
export const getResponsiveImage = (src: string, options: ImageOptions) => {
  const { width, height, format = 'webp' } = options;
  
  // CDN 转换参数
  return `${CDN_URL}/${src}?w=${width}&h=${height}&format=${format}&quality=85`;
};

// 图片预加载
export const preloadImages = (urls: string[]) => {
  urls.forEach(url => {
    const img = new Image();
    img.src = url;
  });
};

// 懒加载指令
export const lazyLoadDirective = {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.src = binding.value;
          observer.unobserve(el);
        }
      },
      { rootMargin: '50px' }
    );
    observer.observe(el);
  }
};
```

### 2.4 首屏渲染优化

```vue
<!-- App.vue -->
<template>
  <div id="app">
    <!-- 骨架屏 -->
    <Skeleton v-if="loading" />
    
    <!-- 实际内容 -->
    <router-view v-else />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import Skeleton from '@/components/Skeleton.vue';

const loading = ref(true);

// SSR 水合完成后关闭骨架屏
onMounted(async () => {
  await nextTick();
  loading.value = false;
});
</script>
```

```css
/* 关键CSS内联 */
.critical-css {
  /* 渲染关键路径CSS */
  .header { display: flex; }
  .hero { min-height: 100vh; }
}
```

---

## 三、后端性能优化

### 3.1 Node.js 性能优化

#### 3.1.1 进程管理

```javascript
// cluster模式启动
const cluster = require('cluster');
const numCPUs = require('os').cpus().length;

if (cluster.isMaster) {
  // 主进程
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
  
  cluster.on('exit', (worker) => {
    console.log(`Worker ${worker.process.pid} died`);
    cluster.fork();
  });
} else {
  // 工作进程
  require('./app');
}
```

#### 3.1.2 V8 引擎优化

```javascript
// 启动参数优化
// node --max-old-space-size=4096 app.js

// package.json
{
  "scripts": {
    "start": "node --max-old-space-size=4096 --gc-interval=100 app.js"
  }
}
```

#### 3.1.3 连接池优化

```typescript
// src/config/database.ts
import { createPool } from 'mysql2/promise';

export const pool = createPool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '3306'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  
  // 连接池配置
  waitForConnections: true,
  connectionLimit: 50,        // 最大连接数
  queueLimit: 100,             // 队列限制
  maxIdle: 20,                 // 最大空闲连接
  idleTimeout: 60000,          // 空闲超时(ms)
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000
});
```

### 3.2 API 响应优化

#### 3.2.1 响应压缩

```javascript
// app.ts
import compression from 'compression';

app.use(compression({
  filter: (req, res) => {
    return /json|text|javascript|css/.test(res.getHeader('Content-Type'));
  },
  level: 6, // 压缩级别 0-9
  threshold: 1024 // 超过 1KB 才压缩
}));
```

#### 3.2.2 响应数据优化

```typescript
// DTO 转换
class OrderDTO {
  @Select() // 只查询需要的字段
  id: string;
  
  @Select()
  orderNo: string;
  
  @Select()
  status: string;
  
  // 排除敏感字段
  @Exclude()
  internalNotes: string;
}

// 批量数据处理
export const batchProcess = async <T>(
  items: T[],
  processor: (item: T) => Promise<Result>,
  batchSize = 100
): Promise<Result[]> => {
  const results: Result[] = [];
  
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(processor));
    results.push(...batchResults);
  }
  
  return results;
};
```

### 3.3 中间件优化

```typescript
// 中间件执行顺序优化

// 1. 错误处理（最后注册）
app.use(errorHandler);

// 2. 路由（动态部分）
app.use('/api', apiRoutes);

// 3. 日志（静态部分）
app.use(requestLogger);

// 4. 认证（动态部分）
app.use('/api', authMiddleware);

// 5. 限流（最前注册）
app.use(rateLimiter);

// 6. 解析（最先注册）
app.use(bodyParser.json());
```

---

## 四、数据库优化

### 4.1 索引优化

#### 4.1.1 索引设计原则

```sql
-- 创建复合索引（遵循最左前缀原则）
CREATE INDEX idx_user_order ON orders(user_id, created_at DESC, status);

-- 覆盖索引（避免回表）
CREATE INDEX idx_order_cover ON orders(id, order_no, status, total_amount);

-- 查询优化
EXPLAIN SELECT * FROM orders 
WHERE user_id = '123' 
  AND created_at > '2025-01-01'
  AND status = 'COMPLETED';
```

#### 4.1.2 常见慢查询优化

```sql
-- 优化前：全表扫描
SELECT * FROM orders WHERE DATE(created_at) = '2025-01-15';

-- 优化后：使用索引
SELECT * FROM orders 
WHERE created_at >= '2025-01-15 00:00:00' 
  AND created_at < '2025-01-16 00:00:00';

-- 优化前：IN 子句
SELECT * FROM products WHERE id IN (1, 2, 3, ..., 1000);

-- 优化后：JOIN 临时表
CREATE TEMPORARY TABLE tmp_ids (id INT PRIMARY KEY);
INSERT INTO tmp_ids VALUES (1), (2), (3), ...;

SELECT p.* FROM products p 
INNER JOIN tmp_ids t ON p.id = t.id;
```

### 4.2 SQL 优化规范

```typescript
// Query Builder 优化
const optimizedQuery = async (userId: string) => {
  // 避免 SELECT *
  const result = await db
    .select({
      id: orders.id,
      orderNo: orders.orderNo,
      status: orders.status,
      amount: orders.totalAmount
    })
    .from(orders)
    .where('user_id', userId)
    .orderBy('created_at', 'desc')
    .limit(20);
  
  return result;
};
```

### 4.3 分库分表策略

```yaml
# ShardingSphere 配置
schemaName: mixla_sharding

dataSources:
  ds_0:
    url: jdbc:mysql://mysql-0:3306/mixla?useSSL=false
    username: mixla
    password: ***
  ds_1:
    url: jdbc:mysql://mysql-1:3306/mixla?useSSL=false
    username: mixla
    password: ***
  ds_2:
    url: jdbc:mysql://mysql-2:3306/mixla?useSSL=false
    username: mixla
    password: ***

rules:
  - !SHARDING
    tables:
      orders:
        actualDataNodes: ds_${0..2}.orders_${0..1023}
        databaseStrategy:
          standard:
            shardingColumn: user_id
            shardingAlgorithmName: mod
        tableStrategy:
          standard:
            shardingColumn: order_id
            shardingAlgorithmName: mod
```

---

## 五、缓存策略优化

### 5.1 多级缓存架构

```
┌─────────────────────────────────────────────────────────┐
│                  多级缓存架构                            │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  L1: 进程内缓存 (Caffeine)                               │
│  ├── 命中率目标: 60%                                    │
│  ├── 延迟: < 1ms                                        │
│  ├── 大小: 100MB                                        │
│  └── 适用: 配置数据、热点用户                            │
│                                                         │
│  L2: 分布式缓存 (Redis)                                  │
│  ├── 命中率目标: 30%                                    │
│  ├── 延迟: 1-5ms                                        │
│  ├── 大小: 64GB                                        │
│  └── 适用: 业务数据、会话                                │
│                                                         │
│  L3: 数据库                                             │
│  └── 最终数据源                                         │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 5.2 缓存策略实现

```typescript
// src/cache/multi-level-cache.ts

interface CacheOptions {
  l1: { maxSize: number; ttl: number };
  l2: { ttl: number };
}

export class MultiLevelCache {
  private l1: Cache;
  private l2: Redis;
  
  constructor(options: CacheOptions) {
    this.l1 = new Caffeine(options.l1);
    this.l2 = new Redis(options.l2);
  }
  
  async get<T>(key: string): Promise<T | null> {
    // L1 查询
    let value = this.l1.get<T>(key);
    if (value) return value;
    
    // L2 查询
    value = await this.l2.get(key);
    if (value) {
      // 回填 L1
      this.l1.set(key, value);
      return value;
    }
    
    return null;
  }
  
  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    // 写入 L1
    this.l1.set(key, value);
    
    // 写入 L2
    await this.l2.set(key, value, ttl);
  }
  
  async invalidate(key: string): Promise<void> {
    this.l1.delete(key);
    await this.l2.del(key);
  }
}
```

### 5.3 热点数据处理

```typescript
// 热点数据保护
export class HotDataProtection {
  private locks: Map<string, Promise<any>> = new Map();
  
  async getWithProtection<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl: number
  ): Promise<T> {
    // 1. 先从缓存获取
    const cached = await cache.get<T>(key);
    if (cached) return cached;
    
    // 2. 检查是否有正在执行的请求
    const existingLock = this.locks.get(key);
    if (existingLock) {
      return existingLock as Promise<T>;
    }
    
    // 3. 创建新的请求锁
    const lock = this.executeWithLock(key, fetcher, ttl);
    this.locks.set(key, lock);
    
    try {
      return await lock;
    } finally {
      this.locks.delete(key);
    }
  }
  
  private async executeWithLock<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl: number
  ): Promise<T> {
    const value = await fetcher();
    await cache.set(key, value, ttl);
    return value;
  }
}
```

### 5.4 缓存失效策略

```typescript
// 延迟双删策略
export class CacheInvalidator {
  async updateWithDoubleDelete(
    key: string,
    updateFn: () => Promise<void>
  ): Promise<void> {
    // 1. 执行更新
    await updateFn();
    
    // 2. 第一次删除缓存
    await cache.delete(key);
    
    // 3. 延迟再次删除（处理并发）
    await sleep(500);
    await cache.delete(key);
  }
}

// 异步更新缓存
export class AsyncCacheUpdater {
  async updateAsync(
    key: string,
    fetcher: () => Promise<any>
  ): Promise<void> {
    // 异步更新，不阻塞主流程
    setImmediate(async () => {
      try {
        const value = await fetcher();
        await cache.set(key, value);
      } catch (error) {
        logger.error(`Cache update failed: ${key}`, error);
      }
    });
  }
}
```

---

## 六、网络与 CDN 优化

### 6.1 CDN 配置

```nginx
# CDN 源站配置
upstream origin {
    server api.mixla.com:443;
}

server {
    listen 443 ssl http2;
    server_name cdn.mixla.com;
    
    ssl_certificate /etc/nginx/ssl/cdn.crt;
    ssl_certificate_key /etc/nginx/ssl/cdn.key;
    
    # OCSP Stapling
    ssl_stapling on;
    ssl_stapling_verify on;
    
    location / {
        proxy_pass https://origin;
        proxy_set_header Host api.mixla.com;
        proxy_set_header X-Real-IP $remote_addr;
        
        # 缓存配置
        proxy_cache mixla_cache;
        proxy_cache_valid 200 1h;
        proxy_cache_key "$host$request_uri";
        
        # 压缩
        proxy_set_header Accept-Encoding "gzip, deflate, br";
    }
}
```

### 6.2 HTTP/2 优化

```nginx
# HTTP/2 配置
server {
    listen 443 ssl http2;
    
    # 资源合并
    location /css/ {
        concat on;
        concat_max_files 10;
    }
    
    # 连接复用
    keepalive_timeout 65;
    keepalive_requests 100;
}
```

### 6.3 DNS 预解析

```html
<!-- index.html -->
<head>
  <!-- DNS 预解析 -->
  <link rel="dns-prefetch" href="//api.mixla.com">
  <link rel="dns-prefetch" href="//cdn.mixla.com">
  <link rel="dns-prefetch" href="//statics.mixla.com">
  
  <!-- 预连接 -->
  <link rel="preconnect" href="https://api.mixla.com" crossorigin>
  <link rel="preconnect" href="https://cdn.mixla.com" crossorigin>
</head>
```

---

## 七、性能监控与告警

### 7.1 性能监控指标

```yaml
# prometheus alerting rules
groups:
  - name: performance_alerts
    rules:
      # API 延迟告警
      - alert: APIP99LatencyHigh
        expr: histogram_quantile(0.99, rate(http_request_duration_seconds_bucket[5m])) > 0.5
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "API P99 延迟过高"
          description: "API P99 延迟达到 {{ $value }}s"
          
      # 错误率告警
      - alert: APIErrorRateHigh
        expr: rate(http_requests_total{status=~"5.."}[5m]) / rate(http_requests_total[5m]) > 0.01
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "API 错误率过高"
          
      # 吞吐量告警
      - alert: APITPSLow
        expr: rate(http_requests_total[5m]) < 1000
        for: 10m
        labels:
          severity: warning
```

### 7.2 性能诊断工具

```bash
# 1. Node.js 性能分析
node --prof app.js
node --prof-process isolate-*.log > profile.txt

# 2. 内存泄漏检测
node --inspect app.js
# Chrome DevTools → Memory → Allocation Timeline

# 3. CPU 分析
node --prof-process --preprocess isolate-*.log | flamebearer

# 4. 慢查询分析
mysqldumpslow -s t -t 10 slow-query.log
```

---

## 八、优化效果评估

### 8.1 优化收益矩阵

| 优化项 | 投入成本 | 性能收益 | ROI | 优先级 |
|--------|----------|----------|-----|--------|
| 代码分割 | 低 | 高 | 高 | P0 |
| 数据库索引 | 中 | 高 | 高 | P0 |
| Redis 缓存 | 中 | 高 | 高 | P0 |
| CDN 加速 | 低 | 中 | 高 | P1 |
| 读写分离 | 高 | 中 | 中 | P2 |
| 分库分表 | 高 | 高 | 中 | P2 |
| 服务拆分 | 高 | 中 | 低 | P3 |

### 8.2 优化实施计划

```
┌─────────────────────────────────────────────────────────┐
│                  性能优化路线图                          │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Phase 1 (第 1-2 周): 基础优化                          │
│  ├── 代码分割与懒加载                                   │
│  ├── 数据库索引优化                                     │
│  ├── 缓存策略完善                                       │
│  └── HTTP 缓存配置                                      │
│                                                         │
│  Phase 2 (第 3-4 周): 架构优化                          │
│  ├── 多级缓存实现                                       │
│  ├── 数据库读写分离                                     │
│  ├── CDN 全面部署                                      │
│  └── 连接池优化                                         │
│                                                         │
│  Phase 3 (第 5-8 周): 深度优化                          │
│  ├── 分库分表实施                                       │
│  ├── 服务拆分（如需要）                                 │
│  ├── 性能监控完善                                       │
│  └── 自动化性能回归                                     │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 附录

### A. 性能测试脚本

```javascript
// performance-test.js
import autocannon from 'autocannon';

const result = await autocannon({
  url: 'https://api.mixla.com/api/v1/orders',
  connections: 100,
  duration: 60,
  pipelining: 10,
  headers: {
    'Authorization': 'Bearer test_token'
  }
});

console.table({
  'Requests/sec': result.requests.average,
  'Latency P50': result.latency.p50,
  'Latency P99': result.latency.p99,
  'Throughput': `${(result.throughput.average / 1024 / 1024).toFixed(2)} MB/s`
});
```

### B. 常用优化命令

```bash
# Nginx 连接状态
nginx -t && nginx -s reload

# Redis 缓存分析
redis-cli INFO stats | grep -E "keyspace_hits|keyspace_misses"

# MySQL 慢查询
mysql -e "SHOW GLOBAL STATUS LIKE 'Slow_queries';"

# Node.js 内存使用
process.memoryUsage()
```

---

*文档结束*
