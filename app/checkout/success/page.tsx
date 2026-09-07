// app/checkout/success/page.tsx
import Link from 'next/link';

export default function CheckoutSuccessPage() {
  const orderId = "HD" + Math.floor(100000 + Math.random() * 900000);

  return (
    <div className="flex min-h-[calc(100vh-100px)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg rounded-xl border border-neutral-800 bg-neutral-900/50 p-8 text-center backdrop-blur-sm">
        
        {/* Biểu tượng Icon thành công */}
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10 text-green-500">
          <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-white">Đặt hàng thành công!</h1>
        <p className="mt-2 text-sm text-neutral-400">
          Cảm ơn bạn đã ủng hộ <span className="font-semibold text-white">ĐẸP VÀ XINH SHOP</span>.
        </p>

        {/* Mã đơn hàng */}
        <div className="my-6 rounded-lg border border-neutral-800 bg-black p-4 text-left">
          <div className="flex justify-between text-sm">
            <span className="text-neutral-400">Mã đơn hàng:</span>
            <span className="font-mono font-bold text-blue-400">#{orderId}</span>
          </div>
          <div className="flex justify-between text-sm mt-2">
            <span className="text-neutral-400">Phương thức:</span>
            <span className="text-white">Thanh toán khi nhận hàng (COD)</span>
          </div>
        </div>

        {/* Nút quay về mua sắm */}
        <div className="flex flex-col gap-3">
          <Link
            href="/"
            className="w-full rounded-lg bg-blue-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-500"
          >
            Tiếp tục mua sắm
          </Link>
        </div>

      </div>
    </div>
  );
}