export default [
  {
    path: '/shop',
    name: 'Shop',
    component: () => import('../../views/shop/Shop.vue'),
    meta: {
      title: '商城'
    }
  },
  {
    path: '/shop/product/:id',
    name: 'ProductDetail',
    component: () => import('../../views/shop/ProductDetail.vue'),
    meta: {
      title: '商品详情'
    }
  },
  {
    path: '/shop/cart',
    name: 'ShopCart',
    component: () => import('../../views/shop/Cart.vue'),
    meta: {
      title: '购物车'
    }
  },
  {
    path: '/shop/orders',
    name: 'ShopOrders',
    component: () => import('../../views/shop/ShopOrders.vue'),
    meta: {
      title: '订单列表'
    }
  },
  {
    path: '/shop/order/:id',
    name: 'ShopOrderDetail',
    component: () => import('../../views/shop/ShopOrderDetail.vue'),
    meta: {
      title: '订单详情'
    }
  },
  {
    path: '/shop/checkout',
    name: 'Checkout',
    component: () => import('../../views/shop/Checkout.vue'),
    meta: {
      title: '结算'
    }
  }
]