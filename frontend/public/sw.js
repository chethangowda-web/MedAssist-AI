// Self-destruct when running against Vite dev server
if (self.location && self.location.hostname === 'localhost') {
  self.registration.unregister();
  self.addEventListener('install', function(e) { self.skipWaiting(); });
  self.addEventListener('activate', function(e) { self.clients.claim(); });
} else {
  const CACHE_NAME = 'medassist-v2';
  const API_CACHE_NAME = 'medassist-api-v2';
  const API_CACHE_DURATION = 5 * 60 * 1000;

  self.addEventListener('install', (event) => {
    self.skipWaiting();
    event.waitUntil(
      caches.open(CACHE_NAME).then((cache) =>
        cache.addAll(['/', '/index.html', '/manifest.json', '/favicon.svg', '/offline.html']).catch(() => {})
      )
    );
  });

  self.addEventListener('activate', (event) => {
    event.waitUntil(
      caches.keys().then((names) =>
        Promise.all(names.filter((n) => n.startsWith('medassist-') && n !== CACHE_NAME).map((n) => caches.delete(n)))
      ).then(() => self.clients.claim())
    );
  });

  self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);
    const isNavigate = request.mode === 'navigate';

    if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/auth/')) {
      event.respondWith(networkFirstWithCache(request));
      return;
    }
    if (request.url.includes('firestore') || request.url.includes('firebase') || request.url.includes('googleapis')) {
      event.respondWith(networkFirstWithCache(request));
      return;
    }
    if (request.destination === 'style' || request.destination === 'script' || request.destination === 'font' || request.destination === 'image') {
      event.respondWith(cacheFirstWithUpdate(request));
      return;
    }
    event.respondWith(isNavigate ? networkFirstWithFallback(request) : networkFirstWithFallback(request));
  });

  async function networkFirstWithCache(request) {
    const cache = await caches.open(API_CACHE_NAME);
    try {
      const response = await fetch(request);
      if (response.ok) {
        const entry = { response: response.clone(), timestamp: Date.now() };
        await cache.put(request.url, new Response(JSON.stringify(entry), { headers: { 'Content-Type': 'application/json' } }));
      }
      return response;
    } catch {
      const cached = await cache.match(request.url);
      if (cached) {
        try {
          const entry = await cached.json();
          if (entry.timestamp && Date.now() - entry.timestamp < API_CACHE_DURATION) {
            return new Response(JSON.stringify(entry.response), { headers: { 'Content-Type': 'application/json' } });
          }
        } catch {}
      }
      return new Response(JSON.stringify({ status: 'offline' }), { status: 503, headers: { 'Content-Type': 'application/json' } });
    }
  }

  async function cacheFirstWithUpdate(request) {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(request);
    if (cached) {
      fetch(request).then((r) => { if (r.ok) cache.put(request, r); }).catch(() => {});
      return cached;
    }
    try {
      const response = await fetch(request);
      if (response.ok) cache.put(request, response.clone());
      return response;
    } catch {
      return caches.match('/offline.html');
    }
  }

  async function networkFirstWithFallback(request) {
    try {
      const response = await fetch(request);
      if (response.ok) {
        const cache = await caches.open(CACHE_NAME);
        cache.put(request, response.clone());
      }
      return response;
    } catch {
      const cached = await caches.match(request);
      return cached || caches.match('/offline.html');
    }
  }
}

// Push notification handlers (work in both dev and production)
self.addEventListener('push', (event) => {
  if (!event.data) return;
  try {
    const data = event.data.json();
    const options = {
      body: data.body || 'MedAssist AI Notification',
      icon: '/favicon.svg',
      badge: '/favicon.svg',
      vibrate: [200, 100, 200],
      data: { url: data.url || '/' },
      actions: [
        { action: 'view', title: 'View' },
        { action: 'dismiss', title: 'Dismiss' },
      ],
    };
    event.waitUntil(self.registration.showNotification(data.title || 'MedAssist AI', options));
  } catch (e) {
    console.error('Push notification error:', e);
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.action === 'dismiss') return;
  const url = event.notification.data?.url || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      const client = list.find((c) => c.url === url);
      if (client && 'focus' in client) return client.focus();
      return clients.openWindow(url);
    })
  );
});