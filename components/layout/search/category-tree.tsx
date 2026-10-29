'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SubChildNode {
  title: string;
  path: string;
}

interface ChildNode {
  title: string;
  path: string;
  children?: SubChildNode[];
}

// Danh sách menu chính thức (Không còn Hàng Có Sẵn / Hàng Order)
const ALL_CATEGORIES: ChildNode[] = [
  { title: 'Thời Trang Nam', path: '/search/tt-nam' },
  {
    title: 'Thời Trang Nữ',
    path: '/search/tt-nu',
    children: [
      { title: 'Váy Nữ', path: '/search/vay-nu' },
      { title: 'Áo Nữ', path: '/search/ao-nu' },
      { title: 'Set & Bộ', path: '/search/set-bo' },
    ],
  },
  { title: 'Thời Trang Trẻ Em', path: '/search/tt-te' },
  {
    title: 'Giày Dép Crocs',
    path: '/search/gd-crocs',
    children: [
      { title: 'Crocs Nam', path: '/search/crocs-nam' },
      { title: 'Crocs Nữ', path: '/search/crocs-nu' },
      { title: 'Crocs Trẻ Em', path: '/search/crocs-tre-em' },
      { title: 'Crocs Unisex', path: '/search/crocs-unisex' },
    ],
  },
  { title: 'Phụ Kiện', path: '/search/pk' },
];

export default function CategoryTree() {
  const pathname = usePathname();

  // 1. TRƯỜNG HỢP Ở TRANG SEARCH TỔNG (/search)
  if (pathname === '/search') {
    return (
      <div className="order-first w-full flex-none md:w-[80px] border-b border-neutral-200 dark:border-neutral-800 pb-2">
        <h3 className="text-xs font-semibold tracking-wider uppercase text-neutral-900 dark:text-neutral-400 whitespace-nowrap text-center">
          Tất cả sản phẩm
        </h3>      
      </div>
    );
  }

  // 2. TRƯỜNG HỢP VÀO DANH MỤC CỤ THỂ
  // Tìm danh mục cấp 1 hiện tại (Thời Trang Nam, Thời Trang Nữ, Giày Dép Crocs...)
  const activeCategory = ALL_CATEGORIES.find((cat) => {
    if (cat.path === pathname) return true;
    return cat.children?.some((sub) => sub.path === pathname);
  });

  if (!activeCategory) return null;

  // Tìm danh mục con cấp 2 (Váy Nữ, Áo Nữ, Crocs Nam...) nếu có
  const activeSubChild = activeCategory.children?.find((sub) => sub.path === pathname);

  return (
    <div className="order-first w-full flex-none md:w-[200px]">
      <div className="w-full rounded-xl border border-neutral-800 bg-neutral-900/60 p-4">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-neutral-400">
          Danh mục đang xem
        </h3>
        <div className="space-y-2 text-sm">
          {/* Danh mục chính */}
          <Link
            href={activeCategory.path}
            className={`block text-base font-bold transition-colors ${
              activeCategory.path === pathname && !activeSubChild ? 'text-blue-500' : 'text-white hover:text-blue-400'
            }`}
          >
            {activeCategory.title}
          </Link>

          {/* Các danh mục con bên trong (nếu có) */}
          {activeCategory.children && (
            <ul className="ml-2 space-y-1.5 border-l-2 border-neutral-800 pl-3 pt-2">
              {activeCategory.children.map((sub) => {
                const isSubActive = sub.path === pathname;
                return (
                  <li key={sub.path}>
                    <Link
                      href={sub.path}
                      className={`block text-xs font-medium transition-colors ${
                        isSubActive ? 'text-blue-400 font-bold' : 'text-neutral-400 hover:text-neutral-200'
                      }`}
                    >
                      • {sub.title}
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}