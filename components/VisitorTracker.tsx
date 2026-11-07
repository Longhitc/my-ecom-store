"use client";

import { useEffect, useRef } from 'react';

export default function VisitorTracker() {
  const hasTracked = useRef(false);

  useEffect(() => {
    if (hasTracked.current) return;
    hasTracked.current = true;

    async function trackVisit() {
      try {
        // 1. Lấy hoặc sinh client_uuid cố định trên localStorage
        let uuid = localStorage.getItem('shop_client_uuid');
        if (!uuid) {
          uuid = 'client_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
          localStorage.setItem('shop_client_uuid', uuid);
        }

        // 2. Đồng thời gán vào Cookie
        document.cookie = `shop_client_uuid=${uuid}; path=/; max-age=31536000`;

        // 3. Tận dụng triệt để cache localStorage của trình duyệt (nếu khách đã từng đăng nhập và còn lưu cache)
        let customerId = null;
        try {
          // Anh quét qua các key hay lưu user trong localStorage (ví dụ: user, customer_info, account, v.v.)
          // Thay tên key 'customer_info' bằng key thực tế mà hệ thống login của anh đang dùng nhé
          const cachedUser = localStorage.getItem('customer_info') || localStorage.getItem('user'); 
          if (cachedUser) {
            const parsed = JSON.parse(cachedUser);
            customerId = parsed?.id || parsed?.customerId || parsed?.user_id || null;
          }
        } catch (e) {
          // Bỏ qua nếu parse JSON lỗi
        }

        // 4. Gửi request track visit với đầy đủ UUID và Customer ID (nếu có cache)
        await fetch('/api/admin/track-visit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            clientUuid: uuid,
            customerId: customerId 
          })
        });
      } catch (err) {
        console.error("Lỗi ghi nhận lượt truy cập:", err);
      }
    }

    trackVisit();
  }, []);

  return null;
}