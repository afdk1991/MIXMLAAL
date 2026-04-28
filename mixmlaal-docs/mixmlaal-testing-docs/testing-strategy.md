# MIXMLAAL 测试策略规划

| 属性 | 内容 |
|------|------|
| **文档版本** | v1.0 |
| **编制时间** | 2025-01-15 |
| **测试类型 | 全栈测试策略 |
| **适用范围 | 全部测试活动 |

---

## 一、测试策略总览

### 1.1 测试金字塔

```
┌─────────────────────────────────────────────────────────┐
│                      测试金字塔                          │
├─────────────────────────────────────────────────────────┤
│                                                         │
│                         ▲                               │
│                        /│\                              │
│                       / │ \                             │
│                      /  │  \                            │
│                     /   │   \                           │
│                    /E2E │    \                          │
│                   /─────│─────\                         │
│                  /      │      \                        │
│                 /       │       \                       │
│                /        │        \                      │
│               /  集成测试 │         \                     │
│              /───────────│──────────\                   │
│             /            │           \                  │
│            /             │            \                 │
│           /              │             \                │
│          ┌────────────────┴───────────────┐             │
│          │           单元测试              │             │
│          └────────────────────────────────┘             │
│                                                         │
│  比例: 70% 单元 / 20% 集成 / 10% E2E                      │
│                                                         │
│  核心原则:                                              │
│  • 底层测试要又多又快，给上层测试信心                     │
│  • 越往上测试成本越高，数量应越少                         │
│  • 每个层级测重点不同，避免重复                           │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 1.2 测试矩阵

| 测试类型 | 目标 | 覆盖范围 | 执行频率 | 工具 |
|----------|------|----------|----------|------|
| 单元测试 | 代码质量 | 业务逻辑 | 每次提交 | Jest/Vitest |
| 集成测试 | 服务交互 | API 接口 | 每日 | Supertest |
| E2E 测试 | 用户流程 | 关键路径 | 每周 | Cypress |
| 性能测试 | 性能指标 | 全链路 | 每月 | JMeter/Artillery |
| 安全测试 | 安全漏洞 | 全系统 | 每季度 | OWASP ZAP |
| 回归测试 | 功能完整 | 全部功能 | 发版前 | Selenium/Cypress |

---

## 二、单元测试策略

### 2.1 测试范围

#### 应该测试的内容

| 优先级 | 内容 | 覆盖率要求 |
|--------|------|------------|
| P0 | 业务核心逻辑 | 100% |
| P0 | 工具类/Helper 函数 | 100% |
| P0 | 数据校验逻辑 | 100% |
| P1 | API 路由处理 | 90% |
| P1 | 中间件逻辑 | 90% |
| P2 | UI 组件（可选） | 70% |

#### 不需要测试的内容

```
• 第三方库自带功能
• 简单的 getter/setter
• 配置常量
• 框架自动生成的代码
• 已废弃的代码
```

### 2.2 测试规范

#### 测试文件组织

```
src/
├── services/
│   ├── userService.ts
│   └── userService.test.ts    # 单元测试
├── __tests__/
│   ├── unit/                  # 单元测试目录
│   │   ├── services/
│   │   ├── utils/
│   │   └── validators/
│   └── integration/            # 集成测试目录
│       └── api/
```

#### 测试命名规范

```typescript
// 测试文件: *.test.ts 或 *.spec.ts
// 描述格式: describe('模块名', () => { ... })
// 用例格式: it('should [预期行为]', () => { ... })

describe('OrderService', () => {
  describe('createOrder', () => {
    it('should create order successfully when input is valid', () => {
      // test implementation
    });

    it('should throw error when user balance is insufficient', () => {
      // test implementation
    });

    it('should handle concurrent order creation correctly', () => {
      // test implementation
    });
  });

  describe('cancelOrder', () => {
    it('should cancel order successfully within cancellation window', () => {
      // test implementation
    });
  });
});
```

### 2.3 测试工具配置

#### Jest 配置示例

```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      tsconfig: 'tsconfig.json'
    }]
  },
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/__tests__/'
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  testTimeout: 10000
};
```

#### Vue Test Utils 配置

```javascript
// jest.config.js for Vue
module.exports = {
  preset: '@vue/vue3-jest',
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|scss)$': 'identity-obj-proxy'
  }
};
```

### 2.4 Mock 策略

```typescript
// Mock 示例
describe('PaymentService', () => {
  // Mock 外部依赖
  const mockUserService = {
    getUserById: jest.fn()
  };

  const mockKafka = {
    send: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should process payment successfully', async () => {
    // Arrange
    mockUserService.getUserById.mockResolvedValue({
      id: 'user123',
      balance: 1000
    });

    const paymentService = new PaymentService(mockUserService, mockKafka);

    // Act
    const result = await paymentService.processPayment({
      userId: 'user123',
      amount: 100
    });

    // Assert
    expect(result.status).toBe('success');
    expect(mockKafka.send).toHaveBeenCalled();
  });
});
```

### 2.5 覆盖率目标

| 模块 | 行覆盖率 | 分支覆盖率 | 函数覆盖率 |
|------|----------|------------|------------|
| services/ | 80% | 75% | 90% |
| controllers/ | 70% | 65% | 85% |
| utils/ | 90% | 85% | 95% |
| middleware/ | 80% | 75% | 90% |
| validators/ | 95% | 90% | 100% |
| **整体目标** | **75%** | **70%** | **85%** |

---

## 三、集成测试策略

### 3.1 测试范围

```
┌─────────────────────────────────────────────────────────┐
│                  集成测试范围                             │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ✅ API 接口测试                                        │
│     ├── 正常场景                                        │
│     ├── 异常场景                                        │
│     └── 边界条件                                        │
│                                                         │
│  ✅ 数据库交互测试                                       │
│     ├── CRUD 操作                                       │
│     ├── 事务处理                                        │
│     └── 迁移脚本                                        │
│                                                         │
│  ✅ 服务间通信测试                                       │
│     ├── HTTP 调用                                       │
│     ├── 消息队列                                        │
│     └── 服务发现                                        │
│                                                         │
│  ✅ 缓存交互测试                                        │
│     ├── 缓存读取                                        │
│     ├── 缓存写入                                        │
│     └── 缓存失效                                        │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 3.2 API 测试模板

```typescript
// tests/integration/api/order.test.ts
import request from 'supertest';
import { app } from '../../../src/app';
import { createTestToken } from '../../helpers/auth';

describe('Order API', () => {
  let authToken: string;
  let testUserId: string;

  beforeAll(async () => {
    // 创建测试用户并获取 Token
    const { token, userId } = await createTestUser();
    authToken = token;
    testUserId = userId;
  });

  describe('POST /api/v1/orders', () => {
    it('should create order successfully', async () => {
      const orderData = {
        orderType: 'TAKEAWAY',
        merchantId: 'merchant123',
        items: [
          { productId: 'prod001', quantity: 2 }
        ],
        addressId: 'addr001',
        remark: '少辣'
      };

      const response = await request(app)
        .post('/api/v1/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send(orderData)
        .expect(201);

      expect(response.body.code).toBe(0);
      expect(response.body.data.orderId).toBeDefined();
      expect(response.body.data.status).toBe('PENDING_PAYMENT');
    });

    it('should return 400 when items is empty', async () => {
      const response = await request(app)
        .post('/api/v1/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ orderType: 'TAKEAWAY', items: [] })
        .expect(400);

      expect(response.body.code).toBe(10001);
    });

    it('should return 401 when token is invalid', async () => {
      await request(app)
        .post('/api/v1/orders')
        .set('Authorization', 'Bearer invalid_token')
        .send({})
        .expect(401);
    });
  });

  describe('GET /api/v1/orders/:id', () => {
    it('should return order details', async () => {
      // 先创建订单
      const createResponse = await request(app)
        .post('/api/v1/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ /* order data */ });

      const orderId = createResponse.body.data.orderId;

      // 查询订单
      const response = await request(app)
        .get(`/api/v1/orders/${orderId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data.orderId).toBe(orderId);
    });
  });
});
```

### 3.3 数据库测试

```typescript
// tests/integration/database/orderRepository.test.ts
import { db } from '../../../src/database';
import { OrderRepository } from '../../../src/repositories/OrderRepository';

describe('OrderRepository', () => {
  let orderRepo: OrderRepository;

  beforeAll(async () => {
    orderRepo = new OrderRepository(db);
    await db.query('BEGIN');
  });

  afterEach(async () => {
    await db.query('ROLLBACK');
  });

  afterAll(async () => {
    await db.end();
  });

  describe('create', () => {
    it('should create order with all fields', async () => {
      const order = {
        userId: 'user123',
        orderNo: 'ORD202501150001',
        totalAmount: 100.00,
        status: 'PENDING_PAYMENT'
      };

      const result = await orderRepo.create(order);

      expect(result.id).toBeDefined();
      expect(result.orderNo).toBe(order.orderNo);
      expect(result.createdAt).toBeDefined();
    });
  });

  describe('findById', () => {
    it('should return order with items', async () => {
      const orderId = 'order123';
      const result = await orderRepo.findById(orderId, { includeItems: true });

      expect(result).not.toBeNull();
      expect(result.items).toBeDefined();
    });
  });

  describe('transaction', () => {
    it('should rollback on error', async () => {
      try {
        await db.transaction(async (trx) => {
          await orderRepo.create({ /* valid data */ }, trx);
          throw new Error('Intentional error');
        });
      } catch (error) {
        // 验证数据已回滚
        const orders = await orderRepo.findAll();
        expect(orders.length).toBe(0);
      }
    });
  });
});
```

### 3.4 测试数据管理

```typescript
// tests/helpers/factories.ts
import { faker } from '@faker-js/faker';

// 工厂函数
export const createUser = (overrides = {}) => ({
  id: faker.string.uuid(),
  phone: faker.phone.number(),
  nickname: faker.person.fullName(),
  avatar: faker.image.avatar(),
  balance: faker.number.int({ min: 0, max: 10000 }),
  ...overrides
});

export const createOrder = (overrides = {}) => ({
  id: faker.string.uuid(),
  orderNo: `ORD${Date.now()}`,
  userId: faker.string.uuid(),
  orderType: faker.helpers.arrayElement(['TAKEAWAY', 'RIDE', 'MALL', 'ERRAND']),
  totalAmount: faker.number.float({ min: 10, max: 1000, precision: 0.01 }),
  status: 'PENDING_PAYMENT',
  ...overrides
});

export const createProduct = (overrides = {}) => ({
  id: faker.string.uuid(),
  merchantId: faker.string.uuid(),
  name: faker.commerce.productName(),
  price: faker.number.float({ min: 1, max: 500, precision: 0.01 }),
  stock: faker.number.int({ min: 0, max: 1000 }),
  ...overrides
});
```

---

## 四、E2E 测试策略

### 4.1 E2E 测试范围

| 优先级 | 用户场景 | 测试频率 | 预计时间 |
|--------|----------|----------|----------|
| P0 | 用户登录注册 | 每周 | 5min |
| P0 | 下单并支付 | 每周 | 10min |
| P0 | 商家浏览下单 | 每周 | 8min |
| P1 | 订单追踪 | 每周 | 5min |
| P1 | 退款申请 | 每周 | 5min |
| P2 | 评价功能 | 每月 | 3min |
| P2 | 分享功能 | 每月 | 3min |

### 4.2 Cypress 配置

```javascript
// cypress.config.ts
import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'https://staging.mixla.com',
    supportFile: 'tests/e2e/support/index.ts',
    specPattern: 'tests/e2e/specs/**/*.cy.ts',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: false,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 30000,
    env: {
      apiUrl: 'https://api-staging.mixla.com',
    },
    setupNodeEvents(on, config) {
      // 插件配置
    }
  }
});
```

### 4.3 E2E 测试示例

```typescript
// tests/e2e/specs/order.cy.ts

describe('下单流程 E2E', () => {
  beforeEach(() => {
    // 登录
    cy.visit('/login');
    cy.get('[data-testid=phone-input]').type('13800138000');
    cy.get('[data-testid=password-input]').type('Test123456');
    cy.get('[data-testid=login-button]').click();
    cy.url().should('include', '/home');
  });

  it('完整下单流程', () => {
    // 1. 浏览商家
    cy.visit('/merchant/merchant123');
    cy.get('[data-testid=merchant-name]').should('be.visible');

    // 2. 选择商品
    cy.get('[data-testid=product-001]').click();
    cy.get('[data-testid=add-to-cart]').click();
    cy.get('[data-testid=cart-badge]').should('contain', '1');

    // 3. 提交订单
    cy.get('[data-testid=checkout-button]').click();
    cy.get('[data-testid=confirm-order]').click();

    // 4. 支付
    cy.get('[data-testid=pay-button]').click();
    cy.get('[data-testid=wechat-pay]').click();
    
    // 5. 等待支付回调
    cy.waitForPaymentCallback();
    cy.get('[data-testid=order-status]').should('contain', '已支付');

    // 6. 验证订单创建
    cy.get('[data-testid=order-list]').should('have.length.gt', 0);
  });

  it('支付失败场景', () => {
    cy.visit('/checkout');
    cy.mockPaymentFailure(); // Mock 支付失败
    cy.get('[data-testid=pay-button]').click();
    cy.get('[data-testid=error-message]').should('contain', '支付失败');
  });
});
```

### 4.4 页面对象模式

```typescript
// tests/e2e/pages/OrderPage.ts

export class OrderPage {
  visitMerchant(merchantId: string) {
    cy.visit(`/merchant/${merchantId}`);
    return this;
  }

  addProductToCart(productId: string) {
    cy.get(`[data-testid=product-${productId}]`).click();
    cy.get('[data-testid=add-to-cart]').click();
    return this;
  }

  checkout() {
    cy.get('[data-testid=checkout-button]').click();
    return this;
  }

  confirmOrder() {
    cy.get('[data-testid=confirm-order]').click();
    return this;
  }

  selectPaymentMethod(method: 'wechat' | 'alipay' | 'balance') {
    cy.get(`[data-testid=${method}-pay]`).click();
    return this;
  }

  pay() {
    cy.get('[data-testid=pay-button]').click();
    return this;
  }

  getOrderStatus() {
    return cy.get('[data-testid=order-status]').text();
  }
}

export const orderPage = new OrderPage();
```

---

## 五、性能测试策略

### 5.1 性能测试场景

| 场景 | 并发数 | 持续时间 | 目标 TPS | 目标延迟 |
|------|--------|----------|----------|----------|
| 基准测试 | 100 | 10min | 1000 | P99 < 200ms |
| 峰值测试 | 1000 | 5min | 5000 | P99 < 500ms |
| 极限测试 | 5000 | 2min | - | 验证崩溃点 |
| 稳定性测试 | 500 | 2h | 2000 | 无性能下降 |

### 5.2 JMeter 配置

```xml
<!-- performance-test.jmx -->
<jmeterTestPlan version="1.2">
  <hashTree>
    <ThreadGroup>
      <stringProp name="ThreadGroup.num_threads">1000</stringProp>
      <stringProp name="ThreadGroup.ramp_time">60</stringProp>
      <stringProp name="ThreadGroup.duration">300</stringProp>
      <stringProp name="ThreadGroup.scheduler">true</stringProp>
    </ThreadGroup>
    
    <hashTree>
      <!-- 创建订单 -->
      <HTTPSamplerProxy>
        <stringProp name="HTTPSampler.domain">api.mixla.com</stringProp>
        <stringProp name="HTTPSampler.path">/api/v1/orders</stringProp>
        <stringProp name="HTTPSampler.method">POST</stringProp>
        <boolProp name="HTTPSampler.auto_redirects">true</boolProp>
      </HTTPSamplerProxy>
      
      <!-- 断言 -->
      <ResponseAssertion>
        <stringProp name="ResponseAssertion.test_field">responsecode</stringProp>
        <stringProp name="Assertion.test_strings">200</stringProp>
      </ResponseAssertion>
      
      <!-- 监听器 -->
      <ResultCollector>
        <stringProp name="filename">results/orders.jtl</stringProp>
      </ResultCollector>
    </hashTree>
  </hashTree>
</jmeterTestPlan>
```

### 5.3 性能指标监控

```yaml
# 性能测试监控指标
metrics:
  # 接口性能
  api:
    - name: "API 响应时间"
      target: "P99 < 200ms"
      critical: "P99 > 500ms"
      
    - name: "API 错误率"
      target: "< 0.1%"
      critical: "> 1%"
      
  # 系统资源
  system:
    - name: "CPU 使用率"
      target: "< 70%"
      critical: "> 90%"
      
    - name: "内存使用率"
      target: "< 80%"
      critical: "> 95%"
      
  # 数据库
  database:
    - name: "MySQL QPS"
      target: "> 10000"
      
    - name: "MySQL 连接数"
      target: "< 80% 最大值"
      
  # 缓存
  cache:
    - name: "Redis 命中率"
      target: "> 90%"
      
    - name: "Redis 内存使用"
      target: "< 80%"
```

---

## 六、安全测试策略

### 6.1 安全测试范围

| 测试类型 | 工具 | 频率 | 覆盖 |
|----------|------|------|------|
| 漏洞扫描 | OWASP ZAP | 每周 | OWASP Top 10 |
| 渗透测试 | 人工 | 每季度 | 全系统 |
| 依赖扫描 | npm audit / Trivy | 每次构建 | 第三方依赖 |
| 代码审计 | SonarQube | 每次提交 | 代码安全规则 |

### 6.2 安全测试用例

```markdown
## 安全测试用例

### 认证与授权
- [ ] SQL 注入防护测试
- [ ] XSS 攻击防护测试
- [ ] CSRF 攻击防护测试
- [ ] JWT 伪造测试
- [ ] 越权访问测试
- [ ] 暴力破解防护测试

### 数据安全
- [ ] 敏感数据加密测试
- [ ] 密码强度验证测试
- [ ] 会话管理测试
- [ ] 支付安全测试

### 接口安全
- [ ] 参数篡改测试
- [ ] 重放攻击测试
- [ ] 接口限流测试
- [ ] 文件上传安全测试
```

### 6.3 SonarQube 规则

```xml
<!-- sonar-project.properties -->
sonar.projectKey=mixla-api
sonar.projectName=MIXMLAAL API
sonar.sources=src
sonar.tests=tests

# 质量门禁
sonar.qualitygate.wait=true
sonar.qualitygate.timeout=300

# 安全规则
sonar.security.exclusions=**/*.test.ts
sonar.coverage.exclusions=**/__tests__/**
```

---

## 七、测试覆盖率目标

### 7.1 覆盖率指标

| 维度 | 目标 | 说明 |
|------|------|------|
| **代码行覆盖率** | ≥ 70% | 整体代码行覆盖 |
| **分支覆盖率** | ≥ 65% | 条件分支覆盖 |
| **函数覆盖率** | ≥ 85% | 公共函数覆盖 |
| **API 覆盖率** | 100% | 全部 API 接口 |
| **核心业务覆盖率** | 100% | 核心流程 0 遗漏 |

### 7.2 质量门禁

```yaml
# CI/CD 质量门禁配置
quality_gates:
  # 单元测试
  unit_tests:
    enabled: true
    min_coverage: 70%
    max_duration: 10min
    
  # 集成测试
  integration_tests:
    enabled: true
    pass_rate: 100%
    max_duration: 30min
    
  # E2E 测试
  e2e_tests:
    enabled: true
    pass_rate: 100%
    critical_blockers: 0
    
  # 安全扫描
  security_scan:
    enabled: true
    block_on_high: true
    block_on_critical: true
    
  # 代码质量
  code_quality:
    enabled: true
    min_rating: A
    new_code_min_rating: B
```

---

## 八、测试环境管理

### 8.1 环境类型

| 环境 | 用途 | 数据 | 配置 |
|------|------|------|------|
| Dev | 开发调试 | 测试数据 | 开发配置 |
| Test | 功能测试 | 脱敏数据 | 测试配置 |
| Staging | 预发布 | 影子数据 | 生产配置 |
| Prod | 正式环境 | 真实数据 | 生产配置 |

### 8.2 环境隔离

```
┌─────────────────────────────────────────────────────────┐
│                  测试环境隔离架构                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  生产环境                                               │
│  ├── 独立数据库                                        │
│  ├── 独立 Redis                                        │
│  └── 独立 Kafka Topic                                  │
│                                                         │
│  预发布环境                                             │
│  ├── 独立数据库（影子数据）                             │
│  ├── 独立 Redis                                        │
│  └── 测试 Kafka Topic                                  │
│                                                         │
│  测试环境                                               │
│  ├── Docker Compose 部署                              │
│  ├── 测试数据（工厂生成）                               │
│  └── Mock 外部依赖                                     │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 附录

### A. 测试工具清单

| 类别 | 工具 | 版本 | 用途 |
|------|------|------|------|
| 单元测试 | Jest | 29.x | Node.js 单元测试 |
| 单元测试 | Vitest | 1.x | Vite 原生测试 |
| 单元测试 | Vue Test Utils | 9.x | Vue 组件测试 |
| 集成测试 | Supertest | 6.x | HTTP API 测试 |
| E2E 测试 | Cypress | 13.x | 端到端测试 |
| 性能测试 | JMeter | 5.x | 负载测试 |
| 性能测试 | Artillery | 1.x | API 性能测试 |
| 安全扫描 | OWASP ZAP | 2.x | 安全扫描 |
| 容器扫描 | Trivy | 0.x | 镜像扫描 |
| 代码分析 | SonarQube | 10.x | 代码质量 |

### B. 测试报告模板

```markdown
# 测试报告

## 基本信息
- 项目名称: MIXMLAAL
- 测试版本: v1.0.0
- 测试时间: 2025-01-15
- 测试人员: [姓名]

## 测试概要
- 总用例数: XXX
- 通过数: XXX
- 失败数: XXX
- 通过率: XX%

## 测试结果
| 模块 | 用例数 | 通过 | 失败 | 通过率 |
|------|--------|------|------|--------|
| 用户服务 | XX | XX | X | XX% |
| 订单服务 | XX | XX | X | XX% |
| 支付服务 | XX | XX | X | XX% |

## 遗留问题
- [问题列表]

## 测试结论
[结论说明]
```

---

*文档结束*
