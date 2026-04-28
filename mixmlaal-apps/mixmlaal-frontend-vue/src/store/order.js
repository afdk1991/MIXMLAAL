import { defineStore } from 'pinia';

// API基础URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3004';

export const useOrderStore = defineStore('order', {
  state: () => ({
    orders: [],
    currentOrder: null,
    isLoading: false,
    error: null,
    pagination: {
      page: 1,
      pageSize: 10,
      total: 0
    }
  }),

  getters: {
    getOrders: state => state.orders,
    getCurrentOrder: state => state.currentOrder,
    getError: state => state.error,
    getPagination: state => state.pagination,
    getOrderById: state => (orderId) => state.orders.find(order => order.orderId === orderId)
  },

  actions: {
    // 设置订单列表
    setOrders(orders) {
      this.orders = orders;
    },

    // 设置当前订单
    setCurrentOrder(order) {
      this.currentOrder = order;
    },

    // 设置错误信息
    setError(error) {
      this.error = error;
    },

    // 设置加载状态
    setLoading(loading) {
      this.isLoading = loading;
    },

    // 设置分页信息
    setPagination(pagination) {
      this.pagination = pagination;
    },

    // 获取订单列表
    async getOrdersList(params = {}) {
      try {
        this.setLoading(true);
        this.setError(null);

        const queryParams = new URLSearchParams({
          page: params.page || this.pagination.page,
          pageSize: params.pageSize || this.pagination.pageSize,
          status: params.status || '',
          type: params.type || ''
        });

        const response = await fetch(`${API_BASE_URL}/api/v1/order?${queryParams.toString()}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token') || 'test-token'}`,
          },
        });

        const data = await response.json();

        if (data.status === 'success') {
          this.setOrders(data.data.orders);
          this.setPagination({
            page: data.data.page,
            pageSize: data.data.pageSize,
            total: data.data.total
          });
          return true;
        } else {
          this.setError(data.message);
          return false;
        }
      } catch (error) {
        this.setError('获取订单列表失败，请稍后重试');
        return false;
      } finally {
        this.setLoading(false);
      }
    },

    // 获取订单详情
    async getOrderDetail(orderId) {
      try {
        this.setLoading(true);
        this.setError(null);

        const response = await fetch(`${API_BASE_URL}/api/v1/order/${orderId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token') || 'test-token'}`,
          },
        });

        const data = await response.json();

        if (data.status === 'success') {
          this.setCurrentOrder(data.data);
          return true;
        } else {
          this.setError(data.message);
          return false;
        }
      } catch (error) {
        this.setError('获取订单详情失败，请稍后重试');
        return false;
      } finally {
        this.setLoading(false);
      }
    },

    // 创建订单
    async createOrder(orderData) {
      try {
        this.setLoading(true);
        this.setError(null);

        const response = await fetch(`${API_BASE_URL}/api/v1/order/create`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('access_token') || 'test-token'}`,
          },
          body: JSON.stringify(orderData),
        });

        const data = await response.json();

        if (data.status === 'success') {
          this.setCurrentOrder(data.data);
          return data.data.orderId;
        } else {
          this.setError(data.message);
          return null;
        }
      } catch (error) {
        this.setError('创建订单失败，请稍后重试');
        return null;
      } finally {
        this.setLoading(false);
      }
    },

    // 取消订单
    async cancelOrder(orderId) {
      try {
        this.setLoading(true);
        this.setError(null);

        const response = await fetch(`${API_BASE_URL}/api/v1/order/${orderId}/cancel`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('access_token') || 'test-token'}`,
          },
        });

        const data = await response.json();

        if (data.status === 'success') {
          // 更新本地订单状态
          const order = this.orders.find(o => o.orderId === orderId);
          if (order) {
            order.status = 'cancelled';
          }
          if (this.currentOrder && this.currentOrder.orderId === orderId) {
            this.currentOrder.status = 'cancelled';
          }
          return true;
        } else {
          this.setError(data.message);
          return false;
        }
      } catch (error) {
        this.setError('取消订单失败，请稍后重试');
        return false;
      } finally {
        this.setLoading(false);
      }
    },

    // 确认收货
    async confirmReceipt(orderId) {
      try {
        this.setLoading(true);
        this.setError(null);

        const response = await fetch(`${API_BASE_URL}/api/v1/order/${orderId}/confirm`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('access_token') || 'test-token'}`,
          },
        });

        const data = await response.json();

        if (data.status === 'success') {
          // 更新本地订单状态
          const order = this.orders.find(o => o.orderId === orderId);
          if (order) {
            order.status = 'completed';
          }
          if (this.currentOrder && this.currentOrder.orderId === orderId) {
            this.currentOrder.status = 'completed';
          }
          return true;
        } else {
          this.setError(data.message);
          return false;
        }
      } catch (error) {
        this.setError('确认收货失败，请稍后重试');
        return false;
      } finally {
        this.setLoading(false);
      }
    },

    // 删除订单
    async deleteOrder(orderId) {
      try {
        this.setLoading(true);
        this.setError(null);

        const response = await fetch(`${API_BASE_URL}/api/v1/order/${orderId}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token') || 'test-token'}`,
          },
        });

        const data = await response.json();

        if (data.status === 'success') {
          // 从本地列表中移除
          this.orders = this.orders.filter(o => o.orderId !== orderId);
          if (this.currentOrder && this.currentOrder.orderId === orderId) {
            this.currentOrder = null;
          }
          return true;
        } else {
          this.setError(data.message);
          return false;
        }
      } catch (error) {
        this.setError('删除订单失败，请稍后重试');
        return false;
      } finally {
        this.setLoading(false);
      }
    },
  },
});