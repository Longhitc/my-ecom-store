"use client";

import { PlusIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";
import { useCart } from "context/CartContext";
import { Product, ProductVariant } from "lib/shopify/types";
import { useSearchParams } from "next/navigation";

export function AddToCart({ product }: { product: Product }) {
  console.log("👀 Component AddToCart đã render!", { product });

  const { variants, availableForSale } = product;
  const { addToCart } = useCart(); // addToCart trong CartContext đã tự gọi setIsCartOpen(true) rồi
  const searchParams = useSearchParams();

  // 1. Tìm variant khớp với URL (nếu có)
  const variant = variants?.find((v: ProductVariant) =>
    v.selectedOptions?.every(
      (option) => option.value === searchParams?.get(option.name.toLowerCase())
    )
  );

  // 2. Lấy variant mặc định nếu không chọn (tránh bị undefined)
  const finalVariant = variant || variants?.[0];

  // 3. Hàm xử lý Click bấm nút
  const handleAddToCart = () => {
    console.log("🔥 Đã bấm Add to cart!"); // Mở F12 kiểm tra log này

    const selectedStyle =
      searchParams?.get("style") || searchParams?.get("color") || "Default";
    const selectedSize = searchParams?.get("size") || "M";

    const itemToAdd = {
      id: product.id || product.handle,
      handle: product.handle || "",
      title: product.title,
      price: parseFloat(
        finalVariant?.price?.amount ||
          product.priceRange?.maxVariantPrice?.amount ||
          "0"
      ),
      imageUrl: product.featuredImage?.url || product.images?.[0]?.url || "",
      style: selectedStyle,
      size: selectedSize,
      quantity: 1,
    };

    addToCart(itemToAdd);
  };

  const buttonClasses =
    "relative flex w-full items-center justify-center rounded-full bg-blue-600 p-4 tracking-wide text-white transition-opacity font-medium hover:opacity-90 active:scale-95";

  // Nếu hết hàng hoàn toàn
  if (!availableForSale) {
    return (
      <button disabled className={clsx(buttonClasses, "cursor-not-allowed opacity-60")}>
        Out Of Stock
      </button>
    );
  }

  // Nút chạy ngon lành
  return (
    <button
      type="button"
      onClick={handleAddToCart}
      className={buttonClasses}
    >
      <div className="absolute left-0 ml-4">
        <PlusIcon className="h-5" />
      </div>
      Add To Cart
    </button>
  );
}