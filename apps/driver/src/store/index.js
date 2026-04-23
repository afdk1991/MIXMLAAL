import { createPinia } from 'pinia'
import { useDriverStore } from './driver'

const store = createPinia()

export {
  store,
  useDriverStore
}

export default store