import type { NextConfig } from 'next';
// @ts-ignore
import withPWAInit from 'next-pwa';

const withPWA = withPWAInit({
  dest: 'public',
  register: true,
  skipWaiting: true,      // Ép Service Worker mới kích hoạt ngay lập tức bỏ qua hàng đợi
  clientsClaim: true,     // Chiếm quyền điều khiển các client/tab đang mở ngay lập tức
  disable: false,
});

const nextConfig: NextConfig = {
  turbopack: {},
  experimental: {
    ppr: true,
    inlineCss: true,
    useCache: true,
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.shopify.com",
        pathname: "/s/files/**",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      }
    ],
  },
  // Bổ sung headers ép trình duyệt không cache tầng HTML/Page để luôn nhận diện bản deploy mới nhất
  async headers() {
    return [
      {
        source: '/((?!_next/static|_next/image|favicon.ico).*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate, proxy-revalidate',
          },
          {
            key: 'Pragma',
            value: 'no-cache',
          },
          {
            key: 'Expires',
            value: '0',
          },
        ],
      },
    ];
  },
};

export default withPWA(nextConfig);