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

interface PromotionProgram {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  status: string;
  created_at: string;
  discount_summary?: string;
}

export default function PromotionsPage() {
  const [activeTab, setActiveTab] = useState<'list' | 'create'>('list');
  const [promoStatusTab, setPromoStatusTab] = useState<'active' | 'upcoming' | 'expired'>('active');

  const [promotionsList, setPromotionsList] = useState<PromotionProgram[]>([]);
  const [isFetchingList, setIsFetchingList] = useState(false);

  // State cho Modal gia hạn
  const [isExtendModalOpen, setIsExtendModalOpen] = useState(false);
  const [selectedPromo, setSelectedPromo] = useState<PromotionProgram | null>(null);
  const [newEndDate, setNewEndDate] = useState('');

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

  const formatDateTime = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  const fetchPromotionsList = async () => {
    setIsFetchingList(true);
    try {
      const res = await fetch('/api/admin/promotions', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        const rawItems = data.promotions || data || [];

        const map = new Map<string, PromotionProgram>();
        rawItems.forEach((item: any) => {
          const promoId = item.id;
          if (!map.has(promoId)) {
            map.set(promoId, {
              id: promoId,
              name: item.name,
              start_date: item.start_date,
              end_date: item.end_date,
              status: item.status,
              created_at: item.created_at,
              discount_summary: item.discount_value 
                ? (item.discount_type === 'percent' ? `Giảm ${item.discount_value}%` : `Giảm ${Number(item.discount_value).toLocaleString('vi-VN')} đ`)
                : 'N/A',
            });
          }
        });

        setPromotionsList(Array.from(map.values()));
      }
    } catch (error) {
      console.error('Lỗi tải danh sách khuyến mãi:', error);
    } finally {
      setIsFetchingList(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'list') {
      fetchPromotionsList();
    }
  }, [activeTab]);

  // Xử lý dừng chương trình ngay lập tức
  const handleStopPromotion = async (id: string) => {
    if (!confirm('Bạn có chắc muốn dừng chương trình này ngay lập tức? Sản phẩm sẽ trở về giá gốc.')) return;

    try {
      const res = await fetch('/api/admin/promotions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: 'stop' }),
      });
      const data = await res.json();
      if (data.success) {
        alert('Đã dừng chương trình thành công!');
        fetchPromotionsList();
      } else {
        alert(data.error || 'Có lỗi xảy ra.');
      }
    } catch (err) {
      console.error(err);
      alert('Lỗi kết nối server.');
    }
  };

  // Xử lý lưu gia hạn thời gian
  const handleSaveExtension = async () => {
    if (!selectedPromo || !newEndDate) {
      alert('Vui lòng chọn thời gian kết thúc mới!');
      return;
    }

    try {
      const res = await fetch('/api/admin/promotions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedPromo.id, end_date: newEndDate }),
      });
      const data = await res.json();
      if (data.success) {
        alert('Gia hạn chương trình thành công!');
        setIsExtendModalOpen(false);
        setSelectedPromo(null);
        fetchPromotionsList();
      } else {
        alert(data.error || 'Có lỗi xảy ra.');
      }
    } catch (err) {
      console.error(err);
      alert('Lỗi kết nối server.');
    }
  };

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
        setActiveTab('list');
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

  const now = new Date().getTime();
  const filteredPromotions = promotionsList.filter((promo) => {
    const start = new Date(promo.start_date).getTime();
    const end = new Date(promo.end_date).getTime();

    const isExpired = promo.status === 'expired' || end < now;
    const isUpcoming = start > now && promo.status !== 'expired';
    const isActive = !isExpired && !isUpcoming;

    if (promoStatusTab === 'active') {
      return isActive;
    } else if (promoStatusTab === 'upcoming') {
      return isUpcoming;
    } else {
      return isExpired;
    }
  });

  return (
    <div className="p-3 sm:p-6 max-w-7xl mx-auto space-y-4 sm:space-y-6 text-sm">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b pb-4 dark:border-neutral-800">
        <div>
          <h1 className="text-base sm:text-xl font-bold">Quản Lý Chương Trình Khuyến Mãi</h1>
          <p className="text-xs text-neutral-500 mt-0.5">Theo dõi các chiến dịch giảm giá, flash sale đang và sẽ diễn ra.</p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {activeTab === 'list' ? (
            <button
              onClick={() => setActiveTab('create')}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-semibold text-xs shadow cursor-pointer text-center"
            >
              + Tạo Chương Trình Mới
            </button>
          ) : (
            <button
              onClick={() => setActiveTab('list')}
              className="w-full sm:w-auto bg-neutral-600 hover:bg-neutral-700 text-white px-4 py-2 rounded font-semibold text-xs shadow cursor-pointer text-center"
            >
              ← Quay Lại Danh Sách
            </button>
          )}
        </div>
      </div>

      {activeTab === 'list' && (
        <div className="space-y-4">
          <div className="flex border-b dark:border-neutral-800 gap-4 sm:gap-6 text-xs font-semibold overflow-x-auto">
            <button
              onClick={() => setPromoStatusTab('active')}
              className={`pb-2.5 border-b-2 cursor-pointer transition-colors whitespace-nowrap ${
                promoStatusTab === 'active'
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-300'
              }`}
            >
              🔥 Đang Diễn Ra
            </button>
            <button
              onClick={() => setPromoStatusTab('upcoming')}
              className={`pb-2.5 border-b-2 cursor-pointer transition-colors whitespace-nowrap ${
                promoStatusTab === 'upcoming'
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-300'
              }`}
            >
              ⏳ Sắp Diễn Ra
            </button>
            <button
              onClick={() => setPromoStatusTab('expired')}
              className={`pb-2.5 border-b-2 cursor-pointer transition-colors whitespace-nowrap ${
                promoStatusTab === 'expired'
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-300'
              }`}
            >
              📁 Đã Kết Thúc
            </button>
          </div>

          <div className="bg-white dark:bg-neutral-900 rounded-lg shadow border border-neutral-200 dark:border-neutral-800 overflow-hidden">
            {isFetchingList ? (
              <div className="text-center py-12 text-neutral-400 text-xs">Đang tải danh sách chương trình...</div>
            ) : filteredPromotions.length === 0 ? (
              <div className="text-center py-12 text-neutral-400 text-xs space-y-2">
                <p>Không có chương trình khuyến mãi nào trong mục này.</p>
              </div>
            ) : (
              <div>
                {/* HIỂN THỊ DẠNG THẺ (CARD) CHO MOBILE */}
                <div className="block md:hidden divide-y divide-neutral-200 dark:divide-neutral-800">
                  {filteredPromotions.map((promo, idx) => (
                    <div key={`${promo.id}-${idx}`} className="p-3.5 space-y-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-bold text-neutral-900 dark:text-white text-xs">{promo.name}</span>
                        {promoStatusTab === 'active' && (
                          <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-2 py-0.5 rounded-full font-semibold text-[10px] whitespace-nowrap">
                            Đang chạy
                          </span>
                        )}
                        {promoStatusTab === 'upcoming' && (
                          <span className="bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 px-2 py-0.5 rounded-full font-semibold text-[10px] whitespace-nowrap">
                            Sắp chạy
                          </span>
                        )}
                        {promoStatusTab === 'expired' && (
                          <span className="bg-neutral-200 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-400 px-2 py-0.5 rounded-full font-semibold text-[10px] whitespace-nowrap">
                            Đã kết thúc
                          </span>
                        )}
                      </div>

                      <div className="flex justify-between items-center text-[11px] text-neutral-500">
                        <span>Mức giảm:</span>
                        <span className="font-bold text-blue-600">{promo.discount_summary}</span>
                      </div>

                      <div className="text-[11px] text-neutral-600 dark:text-neutral-400 space-y-0.5 bg-neutral-50 dark:bg-neutral-800/40 p-2 rounded">
                        <div><strong className="text-neutral-500">Bắt đầu:</strong> {formatDateTime(promo.start_date)}</div>
                        <div><strong className="text-neutral-500">Kết thúc:</strong> {formatDateTime(promo.end_date)}</div>
                      </div>

                      {promoStatusTab !== 'expired' && (
                        <div className="flex items-center justify-end gap-2 pt-1">
                          <button
                            onClick={() => {
                              setSelectedPromo(promo);
                              setNewEndDate(promo.end_date ? promo.end_date.slice(0, 16) : '');
                              setIsExtendModalOpen(true);
                            }}
                            className="bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-950/40 dark:text-blue-400 px-3 py-1.5 rounded text-xs font-semibold cursor-pointer flex-1 text-center"
                          >
                            Gia hạn
                          </button>
                          <button
                            onClick={() => handleStopPromotion(promo.id)}
                            className="bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-950/40 dark:text-red-400 px-3 py-1.5 rounded text-xs font-semibold cursor-pointer flex-1 text-center"
                          >
                            Dừng ngay
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* HIỂN THỊ DẠNG BẢNG (TABLE) CHO DESKTOP */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-neutral-50 dark:bg-neutral-800/60 border-b dark:border-neutral-800 text-[11px] text-neutral-500 uppercase">
                        <th className="p-3.5">Tên Chương Trình</th>
                        <th className="p-3.5">Mức Giảm</th>
                        <th className="p-3.5">Thời Gian Bắt Đầu</th>
                        <th className="p-3.5">Thời Gian Kết Thúc</th>
                        <th className="p-3.5 text-center">Trạng Thái</th>
                        <th className="p-3.5 text-center">Thao Tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800 text-xs">
                      {filteredPromotions.map((promo, idx) => (
                        <tr key={`${promo.id}-${idx}`} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30">
                          <td className="p-3.5 font-bold text-neutral-800 dark:text-white">{promo.name}</td>
                          <td className="p-3.5 font-semibold text-blue-600">{promo.discount_summary}</td>
                          <td className="p-3.5 text-neutral-600 dark:text-neutral-300">
                            {formatDateTime(promo.start_date)}
                          </td>
                          <td className="p-3.5 text-neutral-600 dark:text-neutral-300">
                            {formatDateTime(promo.end_date)}
                          </td>
                          <td className="p-3.5 text-center">
                            {promoStatusTab === 'active' && (
                              <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-2.5 py-1 rounded-full font-semibold text-[10px]">
                                Đang chạy
                              </span>
                            )}
                            {promoStatusTab === 'upcoming' && (
                              <span className="bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 px-2.5 py-1 rounded-full font-semibold text-[10px]">
                                Sắp chạy
                              </span>
                            )}
                            {promoStatusTab === 'expired' && (
                              <span className="bg-neutral-200 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-400 px-2.5 py-1 rounded-full font-semibold text-[10px]">
                                Đã kết thúc
                              </span>
                            )}
                          </td>
                          <td className="p-3.5 text-center space-x-2">
                            {promoStatusTab !== 'expired' && (
                              <>
                                <button
                                  onClick={() => {
                                    setSelectedPromo(promo);
                                    setNewEndDate(promo.end_date ? promo.end_date.slice(0, 16) : '');
                                    setIsExtendModalOpen(true);
                                  }}
                                  className="bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-950/40 dark:text-blue-400 px-2.5 py-1 rounded text-xs font-semibold cursor-pointer"
                                >
                                  Gia hạn
                                </button>
                                <button
                                  onClick={() => handleStopPromotion(promo.id)}
                                  className="bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-950/40 dark:text-red-400 px-2.5 py-1 rounded text-xs font-semibold cursor-pointer"
                                >
                                  Dừng ngay
                                </button>
                              </>
                            )}
                            {promoStatusTab === 'expired' && (
                              <span className="text-neutral-400 italic">Không có thao tác</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL GIA HẠN THỜI GIAN */}
      {isExtendModalOpen && selectedPromo && (
        <div className="fixed inset-0 z-[999] bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-xl w-full max-w-md p-5 space-y-4 border border-neutral-200 dark:border-neutral-800">
            <div className="flex justify-between items-center border-b pb-3 dark:border-neutral-800">
              <h3 className="font-bold text-sm">Gia hạn chương trình: {selectedPromo.name}</h3>
              <button onClick={() => setIsExtendModalOpen(false)} className="text-lg font-bold cursor-pointer">&times;</button>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Thời gian kết thúc mới</label>
              <input
                type="datetime-local"
                value={newEndDate}
                onChange={(e) => setNewEndDate(e.target.value)}
                className="w-full border dark:border-neutral-700 rounded px-3 py-2 text-xs bg-transparent"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsExtendModalOpen(false)}
                className="px-3 py-1.5 border dark:border-neutral-700 rounded text-xs cursor-pointer"
              >
                Hủy
              </button>
              <button
                onClick={handleSaveExtension}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold cursor-pointer shadow"
              >
                Lưu thay đổi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FORM TẠO MỚI */}
      {activeTab === 'create' && (
        <div className="space-y-4 sm:space-y-6">
          <div className="flex justify-end">
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
        </div>
      )}

      {/* MODAL CHỌN SẢN PHẨM */}
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