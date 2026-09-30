'use client';

import { useState } from 'react';

interface ToggleProps {
  productId: string;
  initialStatus: boolean;
}

export default function ProductStatusToggle({ productId, initialStatus }: ToggleProps) {
  const [isActive, setIsActive] = useState<boolean>(initialStatus);
  const [loading, setLoading] = useState<boolean>(false);

  const handleToggle = async () => {
    const newStatus = !isActive;
    setLoading(true);

    try {
      const res = await fetch(`/api/admin/products/${productId}/toggle`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: newStatus }),
      });

      if (res.ok) {
        setIsActive(newStatus);
      } else {
        alert('Có lỗi xảy ra khi đổi trạng thái!');
      }
    } catch (err) {
      console.error(err);
      alert('Không thể kết nối máy chủ!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
        isActive ? 'bg-green-500' : 'bg-gray-600'
      } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
      title={isActive ? 'Đang hiện (Bấm để ẩn)' : 'Đang ẩn (Bấm để hiện)'}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
          isActive ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );
}