import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '../store/user'

const routes = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue')
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('../views/Dashboard.vue'),
    meta: { requireAuth: true }
  },
  {
    path: '/shop/info',
    name: 'ShopInfo',
    component: () => import('../views/店铺/Info.vue'),
    meta: { requireAuth: true }
  },
  {
    path: '/shop/settings',
    name: 'ShopSettings',
    component: () => import('../views/店铺/Settings.vue'),
    meta: { requireAuth: true }
  },
  {
    path: '/product/list',
    name: 'ProductList',
    component: () => import('../views/商品/List.vue'),
    meta: { requireAuth: true }
  },
  {
    path: '/product/add',
    name: 'ProductAdd',
    component: () => import('../views/商品/Add.vue'),
    meta: { requireAuth: true }
  },
  {
    path: '/product/category',
    name: 'ProductCategory',
    component: () => import('../views/商品/Category.vue'),
    meta: { requireAuth: true }
  },
  {
    path: '/order/mall',
    name: 'MallOrder',
    component: () => import('../views/订单/Mall.vue'),
    meta: { requireAuth: true }
  },
  {
    path: '/order/delivery',
    name: 'DeliveryOrder',
    component: () => import('../views/订单/Delivery.vue'),
    meta: { requireAuth: true }
  },
  {
    path: '/order/travel',
    name: 'TravelOrder',
    component: () => import('../views/订单/Travel.vue'),
    meta: { requireAuth: true }
  },
  {
    path: '/marketing/coupon',
    name: 'Coupon',
    component: () => import('../views/营销/Coupon.vue'),
    meta: { requireAuth: true }
  },
  {
    path: '/marketing/activity',
    name: 'Activity',
    component: () => import('../views/营销/Activity.vue'),
    meta: { requireAuth: true }
  },
  {
    path: '/finance/order',
    name: 'FinanceOrder',
    component: () => import('../views/财务/Order.vue'),
    meta: { requireAuth: true }
  },
  {
    path: '/finance/withdraw',
    name: 'FinanceWithdraw',
    component: () => import('../views/财务/Withdraw.vue'),
    meta: { requireAuth: true }
  },
  {
    path: '/data/overview',
    name: 'DataOverview',
    component: () => import('../views/数据/Overview.vue'),
    meta: { requireAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const requireAuth = to.meta.requireAuth
  const userStore = useUserStore()
  const token = userStore.token

  if (requireAuth && !token) {
    next('/login')
  } else {
    next()
  }
})

export default router