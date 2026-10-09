'use client';

import { useAuth } from 'context/auth-context';
import { useCart } from 'context/CartContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface Address {
  id: string;
  customer_id: string;
  full_name: string;
  phone: string;
  address_line: string;
  city: string;
  is_default: number;
}

export default function CheckoutPage() {
  const { customer } = useAuth();
  const { cartItems, clearCart } = useCart();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Danh sách địa chỉ & địa chỉ đang chọn
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');

  // Chế độ hiển thị: 'view' (danh sách), 'add' (thêm mới), 'edit' (sửa)
  const [mode, setMode] = useState<'view' | 'add' | 'edit'>('view');
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);

  // Form State địa chỉ
  const [addressForm, setAddressForm] = useState({
    fullName: '',
    phone: '',
    addressLine: '',
    city: '',
  });

  // 1. Tải danh sách địa chỉ giao hàng
  useEffect(() => {
    if (!customer?.id) {
      router.push('/login');
      return;
    }

    async function fetchAddresses() {
      try {
        const res = await fetch(`/api/address?userId=${customer?.id}`);
        if (res.ok) {
          const data = await res.json();
          const addressList: Address[] = data.addresses || [];

          setAddresses(addressList);

          if (addressList.length > 0) {
            const defaultAddr = addressList.find((a: Address) => a.is_default === 1) || addressList[0];
            setSelectedAddressId(defaultAddr?.id || '');
            setMode('view');
          } else {
            setAddressForm({
              fullName: customer?.name || '',
              phone: customer?.phone || '',
              addressLine: '',
              city: '',
            });
            setMode('add');
          }
        } else {
          setMode('add');
        }
      } catch (err) {
        console.error('Lỗi khi tải danh sách địa chỉ:', err);
        setMode('add');
      } finally {
        setLoading(false);
      }
    }

    fetchAddresses();
  }, [customer, router]);

  // Bật Form chỉnh sửa
  const handleStartEdit = (e: React.MouseEvent, item: Address) => {
    e.stopPropagation();
    setEditingAddressId(item.id);
    setAddressForm({
      fullName: item.full_name,
      phone: item.phone,
      addressLine: item.address_line,
      city: item.city,
    });
    setMode('edit');
  };

  // 2. Xử lý Thêm mới hoặc Cập nhật địa chỉ
  const handleSaveAddress = async (e: React.FormEvent) => {
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
            ...addressForm,
          }),
        });

        const data = await res.json();
        if (res.ok && data.newAddress) {
          const createdAddr: Address = data.newAddress;
          setAddresses((prev) => [createdAddr, ...prev]);
          setSelectedAddressId(createdAddr.id);
          setMode('view');
          setAddressForm({ fullName: '', phone: '', addressLine: '', city: '' });
        } else {
          alert(data.error || 'Có lỗi xảy ra khi thêm địa chỉ');
        }
      } else if (mode === 'edit' && editingAddressId) {
        const res = await fetch('/api/address', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            addressId: editingAddressId,
            userId: customer.id,
            ...addressForm,
          }),
        });

        const data = await res.json();
        if (res.ok) {
          setAddresses((prev) =>
            prev.map((item) =>
              item.id === editingAddressId
                ? {
                    ...item,
                    full_name: addressForm.fullName,
                    phone: addressForm.phone,
                    address_line: addressForm.addressLine,
                    city: addressForm.city,
                  }
                : item
            )
          );
          setMode('view');
          setEditingAddressId(null);
          setAddressForm({ fullName: '', phone: '', addressLine: '', city: '' });
        } else {
          alert(data.error || 'Có lỗi xảy ra khi cập nhật địa chỉ');
        }
      }
    } catch (err) {
      console.error(err);
      alert('Không thể kết nối đến máy chủ.');
    } finally {
      setSaving(false);
    }
  };

  // 3. Xử lý Thiết lập Địa chỉ Mặc định
  const handleSetDefault = async (e: React.MouseEvent, addressId: string) => {
    e.stopPropagation();
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
      console.error(err);
      alert('Không thể kết nối đến máy chủ.');
    }
  };

  const activeAddress = addresses.find((a) => a.id === selectedAddressId);

  // 4. Xử lý Đặt hàng
  const handleCheckout = async () => {
    if (mode !== 'view') {
      alert('Vui lòng hoàn tất lưu địa chỉ trước khi đặt hàng!');
      return;
    }

    if (!activeAddress) {
      alert('Vui lòng chọn địa chỉ giao hàng!');
      return;
    }

    if (!cartItems || cartItems.length === 0) {
      alert('Giỏ hàng của bạn đang trống.');
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: customer?.id,
          fullName: activeAddress.full_name,
          phone: activeAddress.phone,
          addressLine: activeAddress.address_line,
          city: activeAddress.city,
          items: cartItems,
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        let errorMessage = 'Không thể tạo đơn hàng.';
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.error || errorJson.message || errorMessage;
        } catch {
          console.error('Lỗi từ Server:', errorText);
        }
        throw new Error(errorMessage);
      }

      const data = await res.json();
      clearCart();
      router.push(`/checkout/success?orderId=${data.orderId || data.id}`);
      router.refresh();
    } catch (error: any) {
      console.error('Lỗi đặt hàng:', error);
      alert(error.message || 'Đã có lỗi xảy ra trong quá trình đặt hàng. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
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
        <div className="mb-4 flex items-center justify-between border-b border-neutral-800 pb-3">
          <h2 className="text-lg font-semibold text-white">📍 Địa chỉ nhận hàng</h2>
          {addresses.length > 0 && mode === 'view' && (
            <button
              type="button"
              onClick={() => {
                setAddressForm({
                  fullName: customer?.name || '',
                  phone: customer?.phone || '',
                  addressLine: '',
                  city: '',
                });
                setMode('add');
              }}
              className="text-sm font-medium text-blue-500 hover:text-blue-400 hover:underline"
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
              className="rounded-lg border border-blue-500/30 bg-blue-500/10 px-3 py-1.5 text-xs font-medium text-blue-400 transition-colors hover:bg-blue-500/20 hover:text-blue-300"
            >
              ← Hủy / Chọn địa chỉ sẵn có
            </button>
          )}
        </div>

        {/* CHẾ ĐỘ 1: XEM & CHỌN TRONG DANH SÁCH ĐỊA CHỈ SẴN CÓ */}
        {mode === 'view' && (
          <div className="space-y-3">
            {addresses.map((item) => {
              const isSelected = item.id === selectedAddressId;
              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedAddressId(item.id)}
                  className={`flex cursor-pointer items-center justify-between rounded-lg border p-4 transition-all ${
                    isSelected
                      ? 'border-blue-500 bg-neutral-950 text-white shadow-sm'
                      : 'border-neutral-800 bg-black text-neutral-400 hover:border-neutral-700'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="selected_address"
                      checked={isSelected}
                      onChange={() => setSelectedAddressId(item.id)}
                      className="mt-1 h-4 w-4 accent-blue-600 cursor-pointer"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{item.full_name}</span>
                        <span className="text-neutral-500">|</span>
                        <span className="font-semibold text-blue-400">{item.phone}</span>
                        {item.is_default === 1 && (
                          <span className="ml-2 rounded bg-neutral-800 px-2 py-0.5 text-[10px] font-semibold text-blue-400 border border-neutral-700">
                            Mặc định
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-neutral-300">
                        {item.address_line}
                        {item.city ? `, ${item.city}` : ''}
                      </p>
                    </div>
                  </div>

                  {/* THAO TÁC: ĐẶT MẶC ĐỊNH -> SỬA (Sắp xếp theo thứ tự nhất quán) */}
                  <div className="flex items-center gap-2 shrink-0 ml-4">
                    {item.is_default !== 1 && (
                      <button
                        type="button"
                        onClick={(e) => handleSetDefault(e, item.id)}
                        className="text-xs text-neutral-300 hover:text-blue-400 border border-neutral-700 rounded px-2.5 py-1 transition-colors bg-neutral-900 hover:bg-neutral-800"
                      >
                        Thiết lập mặc định
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={(e) => handleStartEdit(e, item)}
                      className="text-xs text-blue-400 hover:underline border border-neutral-700 rounded px-2.5 py-1 bg-neutral-900 hover:bg-neutral-800"
                    >
                      Sửa
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* CHẾ ĐỘ 2 & 3: FORM THÊM MỚI HOẶC CHỈNH SỬA ĐỊA CHỈ */}
        {(mode === 'add' || mode === 'edit') && (
          <form onSubmit={handleSaveAddress} className="space-y-4">
            <h3 className="text-sm font-semibold text-neutral-300 mb-2">
              {mode === 'edit' ? '✏️ Chỉnh sửa địa chỉ' : '➕ Thêm địa chỉ mới'}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1">
                  Tên người nhận *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Nguyễn Văn A"
                  value={addressForm.fullName}
                  onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })}
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
                  value={addressForm.phone}
                  onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
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
                value={addressForm.addressLine}
                onChange={(e) => setAddressForm({ ...addressForm, addressLine: e.target.value })}
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
                value={addressForm.city}
                onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                className="w-full rounded-lg border border-neutral-700 bg-black p-3 text-sm text-white focus:border-blue-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-500"
            >
              {saving
                ? 'Đang lưu...'
                : mode === 'edit'
                ? 'Cập nhật địa chỉ'
                : 'Lưu và sử dụng địa chỉ này'}
            </button>
          </form>
        )}
      </div>
      <button
        type="button"
        onClick={handleCheckout}
        disabled={mode !== 'view' || submitting}
        className={`w-full rounded-lg py-3.5 text-center font-bold text-white transition-colors ${
          mode !== 'view' || submitting
            ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-500'
        }`}
      >
        {submitting
          ? 'Đang xử lý đặt hàng...'
          : mode !== 'view'
          ? 'Vui lòng lưu địa chỉ trước'
          : 'Xác nhận đặt hàng'}
      </button>
    </div>
  );
}