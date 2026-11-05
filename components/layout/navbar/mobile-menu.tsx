"use client";

import { Dialog, Transition } from "@headlessui/react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Fragment, useEffect, useState } from "react";

import { Bars3Icon } from "@heroicons/react/24/outline";
import { Menu } from "lib/shopify/types";

// Hàm hỗ trợ gán icon sinh động dựa theo tên hoặc đường dẫn menu
function getMenuIcon(path: string, title: string) {
  const p = path.toLowerCase();
  const t = title.toLowerCase();
  
  if (p.includes('trang-chu') || t.includes('trang chủ') || p === '/search') return '🏠';
  if (p.includes('nam') && p.includes('nu')) return '👫';
  if (p.includes('nam')) return '👔';
  if (p.includes('nu') || p.includes('vay') || p.includes('ao-nu')) return '👗';
  if (p.includes('tre-em') || t.includes('trẻ em')) return '👶';
  if (p.includes('crocs') || p.includes('giay')) return '👟';
  if (p.includes('phu-kien') || p.includes('pk')) return '👜';
  if (p.includes('giai-tri') || p.includes('music')) return '🎵';
  if (p.includes('order')) return '📦';
  if (p.includes('co-san')) return '✨';
  return '✦';
}

export default function MobileMenu({ menu }: { menu: Menu[] }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const [openSubMenus, setOpenSubMenus] = useState<Record<string, boolean>>({});

  const openMobileMenu = () => setIsOpen(true);
  const closeMobileMenu = () => setIsOpen(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isOpen]);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname, searchParams]);

  const toggleSubMenu = (title: string) => {
    setOpenSubMenus(prev => ({ ...prev, [title]: !prev[title] }));
  };

  return (
    <>
      <button
        onClick={openMobileMenu}
        aria-label="Open mobile menu"
        className="flex h-11 w-11 items-center justify-center rounded-xl border border-neutral-200 text-black transition-colors md:hidden dark:border-neutral-700 dark:text-white bg-neutral-50 dark:bg-neutral-900 shadow-sm"
      >
        <Bars3Icon className="h-5 w-5" />
      </button>
      <Transition show={isOpen}>
        <Dialog onClose={closeMobileMenu} className="relative z-50">
          <Transition.Child
            as={Fragment}
            enter="transition-all ease-in-out duration-300"
            enterFrom="opacity-0 backdrop-blur-none"
            enterTo="opacity-100 backdrop-blur-md"
            leave="transition-all ease-in-out duration-200"
            leaveFrom="opacity-100 backdrop-blur-md"
            leaveTo="opacity-0 backdrop-blur-none"
          >
            <div className="fixed inset-0 bg-black/60" aria-hidden="true" />
          </Transition.Child>
          <Transition.Child
            as={Fragment}
            enter="transition-all ease-in-out duration-300"
            enterFrom="translate-x-[-100%]"
            enterTo="translate-x-0"
            leave="transition-all ease-in-out duration-200"
            leaveFrom="translate-x-0"
            leaveTo="translate-x-[-100%]"
          >
            {/* Đẩy vị trí top xuống thấp hơn một chút (145px) để nằm trọn vẹn ngay dưới thanh điều hướng */}
            <Dialog.Panel className="fixed bottom-0 left-0 right-0 top-[145px] flex h-[calc(100%-145px)] w-full flex-col bg-white dark:bg-neutral-950 shadow-2xl overflow-y-auto border-t border-neutral-200 dark:border-neutral-800">
              
              {/* Danh sách menu có padding-top vừa vặn để hiện trọn vẹn mục Trang Chủ */}
              <div className="p-4 pt-4 pb-12">
                <ul className="flex w-full flex-col gap-2.5">
                  {menu.map((item: any) => {
                    const hasChildren = item.items && item.items.length > 0;
                    const isSubOpen = openSubMenus[item.title];
                    const iconSymbol = getMenuIcon(item.path, item.title);

                    return (
                      <li
                        key={item.title}
                        className="rounded-2xl border border-neutral-100 dark:border-neutral-900 bg-neutral-50/60 dark:bg-neutral-900/40 overflow-hidden transition-all shadow-sm"
                      >
                        <div className="flex items-center justify-between p-3.5">
                          <Link
                            href={item.path}
                            prefetch={true}
                            onClick={closeMobileMenu}
                            className="flex items-center gap-3.5 text-sm font-semibold text-neutral-800 dark:text-neutral-100 transition-colors hover:text-amber-500 flex-1"
                          >
                            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 text-lg shadow-inner">
                              {iconSymbol}
                            </span>
                            <span className="truncate">{item.title}</span>
                          </Link>

                          {hasChildren && (
                            <button
                              onClick={() => toggleSubMenu(item.title)}
                              className="p-2 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth="2.5"
                                stroke="currentColor"
                                className={`h-4 w-4 transition-transform duration-300 ${isSubOpen ? 'rotate-180 text-amber-500' : ''}`}
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                              </svg>
                            </button>
                          )}
                        </div>

                        {/* Menu con */}
                        {hasChildren && isSubOpen && (
                          <ul className="flex flex-col gap-1 px-3.5 pb-3.5 pt-1 border-t border-neutral-100 dark:border-neutral-900/80 bg-white dark:bg-black/40">
                            {item.items.map((subItem: any) => (
                              <li key={subItem.title}>
                                <Link
                                  href={subItem.path}
                                  prefetch={true}
                                  onClick={closeMobileMenu}
                                  className="flex items-center gap-2.5 text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:text-amber-500 dark:hover:text-amber-400 transition-colors py-2 px-3 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800/60"
                                >
                                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
                                  <span className="truncate">{subItem.title}</span>
                                </Link>
                              </li>
                            ))}
                          </ul>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>

            </Dialog.Panel>
          </Transition.Child>
        </Dialog>
      </Transition>
    </>
  );
}