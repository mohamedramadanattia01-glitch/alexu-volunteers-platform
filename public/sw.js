const CACHE_NAME = 'alexu-volunteers-v2';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/favicon.png',
  '/favicon.ico',
  '/logo.png',
  '/icon-maskable.svg',
  '/stamp.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Network First with Cache Fallback for dynamic app
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          if (event.request.headers.get('accept')?.includes('text/html')) {
            return caches.match('/index.html');
          }
        });
      })
  );
});

// Message listener from foreground/background app scripts
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
    const { title, options } = event.data;
    const notifOptions = {
      body: options?.body || 'إشعار جديد من فريق متطوعين جامعة الإسكندرية',
      icon: options?.icon || '/logo.png',
      badge: options?.badge || '/logo.png',
      vibrate: options?.vibrate || [200, 100, 200, 100, 400],
      tag: options?.tag || `notif-${Date.now()}`,
      requireInteraction: options?.requireInteraction ?? true,
      renotify: options?.renotify ?? true,
      silent: false,
      data: options?.data || { url: '/' },
      dir: 'rtl',
      lang: 'ar',
      actions: options?.actions || [
        { action: 'open', title: '📱 فتح المنظومة' }
      ]
    };

    event.waitUntil(
      self.registration.showNotification(title || '👑 فريق متطوعين جامعة الإسكندرية', notifOptions)
    );
  }
});

// Push Notifications handler (Web Push from Server / Cloud)
self.addEventListener('push', (event) => {
  let data = { 
    title: '👑 إشعار من منظومة متطوعين جامعة الإسكندرية', 
    body: 'تحديث جديد في منظومة متطوعين اتحاد طلاب جامعة الإسكندرية', 
    icon: '/logo.png',
    type: 'announcement'
  };

  try {
    if (event.data) {
      data = event.data.json();
    }
  } catch (e) {
    if (event.data) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || '/logo.png',
    badge: '/logo.png',
    vibrate: [250, 100, 250, 100, 450],
    data: data.url || '/',
    dir: 'rtl',
    lang: 'ar',
    requireInteraction: true,
    renotify: true,
    tag: data.tag || `push-${Date.now()}`,
    actions: [
      { action: 'open', title: '📱 فتح المنظومة' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'فريق متطوعين AU', options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const notifData = event.notification.data;
  const urlToOpen = (typeof notifData === 'object' && notifData?.url) ? notifData.url : (typeof notifData === 'string' ? notifData : '/');

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (let client of windowClients) {
        if (client.url.includes(self.registration.scope) && 'focus' in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(urlToOpen);
      }
    })
  );
});
