'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function RegisterPage() {
  const router = useRouter();

  // State quản lý dữ liệu form
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Hàm xử lý khi người dùng nhập dữ liệu
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Hàm gọi API đăng ký
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Đăng ký thất bại!');
      }

      alert('Đăng ký tài khoản thành công!');
      router.push('/login'); // Chuyển hướng sang trang đăng nhập
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

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

        {/* Hiển thị thông báo lỗi nếu có */}
        {error && (
          <div className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-center text-sm text-red-500">
            {error}
          </div>
        )}

        {/* Form đăng ký */}
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-1">
              Họ và tên
            </label>
            <input
              type="text"
              name="name"
              placeholder="Nguyễn Văn A"
              value={formData.name}
              onChange={handleChange}
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
              name="phone"
              placeholder="0912345678"
              value={formData.phone}
              onChange={handleChange}
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
              name="email"
              placeholder="example@gmail.com"
              value={formData.email}
              onChange={handleChange}
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
              name="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              className="w-full rounded-lg border border-neutral-700 bg-black px-4 py-2 text-sm text-white placeholder-neutral-500 focus:border-blue-500 focus:outline-none"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-500 active:bg-blue-700 mt-2 disabled:opacity-50"
          >
            {loading ? 'Đang xử lý...' : 'Đăng ký'}
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