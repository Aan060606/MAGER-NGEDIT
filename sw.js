const CACHE_NAME = 'pod-express-v2';
const OFFLINE_URL = '/MAGER-NGEDIT/offline.html';

// SEMUA file yang di-cache untuk offline support
const urlsToCache = [
  '/MAGER-NGEDIT/',
  '/MAGER-NGEDIT/index.html',
  '/MAGER-NGEDIT/styles.css',
  '/MAGER-NGEDIT/script.js',
  '/MAGER-NGEDIT/manifest.json',
  '/MAGER-NGEDIT/icon-192x192.png',
  '/MAGER-NGEDIT/icon-512x512.png',
  '/MAGER-NGEDIT/offline.html', // Halaman offline
  'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200',
  'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js'
];

// ========== INSTALL: Cache semua resources ==========
self.addEventListener('install', event => {
  console.log('[SW] Installing Service Worker...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[SW] Cache opened');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('[SW] All resources cached');
        return self.skipWaiting(); // Aktifkan SW langsung
      })
      .catch(error => {
        console.error('[SW] Cache failed:', error);
      })
  );
});

// ========== ACTIVATE: Hapus cache lama ==========
self.addEventListener('activate', event => {
  console.log('[SW] Activating Service Worker...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('[SW] Service Worker activated');
      return self.clients.claim(); // Ambil kontrol semua tab
    })
  );
});

// ========== FETCH: Network First, lalu Cache (untuk file dinamis) ==========
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Strategy 1: Network First (untuk HTML & API)
  if (request.method === 'GET' && (
    request.headers.get('accept').includes('text/html') ||
    url.pathname.endsWith('.html')
  )) {
    event.respondWith(
      fetch(request)
        .then(response => {
          // Simpan ke cache jika sukses
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(request, responseClone);
          });
          return response;
        })
        .catch(() => {
          // Kalau offline, ambil dari cache atau tampilkan offline page
          return caches.match(request).then(cached => {
            return cached || caches.match(OFFLINE_URL);
          });
        })
    );
    return;
  }

  // Strategy 2: Cache First (untuk assets statis: CSS, JS, images)
  if (request.method === 'GET') {
    event.respondWith(
      caches.match(request)
        .then(cached => {
          if (cached) {
            console.log('[SW] Serving from cache:', request.url);
            return cached;
          }
          
          // Kalau tidak ada di cache, fetch dari network
          return fetch(request)
            .then(response => {
              // Simpan response ke cache untuk next time
              if (response && response.status === 200) {
                const responseClone = response.clone();
                caches.open(CACHE_NAME).then(cache => {
                  cache.put(request, responseClone);
                });
              }
              return response;
            })
            .catch(error => {
              console.error('[SW] Fetch failed:', error);
              // Fallback untuk gambar
              if (request.destination === 'image') {
                return caches.match('/MAGER-NGEDIT/icon-192x192.png');
              }
            });
        })
    );
  }
});

// ========== PUSH NOTIFICATIONS ==========
self.addEventListener('push', event => {
  console.log('[SW] Push received:', event);
  
  let notificationData = {
    title: 'Pod Express',
    body: 'Ada notifikasi baru dari Pod Express!',
    icon: '/MAGER-NGEDIT/icon-192x192.png',
    badge: '/MAGER-NGEDIT/icon-192x192.png',
    vibrate: [200, 100, 200],
    tag: 'pod-express-notification',
    requireInteraction: false,
    actions: [
      { action: 'open', title: 'Buka App', icon: '/MAGER-NGEDIT/icon-192x192.png' },
      { action: 'close', title: 'Tutup', icon: '/MAGER-NGEDIT/icon-192x192.png' }
    ]
  };

  // Jika ada data dari server
  if (event.data) {
    try {
      const data = event.data.json();
      notificationData = { ...notificationData, ...data };
    } catch (e) {
      notificationData.body = event.data.text();
    }
  }

  event.waitUntil(
    self.registration.showNotification(notificationData.title, notificationData)
  );
});

// ========== NOTIFICATION CLICK ==========
self.addEventListener('notificationclick', event => {
  console.log('[SW] Notification clicked:', event);
  
  event.notification.close();

  if (event.action === 'open') {
    event.waitUntil(
      clients.openWindow('/MAGER-NGEDIT/')
    );
  } else if (event.action === 'close') {
    // Do nothing
  } else {
    // Default: buka app
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true })
        .then(clientList => {
          // Jika ada tab yang sudah buka, focus ke sana
          for (let client of clientList) {
            if (client.url.includes('/MAGER-NGEDIT/') && 'focus' in client) {
              return client.focus();
            }
          }
          // Kalau tidak ada, buka window baru
          if (clients.openWindow) {
            return clients.openWindow('/MAGER-NGEDIT/');
          }
        })
    );
  }
});

// ========== BACKGROUND SYNC (Optional) ==========
self.addEventListener('sync', event => {
  console.log('[SW] Background sync:', event.tag);
  
  if (event.tag === 'sync-data') {
    event.waitUntil(
      // Sync data ke server saat online
      fetch('/MAGER-NGEDIT/api/sync', { method: 'POST' })
        .then(response => {
          console.log('[SW] Sync successful');
        })
        .catch(error => {
          console.error('[SW] Sync failed:', error);
        })
    );
  }
});

// ========== MESSAGE FROM CLIENT ==========
self.addEventListener('message', event => {
  console.log('[SW] Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CACHE_URLS') {
    event.waitUntil(
      caches.open(CACHE_NAME).then(cache => {
        return cache.addAll(event.data.urls);
      })
    );
  }
});
