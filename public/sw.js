const CACHE_NAME = 'ua-belgium-v1.0.4';
const STATIC_CACHE = [
  '/manifest.json',
  '/pwa-192.png',
  '/pwa-512.png'
];

// Install - cache static assets only
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_CACHE))
  );
  self.skipWaiting();
});

// Fetch - bypass cache for API calls, network-first for HTML/JS
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // NEVER cache Supabase API requests
  if (url.hostname.includes('supabase')) {
    event.respondWith(fetch(event.request));
    return;
  }

  // Network-first for HTML and JS files
  if (event.request.mode === 'navigate' ||
      url.pathname.endsWith('.html') ||
      url.pathname.includes('/assets/')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
          return response;
        })
        .catch(() => caches.match(event.request).then((cached) => cached || caches.match('/')))
    );
    return;
  }

  // Cache-first for static assets
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) return response;
        return fetch(event.request).then((networkResponse) => {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
          return networkResponse;
        });
      })
      .catch(() => new Response('', { status: 404 }))
  );
});

// Activate - clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Push notifications
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'Нове повідомлення',
    icon: '/pwa-192.png',
    badge: '/pwa-192.png'
  };
  event.waitUntil(
    self.registration.showNotification('UA Belgium', options)
  );
});
