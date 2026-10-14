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
    vibrate: [300, 100, 300, 100, 300], // Rung mạnh để đánh thức thiết bị
    tag: 'admin-chat-notification', // Gộp nhóm thông báo tránh tràn màn hình
    renotify: true,
    requireInteraction: true, // Giữ thông báo trên màn hình khóa cho đến khi bấm vào
    data: { url: data.url }
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Xử lý khi bấm vào thông báo
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