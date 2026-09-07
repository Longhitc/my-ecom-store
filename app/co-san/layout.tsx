import Footer from "components/layout/footer";
import CategoryTree from "components/layout/search/category-tree";
import FilterList from "components/layout/search/filter";
import { sorting } from "lib/constants";
import { Suspense } from "react";

export default function CoSanLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="mx-auto flex max-w-(--breakpoint-2xl) flex-col gap-8 px-4 pb-4 text-black md:flex-row dark:text-white">
        {/* Sidebar bên trái: Chỉ hiển thị nhánh context hiện tại */}
        <div className="order-first w-full flex-none md:w-[200px]">
          <Suspense fallback={null}>
            <CategoryTree />
          </Suspense>
        </div>

        {/* Nội dung danh sách sản phẩm */}
        <div className="order-last min-h-screen w-full md:order-none">
          {children}
        </div>

        {/* Sort by bên phải */}
        <div className="order-none flex-none md:order-last md:w-[125px]">
          <FilterList list={sorting} title="Sort by" />
        </div>
      </div>
      <Footer />
    </>
  );
}