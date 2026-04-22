// 前端性能优化工具

// 预加载关键资源
export function preloadCriticalResources() {
  // 预加载关键CSS
  const criticalStyles = [
    '/assets/styles/main.css',
    '/assets/styles/components.css'
  ];
  
  criticalStyles.forEach(href => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = href;
    link.as = 'style';
    document.head.appendChild(link);
  });
  
  // 预加载关键JavaScript
  const criticalScripts = [
    '/assets/js/vendor.js',
    '/assets/js/app.js'
  ];
  
  criticalScripts.forEach(src => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = src;
    link.as = 'script';
    document.head.appendChild(link);
  });
  
  // 预加载关键字体
  const criticalFonts = [
    '/assets/fonts/roboto.woff2',
    '/assets/fonts/material-icons.woff2'
  ];
  
  criticalFonts.forEach(href => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = href;
    link.as = 'font';
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  });
}

// 懒加载图片
export function lazyLoadImages() {
  const lazyImages = document.querySelectorAll('img[data-src]');
  
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const image = entry.target;
          image.src = image.dataset.src;
          image.classList.remove('lazy');
          imageObserver.unobserve(image);
        }
      });
    });
    
    lazyImages.forEach(image => {
      imageObserver.observe(image);
    });
  } else {
    // 降级方案
    lazyImages.forEach(image => {
      image.src = image.dataset.src;
      image.classList.remove('lazy');
    });
  }
}

// 代码分割和动态导入
export function dynamicImport(component) {
  return () => import(`../views/${component}.vue`);
}

// 监控页面性能
export function monitorPerformance() {
  if ('performance' in window && 'measure' in window.performance) {
    // 监控首次内容绘制
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        console.log(`${entry.name}: ${entry.startTime}ms`);
        // 可以将性能数据发送到监控系统
      });
    });
    
    observer.observe({ entryTypes: ['paint', 'navigation', 'resource'] });
  }
}

// 优化首屏加载
export function optimizeFirstPaint() {
  // 避免阻塞渲染的CSS
  const criticalCSS = `
    body { margin: 0; padding: 0; font-family: 'Roboto', sans-serif; }
    .app-container { min-height: 100vh; }
    .loading { display: flex; align-items: center; justify-content: center; height: 100vh; }
  `;
  
  const style = document.createElement('style');
  style.textContent = criticalCSS;
  document.head.appendChild(style);
  
  // 延迟加载非关键资源
  window.addEventListener('load', () => {
    // 加载非关键CSS
    const nonCriticalStyles = [
      '/assets/styles/non-critical.css',
      '/assets/styles/animations.css'
    ];
    
    nonCriticalStyles.forEach(href => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      document.head.appendChild(link);
    });
  });
}
