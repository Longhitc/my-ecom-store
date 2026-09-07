'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface CategoryNode {
  title: string;
  path: string;
  children?: { title: string; path: string }[];
}

const ALL_CATEGORIES: CategoryNode[] = [
  {
    title: 'Hàng Có Sẵn',
    path: '/search/co-san',
    children: [
      { title: 'Thời Trang Nữ', path: '/search/tt-nu' },
      { title: 'Thời Trang Trẻ Em', path: '/search/tt-te' },
      { title: 'Thời Trang Nam', path: '/search/tt-nam' },
      { title: 'Phụ Kiện', path: '/search/pk' },
    ],
  },
  {
    title: 'Hàng Order',
    path: '/search/order',
    children: [
      { title: 'Váy Nữ', path: '/search/vay-nu' },
      { title: 'Áo Nữ', path: '/search/ao-nu' },
    ],
  },
];

export default function CategoryTree() {
  const pathname = usePathname();

  // 1. TRƯỜNG HỢP Ở TRANG SEARCH TỔNG (/search)
  // Bỏ hẳn chữ "DANH MỤC ĐANG XEM", chỉ hiện duy nhất chữ "Tất cả sản phẩm"
  if (pathname === '/search') {
    return (
      <div className="order-first w-full flex-none md:w-[200px]">
        <div className="w-full rounded-xl border border-neutral-800 bg-neutral-900/60 p-4">
          <span className="block text-base font-bold text-white">
            Tất cả sản phẩm
          </span>
        </div>
      </div>
    );
  }

  // 2. TRƯỜNG HỢP VÀO DANH MỤC CỤ THỂ
  const activeGroup = ALL_CATEGORIES.find((group) =>
    group.children?.some((child) => child.path === pathname) || group.path === pathname
  );

  if (!activeGroup) return null;

  const activeChild = activeGroup.children?.find((child) => child.path === pathname);

  return (
    <div className="order-first w-full flex-none md:w-[200px]">
      <div className="w-full rounded-xl border border-neutral-800 bg-neutral-900/60 p-4">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-neutral-400">
          Danh mục đang xem
        </h3>
        <div className="space-y-2 text-sm">
          <span className="block text-base font-bold text-white">
            {activeGroup.title}
          </span>
          {activeChild && (
            <ul className="ml-2 space-y-2 border-l-2 border-neutral-800 pl-3 pt-2">
              <li>
                <Link
                  href={activeChild.path}
                  className="block text-xs font-bold text-blue-500 transition-colors"
                >
                  ▸ {activeChild.title}
                </Link>
              </li>
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}