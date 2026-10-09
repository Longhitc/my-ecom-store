'use client';

import { useEffect, useState } from 'react';

interface Address {
  id: string;
  customer_id: string;
  full_name: string;
  phone: string;
  address_line: string;
  district?: string;
  city: string;
  is_default: number;
}

export default function AddressSection() {
  const [customer, setCustomer] = useState<any>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Chế độ hiển thị: 'view' (danh sách), 'add' (thêm mới), 'edit' (sửa)
  const [mode, setMode] = useState<'view' | 'add' | 'edit'>('view');
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);

  // Form State địa chỉ
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    addressLine: '',
    district: '',
    city: '',
  });

  // 1. Lấy thông tin customer đăng nhập
  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.customer) {
          setCustomer(data.customer);
        } else {
          setLoading(false);
        }
      })
      .catch(() => setLoading(false));
  }, []);

  // 2. Tải danh sách địa chỉ từ API
  useEffect(() => {
    if (!customer?.id) return;

    async function fetchAddresses() {
      try {
        const res = await fetch(`/api/address?userId=${customer.id}`);
        if (res.ok) {
          const data = await res.json();
          const addressList: Address[] = data.addresses || [];
          setAddresses(addressList);
          setMode(addressList.length > 0 ? 'view' : 'add');
        } else {
          setMode('add');
        }
      } catch (err) {
        console.error('Lỗi khi tải địa chỉ:', err);
        setMode('add');
      } finally {
        setLoading(false);
      }
    }

    fetchAddresses();
  }, [customer]);

  // Bật Form chỉnh sửa địa chỉ
  const handleStartEdit = (item: Address) => {
    setEditingAddressId(item.id);
    setFormData({
      fullName: item.full_name || '',
      phone: item.phone || '',
      addressLine: item.address_line || '',
      district: item.district || '',
      city: item.city || '',
    });
    setMode('edit');
  };

  // 3. Xử lý Thêm mới hoặc Cập nhật địa chỉ
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer?.id) return;

    setSaving(true);
    try {
      if (mode === 'add') {
        const res = await fetch('/api/address', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: customer.id,
            ...formData,
          }),
        });

        const data = await res.json();
        if (res.ok && data.newAddress) {
          const createdAddr: Address = data.newAddress;
          setAddresses((prev) => [createdAddr, ...prev]);
          setMode('view');
          setFormData({ fullName: '', phone: '', addressLine: '', district: '', city: '' });
        } else {
          alert(data.error || 'Thêm địa chỉ thất bại');
        }
      } else if (mode === 'edit' && editingAddressId) {
        const res = await fetch('/api/address', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            addressId: editingAddressId,
            userId: customer.id,
            ...formData,
          }),
        });

        const data = await res.json();
        if (res.ok) {
          setAddresses((prev) =>
            prev.map((item) =>
              item.id === editingAddressId
                ? {
                    ...item,
                    full_name: formData.fullName,
                    phone: formData.phone,
                    address_line: formData.addressLine,
                    district: formData.district,
                    city: formData.city,
                  }
                : item
            )
          );
          setMode('view');
          setEditingAddressId(null);
          setFormData({ fullName: '', phone: '', addressLine: '', district: '', city: '' });
        } else {
          alert(data.error || 'Lưu địa chỉ thất bại');
        }
      }
    } catch (err) {
      alert('Lỗi kết nối máy chủ');
    } finally {
      setSaving(false);
    }
  };

  // 4. Xử lý Thiết lập Địa chỉ Mặc định
  const handleSetDefault = async (addressId: string) => {
    if (!customer?.id) return;

    try {
      const res = await fetch('/api/address', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: customer.id,
          addressId: addressId,
        }),
      });

      if (res.ok) {
        setAddresses((prev) =>
          prev.map((item) => ({
            ...item,
            is_default: item.id === addressId ? 1 : 0,
          }))
        );
      } else {
        const data = await res.json();
        alert(data.error || 'Có lỗi xảy ra khi cài đặt mặc định');
      }
    } catch (err) {
      alert('Không thể kết nối đến máy chủ.');
    }
  };

  // 5. Xử lý Xóa Địa chỉ
  const handleDeleteAddress = async (addressId: string) => {
    if (!customer?.id) return;
    if (!confirm('Bạn có chắc chắn muốn xóa địa chỉ này?')) return;

    try {
      const res = await fetch(`/api/address?addressId=${addressId}&userId=${customer.id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        const updatedList = addresses.filter((a) => a.id !== addressId);
        setAddresses(updatedList);
        if (updatedList.length === 0) {
          setMode('add');
        }
      } else {
        const data = await res.json();
        alert(data.error || 'Không thể xóa địa chỉ.');
      }
    } catch (err) {
      alert('Không thể kết nối đến máy chủ.');
    }
  };

  if (loading) {
    return <p className="text-gray-500 dark:text-neutral-400 text-sm py-4">Đang tải danh sách địa chỉ...</p>;
  }

  return (
    <div className="bg-white dark:bg-neutral-900/40 rounded-xl p-5 border border-gray-200 dark:border-neutral-800 shadow-sm transition-colors">
      {/* HEADER SECTION */}
      <div className="flex items-center justify-between mb-5 border-b border-gray-200 dark:border-neutral-800 pb-3">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Địa chỉ nhận hàng</h2>

        {addresses.length > 0 && mode === 'view' && (
          <button
            type="button"
            onClick={() => {
              setFormData({
                fullName: customer?.name || '',
                phone: customer?.phone || '',
                addressLine: '',
                district: '',
                city: '',
              });
              setMode('add');
            }}
            className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline"
          >
            + Thêm địa chỉ mới
          </button>
        )}

        {mode !== 'view' && addresses.length > 0 && (
          <button
            type="button"
            onClick={() => {
              setMode('view');
              setEditingAddressId(null);
            }}
            className="rounded-lg border border-blue-200 dark:border-blue-500/30 bg-blue-50 dark:bg-blue-500/10 px-3 py-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 transition-colors hover:bg-blue-100 dark:hover:bg-blue-500/20"
          >
            ← Hủy / Chọn địa chỉ sẵn có
          </button>
        )}
      </div>

      {/* CHẾ ĐỘ 1: HIỂN THỊ DANH SÁCH ĐỊA CHỈ SẴN CÓ */}
      {mode === 'view' && (
        <div className="space-y-3">
          {addresses.map((item) => (
            <div
              key={item.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between rounded-lg border border-gray-200 dark:border-neutral-800 bg-gray-50/50 dark:bg-black/50 p-4 text-sm text-gray-700 dark:text-neutral-300 gap-3 hover:border-gray-300 dark:hover:border-neutral-700 transition-all shadow-xs"
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-gray-900 dark:text-white">{item.full_name}</span>
                  <span className="text-gray-300 dark:text-neutral-600">|</span>
                  <span className="font-semibold text-blue-600 dark:text-blue-400">{item.phone}</span>
                  {item.is_default === 1 && (
                    <span className="ml-2 rounded-full bg-blue-100 dark:bg-neutral-800 px-2.5 py-0.5 text-[10px] font-bold text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-neutral-700">
                      Mặc định
                    </span>
                  )}
                </div>
                <p className="text-gray-600 dark:text-neutral-300 text-xs sm:text-sm">
                  {item.address_line}
                  {item.district ? `, ${item.district}` : ''}
                  {item.city ? `, ${item.city}` : ''}
                </p>
              </div>

              {/* KHỐI NÚT THAO TÁC */}
              <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
                {item.is_default !== 1 && (
                  <button
                    type="button"
                    onClick={() => handleSetDefault(item.id)}
                    className="text-xs text-gray-700 dark:text-neutral-300 font-medium hover:text-blue-600 dark:hover:text-blue-400 border border-gray-300 dark:border-neutral-700 rounded-md px-2.5 py-1 transition-colors bg-white dark:bg-neutral-900 hover:bg-gray-100 dark:hover:bg-neutral-800 shadow-2xs"
                  >
                    Thiết lập mặc định
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => handleStartEdit(item)}
                  className="text-xs text-blue-600 dark:text-blue-400 font-medium hover:underline border border-blue-200 dark:border-neutral-700 rounded-md px-2.5 py-1 bg-white dark:bg-neutral-900 hover:bg-blue-50 dark:hover:bg-neutral-800 shadow-2xs"
                >
                  Sửa
                </button>

                <button
                  type="button"
                  onClick={() => handleDeleteAddress(item.id)}
                  className="text-xs text-red-600 dark:text-red-400 font-medium hover:underline border border-red-200 dark:border-neutral-700 rounded-md px-2.5 py-1 bg-white dark:bg-neutral-900 hover:bg-red-50 dark:hover:bg-neutral-800 shadow-2xs"
                >
                  Xóa
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CHẾ ĐỘ 2 & 3: FORM THÊM MỚI / CHỈNH SỬA ĐỊA CHỈ */}
      {(mode === 'add' || mode === 'edit') && (
        <form onSubmit={handleSave} className="space-y-4 max-w-xl">
          <h3 className="text-sm font-bold text-gray-800 dark:text-neutral-200 mb-2">
            {mode === 'edit' ? '✏️ Chỉnh sửa địa chỉ' : '➕ Thêm địa chỉ mới'}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-neutral-400 mb-1">
                Tên người nhận *
              </label>
              <input
                type="text"
                required
                placeholder="Ví dụ: Võ Tuyết Vân"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full rounded-lg border border-gray-300 dark:border-neutral-800 bg-white dark:bg-black p-2.5 text-sm text-gray-900 dark:text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-neutral-400 mb-1">
                Số điện thoại người nhận *
              </label>
              <input
                type="text"
                required
                placeholder="Ví dụ: 0933552264"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full rounded-lg border border-gray-300 dark:border-neutral-800 bg-white dark:bg-black p-2.5 text-sm text-gray-900 dark:text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-neutral-400 mb-1">
              Địa chỉ chi tiết (Số nhà, tên đường, phường/xã) *
            </label>
            <input
              type="text"
              required
              placeholder="Ví dụ: 112h3 Chu Văn An, P. Bình Thạnh"
              value={formData.addressLine}
              onChange={(e) => setFormData({ ...formData, addressLine: e.target.value })}
              className="w-full rounded-lg border border-gray-300 dark:border-neutral-800 bg-white dark:bg-black p-2.5 text-sm text-gray-900 dark:text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-neutral-400 mb-1">
                Quận / Huyện
              </label>
              <input
                type="text"
                placeholder="Ví dụ: Bình Thạnh"
                value={formData.district}
                onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                className="w-full rounded-lg border border-gray-300 dark:border-neutral-800 bg-white dark:bg-black p-2.5 text-sm text-gray-900 dark:text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-neutral-400 mb-1">
                Tỉnh / Thành phố *
              </label>
              <input
                type="text"
                required
                placeholder="Ví dụ: HCM"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full rounded-lg border border-gray-300 dark:border-neutral-800 bg-white dark:bg-black p-2.5 text-sm text-gray-900 dark:text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors shadow-sm"
            >
              {saving ? 'Đang lưu...' : mode === 'edit' ? 'Cập nhật địa chỉ' : 'Lưu địa chỉ'}
            </button>

            {addresses.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setMode('view');
                  setEditingAddressId(null);
                }}
                className="rounded-lg border border-gray-300 dark:border-neutral-700 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-neutral-300 hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors"
              >
                Hủy
              </button>
            )}
          </div>
        </form>
      )}
    </div>
  );
}