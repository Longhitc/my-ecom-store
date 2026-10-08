"use client";

import { useAuth } from "context/auth-context"; // Đổi đường dẫn phù hợp với auth context của bạn
import { useRouter } from "next/navigation";
import { useCart } from "../../context/CartContext";

export default function CartDrawer() {
  const { cartItems, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity, totalAmount } = useCart();
  const { customer } = useAuth();
  const router = useRouter();

  if (!isCartOpen) return null;

  // Xử lý logic khi nhấn nút Đặt Hàng
  const handleCheckout = () => {
    setIsCartOpen(false);

    if (!customer) {
      router.push("/login");
    } else {
      router.push("/checkout");
    }
  };

  return (
    // Nâng z-index lên z-[9999] để nằm trên tất cả Navbar/Header
    <div className="fixed inset-0 z-[9999] overflow-hidden">
      {/* Lớp nền đen làm mờ */}
      <div 
        className="fixed inset-0 bg-black/50 transition-opacity" 
        onClick={() => setIsCartOpen(false)} 
      />

      {/* Container giỏ hàng full màn hình mobile, max-w-md trên desktop */}
      <div className="fixed inset-y-0 right-0 w-full sm:max-w-md flex">
        <div className="w-full h-full bg-white dark:bg-neutral-900 text-black dark:text-white shadow-2xl flex flex-col justify-between border-l border-neutral-200 dark:border-neutral-800">
          
          {/* Header Giỏ hàng */}
          <div className="p-4 sm:p-6 flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
            <h2 className="text-lg sm:text-xl font-bold">Giỏ hàng của bạn</h2>
            <button 
              onClick={() => setIsCartOpen(false)}
              className="p-2 text-neutral-500 hover:text-black dark:hover:text-white text-lg leading-none"
            >
              ✕
            </button>
          </div>

          {/* Danh sách sản phẩm */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {cartItems.length === 0 ? (
              <div className="text-center py-12 text-neutral-500 text-sm">
                Giỏ hàng của bạn đang trống.
              </div>
            ) : (
              cartItems.map((item, index) => (
                <div 
                  key={`${item.id}-${item.style}-${item.size}-${index}`} 
                  className="flex gap-3 sm:gap-4 border-b border-neutral-100 dark:border-neutral-800 pb-4"
                >
                  <img 
                    src={item.imageUrl} 
                    alt={item.title} 
                    className="w-16 h-16 sm:w-20 sm:h-20 object-cover bg-neutral-100 dark:bg-neutral-800 rounded-lg p-1 shrink-0" 
                  />
                  
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <h3 className="text-xs sm:text-sm font-semibold line-clamp-2 leading-snug pr-1">
                          {item.title}
                        </h3>
                        <span className="text-xs sm:text-sm font-bold shrink-0 text-amber-600 dark:text-amber-400">
                          {Number(item.price * item.quantity).toLocaleString('vi-VN')} đ
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-400 mt-1">
                        Style: {item.style} | Size: {item.size}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-1">
                      {/* Tăng giảm số lượng */}
                      <div className="flex items-center border border-neutral-300 dark:border-neutral-700 rounded">
                        <button 
                          onClick={() => updateQuantity(item.id, item.style, item.size, -1)}
                          className="px-2 py-0.5 text-xs hover:bg-neutral-200 dark:hover:bg-neutral-800"
                        >
                          -
                        </button>
                        <span className="px-2.5 text-xs font-semibold">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, item.style, item.size, 1)}
                          className="px-2 py-0.5 text-xs hover:bg-neutral-200 dark:hover:bg-neutral-800"
                        >
                          +
                        </button>
                      </div>

                      {/* Nút xóa */}
                      <button 
                        onClick={() => removeFromCart(item.id, item.style, item.size)}
                        className="text-xs text-red-500 hover:underline"
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Tổng tiền & Thanh toán */}
          {cartItems.length > 0 && (
            <div className="p-4 sm:p-6 border-t border-neutral-200 dark:border-neutral-800 space-y-4 bg-neutral-50 dark:bg-neutral-900/50">
              <div className="flex justify-between items-center text-base sm:text-lg font-bold">
                <span>Tổng tiền:</span>
                <span className="text-amber-600 dark:text-amber-400">
                  {Number(totalAmount).toLocaleString('vi-VN')} đ
                </span>
              </div>
              
              {/* Nút Đặt hàng */}
              <button 
                onClick={handleCheckout}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors text-center block text-sm sm:text-base shadow-sm"
              >
                Đặt Hàng
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}