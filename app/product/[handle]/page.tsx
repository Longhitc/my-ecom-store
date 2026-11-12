"use client";

import { useCart } from 'context/CartContext';
import { notFound } from 'next/navigation';
import React, { use, useEffect, useState } from 'react';

export default function ProductPage({ params }: { params: Promise<{ handle: string }> }) {
  const resolvedParams = use(params);
  const { addToCart, setIsCartOpen } = useCart();
  
  const [product, setProduct] = useState<any>(null);
  const [promotionsList, setPromotionsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});

  // State tính năng Like và Review thực tế từ API
  const [clientUuid, setClientUuid] = useState<string>('');
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [reviews, setReviews] = useState<any[]>([]);
  const [newReview, setNewReview] = useState({ name: "", rating: 5, comment: "" });

  // 1. Khởi tạo Client UUID từ localStorage cho trình duyệt này
  useEffect(() => {
    let uuid = localStorage.getItem('shop_client_uuid');
    if (!uuid) {
      uuid = 'client_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
      localStorage.setItem('shop_client_uuid', uuid);
    }
    setClientUuid(uuid);
  }, []);

  // 2. Fetch dữ liệu sản phẩm, khuyến mãi và dữ liệu tương tác (Like/Reviews) từ API
  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/admin/products', { cache: 'no-store' });
        if (!res.ok) {
          setLoading(false);
          return;
        }
        const data = await res.json();
        const productsList = data.products || [];
        
        const foundProduct = productsList.find(
          (p: any) => p.handle === resolvedParams.handle
        );

        if (foundProduct) {
          const detailRes = await fetch(`/api/admin/products?id=${foundProduct.id}`, { cache: 'no-store' });
          let targetProduct = foundProduct;
          if (detailRes.ok) {
            const detailData = await detailRes.json();
            targetProduct = detailData.product || foundProduct;
            setProduct(targetProduct);
          } else {
            setProduct(foundProduct);
          }

          // Lấy dữ liệu Like và Reviews từ API interaction ngay khi có ID sản phẩm
          if (targetProduct?.id) {
            const uuid = localStorage.getItem('shop_client_uuid') || '';
            const interactionRes = await fetch(`/api/products/interaction?product_id=${targetProduct.id}&client_uuid=${uuid}`, { cache: 'no-store' });
            if (interactionRes.ok) {
              const interactionData = await interactionRes.json();
              if (interactionData.success) {
                setLikeCount(interactionData.likesCount);
                setIsLiked(interactionData.isLiked);
                setReviews(interactionData.reviews);
              }
            }
          }

          try {
            const promoRes = await fetch('/api/admin/promotions', { cache: 'no-store' });
            if (promoRes.ok) {
              const promoData = await promoRes.json();
              const allPromos = promoData.promotions || [];
              const nowVn = new Date().toLocaleString("sv-SE", { timeZone: "Asia/Ho_Chi_Minh" }).replace(" ", "T");

              const validPromos = allPromos.filter((p: any) => {
                const isActive = p.status === 'active';
                const hasStarted = !p.start_date || p.start_date <= nowVn;
                const notEnded = !p.end_date || p.end_date >= nowVn;
                return isActive && hasStarted && notEnded;
              });

              setPromotionsList(validPromos);
            }
          } catch (e) {
            console.error("Lỗi khi tải danh sách khuyến mãi:", e);
          }
        }
      } catch (err) {
        console.error("Lỗi khi tải sản phẩm:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [resolvedParams.handle]);

  // Clean image array
  const validImages: string[] = [];
  if (product) {
    if (Array.isArray(product.images)) {
      product.images.forEach((img: string) => {
        if (typeof img === 'string' && img.trim().length > 0) {
          validImages.push(img.trim());
        }
      });
    }
    const featImg = product.featured_image_url || product.featuredImage?.url;
    if (validImages.length === 0 && featImg && typeof featImg === 'string' && featImg.trim().length > 0) {
      validImages.push(featImg.trim());
    }
  }

  // Compute options from variants
  const computedOptions = React.useMemo(() => {
    if (!product) return [];
    if (product.options && product.options.length > 0) return product.options;

    if (product.variants && Array.isArray(product.variants)) {
      const optionMap: Record<string, Set<string>> = {};

      product.variants.forEach((v: any) => {
        if (v.selectedOptions && Array.isArray(v.selectedOptions)) {
          v.selectedOptions.forEach((so: any) => {
            if (so && so.name && so.value) {
              const optName = String(so.name);
              if (!optionMap[optName]) {
                optionMap[optName] = new Set<string>();
              }
              optionMap[optName].add(String(so.value));
            }
          });
        } else if (v.title && v.title !== 'Mặc định') {
          const parts = v.title.split('/').map((s: string) => s.trim());
          if (parts.length === 2) {
            if (!optionMap['Màu sắc']) optionMap['Màu sắc'] = new Set<string>();
            if (!optionMap['Size']) optionMap['Size'] = new Set<string>();
            optionMap['Màu sắc'].add(parts[0]);
            optionMap['Size'].add(parts[1]);
          } else if (parts.length === 1) {
            if (!optionMap['Phân loại']) optionMap['Phân loại'] = new Set<string>();
            optionMap['Phân loại'].add(parts[0]);
          }
        }
      });

      return Object.keys(optionMap).map((key, idx) => ({
        id: String(idx + 1),
        name: key,
        values: Array.from(optionMap[key] || []),
      }));
    }

    return [];
  }, [product]);

  useEffect(() => {
    if (product) {
      const initialImg = validImages[0] || null;
      setSelectedImage(initialImg);

      const initial: Record<string, string> = {};
      if (computedOptions.length > 0) {
        computedOptions.forEach((opt: any) => {
          initial[opt.name] = opt.values[0] || '';
        });
      }
      setSelectedOptions(initial);
    }
  }, [product?.id, computedOptions]);

  if (loading) {
    return (
      <div className="mx-auto max-w-screen-xl px-4 py-16 text-center text-neutral-500">
        Đang tải dữ liệu sản phẩm...
      </div>
    );
  }

  if (!product) {
    notFound();
  }

  const normalize = (str: any) => String(str || '').trim().toLowerCase();

  const selectedVariant = product.variants?.find((variant: any) => {
    if (variant.selectedOptions && Array.isArray(variant.selectedOptions)) {
      return variant.selectedOptions.every((sel: any) => {
        const userSelectedVal = selectedOptions[sel.name];
        return normalize(sel.value) === normalize(userSelectedVal);
      });
    }
    
    if (variant.title) {
      const selectedVals = Object.values(selectedOptions).map(normalize);
      const titleParts = variant.title.split('/').map(normalize);
      return selectedVals.every((val) => titleParts.includes(val));
    }

    return false;
  }) || product.variants?.[0];

  const stockQuantity = Number(
    selectedVariant?.quantity_available ?? 
    selectedVariant?.quantityAvailable ?? 
    selectedVariant?.inventory_quantity ?? 
    selectedVariant?.quantity ?? 
    selectedVariant?.stock ?? 
    product.stock ?? 
    0
  );

  const isAvailable = stockQuantity > 0;
  const originalPrice = Number(selectedVariant?.amount ?? selectedVariant?.price ?? product.price ?? 0);

  let activePromoItem = null;
  if (promotionsList.length > 0 && product) {
    if (selectedVariant?.id) {
      activePromoItem = promotionsList.find(
        (item: any) => 
          String(item.product_id) === String(product.id) && 
          String(item.variant_id) === String(selectedVariant.id)
      );
    }
    if (!activePromoItem) {
      activePromoItem = promotionsList.find(
        (item: any) => String(item.product_id) === String(product.id)
      );
    }
  }

  const promoPrice = activePromoItem?.promo_price ? Number(activePromoItem.promo_price) : null;
  const finalPrice = promoPrice !== null && promoPrice < originalPrice ? promoPrice : originalPrice;
  const hasDiscount = promoPrice !== null && promoPrice < originalPrice;

  const handleOptionChange = (optionName: string, value: string) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [optionName]: value,
    }));
  };

  const handleAddToCart = (e: React.FormEvent) => {
    e.preventDefault();
    
    addToCart({
      id: selectedVariant ? `${product.id}-${selectedVariant.id}` : product.id,
      handle: product.handle,
      title: `${product.title} ${selectedVariant?.title ? `(${selectedVariant.title})` : ''} ${!isAvailable ? '[Hàng Đặt Trước]' : ''}`,
      price: Number(finalPrice),
      imageUrl: selectedImage || '',
      size: selectedOptions['Size'] || 'Mặc định',
      style: selectedOptions['Màu sắc'] || selectedOptions['Loại'] || selectedOptions['Phân loại'] || 'Mặc định',
      quantity,
    });

    setIsCartOpen(true);
  };

  // 3. Xử lý sự kiện bấm Like qua API
  const handleToggleLike = async () => {
    if (!clientUuid || !product?.id) return;
    try {
      const res = await fetch('/api/products/interaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'LIKE',
          productId: product.id,
          clientUuid
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setIsLiked(data.isLiked);
          setLikeCount(data.likesCount);
        }
      }
    } catch (err) {
      console.error("Lỗi khi thích sản phẩm:", err);
    }
  };

  // Tính trung bình sao đánh giá
  const averageRating = reviews.length > 0 
    ? (reviews.reduce((acc, r) => acc + Number(r.rating || 0), 0) / reviews.length).toFixed(1) 
    : "5.0";

  // 4. Xử lý gửi đánh giá mới qua API
  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReview.name.trim() || !newReview.comment.trim()) {
      alert("Vui lòng nhập tên và nội dung đánh giá!");
      return;
    }

    try {
      const res = await fetch('/api/products/interaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'REVIEW',
          productId: product.id,
          customerName: newReview.name,
          rating: newReview.rating,
          comment: newReview.comment
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setReviews(data.reviews);
          setNewReview({ name: "", rating: 5, comment: "" });
          alert("Cảm ơn bạn đã đánh giá sản phẩm!");
        }
      } else {
        alert("Gửi đánh giá thất bại!");
      }
    } catch (err) {
      console.error("Lỗi khi gửi đánh giá:", err);
      alert("Lỗi kết nối máy chủ!");
    }
  };

  // Thành phần giao diện Đánh giá (Tái sử dụng cho cả Mobile và Desktop)
  const reviewsSectionContent = (
    <div className="border-t border-neutral-200 dark:border-neutral-800 pt-6 space-y-4">
      <h2 className="text-lg font-bold">Đánh giá & Nhận xét sản phẩm</h2>

      <div className="space-y-3">
        <div className="flex items-center gap-3 p-3 bg-neutral-50 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800">
          <span className="text-2xl font-extrabold text-amber-500">{averageRating}</span>
          <div>
            <div className="flex text-amber-400 text-xs">★★★★★</div>
            <span className="text-[11px] text-neutral-500">Dựa trên {reviews.length} lượt đánh giá</span>
          </div>
        </div>

        {/* Form gửi đánh giá */}
        <form onSubmit={handleAddReview} className="space-y-2.5 bg-neutral-50 dark:bg-neutral-900 p-3 rounded-xl border border-neutral-200 dark:border-neutral-800">
          <h3 className="font-semibold text-[11px] uppercase tracking-wider text-neutral-400">Gửi đánh giá của bạn</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <input
              type="text"
              placeholder="Họ tên của bạn"
              value={newReview.name}
              onChange={(e) => setNewReview({ ...newReview, name: e.target.value })}
              className="w-full bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded p-1.5 text-xs focus:outline-none focus:border-blue-500"
            />
            <select
              value={newReview.rating}
              onChange={(e) => setNewReview({ ...newReview, rating: Number(e.target.value) })}
              className="w-full bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded p-1.5 text-xs focus:outline-none focus:border-blue-500"
            >
              <option value="5">⭐⭐⭐⭐⭐ (5/5 sao - Tuyệt vời)</option>
              <option value="4">⭐⭐⭐⭐ (4/5 sao - Hài lòng)</option>
              <option value="3">⭐⭐⭐ (3/5 sao - Bình thường)</option>
              <option value="2">⭐⭐ (2/5 sao - Không ưng ý)</option>
              <option value="1">⭐ (1/5 sao - Rất tệ)</option>
            </select>
          </div>
          <textarea
            rows={2}
            placeholder="Nhận xét chi tiết về sản phẩm..."
            value={newReview.comment}
            onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
            className="w-full bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded p-1.5 text-xs focus:outline-none focus:border-blue-500"
          />
          <button
            type="submit"
            className="bg-black dark:bg-white text-white dark:text-black font-semibold px-3 py-1.5 rounded text-xs hover:opacity-80 transition"
          >
            Gửi nhận xét
          </button>
        </form>
      </div>

      {/* Danh sách bình luận */}
      <div className="space-y-2.5">
        <h3 className="font-semibold text-[11px] text-neutral-400 uppercase tracking-wider">Khách hàng nhận xét ({reviews.length})</h3>
        {reviews.length === 0 ? (
          <div className="text-xs text-neutral-500 italic py-2">Chưa có đánh giá nào cho sản phẩm này. Hãy là người đầu tiên đánh giá!</div>
        ) : (
          reviews.map((rev) => (
            <div key={rev.id} className="p-2.5 rounded-lg border border-neutral-200 dark:border-neutral-800 space-y-1 bg-white dark:bg-neutral-950">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs">{rev.name}</span>
                <span className="text-[10px] text-neutral-400">{rev.date}</span>
              </div>
              <div className="text-amber-400 text-xs">
                {"★".repeat(Number(rev.rating || 5))}{"☆".repeat(5 - Number(rev.rating || 5))}
              </div>
              <p className="text-xs text-neutral-600 dark:text-neutral-300">{rev.comment}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );

  return (
    <div className="mx-auto max-w-screen-xl px-4 py-3 md:py-4 text-black dark:text-white">
      {/* Breadcrumb sát phía trên */}
      <div className="text-xs sm:text-sm text-neutral-500 mb-4">
        Home &gt; {product.title}
      </div>

      {/* CẤU TRÚC CHÍNH: DÙNG FLEX DIRECTION ĐỂ SẮP XẾP LẠI THỨ TỰ TRÊN MOBILE */}
      <div className="flex flex-col md:grid md:grid-cols-2 md:gap-8">
        
        {/* KHU VỰC 1: HÌNH ẢNH SẢN PHẨM (Luôn hiển thị ở trên cùng trên cả mobile và desktop) */}
        <div className="space-y-6 order-1">
          <div className="space-y-3">
            <div className="relative flex justify-center bg-neutral-100 dark:bg-neutral-900 rounded-lg p-4 border border-neutral-200 dark:border-neutral-800 min-h-[320px] items-center">
              {hasDiscount && (
                <span className="absolute top-3 left-3 z-10 rounded bg-red-600 px-2 py-1 text-xs font-bold text-white shadow">
                  {activePromoItem?.discount_type === 'percent' ? `-${activePromoItem.discount_value}%` : `-${Number(activePromoItem?.discount_value || 0).toLocaleString('vi-VN')}đ`}
                </span>
              )}

              {selectedImage ? (
                <img 
                  src={selectedImage} 
                  alt={product.title} 
                  className="max-h-[420px] w-full object-contain rounded transition-all duration-300"
                />
              ) : (
                <div className="text-neutral-500 text-sm font-medium">Chưa có ảnh sản phẩm</div>
              )}
            </div>

            {/* THUMBNAILS */}
            {validImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {validImages.map((imgUrl, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setSelectedImage(imgUrl)}
                    className={`relative flex-shrink-0 w-16 h-16 rounded-lg border-2 p-1 bg-neutral-100 dark:bg-neutral-900 overflow-hidden transition-all ${
                      selectedImage === imgUrl 
                        ? 'border-blue-600 scale-105' 
                        : 'border-neutral-200 dark:border-neutral-800 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={imgUrl}
                      alt={`${product.title} ${index + 1}`}
                      className="w-full h-full object-cover rounded"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ĐÁNH GIÁ SẢN PHẨM DÀNH RIÊNG CHO DESKTOP (Nằm bên trái dưới ảnh) */}
          <div className="hidden md:block">
            {reviewsSectionContent}
          </div>
        </div>

        {/* KHU VỰC 2: TÊN, GIÁ, MÔ TẢ, NÚT MUA HÀNG (Sẽ nhảy lên ngay dưới ảnh trên mobile nhờ order-2) */}
        <div className="flex flex-col justify-start space-y-5 order-2 mt-6 md:mt-0">
          <h1 className="text-3xl font-bold tracking-tight">{product.title}</h1>
          
          {/* NÚT LIKE & SỐ LƯỢT THÍCH */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleToggleLike}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border text-xs font-semibold transition shadow-sm ${
                isLiked 
                  ? 'bg-rose-50 border-rose-500 text-rose-600 dark:bg-rose-950/40' 
                  : 'bg-white dark:bg-neutral-900 border-rose-300 text-rose-500 hover:border-rose-500 hover:bg-rose-50/50'
              }`}
            >
              <span className="text-sm">❤️</span>
              <span>{isLiked ? 'Đã thích' : 'Thích'}</span>
            </button>
            <span className="text-xs text-neutral-500 dark:text-neutral-400">
              <strong className="text-black dark:text-white">{likeCount}</strong> khách hàng đã thích sản phẩm này
            </span>
          </div>

          {/* DISPLAY PRICE / PROMO PRICE */}
          <div className="flex items-center gap-3">
            {hasDiscount ? (
              <>
                <span className="text-2xl font-extrabold text-red-600">
                  {finalPrice.toLocaleString('vi-VN')} đ
                </span>
                <span className="text-base text-neutral-400 line-through">
                  {originalPrice.toLocaleString('vi-VN')} đ
                </span>
              </>
            ) : (
              <span className="text-2xl font-bold text-blue-600 dark:text-blue-500">
                {originalPrice.toLocaleString('vi-VN')} đ
              </span>
            )}
          </div>
          
          <hr className="border-neutral-200 dark:border-neutral-800" />

          <form onSubmit={handleAddToCart} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* RENDER OPTIONS */}
              {computedOptions.map((option: any) => (
                <div key={option.id || option.name}>
                  <label className="block text-[11px] font-medium text-neutral-400 mb-1.5 uppercase tracking-wider">
                    {option.name}
                  </label>
                  <select 
                    value={selectedOptions[option.name] || ''}
                    onChange={(e) => handleOptionChange(option.name, e.target.value)}
                    className="w-full bg-transparent border border-neutral-300 dark:border-neutral-700 rounded p-2 text-xs focus:outline-none focus:border-blue-500 dark:bg-neutral-900"
                  >
                    {option.values.map((val: string) => (
                      <option key={val} value={val} className="dark:bg-neutral-900">
                        {val}
                      </option>
                    ))}
                  </select>
                </div>
              ))}

              {/* QUANTITY INPUT */}
              <div>
                <label className="block text-[11px] font-medium text-neutral-400 mb-1.5 uppercase tracking-wider">
                  Số lượng
                </label>
                <input 
                  type="number" 
                  min="1"
                  max={isAvailable && stockQuantity > 0 ? stockQuantity : undefined}
                  value={quantity} 
                  onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                  className="w-full bg-transparent border border-neutral-300 dark:border-neutral-700 rounded p-2 text-center text-xs h-[38px] focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* STOCK STATUS */}
            <div className="space-y-1 text-xs font-medium">
              <div>
                Tình trạng kho:{' '}
                {isAvailable ? (
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                    Còn {stockQuantity} sản phẩm sẵn
                  </span>
                ) : (
                  <span className="text-amber-600 dark:text-amber-400 font-semibold">
                    Hết hàng sẵn (Nhận đặt hàng trước)
                  </span>
                )}
              </div>

              {!isAvailable && (
                <div className="text-[11px] italic text-neutral-500 dark:text-neutral-400">
                  Ghi chú: Hàng đặt nhận sau 10-15 ngày
                </div>
              )}
            </div>

            {/* ADD TO CART BUTTON */}
            <button 
              type="submit"
              className={`w-full font-bold py-2.5 px-6 rounded transition-colors text-center text-xs block ${
                isAvailable
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-amber-600 hover:bg-amber-700 text-white'
              }`}
            >
              {isAvailable ? 'Thêm vào giỏ hàng' : 'Đặt hàng'}
            </button>
          </form>
          <hr className="border-neutral-200 dark:border-neutral-800" />

          {/* DESCRIPTION */}
          <div className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed space-y-1.5 whitespace-pre-line">
            <p className="font-medium text-black dark:text-white">Mô tả sản phẩm:</p>
            <p>{selectedVariant?.description || product.description}</p>
          </div>
        </div>

        {/* KHU VỰC 3: ĐÁNH GIÁ SẢN PHẨM DÀNH RIÊNG CHO MOBILE (Nằm ở dưới cùng trên mobile nhờ order-3) */}
        <div className="block md:hidden order-3 mt-6">
          {reviewsSectionContent}
        </div>

      </div>
    </div>
  );
}