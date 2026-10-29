import FooterMenu from "components/layout/footer-menu";
import LogoSquare from "components/logo-square";
import { getMenu } from "lib/shopify";
import Link from "next/link";
import { Suspense } from "react";

const { COMPANY_NAME, SITE_NAME } = process.env;

export default async function Footer() {
  const skeleton =
    "w-full h-6 animate-pulse rounded-sm bg-neutral-200 dark:bg-neutral-700";
  const menu = await getMenu("next-js-frontend-footer-menu");
  const copyrightName = COMPANY_NAME || SITE_NAME || "";

  return (
    <footer className="text-sm text-neutral-500 dark:text-neutral-400 border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 mt-12">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-10 text-sm md:flex-row md:justify-between md:px-4 min-[1320px]:px-0">
        
        {/* Cột 1: Logo & Tên Shop nằm ngang, không bị rớt dòng */}
        <div className="space-y-3 md:w-[22%]">
          <Link
            className="inline-flex items-center gap-2.5 text-black md:pt-1 dark:text-white"
            href="/"
          >
            <LogoSquare size="sm" />
            <span className="uppercase font-bold tracking-wide whitespace-nowrap">{SITE_NAME}</span>
          </Link>
          <p className="text-xs text-neutral-500 leading-relaxed">
            Chuyên cung cấp thời trang và phụ kiện chất lượng, uy tín hàng đầu.
          </p>
        </div>

        {/* Cột 2: Menu Footer từ Shopify */}
        <div className="md:w-[15%]">
          <Suspense
            fallback={
              <div className="flex h-[180px] w-full flex-col gap-2">
                <div className={skeleton} />
                <div className={skeleton} />
                <div className={skeleton} />
              </div>
            }
          >
            <FooterMenu menu={menu} />
          </Suspense>
        </div>

        {/* Cột 3: 3 Khung (Chính sách đổi trả, Hỗ trợ liên hệ & Kết nối với shop) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:w-[63%]">
          
          {/* Khung 1: Chính sách đổi trả */}
          <div className="bg-neutral-50 dark:bg-neutral-800/50 p-4 rounded-xl border border-neutral-200/80 dark:border-neutral-800 space-y-2 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-neutral-900 dark:text-white text-xs uppercase tracking-wider flex items-center gap-2 mb-1.5">
                <span className="text-base">📦</span> Chính Sách Đổi Trả
              </h3>
              <p className="text-xs leading-relaxed text-neutral-600 dark:text-neutral-300">
                Hỗ trợ đổi size trong 5 ngày với sản phẩm còn tag (có thu phí ship hoàn theo đơn vị vận chuyển).
              </p>
            </div>
          </div>

          {/* Khung 2: Hỗ trợ liên hệ */}
          <div className="bg-neutral-50 dark:bg-neutral-800/50 p-4 rounded-xl border border-neutral-200/80 dark:border-neutral-800 space-y-2 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-neutral-900 dark:text-white text-xs uppercase tracking-wider flex items-center gap-2 mb-1.5">
                <span className="text-base">📞</span> Hỗ Trợ Liên Hệ
              </h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-300 whitespace-nowrap">
                Tư vấn nhanh nhất:
              </p>
            </div>
            <div>
              <a 
                href="tel:0933552264" 
                className="inline-flex items-center gap-1.5 font-extrabold text-blue-600 dark:text-blue-400 hover:underline text-xs bg-blue-50 dark:bg-blue-950/50 px-2 py-1.5 rounded-lg border border-blue-100 dark:border-blue-900/50 w-full justify-center whitespace-nowrap"
              >
                <span>📞</span> 0933 552 264
              </a>
            </div>
          </div>

          {/* Khung 3: Kết nối với shop (MỚI THÊM) */}
          <div className="bg-neutral-50 dark:bg-neutral-800/50 p-4 rounded-xl border border-neutral-200/80 dark:border-neutral-800 space-y-2 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-neutral-900 dark:text-white text-xs uppercase tracking-wider flex items-center gap-2 mb-2">
                <span className="text-base">🌐</span> Kết Nối Với Shop
              </h3>
              <div className="flex items-center gap-2.5 pt-1">
                {/* Icon Facebook */}
                <a
                  href="https://www.facebook.com/share/14nmFct6NQR/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white hover:opacity-90 transition-opacity shadow-sm"
                  title="Facebook"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>

                {/* Icon Zalo (Anh thay link Zalo thực tế vào href bên dưới) */}
                <a
                  href="https://zalo.me/0933552264"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-500 text-white hover:opacity-90 transition-opacity shadow-sm font-bold text-[10px]"
                  title="Zalo"
                >
                  Zalo
                </a>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Phần bản quyền dưới cùng */}
      <div className="border-t border-neutral-200 py-6 text-xs dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/30">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-center gap-1 px-4 md:px-4 min-[1320px]:px-0 text-center text-neutral-500">
          <p>
            &copy; 2023-2026 {copyrightName}
            {copyrightName.length && !copyrightName.endsWith(".")
              ? "."
              : ""}{" "}
            All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}