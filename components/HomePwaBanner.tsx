'use client';

import { useEffect, useState } from 'react';

export default function HomePwaBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    // 1. Tự động đăng ký Service Worker nếu trình duyệt hỗ trợ để kích hoạt PWA
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch((err) => {
        console.error('Service Worker registration failed:', err);
      });
    }

    // 2. Lắng nghe sự kiện bật popup cài đặt từ trình duyệt
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      // Kích hoạt popup cài đặt gốc của trình duyệt
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } else {
      alert('Đang tải cấu hình PWA, bạn hãy F5 lại trang hoặc chờ 2 giây rồi bấm lại nhé!');
    }
  };

  return (
    <section className="mb-6">
      <div className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 p-4 sm:p-5 text-white shadow-md">
        <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
          <div className="text-center sm:text-left">
            <h3 className="text-base sm:text-lg font-bold">📲 Cài đặt App Đẹp & Xinh</h3>
            <p className="text-xs sm:text-sm text-blue-100 mt-0.5">
              Cài ứng dụng về màn hình chính để truy cập nhanh chóng hơn!
            </p>
          </div>
          <button
            onClick={handleInstallClick}
            className="w-full sm:w-auto whitespace-nowrap rounded-lg bg-white px-5 py-2.5 text-xs sm:text-sm font-semibold text-blue-600 shadow transition-transform hover:scale-105 active:scale-95 cursor-pointer"
          >
            Cài đặt ngay
          </button>
        </div>
      </div>
    </section>
  );
}