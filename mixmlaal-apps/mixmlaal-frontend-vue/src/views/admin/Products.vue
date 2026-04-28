<template>
  <div class="products-container">
    <div class="products-header">
      <h1 class="text-2xl font-bold mb-6">商品管理</h1>
      <button class="add-product-btn">
        <i class="fa fa-plus mr-2"></i>
        添加商品
      </button>
    </div>
    
    <div class="products-search">
      <div class="search-input">
        <i class="fa fa-search"></i>
        <input type="text" placeholder="搜索商品名称或ID..." v-model="searchQuery">
      </div>
      <div class="search-filters">
        <select v-model="filterCategory">
          <option value="">全部分类</option>
          <option value="electronics">电子产品</option>
          <option value="clothing">服装</option>
          <option value="food">食品</option>
          <option value="other">其他</option>
        </select>
        <select v-model="filterStatus">
          <option value="">所有状态</option>
          <option value="active">上架</option>
          <option value="inactive">下架</option>
        </select>
      </div>
    </div>
    
    <div class="products-grid">
      <div v-for="product in filteredProducts" :key="product.id" class="product-card">
        <div class="product-image">
          <img :src="product.image" :alt="product.name">
        </div>
        <div class="product-info">
          <h3 class="product-name">{{ product.name }}</h3>
          <p class="product-price">¥{{ product.price }}</p>
          <p class="product-stock">库存: {{ product.stock }}</p>
          <p class="product-category">{{ product.category }}</p>
          <div class="product-status">
            <span class="status-badge" :class="product.status">{{ product.statusText }}</span>
          </div>
          <div class="product-actions">
            <button class="edit-btn">
              <i class="fa fa-edit"></i>
              编辑
            </button>
            <button class="delete-btn">
              <i class="fa fa-trash"></i>
              删除
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <div class="products-pagination">
      <button class="page-btn" :disabled="currentPage === 1">上一页</button>
      <span class="page-info">第 {{ currentPage }} 页，共 {{ totalPages }} 页</span>
      <button class="page-btn" :disabled="currentPage === totalPages">下一页</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const searchQuery = ref('');
const filterCategory = ref('');
const filterStatus = ref('');
const currentPage = ref(1);
const pageSize = 12;

const products = ref([
  { id: 1, name: '智能手机', price: 4999, stock: 100, category: '电子产品', status: 'active', statusText: '上架', image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=smartphone%20product&image_size=square' },
  { id: 2, name: '笔记本电脑', price: 7999, stock: 50, category: '电子产品', status: 'active', statusText: '上架', image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=laptop%20computer&image_size=square' },
  { id: 3, name: '运动T恤', price: 199, stock: 200, category: '服装', status: 'active', statusText: '上架', image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=sports%20t-shirt&image_size=square' },
  { id: 4, name: '牛仔裤', price: 399, stock: 150, category: '服装', status: 'active', statusText: '上架', image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=jeans%20pants&image_size=square' },
  { id: 5, name: '巧克力', price: 99, stock: 300, category: '食品', status: 'active', statusText: '上架', image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=chocolate%20bar&image_size=square' },
  { id: 6, name: '饼干', price: 49, stock: 400, category: '食品', status: 'inactive', statusText: '下架', image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cookies%20box&image_size=square' },
  { id: 7, name: '耳机', price: 299, stock: 120, category: '电子产品', status: 'active', statusText: '上架', image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=headphones&image_size=square' },
  { id: 8, name: '运动鞋', price: 599, stock: 80, category: '服装', status: 'active', statusText: '上架', image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=sports%20shoes&image_size=square' },
  { id: 9, name: '水果礼盒', price: 199, stock: 60, category: '食品', status: 'active', statusText: '上架', image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fruit%20gift%20box&image_size=square' },
  { id: 10, name: '手表', price: 1299, stock: 40, category: '其他', status: 'active', statusText: '上架', image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=watch&image_size=square' },
  { id: 11, name: '背包', price: 399, stock: 70, category: '其他', status: 'inactive', statusText: '下架', image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=backpack&image_size=square' },
  { id: 12, name: '平板电脑', price: 3999, stock: 30, category: '电子产品', status: 'active', statusText: '上架', image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=tablet%20computer&image_size=square' }
]);

const filteredProducts = computed(() => {
  let result = products.value;
  
  if (searchQuery.value) {
    result = result.filter(product => 
      product.name.includes(searchQuery.value) || 
      product.id.toString().includes(searchQuery.value)
    );
  }
  
  if (filterCategory.value) {
    result = result.filter(product => product.category === filterCategory.value);
  }
  
  if (filterStatus.value) {
    result = result.filter(product => product.status === filterStatus.value);
  }
  
  return result;
});

const totalPages = computed(() => {
  return Math.ceil(filteredProducts.value.length / pageSize);
});
</script>

<style scoped>
.products-container {
  padding: 20px;
}

.products-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.add-product-btn {
  background-color: #3b82f6;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  display: flex;
  align-items: center;
}

.add-product-btn:hover {
  background-color: #2563eb;
}

.products-search {
  display: flex;
  gap: 20px;
  margin-bottom: 30px;
  flex-wrap: wrap;
}

.search-input {
  position: relative;
  flex: 1;
  min-width: 300px;
}

.search-input i {
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
}

.search-input input {
  width: 100%;
  padding: 10px 15px 10px 40px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 14px;
}

.search-filters {
  display: flex;
  gap: 10px;
}

.search-filters select {
  padding: 10px 15px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 14px;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.product-card {
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.product-image {
  height: 200px;
  overflow: hidden;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-info {
  padding: 15px;
}

.product-name {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 8px;
}

.product-price {
  font-size: 18px;
  font-weight: bold;
  color: #ef4444;
  margin-bottom: 5px;
}

.product-stock {
  font-size: 14px;
  color: #64748b;
  margin-bottom: 5px;
}

.product-category {
  font-size: 14px;
  color: #64748b;
  margin-bottom: 10px;
}

.product-status {
  margin-bottom: 15px;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.status-badge.active {
  background-color: #d1fae5;
  color: #065f46;
}

.status-badge.inactive {
  background-color: #fef3c7;
  color: #92400e;
}

.product-actions {
  display: flex;
  gap: 10px;
}

.edit-btn, .delete-btn {
  flex: 1;
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
}

.edit-btn {
  background-color: #f1f5f9;
  color: #3b82f6;
}

.edit-btn:hover {
  background-color: #e2e8f0;
}

.delete-btn {
  background-color: #fef2f2;
  color: #ef4444;
}

.delete-btn:hover {
  background-color: #fee2e2;
}

.products-pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
}

.page-btn {
  background-color: white;
  border: 1px solid #e2e8f0;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.page-btn:hover:not(:disabled) {
  background-color: #f8fafc;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  font-size: 14px;
  color: #64748b;
}
</style>