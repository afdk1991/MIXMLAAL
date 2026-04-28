const authRoutes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../../views/auth/Login.vue'),
    meta: {
      title: '登录',
      requiresAuth: false
    }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../../views/auth/Register.vue'),
    meta: {
      title: '注册',
      requiresAuth: false
    }
  },
  {
    path: '/reset-password',
    name: 'ResetPassword',
    component: () => import('../../views/auth/ResetPassword.vue'),
    meta: {
      title: '重置密码',
      requiresAuth: false
    }
  }
]

export default authRoutes