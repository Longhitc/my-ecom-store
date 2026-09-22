'use client';

import { useEffect, useState } from 'react';

export default function AddressSection() {
  const [customer, setCustomer] = useState<any>(null);
  const [address, setAddress] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    addressLine: '',
    district: '',
    city: '',
  });

  // Lấy thông tin customer đăng nhập
  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.customer) {
          setCustomer(data.customer);
        }
      });
  }, []);

  // Tải địa chỉ từ Turso Database
  useEffect(() => {
    if (!customer?.id) return;

    async function fetchAddress() {
      try {
        const res = await fetch(`/api/address?userId=${customer.id}`);
        const data = await res.json();

        if (data.address) {
          setAddress(data.address);
          setFormData({
            fullName: data.address.full_name || '',
            phone: data.address.phone || '',
            addressLine: data.address.address_line || '',
            district: data.address.district || '',
            city: data.address.city || '',
          });
        }
      } catch (err) {
        console.error('Lỗi khi tải địa chỉ:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchAddress();
  }, [customer]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer?.id) return;

    setSaving(true);
    try {
      const res = await fetch('/api/address', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: customer.id,
          ...formData,
        }),
      });

      if (res.ok) {
        setAddress({
          full_name: formData.fullName,
          phone: formData.phone,
          address_line: formData.addressLine,
          district: formData.district,
          city: formData.city,
        });
        setIsEditing(false);
      } else {
        alert('Lưu địa chỉ thất bại');
      }
    } catch (err) {
      alert('Lỗi kết nối máy chủ');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="text-neutral-400">Đang tải địa chỉ...</p>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">Địa chỉ nhận hàng</h2>
        {address && !isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="text-sm text-blue-500 hover:underline"
          >
            Chỉnh sửa
          </button>
        )}
      </div>

      {/* Đã có địa chỉ -> Lấy chính xác Tên và SĐT trong bảng Address */}
      {address && !isEditing ? (
        <div className="rounded-lg border border-neutral-800 bg-neutral-900/50 p-4 text-sm text-neutral-300">
          <p className="font-bold text-white mb-1">
            {address.full_name} - {address.phone}
          </p>
          <p>
            {address.address_line}
            {address.district ? `, ${address.district}` : ''}
            {address.city ? `, ${address.city}` : ''}
          </p>
        </div>
      ) : (
        /* Form nhập/sửa địa chỉ */
        <form onSubmit={handleSave} className="space-y-4 max-w-lg">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1">
                Tên người nhận *
              </label>
              <input
                type="text"
                required
                placeholder="Ví dụ: Võ Tuyết Vân"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full rounded-lg border border-neutral-800 bg-black p-3 text-sm text-white focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1">
                Số điện thoại người nhận *
              </label>
              <input
                type="text"
                required
                placeholder="Ví dụ: 0933552264"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full rounded-lg border border-neutral-800 bg-black p-3 text-sm text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1">
              Địa chỉ chi tiết (Số nhà, tên đường, phường/xã) *
            </label>
            <input
              type="text"
              required
              placeholder="Ví dụ: 112h3 Chu Văn An, P. Bình Thạnh"
              value={formData.addressLine}
              onChange={(e) => setFormData({ ...formData, addressLine: e.target.value })}
              className="w-full rounded-lg border border-neutral-800 bg-black p-3 text-sm text-white focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1">
                Quận / Huyện
              </label>
              <input
                type="text"
                placeholder="Ví dụ: Bình Thạnh"
                value={formData.district}
                onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                className="w-full rounded-lg border border-neutral-800 bg-black p-3 text-sm text-white focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1">
                Tỉnh / Thành phố *
              </label>
              <input
                type="text"
                required
                placeholder="Ví dụ: HCM"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full rounded-lg border border-neutral-800 bg-black p-3 text-sm text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-500 transition-colors"
            >
              {saving ? 'Đang lưu...' : 'Lưu địa chỉ'}
            </button>
            {address && (
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="rounded-lg border border-neutral-700 px-4 py-2.5 text-sm text-neutral-300 hover:bg-neutral-800"
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