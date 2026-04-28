<template>
  <div class="blog-page">
    <div class="container">
      <header class="page-header">
        <h1>{{ $t('blog.title') }}</h1>
        <p>{{ $t('blog.subtitle') }}</p>
      </header>

      <div class="blog-filters">
        <select v-model="selectedCategory" @change="filterPosts">
          <option value="">{{ $t('blog.allCategories') }}</option>
          <option v-for="cat in categories" :key="cat.id" :value="cat.id">
            {{ cat.name }}
          </option>
        </select>
        <input
          type="text"
          v-model="searchQuery"
          :placeholder="$t('blog.searchPlaceholder')"
          @input="searchPosts"
        />
      </div>

      <div class="blog-grid">
        <article
          v-for="post in filteredPosts"
          :key="post.id"
          class="blog-card"
          @click="goToPost(post.id)"
        >
          <div class="card-image" :style="{ backgroundImage: `url(${post.cover})` }">
            <span class="category-tag">{{ post.category }}</span>
          </div>
          <div class="card-content">
            <h3>{{ post.title }}</h3>
            <p class="excerpt">{{ post.excerpt }}</p>
            <div class="card-meta">
              <span class="author">{{ post.author }}</span>
              <span class="date">{{ formatDate(post.date) }}</span>
            </div>
          </div>
        </article>
      </div>

      <div v-if="filteredPosts.length === 0" class="no-results">
        <p>{{ $t('blog.noResults') }}</p>
      </div>

      <div class="pagination" v-if="totalPages > 1">
        <button
          v-for="page in totalPages"
          :key="page"
          :class="{ active: currentPage === page }"
          @click="changePage(page)"
        >
          {{ page }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Blog',
  data() {
    return {
      posts: [],
      filteredPosts: [],
      categories: [],
      selectedCategory: '',
      searchQuery: '',
      currentPage: 1,
      pageSize: 12,
      totalPages: 1,
    };
  },
  mounted() {
    this.loadPosts();
  },
  methods: {
    async loadPosts() {
      this.posts = [
        {
          id: 1,
          title: 'MIXMLAAL平台介绍',
          excerpt: '了解MIXMLAAL如何改变您的出行和生活方式...',
          cover: 'https://via.placeholder.com/400x300',
          category: '平台动态',
          author: '官方',
          date: new Date(),
        },
        {
          id: 2,
          title: '新功能上线公告',
          excerpt: '最新版本更新，带来更多实用功能...',
          cover: 'https://via.placeholder.com/400x300',
          category: '产品更新',
          author: '产品团队',
          date: new Date(),
        },
      ];
      this.filteredPosts = this.posts;
      this.totalPages = Math.ceil(this.posts.length / this.pageSize);
    },
    filterPosts() {
      this.applyFilters();
    },
    searchPosts() {
      this.applyFilters();
    },
    applyFilters() {
      let result = [...this.posts];
      if (this.selectedCategory) {
        result = result.filter(p => p.category === this.selectedCategory);
      }
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        result = result.filter(p =>
          p.title.toLowerCase().includes(query) ||
          p.excerpt.toLowerCase().includes(query)
        );
      }
      this.filteredPosts = result;
      this.totalPages = Math.ceil(result.length / this.pageSize);
    },
    goToPost(id) {
      this.$router.push(`/blog/${id}`);
    },
    formatDate(date) {
      return new Date(date).toLocaleDateString('zh-CN');
    },
    changePage(page) {
      this.currentPage = page;
      this.loadPosts();
    },
  },
};
</script>

<style scoped>
.blog-page {
  min-height: 100vh;
  background: #f5f7fa;
  padding: 40px 20px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  text-align: center;
  margin-bottom: 40px;
}

.page-header h1 {
  font-size: 36px;
  color: #333;
  margin-bottom: 10px;
}

.page-header p {
  color: #666;
  font-size: 16px;
}

.blog-filters {
  display: flex;
  gap: 20px;
  margin-bottom: 30px;
}

.blog-filters select,
.blog-filters input {
  padding: 12px 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
}

.blog-filters input {
  flex: 1;
}

.blog-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 30px;
}

.blog-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.3s, box-shadow 0.3s;
}

.blog-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.card-image {
  height: 200px;
  background-size: cover;
  background-position: center;
  position: relative;
}

.category-tag {
  position: absolute;
  top: 15px;
  left: 15px;
  background: #667eea;
  color: white;
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 12px;
}

.card-content {
  padding: 20px;
}

.card-content h3 {
  font-size: 18px;
  color: #333;
  margin-bottom: 10px;
}

.excerpt {
  color: #666;
  font-size: 14px;
  line-height: 1.6;
  margin-bottom: 15px;
}

.card-meta {
  display: flex;
  justify-content: space-between;
  color: #999;
  font-size: 12px;
}

.no-results {
  text-align: center;
  padding: 60px 20px;
  color: #999;
}

.pagination {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 40px;
}

.pagination button {
  width: 40px;
  height: 40px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.pagination button.active {
  background: #667eea;
  color: white;
  border-color: #667eea;
}
</style>