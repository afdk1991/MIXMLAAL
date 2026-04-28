// 全局加载器模块
import { EventBus } from './event-bus.js';

export const Loader = {
  element: null,
  textElement: null,
  spinnerElement: null,
  isVisible: true,
  minDisplayTime: 500,
  maxDisplayTime: 30000,
  loadStartTime: 0,
  timeoutId: null,
  retryCount: 0,
  maxRetries: 3,

  init() {
    try {
      this.element = document.getElementById('page-loader');
      if (this.element) {
        this.textElement = this.element.querySelector('p');
        this.spinnerElement = this.element.querySelector('.loader-spinner');
        this.loadStartTime = performance.now();
        console.log('✅ Loader 模块初始化完成');
      } else {
        console.warn('⚠️ 未找到 page-loader 元素');
      }
    } catch (error) {
      console.error('❌ Loader 模块初始化失败:', error);
    }
  },

  show(text = '加载中...', options = {}) {
    if (!this.element) { return; }

    try {
      const {
        minTime = this.minDisplayTime,
        maxTime = this.maxDisplayTime,
        showSpinner = true,
      } = options;

      this.loadStartTime = performance.now();
      this.minDisplayTime = minTime;
      this.maxDisplayTime = maxTime;
      this.retryCount = 0;

      if (this.textElement) {
        this.textElement.textContent = text;
      }

      if (this.spinnerElement) {
        this.spinnerElement.style.display = showSpinner ? 'block' : 'none';
      }

      this.element.style.display = 'flex';
      requestAnimationFrame(() => {
        this.element.classList.remove('opacity-0');
        this.element.classList.add('opacity-100');
      });
      this.isVisible = true;

      this.clearTimeout();
      this.timeoutId = setTimeout(() => {
        if (this.isVisible) {
          this.handleTimeout();
        }
      }, this.maxDisplayTime);

      EventBus.emit('loader:show', { text, options });
    } catch (error) {
      console.error('❌ 显示加载器失败:', error);
    }
  },

  hide() {
    if (!this.element) { return; }

    try {
      this.clearTimeout();

      const elapsed = performance.now() - this.loadStartTime;
      const remainingTime = Math.max(0, this.minDisplayTime - elapsed);

      setTimeout(() => {
        if (!this.isVisible) { return; }

        this.element.classList.remove('opacity-100');
        this.element.classList.add('opacity-0');
        this.isVisible = false;

        EventBus.emit('loader:hide');

        setTimeout(() => {
          if (!this.isVisible) {
            this.element.style.display = 'none';
          }
        }, 300);
      }, remainingTime);
    } catch (error) {
      console.error('❌ 隐藏加载器失败:', error);
      this.forceHide();
    }
  },

  forceHide() {
    if (!this.element) { return; }

    try {
      this.clearTimeout();
      this.element.classList.remove('opacity-100');
      this.element.classList.add('opacity-0');
      this.element.style.display = 'none';
      this.isVisible = false;
      EventBus.emit('loader:hide');
    } catch (error) {
      console.error('❌ 强制隐藏加载器失败:', error);
    }
  },

  setText(text) {
    if (this.textElement) {
      try {
        this.textElement.textContent = text;
      } catch (error) {
        console.error('❌ 更新加载文本失败:', error);
      }
    }
  },

  setProgress(percent) {
    if (this.element) {
      try {
        const clampedPercent = Math.max(0, Math.min(100, percent));
        this.setText(`加载中... ${clampedPercent}%`);
      } catch (error) {
        console.error('❌ 设置加载进度失败:', error);
      }
    }
  },

  showError(text = '加载失败', retryCallback = null) {
    if (!this.element) { return; }

    try {
      this.clearTimeout();

      if (this.spinnerElement) {
        this.spinnerElement.style.display = 'none';
      }

      this.setText(text);

      if (retryCallback && this.retryCount < this.maxRetries) {
        this.retryCount++;
        const retryBtn = document.createElement('button');
        retryBtn.textContent = `重试 (${this.retryCount}/${this.maxRetries})`;
        retryBtn.className = 'mt-4 px-4 py-2 bg-primary text-white rounded-lg btn-primary';
        retryBtn.onclick = () => {
          retryBtn.remove();
          if (this.spinnerElement) {
            this.spinnerElement.style.display = 'block';
          }
          retryCallback();
        };

        const container = this.element.querySelector('.loader-container');
        if (container && !container.querySelector('button')) {
          container.appendChild(retryBtn);
        }
      }

      EventBus.emit('loader:error', { text, retryCount: this.retryCount });
    } catch (error) {
      console.error('❌ 显示加载错误失败:', error);
    }
  },

  showForAction(text, action, options = {}) {
    const { minDuration = 300, maxDuration = 30000 } = options;

    return new Promise((resolve, reject) => {
      this.show(text, { minTime: minDuration, maxTime: maxDuration });

      const startTime = performance.now();

      action().then(result => {
        const elapsed = performance.now() - startTime;
        const remainingTime = Math.max(0, minDuration - elapsed);

        setTimeout(() => {
          this.hide();
          resolve(result);
        }, remainingTime);
      }).catch(error => {
        this.showError('加载失败，点击重试', () => {
          this.showForAction(text, action, options)
            .then(resolve)
            .catch(reject);
        });
        reject(error);
      });
    });
  },

  clearTimeout() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  },

  handleTimeout() {
    console.warn('⚠️ 加载超时');
    this.showError('加载超时，点击重试', null);
  },

  destroy() {
    try {
      this.clearTimeout();
      this.forceHide();
      this.element = null;
      this.textElement = null;
      this.spinnerElement = null;
      console.log('✅ Loader 模块已销毁');
    } catch (error) {
      console.error('❌ 销毁 Loader 模块失败:', error);
    }
  },
};
