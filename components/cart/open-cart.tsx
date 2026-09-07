'use client';

import clsx from "clsx";
import { useCart } from "context/CartContext"; // 👈 Sửa lại đường dẫn import đúng với dự án của bạn

export default function OpenCart({
  className,
  quantity,
}: {
  className?: string;
  quantity?: number;
}) {
  const { totalItems, setIsCartOpen } = useCart();

  // Ưu tiên dùng quantity truyền vào, nếu không có sẽ tự lấy totalItems từ CartContext
  const displayQuantity = quantity ?? totalItems;

  return (
    <button
      type="button"
      aria-label="Open cart"
      onClick={() => setIsCartOpen(true)} // 👈 Bấm vào nút để bật giỏ hàng
      className="relative flex h-11 w-11 items-center justify-center rounded-md border border-neutral-200 text-black transition-colors dark:border-neutral-700 dark:text-white"
    >
      {/* 👜 Icon hình chiếc túi xách */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth="1.5"
        stroke="currentColor"
        className={clsx("h-4 w-4 transition-transform hover:scale-110", className)}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
        />
      </svg>

      {displayQuantity > 0 ? (
        <div className="absolute right-0 top-0 -mr-2 -mt-2 flex h-4 w-4 items-center justify-center rounded-sm bg-blue-600 text-[11px] font-medium text-white">
          {displayQuantity}
        </div>
      ) : null}
    </button>
  );
}