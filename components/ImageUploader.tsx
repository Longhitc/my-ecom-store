'use client';

import { useState } from 'react';

interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}

export default function ImageUploader({ value, onChange, label }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'depvaxinh_preset'); // Thay bằng name preset ở Bước 1
    formData.append('cloud_name', 'dpsejpp2');

    try {
      const res = await fetch('https://api.cloudinary.com/v1_1/dpsejpp2/image/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (data.secure_url) {
        onChange(data.secure_url);
      } else {
        alert('Upload ảnh thất bại!');
      }
    } catch (error) {
      console.error(error);
      alert('Có lỗi xảy ra khi upload ảnh!');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      {label && <label className="block text-xs font-medium text-neutral-300">{label}</label>}
      <div className="flex items-center gap-3">
        {/* Xem trước ảnh */}
        {value ? (
          <img src={value} alt="Preview" className="h-12 w-12 rounded object-cover border border-neutral-700" />
        ) : (
          <div className="h-12 w-12 rounded border border-dashed border-neutral-700 flex items-center justify-center text-xs text-neutral-500">
            No img
          </div>
        )}

        {/* Ô Input file ẩn & Nút bấm đẹp */}
        <label className="cursor-pointer rounded bg-neutral-800 px-3 py-2 text-xs font-semibold text-white hover:bg-neutral-700 border border-neutral-700">
          {uploading ? 'Đang tải lên...' : '📁 Chọn ảnh tải lên'}
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={uploading}
            className="hidden"
          />
        </label>

        {/* Ô URL vẫn giữ nguyên để sửa hoặc dán link ngoài nếu muốn */}
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://res.cloudinary.com/..."
          className="flex-1 rounded border border-neutral-800 bg-neutral-950 px-3 py-2 text-xs text-white"
        />
      </div>
    </div>
  );
}