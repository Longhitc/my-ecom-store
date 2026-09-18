'use client';

import { clearCartAction } from 'components/cart/actions';
import { useAuth } from 'context/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function CheckoutPage() {
  const { customer } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Form State chỉ gồm các trường có trong DB: fullName, phone, addressLine, city
  const [addressData, setAddressData] = useState({
    fullName: '',
    phone: '',
    addressLine: '',
    city: '',
  });

  // 1. Tải thông tin địa chỉ đã lưu từ Turso
  useEffect(() => {
    if (!customer?.id) {
      router.push('/login');
      return;
    }

    async function fetchAddress() {
      try {
        const res = await fetch(`/api/address?userId=${customer?.id}`);
        const data = await res.json();

        if (data.address) {
          setAddressData({
            fullName: data.address.full_name || '',
            phone: data.address.phone || '',
            addressLine: data.address.address_line || '',
            city: data.address.city || '',
          });
          setIsEditing(false);
        } else {
          // Chưa có địa chỉ -> gợi ý từ tài khoản
          setAddressData((prev) => ({
            ...prev,
            fullName: customer?.name || '',
            phone: customer?.phone || '',
          }));
          setIsEditing(true);
        }
      } catch (err) {
        console.error('Lỗi khi tải địa chỉ:', err);
        setIsEditing(true);
      } finally {
        setLoading(false);
      }
    }

    fetchAddress();
  }, [customer, router]);

  // 2. Lưu thông tin địa chỉ mới vào Turso
  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer?.id) return;

    setSaving(true);
    try {
      const res = await fetch('/api/address', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: customer.id,
          ...addressData,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setIsEditing(false);
      } else {
        alert(data.error || 'Có lỗi xảy ra khi lưu địa chỉ');
      }
    } catch (err) {
      console.error(err);
      alert('Không thể kết nối đến máy chủ.');
    } finally {
      setSaving(false);
    }
  };

  // 3. Xử lý Đặt hàng
  const handleCheckout = async () => {
    if (isEditing) {
      alert('Vui lòng lưu địa chỉ giao hàng trước khi xác nhận đặt hàng!');
      return;
    }

    await clearCartAction();
    window.location.href = '/checkout/success';
    router.refresh();
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center text-neutral-400">
        Đang tải thông tin giao hàng...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-white">Thanh toán đơn hàng</h1>

      {/* KHỐI ĐỊA CHỈ NHẬN HÀNG */}
      <div className="mb-6 rounded-xl border border-neutral-800 bg-neutral-900/50 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">📍 Địa chỉ nhận hàng</h2>
          {!isEditing && (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="text-sm text-blue-500 hover:underline"
            >
              Thay đổi
            </button>
          )}
        </div>

        {/* Chế độ Xem: Đã lưu địa chỉ */}
        {!isEditing ? (
          <div className="rounded-lg bg-black p-4 text-sm text-neutral-300 border border-neutral-800">
            <p className="font-bold text-white">
              {addressData.fullName} - <span className="font-semibold text-blue-400">{addressData.phone}</span>
            </p>
            <p className="mt-1 text-neutral-300">
              {addressData.addressLine}{addressData.city ? `, ${addressData.city}` : ''}
            </p>
          </div>
        ) : (
          /* Chế độ Sửa / Nhập mới địa chỉ */
          <form onSubmit={handleSaveAddress} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1">
                  Tên người nhận *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Nguyễn Văn A"
                  value={addressData.fullName}
                  onChange={(e) => setAddressData({ ...addressData, fullName: e.target.value })}
                  className="w-full rounded-lg border border-neutral-700 bg-black p-3 text-sm text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1">
                  Số điện thoại người nhận *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: 0912345678"
                  value={addressData.phone}
                  onChange={(e) => setAddressData({ ...addressData, phone: e.target.value })}
                  className="w-full rounded-lg border border-neutral-700 bg-black p-3 text-sm text-white focus:border-blue-500 focus:outline-none"
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
                placeholder="Ví dụ: 123 Đường ABC, Phường 1"
                value={addressData.addressLine}
                onChange={(e) => setAddressData({ ...addressData, addressLine: e.target.value })}
                className="w-full rounded-lg border border-neutral-700 bg-black p-3 text-sm text-white focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1">
                Tỉnh / Thành phố *
              </label>
              <input
                type="text"
                required
                placeholder="Ví dụ: TP. Hồ Chí Minh"
                value={addressData.city}
                onChange={(e) => setAddressData({ ...addressData, city: e.target.value })}
                className="w-full rounded-lg border border-neutral-700 bg-black p-3 text-sm text-white focus:border-blue-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-lg bg-neutral-800 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-neutral-700"
            >
              {saving ? 'Đang lưu...' : 'Lưu địa chỉ giao hàng'}
            </button>
          </form>
        )}
      </div>

      {/* NÚT XÁC NHẬN ĐẶT HÀNG */}
      <button
        type="button"
        onClick={handleCheckout}
        disabled={isEditing}
        className={`w-full rounded-lg py-3.5 text-center font-bold text-white transition-colors ${
          isEditing
            ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-500'
        }`}
      >
        {isEditing ? 'Vui lòng lưu địa chỉ trước' : 'Xác nhận đặt hàng'}
      </button>
    </div>
  );
}