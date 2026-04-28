import { createPinia, setActivePinia } from 'pinia';
import { useUserStore, useCartStore } from '@/store';

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem(key) {
      return store[key] || null;
    },
    setItem(key, value) {
      store[key] = value.toString();
    },
    removeItem(key) {
      delete store[key];
    },
    clear() {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock fetch
global.fetch = jest.fn();

describe('Store Tests', () => {
  beforeEach(() => {
    // 创建一个新的 Pinia 实例
    const pinia = createPinia();
    setActivePinia(pinia);
    // 清空 localStorage
    localStorage.clear();
    // 重置 fetch mock
    fetch.mockReset();
  });

  describe('User Store', () => {
    test('initial state is correct', () => {
      const userStore = useUserStore();
      expect(userStore.user).toBeNull();
      expect(userStore.token).toBeNull();
      expect(userStore.isLoading).toBe(false);
      expect(userStore.error).toBeNull();
    });

    test('login successful', async () => {
      const userStore = useUserStore();

      // Mock fetch response
      fetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          status: 'success',
          data: {
            user: { userId: '1', phone: '13800138000', nickname: 'Test User' },
            token: 'test-token',
          },
        }),
      });

      const result = await userStore.login({ phone: '13800138000', password: 'password' });

      expect(result).toBe(true);
      expect(userStore.user).toEqual({ userId: '1', phone: '13800138000', nickname: 'Test User' });
      expect(userStore.token).toBe('test-token');
      expect(localStorage.getItem('access_token')).toBe('test-token');
    });

    test('login failed', async () => {
      const userStore = useUserStore();

      // Mock fetch response
      fetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          status: 'error',
          message: 'Invalid credentials',
        }),
      });

      const result = await userStore.login({ phone: '13800138000', password: 'wrong-password' });

      expect(result).toBe(false);
      expect(userStore.error).toBe('Invalid credentials');
      expect(userStore.user).toBeNull();
      expect(userStore.token).toBeNull();
    });

    test('logout', () => {
      const userStore = useUserStore();

      // Set initial state
      userStore.setUser({ userId: '1', phone: '13800138000' });
      userStore.setToken('test-token');

      // Logout
      userStore.logout();

      expect(userStore.user).toBeNull();
      expect(userStore.token).toBeNull();
      expect(localStorage.getItem('access_token')).toBeNull();
    });
  });

  describe('Cart Store', () => {
    test('initial state is correct', () => {
      const cartStore = useCartStore();
      expect(cartStore.items).toEqual([]);
      expect(cartStore.isLoading).toBe(false);
      expect(cartStore.error).toBeNull();
    });

    test('add item to cart', () => {
      const cartStore = useCartStore();

      const product = {
        productId: '1',
        name: 'Test Product',
        price: 100,
      };

      cartStore.addItem(product);

      expect(cartStore.items.length).toBe(1);
      expect(cartStore.items[0].productId).toBe('1');
      expect(cartStore.items[0].quantity).toBe(1);
      expect(cartStore.getItemCount).toBe(1);
      expect(cartStore.getTotalPrice).toBe(100);
    });

    test('remove item from cart', () => {
      const cartStore = useCartStore();

      // Add item
      const product = {
        productId: '1',
        name: 'Test Product',
        price: 100,
      };
      cartStore.addItem(product);
      expect(cartStore.items.length).toBe(1);

      // Remove item
      cartStore.removeItem('1');
      expect(cartStore.items.length).toBe(0);
      expect(cartStore.getItemCount).toBe(0);
      expect(cartStore.getTotalPrice).toBe(0);
    });

    test('update item quantity', () => {
      const cartStore = useCartStore();

      // Add item
      const product = {
        productId: '1',
        name: 'Test Product',
        price: 100,
      };
      cartStore.addItem(product);

      // Update quantity
      cartStore.updateQuantity('1', 3);
      expect(cartStore.items[0].quantity).toBe(3);
      expect(cartStore.getItemCount).toBe(3);
      expect(cartStore.getTotalPrice).toBe(300);
    });

    test('clear cart', () => {
      const cartStore = useCartStore();

      // Add item
      const product = {
        productId: '1',
        name: 'Test Product',
        price: 100,
      };
      cartStore.addItem(product);
      expect(cartStore.items.length).toBe(1);

      // Clear cart
      cartStore.clearCart();
      expect(cartStore.items.length).toBe(0);
      expect(cartStore.getItemCount).toBe(0);
      expect(cartStore.getTotalPrice).toBe(0);
    });
  });
});
