/**
 * Web端离线模式入口
 * 版本: 0.0.0.4
 * 说明: 初始化Web端离线模式服务
 */

import offlineService from './utils/offline';

const OfflinePlugin = {
  install(Vue, options = {}) {
    Vue.prototype.$offline = offlineService;

    Vue.mixin({
      created() {
        if (this.$options.offline !== false) {
          this.setupOfflineListener();
        }
      },
      methods: {
        setupOfflineListener() {
          if (this.$offline) {
            this.$offline.addListener((status) => {
              if (this.handleOfflineStatus) {
                this.handleOfflineStatus(status);
              }
            });
          }
        }
      },
      destroyed() {
        if (this.$offline) {
          this.$offline.removeListener(() => {});
        }
      }
    });
  }
};

export default OfflinePlugin;

export { offlineService };
