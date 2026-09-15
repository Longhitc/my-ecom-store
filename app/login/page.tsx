'use client';

import { useAuth } from 'context/auth-context';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function LoginPage() {
  const router = useRouter();
  const { setCustomer } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Đăng nhập thất bại!');
      }

      // Cập nhật thông tin khách hàng vào Context
      if (data.customer) {
        setCustomer(data.customer);
      }

      // Chuyển hướng về trang chủ và làm mới dữ liệu
      router.push('/');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-black p-4 text-white">
      <div className="w-full max-w-md rounded-xl border border-gray-800 bg-zinc-900 p-8 shadow-2xl">
        <h2 className="text-center text-2xl font-bold">Đăng nhập</h2>
        <p className="mt-1 text-center text-sm text-gray-400">
          Nhập thông tin tài khoản để truy cập
        </p>

        {error && (
          <div className="mt-4 rounded border border-red-500/20 bg-red-500/10 p-3 text-center text-sm text-red-500">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300">Email</label>
            <input
              type="email"
              name="email"
              required
              placeholder="example@gmail.com"
              value={formData.email}
              onChange={handleChange}
              className="mt-1 w-full rounded-lg border border-gray-700 bg-black p-3 text-white focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300">Mật khẩu</label>
            <input
              type="password"
              name="password"
              required
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              className="mt-1 w-full rounded-lg border border-gray-700 bg-black p-3 text-white focus:border-blue-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 py-3 text-center font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Đang xử lý...' : 'Đăng nhập'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-400">
          Chưa có tài khoản?{' '}
          <Link href="/register" className="text-blue-500 hover:underline">
            Đăng ký ngay
          </Link>
        </p>
      </div>
    </div>
  );
}