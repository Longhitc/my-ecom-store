"use client";

import { mockProducts, ProductOption, ProductVariant } from 'app/product/products';
import { useCart } from 'context/CartContext';
import { notFound } from 'next/navigation';
import React, { use, useEffect, useState } from 'react';

export default function ProductPage({ params }: { params: Promise<{ handle: string }> }) {
  // Unwrap params đúng chuẩn Next.js 15
  const resolvedParams = use(params);
  const { addToCart, setIsCartOpen } = useCart();
  const [quantity, setQuantity] = useState(1);

  // 1. Tìm đúng sản phẩm theo handle (Đã bỏ || mockProducts[0]! gây lỗi)
  const product = mockProducts.find((p) => p.handle === resolvedParams.handle);

  // 2. Không tìm thấy sản phẩm thì đẩy về 404
  if (!product) {
    notFound();
  }

  // 3. Quản lý trạng thái Option người dùng chọn (Loại / Màu sắc, Size,...)
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    if (product.options && product.options.length > 0) {
      product.options.forEach((opt: ProductOption) => {
        initial[opt.name] = opt.values[0] || '';
      });
    }
    return initial;
  });

  // 4. Tìm Variant khớp chính xác với tất cả Option đang chọn
  const selectedVariant = product.variants?.find((variant: ProductVariant) =>
    variant.selectedOptions.every(
      (sel) => selectedOptions[sel.name] === sel.value
    )
  ) || product.variants?.[0];

  // 5. Kiểm tra tồn kho thực tế từ selectedVariant
  const stockQuantity = selectedVariant?.quantityAvailable ?? 0;
  const isAvailable = (selectedVariant?.availableForSale ?? true) && (selectedVariant?.quantityAvailable === undefined || stockQuantity > 0);

  // 6. Quản lý ảnh
  const productImages = product.images && product.images.length > 0 
    ? product.images 
    : [product.featuredImage.url];

  const [selectedImage, setSelectedImage] = useState(productImages[0] || product.featuredImage.url);

  // Reset ảnh & options khi đổi sản phẩm
  useEffect(() => {
    if (product) {
      setSelectedImage(productImages[0] || product.featuredImage.url);
      if (product.options) {
        const initial: Record<string, string> = {};
        
        // Nhận diện Option chính (Loại hoặc Màu sắc)
        const primaryOpt = product.options.find((opt) => opt.name === 'Loại' || opt.name === 'Màu sắc');
        const defaultPrimaryVal = primaryOpt ? primaryOpt.values[0] : '';

        product.options.forEach((opt: ProductOption) => {
          if (opt.name === 'Size' && primaryOpt && defaultPrimaryVal && product.variants) {
            // Tự chọn size đầu tiên thuộc phân loại/màu sắc mặc định
            const firstValidSize = product.variants.find((v) =>
              v.selectedOptions.some((so) => so.name === primaryOpt.name && so.value === defaultPrimaryVal)
            )?.selectedOptions.find((so) => so.name === 'Size')?.value;

            initial[opt.name] = firstValidSize || opt.values[0] || '';
          } else {
            initial[opt.name] = opt.values[0] || '';
          }
        });

        setSelectedOptions(initial);
      }
    }
  }, [product.handle]);

  // Tính toán giá hiển thị thực tế
  const getVariantPrice = (variant: any) => {
    if (!variant || !variant.price) return 0;
    if (typeof variant.price === 'object' && variant.price.amount) {
      return parseFloat(variant.price.amount);
    }
    if (typeof variant.price === 'string') {
      return parseFloat(variant.price);
    }
    return 0;
  };

  const currentPrice = selectedVariant
    ? getVariantPrice(selectedVariant)
    : parseFloat(product.priceRange.minVariantPrice?.amount || product.priceRange.maxVariantPrice.amount);

  // Xử lý khi đổi Option (Loại, Màu sắc, Size)
  const handleOptionChange = (optionName: string, value: string) => {
    if (optionName === 'Loại' || optionName === 'Màu sắc') {
      // Tìm size hợp lệ đầu tiên ứng với Loại/Màu mới chọn
      const firstValidSize = product.variants?.find((v) =>
        v.selectedOptions.some((so) => so.name === optionName && so.value === value)
      )?.selectedOptions.find((so) => so.name === 'Size')?.value;

      setSelectedOptions((prev) => ({
        ...prev,
        [optionName]: value,
        'Size': firstValidSize || prev['Size'] || ''
      }));
    } else {
      setSelectedOptions((prev) => ({
        ...prev,
        [optionName]: value,
      }));
    }
  };

  const handleAddToCart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAvailable) return;
    
    addToCart({
      id: selectedVariant ? `${product.id}-${selectedVariant.id}` : product.id,
      handle: product.handle,
      title: `${product.title} ${selectedVariant ? `(${selectedVariant.title})` : ''}`,
      price: currentPrice,
      imageUrl: selectedImage,
      size: selectedOptions['Size'] || 'Mặc định',
      style: selectedOptions['Loại'] || selectedOptions['Màu sắc'] || 'Mặc định',
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
          <div className="flex justify-center bg-neutral-100 dark:bg-neutral-900 rounded-lg p-6 border border-neutral-200 dark:border-neutral-800">
            <img 
              src={selectedImage} 
              alt={product.featuredImage.altText || product.title} 
              className="max-h-[450px] w-full object-contain rounded transition-all duration-300"
            />
          </div>

          {/* THUMBNAILS */}
          {productImages.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {productImages.map((imgUrl, index) => (
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

        {/* BÊN PHẢI: THÔNG TIN SẢN PHẨM & TỒN KHO */}
        <div className="flex flex-col justify-start space-y-6">
          <h1 className="text-4xl font-bold tracking-tight">{product.title}</h1>
          
          {/* GIÁ SẢN PHẨM */}
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-500">
            {currentPrice.toLocaleString('vi-VN')} đ
          </div>
          
          <hr className="border-neutral-200 dark:border-neutral-800" />

          <form onSubmit={handleAddToCart} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* RENDER DROPDOWN OPTIONS (LOẠI / MÀU SẮC / SIZE) */}
              {product.options && product.options.length > 0 ? (
                product.options.map((option: ProductOption) => {
                  let availableValues = option.values;

                  // Lọc Size theo Loại / Màu sắc đã chọn
                  const parentOptName = selectedOptions['Loại'] ? 'Loại' : selectedOptions['Màu sắc'] ? 'Màu sắc' : null;
                  if (option.name === 'Size' && parentOptName && product.variants) {
                    const currentParentValue = selectedOptions[parentOptName];
                    availableValues = option.values.filter((sizeValue) =>
                      product.variants?.some((variant) =>
                        variant.selectedOptions.some((so) => so.name === parentOptName && so.value === currentParentValue) &&
                        variant.selectedOptions.some((so) => so.name === 'Size' && so.value === sizeValue)
                      )
                    );
                  }

                  return (
                    <div key={option.id}>
                      <label className="block text-xs font-medium text-neutral-400 mb-2 uppercase tracking-wider">
                        {option.name}
                      </label>
                      <select 
                        value={selectedOptions[option.name] || ''}
                        onChange={(e) => handleOptionChange(option.name, e.target.value)}
                        className="w-full bg-transparent border border-neutral-300 dark:border-neutral-700 rounded p-2.5 text-sm focus:outline-none focus:border-blue-500 dark:bg-neutral-900"
                      >
                        {availableValues.map((val: string) => (
                          <option key={val} value={val} className="dark:bg-neutral-900">
                            {val}
                          </option>
                        ))}
                      </select>
                    </div>
                  );
                })
              ) : null}

              {/* Ô NHẬP SỐ LƯỢNG MUA */}
              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-2 uppercase tracking-wider">
                  Số lượng
                </label>
                <input 
                  type="number" 
                  min="1"
                  max={stockQuantity || 1}
                  value={quantity} 
                  onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                  disabled={!isAvailable}
                  className="w-full bg-transparent border border-neutral-300 dark:border-neutral-700 rounded p-2 text-center text-sm h-[42px] focus:outline-none focus:border-blue-500 disabled:opacity-50"
                />
              </div>
            </div>

            {/* THÔNG BÁO TỒN KHO */}
            {selectedVariant && selectedVariant.quantityAvailable !== undefined && (
              <div className="text-sm font-medium">
                Tình trạng kho:{' '}
                {isAvailable ? (
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                    Còn {stockQuantity} sản phẩm
                  </span>
                ) : (
                  <span className="text-red-600 dark:text-red-400 font-semibold">
                    Hết hàng
                  </span>
                )}
              </div>
            )}

            {/* NÚT THÊM VÀO GIỎ HÀNG */}
            <button 
              type="submit"
              disabled={!isAvailable}
              className={`w-full font-bold py-3 px-8 rounded transition-colors text-center block ${
                isAvailable
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-neutral-400 dark:bg-neutral-800 text-neutral-200 cursor-not-allowed'
              }`}
            >
              {isAvailable ? 'Add to Cart' : 'Hết hàng'}
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