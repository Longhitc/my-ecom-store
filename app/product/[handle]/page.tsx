"use client";

import { mockProducts, ProductOption, ProductVariant } from 'app/product/products';
import { useCart } from 'context/CartContext';
import React, { use, useEffect, useState } from 'react';

export default function ProductPage({ params }: { params: Promise<{ handle: string }> }) {
  const resolvedParams = use(params);
  const { addToCart, setIsCartOpen } = useCart();

  const [quantity, setQuantity] = useState(1);

  // 1. Tìm sản phẩm
  const product = mockProducts.find((p) => p.handle === resolvedParams.handle) || mockProducts[0]!;

  // 2. Quản lý trạng thái Option người dùng chọn
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    if (product.options && product.options.length > 0) {
      product.options.forEach((opt: ProductOption) => {
        initial[opt.name] = opt.values[0] || '';
      });
    }
    return initial;
  });

  // 3. Tìm Variant khớp với Option đang được chọn
  const selectedVariant = product.variants?.find((variant: ProductVariant) =>
    variant.selectedOptions.every(
      (sel) => selectedOptions[sel.name] === sel.value
    )
  ) || product.variants?.[0];

  // 4. Quản lý ảnh
  const productImages = product.images && product.images.length > 0 
    ? product.images 
    : [product.featuredImage.url];

  const [selectedImage, setSelectedImage] = useState(productImages[0] || product.featuredImage.url);

  // Cập nhật lại ảnh & options khi chuyển sản phẩm
  useEffect(() => {
    if (product) {
      setSelectedImage(productImages[0] || product.featuredImage.url);
      if (product.options) {
        const initial: Record<string, string> = {};
        
        // Khởi tạo Phân loại trước
        const categoryOpt = product.options.find((opt) => opt.name === 'Phân loại');
        const defaultCategory = categoryOpt ? categoryOpt.values[0] : '';

        product.options.forEach((opt: ProductOption) => {
          if (opt.name === 'Size' && defaultCategory && product.variants) {
            // Lấy size đầu tiên khớp với phân loại mặc định
            const firstValidSize = product.variants.find((v) =>
              v.selectedOptions.some((so) => so.name === 'Phân loại' && so.value === defaultCategory)
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

  if (!product) return null;

  // Tính toán giá hiển thị thực tế
  const currentPrice = selectedVariant
    ? parseFloat(selectedVariant.price)
    : parseFloat(product.priceRange.minVariantPrice?.amount || product.priceRange.maxVariantPrice.amount);

  // Xử lý thay đổi Option
  const handleOptionChange = (optionName: string, value: string) => {
    if (optionName === 'Phân loại') {
      // Tìm size đầu tiên khớp với phân loại vừa chọn
      const firstValidSize = product.variants?.find((v) =>
        v.selectedOptions.some((so) => so.name === 'Phân loại' && so.value === value)
      )?.selectedOptions.find((so) => so.name === 'Size')?.value;

      setSelectedOptions((prev) => ({
        ...prev,
        'Phân loại': value,
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
    
    addToCart({
      id: selectedVariant ? `${product.id}-${selectedVariant.id}` : product.id,
      handle: product.handle,
      title: `${product.title} ${selectedVariant ? `(${selectedVariant.title})` : ''}`,
      price: currentPrice,
      imageUrl: selectedImage,
      size: selectedOptions['Size'] || 'Mặc định',
      style: selectedOptions['Style'] || 'Mặc định',
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
        {/* BÊN TRÁI: KHUNG GALLERY HÌNH ẢNH */}
        <div className="space-y-4">
          <div className="flex justify-center bg-neutral-100 dark:bg-neutral-900 rounded-lg p-6 border border-neutral-200 dark:border-neutral-800">
            <img 
              src={selectedImage} 
              alt={product.featuredImage.altText || product.title} 
              className="max-h-[450px] w-full object-contain rounded transition-all duration-300"
            />
          </div>

          {/* DANH SÁCH THUMBNAIL */}
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

        {/* BÊN PHẢI: THÔNG TIN & MUA HÀNG */}
        <div className="flex flex-col justify-start space-y-6">
          <h1 className="text-4xl font-bold tracking-tight">{product.title}</h1>
          
          {/* HIỂN THỊ GIÁ ĐỘNG THEO VARIANT */}
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-500">
            {currentPrice.toLocaleString('vi-VN')} đ
          </div>
          
          <hr className="border-neutral-200 dark:border-neutral-800" />

          <form onSubmit={handleAddToCart} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* DỰNG DROPDOWN TỰ ĐỘNG CÓ RÀNG BUỘC PHÂN LOẠI & SIZE */}
              {product.options && product.options.length > 0 ? (
                product.options.map((option: ProductOption) => {
                  let availableValues = option.values;

                  // Lọc danh sách Size hiển thị dựa theo Phân loại đang chọn
                  if (option.name === 'Size' && selectedOptions['Phân loại'] && product.variants) {
                    const currentCategory = selectedOptions['Phân loại'];
                    availableValues = option.values.filter((sizeValue) =>
                      product.variants?.some((variant) =>
                        variant.selectedOptions.some((so) => so.name === 'Phân loại' && so.value === currentCategory) &&
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

              {/* SỐ LƯỢNG */}
              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-2 uppercase tracking-wider">
                  Số lượng
                </label>
                <input 
                  type="number" 
                  min="1" 
                  value={quantity} 
                  onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                  className="w-full bg-transparent border border-neutral-300 dark:border-neutral-700 rounded p-2 text-center text-sm h-[42px] focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <button 
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded transition-colors text-center block"
            >
              Add to Cart
            </button>
          </form>

          <hr className="border-neutral-200 dark:border-neutral-800" />

          {/* ƯU TIÊN MÔ TẢ THEO VARIANT NẾU CÓ */}
          <div className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed space-y-2 whitespace-pre-line">
            <p className="font-medium text-black dark:text-white">Mô tả sản phẩm:</p>
            <p>{selectedVariant?.description || product.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
}