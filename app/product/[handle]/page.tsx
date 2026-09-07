"use client";

import { useCart } from 'context/CartContext';
import React, { use, useState } from 'react';

// Mảng mockProducts đồng bộ chính xác với trang main của bạn
const mockProducts = [
  {
    id: '1',
    handle: 'leather-bag',
    title: 'Túi đeo da',
    description: 'Túi da phong cách',
    priceRange: { maxVariantPrice: { amount: '360000', currencyCode: 'VND' } },
    featuredImage: {
      url: 'https://res.cloudinary.com/dpsejpp2/image/upload/v1786590887/samples/ecommerce/leather-bag-gray.jpg', // Dùng link ảnh sạch
      altText: 'Bag'
    }
  },
  {
    id: '2',
    handle: 'acme-circles-t-shirt',
    title: 'Giày thể thao',
    description: 'Giày họa tiết',
    priceRange: { maxVariantPrice: { amount: '220000', currencyCode: 'VND' } },
    featuredImage: {
      url: 'https://res.cloudinary.com/dpsejpp2/image/upload/v1786590885/samples/ecommerce/shoes.png',
      altText: 'T-Shoes'
    }
  },
  {
    id: '3',
    handle: 'acme-mug',
    title: 'Ly sứ',
    description: 'Ly sứ giữ nhiệt',
    priceRange: { maxVariantPrice: { amount: '85000', currencyCode: 'VND' } },
    featuredImage: {
      url: 'https://res.cloudinary.com/dpsejpp2/image/upload/v1786590894/samples/cup-on-a-table.jpg',
      altText: 'Cup'
    }
  },
  // --- DÒNG 2 ---
  {
    id: '4',
    handle: 'acme-tshirt',
    title: 'Giày Crocks Tím',
    description: 'Áo thun thời trang',
    priceRange: { maxVariantPrice: { amount: '250000', currencyCode: 'VND' } },
    featuredImage: {
      url: 'https://res.cloudinary.com/dpsejpp2/image/upload/v1786594570/766aa432919310cd4982.jpg',
      altText: 'T-Shirt'
    }
  },
  {
    id: '5',
    handle: 'acme-hat-2',
    title: 'Dép Crocks xỏ ngón',
    description: 'Mũ len ấm áp',
    priceRange: { maxVariantPrice: { amount: '170000', currencyCode: 'VND' } },
    featuredImage: {
      url: 'https://res.cloudinary.com/dpsejpp2/image/upload/v1786594570/b5c5d1d2e473652d3c62.jpg',
      altText: 'Hat 2'
    }
  },
  {
    id: '6',
    handle: 'acme-mug-2',
    title: 'Giày Crocks Mickey',
    description: 'Ly sứ cao cấp',
    priceRange: { maxVariantPrice: { amount: '180000', currencyCode: 'VND' } },
    featuredImage: {
      url: 'https://res.cloudinary.com/dpsejpp2/image/upload/v1786594570/34ee35a00001815fd810.jpg',
      altText: 'Mug 2'
    }
  }
];

export default function ProductPage({ params }: { params: Promise<{ handle: string }> }) {
  // 2. Unwrap params bằng React.use()
  const resolvedParams = use(params);
  const { addToCart, setIsCartOpen } = useCart();

  const [quantity, setQuantity] = useState(1);
  const [style, setStyle] = useState('Straight-cut');
  const [size, setSize] = useState('X-Large');

  // Tìm sản phẩm có handle khớp với URL, nếu không tìm thấy sẽ lấy sản phẩm đầu tiên làm mặc định
  const product = mockProducts.find((p) => p.handle === resolvedParams.handle) || mockProducts[0]!;

  if (!product) return null;
  // 3. Hàm xử lý Thêm vào giỏ hàng thật
  const handleAddToCart = (e: React.FormEvent) => {
    e.preventDefault();
    
    addToCart({
      id: product.id,
      handle: product.handle,
      title: product.title,
      price: parseFloat(product.priceRange.maxVariantPrice.amount),
      imageUrl: product.featuredImage.url,
      style,
      size,
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
        {/* BÊN TRÁI: HÌNH ẢNH */}
        <div className="space-y-4">
          <div className="flex justify-center bg-neutral-100 dark:bg-neutral-900 rounded-lg p-6 border border-neutral-200 dark:border-neutral-800">
            <img 
              src={product.featuredImage.url} 
              alt={product.featuredImage.altText || product.title} 
              className="max-h-[450px] object-contain rounded"
            />
          </div>
        </div>

        {/* BÊN PHẢI: THÔNG TIN & FORM MUA HÀNG */}
        <div className="flex flex-col justify-start space-y-6">
          <h1 className="text-4xl font-bold tracking-tight">{product.title}</h1>
          
          <div className="text-2xl font-semibold text-neutral-700 dark:text-neutral-300">
            {/* Format số có dấu phẩy phân cách hàng nghìn và thêm chữ 'đ' phía sau */}
            {Number(product.priceRange.maxVariantPrice.amount).toLocaleString('en-US')} đ
          </div>
          
          <hr className="border-neutral-200 dark:border-neutral-800" />

          <form onSubmit={handleAddToCart} className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              {/* Style Dropdown */}
              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-2">Style</label>
                <select 
                  value={style}
                  onChange={(e) => setStyle(e.target.value)}
                  className="w-full bg-transparent border border-neutral-300 dark:border-neutral-700 rounded p-2.5 text-sm focus:outline-none focus:border-blue-500"
                >
                  <option value="Straight-cut" className="dark:bg-neutral-900">Straight-cut</option>
                  <option value="Slim-fit" className="dark:bg-neutral-900">Slim-fit</option>
                </select>
              </div>

              {/* Size Dropdown */}
              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-2">Size</label>
                <select 
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                  className="w-full bg-transparent border border-neutral-300 dark:border-neutral-700 rounded p-2.5 text-sm focus:outline-none focus:border-blue-500"
                >
                  <option value="X-Large" className="dark:bg-neutral-900">X-Large</option>
                  <option value="Large" className="dark:bg-neutral-900">Large</option>
                  <option value="Medium" className="dark:bg-neutral-900">Medium</option>
                  <option value="Small" className="dark:bg-neutral-900">Small</option>
                </select>
              </div>

              {/* Quantity Input */}
              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-2">Quantity</label>
                <input 
                  type="number" 
                  min="1" 
                  value={quantity} 
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-full bg-transparent border border-neutral-300 dark:border-neutral-700 rounded p-2 text-center text-sm h-[42px] focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* NÚT ADD TO CART */}
            <button 
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded transition-colors text-center block"
            >
              Add to Cart
            </button>
          </form>

          <hr className="border-neutral-200 dark:border-neutral-800" />

          {/* Phần mô tả */}
          <div className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed space-y-2">
            <p className="font-medium text-black dark:text-white">Mô tả sản phẩm:</p>
            <p>{product.description}</p>
            <p>• Hệ thống dữ liệu hoạt động mượt mà ở chế độ Giả lập (Mock mode).</p>
          </div>
        </div>
      </div>
    </div>
  );
}