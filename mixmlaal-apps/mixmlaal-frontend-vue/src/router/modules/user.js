const userRoutes = [
  {
    path: '/user-center',
    name: 'UserCenter',
    component: () => import('../../views/user/UserCenter.vue'),
    meta: {
      title: '用户中心',
      requiresAuth: true
    }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('../../views/user/Profile.vue'),
    meta: {
      title: '个人资料',
      requiresAuth: true
    }
  },
  {
    path: '/addresses',
    name: 'Addresses',
    component: () => import('../../views/user/Addresses.vue'),
    meta: {
      title: '地址管理',
      requiresAuth: true
    }
  },
  {
    path: '/security',
    name: 'Security',
    component: () => import('../../views/user/Security.vue'),
    meta: {
      title: '安全中心',
      requiresAuth: true
    }
  }
]

export default userRoutes