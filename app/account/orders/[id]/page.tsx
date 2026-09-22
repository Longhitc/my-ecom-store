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

  if (loading) {
    return <div className="p-12 text-center text-neutral-500">Đang tải chi tiết đơn hàng...</div>;
  }

  if (error || !order) {
    return (
      <div className="p-12 text-center text-neutral-500">
        <p className="mb-4">{error || 'Không tìm thấy đơn hàng'}</p>
        <Link href="/account" className="text-blue-500 underline text-sm">
          Quay lại tài khoản
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 text-black dark:text-white">
      {/* TIÊU ĐỀ & NÚT THAO TÁC */}
      <div className="text-center mb-8">
        <h1 className="text-2xl md:text-3xl font-light mb-4">Thông tin đặt hàng</h1>
        
        <div className="flex justify-center gap-3 mb-6">
          <button 
            onClick={() => window.print()} 
            className="px-6 py-1.5 border border-red-500 text-red-500 rounded text-sm hover:bg-red-50 dark:hover:bg-neutral-900 transition-colors"
          >
            In
          </button>
          <button 
            onClick={() => window.print()} 
            className="px-6 py-1.5 border border-red-500 text-red-500 rounded text-sm hover:bg-red-50 dark:hover:bg-neutral-900 transition-colors"
          >
            Hoá đơn PDF
          </button>
        </div>

        <div className="space-y-1 text-sm text-neutral-700 dark:text-neutral-300">
          <p className="font-semibold text-base">{order.id}</p>
          <p>Ngày đặt hàng: {order.createdAt ? new Date(order.createdAt).toLocaleDateString('vi-VN') : '---'}</p>
          <p>Tình trạng đặt hàng: <span className="font-medium">{getStatusText(order.status)}</span></p>
          <p>Tổng giá trị đơn hàng: <span className="text-blue-500 font-medium">{Number(order.totalPrice).toLocaleString('vi-VN')} đ</span></p>
        </div>
      </div>

      {/* THÔNG TIN KHUNG BÊN TRÁI & PHẢI */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        {/* KHUNG TRÁI: THÔNG TIN THANH TOÁN */}
        <div className="border border-dashed border-sky-400 p-5 rounded-sm space-y-4 text-xs md:text-sm">
          <div>
            <h3 className="font-bold mb-2">Thông tin thanh toán</h3>
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
        <div className="border border-dashed border-sky-400 p-5 rounded-sm space-y-4 text-xs md:text-sm">
          <div>
            <h3 className="font-bold mb-2">Địa chỉ giao hàng</h3>
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
        <h2 className="text-center text-lg font-normal mb-6">Các sản phẩm</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs md:text-sm border-collapse border border-neutral-200 dark:border-neutral-800">
            <thead>
              <tr className="bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400">
                <th className="p-3 font-normal border-r border-neutral-200 dark:border-neutral-800">SKU</th>
                <th className="p-3 font-normal border-r border-neutral-200 dark:border-neutral-800">Hình ảnh</th>
                <th className="p-3 font-normal border-r border-neutral-200 dark:border-neutral-800">Tên</th>
                <th className="p-3 font-normal border-r border-neutral-200 dark:border-neutral-800 text-right">Đơn giá</th>
                <th className="p-3 font-normal border-r border-neutral-200 dark:border-neutral-800 text-center">Số lượng</th>
                <th className="p-3 font-normal text-right">Tổng tiền</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item) => (
                <tr key={item.id} className="border-b border-neutral-200 dark:border-neutral-800">
                  <td className="p-3 border-r border-neutral-200 dark:border-neutral-800">---</td>
                  <td className="p-3 border-r border-neutral-200 dark:border-neutral-800 w-20">
                    {item.imageUrl ? (
                      <div className="relative h-16 w-16 overflow-hidden rounded bg-neutral-100 dark:bg-neutral-800">
                        <Image
                          src={item.imageUrl}
                          alt={item.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="h-16 w-16 bg-neutral-200 dark:bg-neutral-800 rounded flex items-center justify-center text-xs text-neutral-400">
                        No image
                      </div>
                    )}
                  </td>
                  <td className="p-3 border-r border-neutral-200 dark:border-neutral-800 font-medium italic">
                    {item.title}
                  </td>
                  <td className="p-3 border-r border-neutral-200 dark:border-neutral-800 text-right">
                    {Number(item.price).toLocaleString('vi-VN')} đ
                  </td>
                  <td className="p-3 border-r border-neutral-200 dark:border-neutral-800 text-center">
                    {item.quantity}
                  </td>
                  <td className="p-3 text-right font-medium">
                    {(Number(item.price) * item.quantity).toLocaleString('vi-VN')} đ
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* BẢNG TỔNG CỘNG TIỀN */}
      <div className="flex justify-end">
        <div className="w-full md:w-80 bg-neutral-50 dark:bg-neutral-900/50 p-4 rounded text-xs md:text-sm space-y-3">
          <div className="flex justify-between">
            <span className="text-neutral-500">Tổng:</span>
            <span>{Number(order.totalPrice).toLocaleString('vi-VN')} đ</span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-500">Thông tin vận chuyển:</span>
            <span>0 đ</span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-500">Thuế:</span>
            <span>0 đ</span>
          </div>
          <div className="flex justify-between border-t border-neutral-200 dark:border-neutral-800 pt-2 font-bold text-sm md:text-base">
            <span>Tổng giá trị đơn hàng:</span>
            <span>{Number(order.totalPrice).toLocaleString('vi-VN')} đ</span>
          </div>
        </div>
      </div>
    </div>
  );
}