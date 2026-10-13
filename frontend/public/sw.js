const CACHE_NAME = 'devagiri-parish-pwa-v1';
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/favicon.png',
  '/icon-192.png',
  '/icon-512.png',
  '/apple-touch-icon.png'
];

// Install event - precache core shell assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Precaching app shell assets');
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[Service Worker] Pre-cache warning:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - network first with cache fallback strategy
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);

  // Skip cross-origin requests to external APIs or dev hot-reloading websockets
  if (url.origin !== self.origin || url.pathname.includes('hot-update') || url.pathname.includes('symbolicate')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // If response is valid, clone and save to cache
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(async () => {
        console.log('[Service Worker] Fetch failed; serving from cache:', event.request.url);
        const cachedResponse = await caches.match(event.request);
        if (cachedResponse) {
          return cachedResponse;
        }
        // If navigating to a page offline, fallback to root index '/'
        if (event.request.mode === 'navigate') {
          return caches.match('/');
        }
      })
  );
});

// Push notification event listener
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : { title: 'Devagiri Parish', body: 'New update available' };
  const options = {
    body: data.body,
    icon: '/favicon.png',
    badge: '/favicon.png',
    vibrate: [100, 50, 100],
    data: { url: data.url || '/' },
    tag: data.tag || 'parish-alert'
  };
  event.waitUntil(self.registration.showNotification(data.title, options));
});

// Notification click event listener
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data.url || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === targetUrl && 'focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow(targetUrl);
    })
  );
});

// Listen for skip waiting command
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
