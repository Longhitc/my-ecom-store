  "use client";

  import React, { createContext, useContext, useState } from "react";

  export type CartItem = {
    id: string;
    handle: string;
    title: string;
    price: number;
    imageUrl: string;
    style: string;
    size: string;
    quantity: number;
  };

  interface CartContextType {
    cartItems: CartItem[];
    addToCart: (item: CartItem) => void;
    removeFromCart: (id: string, style: string, size: string) => void;
    updateQuantity: (id: string, style: string, size: string, delta: number) => void;
    isCartOpen: boolean;
    setIsCartOpen: (open: boolean) => void;
    totalCount: number;
    totalAmount: number;
    totalItems: number;
  }

  const CartContext = createContext<CartContextType | undefined>(undefined);

  export function CartProvider({ children }: { children: React.ReactNode }) {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [isCartOpen, setIsCartOpen] = useState(false);

    // Thêm sản phẩm vào giỏ hàng
    const addToCart = (newItem: CartItem) => {
      setCartItems((prev) => {
        const addQty = Number(newItem.quantity) || 1;

        const existingIndex = prev.findIndex(
          (i) => i.id === newItem.id && i.style === newItem.style && i.size === newItem.size
        );

        if (existingIndex > -1) {
          const updatedItems = [...prev];
          const currentQty = Number(updatedItems[existingIndex]?.quantity) || 0;

          updatedItems[existingIndex] = {
            ...updatedItems[existingIndex]!,
            quantity: currentQty + addQty,
          };

          return updatedItems;
        }
        return [...prev, newItem];
      });
      setIsCartOpen(true); // Tự động mở giỏ hàng khi bấm thêm
    };

    // Xóa sản phẩm khỏi giỏ hàng
    const removeFromCart = (id: string, style: string, size: string) => {
      setCartItems((prev) =>
        prev.filter((i) => !(i.id === id && i.style === style && i.size === size))
      );
    };

    // Cập nhật số lượng (+ / -)
    const updateQuantity = (id: string, style: string, size: string, delta: number) => {
      setCartItems((prev) =>
        prev.map((i) => {
          if (i.id === id && i.style === style && i.size === size) {
            const newQty = i.quantity + delta;
            return newQty > 0 ? { ...i, quantity: newQty } : i;
          }
          return i;
        })
      );
    };

    // Tính tổng số lượng & tổng tiền
    const totalCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
    const totalAmount = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

    // Tổng số loại món hàng khác nhau trong giỏ
    const totalItems = cartItems.length;

    return (
      <CartContext.Provider
        value={{
          cartItems,
          addToCart,
          removeFromCart,
          updateQuantity,
          isCartOpen,
          setIsCartOpen,
          totalCount,
          totalAmount,
          totalItems,
        }}
      >
        {children}
      </CartContext.Provider>
    );
  }

  export function useCart() {
    const context = useContext(CartContext);
    if (!context) {
      throw new Error("useCart must be used within a CartProvider");
    }
    return context;
  }