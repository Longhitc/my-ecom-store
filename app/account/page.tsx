"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import AddressSection from './AddressSection';

type Order = {
  id: string;
  status: string;
  createdAt: string;
  total: number;
};

export default function AccountPage() {
  const router = useRouter();
  const [customer, setCustomer] = useState<{ id: string; name: string; email: string; phone?: string } | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<'info' | 'address' | 'orders'>('info');
  const [loading, setLoading] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // 1. Lấy thông tin user đăng nhập
  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (!data.customer) {
          router.push('/login');
        } else {
          setCustomer(data.customer);
        }
      })
      .catch(() => router.push('/login'))
      .finally(() => setLoading(false));
  }, [router]);

  // 2. Gọi API lấy danh sách đơn hàng khi chuyển sang Tab "orders"
  useEffect(() => {
    if (activeTab === 'orders' && customer?.id) {
      setLoadingOrders(true);
      fetch(`/api/orders?customerId=${customer.id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.orders) {
            setOrders(data.orders);
          }
        })
        .catch((err) => console.error('Lỗi khi tải đơn hàng:', err))
        .finally(() => setLoadingOrders(false));
    }
  }, [activeTab, customer]);

  // Hàm chuyển đổi nhãn trạng thái sang Tiếng Việt
  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return <span className="font-medium text-amber-500">Đang xử lý</span>;
      case 'completed':
        return <span className="font-medium text-green-500">Hoàn thành</span>;
      case 'cancelled':
        return <span className="font-medium text-red-500">Đã hủy</span>;
      default:
        return <span className="font-medium text-black dark:text-white">{status}</span>;
    }
  };

  if (loading) {
    return <div className="p-10 text-center text-neutral-500">Đang tải thông tin...</div>;
  }

  return (
    <div className="mx-auto max-w-screen-xl px-4 py-8 md:py-12 text-black dark:text-white">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* SIDEBAR BÊN TRÁI */}
        <aside className="md:col-span-1 border-r border-neutral-200 dark:border-neutral-800 pr-6">
          <h2 className="text-xl font-bold mb-4">Tài khoản cá nhân</h2>
          <hr className="mb-4 border-neutral-200 dark:border-neutral-800" />
          <nav className="space-y-3 text-sm">
            <button
              onClick={() => setActiveTab('info')}
              className={`flex items-center space-x-2 w-full text-left transition-colors ${
                activeTab === 'info' ? 'text-blue-500 font-semibold' : 'text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white'
              }`}
            >
              <span className={activeTab === 'info' ? 'text-blue-500' : 'text-neutral-400'}>▪</span>
              <span>Thông tin tài khoản</span>
            </button>

            <button
              onClick={() => setActiveTab('address')}
              className={`flex items-center space-x-2 w-full text-left transition-colors ${
                activeTab === 'address' ? 'text-blue-500 font-semibold' : 'text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white'
              }`}
            >
              <span className={activeTab === 'address' ? 'text-blue-500' : 'text-neutral-400'}>▪</span>
              <span>Địa chỉ nhận hàng</span>
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              className={`flex items-center space-x-2 w-full text-left transition-colors ${
                activeTab === 'orders' ? 'text-blue-500 font-semibold' : 'text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white'
              }`}
            >
              <span className={activeTab === 'orders' ? 'text-blue-500' : 'text-neutral-400'}>▪</span>
              <span>Đơn hàng</span>
            </button>
          </nav>
        </aside>

        {/* NỘI DUNG BÊN PHẢI */}
        <main className="md:col-span-3 space-y-6">
          {/* TAB THÔNG TIN TÀI KHOẢN */}
          {activeTab === 'info' && (
            <div>
              <h1 className="text-2xl font-light tracking-wide pb-4 mb-6 border-b border-neutral-200 dark:border-neutral-800">
                Thông tin tài khoản
              </h1>
              <div className="space-y-3 text-sm">
                <p><strong>Họ và tên:</strong> {customer?.name || 'Chưa cập nhật'}</p>
                <p><strong>Email:</strong> {customer?.email}</p>
                <p><strong>Số điện thoại:</strong> {customer?.phone || 'Chưa cập nhật'}</p>
              </div>
            </div>
          )}

          {/* TAB ĐỊA CHỈ (Đã tích hợp AddressSection) */}
          {activeTab === 'address' && (
            <div>
              <AddressSection />
            </div>
          )}

          {/* TAB ĐƠN HÀNG */}
          {activeTab === 'orders' && (
            <div>
              <h1 className="text-2xl font-light tracking-wide pb-4 mb-6 border-b border-neutral-200 dark:border-neutral-800">
                Đơn hàng
              </h1>

              {loadingOrders ? (
                <p className="text-sm text-neutral-500">Đang tải danh sách đơn hàng...</p>
              ) : orders.length > 0 ? (
                <div className="space-y-6">
                  {orders.map((order) => (
                    <div key={order.id} className="border-b border-neutral-200 dark:border-neutral-800 pb-6">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-normal text-neutral-800 dark:text-neutral-200">
                          Mã đơn hàng: <span className="font-semibold text-sm">{order.id}</span>
                        </h3>
                        <Link
                          href={`/account/orders/${order.id}`}
                          className="px-3 py-1 text-sm border border-red-400 text-red-500 rounded hover:bg-red-50 dark:hover:bg-neutral-900 transition-colors"
                        >
                          Chi tiết đơn hàng
                        </Link>
                      </div>

                      <div className="bg-neutral-50 dark:bg-neutral-900/50 p-4 rounded space-y-2 text-sm text-neutral-600 dark:text-neutral-300">
                        <p>
                          Trạng thái đơn hàng: {getStatusBadge(order.status)}
                        </p>
                        <p>
                          Ngày đặt hàng:{' '}
                          <span className="text-black dark:text-white">
                            {order.createdAt ? new Date(order.createdAt).toLocaleString('vi-VN') : 'Mới đặt'}
                          </span>
                        </p>
                        <p>
                          Tổng số tiền:{' '}
                          <span className="font-semibold text-black dark:text-white">
                            {Number(order.total || 0).toLocaleString('vi-VN')} đ
                          </span>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-neutral-500">Bạn chưa có đơn hàng nào.</p>
              )}
            </div>
          )}
        </main>

      </div>
    </div>
  );
}