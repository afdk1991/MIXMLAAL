const deliveryRoutes = [
  {
    path: '/delivery',
    name: 'DeliveryHome',
    component: () => import('../../views/delivery/index/index.vue'),
    meta: {
      title: '配送管理',
      requiresAuth: true
    }
  },
  {
    path: '/delivery/address/list',
    name: 'DeliveryAddressList',
    component: () => import('../../views/delivery/address/list.vue'),
    meta: {
      title: '地址列表',
      requiresAuth: true
    }
  },
  {
    path: '/delivery/address/add',
    name: 'DeliveryAddressAdd',
    component: () => import('../../views/delivery/address/add.vue'),
    meta: {
      title: '添加地址',
      requiresAuth: true
    }
  },
  {
    path: '/delivery/address/import',
    name: 'DeliveryAddressImport',
    component: () => import('../../views/delivery/address/import.vue'),
    meta: {
      title: '导入地址',
      requiresAuth: true
    }
  },
  {
    path: '/delivery/order/list',
    name: 'DeliveryOrderList',
    component: () => import('../../views/delivery/order/list.vue'),
    meta: {
      title: '订单列表',
      requiresAuth: true
    }
  },
  {
    path: '/delivery/order/detail',
    name: 'DeliveryOrderDetail',
    component: () => import('../../views/delivery/order/detail.vue'),
    meta: {
      title: '订单详情',
      requiresAuth: true
    }
  },
  {
    path: '/delivery/dispatch/optimize',
    name: 'DeliveryDispatchOptimize',
    component: () => import('../../views/delivery/dispatch/optimize.vue'),
    meta: {
      title: '配送优化',
      requiresAuth: true
    }
  },
  {
    path: '/delivery/dispatch/result',
    name: 'DeliveryDispatchResult',
    component: () => import('../../views/delivery/dispatch/result.vue'),
    meta: {
      title: '优化结果',
      requiresAuth: true
    }
  },
  {
    path: '/delivery/ai',
    name: 'DeliveryAI',
    component: () => import('../../views/delivery/ai/index.vue'),
    meta: {
      title: 'AI配送',
      requiresAuth: true
    }
  }
];

export default deliveryRoutes;