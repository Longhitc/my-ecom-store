'use client';

import { useEffect } from 'react';

// Mở rộng kiểu dữ liệu window để TypeScript không báo lỗi
declare global {
  interface Window {
    deferredPrompt: any;
  }
}

export default function AutoPwaPopup() {
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      // Ngăn không cho trình duyệt tự động ẩn sự kiện
      e.preventDefault();
      
      // Lưu lại sự kiện để kích hoạt popup tự động bất cứ lúc nào
      window.deferredPrompt = e;
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  return null;
}