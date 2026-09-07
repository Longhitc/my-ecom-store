import Footer from "components/layout/footer";
import CategoryTree from "components/layout/search/category-tree";
import FilterList from "components/layout/search/filter";
import { sorting } from "lib/constants";
import { Suspense } from "react";

export default function SearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="mx-auto flex max-w-(--breakpoint-2xl) flex-col gap-8 px-4 pb-4 text-black md:flex-row dark:text-white">
        
        {/* Cột trái */}
        <Suspense fallback={null}>
          <CategoryTree />
        </Suspense>

        {/* Cột giữa */}
        <div className="order-last min-h-screen w-full md:order-none">
          {children}
        </div>

        {/* Cột phải */}
        <div className="order-none flex-none md:order-last md:w-[125px]">
          <FilterList list={sorting} title="Sort by" />
        </div>
      </div>
      <Footer />
    </>
  );
}