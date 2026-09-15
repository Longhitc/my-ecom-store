'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string;
} | null;

type AuthContextType = {
  customer: Customer;
  setCustomer: (customer: Customer) => void;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  customer: null,
  setCustomer: () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [customer, setCustomer] = useState<Customer>(null);

  // Khi tải lại trang / F5, gọi API lấy thông tin từ Cookie
  useEffect(() => {
    async function fetchCustomer() {
      try {
        const res = await fetch('/api/auth/me');
        const data = await res.json();
        if (data.customer) {
          setCustomer(data.customer);
        }
      } catch (err) {
        console.error('Lỗi kết nối Auth Context:', err);
      }
    }
    fetchCustomer();
  }, []);

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {}
    setCustomer(null);
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider value={{ customer, setCustomer, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);