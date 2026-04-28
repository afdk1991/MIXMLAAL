<template>
  <div class="collection-page">
    <div class="container">
      <header class="page-header">
        <h1>{{ $t('collection.title') }}</h1>
      </header>

      <div class="tabs">
        <button
          v-for="tab in tabs"
          :key="tab.value"
          :class="{ active: activeTab === tab.value }"
          @click="activeTab = tab.value"
        >
          {{ tab.label }}
        </button>
      </div>

      <div class="collection-grid" v-if="collections.length > 0">
        <div
          v-for="item in collections"
          :key="item.id"
          class="collection-card"
          @click="goToDetail(item)"
        >
          <div class="card-image">
            <img :src="item.image" :alt="item.name" />
            <button class="delete-btn" @click.stop="removeCollection(item.id)">
              ×
            </button>
          </div>
          <div class="card-info">
            <h3>{{ item.name }}</h3>
            <p class="price">¥{{ item.price }}</p>
            <p class="meta">{{ item.shop }}</p>
          </div>
        </div>
      </div>

      <div v-else class="empty-state">
        <div class="empty-icon">❤️</div>
        <h3>{{ $t('collection.emptyTitle') }}</h3>
        <p>{{ $t('collection.emptyDesc') }}</p>
        <button @click="goShopping">{{ $t('collection.goShopping') }}</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Collection',
  data() {
    return {
      activeTab: 'product',
      tabs: [
        { label: '商品', value: 'product' },
        { label: '店铺', value: 'shop' },
        { label: '文章', value: 'post' },
      ],
      collections: [],
    };
  },
  mounted() {
    this.loadCollections();
  },
  methods: {
    async loadCollections() {
      this.collections = [];
    },
    goToDetail(item) {
      if (this.activeTab === 'product') {
        this.$router.push(`/product/${item.id}`);
      }
    },
    async removeCollection(id) {
      this.collections = this.collections.filter(c => c.id !== id);
    },
    goShopping() {
      this.$router.push('/mall');
    },
  },
};
</script>

<style scoped>
.collection-page {
  min-height: 100vh;
  background: #f5f7fa;
  padding: 40px 20px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 30px;
}

.page-header h1 {
  font-size: 28px;
  color: #333;
}

.tabs {
  display: flex;
  gap: 20px;
  margin-bottom: 30px;
  border-bottom: 1px solid #eee;
  padding-bottom: 15px;
}

.tabs button {
  background: none;
  border: none;
  padding: 10px 20px;
  font-size: 16px;
  color: #666;
  cursor: pointer;
  position: relative;
}

.tabs button.active {
  color: #667eea;
  font-weight: 600;
}

.tabs button.active::after {
  content: '';
  position: absolute;
  bottom: -16px;
  left: 0;
  right: 0;
  height: 2px;
  background: #667eea;
}

.collection-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
}

.collection-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.3s;
}

.collection-card:hover {
  transform: translateY(-3px);
}

.card-image {
  position: relative;
  height: 200px;
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.delete-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 30px;
  height: 30px;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  border-radius: 50%;
  font-size: 20px;
  cursor: pointer;
}

.card-info {
  padding: 15px;
}

.card-info h3 {
  font-size: 16px;
  color: #333;
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.price {
  color: #ff6b6b;
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 5px;
}

.meta {
  color: #999;
  font-size: 12px;
}

.empty-state {
  text-align: center;
  padding: 80px 20px;
}

.empty-icon {
  font-size: 80px;
  margin-bottom: 20px;
}

.empty-state h3 {
  font-size: 20px;
  color: #333;
  margin-bottom: 10px;
}

.empty-state p {
  color: #999;
  margin-bottom: 30px;
}

.empty-state button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 12px 30px;
  border-radius: 25px;
  font-size: 16px;
  cursor: pointer;
}
</style>