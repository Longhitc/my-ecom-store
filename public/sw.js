self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Đảm bảo luôn trả về một Response hợp lệ, tránh bị lỗi undefined
  event.respondWith(
    fetch(event.request).catch(() => {
      return new Response('Network error / Offline fallback', {
        status: 408,
        headers: { 'Content-Type': 'text/plain' },
      });
    })
  );
});