// 资源预加载和懒加载模块
import { EventBus } from './event-bus.js';

export const LazyLoader = {
  loadedResources: new Set(),
  loadingResources: new Map(),
  preloadQueue: [],
  maxConcurrentLoads: 3,
  activeLoads: 0,

  init() {
    try {
      console.log('🚀 LazyLoader 初始化中...');
      this.setupIntersectionObserver();
      console.log('✅ LazyLoader 初始化完成');
    } catch (error) {
      console.error('❌ LazyLoader 初始化失败:', error);
    }
  },

  setupIntersectionObserver() {
    if (typeof IntersectionObserver === 'undefined') {
      console.warn('⚠️ IntersectionObserver 不受支持');
      return;
    }

    try {
      this.imageObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.loadImage(entry.target);
          }
        });
      }, {
        rootMargin: '50px 0px',
        threshold: 0.01,
      });
    } catch (error) {
      console.error('❌ 设置 IntersectionObserver 失败:', error);
    }
  },

  observeImages(selector = 'img[data-src]') {
    if (!this.imageObserver) { return; }

    try {
      const images = document.querySelectorAll(selector);
      images.forEach(img => {
        if (!this.loadedResources.has(img)) {
          this.imageObserver.observe(img);
        }
      });
    } catch (error) {
      console.error('❌ 观察图片失败:', error);
    }
  },

  loadImage(imgElement) {
    if (!imgElement || this.loadedResources.has(imgElement)) {
      return Promise.resolve();
    }

    const src = imgElement.getAttribute('data-src');
    if (!src) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      if (this.loadingResources.has(imgElement)) {
        resolve(this.loadingResources.get(imgElement));
        return;
      }

      const img = new Image();

      const onLoad = () => {
        imgElement.src = src;
        imgElement.removeAttribute('data-src');
        this.loadedResources.add(imgElement);
        this.loadingResources.delete(imgElement);

        if (this.imageObserver) {
          this.imageObserver.unobserve(imgElement);
        }

        EventBus.emit('lazyload:image:loaded', { element: imgElement, src });
        console.log('🖼️ 图片加载完成:', src);
        resolve(imgElement);
      };

      const onError = error => {
        this.loadingResources.delete(imgElement);
        console.error('❌ 图片加载失败:', src, error);
        EventBus.emit('lazyload:image:error', { element: imgElement, src, error });
        reject(error);
      };

      img.onload = onLoad;
      img.onerror = onError;

      const promise = new Promise((res, rej) => {
        img.onload = () => {
          onLoad();
          res();
        };
        img.onerror = e => {
          onError(e);
          rej(e);
        };
      });

      this.loadingResources.set(imgElement, promise);
      img.src = src;
    });
  },

  preloadImage(src) {
    return new Promise((resolve, reject) => {
      if (this.loadedResources.has(src)) {
        resolve();
        return;
      }

      const img = new Image();
      img.onload = () => {
        this.loadedResources.add(src);
        console.log('🖼️ 图片预加载完成:', src);
        resolve();
      };
      img.onerror = error => {
        console.error('❌ 图片预加载失败:', src, error);
        reject(error);
      };
      img.src = src;
    });
  },

  preloadImages(srcArray) {
    return Promise.all(srcArray.map(src => this.preloadImage(src)));
  },

  loadScript(src, options = {}) {
    const { async = true, defer = false, attributes = {} } = options;

    return new Promise((resolve, reject) => {
      if (this.loadedResources.has(src)) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = src;
      script.async = async;
      script.defer = defer;

      Object.keys(attributes).forEach(key => {
        script.setAttribute(key, attributes[key]);
      });

      script.onload = () => {
        this.loadedResources.add(src);
        console.log('📜 脚本加载完成:', src);
        EventBus.emit('lazyload:script:loaded', { src });
        resolve();
      };

      script.onerror = error => {
        console.error('❌ 脚本加载失败:', src, error);
        EventBus.emit('lazyload:script:error', { src, error });
        reject(error);
      };

      document.head.appendChild(script);
    });
  },

  loadStyle(href) {
    return new Promise((resolve, reject) => {
      if (this.loadedResources.has(href)) {
        resolve();
        return;
      }

      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;

      link.onload = () => {
        this.loadedResources.add(href);
        console.log('🎨 样式加载完成:', href);
        EventBus.emit('lazyload:style:loaded', { href });
        resolve();
      };

      link.onerror = error => {
        console.error('❌ 样式加载失败:', href, error);
        EventBus.emit('lazyload:style:error', { href, error });
        reject(error);
      };

      document.head.appendChild(link);
    });
  },

  preloadFont(fontFamily, fontUrl) {
    if (document.fonts && document.fonts.load) {
      return document.fonts.load(`1em "${fontFamily}"`).then(() => {
        this.loadedResources.add(fontFamily);
        console.log('🔤 字体加载完成:', fontFamily);
        EventBus.emit('lazyload:font:loaded', { fontFamily, fontUrl });
      });
    }
    return Promise.resolve();
  },

  addToPreloadQueue(resource, type = 'image') {
    this.preloadQueue.push({ resource, type });
    this.processPreloadQueue();
  },

  processPreloadQueue() {
    if (this.activeLoads >= this.maxConcurrentLoads || this.preloadQueue.length === 0) {
      return;
    }

    const { resource, type } = this.preloadQueue.shift();
    this.activeLoads++;

    let promise;
    switch (type) {
      case 'image':
        promise = this.preloadImage(resource);
        break;
      case 'script':
        promise = this.loadScript(resource);
        break;
      case 'style':
        promise = this.loadStyle(resource);
        break;
      default:
        promise = Promise.resolve();
    }

    promise.finally(() => {
      this.activeLoads--;
      this.processPreloadQueue();
    });
  },

  clear() {
    this.loadedResources.clear();
    this.loadingResources.clear();
    this.preloadQueue = [];
    this.activeLoads = 0;

    if (this.imageObserver) {
      this.imageObserver.disconnect();
    }

    console.log('🧹 LazyLoader 已清除');
  },

  getLoadedCount() {
    return this.loadedResources.size;
  },

  getQueueLength() {
    return this.preloadQueue.length;
  },
};
