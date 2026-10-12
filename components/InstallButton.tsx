'use client';

import { useEffect, useState } from 'react';

export default function InstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      // Ngăn trình duyệt tự hiện popup mặc định
      e.preventDefault();
      // Lưu sự kiện lại để dùng sau
      setDeferredPrompt(e);
      // Hiển thị nút cài đặt của bạn lên
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Hiện bảng cài đặt của trình duyệt
    deferredPrompt.prompt();

    // Chờ người dùng phản hồi (Đồng ý hoặc Hủy)
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      console.log('Người dùng đã đồng ý cài đặt PWA');
    }

    // Reset lại vì prompt chỉ dùng được 1 lần
    setDeferredPrompt(null);
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <button
      onClick={handleInstallClick}
      className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-full bg-black px-5 py-3 text-white shadow-lg transition-transform hover:scale-105 dark:bg-white dark:text-black"
    >
      <span>📱 Cài đặt ứng dụng</span>
    </button>
  );
}