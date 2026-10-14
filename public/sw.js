const CACHE_NAME = 'depvaxinh-v1';
const urlsToCache = ['/', '/manifest.json'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

// === BỔ SUNG PHẦN XỬ LÝ WEB PUSH NOTIFICATION DƯỚI NÀY ===

// Lắng nghe sự kiện push gửi từ server xuống
self.addEventListener('push', (event) => {
  let data = { title: 'Thông báo mới', body: 'Bạn có tin nhắn mới từ shop' };
  
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    vibrate: [200, 100, 200],
    data: { url: data.url || '/' }
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Lắng nghe sự kiện người dùng bấm vào thông báo trên điện thoại/máy tính
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Nếu đã mở sẵn tab web thì focus lại tab đó
      for (let client of windowClients) {
        if (client.url === targetUrl && 'focus' in client) {
          return client.focus();
        }
      }
      // Nếu chưa mở thì mở tab mới dẫn tới trang chat/admin
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});