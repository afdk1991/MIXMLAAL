<template>
  <div class="cart-container">
    <header class="cart-header">
      <button class="back-btn" @click="goBack">
        <i class="fa fa-arrow-left"></i>
      </button>
      <h1>购物车</h1>
      <button class="clear-btn" @click="clearCart" v-if="cartStore.items.length > 0">
        清空
      </button>
    </header>

    <div class="cart-content" v-if="cartStore.items.length > 0">
      <div class="cart-items">
        <div
          v-for="item in cartStore.items"
          :key="item.productId"
          class="cart-item"
        >
          <div class="item-checkbox">
            <input
              type="checkbox"
              :checked="item.selected"
              @change="toggleSelect(item.productId)"
            >
          </div>
          <div class="item-image">
            <img :src="item.image || 'https://via.placeholder.com/80'" :alt="item.name">
          </div>
          <div class="item-info">
            <h4>{{ item.name }}</h4>
            <p class="item-description">{{ item.description }}</p>
            <div class="item-price">¥{{ item.price }}</div>
          </div>
          <div class="item-quantity">
            <button @click="decreaseQuantity(item)">-</button>
            <span>{{ item.quantity }}</span>
            <button @click="increaseQuantity(item)">+</button>
          </div>
          <div class="item-actions">
            <button class="delete-btn" @click="removeItem(item.productId)">
              <i class="fa fa-trash"></i>
            </button>
          </div>
        </div>
      </div>

      <div class="cart-summary">
        <div class="summary-row">
          <span>商品件数：</span>
          <span>{{ cartStore.totalCount }}件</span>
        </div>
        <div class="summary-row total">
          <span>合计：</span>
          <span class="total-price">¥{{ cartStore.totalPrice }}</span>
        </div>
        <button class="checkout-btn" @click="goToCheckout">
          去结算
        </button>
      </div>
    </div>

    <div class="empty-cart" v-else>
      <i class="fa fa-shopping-cart"></i>
      <p>购物车是空的</p>
      <button @click="goShopping">去逛逛</button>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { useCartStore } from '@/store/cart';

const router = useRouter();
const cartStore = useCartStore();

function goBack() {
  router.back();
}

function toggleSelect(productId) {
  cartStore.toggleSelect(productId);
}

function decreaseQuantity(item) {
  if (item.quantity > 1) {
    cartStore.updateQuantity(item.productId, item.quantity - 1);
  }
}

function increaseQuantity(item) {
  cartStore.updateQuantity(item.productId, item.quantity + 1);
}

function removeItem(productId) {
  cartStore.removeItem(productId);
}

function clearCart() {
  if (confirm('确定要清空购物车吗？')) {
    cartStore.clearCart();
  }
}

function goToCheckout() {
  router.push('/shop/checkout');
}

function goShopping() {
  router.push('/mall');
}
</script>

<style scoped>
.cart-container {
  min-height: 100vh;
  background-color: var(--color-gray-50);
}

.cart-header {
  display: flex;
  align-items: center;
  padding: 1rem;
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.back-btn {
  background: none;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
}

.cart-header h1 {
  flex: 1;
  text-align: center;
  font-size: 1.125rem;
}

.clear-btn {
  background: none;
  border: none;
  color: var(--color-danger);
  cursor: pointer;
}

.cart-items {
  background: white;
  margin-bottom: 1rem;
}

.cart-item {
  display: flex;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid var(--color-gray-100);
}

.item-checkbox input {
  width: 1.25rem;
  height: 1.25rem;
  margin-right: 0.75rem;
}

.item-image img {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 0.25rem;
  margin-right: 0.75rem;
}

.item-info {
  flex: 1;
}

.item-info h4 {
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
}

.item-description {
  font-size: 0.75rem;
  color: var(--color-gray-500);
  margin-bottom: 0.25rem;
}

.item-price {
  color: var(--color-danger);
  font-weight: 500;
}

.item-quantity {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0 0.75rem;
}

.item-quantity button {
  width: 1.5rem;
  height: 1.5rem;
  border: 1px solid var(--color-gray-300);
  background: white;
  cursor: pointer;
}

.item-quantity span {
  min-width: 1.5rem;
  text-align: center;
}

.delete-btn {
  background: none;
  border: none;
  color: var(--color-gray-400);
  cursor: pointer;
  padding: 0.5rem;
}

.delete-btn:hover {
  color: var(--color-danger);
}

.cart-summary {
  background: white;
  padding: 1rem;
  position: sticky;
  bottom: 0;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  color: var(--color-gray-600);
}

.summary-row.total {
  font-size: 1.125rem;
  font-weight: 600;
  margin-top: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px solid var(--color-gray-100);
}

.total-price {
  color: var(--color-danger);
}

.checkout-btn {
  width: 100%;
  padding: 0.75rem;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  color: white;
  border: none;
  border-radius: 0.25rem;
  font-size: 1rem;
  cursor: pointer;
  margin-top: 1rem;
}

.empty-cart {
  text-align: center;
  padding: 4rem 2rem;
}

.empty-cart i {
  font-size: 4rem;
  color: var(--color-gray-300);
  margin-bottom: 1rem;
}

.empty-cart p {
  color: var(--color-gray-500);
  margin-bottom: 1rem;
}

.empty-cart button {
  padding: 0.75rem 2rem;
  background-color: var(--color-primary);
  color: white;
  border: none;
  border-radius: 0.25rem;
  cursor: pointer;
}
</style>