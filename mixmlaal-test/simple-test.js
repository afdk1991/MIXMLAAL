const http = require('http');
const assert = require('assert');
const app = require('../mixmlaal-apps/mixmlaal-api-node/src/app');

// 创建服务器
const server = http.createServer(app);
let serverPort;

// 启动服务器
before(() => {
  return new Promise((resolve) => {
    server.listen(0, () => {
      serverPort = server.address().port;
      console.log(`测试服务器启动在端口 ${serverPort}`);
      resolve();
    });
  });
});

// 关闭服务器
after(() => {
  server.close();
  console.log('测试服务器已关闭');
});

// 发送HTTP请求的辅助函数
function sendRequest(options, postData) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({ status: res.statusCode, data: JSON.parse(data) });
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    if (postData) {
      req.write(JSON.stringify(postData));
    }
    req.end();
  });
}

// 测试认证API
async function testAuthAPI() {
  console.log('测试认证API...');

  // 测试登录
  const loginOptions = {
    hostname: 'localhost',
    port: serverPort,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  };

  const loginResponse = await sendRequest(loginOptions, {
    username: 'admin',
    password: 'password'
  });

  assert.strictEqual(loginResponse.status, 200, '登录请求应该返回200状态码');
  assert.strictEqual(loginResponse.data.code, 200, '登录应该成功');
  assert.ok(loginResponse.data.data.token, '登录应该返回token');

  const token = loginResponse.data.data.token;
  console.log('登录测试通过');

  // 测试获取当前用户信息
  const meOptions = {
    hostname: 'localhost',
    port: serverPort,
    path: '/api/auth/me',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };

  const meResponse = await sendRequest(meOptions);
  assert.strictEqual(meResponse.status, 200, '获取用户信息请求应该返回200状态码');
  assert.strictEqual(meResponse.data.code, 200, '获取用户信息应该成功');
  assert.strictEqual(meResponse.data.data.username, 'admin', '用户名应该是admin');
  console.log('获取用户信息测试通过');
}

// 测试调度API
async function testDispatchAPI() {
  console.log('测试调度API...');

  // 先登录获取token
  const loginOptions = {
    hostname: 'localhost',
    port: serverPort,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  };

  const loginResponse = await sendRequest(loginOptions, {
    username: 'admin',
    password: 'password'
  });

  const token = loginResponse.data.data.token;

  // 测试智能调度
  const dispatchOptions = {
    hostname: 'localhost',
    port: serverPort,
    path: '/api/dispatch/intelligent',
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };

  const dispatchResponse = await sendRequest(dispatchOptions, {
    orderIds: [1, 2, 3],
    warehouseId: 1
  });

  assert.strictEqual(dispatchResponse.status, 200, '智能调度请求应该返回200状态码');
  assert.strictEqual(dispatchResponse.data.code, 200, '智能调度应该成功');
  assert.ok(dispatchResponse.data.data.tasks, '智能调度应该返回任务列表');
  console.log('智能调度测试通过');

  // 测试获取任务列表
  const tasksOptions = {
    hostname: 'localhost',
    port: serverPort,
    path: '/api/dispatch/tasks',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };

  const tasksResponse = await sendRequest(tasksOptions);
  assert.strictEqual(tasksResponse.status, 200, '获取任务列表请求应该返回200状态码');
  assert.strictEqual(tasksResponse.data.code, 200, '获取任务列表应该成功');
  assert.ok(Array.isArray(tasksResponse.data.data.items), '任务列表应该是数组');
  console.log('获取任务列表测试通过');
}

// 运行测试
async function runTests() {
  try {
    await testAuthAPI();
    await testDispatchAPI();
    console.log('所有测试通过！');
  } catch (error) {
    console.error('测试失败:', error);
    process.exit(1);
  } finally {
    server.close();
  }
}

runTests();