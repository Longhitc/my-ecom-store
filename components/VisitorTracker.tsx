"use client";

import { useEffect } from 'react';

export default function VisitorTracker() {
  useEffect(() => {
    async function trackVisit() {
      // 1. Lấy hoặc sinh client_uuid
      let uuid = localStorage.getItem('shop_client_uuid');
      if (!uuid) {
        uuid = 'client_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
        localStorage.setItem('shop_client_uuid', uuid);
      }

      // 2. Gửi request ngầm lên API ghi nhận log visit
      try {
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

  return null; // Component này chạy ngầm không hiển thị gì trên giao diện
}