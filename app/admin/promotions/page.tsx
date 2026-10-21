'use client';

import { useEffect, useState } from 'react';

interface Variant {
  id: string;
  name: string;
  price: number;
  stock: number;
}

interface ProductItem {
  id: string;
  name: string;
  code: string;
  image: string;
  price: number;
  stock: number;
  variants: Variant[];
  discount_type?: 'percent' | 'amount';
  discount_value?: number;
  promo_price?: number;
  selected_variant_id?: string;
}

export default function PromotionsPage() {
  const [promoName, setPromoName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Lưới sản phẩm đã chọn cho chương trình
  const [selectedProducts, setSelectedProducts] = useState<ProductItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State Modal chọn sản phẩm
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalProducts, setModalProducts] = useState<ProductItem[]>([]);
  const [tempSelected, setTempSelected] = useState<Record<string, ProductItem>>({});
  
  // State lọc & phân trang trong modal
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch danh sách sản phẩm trong Modal
  const fetchModalProducts = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(
        `/api/admin/products/search-for-promo?keyword=${encodeURIComponent(keyword)}&page=${page}&limit=5`
      );
      const data = await res.json();
      if (data.success) {
        setModalProducts(data.items);
        setTotalPages(data.pagination.totalPages);
      }
    } catch (error) {
      console.error('Lỗi tải sản phẩm:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isModalOpen) {
      fetchModalProducts();
    }
  }, [isModalOpen, page]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchModalProducts();
  };

  // Checkbox chọn/bỏ chọn sản phẩm trong Modal
  const toggleSelectProduct = (prod: ProductItem) => {
    setTempSelected((prev) => {
      const updated = { ...prev };
      if (updated[prod.id]) {
        delete updated[prod.id];
      } else {
        updated[prod.id] = {
          ...prod,
          discount_type: 'percent',
          discount_value: 0,
          promo_price: prod.price,
          selected_variant_id: prod.variants?.[0]?.id || undefined,
        };
      }
      return updated;
    });
  };

  // Bấm LƯU từ Modal -> Đưa vào Lưới chính
  const handleSaveSelectedProducts = () => {
    setSelectedProducts(Object.values(tempSelected));
    setIsModalOpen(false);
  };

  // Cập nhật giá trị giảm giá trên Lưới chính (Đã chuẩn hóa TypeScript 100%)
  const updateDiscount = (index: number, field: string, value: any) => {
    setSelectedProducts((prev) => {
      const copy = [...prev];
      const item: any = { ...copy[index] };

      if (field === 'discount_type') item.discount_type = value as 'percent' | 'amount';
      if (field === 'discount_value') item.discount_value = Number(value);
      if (field === 'selected_variant_id') item.selected_variant_id = value;

      // Tính lại giá sau khuyến mãi
      let finalPrice = item.price;
      if (item.discount_type === 'percent') {
        finalPrice = item.price * (1 - (item.discount_value || 0) / 100);
      } else {
        finalPrice = item.price - (item.discount_value || 0);
      }
      item.promo_price = Math.max(0, finalPrice);

      copy[index] = item;
      return copy;
    });
  };

  // Gửi dữ liệu tạo chương trình lên Backend
  const handleSavePromotion = async () => {
    if (!promoName || !startDate || !endDate) {
      alert('Vui lòng nhập đầy đủ tên chương trình và thời gian!');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/admin/promotions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: promoName,
          start_date: startDate,
          end_date: endDate,
          items: selectedProducts,
        }),
      });

      const data = await res.json();
      if (data.success) {
        alert(data.message);
        setPromoName('');
        setStartDate('');
        setEndDate('');
        setSelectedProducts([]);
      } else {
        alert(data.error || 'Có lỗi xảy ra');
      }
    } catch (error) {
      console.error('Lỗi lưu:', error);
      alert('Lỗi kết nối server');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 text-sm">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">Quản Lý Chương Trình Khuyến Mãi</h1>
        <button
          onClick={handleSavePromotion}
          disabled={isSubmitting}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-semibold text-xs shadow disabled:opacity-50 cursor-pointer"
        >
          {isSubmitting ? 'Đang lưu...' : 'Lưu Chương Trình Khuyến Mãi'}
        </button>
      </div>

      {/* 1. Phần Thông tin chung */}
      <div className="bg-white dark:bg-neutral-900 p-4 rounded-lg shadow border border-neutral-200 dark:border-neutral-800 space-y-4">
        <div>
          <label className="block text-xs font-semibold mb-1">Tên chương trình khuyến mãi</label>
          <input
            type="text"
            value={promoName}
            onChange={(e) => setPromoName(e.target.value)}
            placeholder="Ví dụ: Flash Sale Giữa Tháng 11"
            className="w-full border dark:border-neutral-700 rounded px-3 py-2 text-xs bg-transparent"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold mb-1">Thời gian bắt đầu</label>
            <input
              type="datetime-local"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full border dark:border-neutral-700 rounded px-3 py-2 text-xs bg-transparent"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Thời gian kết thúc</label>
            <input
              type="datetime-local"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full border dark:border-neutral-700 rounded px-3 py-2 text-xs bg-transparent"
            />
          </div>
        </div>
      </div>

      {/* 2. Phần Lưới Danh sách sản phẩm tham gia */}
      <div className="bg-white dark:bg-neutral-900 p-4 rounded-lg shadow border border-neutral-200 dark:border-neutral-800 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-sm font-bold">Sản phẩm áp dụng ({selectedProducts.length})</h2>
          <button
            onClick={() => {
              setTempSelected(
                selectedProducts.reduce((acc, p) => ({ ...acc, [p.id]: p }), {})
              );
              setIsModalOpen(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-2 rounded font-medium cursor-pointer"
          >
            + Thêm sản phẩm
          </button>
        </div>

        {/* Bảng danh sách sản phẩm trong lưới */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
                <th className="p-2.5">Sản phẩm</th>
                <th className="p-2.5">Biến thể (Size/Màu)</th>
                <th className="p-2.5">Giá bán gốc</th>
                <th className="p-2.5">Loại giảm</th>
                <th className="p-2.5">Mức giảm</th>
                <th className="p-2.5">Giá sau KM</th>
                <th className="p-2.5 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {selectedProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-neutral-400">
                    Chưa có sản phẩm nào được chọn. Bấm nút "+ Thêm sản phẩm" ở trên để chọn.
                  </td>
                </tr>
              ) : (
                selectedProducts.map((prod, idx) => (
                  <tr key={prod.id} className="border-b dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                    <td className="p-2.5 flex items-center gap-2">
                      <img src={prod.image || '/placeholder.png'} className="w-10 h-10 object-cover rounded border" />
                      <div>
                        <div className="font-semibold text-neutral-800 dark:text-white">{prod.name}</div>
                        <div className="text-[10px] text-neutral-400">Mã: {prod.code || 'N/A'}</div>
                      </div>
                    </td>
                    <td className="p-2.5">
                      {prod.variants.length > 0 ? (
                        <select
                          value={prod.selected_variant_id || ''}
                          onChange={(e) => updateDiscount(idx, 'selected_variant_id', e.target.value)}
                          className="border dark:border-neutral-700 rounded px-1.5 py-1 text-xs bg-transparent"
                        >
                          {prod.variants.map((v) => (
                            <option key={v.id} value={v.id} className="dark:bg-neutral-900">
                              {v.name} (Kho: {v.stock})
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className="text-neutral-400">Mặc định</span>
                      )}
                    </td>
                    <td className="p-2.5 font-medium">{prod.price.toLocaleString('vi-VN')} đ</td>
                    <td className="p-2.5">
                      <select
                        value={prod.discount_type || 'percent'}
                        onChange={(e) => updateDiscount(idx, 'discount_type', e.target.value)}
                        className="border dark:border-neutral-700 rounded px-1.5 py-1 text-xs bg-transparent"
                      >
                        <option value="percent" className="dark:bg-neutral-900">Giảm theo %</option>
                        <option value="amount" className="dark:bg-neutral-900">Giảm VNĐ</option>
                      </select>
                    </td>
                    <td className="p-2.5">
                      <input
                        type="number"
                        value={prod.discount_value || 0}
                        onChange={(e) => updateDiscount(idx, 'discount_value', e.target.value)}
                        className="w-20 border dark:border-neutral-700 rounded px-2 py-1 text-xs bg-transparent"
                      />
                    </td>
                    <td className="p-2.5 font-bold text-red-600">
                      {prod.promo_price?.toLocaleString('vi-VN')} đ
                    </td>
                    <td className="p-2.5 text-center">
                      <button
                        onClick={() => setSelectedProducts(selectedProducts.filter((_, i) => i !== idx))}
                        className="text-red-500 hover:underline text-xs cursor-pointer"
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. MODAL CHỌN SẢN PHẨM PHÂN TRANG */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[999] bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-xl w-full max-w-3xl flex flex-col max-h-[85vh] border border-neutral-200 dark:border-neutral-800">
            {/* Header Modal */}
            <div className="p-4 border-b dark:border-neutral-800 flex justify-between items-center">
              <h3 className="font-bold text-sm">Chọn sản phẩm tham gia khuyến mãi</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-lg font-bold cursor-pointer">&times;</button>
            </div>

            {/* Bộ lọc tìm kiếm */}
            <form onSubmit={handleSearch} className="p-4 border-b dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/50 flex gap-2">
              <input
                type="text"
                placeholder="Tìm theo tên hoặc mã sản phẩm..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="flex-1 border dark:border-neutral-700 rounded px-3 py-1.5 text-xs bg-white dark:bg-neutral-900"
              />
              <button type="submit" className="bg-neutral-800 text-white px-4 py-1.5 rounded text-xs cursor-pointer">
                Tìm kiếm
              </button>
            </form>

            {/* Danh sách sản phẩm dạng bảng */}
            <div className="flex-1 overflow-y-auto p-4">
              {isLoading ? (
                <div className="text-center py-10 text-xs text-neutral-400">Đang tải sản phẩm...</div>
              ) : (
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b dark:border-neutral-800 text-neutral-500">
                      <th className="p-2 w-10 text-center">Chọn</th>
                      <th className="p-2">Sản phẩm</th>
                      <th className="p-2">Giá bán</th>
                      <th className="p-2">Tồn kho</th>
                    </tr>
                  </thead>
                  <tbody>
                    {modalProducts.map((prod) => {
                      const isChecked = !!tempSelected[prod.id];
                      return (
                        <tr key={prod.id} className="border-b dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                          <td className="p-2 text-center">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleSelectProduct(prod)}
                              className="cursor-pointer"
                            />
                          </td>
                          <td className="p-2 flex items-center gap-2">
                            <img src={prod.image || '/placeholder.png'} className="w-8 h-8 object-cover rounded border" />
                            <div>
                              <div className="font-medium text-neutral-800 dark:text-white">{prod.name}</div>
                              <div className="text-[10px] text-neutral-400">{prod.code}</div>
                            </div>
                          </td>
                          <td className="p-2 font-medium">{prod.price?.toLocaleString('vi-VN')} đ</td>
                          <td className="p-2">{prod.stock}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            {/* Phân trang & Footer Modal */}
            <div className="p-4 border-t dark:border-neutral-800 flex justify-between items-center bg-neutral-50 dark:bg-neutral-800/50">
              <div className="flex items-center gap-2 text-xs">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="px-2 py-1 border dark:border-neutral-700 rounded disabled:opacity-50 cursor-pointer"
                >
                  Trang trước
                </button>
                <span>Trang {page} / {totalPages || 1}</span>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-2 py-1 border dark:border-neutral-700 rounded disabled:opacity-50 cursor-pointer"
                >
                  Trang sau
                </button>
              </div>

              <div className="flex gap-2">
                <button onClick={() => setIsModalOpen(false)} className="px-3 py-1.5 border dark:border-neutral-700 rounded text-xs cursor-pointer">
                  Hủy
                </button>
                <button
                  onClick={handleSaveSelectedProducts}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold cursor-pointer"
                >
                  Lưu ({Object.keys(tempSelected).length})
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}