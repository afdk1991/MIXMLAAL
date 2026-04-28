import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { useCartStore } from '@/store/cart';

describe('Cart Store', () => {
  let cartStore;

  beforeEach(() => {
    // 创建Pinia实例
    const pinia = createPinia();
    setActivePinia(pinia);
    cartStore = useCartStore();
  });

  it('initializes with default state', () => {
    expect(cartStore.items).toEqual([]);
    expect(cartStore.totalQuantity).toBe(0);
    expect(cartStore.totalPrice).toBe(0);
    expect(cartStore.shippingFee).toBe(0);
    expect(cartStore.discountAmount).toBe(0);
    expect(cartStore.totalAmount).toBe(0);
    expect(cartStore.selectedCoupon).toBe(null);
    expect(cartStore.loading).toBe(false);
    expect(cartStore.error).toBe(null);
  });

  it('adds item to cart', () => {
    const product = {
      productId: '123',
      name: 'Test Product',
      price: 100,
      image: 'test.jpg',
      stock: 10
    };
    const quantity = 2;

    cartStore.addItem(product, quantity);
    expect(cartStore.items.length).toBe(1);
    expect(cartStore.items[0].productId).toBe('123');
    expect(cartStore.items[0].quantity).toBe(2);
    expect(cartStore.totalQuantity).toBe(2);
    expect(cartStore.totalPrice).toBe(200);
  });

  it('adds existing item to cart (increments quantity)', () => {
    // 先添加一个商品
    const product = {
      productId: '123',
      name: 'Test Product',
      price: 100,
      image: 'test.jpg',
      stock: 10
    };
    cartStore.addItem(product, 1);
    
    // 再次添加同一个商品
    cartStore.addItem(product, 1);
    
    expect(cartStore.items.length).toBe(1);
    expect(cartStore.items[0].quantity).toBe(2);
    expect(cartStore.totalQuantity).toBe(2);
    expect(cartStore.totalPrice).toBe(200);
  });

  it('removes item from cart', () => {
    // 先添加一个商品
    const product = {
      productId: '123',
      name: 'Test Product',
      price: 100,
      image: 'test.jpg',
      stock: 10
    };
    cartStore.addItem(product, 1);
    
    // 移除商品
    cartStore.removeItem('123');
    
    expect(cartStore.items.length).toBe(0);
    expect(cartStore.totalQuantity).toBe(0);
    expect(cartStore.totalPrice).toBe(0);
  });

  it('updates item quantity', () => {
    // 先添加一个商品
    const product = {
      productId: '123',
      name: 'Test Product',
      price: 100,
      image: 'test.jpg',
      stock: 10
    };
    cartStore.addItem(product, 1);
    
    // 更新数量
    cartStore.updateQuantity('123', 3);
    
    expect(cartStore.items[0].quantity).toBe(3);
    expect(cartStore.totalQuantity).toBe(3);
    expect(cartStore.totalPrice).toBe(300);
  });

  it('toggles item selection', () => {
    // 先添加一个商品
    const product = {
      productId: '123',
      name: 'Test Product',
      price: 100,
      image: 'test.jpg',
      stock: 10
    };
    cartStore.addItem(product, 1);
    
    // 切换选中状态
    cartStore.toggleSelect('123');
    
    expect(cartStore.items[0].selected).toBe(false);
  });

  it('selects all items', () => {
    // 先添加两个商品
    const product1 = {
      productId: '123',
      name: 'Test Product 1',
      price: 100,
      image: 'test1.jpg',
      stock: 10
    };
    const product2 = {
      productId: '456',
      name: 'Test Product 2',
      price: 200,
      image: 'test2.jpg',
      stock: 5
    };
    cartStore.addItem(product1, 1);
    cartStore.addItem(product2, 1);
    
    // 取消选中第一个商品
    cartStore.toggleSelect('123');
    
    // 全选
    cartStore.selectAll(true);
    
    expect(cartStore.items[0].selected).toBe(true);
    expect(cartStore.items[1].selected).toBe(true);
  });

  it('clears cart', () => {
    // 先添加一个商品
    const product = {
      productId: '123',
      name: 'Test Product',
      price: 100,
      image: 'test.jpg',
      stock: 10
    };
    cartStore.addItem(product, 1);
    
    // 清空购物车
    cartStore.clearCart();
    
    expect(cartStore.items.length).toBe(0);
    expect(cartStore.totalQuantity).toBe(0);
    expect(cartStore.totalPrice).toBe(0);
  });

  it('calculates shipping fee', () => {
    // 先添加一个商品
    const product = {
      productId: '123',
      name: 'Test Product',
      price: 50,
      image: 'test.jpg',
      stock: 10
    };
    cartStore.addItem(product, 1);
    
    // 计算运费
    cartStore.calculateShippingFee();
    
    // 商品总价50，应该有运费
    expect(cartStore.shippingFee).toBeGreaterThan(0);
  });

  it('applies coupon', () => {
    // 先添加一个商品
    const product = {
      productId: '123',
      name: 'Test Product',
      price: 200,
      image: 'test.jpg',
      stock: 10
    };
    cartStore.addItem(product, 1);
    
    // 应用优惠券
    const coupon = {
      couponId: 'coupon123',
      name: '满100减20',
      type: 1,
      value: 20,
      minAmount: 100
    };
    cartStore.applyCoupon(coupon);
    
    expect(cartStore.selectedCoupon).toEqual(coupon);
    expect(cartStore.discountAmount).toBe(20);
  });

  it('removes coupon', () => {
    // 先添加一个商品
    const product = {
      productId: '123',
      name: 'Test Product',
      price: 200,
      image: 'test.jpg',
      stock: 10
    };
    cartStore.addItem(product, 1);
    
    // 应用优惠券
    const coupon = {
      couponId: 'coupon123',
      name: '满100减20',
      type: 1,
      value: 20,
      minAmount: 100
    };
    cartStore.applyCoupon(coupon);
    
    // 移除优惠券
    cartStore.removeCoupon();
    
    expect(cartStore.selectedCoupon).toBe(null);
    expect(cartStore.discountAmount).toBe(0);
  });

  it('loads cart from localStorage', () => {
    const cartItems = [
      {
        productId: '123',
        name: 'Test Product',
        price: 100,
        image: 'test.jpg',
        quantity: 2,
        selected: true
      }
    ];
    
    // 模拟localStorage
    global.localStorage.getItem = vi.fn((key) => {
      if (key === 'cart') return JSON.stringify(cartItems);
      return null;
    });
    
    cartStore.loadFromLocalStorage();
    expect(cartStore.items.length).toBe(1);
    expect(cartStore.items[0].productId).toBe('123');
    expect(cartStore.items[0].quantity).toBe(2);
  });

  it('saves cart to localStorage', () => {
    // 先添加一个商品
    const product = {
      productId: '123',
      name: 'Test Product',
      price: 100,
      image: 'test.jpg',
      stock: 10
    };
    
    // 模拟localStorage
    global.localStorage.setItem = vi.fn();
    
    cartStore.addItem(product, 1);
    
    expect(global.localStorage.setItem).toHaveBeenCalledWith('cart', expect.any(String));
  });

  it('checks out successfully', async () => {
    // 模拟fetch返回成功
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          status: 'success',
          data: {
            orderId: 'order123',
            paymentUrl: 'https://payment.example.com'
          }
        })
      })
    );

    // 先添加一个商品
    const product = {
      productId: '123',
      name: 'Test Product',
      price: 100,
      image: 'test.jpg',
      stock: 10
    };
    cartStore.addItem(product, 1);

    const checkoutData = {
      addressId: 'addr123',
      paymentMethod: 'wechat',
      remark: 'Test order'
    };

    const result = await cartStore.checkout(checkoutData);
    expect(result).toBe('order123');
  });
});