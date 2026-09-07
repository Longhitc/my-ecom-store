"use client";

import Link from 'next/link';
import { useCart } from "../../context/CartContext";

export default function CartDrawer() {
  const { cartItems, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity, totalAmount } = useCart();

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Lớp nền đen làm mờ */}
      <div 
        className="fixed inset-0 bg-black/50 transition-opacity" 
        onClick={() => setIsCartOpen(false)} 
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-neutral-900 text-black dark:text-white shadow-xl flex flex-col justify-between border-l border-neutral-200 dark:border-neutral-800">
          
          {/* Header Giỏ hàng */}
          <div className="p-6 flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800">
            <h2 className="text-xl font-bold">Giỏ hàng của bạn</h2>
            <button 
              onClick={() => setIsCartOpen(false)}
              className="p-2 text-neutral-500 hover:text-black dark:hover:text-white"
            >
              ✕
            </button>
          </div>

          {/* Danh sách sản phẩm */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {cartItems.length === 0 ? (
              <div className="text-center py-12 text-neutral-500">
                Giỏ hàng của bạn đang trống.
              </div>
            ) : (
              cartItems.map((item, index) => (
                <div key={`${item.id}-${item.style}-${item.size}-${index}`} className="flex space-x-4 border-b border-neutral-200 dark:border-neutral-800 pb-4">
                  <img src={item.imageUrl} alt={item.title} className="w-20 h-20 object-contain bg-neutral-100 dark:bg-neutral-800 rounded p-1" />
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between font-medium">
                        <h3 className="line-clamp-1">{item.title}</h3>
                        <span>{Number(item.price * item.quantity).toLocaleString('en-US')} đ</span>
                      </div>
                      <p className="text-xs text-neutral-400 mt-1">Style: {item.style} | Size: {item.size}</p>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      {/* Tăng giảm số lượng */}
                      <div className="flex items-center border border-neutral-300 dark:border-neutral-700 rounded">
                        <button 
                          onClick={() => updateQuantity(item.id, item.style, item.size, -1)}
                          className="px-2 py-0.5 text-sm hover:bg-neutral-200 dark:hover:bg-neutral-800"
                        >
                          -
                        </button>
                        <span className="px-3 text-sm">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, item.style, item.size, 1)}
                          className="px-2 py-0.5 text-sm hover:bg-neutral-200 dark:hover:bg-neutral-800"
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
            <div className="p-6 border-t border-neutral-200 dark:border-neutral-800 space-y-4">
              <div className="flex justify-between text-lg font-bold">
                <span>Tổng tiền:</span>
                <span>{Number(totalAmount).toLocaleString('en-US')} đ</span>
              </div>
              {/*<button 
                onClick={() => alert("Chức năng đặt hàng thành công!")}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded transition-colors text-center block"
              >
                Đặt Hàng
              </button>*/}
              <Link 
                href="/checkout"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded transition-colors text-center block"
              >
                Đặt Hàng
              </Link>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}