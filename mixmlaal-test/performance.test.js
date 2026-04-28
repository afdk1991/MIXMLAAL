const { performance } = require('perf_hooks');
const request = require('supertest');
const app = require('../mixmlaal-apps/mixmlaal-api-node/src/app');

// 性能测试配置
const performanceConfig = {
  iterations: 100, // 测试次数
  concurrency: 10, // 并发数
  timeout: 5000 // 超时时间（毫秒）
};

describe('Performance Tests', () => {
  let token;

  // 登录获取token
  beforeAll(async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'admin',
        password: 'password'
      });
    token = response.body.data.token;
  });

  // 测试API响应时间
  test('API Response Time', async () => {
    const startTime = performance.now();
    
    for (let i = 0; i < performanceConfig.iterations; i++) {
      await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .timeout(performanceConfig.timeout);
    }
    
    const endTime = performance.now();
    const avgResponseTime = (endTime - startTime) / performanceConfig.iterations;
    
    console.log(`平均响应时间: ${avgResponseTime.toFixed(2)}ms`);
    expect(avgResponseTime).toBeLessThan(100); // 平均响应时间应小于100ms
  });

  // 测试并发处理能力
  test('Concurrency Test', async () => {
    const requests = [];
    
    for (let i = 0; i < performanceConfig.concurrency; i++) {
      requests.push(
        request(app)
          .get('/api/auth/me')
          .set('Authorization', `Bearer ${token}`)
          .timeout(performanceConfig.timeout)
      );
    }
    
    const startTime = performance.now();
    const responses = await Promise.all(requests);
    const endTime = performance.now();
    
    const totalTime = endTime - startTime;
    console.log(`并发${performanceConfig.concurrency}请求总时间: ${totalTime.toFixed(2)}ms`);
    console.log(`并发${performanceConfig.concurrency}请求平均时间: ${(totalTime / performanceConfig.concurrency).toFixed(2)}ms`);
    
    // 所有请求都应成功
    responses.forEach(response => {
      expect(response.status).toBe(200);
      expect(response.body.code).toBe(200);
    });
  });

  // 测试调度API性能
  test('Dispatch API Performance', async () => {
    const startTime = performance.now();
    
    const response = await request(app)
      .post('/api/dispatch/intelligent')
      .set('Authorization', `Bearer ${token}`)
      .send({
        orderIds: [1, 2, 3, 4, 5],
        warehouseId: 1
      })
      .timeout(performanceConfig.timeout);
    
    const endTime = performance.now();
    const responseTime = endTime - startTime;
    
    console.log(`调度API响应时间: ${responseTime.toFixed(2)}ms`);
    expect(response.status).toBe(200);
    expect(response.body.code).toBe(200);
    expect(responseTime).toBeLessThan(2000); // 调度API响应时间应小于2秒
  });
});