"use client";

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import AddressSection from './AddressSection';

type Order = {
  id: string;
  status: string;
  createdAt?: string;
  created_at?: string;
  date?: string;
  created_date?: string;
  total?: number;
  total_amount?: number;
  total_price?: number;
  amount?: number;
};

function AccountContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabFromUrl = searchParams.get('tab') as 'info' | 'address' | 'orders' | null;

  const [customer, setCustomer] = useState<{ id: string; name: string; email: string; phone?: string } | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  
  // Khởi tạo activeTab trực tiếp từ URL (?tab=orders)
  const [activeTab, setActiveTab] = useState<'info' | 'address' | 'orders'>(tabFromUrl || 'info');
  const [loading, setLoading] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Tự động lắng nghe và nhảy Tab khi URL thay đổi
  useEffect(() => {
    if (tabFromUrl && ['info', 'address', 'orders'].includes(tabFromUrl)) {
      setActiveTab(tabFromUrl);
    }
  }, [tabFromUrl]);

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
      case 'processing':
        return <span className="font-medium text-amber-500">Đang xử lý</span>;
      case 'completed':
        return <span className="font-medium text-green-500">Hoàn thành</span>;
      case 'cancelled':
        return <span className="font-medium text-red-500">Đã hủy</span>;
      default:
        return <span className="font-medium text-black dark:text-white">{status}</span>;
    }
  };

  // Hàm định dạng ngày tháng hiển thị chuẩn dd/mm/yyyy hh:mm (24h)
  const formatDate = (rawDate?: string) => {
    if (!rawDate) return 'Chưa có ngày';
    try {
      const d = new Date(rawDate);
      if (isNaN(d.getTime())) return rawDate;

      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');

      return `${day}/${month}/${year} ${hours}:${minutes}`;
    } catch {
      return rawDate;
    }
  };

  if (loading) {
    return <div className="p-10 text-center text-xs sm:text-sm text-neutral-500">Đang tải thông tin...</div>;
  }

  return (
    <div className="mx-auto max-w-screen-xl px-3 sm:px-4 py-4 sm:py-8 md:py-12 text-black dark:text-white">
      <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 md:hidden">Tài khoản cá nhân</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-8">
        
        {/* THANH MENU NAV */}
        <aside className="md:col-span-1 md:border-r border-neutral-200 dark:border-neutral-800 md:pr-6">
          <h2 className="hidden md:block text-xl font-bold mb-4">Tài khoản cá nhân</h2>
          <hr className="hidden md:block mb-4 border-neutral-200 dark:border-neutral-800" />
          
          <nav className="flex md:flex-col overflow-x-auto no-scrollbar gap-2 md:space-y-3 text-xs sm:text-sm border-b md:border-b-0 border-neutral-200 dark:border-neutral-800 pb-2 md:pb-0">
            <button
              onClick={() => {
                setActiveTab('info');
                router.push('/account?tab=info');
              }}
              className={`flex items-center space-x-2 shrink-0 px-3 py-2 md:p-0 rounded-lg md:rounded-none md:w-full text-left transition-colors ${
                activeTab === 'info' 
                  ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-500 font-semibold md:bg-transparent md:dark:bg-transparent' 
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white'
              }`}
            >
              <span className={`hidden md:inline ${activeTab === 'info' ? 'text-blue-500' : 'text-neutral-400'}`}>▪</span>
              <span>Thông tin tài khoản</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('address');
                router.push('/account?tab=address');
              }}
              className={`flex items-center space-x-2 shrink-0 px-3 py-2 md:p-0 rounded-lg md:rounded-none md:w-full text-left transition-colors ${
                activeTab === 'address' 
                  ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-500 font-semibold md:bg-transparent md:dark:bg-transparent' 
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white'
              }`}
            >
              <span className={`hidden md:inline ${activeTab === 'address' ? 'text-blue-500' : 'text-neutral-400'}`}>▪</span>
              <span>Địa chỉ nhận hàng</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('orders');
                router.push('/account?tab=orders');
              }}
              className={`flex items-center space-x-2 shrink-0 px-3 py-2 md:p-0 rounded-lg md:rounded-none md:w-full text-left transition-colors ${
                activeTab === 'orders' 
                  ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-500 font-semibold md:bg-transparent md:dark:bg-transparent' 
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white'
              }`}
            >
              <span className={`hidden md:inline ${activeTab === 'orders' ? 'text-blue-500' : 'text-neutral-400'}`}>▪</span>
              <span>Đơn hàng</span>
            </button>
          </nav>
        </aside>

        {/* NỘI DUNG BÊN PHẢI */}
        <main className="md:col-span-3 space-y-4 sm:space-y-6">
          {/* TAB THÔNG TIN TÀI KHOẢN */}
          {activeTab === 'info' && (
            <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 sm:p-6 bg-white dark:bg-neutral-900/40">
              <h1 className="text-lg sm:text-2xl font-semibold pb-3 mb-4 border-b border-neutral-200 dark:border-neutral-800">
                Thông tin tài khoản
              </h1>
              <div className="space-y-3 text-xs sm:text-sm">
                <p className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                  <strong className="text-neutral-500 dark:text-neutral-400 sm:w-28">Họ và tên:</strong> 
                  <span className="font-medium text-black dark:text-white">{customer?.name || 'Chưa cập nhật'}</span>
                </p>
                <p className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                  <strong className="text-neutral-500 dark:text-neutral-400 sm:w-28">Email:</strong> 
                  <span className="font-medium text-black dark:text-white">{customer?.email}</span>
                </p>
                <p className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                  <strong className="text-neutral-500 dark:text-neutral-400 sm:w-28">Số điện thoại:</strong> 
                  <span className="font-medium text-black dark:text-white">{customer?.phone || 'Chưa cập nhật'}</span>
                </p>
              </div>
            </div>
          )}

          {/* TAB ĐỊA CHỈ */}
          {activeTab === 'address' && (
            <div>
              <AddressSection />
            </div>
          )}

          {/* TAB ĐƠN HÀNG */}
          {activeTab === 'orders' && (
            <div>
              <h1 className="text-lg sm:text-2xl font-semibold pb-3 mb-4 border-b border-neutral-200 dark:border-neutral-800">
                Lịch sử đơn hàng
              </h1>

              {loadingOrders ? (
                <p className="text-xs sm:text-sm text-neutral-500">Đang tải danh sách đơn hàng...</p>
              ) : orders.length > 0 ? (
                <div className="space-y-4">
                  {orders.map((order, idx) => {
                    const orderTotal =
                      order.total ??
                      order.total_amount ??
                      order.total_price ??
                      order.amount ??
                      0;

                    const orderRawDate =
                      order.createdAt ||
                      order.created_at ||
                      order.date ||
                      order.created_date;

                    const safeKey = order.id || `order-item-${idx}`;

                    return (
                      <div key={safeKey} className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-3.5 sm:p-5 bg-white dark:bg-neutral-900/40 shadow-sm">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-3 border-b border-neutral-100 dark:border-neutral-800/80">
                          <div>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400">Mã đơn hàng</p>
                            <h3 className="text-sm sm:text-base font-bold text-neutral-800 dark:text-neutral-100 font-mono">
                              #{order.id}
                            </h3>
                          </div>
                          <Link
                            href={`/account/orders/${order.id}`}
                            className="w-full sm:w-auto text-center px-3 py-1.5 text-xs font-semibold border border-red-500/30 text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-neutral-800 transition-colors"
                          >
                            Chi tiết đơn hàng
                          </Link>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-neutral-600 dark:text-neutral-300">
                          <div>
                            <span className="text-neutral-400 block text-[11px]">Trạng thái</span>
                            {getStatusBadge(order.status)}
                          </div>
                          <div>
                            <span className="text-neutral-400 block text-[11px]">Ngày đặt hàng</span>
                            <span className="font-medium text-black dark:text-white">
                              {formatDate(orderRawDate)}
                            </span>
                          </div>
                          <div>
                            <span className="text-neutral-400 block text-[11px]">Tổng số tiền</span>
                            <span className="font-bold text-sm text-amber-600 dark:text-amber-400">
                              {Number(orderTotal).toLocaleString('vi-VN')} đ
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs sm:text-sm text-neutral-500">Bạn chưa có đơn hàng nào.</p>
              )}
            </div>
          )}
        </main>

      </div>
    </div>
  );
}
export default function AccountPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-xs sm:text-sm text-neutral-500">Đang tải...</div>}>
      <AccountContent />
    </Suspense>
  );
}