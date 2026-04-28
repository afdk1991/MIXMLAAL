<template>
  <div class="cart-container">
    <van-nav-bar
      title="购物车"
      left-text="返回"
      left-arrow
      @click-left="goBack"
    />

    <div class="cart-list" v-if="cartGroups.length">
      <div class="shop-group" v-for="group in cartGroups" :key="group.shop.id">
        <div class="shop-header">
          <span class="shop-name">{{ group.shop.shop_name }}</span>
        </div>
        <div class="cart-items">
          <div class="cart-item" v-for="item in group.items" :key="item.id">
            <van-checkbox :model-value="item.is_selected" @change="toggleSelect(item)" />
            <van-image width="60" height="60" fit="cover" :src="item.product?.product_image || defaultImage" />
            <div class="item-info">
              <div class="item-name">{{ item.product?.product_name }}</div>
              <div class="item-spec" v-if="item.specifications">{{ item.specifications }}</div>
              <div class="item-bottom">
                <span class="item-price">¥{{ item.price }}</span>
                <van-stepper v-model="item.quantity" @change="updateQuantity(item)" min="1" />
              </div>
            </div>
            <van-icon name="delete-o" class="delete-icon" @click="deleteItem(item)" />
          </div>
        </div>
      </div>
    </div>

    <van-empty v-else description="购物车是空的" />

    <van-submit-bar
      v-if="cartGroups.length"
      :price="totalPrice * 100"
      button-text="结算"
      @submit="handleCheckout"
    >
      <van-checkbox :model-value="isAllSelected" @change="toggleAll">全选</van-checkbox>
    </van-submit-bar>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showConfirmDialog } from 'vant'
import api from '../../api'

const router = useRouter()
const cartGroups = ref([])
const isAllSelected = ref(false)
const defaultImage = 'https://via.placeholder.com/60'

const totalPrice = computed(() => {
  let total = 0
  cartGroups.value.forEach(group => {
    group.items.forEach(item => {
      if (item.is_selected) {
        total += item.price * item.quantity
      }
    })
  })
  return total
})

onMounted(() => {
  getCartList()
})

const getCartList = async () => {
  try {
    const response = await api.get('/mall/cart')
    cartGroups.value = response.data.data || []
  } catch (error) {
    console.error('获取购物车列表失败:', error)
  }
}

const goBack = () => {
  router.back()
}

const toggleSelect = async (item) => {
  try {
    item.is_selected = !item.is_selected
    await api.put(`/mall/cart/${item.id}`, {
      is_selected: item.is_selected
    })
    checkAllSelected()
  } catch (error) {
    console.error('更新选中状态失败:', error)
  }
}

const toggleAll = async () => {
  try {
    isAllSelected.value = !isAllSelected.value
    for (const group of cartGroups.value) {
      for (const item of group.items) {
        item.is_selected = isAllSelected.value
        await api.put(`/mall/cart/${item.id}`, {
          is_selected: item.is_selected
        })
      }
    }
  } catch (error) {
    console.error('更新选中状态失败:', error)
  }
}

const checkAllSelected = () => {
  isAllSelected.value = cartGroups.value.every(group =>
    group.items.every(item => item.is_selected)
  )
}

const updateQuantity = async (item) => {
  try {
    await api.put(`/mall/cart/${item.id}`, {
      quantity: item.quantity
    })
  } catch (error) {
    console.error('更新数量失败:', error)
  }
}

const deleteItem = async (item) => {
  try {
    await showConfirmDialog({
      title: '确认删除',
      message: '确定要删除该商品吗？'
    })
    await api.delete(`/mall/cart/${item.id}`)
    getCartList()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
    }
  }
}

const handleCheckout = () => {
  const selectedItems = []
  cartGroups.value.forEach(group => {
    group.items.forEach(item => {
      if (item.is_selected) {
        selectedItems.push({
          cart_id: item.id,
          product_id: item.product_id,
          quantity: item.quantity,
          price: item.price
        })
      }
    })
  })

  if (selectedItems.length === 0) {
    showToast({ message: '请选择商品', position: 'top' })
    return
  }

  showToast({ message: '结算功能开发中', position: 'top' })
}
</script>

<style scoped>
.cart-container {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 60px;
}

.cart-list {
  padding: 10px;
}

.shop-group {
  background: #fff;
  border-radius: 8px;
  margin-bottom: 10px;
  overflow: hidden;
}

.shop-header {
  padding: 10px 15px;
  border-bottom: 1px solid #f5f5f5;
}

.shop-name {
  font-weight: bold;
  font-size: 14px;
}

.cart-items {
  padding: 10px 15px;
}

.cart-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 0;
  border-bottom: 1px solid #f5f5f5;
}

.cart-item:last-child {
  border-bottom: none;
}

.item-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.item-name {
  font-size: 14px;
  color: #333;
}

.item-spec {
  font-size: 12px;
  color: #999;
}

.item-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.item-price {
  font-size: 14px;
  font-weight: bold;
  color: #f5576c;
}

.delete-icon {
  font-size: 18px;
  color: #999;
}
</style>