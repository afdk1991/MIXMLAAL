const express = require('express');
const cors = require('cors');
const { Client } = require('@elastic/elasticsearch');
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/search-service.log' })
  ]
});

const app = express();
app.use(cors());
app.use(express.json());

const client = new Client({
  node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200',
  auth: {
    username: process.env.ES_USERNAME || 'elastic',
    password: process.env.ES_PASSWORD || 'changeme'
  }
});

const INDICES = {
  PRODUCTS: 'products',
  MERCHANTS: 'merchants',
  USERS: 'users',
  ORDERS: 'orders',
  ARTICLES: 'articles'
};

const INDEX_MAPPINGS = {
  [INDICES.PRODUCTS]: {
    mappings: {
      properties: {
        product_id: { type: 'keyword' },
        name: { type: 'text', analyzer: 'ik_max_word', search_analyzer: 'ik_smart' },
        description: { type: 'text', analyzer: 'ik_max_word' },
        category: { type: 'keyword' },
        price: { type: 'float' },
        merchant_id: { type: 'keyword' },
        merchant_name: { type: 'text' },
        status: { type: 'keyword' },
        sales_count: { type: 'integer' },
        rating: { type: 'float' },
        tags: { type: 'keyword' },
        image_url: { type: 'keyword' },
        created_at: { type: 'date' },
        updated_at: { type: 'date' }
      }
    }
  },
  [INDICES.MERCHANTS]: {
    mappings: {
      properties: {
        merchant_id: { type: 'keyword' },
        name: { type: 'text', analyzer: 'ik_max_word' },
        description: { type: 'text' },
        category: { type: 'keyword' },
        address: { type: 'text' },
        location: { type: 'geo_point' },
        rating: { type: 'float' },
        monthly_sales: { type: 'integer' },
        status: { type: 'keyword' },
        open_time: { type: 'keyword' },
        created_at: { type: 'date' }
      }
    }
  },
  [INDICES.ARTICLES]: {
    mappings: {
      properties: {
        article_id: { type: 'keyword' },
        title: { type: 'text', analyzer: 'ik_max_word' },
        content: { type: 'text', analyzer: 'ik_max_word' },
        author: { type: 'keyword' },
        category: { type: 'keyword' },
        tags: { type: 'keyword' },
        view_count: { type: 'integer' },
        like_count: { type: 'integer' },
        created_at: { type: 'date' }
      }
    }
  }
};

async function initIndices() {
  for (const [indexName, settings] of Object.entries(INDEX_MAPPINGS)) {
    try {
      const exists = await client.indices.exists({ index: indexName });
      if (!exists) {
        await client.indices.create({
          index: indexName,
          ...settings
        });
        logger.info(`Index ${indexName} created successfully`);
      } else {
        logger.info(`Index ${indexName} already exists`);
      }
    } catch (error) {
      logger.error(`Failed to create index ${indexName}:`, error);
    }
  }
}

async function indexProduct(product) {
  try {
    await client.index({
      index: INDICES.PRODUCTS,
      id: product.product_id,
      document: product
    });
    logger.info(`Product ${product.product_id} indexed`);
    return true;
  } catch (error) {
    logger.error('Failed to index product:', error);
    return false;
  }
}

async function searchProducts(query, options = {}) {
  const { category, merchant_id, min_price, max_price, page = 1, size = 20, sort = 'relevance' } = options;
  
  const must = [];
  const filter = [];

  if (query) {
    must.push({
      multi_match: {
        query,
        fields: ['name^3', 'description^2', 'merchant_name', 'tags'],
        type: 'best_fields',
        fuzziness: 'AUTO'
      }
    });
  }

  if (category) {
    filter.push({ term: { category } });
  }

  if (merchant_id) {
    filter.push({ term: { merchant_id } });
  }

  if (min_price || max_price) {
    const range = {};
    if (min_price) range.gte = min_price;
    if (max_price) range.lte = max_price;
    filter.push({ range: { price: range } });
  }

  const sortOptions = [];
  switch (sort) {
    case 'price_asc': sortOptions.push({ price: 'asc' }); break;
    case 'price_desc': sortOptions.push({ price: 'desc' }); break;
    case 'sales': sortOptions.push({ sales_count: 'desc' }); break;
    case 'rating': sortOptions.push({ rating: 'desc' }); break;
    default: sortOptions.push({ _score: 'desc' });
  }

  try {
    const result = await client.search({
      index: INDICES.PRODUCTS,
      from: (page - 1) * size,
      size,
      query: {
        bool: {
          must: must.length > 0 ? must : [{ match_all: {} }],
          filter
        }
      },
      sort: sortOptions
    });

    return {
      total: result.hits.total.value,
      page,
      size,
      items: result.hits.hits.map(hit => ({ id: hit._id, score: hit._score, ...hit._source }))
    };
  } catch (error) {
    logger.error('Failed to search products:', error);
    return { total: 0, page, size, items: [] };
  }
}

async function searchMerchants(query, options = {}) {
  const { category, location, radius, page = 1, size = 20 } = options;
  
  const must = [];
  const filter = [];

  if (query) {
    must.push({
      multi_match: {
        query,
        fields: ['name^3', 'description^2', 'address'],
        type: 'best_fields',
        fuzziness: 'AUTO'
      }
    });
  }

  if (category) {
    filter.push({ term: { category } });
  }

  if (location && radius) {
    filter.push({
      geo_distance: {
        distance: `${radius}km`,
        location
      }
    });
  }

  try {
    const result = await client.search({
      index: INDICES.MERCHANTS,
      from: (page - 1) * size,
      size,
      query: {
        bool: {
          must: must.length > 0 ? must : [{ match_all: {} }],
          filter
        }
      },
      sort: [{ _score: 'desc' }, { rating: 'desc' }]
    });

    return {
      total: result.hits.total.value,
      page,
      size,
      items: result.hits.hits.map(hit => ({ id: hit._id, score: hit._score, ...hit._source }))
    };
  } catch (error) {
    logger.error('Failed to search merchants:', error);
    return { total: 0, page, size, items: [] };
  }
}

async function searchArticles(query, options = {}) {
  const { category, tags, author, page = 1, size = 20 } = options;
  
  const must = [];
  const filter = [];

  if (query) {
    must.push({
      multi_match: {
        query,
        fields: ['title^3', 'content^2', 'tags'],
        type: 'best_fields',
        fuzziness: 'AUTO'
      }
    });
  }

  if (category) {
    filter.push({ term: { category } });
  }

  if (author) {
    filter.push({ term: { author } });
  }

  try {
    const result = await client.search({
      index: INDICES.ARTICLES,
      from: (page - 1) * size,
      size,
      query: {
        bool: {
          must: must.length > 0 ? must : [{ match_all: {} }],
          filter
        }
      },
      sort: [{ _score: 'desc' }, { view_count: 'desc' }]
    });

    return {
      total: result.hits.total.value,
      page,
      size,
      items: result.hits.hits.map(hit => ({ id: hit._id, score: hit._score, ...hit._source }))
    };
  } catch (error) {
    logger.error('Failed to search articles:', error);
    return { total: 0, page, size, items: [] };
  }
}

async function getRecommendations(userId, size = 10) {
  try {
    const result = await client.search({
      index: INDICES.PRODUCTS,
      size,
      query: {
        function_score: {
          query: { match_all: {} },
          functions: [
            {
              random_score: {
                seed: userId,
                field: 'product_id'
              }
            }
          ]
        }
      }
    });

    return result.hits.hits.map(hit => hit._source);
  } catch (error) {
    logger.error('Failed to get recommendations:', error);
    return [];
  }
}

app.post('/api/products', async (req, res) => {
  const success = await indexProduct(req.body);
  res.json({ success });
});

app.get('/api/search/products', async (req, res) => {
  const { q, category, merchant_id, min_price, max_price, page, size, sort } = req.query;
  const results = await searchProducts(q, { category, merchant_id, min_price, max_price, page, size, sort });
  res.json(results);
});

app.get('/api/search/merchants', async (req, res) => {
  const { q, category, lat, lng, radius, page, size } = req.query;
  const location = lat && lng ? { lat: parseFloat(lat), lon: parseFloat(lng) } : null;
  const results = await searchMerchants(q, { category, location, radius, page, size });
  res.json(results);
});

app.get('/api/search/articles', async (req, res) => {
  const { q, category, tags, author, page, size } = req.query;
  const results = await searchArticles(q, { category, tags, author, page, size });
  res.json(results);
});

app.get('/api/recommendations/:userId', async (req, res) => {
  const { userId } = req.params;
  const { size = 10 } = req.query;
  const results = await getRecommendations(userId, parseInt(size));
  res.json({ items: results });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'search-service' });
});

const PORT = process.env.PORT || 3005;

async function start() {
  await initIndices();
  app.listen(PORT, () => {
    logger.info(`Search service running on port ${PORT}`);
  });
}

start().catch(error => {
  logger.error('Failed to start search service:', error);
  process.exit(1);
});

module.exports = app;