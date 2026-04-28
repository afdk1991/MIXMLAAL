/**
 * 网络请求模块
 * 提供统一的 HTTP 请求封装和错误处理
 */
class Network {
    constructor() {
        this.logger = console;
        this.baseURL = '';
        this.timeout = 30000; // 30秒超时
        this.retryCount = 3;
        this.retryDelay = 1000; // 1秒重试间隔
        this.activeRequests = new Map();
    }

    /**
     * 初始化网络模块
     */
    initialize() {
        this.logger.log('🌐 Network 模块初始化');
        this.setupInterceptors();
        return Promise.resolve();
    }

    /**
     * 设置拦截器
     */
    setupInterceptors() {
        // 请求拦截器
        this.requestInterceptor = (config) => {
            // 添加通用头部
            config.headers = {
                'Content-Type': 'application/json',
                'X-App-Name': 'MIXMLAAL',
                'X-App-Version': '0.0.0.4',
                'X-Timestamp': Date.now().toString(),
                ...config.headers
            };

            // 添加认证令牌
            const token = this.getAuthToken();
            if (token) {
                config.headers['Authorization'] = `Bearer ${token}`;
            }

            return config;
        };

        // 响应拦截器
        this.responseInterceptor = (response) => {
            // 处理业务错误
            if (response.data && response.data.code !== 0) {
                throw new Error(response.data.message || '请求失败');
            }
            return response;
        };

        // 错误拦截器
        this.errorInterceptor = (error) => {
            // 处理网络错误
            if (!error.response) {
                if (error.message.includes('timeout')) {
                    throw new Error('请求超时，请检查网络连接');
                }
                throw new Error('网络连接失败，请检查网络设置');
            }

            // 处理 HTTP 错误
            switch (error.response.status) {
                case 401:
                    this.handleUnauthorized();
                    throw new Error('未授权，请重新登录');
                case 403:
                    throw new Error('权限不足，无法访问');
                case 404:
                    throw new Error('请求的资源不存在');
                case 500:
                case 502:
                case 503:
                case 504:
                    throw new Error('服务器错误，请稍后重试');
                default:
                    throw new Error(`请求失败 (${error.response.status})`);
            }
        };
    }

    /**
     * 发起网络请求
     */
    async request(url, options = {}) {
        const requestId = this.generateRequestId();
        const startTime = Date.now();

        try {
            // 取消之前的相同请求
            this.cancelDuplicateRequest(url);

            // 构建请求配置
            const config = this.buildRequestConfig(url, options);
            
            // 应用请求拦截器
            const interceptedConfig = this.requestInterceptor(config);

            // 创建 AbortController
            const controller = new AbortController();
            interceptedConfig.signal = controller.signal;

            // 保存活跃请求
            this.activeRequests.set(requestId, {
                id: requestId,
                url: url,
                controller: controller,
                startTime: startTime
            });

            // 设置超时
            const timeoutId = setTimeout(() => {
                controller.abort();
            }, this.timeout);

            // 发起请求
            const response = await fetch(interceptedConfig.url, {
                method: interceptedConfig.method,
                headers: interceptedConfig.headers,
                body: interceptedConfig.body,
                signal: interceptedConfig.signal,
                credentials: interceptedConfig.credentials
            });

            clearTimeout(timeoutId);

            // 检查响应状态
            if (!response.ok) {
                throw {
                    response: {
                        status: response.status,
                        statusText: response.statusText,
                        headers: response.headers
                    }
                };
            }

            // 解析响应数据
            const data = await this.parseResponse(response);

            // 构建响应对象
            const responseObj = {
                data: data,
                status: response.status,
                statusText: response.statusText,
                headers: response.headers,
                config: interceptedConfig
            };

            // 应用响应拦截器
            const interceptedResponse = this.responseInterceptor(responseObj);

            // 计算请求耗时
            const endTime = Date.now();
            const duration = endTime - startTime;

            // 上报性能数据
            this.reportRequestPerformance({
                url: url,
                method: options.method || 'GET',
                status: response.status,
                duration: duration,
                success: true
            });

            // 移除活跃请求
            this.activeRequests.delete(requestId);

            return interceptedResponse;

        } catch (error) {
            // 计算请求耗时
            const endTime = Date.now();
            const duration = endTime - startTime;

            // 上报错误
            this.reportRequestError({
                url: url,
                method: options.method || 'GET',
                error: error.message || 'Unknown error',
                duration: duration
            });

            // 移除活跃请求
            this.activeRequests.delete(requestId);

            // 应用错误拦截器
            this.errorInterceptor(error);
        }
    }

    /**
     * 构建请求配置
     */
    buildRequestConfig(url, options) {
        const fullUrl = this.baseURL ? 
            (url.startsWith('/') ? this.baseURL + url : this.baseURL + '/' + url) : 
            url;

        return {
            url: fullUrl,
            method: options.method || 'GET',
            headers: options.headers || {},
            body: options.data ? JSON.stringify(options.data) : undefined,
            credentials: options.credentials || 'include'
        };
    }

    /**
     * 解析响应数据
     */
    async parseResponse(response) {
        const contentType = response.headers.get('content-type');
        
        if (contentType && contentType.includes('application/json')) {
            return await response.json();
        } else if (contentType && contentType.includes('text/')) {
            return await response.text();
        } else {
            return await response.blob();
        }
    }

    /**
     * 取消重复请求
     */
    cancelDuplicateRequest(url) {
        for (const [id, request] of this.activeRequests.entries()) {
            if (request.url === url) {
                request.controller.abort();
                this.activeRequests.delete(id);
                break;
            }
        }
    }

    /**
     * 生成请求 ID
     */
    generateRequestId() {
        return 'req_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * 获取认证令牌
     */
    getAuthToken() {
        if (window.Storage) {
            return window.Storage.get('auth_token');
        }
        return null;
    }

    /**
     * 处理未授权错误
     */
    handleUnauthorized() {
        // 清除认证信息
        if (window.Storage) {
            window.Storage.remove('auth_token');
            window.Storage.remove('user_info');
        }

        // 触发登录事件
        if (window.EventBus) {
            window.EventBus.emit('auth:unauthorized');
        }
    }

    /**
     * 上报请求性能
     */
    reportRequestPerformance(data) {
        if (window.Monitor) {
            window.Monitor.report({
                type: 'network_request',
                level: 'info',
                ...data
            });
        }
    }

    /**
     * 上报请求错误
     */
    reportRequestError(data) {
        if (window.Monitor) {
            window.Monitor.report({
                type: 'network_error',
                level: 'error',
                ...data
            });
        }
    }

    /**
     * GET 请求
     */
    get(url, params = {}, options = {}) {
        // 构建查询字符串
        const queryString = Object.keys(params).length ? 
            '?' + new URLSearchParams(params).toString() : '';
        
        return this.request(url + queryString, {
            method: 'GET',
            ...options
        });
    }

    /**
     * POST 请求
     */
    post(url, data = {}, options = {}) {
        return this.request(url, {
            method: 'POST',
            data: data,
            ...options
        });
    }

    /**
     * PUT 请求
     */
    put(url, data = {}, options = {}) {
        return this.request(url, {
            method: 'PUT',
            data: data,
            ...options
        });
    }

    /**
     * DELETE 请求
     */
    delete(url, options = {}) {
        return this.request(url, {
            method: 'DELETE',
            ...options
        });
    }

    /**
     * PATCH 请求
     */
    patch(url, data = {}, options = {}) {
        return this.request(url, {
            method: 'PATCH',
            data: data,
            ...options
        });
    }

    /**
     * 上传文件
     */
    upload(url, file, options = {}) {
        const formData = new FormData();
        formData.append(options.fieldName || 'file', file);

        // 添加其他数据
        if (options.data) {
            Object.keys(options.data).forEach(key => {
                formData.append(key, options.data[key]);
            });
        }

        return this.request(url, {
            method: 'POST',
            headers: {
                ...options.headers,
                // 不设置 Content-Type，让浏览器自动设置
                'Content-Type': undefined
            },
            body: formData,
            ...options
        });
    }

    /**
     * 下载文件
     */
    async download(url, options = {}) {
        const response = await this.request(url, {
            method: 'GET',
            responseType: 'blob',
            ...options
        });

        const blob = response.data;
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        
        link.href = url;
        link.download = options.filename || this.getFilenameFromUrl(url);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        return response;
    }

    /**
     * 从 URL 获取文件名
     */
    getFilenameFromUrl(url) {
        const pathname = new URL(url).pathname;
        return pathname.substring(pathname.lastIndexOf('/') + 1) || 'download';
    }

    /**
     * 设置基础 URL
     */
    setBaseURL(url) {
        this.baseURL = url;
    }

    /**
     * 设置超时时间
     */
    setTimeout(timeout) {
        this.timeout = timeout;
    }

    /**
     * 获取活跃请求数量
     */
    getActiveRequestCount() {
        return this.activeRequests.size;
    }

    /**
     * 取消所有请求
     */
    cancelAllRequests() {
        for (const [id, request] of this.activeRequests.entries()) {
            request.controller.abort();
            this.activeRequests.delete(id);
        }
    }

    /**
     * 重试请求
     */
    async retryRequest(url, options = {}, currentRetry = 0) {
        try {
            return await this.request(url, options);
        } catch (error) {
            if (currentRetry < this.retryCount) {
                this.logger.warn(`请求失败，正在重试 (${currentRetry + 1}/${this.retryCount})...`);
                
                await new Promise(resolve => 
                    setTimeout(resolve, this.retryDelay * Math.pow(2, currentRetry))
                );
                
                return this.retryRequest(url, options, currentRetry + 1);
            }
            throw error;
        }
    }
}

// 导出网络实例
const NetworkInstance = new Network();
window.Network = NetworkInstance;