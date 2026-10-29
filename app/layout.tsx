import AutoPwaPopup from "components/AutoPwaPopup";
import CartDrawer from "components/cart/CartDrawer";
import ChatWidget from "components/ChatWidget";
import Footer from "components/layout/footer";
import Navbar from "components/layout/navbar";
import PwaRegister from "components/PwaRegister";
import { AuthProvider } from 'context/auth-context';
import { CartProvider } from 'context/CartContext';
// @ts-ignore
import { GeistSans } from "geist/font/sans";
import { getCart } from "lib/shopify";
import { baseUrl } from "lib/utils";
import type { Metadata } from 'next';
import { ReactNode } from "react";
// @ts-ignore
import { Toaster } from "sonner";
// @ts-ignore
import "./globals.css";

// Cấu hình tiêu đề chuẩn theo yêu cầu của anh
export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: 'Đẹp & Xinh - Shop',
    template: `%s | Đẹp & Xinh - Shop`,
  },
  description: 'Hệ thống thời trang và giày dép, phụ kiện',
  robots: {
    follow: true,
    index: true,
  },
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
  },
};

// Component con xử lý tự động bắt sự kiện update ngầm của Service Worker
function ServiceWorkerAutoUpdater() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          if ('serviceWorker' in navigator) {
            navigator.serviceWorker.ready.then((registration) => {
              registration.addEventListener('updatefound', () => {
                const newWorker = registration.installing;
                if (newWorker) {
                  newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                      window.location.reload();
                    }
                  });
                }
              });
            });
          }
        `,
      }}
    />
  );
}

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const cart = getCart();

  return (
    <html lang="en" className={GeistSans.variable}>
      <head>
        <ServiceWorkerAutoUpdater />
      </head>
      <body className="bg-neutral-50 text-black selection:bg-teal-300 dark:bg-neutral-900 dark:text-white dark:selection:bg-pink-500 dark:selection:text-white">
        <AuthProvider>
          <CartProvider>
            <Navbar />
            <main>
              {children}
              <Toaster closeButton />
            </main>         

            <Footer />

            <CartDrawer />
            <ChatWidget />
            <PwaRegister />
            <AutoPwaPopup />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}