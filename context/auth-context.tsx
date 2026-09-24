'use client';

import { createContext, useContext, useEffect, useState } from 'react';

// 1. Khai báo kiểu dữ liệu Admin chi tiết
export type AdminData = {
  role_id?: string;
  role_name?: string;
  roleName?: string;
  allowed_menus?: string[];
  allowedMenus?: string[];
} | null;

// 2. Thêm thuộc tính admin vào type Customer
export type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  admin?: AdminData;
} | null;

type AuthContextType = {
  customer: Customer;
  setCustomer: (customer: Customer) => void;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  customer: null,
  setCustomer: () => {},
  logout: async () => {},
  checkAuth: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [customer, setCustomer] = useState<Customer>(null);

  // Hàm gọi API lấy thông tin session người dùng từ Cookie
  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        if (data.customer) {
          setCustomer(data.customer);
        } else {
          setCustomer(null);
        }
      } else {
        setCustomer(null);
      }
    } catch (err) {
      console.error('Lỗi kết nối Auth Context:', err);
      setCustomer(null);
    }
  };

  // Tự động chạy khi ứng dụng tải lại (F5)
  useEffect(() => {
    checkAuth();
  }, []);

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      console.error('Lỗi đăng xuất:', e);
    }
    setCustomer(null);
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider value={{ customer, setCustomer, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);