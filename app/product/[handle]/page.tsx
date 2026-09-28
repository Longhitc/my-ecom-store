"use client";

import { useCart } from 'context/CartContext';
import { notFound } from 'next/navigation';
import React, { use, useEffect, useState } from 'react';

export default function ProductPage({ params }: { params: Promise<{ handle: string }> }) {
  const resolvedParams = use(params);
  const { addToCart, setIsCartOpen } = useCart();
  
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});

  // 1. Fetch dữ liệu sản phẩm từ DB
  useEffect(() => {
    async function fetchProduct() {
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
          if (detailRes.ok) {
            const detailData = await detailRes.json();
            setProduct(detailData.product || foundProduct);
          } else {
            setProduct(foundProduct);
          }
        }
      } catch (err) {
        console.error("Lỗi khi tải sản phẩm:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
  }, [resolvedParams.handle]);

  // Lọc mảng ảnh sạch, tránh dính src=""
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

  // Tự động xây dựng mảng Options từ biến thể (Variants)
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

  // Reset ảnh & khởi tạo selectedOptions
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

  // Hàm so sánh linh hoạt không phân biệt HOA / thường và khoảng trắng
  const normalize = (str: any) => String(str || '').trim().toLowerCase();

  // Tìm Variant khớp chính xác
  const selectedVariant = product.variants?.find((variant: any) => {
    // 1. Nếu variant có cấu trúc selectedOptions
    if (variant.selectedOptions && Array.isArray(variant.selectedOptions)) {
      return variant.selectedOptions.every((sel: any) => {
        const userSelectedVal = selectedOptions[sel.name];
        return normalize(sel.value) === normalize(userSelectedVal);
      });
    }
    
    // 2. Nếu variant ghép bằng chuỗi title (vd: "Tím / m5")
    if (variant.title) {
      const selectedVals = Object.values(selectedOptions).map(normalize);
      const titleParts = variant.title.split('/').map(normalize);
      return selectedVals.every((val) => titleParts.includes(val));
    }

    return false;
  }) || product.variants?.[0];

  // Đọc số lượng kho từ tất cả các kiểu tên cột có thể có
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
  const currentPrice = selectedVariant?.amount ?? selectedVariant?.price ?? product.price ?? 0;

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
      price: Number(currentPrice),
      imageUrl: selectedImage || '',
      size: selectedOptions['Size'] || 'Mặc định',
      style: selectedOptions['Màu sắc'] || selectedOptions['Loại'] || selectedOptions['Phân loại'] || 'Mặc định',
      quantity,
    });

    setIsCartOpen(true);
  };
  return (
    <div className="mx-auto max-w-screen-xl px-4 py-8 md:py-16 text-black dark:text-white">
      {/* Breadcrumb */}
      <div className="text-sm text-neutral-500 mb-6">
        Home &gt; {product.title}
      </div>

      <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
        {/* BÊN TRÁI: GALLERY HÌNH ẢNH */}
        <div className="space-y-4">
          <div className="flex justify-center bg-neutral-100 dark:bg-neutral-900 rounded-lg p-6 border border-neutral-200 dark:border-neutral-800 min-h-[350px] items-center">
            {selectedImage ? (
              <img 
                src={selectedImage} 
                alt={product.title} 
                className="max-h-[450px] w-full object-contain rounded transition-all duration-300"
              />
            ) : (
              <div className="text-neutral-500 text-sm font-medium">Chưa có ảnh sản phẩm</div>
            )}
          </div>

          {/* THUMBNAILS */}
          {validImages.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {validImages.map((imgUrl, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setSelectedImage(imgUrl)}
                  className={`relative flex-shrink-0 w-20 h-20 rounded-lg border-2 p-1 bg-neutral-100 dark:bg-neutral-900 overflow-hidden transition-all ${
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

        {/* BÊN PHẢI: THÔNG TIN SẢN PHẨM */}
        <div className="flex flex-col justify-start space-y-6">
          <h1 className="text-4xl font-bold tracking-tight">{product.title}</h1>
          
          {/* GIÁ SẢN PHẨM */}
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-500">
            {Number(currentPrice).toLocaleString('vi-VN')} đ
          </div>
          
          <hr className="border-neutral-200 dark:border-neutral-800" />

          <form onSubmit={handleAddToCart} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* RENDER OPTIONS */}
              {computedOptions.map((option: any) => (
                <div key={option.id || option.name}>
                  <label className="block text-xs font-medium text-neutral-400 mb-2 uppercase tracking-wider">
                    {option.name}
                  </label>
                  <select 
                    value={selectedOptions[option.name] || ''}
                    onChange={(e) => handleOptionChange(option.name, e.target.value)}
                    className="w-full bg-transparent border border-neutral-300 dark:border-neutral-700 rounded p-2.5 text-sm focus:outline-none focus:border-blue-500 dark:bg-neutral-900"
                  >
                    {option.values.map((val: string) => (
                      <option key={val} value={val} className="dark:bg-neutral-900">
                        {val}
                      </option>
                    ))}
                  </select>
                </div>
              ))}

              {/* Ô NHẬP SỐ LƯỢNG MUA */}
              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-2 uppercase tracking-wider">
                  Số lượng
                </label>
                <input 
                  type="number" 
                  min="1"
                  max={isAvailable && stockQuantity > 0 ? stockQuantity : undefined}
                  value={quantity} 
                  onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                  className="w-full bg-transparent border border-neutral-300 dark:border-neutral-700 rounded p-2 text-center text-sm h-[42px] focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* THÔNG BÁO TỒN KHO */}
            <div className="space-y-1 text-sm font-medium">
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
                <div className="text-xs italic text-neutral-500 dark:text-neutral-400">
                  Ghi chú: Hàng đặt nhận sau 10-15 ngày
                </div>
              )}
            </div>

            {/* NÚT THÊM VÀO GIỎ / ĐẶT HÀNG */}
            <button 
              type="submit"
              className={`w-full font-bold py-3 px-8 rounded transition-colors text-center block ${
                isAvailable
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-amber-600 hover:bg-amber-700 text-white'
              }`}
            >
              {isAvailable ? 'Thêm vào giỏ hàng' : 'Đặt hàng'}
            </button>
          </form>
          <hr className="border-neutral-200 dark:border-neutral-800" />

          {/* MÔ TẢ SẢN PHẨM */}
          <div className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed space-y-2 whitespace-pre-line">
            <p className="font-medium text-black dark:text-white">Mô tả sản phẩm:</p>
            <p>{selectedVariant?.description || product.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
}