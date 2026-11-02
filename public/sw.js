const CACHE_NAME = 'depvaxinh-v1.1.1'; // Mỗi lần update code lớn, anh chỉ cần tăng version này lên (v1.2, v2.0...)
const urlsToCache = ['/', '/manifest.json'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
  self.skipWaiting(); // Ép bỏ qua trạng thái chờ để nhận bản mới ngay
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Tự động quét và xóa sạch các cache cũ rác
          if (cacheName !== CACHE_NAME) {
            console.log('[ServiceWorker] Xóa cache cũ:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => clients.claim()) // Chiếm quyền điều khiển ngay lập tức
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).catch(() => {
        return new Response('Network error happened', {
          status: 408,
          headers: { 'Content-Type': 'text/plain' },
        });
      });
    })
  );
});

// === XỬ LÝ WEB PUSH NOTIFICATION NỀN (BACKGROUND) ===
self.addEventListener('push', (event) => {
  let data = { 
    title: '💬 Có tin nhắn mới từ khách hàng', 
    body: 'Bạn có một tin nhắn mới cần phản hồi.', 
    url: '/admin/chats' 
  };
  
  if (event.data) {
    try {
      const jsonDat = event.data.json();
      data.title = jsonDat.title || data.title;
      data.body = jsonDat.body || data.body;
      data.url = jsonDat.url || data.url;
    } catch (e) {
      const textDat = event.data.text();
      if (textDat) {
        data.body = textDat;
      }
    }
  }

  const options = {
    body: data.body,
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    vibrate: [300, 100, 300, 100, 300],
    tag: 'admin-chat-notification',
    renotify: true,
    requireInteraction: true,
    data: { url: data.url }
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/admin/chats';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (let client of windowClients) {
        if (client.url.includes('/admin/chats') && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});