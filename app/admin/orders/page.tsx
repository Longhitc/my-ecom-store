'use client';

import { useEffect, useState } from 'react';

interface OrderItem {
  product_id: string;
  title: string;
  quantity: number;
  price: number;
  image_url?: string;
}

interface Order {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  recipient_name: string;
  recipient_phone: string;
  total_price: number;
  status: string;
  shipping_address: string;
  created_at: string;
  items: OrderItem[];
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Hàm định dạng ngày giờ chuẩn dd/mm/yyyy hh:mm (24h)
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

  // Tải danh sách đơn hàng từ API
  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders');
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      } else {
        alert('Không thể tải danh sách đơn hàng!');
      }
    } catch (err) {
      console.error(err);
      alert('Đã xảy ra lỗi khi kết nối!');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Cập nhật trạng thái đơn hàng
  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      const res = await fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status: newStatus }),
      });

      if (res.ok) {
        setOrders((prev) =>
          prev.map((ord) => (ord.id === orderId ? { ...ord, status: newStatus } : ord))
        );

        if (selectedOrder?.id === orderId) {
          setSelectedOrder((prev) => (prev ? { ...prev, status: newStatus } : null));
        }

        alert('Cập nhật trạng thái đơn hàng thành công!');
      } else {
        const errorData = await res.json();
        alert(errorData.error || errorData.message || 'Cập nhật thất bại!');
      }
    } catch (error) {
      console.error(error);
      alert('Lỗi kết nối đến máy chủ!');
    } finally {
      setUpdatingId(null);
    }
  };

  // Lọc đơn hàng
  const filteredOrders = orders.filter((order) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      order.id.toLowerCase().includes(searchLower) ||
      (order.customer_name && order.customer_name.toLowerCase().includes(searchLower)) ||
      (order.customer_phone && order.customer_phone.includes(searchTerm)) ||
      (order.recipient_name && order.recipient_name.toLowerCase().includes(searchLower)) ||
      (order.recipient_phone && order.recipient_phone.includes(searchTerm));

    const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Render nhãn trạng thái
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <span className="rounded bg-green-500/10 px-2 py-0.5 text-xs font-semibold text-green-500">Đã hoàn thành</span>;
      case 'processing':
        return <span className="rounded bg-blue-500/10 px-2 py-0.5 text-xs font-semibold text-blue-500">Đang xử lý</span>;
      case 'cancelled':
        return <span className="rounded bg-red-500/10 px-2 py-0.5 text-xs font-semibold text-red-500">Đã hủy</span>;
      default:
        return <span className="rounded bg-amber-500/10 px-2 py-0.5 text-xs font-semibold text-amber-500">Chờ xử lý</span>;
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 p-3 sm:p-6 text-white">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-4 flex flex-col justify-between gap-3 sm:mb-6 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-xl font-bold sm:text-2xl">📦 Quản lý đơn hàng</h1>
            <p className="text-xs text-neutral-400 sm:text-sm">Xem và quản lý toàn bộ danh sách đơn hàng của shop</p>
          </div>
          <button
            onClick={fetchOrders}
            className="w-full rounded-lg bg-neutral-800 px-4 py-2 text-xs font-medium text-white transition hover:bg-neutral-700 sm:w-auto"
          >
            🔄 Tải lại dữ liệu
          </button>
        </div>

        {/* Thanh tìm kiếm và bộ lọc */}
        <div className="mb-4 flex flex-col gap-2.5 sm:mb-6 sm:flex-row sm:gap-4">
          <input
            type="text"
            placeholder="Tìm theo Mã đơn, Khách hàng, Người nhận, SĐT..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full flex-1 rounded-lg border border-neutral-800 bg-neutral-900 px-3.5 py-2 text-xs text-white placeholder-neutral-500 focus:border-amber-500 focus:outline-none sm:text-sm"
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3.5 py-2 text-xs text-white focus:border-amber-500 focus:outline-none sm:w-auto sm:text-sm"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="pending">Chờ xử lý</option>
            <option value="processing">Đang xử lý</option>
            <option value="completed">Đã hoàn thành</option>
            <option value="cancelled">Đã hủy</option>
          </select>
        </div>

        {/* Danh sách đơn hàng */}
        {loading ? (
          <div className="py-20 text-center text-xs text-neutral-400 sm:text-sm">Đang tải danh sách đơn hàng...</div>
        ) : filteredOrders.length === 0 ? (
          <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-8 text-center text-xs text-neutral-400 sm:p-12 sm:text-sm">
            Không tìm thấy đơn hàng nào!
          </div>
        ) : (
          <>
            {/* DANH SÁCH CHO MOBILE (< md) */}
            <div className="space-y-3 md:hidden">
              {filteredOrders.map((order) => (
                <div key={order.id} className="rounded-xl border border-neutral-800 bg-neutral-900 p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-neutral-800/80 pb-2.5">
                    <span className="font-mono text-xs font-bold text-amber-400">#{order.id.slice(0, 12)}</span>
                    <div>{renderStatusBadge(order.status)}</div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs border-b border-neutral-800/80 pb-2.5">
                    <div>
                      <span className="text-[10px] text-neutral-500 block">Khách hàng</span>
                      <p className="font-semibold text-white">{order.customer_name || 'Khách vãng lai'}</p>
                      <p className="text-neutral-400 text-[11px]">{order.customer_phone || order.customer_email}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-neutral-500 block">Người nhận</span>
                      <p className="font-semibold text-blue-400">{order.recipient_name || 'Chưa có tên'}</p>
                      <p className="text-neutral-400 text-[11px]">{order.recipient_phone}</p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <div>
                      <span className="text-[10px] text-neutral-500 block">
                        Ngày đặt: <strong className="text-neutral-300 font-normal">{formatDate24h(order.created_at)}</strong>
                      </span>
                      <p className="text-sm font-bold text-amber-500 mt-0.5">
                        {order.total_price ? order.total_price.toLocaleString('vi-VN') : 0} đ
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="rounded bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-400 hover:bg-amber-500/20 transition"
                    >
                      Xem chi tiết
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* BẢNG DÀNH CHO DESKTOP (>= md) */}
            <div className="hidden overflow-x-auto rounded-xl border border-neutral-800 bg-neutral-900 md:block">
              <table className="w-full text-left text-sm text-neutral-300">
                <thead className="border-b border-neutral-800 bg-neutral-950/50 text-xs uppercase text-neutral-400">
                  <tr>
                    <th className="p-4">Mã đơn hàng</th>
                    <th className="p-4">Khách hàng</th>
                    <th className="p-4">Người nhận</th>
                    <th className="p-4">Tổng tiền</th>
                    <th className="p-4">Trạng thái</th>
                    <th className="p-4">Ngày đặt</th>
                    <th className="p-4 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800">
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-neutral-800/50 transition">
                      <td className="p-4 font-mono font-medium text-amber-400">#{order.id.slice(0, 12)}</td>
                      
                      {/* KHÁCH HÀNG */}
                      <td className="p-4">
                        <div className="font-semibold text-white">{order.customer_name || 'Khách vãng lai'}</div>
                        <div className="text-xs text-neutral-400">{order.customer_phone || order.customer_email}</div>
                      </td>

                      {/* NGƯỜI NHẬN */}
                      <td className="p-4">
                        <div className="font-semibold text-blue-400">{order.recipient_name || 'Chưa có tên'}</div>
                        <div className="text-xs text-neutral-400">{order.recipient_phone}</div>
                      </td>

                      <td className="p-4 font-bold text-white whitespace-nowrap">
                        {order.total_price ? order.total_price.toLocaleString('vi-VN') : 0} đ
                      </td>
                      <td className="p-4 whitespace-nowrap">{renderStatusBadge(order.status)}</td>
                      <td className="p-4 text-xs text-neutral-400 whitespace-nowrap">
                        {formatDate24h(order.created_at)}
                      </td>
                      <td className="p-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="rounded bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-400 hover:bg-amber-500/20"
                        >
                          Xem chi tiết
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Modal Xem chi tiết & Thay đổi trạng thái đơn hàng */}
        {selectedOrder && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/80 p-3 sm:p-4 backdrop-blur-sm">
            <div className="flex max-h-[90vh] w-full max-w-xl flex-col rounded-xl border border-neutral-800 bg-neutral-900 p-4 text-white shadow-2xl sm:p-6">
              
              {/* Header Modal */}
              <div className="flex shrink-0 items-center justify-between border-b border-neutral-800 pb-3">
                <div>
                  <h2 className="text-sm font-bold text-amber-400 sm:text-base">
                    Chi tiết đơn #{selectedOrder.id}
                  </h2>
                  <p className="text-[11px] text-neutral-400 mt-0.5">
                    Ngày đặt hàng: {formatDate24h(selectedOrder.created_at)}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="rounded-lg p-1 text-neutral-400 hover:bg-neutral-800 hover:text-white transition"
                >
                  ✕
                </button>
              </div>

              {/* Body Modal */}
              <div className="my-3 space-y-3 overflow-y-auto pr-1 text-xs sm:my-4 sm:text-sm">
                
                {/* Thông tin Khách hàng & Người nhận */}
                <div className="grid grid-cols-1 gap-2 rounded-lg bg-neutral-950 p-3 sm:grid-cols-2 sm:gap-4">
                  <div>
                    <span className="text-[11px] text-neutral-500 block font-semibold">Tài khoản khách hàng:</span>
                    <p className="font-semibold text-white">{selectedOrder.customer_name || 'Khách vãng lai'}</p>
                    <p className="text-[11px] text-neutral-400">{selectedOrder.customer_phone || selectedOrder.customer_email || 'Chưa có SĐT'}</p>
                  </div>
                  <div>
                    <span className="text-[11px] text-neutral-500 block font-semibold">Thông tin người nhận:</span>
                    <p className="font-semibold text-blue-400">{selectedOrder.recipient_name || 'Chưa có tên'}</p>
                    <p className="text-[11px] text-neutral-400">{selectedOrder.recipient_phone}</p>
                    <p className="text-xs text-neutral-300 mt-1">{selectedOrder.shipping_address || 'Chưa cung cấp địa chỉ'}</p>
                  </div>
                </div>

                {/* Danh sách sản phẩm trong đơn */}
                <div>
                  <h3 className="mb-2 font-semibold text-neutral-300">Sản phẩm đã mua:</h3>
                  <div className="space-y-2">
                    {selectedOrder.items && selectedOrder.items.length > 0 ? (
                      selectedOrder.items.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between gap-2 rounded-lg bg-neutral-950 p-2.5">
                          <div className="flex items-center gap-2.5 min-w-0">
                            {item.image_url && (
                              <img src={item.image_url} alt={item.title} className="h-10 w-10 shrink-0 rounded object-cover" />
                            )}
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-medium text-white truncate">{item.title}</p>
                              <p className="text-[11px] text-neutral-400">Số lượng: x{item.quantity}</p>
                            </div>
                          </div>
                          <p className="text-xs font-bold text-amber-400 shrink-0">
                            {(item.price * item.quantity).toLocaleString('vi-VN')} đ
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-neutral-500">Không có dữ liệu chi tiết sản phẩm.</p>
                    )}
                  </div>
                </div>

                {/* Cập nhật trạng thái */}
                <div className="flex items-center justify-between gap-2 rounded-lg bg-neutral-950 p-2.5">
                  <span className="text-xs font-medium text-neutral-300 shrink-0">Trạng thái:</span>
                  <select
                    disabled={updatingId === selectedOrder.id}
                    value={selectedOrder.status}
                    onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value)}
                    className="rounded border border-neutral-700 bg-neutral-900 px-2.5 py-1 text-xs text-white focus:border-amber-500 focus:outline-none disabled:opacity-50"
                  >
                    <option value="pending">Chờ xử lý</option>
                    <option value="processing">Đang xử lý</option>
                    <option value="completed">Đã hoàn thành</option>
                    <option value="cancelled">Đã hủy</option>
                  </select>
                </div>
              </div>
             {/* Footer Modal */}
              <div className="flex shrink-0 justify-end pt-3 border-t border-neutral-800">
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="w-full rounded-lg bg-neutral-800 py-2 text-xs font-semibold hover:bg-neutral-700 transition sm:w-auto sm:px-5"
                >
                  Đóng
                </button>
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}