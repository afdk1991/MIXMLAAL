import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import { setRouter } from './utils/uni'
import { getVersionInfo } from '../../shared/utils/version.js'
import { autoCheckVersion } from '../../shared/services/version-checker.js'
import { preloadCriticalResources, lazyLoadImages, monitorPerformance, optimizeFirstPaint } from './utils/performance.js'

// 优化首屏加载
optimizeFirstPaint()

// 预加载关键资源
preloadCriticalResources()

const app = createApp(App)

// 加载版本信息
const versionInfo = getVersionInfo()
app.config.globalProperties.$version = versionInfo

app.use(createPinia())
app.use(router)

// 设置uni工具的router实例
setRouter(router)

// 将uni挂载到全局
import uni from './utils/uni';
globalThis.uni = uni

app.mount('#app')

// 打印版本信息
console.log('MIXMLAAL Frontend App Version:', versionInfo.fullVersion)

// 自动检查版本更新
autoCheckVersion(versionInfo.version)

// 监控页面性能
monitorPerformance()

// 懒加载图片
window.addEventListener('load', () => {
  lazyLoadImages()
})
