/**
 * 集成服务管理页面
 * 版本: v1.0.0.0
 * 说明: 管理服务套餐和集成服务，融合出行服务和本地生活
 */

Page({
  data: {
    // 统计数据
    stats: {
      packages: 8,
      subscribers: 128,
      revenue: 15800,
      orders: 256
    },
    // 可用服务列表
    availableServices: [
      { id: 1, name: '出行服务' },
      { id: 2, name: '美食服务' },
      { id: 3, name: '跑腿服务' },
      { id: 4, name: '本地商城' },
      { id: 5, name: 'AI智能助手' },
      { id: 6, name: '会员特权' }
    ],
    // 服务套餐列表
    packages: [
      { id: 1, name: '基础套餐', price: 99, services: ['出行服务', '美食服务'], status: 'active', createdAt: '2024-01-01', description: '包含基础出行和美食服务' },
      { id: 2, name: '高级套餐', price: 199, services: ['出行服务', '美食服务', '跑腿服务'], status: 'active', createdAt: '2024-01-02', description: '包含出行、美食和跑腿服务' },
      { id: 3, name: '尊享套餐', price: 299, services: ['出行服务', '美食服务', '跑腿服务', '本地商城', 'AI智能助手'], status: 'active', createdAt: '2024-01-03', description: '包含全部核心服务' },
      { id: 4, name: '企业套餐', price: 999, services: ['出行服务', '美食服务', '跑腿服务', '本地商城', 'AI智能助手', '会员特权'], status: 'inactive', createdAt: '2024-01-04', description: '企业级服务套餐' }
    ],
    // 订阅列表
    subscriptions: [
      { id: 1, userId: 1001, userName: '张三', packageName: '高级套餐', subscribeTime: '2024-01-01', expireTime: '2024-02-01', status: 'active' },
      { id: 2, userId: 1002, userName: '李四', packageName: '尊享套餐', subscribeTime: '2024-01-02', expireTime: '2024-02-02', status: 'active' },
      { id: 3, userId: 1003, userName: '王五', packageName: '基础套餐', subscribeTime: '2023-12-01', expireTime: '2024-01-01', status: 'expired' },
      { id: 4, userId: 1004, userName: '赵六', packageName: '高级套餐', subscribeTime: '2024-01-03', expireTime: '2024-02-03', status: 'active' }
    ],
    // 集成服务订单列表
    orders: [
      {
        id: 'ORDER001',
        userId: 1001,
        userName: '张三',
        packageName: '高级套餐',
        rideService: {
          from: '北京市朝阳区建国路',
          to: '北京市海淀区中关村',
          type: 'express',
          estimatedPrice: 50
        },
        localService: {
          merchantName: '麦当劳',
          items: [
            { id: 1, name: '巨无霸汉堡', quantity: 2, price: 20 },
            { id: 2, name: '薯条', quantity: 1, price: 10 }
          ],
          address: '北京市海淀区中关村大街1号',
          totalAmount: 50,
          deliveryFee: 5
        },
        totalAmount: 105,
        orderStatus: 'completed',
        paymentStatus: 'paid',
        createdAt: '2024-01-01 10:00:00'
      },
      {
        id: 'ORDER002',
        userId: 1002,
        userName: '李四',
        packageName: '尊享套餐',
        rideService: {
          from: '北京市朝阳区国贸',
          to: '北京市西城区西单',
          type: 'premium',
          estimatedPrice: 80
        },
        localService: {
          merchantName: '肯德基',
          items: [
            { id: 1, name: '香辣鸡腿堡', quantity: 1, price: 18 },
            { id: 2, name: '奥尔良烤翅', quantity: 2, price: 15 }
          ],
          address: '北京市西城区西单北大街120号',
          totalAmount: 48,
          deliveryFee: 6
        },
        totalAmount: 134,
        orderStatus: 'pending',
        paymentStatus: 'unpaid',
        createdAt: '2024-01-02 12:30:00'
      },
      {
        id: 'ORDER003',
        userId: 1003,
        userName: '王五',
        packageName: '基础套餐',
        rideService: {
          from: '北京市海淀区清华园',
          to: '北京市朝阳区望京',
          type: 'express',
          estimatedPrice: 60
        },
        localService: {
          merchantName: '必胜客',
          items: [
            { id: 1, name: '超级至尊披萨', quantity: 1, price: 89 },
            { id: 2, name: '可乐', quantity: 2, price: 10 }
          ],
          address: '北京市朝阳区望京SOHO T1',
          totalAmount: 99,
          deliveryFee: 7
        },
        totalAmount: 166,
        orderStatus: 'processing',
        paymentStatus: 'paid',
        createdAt: '2024-01-03 18:00:00'
      }
    ],
    // 搜索查询
    searchQuery: '',
    // 模态框状态
    showAddPackageModal: false,
    showAddSubscriptionModal: false,
    showOrderDetailModal: false,
    // 新套餐数据
    newPackage: {
      name: '',
      price: '',
      services: [],
      status: 'active',
      description: ''
    },
    // 新订阅数据
    newSubscription: {
      userId: '',
      userName: '',
      packageId: '',
      expireTime: ''
    },
    // 选中的订单
    selectedOrder: {}
  },

  onLoad() {
    // 加载集成服务数据
    console.log('加载集成服务数据');
  },

  // 显示添加套餐模态框
  showAddPackageModal() {
    this.setData({
      showAddPackageModal: true
    });
  },

  // 关闭添加套餐模态框
  closeAddPackageModal() {
    this.setData({
      showAddPackageModal: false
    });
  },

  // 显示添加订阅模态框
  showAddSubscriptionModal() {
    this.setData({
      showAddSubscriptionModal: true
    });
  },

  // 关闭添加订阅模态框
  closeAddSubscriptionModal() {
    this.setData({
      showAddSubscriptionModal: false
    });
  },

  // 显示订单详情模态框
  viewOrderDetails(e) {
    const order = e.currentTarget.dataset.order;
    this.setData({
      selectedOrder: order,
      showOrderDetailModal: true
    });
  },

  // 关闭订单详情模态框
  closeOrderDetailModal() {
    this.setData({
      showOrderDetailModal: false
    });
  },

  // 添加套餐
  addPackage() {
    const { newPackage, packages, stats } = this.data;
    
    const packageData = {
      id: packages.length + 1,
      name: newPackage.name,
      price: parseFloat(newPackage.price),
      services: newPackage.services,
      status: newPackage.status,
      description: newPackage.description,
      createdAt: new Date().toISOString().split('T')[0]
    };
    
    const updatedPackages = [...packages, packageData];
    const updatedStats = {
      ...stats,
      packages: stats.packages + 1
    };
    
    this.setData({
      packages: updatedPackages,
      stats: updatedStats,
      showAddPackageModal: false,
      newPackage: {
        name: '',
        price: '',
        services: [],
        status: 'active',
        description: ''
      }
    });
  },

  // 添加订阅
  addSubscription() {
    const { newSubscription, packages, subscriptions, stats } = this.data;
    
    const packageData = packages.find(p => p.id === parseInt(newSubscription.packageId));
    const subscription = {
      id: subscriptions.length + 1,
      userId: parseInt(newSubscription.userId),
      userName: newSubscription.userName,
      packageName: packageData ? packageData.name : '未知套餐',
      subscribeTime: new Date().toISOString().split('T')[0],
      expireTime: newSubscription.expireTime,
      status: 'active'
    };
    
    const updatedSubscriptions = [...subscriptions, subscription];
    const updatedStats = {
      ...stats,
      subscribers: stats.subscribers + 1,
      revenue: packageData ? stats.revenue + packageData.price : stats.revenue
    };
    
    this.setData({
      subscriptions: updatedSubscriptions,
      stats: updatedStats,
      showAddSubscriptionModal: false,
      newSubscription: {
        userId: '',
        userName: '',
        packageId: '',
        expireTime: ''
      }
    });
  },

  // 编辑套餐
  editPackage(e) {
    const pkgData = e.currentTarget.dataset.pkg;
    console.log('编辑套餐:', pkgData);
  },

  // 删除套餐
  deletePackage(e) {
    const id = e.currentTarget.dataset.id;
    const { packages, stats } = this.data;
    
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个套餐吗？',
      success: (res) => {
        if (res.confirm) {
          const updatedPackages = packages.filter(p => p.id !== id);
          const updatedStats = {
            ...stats,
            packages: stats.packages - 1
          };
          
          this.setData({
            packages: updatedPackages,
            stats: updatedStats
          });
        }
      }
    });
  },

  // 查看套餐详情
  viewPackageDetails(e) {
    const pkgData = e.currentTarget.dataset.pkg;
    console.log('查看套餐详情:', pkgData);
  },

  // 编辑订阅
  editSubscription(e) {
    const subscription = e.currentTarget.dataset.subscription;
    console.log('编辑订阅:', subscription);
  },

  // 删除订阅
  deleteSubscription(e) {
    const id = e.currentTarget.dataset.id;
    const { subscriptions, stats } = this.data;
    
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个订阅吗？',
      success: (res) => {
        if (res.confirm) {
          const updatedSubscriptions = subscriptions.filter(s => s.id !== id);
          const updatedStats = {
            ...stats,
            subscribers: stats.subscribers - 1
          };
          
          this.setData({
            subscriptions: updatedSubscriptions,
            stats: updatedStats
          });
        }
      }
    });
  },

  // 查看订阅详情
  viewSubscriptionDetails(e) {
    const subscription = e.currentTarget.dataset.subscription;
    console.log('查看订阅详情:', subscription);
  },

  // 编辑订单
  editOrder(e) {
    const order = e.currentTarget.dataset.order;
    console.log('编辑订单:', order);
  },

  // 删除订单
  deleteOrder(e) {
    const id = e.currentTarget.dataset.id;
    const { orders, stats } = this.data;
    
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个订单吗？',
      success: (res) => {
        if (res.confirm) {
          const updatedOrders = orders.filter(o => o.id !== id);
          const updatedStats = {
            ...stats,
            orders: stats.orders - 1
          };
          
          this.setData({
            orders: updatedOrders,
            stats: updatedStats
          });
        }
      }
    });
  },

  // 处理支付
  processPayment(e) {
    const order = e.currentTarget.dataset.order;
    console.log('处理支付:', order);
    
    // 模拟支付成功
    order.paymentStatus = 'paid';
    order.orderStatus = 'processing';
    
    this.setData({
      selectedOrder: order
    });
  },

  // 搜索订单
  searchOrders() {
    const { searchQuery } = this.data;
    console.log('搜索订单:', searchQuery);
    // 这里可以添加实际的搜索逻辑
  },

  // 获取状态样式类
  getStatusClass(status) {
    switch (status) {
      case 'active':
      case 'completed':
      case 'paid':
        return 'active';
      case 'inactive':
      case 'expired':
      case 'unpaid':
        return 'inactive';
      case 'pending':
      case 'processing':
        return 'pending';
      default:
        return '';
    }
  },

  // 获取套餐名称
  getPackageName(packageId) {
    const { packages } = this.data;
    const pkg = packages.find(p => p.id === parseInt(packageId));
    return pkg ? pkg.name : '请选择套餐';
  },

  // 输入处理函数
  onPackageNameInput(e) {
    const value = e.detail.value;
    this.setData({
      'newPackage.name': value
    });
  },

  onPackagePriceInput(e) {
    const value = e.detail.value;
    this.setData({
      'newPackage.price': value
    });
  },

  onServiceChange(e) {
    const service = e.currentTarget.dataset.service;
    const checked = e.detail.value.includes(service);
    const { newPackage } = this.data;
    
    let services = [...newPackage.services];
    if (checked && !services.includes(service)) {
      services.push(service);
    } else if (!checked) {
      services = services.filter(s => s !== service);
    }
    
    this.setData({
      'newPackage.services': services
    });
  },

  onPackageDescriptionInput(e) {
    const value = e.detail.value;
    this.setData({
      'newPackage.description': value
    });
  },

  onPackageStatusChange(e) {
    const value = e.detail.value;
    this.setData({
      'newPackage.status': value
    });
  },

  onSubscriptionUserIdInput(e) {
    const value = e.detail.value;
    this.setData({
      'newSubscription.userId': value
    });
  },

  onSubscriptionUserNameInput(e) {
    const value = e.detail.value;
    this.setData({
      'newSubscription.userName': value
    });
  },

  onSubscriptionPackageChange(e) {
    const value = e.detail.value;
    this.setData({
      'newSubscription.packageId': value
    });
  },

  onSubscriptionExpireTimeInput(e) {
    const value = e.detail.value;
    this.setData({
      'newSubscription.expireTime': value
    });
  },

  onSearchInput(e) {
    const value = e.detail.value;
    this.setData({
      searchQuery: value
    });
  }
});
