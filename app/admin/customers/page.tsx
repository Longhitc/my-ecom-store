'use client';

import { useEffect, useState } from 'react';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address_line?: string;
  city?: string;
  address_phone?: string;
  created_at: string;
}

interface Address {
  id: string;
  full_name: string;
  phone: string;
  address_line: string;
  city: string;
  is_default: number;
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // State Modal Chi tiết / Sửa
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerAddresses, setCustomerAddresses] = useState<Address[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form edit
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/customers');
      if (res.ok) {
        const data = await res.json();
        setCustomers(data.customers || []);
      } else {
        alert('Không thể tải danh sách khách hàng!');
      }
    } catch (err) {
      console.error(err);
      alert('Đã xảy ra lỗi kết nối!');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleOpenDetail = async (customer: Customer) => {
    setSelectedCustomer(customer);
    setFormData({
      name: customer.name || '',
      email: customer.email || '',
      phone: customer.phone || '',
    });
    setIsModalOpen(true);
    setLoadingDetail(true);

    try {
      const res = await fetch(`/api/admin/customers?id=${customer.id}`);
      if (res.ok) {
        const data = await res.json();
        setCustomerAddresses(data.addresses || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleUpdateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/customers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedCustomer.id, ...formData }),
      });

      if (res.ok) {
        alert('Cập nhật thông tin khách hàng thành công!');
        setIsModalOpen(false);
        fetchCustomers();
      } else {
        const err = await res.json();
        alert(err.error || 'Cập nhật thất bại!');
      }
    } catch (err) {
      console.error(err);
      alert('Lỗi kết nối máy chủ!');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa khách hàng này không?')) return;

    try {
      const res = await fetch(`/api/admin/customers?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setCustomers((prev) => prev.filter((item) => item.id !== id));
        alert('Đã xóa khách hàng!');
      } else {
        alert('Xóa thất bại!');
      }
    } catch (err) {
      console.error(err);
      alert('Lỗi kết nối!');
    }
  };

  const filteredCustomers = customers.filter(
    (c) =>
      c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone?.includes(searchTerm) ||
      c.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-neutral-950 p-3 sm:p-6 text-white">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">👥 Quản lý khách hàng</h1>
            <p className="text-xs sm:text-sm text-neutral-400">Danh sách tài khoản và địa chỉ giao hàng</p>
          </div>
          <button
            onClick={fetchCustomers}
            className="w-fit rounded-lg bg-neutral-800 px-3 py-2 text-xs font-medium text-white transition hover:bg-neutral-700 active:scale-95"
          >
            🔄 Tải lại dữ liệu
          </button>
        </div>

        {/* Tìm kiếm */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Tìm theo tên, số điện thoại, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-white placeholder-neutral-500 focus:border-amber-500 focus:outline-none"
          />
        </div>

        {/* Danh sách */}
        {loading ? (
          <div className="py-20 text-center text-sm text-neutral-400">Đang tải dữ liệu khách hàng...</div>
        ) : filteredCustomers.length === 0 ? (
          <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-8 text-center text-sm text-neutral-400">
            Không tìm thấy khách hàng nào!
          </div>
        ) : (
          <>
            {/* MOBILE VIEW: CARDS */}
            <div className="grid grid-cols-1 gap-3 md:hidden">
              {filteredCustomers.map((c) => (
                <div key={c.id} className="flex flex-col gap-2 rounded-xl border border-neutral-800 bg-neutral-900 p-3">
                  <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                    <div>
                      <p className="font-semibold text-white text-sm">{c.name || 'Chưa đặt tên'}</p>
                      <p className="font-mono text-[11px] text-amber-400">{c.phone || 'Chưa có SĐT'}</p>
                    </div>
                    <span className="text-[10px] text-neutral-500">
                      {new Date(c.created_at).toLocaleDateString('vi-VN')}
                    </span>
                  </div>

                  <div className="text-xs text-neutral-400 space-y-1">
                    <p>📧 <span className="text-neutral-300">{c.email || 'N/A'}</span></p>
                    <p>📍 <span className="text-neutral-300">{c.address_line ? `${c.address_line}, ${c.city}` : 'Chưa thiết lập địa chỉ'}</span></p>
                  </div>

                  <div className="flex justify-end gap-2 border-t border-neutral-800/60 pt-2">
                    <button
                      onClick={() => handleOpenDetail(c)}
                      className="rounded bg-blue-500/10 px-3 py-1.5 text-xs font-semibold text-blue-400 active:bg-blue-500/30"
                    >
                      Chi tiết & Sửa
                    </button>
                    <button
                      onClick={() => handleDelete(c.id)}
                      className="rounded bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-400 active:bg-red-500/30"
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* DESKTOP VIEW: TABLE */}
            <div className="hidden overflow-x-auto rounded-xl border border-neutral-800 bg-neutral-900 md:block">
              <table className="w-full text-left text-sm text-neutral-300">
                <thead className="border-b border-neutral-800 bg-neutral-950/50 text-xs uppercase text-neutral-400">
                  <tr>
                    <th className="p-4">Tên khách hàng</th>
                    <th className="p-4">Số điện thoại</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Địa chỉ mặc định</th>
                    <th className="p-4">Ngày tạo</th>
                    <th className="p-4 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800">
                  {filteredCustomers.map((c) => (
                    <tr key={c.id} className="transition hover:bg-neutral-800/50">
                      <td className="p-4 font-semibold text-white">{c.name || 'N/A'}</td>
                      <td className="p-4 font-mono text-amber-400">{c.phone || 'N/A'}</td>
                      <td className="p-4 text-neutral-400">{c.email || 'N/A'}</td>
                      <td className="p-4 text-xs text-neutral-400">
                        {c.address_line ? `${c.address_line}, ${c.city}` : 'Chưa có'}
                      </td>
                      <td className="p-4 text-xs text-neutral-500">
                        {new Date(c.created_at).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleOpenDetail(c)}
                            className="rounded bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-400 hover:bg-blue-500/20"
                          >
                            Chi tiết
                          </button>
                          <button
                            onClick={() => handleDelete(c.id)}
                            className="rounded bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-400 hover:bg-red-500/20"
                          >
                            Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* MODAL CHI TIẾT & SỬA KHÁCH HÀNG */}
        {isModalOpen && selectedCustomer && (
          <div className="fixed inset-0 z-[9999] flex items-start sm:items-center justify-center bg-black/80 p-2 sm:p-4 pt-12 sm:pt-4 backdrop-blur-sm">
            <div className="max-h-[85dvh] sm:max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-neutral-800 bg-neutral-900 text-white shadow-2xl">
              
              <div className="sticky top-0 z-20 flex items-center justify-between border-b border-neutral-800 bg-neutral-900 px-4 py-3">
                <h2 className="text-base font-bold text-amber-400 truncate">
                  Chi tiết khách hàng #{selectedCustomer.id}
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="flex h-7 w-7 items-center justify-center rounded-lg bg-neutral-800 text-neutral-400 hover:bg-neutral-700"
                >
                  ✕
                </button>
              </div>

              <div className="p-4 sm:p-6 space-y-6 text-sm">
                {/* FORM CẬP NHẬT */}
                <form onSubmit={handleUpdateCustomer} className="space-y-3">
                  <h3 className="font-semibold text-amber-500 border-b border-neutral-800 pb-1">1. Thông tin tài khoản</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1 block text-xs text-neutral-400">Họ và tên</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs text-neutral-400">Số điện thoại</label>
                      <input
                        type="text"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-neutral-400">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="rounded bg-amber-500 px-4 py-1.5 text-xs font-semibold text-black hover:bg-amber-400 disabled:opacity-50"
                    >
                      {submitting ? 'Đang lưu...' : 'Lưu cập nhật'}
                    </button>
                  </div>
                </form>

                {/* DANH SÁCH ĐỊA CHỈ */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-amber-500 border-b border-neutral-800 pb-1">
                    2. Danh sách địa chỉ nhận hàng ({customerAddresses.length})
                  </h3>

                  {loadingDetail ? (
                    <p className="text-xs text-neutral-500">Đang tải danh sách địa chỉ...</p>
                  ) : customerAddresses.length === 0 ? (
                    <p className="text-xs text-neutral-500">Chưa có địa chỉ nào được lưu.</p>
                  ) : (
                    <div className="space-y-2">
                      {customerAddresses.map((addr) => (
                        <div
                          key={addr.id}
                          className="rounded-lg border border-neutral-800 bg-neutral-950 p-3 text-xs space-y-1"
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-semibold text-white">{addr.full_name} ({addr.phone})</span>
                            {addr.is_default === 1 && (
                              <span className="rounded bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-400">
                                Mặc định
                              </span>
                            )}
                          </div>
                          <p className="text-neutral-400">{addr.address_line}, {addr.city}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}