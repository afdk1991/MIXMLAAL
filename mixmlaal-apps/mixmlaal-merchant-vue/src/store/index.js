import { createPinia } from 'pinia'
import { useUserStore } from './user'

const store = createPinia()

export {
  store,
  useUserStore
}

export default store