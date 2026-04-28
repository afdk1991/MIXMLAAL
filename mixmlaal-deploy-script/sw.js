/**
 * Service Worker
 * 版本: v1.0.0.0
 * 说明: PWA离线缓存、后台同步、推送通知
 */

const CACHE_NAME = 'mixmlaal-cache-v1';
const STATIC_CACHE = 'mixmlaal-static-v1';
const DYNAMIC_CACHE = 'mixmlaal-dynamic-v1';

// 预缓存资源
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/offline.html',
  '/favicon.ico',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
];

// 安装事件 - 预缓存静态资源
self.addEventListener('install', event => {
  console.log('[Service Worker] 安装中...');

  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('[Service Worker] 预缓存静态资源');
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => {
        console.log('[Service Worker] 安装完成');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('[Service Worker] 预缓存失败:', error);
      }),
  );
});

// 激活事件 - 清理旧缓存
self.addEventListener('activate', event => {
  console.log('[Service Worker] 激活中...');

  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('[Service Worker] 删除旧缓存:', cacheName);
              return caches.delete(cacheName);
            }
          }),
        );
      })
      .then(() => {
        console.log('[Service Worker] 激活完成');
        return self.clients.claim();
      }),
  );
});

// 获取请求策略
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // 跳过非GET请求
  if (request.method !== 'GET') {
    return;
  }

  // API请求 - 网络优先策略
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirst(request));
    return;
  }

  // 静态资源 - 缓存优先策略
  if (isStaticResource(request)) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // 页面请求 - 网络优先，失败返回离线页面
  if (request.mode === 'navigate') {
    event.respondWith(networkFirstWithOffline(request));
    return;
  }

  // 其他请求 - 缓存优先
  event.respondWith(cacheFirst(request));
});

/**
 * 缓存优先策略
 */
async function cacheFirst(request) {
  const cache = await caches.open(STATIC_CACHE);
  const cached = await cache.match(request);

  if (cached) {
    return cached;
  }

  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.error('[Service Worker] 缓存优先策略失败:', error);
    throw error;
  }
}

/**
 * 网络优先策略
 */
async function networkFirst(request) {
  const cache = await caches.open(DYNAMIC_CACHE);

  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log('[Service Worker] 网络请求失败，尝试缓存:', request.url);
    const cached = await cache.match(request);
    if (cached) {
      return cached;
    }
    throw error;
  }
}

/**
 * 网络优先策略（带离线页面回退）
 */
async function networkFirstWithOffline(request) {
  try {
    const networkResponse = await fetch(request);
    return networkResponse;
  } catch (error) {
    console.log('[Service Worker] 页面加载失败，返回离线页面');
    const cache = await caches.open(STATIC_CACHE);
    const offlinePage = await cache.match('/offline.html');
    if (offlinePage) {
      return offlinePage;
    }
    throw error;
  }
}

/**
 * 判断是否为静态资源
 */
function isStaticResource(request) {
  const staticExtensions = [
    '.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico',
    '.woff', '.woff2', '.ttf', '.eot', '.otf', '.json', '.xml',
  ];
  const url = new URL(request.url);
  return staticExtensions.some(ext => url.pathname.endsWith(ext));
}

// 后台同步事件
self.addEventListener('sync', event => {
  console.log('[Service Worker] 后台同步:', event.tag);

  if (event.tag === 'sync-orders') {
    event.waitUntil(syncOrders());
  } else if (event.tag === 'sync-payments') {
    event.waitUntil(syncPayments());
  }
});

/**
 * 同步订单数据
 */
async function syncOrders() {
  try {
    const db = await openDB('mixmlaal-db', 1);
    const orders = await db.getAll('pending-orders');

    for (const order of orders) {
      try {
        const response = await fetch('/api/v1/order/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(order),
        });

        if (response.ok) {
          await db.delete('pending-orders', order.id);
          console.log('[Service Worker] 订单同步成功:', order.id);
        }
      } catch (error) {
        console.error('[Service Worker] 订单同步失败:', order.id, error);
      }
    }
  } catch (error) {
    console.error('[Service Worker] 同步订单失败:', error);
  }
}

/**
 * 同步支付数据
 */
async function syncPayments() {
  console.log('[Service Worker] 同步支付数据...');
  // 实现支付数据同步逻辑
}

// 推送通知事件
self.addEventListener('push', event => {
  console.log('[Service Worker] 收到推送:', event);

  let data = {};
  try {
    data = event.data.json();
  } catch (e) {
    data = {
      title: 'MIXMLAAL',
      body: event.data.text(),
    };
  }

  const options = {
    body: data.body || '您有一条新消息',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    image: data.image,
    tag: data.tag || 'default',
    requireInteraction: data.requireInteraction || false,
    actions: data.actions || [],
    data: data.data || {},
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'MIXMLAAL', options),
  );
});

// 通知点击事件
self.addEventListener('notificationclick', event => {
  console.log('[Service Worker] 通知点击:', event);

  event.notification.close();

  const notificationData = event.notification.data;
  let url = '/';

  if (notificationData && notificationData.url) {
    url = notificationData.url;
  }

  event.waitUntil(
    clients.matchAll({ type: 'window' })
      .then(clientList => {
        // 查找已打开的窗口
        for (const client of clientList) {
          if (client.url === url && 'focus' in client) {
            return client.focus();
          }
        }
        // 打开新窗口
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      }),
  );
});

// 消息事件（与页面通信）
self.addEventListener('message', event => {
  console.log('[Service Worker] 收到消息:', event.data);

  if (event.data === 'skipWaiting') {
    self.skipWaiting();
  }
});

/**
 * 简单的IndexedDB封装
 */
function openDB(name, version) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(name, version);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(new IDBWrapper(request.result));

    request.onupgradeneeded = event => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('pending-orders')) {
        db.createObjectStore('pending-orders', { keyPath: 'id' });
      }
    };
  });
}

class IDBWrapper {
  constructor(db) {
    this.db = db;
  }

  getAll(storeName) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  delete(storeName, key) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(key);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}
