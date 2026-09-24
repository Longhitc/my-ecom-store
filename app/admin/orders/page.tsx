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
      const res = await fetch('/api/admin/orders', {
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
      } else {
        alert('Cập nhật thất bại!');
      }
    } catch (error) {
      console.error(error);
      alert('Lỗi kết nối!');
    } finally {
      setUpdatingId(null);
    }
  };

  // Lọc đơn hàng theo từ khóa tìm kiếm và trạng thái
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.customer_name && order.customer_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (order.customer_phone && order.customer_phone.includes(searchTerm));

    const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Render nhãn trạng thái có màu sắc trực quan
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <span className="rounded bg-green-500/10 px-2 py-1 text-xs font-semibold text-green-500">Đã hoàn thành</span>;
      case 'processing':
        return <span className="rounded bg-blue-500/10 px-2 py-1 text-xs font-semibold text-blue-500">Đang xử lý</span>;
      case 'cancelled':
        return <span className="rounded bg-red-500/10 px-2 py-1 text-xs font-semibold text-red-500">Đã hủy</span>;
      default:
        return <span className="rounded bg-amber-500/10 px-2 py-1 text-xs font-semibold text-amber-500">Chờ xử lý</span>;
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 p-6 text-white">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-2xl font-bold">📦 Quản lý đơn hàng</h1>
            <p className="text-sm text-neutral-400">Xem và quản lý toàn bộ danh sách đơn hàng của shop</p>
          </div>
          <button
            onClick={fetchOrders}
            className="rounded-lg bg-neutral-800 px-4 py-2 text-xs font-medium text-white transition hover:bg-neutral-700"
          >
            🔄 Tải lại dữ liệu
          </button>
        </div>

        {/* Thanh tìm kiếm và bộ lọc */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row">
          <input
            type="text"
            placeholder="Tìm theo Mã đơn, Tên khách hàng, Số điện thoại..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 rounded-lg border border-neutral-800 bg-neutral-900 px-4 py-2 text-sm text-white placeholder-neutral-500 focus:border-amber-500 focus:outline-none"
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-neutral-800 bg-neutral-900 px-4 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="pending">Chờ xử lý</option>
            <option value="processing">Đang xử lý</option>
            <option value="completed">Đã hoàn thành</option>
            <option value="cancelled">Đã hủy</option>
          </select>
        </div>

        {/* Bảng danh sách đơn hàng */}
        {loading ? (
          <div className="py-20 text-center text-neutral-400">Đang tải danh sách đơn hàng...</div>
        ) : filteredOrders.length === 0 ? (
          <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-12 text-center text-neutral-400">
            Không tìm thấy đơn hàng nào!
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-neutral-800 bg-neutral-900">
            <table className="w-full text-left text-sm text-neutral-300">
              <thead className="border-b border-neutral-800 bg-neutral-950/50 text-xs uppercase text-neutral-400">
                <tr>
                  <th className="p-4">Mã đơn hàng</th>
                  <th className="p-4">Khách hàng</th>
                  <th className="p-4">Tổng tiền</th>
                  <th className="p-4">Trạng thái</th>
                  <th className="p-4">Ngày đặt</th>
                  <th className="p-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-neutral-800/50 transition">
                    <td className="p-4 font-mono font-medium text-amber-400">#{order.id.slice(0, 8)}</td>
                    <td className="p-4">
                      <div className="font-semibold text-white">{order.customer_name || 'Khách vãng lai'}</div>
                      <div className="text-xs text-neutral-400">{order.customer_phone || order.customer_email}</div>
                    </td>
                    <td className="p-4 font-bold text-white">
                      {order.total_price ? order.total_price.toLocaleString('vi-VN') : 0} đ
                    </td>
                    <td className="p-4">{renderStatusBadge(order.status)}</td>
                    <td className="p-4 text-xs text-neutral-400">
                      {order.created_at ? new Date(order.created_at).toLocaleString('vi-VN') : '---'}
                    </td>
                    <td className="p-4 text-right">
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
        )}

        {/* Modal Xem chi tiết & Thay đổi trạng thái đơn hàng */}
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
            <div className="w-full max-w-2xl rounded-xl border border-neutral-800 bg-neutral-900 p-6 text-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
                <h2 className="text-lg font-bold text-amber-400">Chi tiết đơn hàng #{selectedOrder.id}</h2>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-neutral-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="my-4 space-y-3 text-sm">
                <div className="grid grid-cols-2 gap-4 rounded-lg bg-neutral-950 p-3">
                  <div>
                    <span className="text-xs text-neutral-400">Người nhận:</span>
                    <p className="font-semibold">{selectedOrder.customer_name}</p>
                    <p className="text-xs text-neutral-400">{selectedOrder.customer_phone}</p>
                  </div>
                  <div>
                    <span className="text-xs text-neutral-400">Địa chỉ giao hàng:</span>
                    <p className="text-xs">{selectedOrder.shipping_address || 'Chưa cung cấp'}</p>
                  </div>
                </div>

                {/* Danh sách sản phẩm trong đơn */}
                <div>
                  <h3 className="mb-2 font-semibold text-neutral-300">Sản phẩm đã mua:</h3>
                  <div className="max-h-48 space-y-2 overflow-y-auto pr-2">
                    {selectedOrder.items && selectedOrder.items.length > 0 ? (
                      selectedOrder.items.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between rounded bg-neutral-950 p-2.5">
                          <div className="flex items-center gap-3">
                            {item.image_url && (
                              <img src={item.image_url} alt={item.title} className="h-10 w-10 rounded object-cover" />
                            )}
                            <div>
                              <p className="text-xs font-medium text-white">{item.title}</p>
                              <p className="text-xs text-neutral-400">Số lượng: x{item.quantity}</p>
                            </div>
                          </div>
                          <p className="text-xs font-bold text-amber-400">
                            {(item.price * item.quantity).toLocaleString('vi-VN')} đ
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-neutral-500">Không có dữ liệu chi tiết sản phẩm.</p>
                    )}
                  </div>
                </div>

                {/* Thay đổi trạng thái */}
                <div className="flex items-center justify-between rounded-lg bg-neutral-950 p-3">
                  <span className="text-xs font-medium text-neutral-300">Cập nhật trạng thái:</span>
                  <select
                    disabled={updatingId === selectedOrder.id}
                    value={selectedOrder.status}
                    onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value)}
                    className="rounded border border-neutral-700 bg-neutral-900 px-3 py-1 text-xs text-white focus:border-amber-500 focus:outline-none"
                  >
                    <option value="pending">Chờ xử lý</option>
                    <option value="processing">Đang xử lý</option>
                    <option value="completed">Đã hoàn thành</option>
                    <option value="cancelled">Đã hủy</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-neutral-800">
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="rounded bg-neutral-800 px-4 py-2 text-xs font-semibold hover:bg-neutral-700"
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