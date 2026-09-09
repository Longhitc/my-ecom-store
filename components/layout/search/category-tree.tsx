'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

// Cho phép children lồng nhau nhiều cấp (Đệ quy)
interface CategoryNode {
  title: string;
  path: string;
  children?: CategoryNode[];
}

const ALL_CATEGORIES: CategoryNode[] = [
  {
    title: 'Hàng Có Sẵn',
    path: '/search/co-san',
    children: [
      { title: 'Thời Trang Nam Nữ', path: '/search/tt-namnu' },
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
    children: [
      { title: 'Váy Nữ', path: '/search/vay-nu' },
      { title: 'Áo Nữ', path: '/search/ao-nu' },
      { title: 'Set & Bộ', path: '/search/set-bo' },
    ],
  },
];

// Hàm tìm chuỗi menu kích hoạt từ Cấp 1 -> Cấp 2 -> Cấp 3
function findActiveChain(nodes: CategoryNode[], currentPath: string): CategoryNode[] | null {
  for (const node of nodes) {
    if (node.path === currentPath) {
      return [node];
    }
    if (node.children) {
      const childChain = findActiveChain(node.children, currentPath);
      if (childChain) {
        return [node, ...childChain];
      }
    }
  }
  return null;
}

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
  const activeChain = findActiveChain(ALL_CATEGORIES, pathname);

  // Nếu không tìm thấy đường dẫn (ví dụ 404), fallback lấy danh mục mặc định thay vì ẩn hoàn toàn
  const rootGroup = activeChain ? activeChain[0] : ALL_CATEGORIES[0];
  const subNodes = activeChain ? activeChain.slice(1) : (rootGroup.children || []);

  return (
    <div className="order-first w-full flex-none md:w-[200px]">
      <div className="w-full rounded-xl border border-neutral-800 bg-neutral-900/60 p-4">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-neutral-400">
          Danh mục đang xem
        </h3>
        <div className="space-y-2 text-sm">
          {/* Menu Cấp 1 */}
          {rootGroup && (
            <Link
              href={rootGroup.path}
              className={`block text-base font-bold transition-colors ${
                pathname === rootGroup.path ? 'text-blue-500' : 'text-white hover:text-blue-400'
              }`}
            >
              {rootGroup.title}
            </Link>
          )}

          {/* Các Menu Cấp 2 & Cấp 3 lồng nhau */}
          {subNodes.length > 0 && (
            <ul className="ml-2 space-y-2 border-l-2 border-neutral-800 pl-3 pt-2">
              {subNodes.map((node, index) => {
                const isActive = pathname === node.path;
                return (
                  <li key={node.path} style={{ paddingLeft: `${index * 8}px` }}>
                    <Link
                      href={node.path}
                      className={`block text-xs font-bold transition-colors ${
                        isActive ? 'text-blue-500' : 'text-neutral-300 hover:text-white'
                      }`}
                    >
                      ▸ {node.title}
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