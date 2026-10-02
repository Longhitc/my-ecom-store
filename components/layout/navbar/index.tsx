'use client';

import OpenCart from "components/cart/open-cart";
import LogoSquare from "components/logo-square";
import { useAuth } from "context/auth-context";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useState } from "react";
import MobileMenu from "./mobile-menu";
import Search, { SearchSkeleton } from "./search";

interface MenuItem {
  title: string;
  path: string;
  items?: MenuItem[];
}

function AdminMenu({ user }: { user: any }) {
  const pathname = usePathname();
  const isAdmin = user?.is_admin === true || Number(user?.is_admin) === 1;
  
  if (!isAdmin) return null;

  const allowedMenus = user?.admin?.allowed_menus || user?.admin?.allowedMenus || [];

  if (!allowedMenus.length) return null;

  return (
    <div className="w-full border-b border-neutral-800 bg-neutral-900 px-3 py-2 text-xs text-white overflow-x-auto">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-1.5 sm:flex-row sm:justify-between">
        <div className="flex items-center gap-1 text-center font-bold text-amber-400 shrink-0">
          <span>🛠</span>
          <span>[{user?.admin?.role_name || user?.admin?.roleName || 'Admin'}]</span>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
          {allowedMenus.includes('orders') && (
            <Link 
              href="/admin/orders" 
              className={`rounded px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap ${
                pathname === '/admin/orders'
                  ? 'bg-neutral-800 font-semibold text-amber-400'
                  : 'bg-neutral-800/60 text-neutral-300 hover:bg-neutral-800 hover:text-white'
              }`}
            >
              Quản lý đơn hàng
            </Link>
          )}

          {allowedMenus.includes('products') && (
            <Link 
              href="/admin/products" 
              className={`rounded px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap ${
                pathname === '/admin/products'
                  ? 'bg-neutral-800 font-semibold text-amber-400'
                  : 'bg-neutral-800/60 text-neutral-300 hover:bg-neutral-800 hover:text-white'
              }`}
            >
              Quản lý sản phẩm
            </Link>
          )}

          {allowedMenus.includes('customers') && (
            <Link 
              href="/admin/customers" 
              className={`rounded px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap ${
                pathname === '/admin/customers'
                  ? 'bg-neutral-800 font-semibold text-amber-400'
                  : 'bg-neutral-800/60 text-neutral-300 hover:bg-neutral-800 hover:text-white'
              }`}
            >
              Quản lý khách hàng
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

function SubMenuItem({ subItem, onClose }: { subItem: MenuItem; onClose: () => void }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <li className="w-full">
      <Link
        href={subItem.path}
        onClick={onClose}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`flex w-full items-center gap-2.5 rounded-md px-3 py-2.5 text-xs font-semibold transition-all ${
          isHovered 
            ? 'bg-neutral-200 text-amber-600 dark:bg-neutral-800 dark:text-amber-400' 
            : 'text-neutral-700 dark:text-neutral-300'
        }`}
      >
        <span className={`h-2 w-2 shrink-0 rounded-full transition-colors ${
          isHovered ? 'bg-amber-500' : 'bg-neutral-400 dark:bg-neutral-500'
        }`}></span>
        <span className="truncate">{subItem.title}</span>
      </Link>
    </li>
  );
}

export default function Navbar() {
  const { customer, logout } = useAuth();
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const menu: MenuItem[] = [
    { title: 'Trang Chủ', path: '/search' },
    { title: 'Thời Trang Nam', path: '/search/tt-nam' },
    {
      title: 'Thời Trang Nữ',
      path: '/search/tt-nu',
      items: [
        { title: 'Váy Nữ', path: '/search/vay-nu' },
        { title: 'Áo Nữ', path: '/search/ao-nu' },
        { title: 'Set & Bộ', path: '/search/set-bo' },
      ],
    },
    { title: 'Thời Trang Trẻ Em', path: '/search/tt-te' },
    {
      title: 'Giày dép Crocs',
      path: '/search/gd-crocs',
      items: [
        { title: 'Crocs Nam', path: '/search/crocs-nam' },
        { title: 'Crocs Nữ', path: '/search/crocs-nu' },
        { title: 'Crocs Trẻ Em', path: '/search/crocs-tre-em' },
        { title: 'Crocs Unisex', path: '/search/crocs-unisex' },
      ],
    },
    { title: 'Phụ Kiện', path: '/search/pk' },
  ];

  return (
    <header className="relative z-[100] w-full max-w-full overflow-x-clip">
      <AdminMenu user={customer} />

      <nav className="relative z-[100] flex items-center justify-between bg-white px-3 py-2.5 dark:bg-black sm:px-6">
        
        {/* 1. KHỐI TRÁI: Menu Hamburger + Logo (shrink-0) */}
        <div className="flex shrink-0 items-center gap-2 sm:gap-6">
          <div className="block flex-none md:hidden">
            <Suspense fallback={null}>
              <MobileMenu menu={menu as any} />
            </Suspense>
          </div>

          <Link
            href="/"
            prefetch={true}
            className="flex shrink-0 items-center justify-center"
          >
            <LogoSquare />
            <div className="ml-2 hidden shrink-0 text-sm font-medium uppercase text-black dark:text-white lg:block">
              Đẹp và Xinh Shop
            </div>
          </Link>

          {/* Menu Desktop */}
          {menu.length ? (
            <ul className="hidden gap-6 text-sm md:flex md:items-center">
              {menu.map((item) => {
                const hasChildren = item.items && item.items.length > 0;
                const isOpen = openMenu === item.title;

                return (
                  <li 
                    key={item.title} 
                    className="relative z-[100] py-2"
                    onMouseEnter={() => hasChildren && setOpenMenu(item.title)}
                    onMouseLeave={() => hasChildren && setOpenMenu(null)}
                  >
                    {hasChildren ? (
                      <button 
                        type="button"
                        onClick={() => setOpenMenu(isOpen ? null : item.title)}
                        className="flex items-center gap-1 whitespace-nowrap text-neutral-700 transition-colors hover:text-black dark:text-neutral-400 dark:hover:text-white"
                      >
                        {item.title}
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth="1.5"
                          stroke="currentColor"
                          className={`h-3.5 w-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                        </svg>
                      </button>
                    ) : (
                      <Link
                        href={item.path}
                        prefetch={true}
                        className="flex items-center gap-1 whitespace-nowrap text-neutral-700 transition-colors hover:text-black dark:text-neutral-400 dark:hover:text-white"
                      >
                        {item.title}
                      </Link>
                    )}

                    {hasChildren && isOpen && (
                      <div className="absolute left-0 top-full z-[9999] w-52 pt-1">
                        <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white p-1.5 shadow-2xl dark:border-neutral-700 dark:bg-neutral-900">
                          <ul className="flex flex-col gap-1">
                            {item.items!.map((subItem) => (
                              <SubMenuItem 
                                key={subItem.title} 
                                subItem={subItem} 
                                onClose={() => setOpenMenu(null)} 
                              />
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          ) : null}
        </div>

        {/* Tìm kiếm Desktop */}
        <div className="hidden max-w-md flex-1 justify-end md:flex">
          <Suspense fallback={<SearchSkeleton />}>
            <Search />
          </Suspense>
        </div>

        {/* 2. KHỐI GIỮA (MOBILE): Tên Hoàng Long nằm chính giữa logo và nút thoát */}
        {customer && (
          <div className="flex flex-1 items-center justify-center px-1 md:hidden">
            <Link
              href="/account"
              className="truncate text-center text-xs font-semibold text-neutral-800 transition-colors hover:text-amber-500 dark:text-neutral-200"
              title={customer.name}
            >
              {customer.name}
            </Link>
          </div>
        )}

        {/* 3. KHỐI PHẢI: Nút Thoát + Account Icon + Giỏ hàng (shrink-0) */}
        <div className="flex shrink-0 items-center justify-end gap-1.5 sm:gap-3 text-xs">
          {customer ? (
            <button
              onClick={logout}
              className="rounded bg-red-500/10 px-2 py-1 text-[11px] font-medium text-red-600 transition-colors hover:bg-red-500/20 dark:bg-red-500/20 dark:text-red-400"
            >
              Thoát
            </button>
          ) : (
            <>
              <Link href="/register" className="whitespace-nowrap text-neutral-700 hover:text-black dark:text-neutral-300 dark:hover:text-white">
                Đăng ký
              </Link>
              <span className="text-neutral-300 dark:text-neutral-700">|</span>
              <Link href="/login" className="whitespace-nowrap text-neutral-700 hover:text-black dark:text-neutral-300 dark:hover:text-white">
                Đăng nhập
              </Link>
            </>
          )}

          <Link
            href="/account"
            className="flex items-center justify-center rounded-md border border-neutral-200 p-1.5 sm:p-2 text-black transition-colors hover:bg-neutral-100 dark:border-neutral-800 dark:text-white dark:hover:bg-neutral-800"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="h-4 w-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
            </svg>
          </Link>

          <div className="shrink-0">
            <OpenCart />
          </div>
        </div>
      </nav>
    </header>
  );
}