'use client';

import Link from 'next/link';

export default function RegisterPage() {
  return (
    <div className="flex min-h-[calc(100vh-80px)] items-center justify-center px-4 py-8">
      <div className="w-full max-w-md rounded-xl border border-neutral-800 bg-neutral-900/50 p-8 shadow-2xl backdrop-blur-sm">
        
        {/* Tiêu đề */}
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-white">Tạo tài khoản mới</h1>
          <p className="mt-2 text-sm text-neutral-400">
            Đăng ký tài khoản để mua hàng tại ĐẸP VÀ XINH SHOP
          </p>
        </div>

        {/* Form đăng ký */}
        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-1">
              Họ và tên
            </label>
            <input
              type="text"
              placeholder="Nguyễn Văn A"
              className="w-full rounded-lg border border-neutral-700 bg-black px-4 py-2 text-sm text-white placeholder-neutral-500 focus:border-blue-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-1">
              Số điện thoại
            </label>
            <input
              type="tel"
              placeholder="0912345678"
              className="w-full rounded-lg border border-neutral-700 bg-black px-4 py-2 text-sm text-white placeholder-neutral-500 focus:border-blue-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-1">
              Email
            </label>
            <input
              type="email"
              placeholder="example@gmail.com"
              className="w-full rounded-lg border border-neutral-700 bg-black px-4 py-2 text-sm text-white placeholder-neutral-500 focus:border-blue-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-1">
              Mật khẩu
            </label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full rounded-lg border border-neutral-700 bg-black px-4 py-2 text-sm text-white placeholder-neutral-500 focus:border-blue-500 focus:outline-none"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-blue-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-500 active:bg-blue-700 mt-2"
          >
            Đăng ký
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-neutral-400">
          Đã có tài khoản?{' '}
          <Link href="/login" className="font-semibold text-blue-500 hover:underline">
            Đăng nhập ngay
          </Link>
        </div>

      </div>
    </div>
  );
}