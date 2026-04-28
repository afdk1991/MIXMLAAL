/**
 * 状态管理模块
 * 负责管理应用的全局状态
 */
class State {
  constructor() {
    this.state = new Map();
    this.listeners = new Map();
    this.persistentKeys = new Set();
    this.isInitialized = false;
  }

  /**
     * 初始化状态模块
     */
  initialize() {
    console.log('🗃️ State 模块初始化');
    this.loadPersistentState();
    this.setDefaultState();
    this.isInitialized = true;
    return Promise.resolve();
  }

  // 设置状态
  setState(key, value, options = {}) {
    const oldValue = this.state.get(key);
    this.state.set(key, value);

    // 持久化存储
    if (options.persist !== false && this.persistentKeys.has(key)) {
      this.persistState(key, value);
    }

    // 触发监听器
    this.notifyListeners(key, value, oldValue);

    console.log(`状态已更新: ${key}`, value);
    return value;
  }

  // 获取状态
  getState(key, defaultValue = null) {
    if (!this.state.has(key)) {
      return defaultValue;
    }
    return this.state.get(key);
  }

  // 批量设置状态
  setStates(states, options = {}) {
    const changes = [];

    Object.entries(states).forEach(([key, value]) => {
      const oldValue = this.state.get(key);
      this.state.set(key, value);

      // 持久化存储
      if (options.persist !== false && this.persistentKeys.has(key)) {
        this.persistState(key, value);
      }

      changes.push({ key, value, oldValue });
    });

    // 批量触发监听器
    changes.forEach(change => {
      this.notifyListeners(change.key, change.value, change.oldValue);
    });

    console.log('批量状态已更新:', changes.map(c => c.key));
    return changes;
  }

  // 获取所有状态
  getAllState() {
    const state = {};
    this.state.forEach((value, key) => {
      state[key] = value;
    });
    return state;
  }

  // 删除状态
  removeState(key) {
    if (!this.state.has(key)) {
      return false;
    }

    const oldValue = this.state.get(key);
    this.state.delete(key);

    // 从持久化存储中删除
    if (this.persistentKeys.has(key)) {
      this.removePersistentState(key);
    }

    // 触发监听器
    this.notifyListeners(key, undefined, oldValue);

    console.log(`状态已删除: ${key}`);
    return true;
  }

  // 清除所有状态
  clearState() {
    const keys = Array.from(this.state.keys());
    keys.forEach(key => {
      this.removeState(key);
    });
  }

  // 监听状态变化
  subscribe(key, listener) {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }
    this.listeners.get(key).add(listener);

    console.log(`状态监听器已添加: ${key}`);
    return () => this.unsubscribe(key, listener);
  }

  // 取消监听
  unsubscribe(key, listener) {
    if (!this.listeners.has(key)) {
      return false;
    }

    const listeners = this.listeners.get(key);
    const removed = listeners.delete(listener);

    if (listeners.size === 0) {
      this.listeners.delete(key);
    }

    console.log(`状态监听器已移除: ${key}`);
    return removed;
  }

  // 通知监听器
  notifyListeners(key, newValue, oldValue) {
    if (!this.listeners.has(key)) {
      return;
    }

    const listeners = this.listeners.get(key);
    listeners.forEach(listener => {
      try {
        listener(newValue, oldValue, key);
      } catch (error) {
        console.error(`监听器执行失败 [${key}]:`, error);
      }
    });
  }

  // 设置持久化键
  setPersistent(key, isPersistent = true) {
    if (isPersistent) {
      this.persistentKeys.add(key);
      // 立即持久化当前值
      if (this.state.has(key)) {
        this.persistState(key, this.state.get(key));
      }
    } else {
      this.persistentKeys.delete(key);
      this.removePersistentState(key);
    }
    console.log(`${isPersistent ? '已设置' : '已取消'}持久化: ${key}`);
  }

  // 批量设置持久化键
  setPersistentKeys(keys, isPersistent = true) {
    keys.forEach(key => {
      this.setPersistent(key, isPersistent);
    });
  }

  // 持久化单个状态
  persistState(key, value) {
    try {
      const data = {
        value: value,
        timestamp: Date.now(),
        version: '1.0',
      };
      localStorage.setItem(`mixmlaal_state_${key}`, JSON.stringify(data));
    } catch (error) {
      console.error(`状态持久化失败 [${key}]:`, error);
    }
  }

  // 从持久化存储中删除
  removePersistentState(key) {
    try {
      localStorage.removeItem(`mixmlaal_state_${key}`);
    } catch (error) {
      console.error(`删除持久化状态失败 [${key}]:`, error);
    }
  }

  // 加载持久化状态
  loadPersistentState() {
    const states = {};
    const keys = Object.keys(localStorage);

    keys.forEach(key => {
      if (key.startsWith('mixmlaal_state_')) {
        try {
          const stateKey = key.replace('mixmlaal_state_', '');
          const data = JSON.parse(localStorage.getItem(key));

          // 检查数据有效性
          if (data && typeof data.value !== 'undefined') {
            states[stateKey] = data.value;
            this.persistentKeys.add(stateKey);
          }
        } catch (error) {
          console.error(`加载持久化状态失败 [${key}]:`, error);
        }
      }
    });

    if (Object.keys(states).length > 0) {
      this.setStates(states, { persist: false });
      console.log('已加载持久化状态:', Object.keys(states));
    }
  }

  // 导出状态
  exportState() {
    return {
      state: this.getAllState(),
      persistentKeys: Array.from(this.persistentKeys),
      timestamp: Date.now(),
      version: '1.0',
    };
  }

  // 导入状态
  importState(data) {
    if (!data || !data.state) {
      console.error('导入状态失败: 无效的数据格式');
      return false;
    }

    try {
      // 清除现有状态
      this.clearState();

      // 设置新状态
      this.setStates(data.state);

      // 恢复持久化设置
      if (data.persistentKeys) {
        this.persistentKeys.clear();
        data.persistentKeys.forEach(key => {
          this.setPersistent(key, true);
        });
      }

      console.log('状态导入成功');
      return true;
    } catch (error) {
      console.error('导入状态失败:', error);
      return false;
    }
  }

  // 设置默认状态
  setDefaultState() {
    const defaultState = {
      user: {
        isLoggedIn: false,
        username: '用户',
        avatar: null,
        preferences: {},
      },
      app: {
        darkMode: window.matchMedia('(prefers-color-scheme: dark)').matches,
        language: navigator.language || 'zh-CN',
        notifications: {
          enabled: true,
          count: 3,
        },
        networkStatus: navigator.onLine,
        lastSyncTime: null,
      },
      ui: {
        currentPage: 'portalPage',
        sidebarOpen: false,
        loading: false,
        toast: null,
      },
    };

    // 只设置不存在的状态
    Object.entries(defaultState).forEach(([key, value]) => {
      if (!this.state.has(key)) {
        this.setState(key, value);
      }
    });

    // 设置持久化状态
    this.setPersistentKeys(['user', 'app.darkMode', 'app.language', 'app.notifications']);
  }

  // 检查状态是否存在
  hasState(key) {
    return this.state.has(key);
  }

  // 获取状态数量
  getStateCount() {
    return this.state.size;
  }

  // 获取持久化键数量
  getPersistentKeyCount() {
    return this.persistentKeys.size;
  }

  // 清除持久化存储
  clearPersistentStorage() {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('mixmlaal_state_')) {
        localStorage.removeItem(key);
      }
    });
    console.log('持久化存储已清除');
  }
}

// 导出状态实例
const StateInstance = new State();
window.State = StateInstance;
