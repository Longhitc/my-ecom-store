'use client';

import { useEffect, useState } from 'react';

interface Variant {
  id: string;
  name: string;
  price: number;
  stock: number;
  discount_type?: 'percent' | 'amount';
  discount_value?: number;
  promo_price?: number;
}

interface ProductItem {
  id: string;
  name: string;
  code: string;
  image: string;
  price: number;
  stock: number;
  variants: Variant[];
  discount_type: 'percent' | 'amount';
  discount_value: number;
  promo_price: number;
}

export default function PromotionsPage() {
  const [promoName, setPromoName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [selectedProducts, setSelectedProducts] = useState<ProductItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalProducts, setModalProducts] = useState<ProductItem[]>([]);
  
  const [modalConfigs, setModalConfigs] = useState<Record<string, {
    product: ProductItem;
    isChecked: boolean;
    discount_type: 'percent' | 'amount';
    discount_value: number;
  }>>({});
  
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

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

  const handleOpenModal = () => {
    const initialMap: Record<string, any> = {};
    selectedProducts.forEach(p => {
      initialMap[p.id] = {
        product: p,
        isChecked: true,
        discount_type: p.discount_type || 'percent',
        discount_value: p.discount_value || 0,
      };
    });
    setModalConfigs(initialMap);
    setIsModalOpen(true);
  };

  const handleModalConfigChange = (prod: ProductItem, field: string, value: any) => {
    setModalConfigs((prev) => {
      const current = prev[prod.id] || {
        product: prod,
        isChecked: false,
        discount_type: 'percent',
        discount_value: 0,
      };
      return {
        ...prev,
        [prod.id]: {
          ...current,
          product: prod,
          [field]: value,
        },
      };
    });
  };

  const handleApplySelectedProducts = () => {
    const newSelected: ProductItem[] = [];

    Object.values(modalConfigs).forEach((config) => {
      if (config.isChecked) {
        const prod = config.product;
        const dtype = config.discount_type || 'percent';
        const dval = Number(config.discount_value) || 0;
        const basePrice = prod.price || 0;

        let finalPrice = basePrice;
        if (dtype === 'percent') {
          finalPrice = basePrice * (1 - dval / 100);
        } else {
          finalPrice = basePrice - dval;
        }

        const initializedVariants = (prod.variants || []).map((v) => {
          const vPrice = v.price || 0;
          let vFinal = vPrice;
          if (dtype === 'percent') {
            vFinal = vPrice * (1 - dval / 100);
          } else {
            vFinal = vPrice - dval;
          }
          return {
            ...v,
            discount_type: dtype,
            discount_value: dval,
            promo_price: Math.max(0, vFinal),
          };
        });

        newSelected.push({
          ...prod,
          discount_type: dtype,
          discount_value: dval,
          promo_price: Math.max(0, finalPrice),
          variants: initializedVariants,
        });
      }
    });

    setSelectedProducts(newSelected);
    setIsModalOpen(false);
  };

  const updateProductDiscount = (index: number, field: 'discount_type' | 'discount_value', value: any) => {
    setSelectedProducts((prev) => {
      const copy = [...prev];
      const item = { ...copy[index] };

      if (field === 'discount_type') item.discount_type = value;
      if (field === 'discount_value') item.discount_value = Number(value);

      const basePrice = item.price || 0;
      let finalPrice = basePrice;
      if (item.discount_type === 'percent') {
        finalPrice = basePrice * (1 - (item.discount_value || 0) / 100);
      } else {
        finalPrice = basePrice - (item.discount_value || 0);
      }
      item.promo_price = Math.max(0, finalPrice);

      item.variants = (item.variants || []).map((v) => {
        const vPrice = v.price || 0;
        let vFinal = vPrice;
        if (item.discount_type === 'percent') {
          vFinal = vPrice * (1 - (item.discount_value || 0) / 100);
        } else {
          vFinal = vPrice - (item.discount_value || 0);
        }
        return {
          ...v,
          discount_type: item.discount_type,
          discount_value: item.discount_value,
          promo_price: Math.max(0, vFinal),
        };
      });

      copy[index] = item as ProductItem;
      return copy;
    });
  };

  const updateVariantDiscount = (prodIndex: number, varIndex: number, value: any) => {
    setSelectedProducts((prev) => {
      const copy = [...prev];
      const item = { ...copy[prodIndex] };
      const variants = [...(item.variants || [])];
      
      const targetVariant = variants[varIndex];
      const v: Variant = {
        id: targetVariant?.id || '',
        name: targetVariant?.name || '',
        price: targetVariant?.price || 0,
        stock: targetVariant?.stock || 0,
        discount_type: targetVariant?.discount_type,
        discount_value: Number(value),
        promo_price: targetVariant?.promo_price,
      };

      const vPrice = v.price || 0;
      let vFinal = vPrice;
      if (v.discount_type === 'percent') {
        vFinal = vPrice * (1 - (v.discount_value || 0) / 100);
      } else {
        vFinal = vPrice - (v.discount_value || 0);
      }
      v.promo_price = Math.max(0, vFinal);

      variants[varIndex] = v;
      item.variants = variants;
      copy[prodIndex] = item as ProductItem;
      return copy;
    });
  };

  const handleSavePromotion = async () => {
    if (!promoName || !startDate || !endDate) {
      alert('Vui lòng nhập đầy đủ tên chương trình và thời gian!');
      return;
    }

    if (selectedProducts.length === 0) {
      alert('Vui lòng chọn sản phẩm và áp dụng khuyến mãi!');
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
        alert(data.message || 'Đã lưu chương trình khuyến mãi thành công!');
        setPromoName('');
        setStartDate('');
        setEndDate('');
        setSelectedProducts([]);
      } else {
        alert(data.error || 'Có lỗi xảy ra.');
      }
    } catch (error) {
      console.error('Lỗi lưu:', error);
      alert('Lỗi kết nối server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-3 sm:p-6 max-w-7xl mx-auto space-y-4 sm:space-y-6 text-sm">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h1 className="text-lg sm:text-xl font-bold">Quản Lý Chương Trình Khuyến Mãi</h1>
        <button
          onClick={handleSavePromotion}
          disabled={isSubmitting}
          className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded font-semibold text-xs shadow disabled:opacity-50 cursor-pointer"
        >
          {isSubmitting ? 'Đang lưu...' : '💾 Lưu Chương Trình Khuyến Mãi'}
        </button>
      </div>

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

      <div className="bg-white dark:bg-neutral-900 p-4 rounded-lg shadow border border-neutral-200 dark:border-neutral-800 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-sm font-bold">Sản phẩm áp dụng ({selectedProducts.length})</h2>
          <button
            onClick={handleOpenModal}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-2 rounded font-medium cursor-pointer"
          >
            + Chọn & Cài đặt sản phẩm
          </button>
        </div>

        {selectedProducts.length === 0 ? (
          <div className="text-center py-8 text-neutral-400 text-xs border border-dashed rounded-lg dark:border-neutral-800">
            Chưa có sản phẩm nào. Bấm nút "+ Chọn & Cài đặt sản phẩm" để bắt đầu.
          </div>
        ) : (
          <div className="space-y-4">
            {selectedProducts.map((prod, prodIdx) => (
              <div key={prod.id} className="p-3.5 border dark:border-neutral-800 rounded-lg bg-neutral-50 dark:bg-neutral-800/40 space-y-3">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b pb-3 dark:border-neutral-700/60">
                  <div className="flex items-center gap-3">
                    <img src={prod.image || '/placeholder.png'} className="w-12 h-12 object-cover rounded border shrink-0" />
                    <div>
                      <div className="font-bold text-neutral-800 dark:text-white text-xs sm:text-sm">{prod.name}</div>
                      <div className="text-[10px] text-neutral-400">Mã: {prod.code || 'N/A'} | Giá gốc: {(prod.price || 0).toLocaleString('vi-VN')} đ</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                    <div className="flex items-center gap-1.5">
                      <select
                        value={prod.discount_type}
                        onChange={(e) => updateProductDiscount(prodIdx, 'discount_type', e.target.value)}
                        className="border dark:border-neutral-700 rounded px-2 py-1 text-xs bg-white dark:bg-neutral-900"
                      >
                        <option value="percent">Giảm %</option>
                        <option value="amount">Giảm VNĐ</option>
                      </select>
                      <input
                        type="number"
                        value={prod.discount_value}
                        onChange={(e) => updateProductDiscount(prodIdx, 'discount_value', e.target.value)}
                        className="w-24 border dark:border-neutral-700 rounded px-2 py-1 text-xs bg-white dark:bg-neutral-900 font-semibold text-blue-600"
                      />
                    </div>
                    <button
                      onClick={() => setSelectedProducts(selectedProducts.filter((_, i) => i !== prodIdx))}
                      className="text-red-500 hover:underline text-xs px-2 py-1 cursor-pointer font-medium"
                    >
                      Xóa
                    </button>
                  </div>
                </div>

                {prod.variants && prod.variants.length > 0 && (
                  <div className="space-y-2 pl-0 sm:pl-14">
                    <div className="text-[11px] font-semibold text-neutral-500">Chi tiết biến thể:</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {prod.variants.map((v, varIdx) => (
                        <div key={v.id} className="p-2 rounded border dark:border-neutral-700/60 bg-white dark:bg-neutral-900/60 flex items-center justify-between gap-2 text-xs">
                          <div className="truncate">
                            <div className="font-medium truncate">{v.name}</div>
                            <div className="text-[10px] text-neutral-400">Gốc: {(v.price || 0).toLocaleString('vi-VN')} đ</div>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <input
                              type="number"
                              value={v.discount_value || 0}
                              onChange={(e) => updateVariantDiscount(prodIdx, varIdx, e.target.value)}
                              className="w-16 border dark:border-neutral-700 rounded px-1.5 py-0.5 text-xs bg-transparent text-right"
                            />
                            <span className="font-bold text-red-600 w-20 text-right truncate">
                              {(v.promo_price || 0).toLocaleString('vi-VN')} đ
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[999] bg-black/50 flex items-center justify-center p-2 sm:p-4">
          <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-xl w-full max-w-4xl flex flex-col max-h-[90vh] border border-neutral-200 dark:border-neutral-800">
            <div className="p-4 border-b dark:border-neutral-800 flex justify-between items-center">
              <h3 className="font-bold text-sm">Chọn sản phẩm và cấu hình mức giảm giá</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-lg font-bold cursor-pointer px-2">&times;</button>
            </div>

            <form onSubmit={handleSearch} className="p-3 sm:p-4 border-b dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/50 flex gap-2">
              <input
                type="text"
                placeholder="Tìm theo tên hoặc mã sản phẩm..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="flex-1 border dark:border-neutral-700 rounded px-3 py-1.5 text-xs bg-white dark:bg-neutral-900"
              />
              <button type="submit" className="bg-neutral-800 text-white px-4 py-1.5 rounded text-xs cursor-pointer shrink-0">
                Tìm kiếm
              </button>
            </form>

            <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2.5">
              {isLoading ? (
                <div className="text-center py-10 text-xs text-neutral-400">Đang tải sản phẩm...</div>
              ) : modalProducts.length === 0 ? (
                <div className="text-center py-10 text-xs text-neutral-400">Không tìm thấy sản phẩm phù hợp.</div>
              ) : (
                modalProducts.map((prod) => {
                  const config = modalConfigs[prod.id] || { isChecked: false, discount_type: 'percent', discount_value: 0 };
                  return (
                    <div 
                      key={prod.id} 
                      className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 rounded-lg border gap-3 transition-colors ${
                        config.isChecked 
                          ? 'border-blue-500 bg-blue-50/40 dark:bg-blue-950/20' 
                          : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 overflow-hidden w-full sm:w-auto">
                        <input
                          type="checkbox"
                          checked={config.isChecked}
                          onChange={(e) => handleModalConfigChange(prod, 'isChecked', e.target.checked)}
                          className="cursor-pointer shrink-0 w-4 h-4"
                        />
                        <img src={prod.image || '/placeholder.png'} className="w-10 h-10 object-cover rounded border shrink-0" />
                        <div className="truncate">
                          <div className="font-medium text-neutral-800 dark:text-white text-xs truncate">{prod.name}</div>
                          <div className="text-[10px] text-neutral-400">Mã: {prod.code || 'N/A'} | Gốc: {(prod.price || 0).toLocaleString('vi-VN')} đ</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                        <select
                          value={config.discount_type}
                          onChange={(e) => handleModalConfigChange(prod, 'discount_type', e.target.value)}
                          className="border dark:border-neutral-700 rounded px-2 py-1 text-xs bg-white dark:bg-neutral-900"
                        >
                          <option value="percent">Giảm %</option>
                          <option value="amount">Giảm VNĐ</option>
                        </select>
                        <input
                          type="number"
                          value={config.discount_value}
                          onChange={(e) => handleModalConfigChange(prod, 'discount_value', e.target.value)}
                          placeholder="Nhập mức giảm"
                          className="w-28 border dark:border-neutral-700 rounded px-2 py-1 text-xs bg-white dark:bg-neutral-900 font-semibold text-blue-600 text-right"
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="p-3 sm:p-4 border-t dark:border-neutral-800 flex flex-col sm:flex-row justify-between items-center gap-3 bg-neutral-50 dark:bg-neutral-800/50">
              <div className="flex items-center gap-2 text-xs w-full sm:w-auto justify-between sm:justify-start">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="px-2.5 py-1 border dark:border-neutral-700 rounded disabled:opacity-50 cursor-pointer bg-white dark:bg-neutral-900"
                >
                  Trang trước
                </button>
                <span>Trang {page} / {totalPages || 1}</span>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-2.5 py-1 border dark:border-neutral-700 rounded disabled:opacity-50 cursor-pointer bg-white dark:bg-neutral-900"
                >
                  Trang sau
                </button>
              </div>

              <div className="flex gap-2 w-full sm:w-auto justify-end">
                <button onClick={() => setIsModalOpen(false)} className="px-3 py-1.5 border dark:border-neutral-700 rounded text-xs cursor-pointer bg-white dark:bg-neutral-900">
                  Hủy
                </button>
                <button
                  onClick={handleApplySelectedProducts}
                  className="px-5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold cursor-pointer shadow"
                >
                  🚀 Áp dụng vào danh sách
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}