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

interface CategoryNode {
  title: string;
  path: string;
  children?: ChildNode[];
}

const ALL_CATEGORIES: CategoryNode[] = [
  {
    title: 'Hàng Có Sẵn',
    path: '/search/co-san',
    children: [
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
        title: 'Giày Dép Crocks',
        path: '/search/gd-crocs',
        children: [
          { title: 'Crocs Nam', path: '/search/crocs-nam' },
          { title: 'Crocs Nữ', path: '/search/crocs-nu' },
          { title: 'Crocs Trẻ Em', path: '/search/crocs-tre-em' },
          { title: 'Crocs Unisex', path: '/search/crocs-unisex' },
        ],
      },
      { title: 'Phụ Kiện', path: '/search/pk' },
    ],
  },
  {
    title: 'Hàng Order',
    path: '/search/order',
    children: [],
  },
];

export default function CategoryTree() {
  const pathname = usePathname();

  // 1. TRƯỜNG HỢP Ở TRANG SEARCH TỔNG (/search)
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
  // Tìm nhóm cha cấp 1 (Hàng Có Sẵn / Hàng Order)
  const activeGroup = ALL_CATEGORIES.find((group) => {
    if (group.path === pathname) return true;
    return group.children?.some((child) => {
      if (child.path === pathname) return true;
      return child.children?.some((sub) => sub.path === pathname);
    });
  });

  if (!activeGroup) return null;

  // Tìm danh mục cấp 2 (Thời Trang Nam, Thời Trang Nữ, Giày Dép Crocks...)
  const activeChild = activeGroup.children?.find((child) => {
    if (child.path === pathname) return true;
    return child.children?.some((sub) => sub.path === pathname);
  });

  // Tìm danh mục cấp 3 (Váy Nữ, Áo Nữ, Crocs Nam...)
  const activeSubChild = activeChild?.children?.find((sub) => sub.path === pathname);

  return (
    <div className="order-first w-full flex-none md:w-[200px]">
      <div className="w-full rounded-xl border border-neutral-800 bg-neutral-900/60 p-4">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-neutral-400">
          Danh mục đang xem
        </h3>
        <div className="space-y-2 text-sm">
          {/* Cấp 1 */}
          <Link href={activeGroup.path} className="block text-base font-bold text-white hover:text-blue-400">
            {activeGroup.title}
          </Link>

          {/* Cấp 2 */}
          {activeChild && (
            <ul className="ml-2 space-y-2 border-l-2 border-neutral-800 pl-3 pt-2">
              <li>
                <Link
                  href={activeChild.path}
                  className={`block text-xs font-bold transition-colors ${
                    activeChild.path === pathname && !activeSubChild ? 'text-blue-500' : 'text-neutral-300 hover:text-white'
                  }`}
                >
                  ▸ {activeChild.title}
                </Link>

                {/* Cấp 3 (Váy Nữ / Áo Nữ / Crocs Nam...) */}
                {activeChild.children && (
                  <ul className="ml-2 mt-2 space-y-1.5 border-l border-neutral-700 pl-2.5">
                    {activeChild.children.map((sub) => {
                      const isSubActive = sub.path === pathname;
                      return (
                        <li key={sub.path}>
                          <Link
                            href={sub.path}
                            className={`block text-[11px] font-medium transition-colors ${
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
              </li>
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}