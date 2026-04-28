# mixmlaal-app 项目优化指南

## 概述

本文档记录了 mixmlaal-app 项目的所有优化内容，包括加载器、性能监控、错误处理、资源懒加载等功能的实现和使用方法。

## 目录

- [加载器优化](#加载器优化)
- [性能监控](#性能监控)
- [错误处理](#错误处理)
- [资源懒加载](#资源懒加载)
- [路由管理优化](#路由管理优化)
- [使用示例](#使用示例)

## 加载器优化

### 文件位置

`src/js/modules/loader.js`

### 功能特性

1. **错误处理机制**
   - 完整的 try-catch 包裹所有方法
   - 详细的错误日志输出
   - 自动降级处理

2. **超时和重试机制**
   - 默认最大加载时间：30 秒
   - 支持自定义超时时间
   - 内置重试功能（最多 3 次）
   - 自动显示重试按钮

3. **进度显示**
   - 支持设置加载进度百分比
   - 自动格式化进度文本

4. **配置选项**
   - `minTime`: 最小显示时间（默认 500ms）
   - `maxTime`: 最大显示时间（默认 30000ms）
   - `showSpinner`: 是否显示加载动画

### API 文档

```javascript
import { Loader } from './modules/loader.js';

// 显示加载器
Loader.show('正在加载...', {
    minTime: 500,
    maxTime: 30000,
    showSpinner: true
});

// 隐藏加载器
Loader.hide();

// 强制隐藏
Loader.forceHide();

// 设置进度
Loader.setProgress(50);

// 显示错误并提供重试
Loader.showError('加载失败', () => {
    // 重试回调
    console.log('用户点击重试');
});

// 为异步操作显示加载器
Loader.showForAction('处理中...', async () => {
    // 执行异步操作
    const result = await fetch('/api/data');
    return result.json();
}, {
    minDuration: 300,
    maxDuration: 10000
}).then(result => {
    console.log('操作完成:', result);
});
```

## 性能监控

### 文件位置

`src/js/modules/performance-monitor.js`

### 功能特性

1. **核心 Web 指标监控**
   - LCP (Largest Contentful Paint): 最大内容绘制
   - FID (First Input Delay): 首次输入延迟
   - CLS (Cumulative Layout Shift): 累积布局偏移
   - FP (First Paint): 首次绘制
   - FCP (First Contentful Paint): 首次内容绘制
   - DCL (DOM Content Loaded): DOM 内容加载完成
   - 页面加载时间

2. **自定义标记和测量**
   - 支持自定义性能标记
   - 支持自定义性能测量
   - 自动记录历史数据

3. **错误追踪**
   - 全局错误监听
   - Promise 未处理拒绝监听
   - 详细的错误信息记录

4. **内存监控**
   - 定期内存使用情况监控
   - 内存指标记录

### API 文档

```javascript
import { PerformanceMonitor } from './modules/performance-monitor.js';

// 记录性能标记
PerformanceMonitor.mark('app-start');

// 执行操作...

// 测量性能
PerformanceMonitor.measure('app-init', 'app-start');

// 获取当前指标
const metrics = PerformanceMonitor.getMetrics();
console.log('性能指标:', metrics);

// 获取性能报告
const report = PerformanceMonitor.getPerformanceReport();
console.log('性能报告:', report);

// 获取指标历史
const history = PerformanceMonitor.getMetricHistory();
console.log('指标历史:', history);

// 清除所有数据
PerformanceMonitor.clear();
```

## 错误处理

### 文件位置

`src/js/modules/error-handler.js`

### 功能特性

1. **全局错误处理**
   - 自动捕获 JavaScript 运行时错误
   - 自动捕获未处理的 Promise 拒绝
   - 详细的错误信息记录（包括堆栈、来源、时间戳等）

2. **错误上报**
   - 预留错误上报接口
   - 可自定义上报逻辑

3. **用户友好提示**
   - Toast 错误提示
   - 3 秒自动消失

### API 文档

```javascript
import { ErrorHandler } from './modules/error-handler.js';

// 手动处理错误
ErrorHandler.handleError(new Error('自定义错误'), 'manual');

// 显示错误提示
ErrorHandler.showError('操作失败，请重试');
```

## 资源懒加载

### 文件位置

`src/js/modules/lazy-loader.js`

### 功能特性

1. **图片懒加载**
   - 使用 IntersectionObserver API
   - 提前 50px 预加载
   - 自动处理加载状态
   - 避免重复加载

2. **脚本懒加载**
   - 支持 async/defer 配置
   - 支持自定义属性
   - 自动处理加载状态

3. **样式懒加载**
   - CSS 文件按需加载
   - 自动处理加载状态

4. **字体预加载**
   - 使用 Font Loading API
   - 自动处理加载状态

5. **预加载队列**
   - 最大并发加载数：3
   - 自动队列管理
   - 优先加载重要资源

### API 文档

```javascript
import { LazyLoader } from './modules/lazy-loader.js';

// 观察懒加载图片
LazyLoader.observeImages('img[data-src]');

// 手动加载图片
const img = document.querySelector('img[data-src]');
LazyLoader.loadImage(img).then(() => {
    console.log('图片加载完成');
});

// 预加载图片
LazyLoader.preloadImage('/images/hero.jpg');

// 批量预加载图片
LazyLoader.preloadImages([
    '/images/1.jpg',
    '/images/2.jpg',
    '/images/3.jpg'
]);

// 加载脚本
LazyLoader.loadScript('/js/analytics.js', {
    async: true,
    defer: false,
    attributes: { 'data-type': 'analytics' }
}).then(() => {
    console.log('脚本加载完成');
});

// 加载样式
LazyLoader.loadStyle('/css/print.css').then(() => {
    console.log('样式加载完成');
});

// 预加载字体
LazyLoader.preloadFont('MyFont', '/fonts/myfont.woff2');

// 添加到预加载队列
LazyLoader.addToPreloadQueue('/images/feature.jpg', 'image');
LazyLoader.addToPreloadQueue('/js/chart.js', 'script');

// 获取统计信息
console.log('已加载资源数:', LazyLoader.getLoadedCount());
console.log('队列长度:', LazyLoader.getQueueLength());

// 清除所有
LazyLoader.clear();
```

## 路由管理优化

### 文件位置

`src/js/modules/router.js`

### 功能特性

1. **事件委托**
   - 使用事件委托减少事件监听器数量
   - 自动清理旧的事件监听器
   - 避免内存泄漏

2. **页面内容缓存**
   - 初始化时保存所有页面原始内容
   - 避免骨架屏覆盖问题
   - 快速恢复页面内容

3. **状态管理**
   - 防止重复切换到同一页面
   - 导航状态同步
   - 导航指示器平滑移动

4. **加载器集成**
   - 页面切换自动显示加载器
   - 显示当前加载的页面名称
   - 加载完成自动隐藏

### API 文档

```javascript
import { Router } from './modules/router.js';

// 初始化路由
Router.init();

// 导航到页面
Router.navigateTo('socialPage');

// 显示特定页面
Router.showPage('portalPage');

// 监听路由变化
import { EventBus } from './modules/event-bus.js';
EventBus.on('router:change', (pageId) => {
    console.log('路由变化:', pageId);
});
```

## 使用示例

### 综合使用示例

```javascript
import { Loader } from './modules/loader.js';
import { PerformanceMonitor } from './modules/performance-monitor.js';
import { LazyLoader } from './modules/lazy-loader.js';
import { Router } from './modules/router.js';

// 应用启动时记录性能标记
PerformanceMonitor.mark('app-start');

// 初始化所有模块
Promise.all([
    Loader.init(),
    PerformanceMonitor.init(),
    LazyLoader.init(),
    Router.init()
]).then(() => {
    // 测量应用初始化时间
    PerformanceMonitor.measure('app-init', 'app-start');
    
    // 观察页面上的懒加载图片
    LazyLoader.observeImages();
    
    // 预加载关键资源
    LazyLoader.preloadImages([
        '/assets/hero.jpg',
        '/assets/logo.png'
    ]);
    
    console.log('应用初始化完成');
}).catch(error => {
    console.error('初始化失败:', error);
    Loader.showError('初始化失败', () => {
        location.reload();
    });
});

// 路由切换时记录性能
import { EventBus } from './modules/event-bus.js';
EventBus.on('router:change', (pageId) => {
    PerformanceMonitor.mark(`nav-to-${pageId}`);
    // 预加载目标页面可能需要的资源
    LazyLoader.observeImages();
});

// 处理异步操作
async function fetchData() {
    try {
        const result = await Loader.showForAction('加载数据中...', async () => {
            const response = await fetch('/api/data');
            if (!response.ok) {
                throw new Error('网络错误');
            }
            return response.json();
        });
        console.log('数据加载成功:', result);
        return result;
    } catch (error) {
        console.error('数据加载失败:', error);
        throw error;
    }
}

// 页面卸载时清理
window.addEventListener('beforeunload', () => {
    PerformanceMonitor.destroy();
    LazyLoader.clear();
});
```

## 最佳实践

### 1. 加载器使用

- 始终使用 `showForAction` 来包装异步操作
- 设置合理的超时时间（3-10秒）
- 提供重试功能
- 显示有意义的加载文本

### 2. 性能监控

- 在关键操作前添加 `mark`
- 在关键操作后添加 `measure`
- 定期检查性能指标
- 关注 Core Web Vitals

### 3. 资源懒加载

- 为非首屏图片使用 `data-src`
- 预加载关键资源
- 合理设置预加载队列大小
- 监控已加载资源数量

### 4. 错误处理

- 不要静默处理错误
- 提供清晰的错误信息
- 记录所有错误以便调试
- 考虑错误上报

## 注意事项

1. **浏览器兼容性**
   - PerformanceObserver 需要现代浏览器
   - IntersectionObserver 需要现代浏览器
   - 对于不支持的浏览器，会有降级处理

2. **性能影响**
   - 性能监控本身有轻微性能开销
   - 建议在生产环境中可配置开关
   - 合理设置指标历史长度

3. **内存管理**
   - 长期运行时注意清理历史数据
   - 使用 `clear()` 方法释放内存
   - 避免内存泄漏

## 贡献指南

如需添加新功能或修复问题：

1. 确保代码有完善的错误处理
2. 添加详细的注释
3. 遵循现有代码风格
4. 更新本文档
5. 测试所有功能

## 版本历史

- MIXMLAAL-0.0.0.5 - 初始版本，包含所有基础优化功能
