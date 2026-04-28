// 事件总线模块
export const EventBus = {
  events: new Map(),
  on(event, callback) {
    if (!this.events.has(event)) { this.events.set(event, []); }
    this.events.get(event).push(callback);
  },
  emit(event, ...args) {
    if (this.events.has(event)) {
      this.events.get(event).forEach(callback => callback(...args));
    }
  },
  off(event, callback) {
    if (this.events.has(event)) {
      this.events.set(event, this.events.get(event).filter(cb => cb !== callback));
    }
  },
};
