"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

type OrderItem = {
  id: string;
  productId: string;
  title: string;
  price: number;
  quantity: number;
  imageUrl: string;
};

type OrderDetail = {
  id: string;
  totalPrice: number;
  status: string;
  fullName: string;
  phone: string;
  addressLine: string;
  city: string;
  createdAt: string;
  items: OrderItem[];
};

export default function OrderDetailPage() {
  const params = useParams();
  const orderId = params?.id as string;

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (orderId) {
      fetch(`/api/orders/${orderId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.error) {
            setError(data.error);
          } else {
            setOrder(data.order);
          }
        })
        .catch(() => setError('Lỗi khi nạp dữ liệu đơn hàng'))
        .finally(() => setLoading(false));
    }
  }, [orderId]);

  const getStatusText = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'Đang chờ xử lý';
      case 'completed':
        return 'Hoàn thành';
      case 'cancelled':
        return 'Đã hủy';
      default:
        return status;
    }
  };

  // Định dạng ngày tháng 24h: dd/mm/yyyy hh:mm
  const formatDate24h = (rawDate?: string) => {
    if (!rawDate) return '---';
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
    return <div className="p-12 text-center text-neutral-500 text-xs sm:text-sm">Đang tải chi tiết đơn hàng...</div>;
  }

  if (error || !order) {
    return (
      <div className="p-12 text-center text-neutral-500 text-xs sm:text-sm">
        <p className="mb-4">{error || 'Không tìm thấy đơn hàng'}</p>
        <Link href="/account?tab=orders" className="text-blue-500 underline">
          Quay lại danh sách đơn hàng
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-3 sm:px-4 py-4 sm:py-6 text-black dark:text-white">
      {/* NÚT BACK DẪN THẲNG TRỰC TIẾP TỚI TAB ORDERS */}
      <div className="mb-4">
        <Link
          href="/account?tab=orders"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-neutral-600 hover:text-black dark:text-neutral-400 dark:hover:text-white transition-colors"
        >
          <span className="text-base sm:text-lg leading-none">←</span>
          <span>Quay lại</span>
        </Link>
      </div>

      {/* TIÊU ĐỀ & NÚT THAO TÁC */}
      <div className="text-center mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-light mb-3">Thông tin đặt hàng</h1>
        
        <div className="flex justify-center gap-2 sm:gap-3 mb-4 sm:mb-6">
          <button 
            onClick={() => window.print()} 
            className="px-4 sm:px-6 py-1.5 border border-red-500 text-red-500 rounded text-xs sm:text-sm hover:bg-red-50 dark:hover:bg-neutral-900 transition-colors"
          >
            In
          </button>
          <button 
            onClick={() => window.print()} 
            className="px-4 sm:px-6 py-1.5 border border-red-500 text-red-500 rounded text-xs sm:text-sm hover:bg-red-50 dark:hover:bg-neutral-900 transition-colors"
          >
            Hoá đơn PDF
          </button>
        </div>

        <div className="space-y-1 text-xs sm:text-sm text-neutral-700 dark:text-neutral-300">
          <p className="font-semibold text-sm sm:text-base font-mono">#{order.id}</p>
          <p>Ngày đặt hàng: {formatDate24h(order.createdAt)}</p>
          <p>Tình trạng đặt hàng: <span className="font-medium text-amber-500">{getStatusText(order.status)}</span></p>
          <p>Tổng giá trị đơn hàng: <span className="text-blue-500 font-bold">{Number(order.totalPrice).toLocaleString('vi-VN')} đ</span></p>
        </div>
      </div>

      {/* THÔNG TIN KHUNG BÊN TRÁI & PHẢI */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-8 sm:mb-12">
        {/* KHUNG TRÁI: THÔNG TIN THANH TOÁN */}
        <div className="border border-dashed border-sky-400 p-4 sm:p-5 rounded-lg space-y-3 text-xs sm:text-sm">
          <div>
            <h3 className="font-bold mb-2 text-sm sm:text-base">Thông tin thanh toán</h3>
            <p className="font-medium">{order.fullName}</p>
            <p>Điện thoại: {order.phone}</p>
            <p>{order.city}</p>
            <p>{order.addressLine}</p>
          </div>

          <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800">
            <h3 className="font-bold mb-1">Thanh toán</h3>
            <p>Phương thức thanh toán: Chuyển khoản / COD</p>
            <p>Tình trạng thanh toán: {getStatusText(order.status)}</p>
          </div>
        </div>

        {/* KHUNG PHẢI: ĐỊA CHỈ GIAO HÀNG */}
        <div className="border border-dashed border-sky-400 p-4 sm:p-5 rounded-lg space-y-3 text-xs sm:text-sm">
          <div>
            <h3 className="font-bold mb-2 text-sm sm:text-base">Địa chỉ giao hàng</h3>
            <p className="font-medium">{order.fullName}</p>
            <p>Điện thoại: {order.phone}</p>
            <p>{order.city}</p>
            <p>{order.addressLine}</p>
          </div>

          <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800">
            <h3 className="font-bold mb-1">Thông tin vận chuyển</h3>
            <p>Phương thức vận chuyển: Giao hàng tiêu chuẩn</p>
            <p>Tình trạng giao hàng: Chưa được vận chuyển</p>
          </div>
        </div>
      </div>

      {/* DANH SÁCH SẢN PHẨM */}
      <div className="mb-8">
        <h2 className="text-center text-base sm:text-lg font-medium mb-4 sm:mb-6">Các sản phẩm</h2>

        {/* 1. GIAO DIỆN CARD CHO MOBILE */}
        <div className="space-y-3 md:hidden">
          {(order.items || []).map((item, index) => {
            const safeKey = item.id || item.productId || `order-item-mob-${index}`;
            const itemTotal = Number(item.price) * item.quantity;

            return (
              <div key={safeKey} className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-3 bg-white dark:bg-neutral-900/50 space-y-2">
                <div className="flex gap-3">
                  <span className="font-bold text-neutral-400 text-xs shrink-0 pt-1">#{index + 1}</span>
                  
                  {item.imageUrl ? (
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-800">
                      <Image
                        src={item.imageUrl}
                        alt={item.title || 'Ảnh sản phẩm'}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="h-14 w-14 shrink-0 rounded-lg bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center text-[10px] text-neutral-400">
                      No img
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-xs sm:text-sm text-neutral-900 dark:text-neutral-100 leading-snug">
                      {item.title}
                    </p>
                    <p className="text-[11px] text-neutral-500 mt-1">
                      Đơn giá: <span className="font-medium text-neutral-700 dark:text-neutral-300">{Number(item.price).toLocaleString('vi-VN')} đ</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-neutral-100 dark:border-neutral-800/80 pt-2 text-xs">
                  <span className="text-neutral-500">
                    Số lượng: <strong className="text-black dark:text-white font-bold">{item.quantity}</strong>
                  </span>
                  <div>
                    <span className="text-neutral-500">Thành tiền: </span>
                    <strong className="text-amber-600 dark:text-amber-400 font-bold">
                      {itemTotal.toLocaleString('vi-VN')} đ
                    </strong>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 2. GIAO DIỆN BẢNG CHO DESKTOP */}
        <div className="hidden md:block overflow-x-auto rounded-lg border border-neutral-200 dark:border-neutral-800">
          <table className="w-full text-left text-xs md:text-sm border-collapse">
            <thead>
              <tr className="bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400">
                <th className="p-3 font-medium border-r border-neutral-200 dark:border-neutral-800 text-center w-12">STT</th>
                <th className="p-3 font-medium border-r border-neutral-200 dark:border-neutral-800 w-20">Hình ảnh</th>
                <th className="p-3 font-medium border-r border-neutral-200 dark:border-neutral-800">Tên sản phẩm</th>
                <th className="p-3 font-medium border-r border-neutral-200 dark:border-neutral-800 text-right w-28">Đơn giá</th>
                <th className="p-3 font-medium border-r border-neutral-200 dark:border-neutral-800 text-center w-20">Số lượng</th>
                <th className="p-3 font-medium text-right w-32">Tổng tiền</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
              {(order.items || []).map((item, index) => {
                const safeKey = item.id || item.productId || `order-item-dt-${index}`;

                return (
                  <tr key={safeKey} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/50">
                    <td className="p-3 border-r border-neutral-200 dark:border-neutral-800 text-center font-bold text-neutral-400">
                      {index + 1}
                    </td>
                    <td className="p-3 border-r border-neutral-200 dark:border-neutral-800">
                      {item.imageUrl ? (
                        <div className="relative h-14 w-14 overflow-hidden rounded-lg bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-800">
                          <Image
                            src={item.imageUrl}
                            alt={item.title || 'Ảnh sản phẩm'}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="h-14 w-14 bg-neutral-200 dark:bg-neutral-800 rounded-lg flex items-center justify-center text-xs text-neutral-400">
                          No image
                        </div>
                      )}
                    </td>
                    <td className="p-3 border-r border-neutral-200 dark:border-neutral-800 font-medium">
                      {item.title}
                    </td>
                    <td className="p-3 border-r border-neutral-200 dark:border-neutral-800 text-right whitespace-nowrap">
                      {Number(item.price).toLocaleString('vi-VN')} đ
                    </td>
                    <td className="p-3 border-r border-neutral-200 dark:border-neutral-800 text-center font-semibold">
                      {item.quantity}
                    </td>
                    <td className="p-3 text-right font-bold text-amber-600 dark:text-amber-400 whitespace-nowrap">
                      {(Number(item.price) * item.quantity).toLocaleString('vi-VN')} đ
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* BẢNG TỔNG CỘNG TIỀN */}
      <div className="flex justify-end">
        <div className="w-full md:w-80 bg-neutral-50 dark:bg-neutral-900/50 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 text-xs sm:text-sm space-y-2.5">
          <div className="flex justify-between text-neutral-500">
            <span>Tổng tiền hàng:</span>
            <span>{Number(order.totalPrice).toLocaleString('vi-VN')} đ</span>
          </div>
          <div className="flex justify-between text-neutral-500">
            <span>Phí vận chuyển:</span>
            <span>0 đ</span>
          </div>
          <div className="flex justify-between text-neutral-500">
            <span>Thuế:</span>
            <span>0 đ</span>
          </div>
          <div className="flex justify-between border-t border-neutral-200 dark:border-neutral-800 pt-2.5 font-bold text-sm sm:text-base">
            <span>Tổng thanh toán:</span>
            <span className="text-amber-600 dark:text-amber-400">{Number(order.totalPrice).toLocaleString('vi-VN')} đ</span>
          </div>
        </div>
      </div>
    </div>
  );
}