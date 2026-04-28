import { createRouter, createWebHistory } from 'vue-router'
import authRoutes from './modules/auth'
import userRoutes from './modules/user'
import deliveryRoutes from './modules/delivery'
import shopRoutes from './modules/shop'

// 路由懒加载优化 - 使用动态导入和预加载
const Home = () => import('../views/Home.vue')
const OAuthCallback = () => import('../views/OAuthCallback.vue')
const Login = () => import('../views/Login.vue')
const Register = () => import('../views/Register.vue')
const Food = () => import('../views/Food.vue')
const Mall = () => import('../views/Mall.vue')
const Errand = () => import('../views/Errand.vue')
const Cart = () => import('../views/Cart.vue')
const Order = () => import('../views/Order.vue')
const ProductDetail = () => import('../views/ProductDetail.vue')
const Checkout = () => import('../views/Checkout.vue')
const Profile = () => import('../views/Profile.vue')
const EditProfile = () => import('../views/EditProfile.vue')
const Settings = () => import('../views/Settings.vue')
const Security = () => import('../views/Security.vue')
const Notifications = () => import('../views/Notifications.vue')
const Wallet = () => import('../views/Wallet.vue')
const Membership = () => import('../views/Membership.vue')
const Collection = () => import('../views/Collection.vue')
const Payment = () => import('../views/Payment.vue')
const About = () => import('../views/About.vue')
const Contact = () => import('../views/Contact.vue')
const Help = () => import('../views/Help.vue')
const Blog = () => import('../views/Blog.vue')
const Social = () => import('../views/Social.vue')
const Analytics = () => import('../views/Analytics.vue')
const Admin = () => import('../views/Admin.vue')
const AdminDashboard = () => import('../views/admin/Dashboard.vue')
const AdminUsers = () => import('../views/admin/Users.vue')
const AdminOrders = () => import('../views/admin/Orders.vue')
const AdminProducts = () => import('../views/admin/Products.vue')
const AdminContent = () => import('../views/admin/ContentManagement.vue')
const AdminCoupons = () => import('../views/admin/CouponManagement.vue')
const AdminLogistics = () => import('../views/admin/LogisticsManagement.vue')
const AdminAI = () => import('../views/admin/AI.vue')
const AdminAnalytics = () => import('../views/admin/DataAnalysis.vue')
const AdminPermissions = () => import('../views/admin/PermissionManagement.vue')
const AdminSystem = () => import('../views/admin/SystemSettings.vue')
const AdminServices = () => import('../views/admin/Services.vue')
const NotFound = () => import('../views/NotFound.vue')

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: {
      title: '首页',
      keepAlive: true
    }
  },
  {
    path: '/oauth-callback',
    name: 'OAuthCallback',
    component: OAuthCallback,
    meta: {
      title: 'OAuth回调'
    }
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: {
      title: '登录'
    }
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
    meta: {
      title: '注册'
    }
  },
  {
    path: '/food',
    name: 'Food',
    component: Food,
    meta: {
      title: '外卖'
    }
  },
  {
    path: '/mall',
    name: 'Mall',
    component: Mall,
    meta: {
      title: '商城'
    }
  },
  {
    path: '/errand',
    name: 'Errand',
    component: Errand,
    meta: {
      title: '跑腿'
    }
  },
  {
    path: '/cart',
    name: 'Cart',
    component: Cart,
    meta: {
      title: '购物车'
    }
  },
  {
    path: '/product/:id',
    name: 'ProductDetail',
    component: ProductDetail,
    meta: {
      title: '商品详情'
    }
  },
  {
    path: '/checkout',
    name: 'Checkout',
    component: Checkout,
    meta: {
      title: '结算'
    }
  },
  {
    path: '/order',
    name: 'Order',
    component: Order,
    meta: {
      title: '订单'
    }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: Profile,
    meta: {
      title: '个人中心'
    }
  },
  {
    path: '/edit-profile',
    name: 'EditProfile',
    component: EditProfile,
    meta: {
      title: '编辑资料',
      requiresAuth: true
    }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: Settings,
    meta: {
      title: '设置'
    }
  },
  {
    path: '/security',
    name: 'Security',
    component: Security,
    meta: {
      title: '安全中心'
    }
  },
  {
    path: '/notifications',
    name: 'Notifications',
    component: Notifications,
    meta: {
      title: '通知'
    }
  },
  {
    path: '/wallet',
    name: 'Wallet',
    component: Wallet,
    meta: {
      title: '钱包'
    }
  },
  {
    path: '/membership',
    name: 'Membership',
    component: Membership,
    meta: {
      title: '会员'
    }
  },
  {
    path: '/collection',
    name: 'Collection',
    component: Collection,
    meta: {
      title: '收藏'
    }
  },
  {
    path: '/payment',
    name: 'Payment',
    component: Payment,
    meta: {
      title: '支付'
    }
  },
  {
    path: '/about',
    name: 'About',
    component: About,
    meta: {
      title: '关于我们'
    }
  },
  {
    path: '/contact',
    name: 'Contact',
    component: Contact,
    meta: {
      title: '联系我们'
    }
  },
  {
    path: '/help',
    name: 'Help',
    component: Help,
    meta: {
      title: '帮助中心'
    }
  },
  {
    path: '/blog',
    name: 'Blog',
    component: Blog,
    meta: {
      title: '博客'
    }
  },
  {
    path: '/social',
    name: 'Social',
    component: Social,
    meta: {
      title: '社交'
    }
  },
  {
    path: '/analytics',
    name: 'Analytics',
    component: Analytics,
    meta: {
      title: '数据分析'
    }
  },
  {
    path: '/admin',
    name: 'Admin',
    component: Admin,
    meta: {
      title: '管理后台',
      requiresAuth: true,
      requiresAdmin: true
    }
  },
  {
    path: '/admin/dashboard',
    name: 'AdminDashboard',
    component: AdminDashboard,
    meta: {
      title: '仪表盘',
      requiresAuth: true,
      requiresAdmin: true
    }
  },
  {
    path: '/admin/users',
    name: 'AdminUsers',
    component: AdminUsers,
    meta: {
      title: '用户管理',
      requiresAuth: true,
      requiresAdmin: true
    }
  },
  {
    path: '/admin/orders',
    name: 'AdminOrders',
    component: AdminOrders,
    meta: {
      title: '订单管理',
      requiresAuth: true,
      requiresAdmin: true
    }
  },
  {
    path: '/admin/products',
    name: 'AdminProducts',
    component: AdminProducts,
    meta: {
      title: '商品管理',
      requiresAuth: true,
      requiresAdmin: true
    }
  },
  {
    path: '/admin/content',
    name: 'AdminContent',
    component: AdminContent,
    meta: {
      title: '内容管理',
      requiresAuth: true,
      requiresAdmin: true
    }
  },
  {
    path: '/admin/coupons',
    name: 'AdminCoupons',
    component: AdminCoupons,
    meta: {
      title: '优惠券管理',
      requiresAuth: true,
      requiresAdmin: true
    }
  },
  {
    path: '/admin/logistics',
    name: 'AdminLogistics',
    component: AdminLogistics,
    meta: {
      title: '物流管理',
      requiresAuth: true,
      requiresAdmin: true
    }
  },
  {
    path: '/admin/ai',
    name: 'AdminAI',
    component: AdminAI,
    meta: {
      title: 'AI管理',
      requiresAuth: true,
      requiresAdmin: true
    }
  },
  {
    path: '/admin/analytics',
    name: 'AdminAnalytics',
    component: AdminAnalytics,
    meta: {
      title: '数据分析',
      requiresAuth: true,
      requiresAdmin: true
    }
  },
  {
    path: '/admin/permissions',
    name: 'AdminPermissions',
    component: AdminPermissions,
    meta: {
      title: '权限管理',
      requiresAuth: true,
      requiresAdmin: true
    }
  },
  {
    path: '/admin/system',
    name: 'AdminSystem',
    component: AdminSystem,
    meta: {
      title: '系统设置',
      requiresAuth: true,
      requiresAdmin: true
    }
  },
  {
    path: '/admin/services',
    name: 'AdminServices',
    component: AdminServices,
    meta: {
      title: '服务管理',
      requiresAuth: true,
      requiresAdmin: true
    }
  },
  ...authRoutes,
  ...userRoutes,
  ...deliveryRoutes,
  ...shopRoutes,
  // 404页面
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFound,
    meta: {
      title: '页面未找到'
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    // 优化页面滚动行为
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0, behavior: 'smooth' }
    }
  }
})

// 路由守卫优化
router.beforeEach((to, from, next) => {
  // 设置页面标题
  document.title = to.meta.title ? `${to.meta.title} - MIXMLAAL APP` : 'MIXMLAAL APP'

  // 权限检查
  const token = localStorage.getItem('access_token')
  const userRole = localStorage.getItem('user_role')

  if (to.meta.requiresAuth) {
    if (token) {
      if (to.meta.requiresAdmin && userRole !== 'admin') {
        next('/')
      } else {
        next()
      }
    } else {
      next('/login')
    }
  } else {
    next()
  }
})

// 路由后置守卫，用于预加载
router.afterEach((to) => {
  // 预加载标记的路由
  if (to.meta.preload) {
    // 预加载常用页面
    const preloadRoutes = ['Food', 'Mall', 'Cart', 'Profile']
    preloadRoutes.forEach(routeName => {
      const route = router.resolve({ name: routeName })
      if (route.name !== to.name) {
        // 动态导入组件，实现预加载
        const component = routes.find(r => r.name === routeName)?.component
        if (typeof component === 'function') {
          component()
        }
      }
    })
  }
})

export default router