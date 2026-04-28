// 网络请求模块
export const Network = {
  baseURL: (typeof process !== 'undefined' && process.env?.API_BASE_URL) || 'http://localhost:3000/api/v1',
  defaultTimeout: 10000, // 10秒超时
  defaultRetry: 3, // 默认重试3次
  init() {
    console.log('Network module initialized');
    console.log('API Base URL:', this.baseURL);
  },
  async request(endpoint, options = {}) {
    const {
      loadingText = '加载中...',
      timeout = this.defaultTimeout,
      retry = this.defaultRetry,
      retryDelay = 1000,
      ...fetchOptions
    } = options;

    const url = endpoint.startsWith('http') ? endpoint : `${this.baseURL}${endpoint}`;

    let attempt = 0;

    while (attempt <= retry) {
      try {
        // 显示加载状态
        if (attempt === 0) {
          this.showLoading(loadingText);
        }

        const startTime = Date.now();

        // 创建超时Promise
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('请求超时')), timeout);
        });

        // 竞赛：fetch vs 超时
        const response = await Promise.race([
          fetch(url, {
            ...fetchOptions,
            headers: {
              'Content-Type': 'application/json',
              ...fetchOptions.headers,
            },
          }),
          timeoutPromise,
        ]);

        const endTime = Date.now();

        // 监控上报
        console.log({
          type: 'request',
          url,
          status: response.status,
          duration: endTime - startTime,
          attempt,
        });

        if (!response.ok) {
          const errorMessage = `HTTP错误: ${response.status} ${response.statusText}`;
          if (attempt < retry) {
            attempt++;
            console.log(`请求失败，正在重试 (${attempt}/${retry})...`);
            await this.delay(retryDelay * attempt);
            continue;
          }
          throw new Error(errorMessage);
        }

        const data = await response.json();
        // 隐藏加载状态
        this.hideLoading();
        return data;
      } catch (error) {
        attempt++;
        if (attempt <= retry) {
          console.log(`请求失败，正在重试 (${attempt}/${retry}): ${error.message}`);
          await this.delay(retryDelay * attempt);
          continue;
        }

        // 隐藏加载状态
        this.hideLoading();

        // 监控上报
        console.log({
          type: 'request_error',
          url: endpoint,
          error: error.message,
          attempts: attempt,
        });

        // 显示错误提示
        this.showError(error.message);
        throw error;
      }
    }
  },
  get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  },
  post(endpoint, data, options = {}) {
    return this.request(endpoint, { ...options, method: 'POST', body: JSON.stringify(data) });
  },
  put(endpoint, data, options = {}) {
    return this.request(endpoint, { ...options, method: 'PUT', body: JSON.stringify(data) });
  },
  delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  },
  showLoading(text = '加载中...') {
    const loadingOverlay = document.getElementById('loadingOverlay');
    const loadingText = document.getElementById('loadingText');
    if (loadingOverlay && loadingText) {
      loadingText.textContent = text;
      loadingOverlay.classList.remove('hidden');
    }
  },
  hideLoading() {
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) {
      loadingOverlay.classList.add('hidden');
    }
  },
  showError(message = '网络错误，请稍后重试') {
    // 创建错误提示元素
    const errorElement = document.createElement('div');
    errorElement.className = 'fixed top-20 left-1/2 transform -translate-x-1/2 bg-danger text-white px-4 py-2 rounded-lg shadow-lg z-50 transition-all duration-300 opacity-0';
    errorElement.textContent = message;

    // 添加到页面
    document.body.appendChild(errorElement);

    // 显示动画
    setTimeout(() => {
      errorElement.classList.remove('opacity-0');
      errorElement.classList.add('opacity-100');
    }, 10);

    // 3秒后隐藏
    setTimeout(() => {
      errorElement.classList.remove('opacity-100');
      errorElement.classList.add('opacity-0');
      setTimeout(() => {
        if (document.body.contains(errorElement)) {
          document.body.removeChild(errorElement);
        }
      }, 300);
    }, 3000);
  },
  showSuccess(message = '操作成功') {
    // 创建成功提示元素
    const successElement = document.createElement('div');
    successElement.className = 'fixed top-20 left-1/2 transform -translate-x-1/2 bg-success text-white px-4 py-2 rounded-lg shadow-lg z-50 transition-all duration-300 opacity-0';
    successElement.textContent = message;

    // 添加到页面
    document.body.appendChild(successElement);

    // 显示动画
    setTimeout(() => {
      successElement.classList.remove('opacity-0');
      successElement.classList.add('opacity-100');
    }, 10);

    // 2秒后隐藏
    setTimeout(() => {
      successElement.classList.remove('opacity-100');
      successElement.classList.add('opacity-0');
      setTimeout(() => {
        if (document.body.contains(successElement)) {
          document.body.removeChild(successElement);
        }
      }, 300);
    }, 2000);
  },
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  },
};
