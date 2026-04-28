/**
 * 懒加载模块
 * 版本: v1.0.0.0
 * 说明: 图片和组件懒加载实现
 */

class LazyLoader {
  constructor(options = {}) {
    this.options = {
      rootMargin: '50px',
      threshold: 0.01,
      ...options,
    };

    this.imageObserver = null;
    this.componentObserver = null;
    this.init();
  }

  /**
   * 初始化懒加载
   */
  init() {
    // 检查浏览器支持
    if (!('IntersectionObserver' in window)) {
      this.fallbackLoad();
      return;
    }

    // 创建图片观察器
    this.imageObserver = new IntersectionObserver(
      this.handleImageIntersection.bind(this),
      this.options,
    );

    // 创建组件观察器
    this.componentObserver = new IntersectionObserver(
      this.handleComponentIntersection.bind(this),
      this.options,
    );

    // 观察所有懒加载图片
    this.observeImages();

    // 观察所有懒加载组件
    this.observeComponents();
  }

  /**
   * 处理图片交叉观察
   */
  handleImageIntersection(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        this.loadImage(entry.target);
        this.imageObserver.unobserve(entry.target);
      }
    });
  }

  /**
   * 处理组件交叉观察
   */
  handleComponentIntersection(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        this.loadComponent(entry.target);
        this.componentObserver.unobserve(entry.target);
      }
    });
  }

  /**
   * 加载图片
   */
  loadImage(img) {
    const src = img.dataset.src;
    const srcset = img.dataset.srcset;

    if (!src) { return; }

    // 创建新图片对象预加载
    const preloadImg = new Image();

    preloadImg.onload = () => {
      img.src = src;
      if (srcset) { img.srcset = srcset; }
      img.classList.add('loaded');
      img.classList.remove('lazy');
    };

    preloadImg.onerror = () => {
      img.classList.add('error');
      // 使用占位图
      img.src = '/assets/images/placeholder.png';
    };

    preloadImg.src = src;
  }

  /**
   * 加载组件
   */
  loadComponent(element) {
    const componentUrl = element.dataset.component;

    if (!componentUrl) { return; }

    fetch(componentUrl)
      .then(response => response.text())
      .then(html => {
        element.innerHTML = html;
        element.classList.add('loaded');

        // 执行组件初始化脚本
        const scripts = element.querySelectorAll('script');
        scripts.forEach(script => {
          const newScript = document.createElement('script');
          newScript.textContent = script.textContent;
          document.head.appendChild(newScript);
          document.head.removeChild(newScript);
        });
      })
      .catch(error => {
        console.error('组件加载失败:', error);
        element.classList.add('error');
      });
  }

  /**
   * 观察所有懒加载图片
   */
  observeImages() {
    const lazyImages = document.querySelectorAll('img[data-src]');
    lazyImages.forEach(img => {
      img.classList.add('lazy');
      this.imageObserver.observe(img);
    });
  }

  /**
   * 观察所有懒加载组件
   */
  observeComponents() {
    const lazyComponents = document.querySelectorAll('[data-component]');
    lazyComponents.forEach(component => {
      this.componentObserver.observe(component);
    });
  }

  /**
   * 降级加载（不支持IntersectionObserver的浏览器）
   */
  fallbackLoad() {
    const lazyImages = document.querySelectorAll('img[data-src]');
    lazyImages.forEach(img => this.loadImage(img));

    const lazyComponents = document.querySelectorAll('[data-component]');
    lazyComponents.forEach(component => this.loadComponent(component));
  }

  /**
   * 动态添加懒加载图片
   */
  addLazyImage(img) {
    if (this.imageObserver) {
      img.classList.add('lazy');
      this.imageObserver.observe(img);
    } else {
      this.loadImage(img);
    }
  }

  /**
   * 动态添加懒加载组件
   */
  addLazyComponent(element) {
    if (this.componentObserver) {
      this.componentObserver.observe(element);
    } else {
      this.loadComponent(element);
    }
  }

  /**
   * 销毁观察器
   */
  destroy() {
    if (this.imageObserver) {
      this.imageObserver.disconnect();
    }
    if (this.componentObserver) {
      this.componentObserver.disconnect();
    }
  }
}

// 创建全局懒加载实例
window.lazyLoader = new LazyLoader();

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
  module.exports = LazyLoader;
}
