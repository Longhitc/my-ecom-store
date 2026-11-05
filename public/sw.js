const CACHE_NAME = 'depvaxinh-v1.1.3'; // Tăng version lên khi có update lớn (v1.1.4, v1.2.0...)
const urlsToCache = ['/', '/manifest.json'];

// 1. Kích hoạt và ép Service Worker mới áp dụng ngay lập tức
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
  self.skipWaiting(); // Bỏ qua hàng chờ, kích hoạt ngay phiên bản mới
});

// 2. Tự động dọn dẹp toàn bộ cache cũ rác khi có version mới
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[ServiceWorker] Đã tự động xóa cache phiên bản cũ:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => clients.claim()) // Chiếm quyền điều khiển toàn bộ tab ngay lập tức
  );
});

// 3. Chiến lược Fetch tự động: Ưu tiên lấy trực tiếp từ Server (Network-First)
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Bỏ qua tuyệt đối các request API để luôn đảm bảo dữ liệu Turso mới nhất
  if (url.pathname.startsWith('/api/')) {
    return;
  }

  // Luôn thử tải giao diện/code mới từ mạng trước
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        return networkResponse;
      })
      .catch(() => {
        // Chỉ khi nào đứt mạng (Offline) thì mới dùng đến bản cache lưu lại
        return caches.match(event.request).then((cachedResponse) => {
          return cachedResponse || new Response('Lỗi kết nối mạng', {
            status: 408,
            headers: { 'Content-Type': 'text/plain; charset=utf-8' },
          });
        });
      })
  );
});

// === XỬ LÝ THÔNG BÁO PUSH NỀN (BACKGROUND NOTIFICATION) ===
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