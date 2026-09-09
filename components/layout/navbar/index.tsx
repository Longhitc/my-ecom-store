import OpenCart from "components/cart/open-cart";
import LogoSquare from "components/logo-square";
import Link from "next/link";
import { Suspense } from "react";
import MobileMenu from "./mobile-menu";
import Search, { SearchSkeleton } from "./search";

const { SITE_NAME } = process.env;

interface MenuItem {
  title: string;
  path: string;
  items?: MenuItem[];
}

export default async function Navbar() {
  const menu: MenuItem[] = [
    { title: 'Trang Chủ', path: '/search' },
    {
      title: 'Hàng Có Sẵn',
      path: '/search/co-san',
      items: [
        { title: 'Thời Trang Nam Nữ', path: '/search/tt-namnu' },
        { title: 'Thời Trang Trẻ Em', path: '/search/tt-te' },
        {
          title: 'Giày dép Crocks',
          path: '/search/gd-crocs',
          items: [
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
      items: [
        { title: 'Váy Nữ', path: '/search/vay-nu' },
        { title: 'Áo Nữ', path: '/search/ao-nu' },
        { title: 'Set & Bộ', path: '/search/set-bo' },
      ],
    },
  ];

  return (
    <nav className="relative flex items-center justify-between p-4 lg:px-6">
      {/* Mobile Menu */}
      <div className="block flex-none md:hidden">
        <Suspense fallback={null}>
          <MobileMenu menu={menu as any} />
        </Suspense>
      </div>

      <div className="flex w-full items-center justify-between gap-4 md:gap-6">
        {/* 1. KHỐI TRÁI: LOGO + MENU (HỖ TRỢ DROPDOWN HOVER 3 CẤP) */}
        <div className="flex flex-none items-center gap-6">
          <Link
            href="/"
            prefetch={true}
            className="flex items-center justify-center shrink-0"
          >
            <LogoSquare />
            <div className="ml-2 hidden text-sm font-medium uppercase shrink-0 lg:block">
              Đẹp và Xinh Shop
            </div>
          </Link>

          {menu.length ? (
            <ul className="hidden gap-6 text-sm md:flex md:items-center">
              {menu.map((item) => (
                <li key={item.title} className="relative group py-2">
                  <Link
                    href={item.path}
                    prefetch={true}
                    className="flex items-center gap-1 whitespace-nowrap text-neutral-500 underline-offset-4 hover:text-black hover:underline dark:text-neutral-400 dark:hover:text-neutral-300"
                  >
                    {item.title}
                    {item.items && item.items.length > 0 && (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="currentColor"
                        className="h-3.5 w-3.5 transition-transform group-hover:rotate-180"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                      </svg>
                    )}
                  </Link>

                  {/* MENU XỔ XUỐNG CẤP 2 */}
                  {item.items && item.items.length > 0 && (
                    <div className="absolute left-0 top-full hidden w-52 rounded-md border border-neutral-200 bg-white p-2 shadow-lg group-hover:block dark:border-neutral-800 dark:bg-neutral-900 z-50">
                      <ul className="flex flex-col gap-1">
                        {item.items.map((subItem) => (
                          <li key={subItem.title} className="relative group/sub">
                            <Link
                              href={subItem.path}
                              className="flex items-center justify-between rounded-md px-3 py-2 text-xs text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-black dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-white"
                            >
                              <div className="flex items-center gap-2">
                                <span className="h-1.5 w-1.5 bg-neutral-300 dark:bg-neutral-600"></span>
                                {subItem.title}
                              </div>
                              {subItem.items && subItem.items.length > 0 && (
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  strokeWidth="1.5"
                                  stroke="currentColor"
                                  className="h-3 w-3 text-neutral-400"
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                                </svg>
                              )}
                            </Link>

                            {/* MENU XỔ SANG PHẢI CẤP 3 */}
                            {subItem.items && subItem.items.length > 0 && (
                              <div className="absolute left-full top-0 ml-0.5 hidden w-44 rounded-md border border-neutral-200 bg-white p-2 shadow-xl group-hover/sub:flex flex-col gap-1 dark:border-neutral-800 dark:bg-neutral-900 z-50">
                                {subItem.items.map((childItem) => (
                                  <Link
                                    key={childItem.title}
                                    href={childItem.path}
                                    className="flex items-center gap-2 rounded-md px-3 py-2 text-xs text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-black dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-white"
                                  >
                                    <span className="h-1 w-1 rounded-full bg-neutral-400 dark:bg-neutral-500"></span>
                                    {childItem.title}
                                  </Link>
                                ))}
                              </div>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        {/* 2. KHỐI GIỮA: Ô SEARCH */}
        <div className="hidden flex-1 justify-end max-w-md md:flex">
          <Suspense fallback={<SearchSkeleton />}>
            <Search />
          </Suspense>
        </div>

        {/* 3. KHỐI PHẢI: ĐĂNG KÝ | ĐĂNG NHẬP | GIỎ HÀNG */}
        <div className="flex flex-none items-center justify-end gap-3 text-xs md:text-sm">
          <Link
            href="/register"
            className="whitespace-nowrap text-neutral-600 transition-colors hover:text-black dark:text-neutral-300 dark:hover:text-white"
          >
            Đăng ký
          </Link>

          <span className="text-neutral-300 dark:text-neutral-700">|</span>

          <Link
            href="/login"
            className="whitespace-nowrap text-neutral-600 transition-colors hover:text-black dark:text-neutral-300 dark:hover:text-white"
          >
            Đăng nhập
          </Link>

          <div className="ml-1 shrink-0">
            <OpenCart />
          </div>
        </div>
      </div>
    </nav>
  );
}