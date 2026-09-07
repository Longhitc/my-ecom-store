'use client';

import { clearCartAction } from 'components/cart/actions';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function CheckoutPage() {
  const [shippingAddress, setShippingAddress] = useState({
    fullName: 'Nguyễn Văn A',
    phone: '0912345678',
    address: '123 Đường ABC, Phường 1',
    city: 'TP. Hồ Chí Minh',
  });

  const router = useRouter();

  // Hàm xử lý đặt hàng: Xóa cookie trực tiếp & chuyển trang
  const handleCheckout = async () => {
    await clearCartAction();

    // 2. Chuyển hướng sang trang thành công
    window.location.href = '/checkout/success';

    // 3. Làm mới toàn bộ trang để Navbar/Header xóa Icon giỏ hàng ngay lập tức
    router.refresh();
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-white">Thanh toán đơn hàng</h1>

      <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">📍 Địa chỉ nhận hàng</h2>
          <button className="text-sm text-blue-500 hover:underline">
            Thay đổi
          </button>
        </div>

        {shippingAddress.address ? (
          <div className="rounded-lg bg-black p-4 text-sm text-neutral-300">
            <p className="font-bold text-white">
              {shippingAddress.fullName} - {shippingAddress.phone}
            </p>
            <p className="mt-1">
              {shippingAddress.address}, {shippingAddress.city}
            </p>
          </div>
        ) : (
          <form className="space-y-3">
            <input
              type="text"
              placeholder="Địa chỉ giao hàng (Số nhà, đường, phường/tỉnh...)"
              className="w-full rounded-lg border border-neutral-700 bg-black p-3 text-sm text-white"
            />
          </form>
        )}
      </div>

      <button
        type="button"
        onClick={handleCheckout}
        className="w-full rounded-lg bg-blue-600 py-3.5 text-center font-bold text-white transition-colors hover:bg-blue-500"
      >
        Xác nhận đặt hàng
      </button>
    </div>
  );
}