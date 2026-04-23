import { createRouter, createWebHistory } from 'vue-router'
import store from '../store'

const routes = [
  {
    path: '/',
    redirect: '/home'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue')
  },
  {
    path: '/home',
    name: 'Home',
    component: () => import('../views/Home.vue'),
    meta: { requireAuth: true }
  },
  {
    path: '/travel',
    name: 'Travel',
    component: () => import('../views/出行/Index.vue'),
    meta: { requireAuth: true }
  },
  {
    path: '/travel/order',
    name: 'TravelOrder',
    component: () => import('../views/出行/Order.vue'),
    meta: { requireAuth: true }
  },
  {
    path: '/delivery',
    name: 'Delivery',
    component: () => import('../views/配送/Index.vue'),
    meta: { requireAuth: true }
  },
  {
    path: '/delivery/order',
    name: 'DeliveryOrder',
    component: () => import('../views/配送/Order.vue'),
    meta: { requireAuth: true }
  },
  {
    path: '/mall',
    name: 'Mall',
    component: () => import('../views/商城/Index.vue'),
    meta: { requireAuth: true }
  },
  {
    path: '/mall/shop/:id',
    name: 'MallShop',
    component: () => import('../views/商城/Shop.vue'),
    meta: { requireAuth: true }
  },
  {
    path: '/mall/product/:id',
    name: 'MallProduct',
    component: () => import('../views/商城/Product.vue'),
    meta: { requireAuth: true }
  },
  {
    path: '/mall/cart',
    name: 'MallCart',
    component: () => import('../views/商城/Cart.vue'),
    meta: { requireAuth: true }
  },
  {
    path: '/mall/order',
    name: 'MallOrder',
    component: () => import('../views/商城/Order.vue'),
    meta: { requireAuth: true }
  },
  {
    path: '/mine',
    name: 'Mine',
    component: () => import('../views/Mine.vue'),
    meta: { requireAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const requireAuth = to.meta.requireAuth
  const token = store.state.user.token

  if (requireAuth && !token) {
    next('/login')
  } else {
    next()
  }
})

export default router