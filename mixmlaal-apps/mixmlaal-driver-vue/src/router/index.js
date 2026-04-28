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
    path: '/orders',
    name: 'Orders',
    component: () => import('../views/订单/List.vue'),
    meta: { requireAuth: true }
  },
  {
    path: '/order/detail/:id',
    name: 'OrderDetail',
    component: () => import('../views/订单/Detail.vue'),
    meta: { requireAuth: true }
  },
  {
    path: '/finance',
    name: 'Finance',
    component: () => import('../views/财务/Index.vue'),
    meta: { requireAuth: true }
  },
  {
    path: '/finance/withdraw',
    name: 'Withdraw',
    component: () => import('../views/财务/Withdraw.vue'),
    meta: { requireAuth: true }
  },
  {
    path: '/mine',
    name: 'Mine',
    component: () => import('../views/我的/Index.vue'),
    meta: { requireAuth: true }
  },
  {
    path: '/mine/info',
    name: 'Info',
    component: () => import('../views/我的/Info.vue'),
    meta: { requireAuth: true }
  },
  {
    path: '/mine/vehicle',
    name: 'Vehicle',
    component: () => import('../views/我的/Vehicle.vue'),
    meta: { requireAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const requireAuth = to.meta.requireAuth
  const token = store.state.driver.token

  if (requireAuth && !token) {
    next('/login')
  } else {
    next()
  }
})

export default router