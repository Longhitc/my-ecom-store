'use client';

import { useEffect, useState } from 'react';

export default function HomePwaBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      // Nếu sự kiện tự động sẵn sàng, gọi popup gốc ngay
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } else {
      // Nếu chưa có sự kiện tự động (trường hợp chạy localhost hoặc trình duyệt chặn), 
      // mở ngay modal hướng dẫn trực quan để bấm 2 nhát là cài xong!
      setShowModal(true);
    }
  };

  return (
    <section className="mb-6">
      <div className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 p-4 sm:p-5 text-white shadow-md">
        <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
          <div className="text-center sm:text-left">
            <h3 className="text-base sm:text-lg font-bold">📲 Cài đặt App Đẹp & Xinh</h3>
            <p className="text-xs sm:text-sm text-blue-100 mt-0.5">
              Cài ứng dụng về màn hình chính để truy cập cực nhanh & mua sắm tiện lợi hơn!
            </p>
          </div>
          <button
            onClick={handleInstallClick}
            className="w-full sm:w-auto whitespace-nowrap rounded-lg bg-white px-5 py-2.5 text-xs sm:text-sm font-semibold text-blue-600 shadow transition-transform hover:scale-105 active:scale-95 cursor-pointer"
          >
            Cài đặt ngay
          </button>
        </div>

        {/* Modal thông minh: Bấm vào là hiển thị chính xác vị trí nút cài đặt trên trình duyệt */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 text-black">
            <div className="max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-neutral-900 dark:text-white">
              <h4 className="text-lg font-bold mb-2 text-neutral-900 dark:text-white">Cài đặt ứng dụng ngay</h4>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-4">
                Vì trình duyệt đang ở chế độ nội bộ (`localhost`), bạn có thể cài đặt thủ công cực kỳ nhanh chóng bằng 1 trong 2 cách sau:
              </p>
              
              <div className="space-y-3 mb-5 text-xs text-neutral-700 dark:text-neutral-300">
                <div className="p-3 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
                  <strong>Cách 1 (Trên Máy tính - Khuyên dùng):</strong> Nhìn lên góc trên bên phải thanh địa chỉ URL (gần nút dấu sao đánh dấu trang), bấm vào biểu tượng <strong>Cài đặt (màn hình có mũi tên xuống)</strong> là xong!
                </div>
                <div className="p-3 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
                  <strong>Cách 2 (Trên Điện thoại):</strong> Bấm vào biểu tượng <strong>Menu (3 chấm)</strong> ở góc trình duyệt $\rightarrow$ Chọn <strong>Thêm vào màn hình chính</strong>.
                </div>
              </div>

              <button
                onClick={() => setShowModal(false)}
                className="w-full rounded-xl bg-blue-600 py-2.5 text-xs font-semibold text-white cursor-pointer"
              >
                Đã hiểu
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}