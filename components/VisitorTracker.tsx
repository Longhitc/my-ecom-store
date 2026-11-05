"use client";

import { useEffect } from 'react';

export default function VisitorTracker() {
  useEffect(() => {
    async function trackVisit() {
      try {
        // 1. Lấy hoặc sinh client_uuid cố định trên localStorage của máy khách
        let uuid = localStorage.getItem('shop_client_uuid');
        if (!uuid) {
          uuid = 'client_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
          localStorage.setItem('shop_client_uuid', uuid);
        }

        // 2. Đồng thời gán vào Cookie để phía server/auth dễ dàng đọc được qua cookies()
        document.cookie = `shop_client_uuid=${uuid}; path=/; max-age=31536000`;

        // 3. Gửi request ngầm lên API để ghi nhận lượt truy cập mới (INSERT log mới mỗi khi F5/vào web)
        await fetch('/api/admin/track-visit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ clientUuid: uuid })
        });
      } catch (err) {
        console.error("Lỗi ghi nhận lượt truy cập:", err);
      }
    }

    trackVisit();
  }, []);

  return null;
}