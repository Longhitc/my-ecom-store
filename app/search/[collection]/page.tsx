import { mockProducts } from 'app/product/products';
import Grid from "components/grid";
import ProductGridItems from "components/layout/product-grid-items";
import { defaultSort, sorting } from "lib/constants";
import { Metadata } from "next";

export async function generateMetadata(props: {
  params: Promise<{ collection: string }>;
}): Promise<Metadata> { 
  const params = await props.params;

  const titles: Record<string, string> = {
    "co-san": "Hàng Có Sẵn",
    "order": "Hàng Order",
    "tt-namnu": "Thời Trang Nam Nữ",
    "tt-te": "Thời Trang Trẻ Em",
    "gd-crocs": "Giày Dép Crocks",
    "crocs-nam": "Crocs Nam",
    "crocs-nu": "Crocs Nữ",
    "crocs-tre-em": "Crocs Trẻ Em",
    "crocs-unisex": "Crocs Unisex",
    "pk": "Phụ Kiện",
    "vay-nu": "Váy Nữ",
    "ao-nu": "Áo Nữ",
    "set-bo": "Set & Bộ",
  };

  const title = titles[params.collection] || params.collection;

  return {
    title: `${title} | ĐẸP VÀ XINH SHOP`,
    description: `Danh sách sản phẩm ${title}`,
  };
}

export default async function CategoryPage(props: {
  params: Promise<{ collection: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = (await props.searchParams) || {};
  const params = await props.params;
  const { sort } = searchParams as { [key: string]: string };

  const { sortKey, reverse } =
    sorting.find((item) => item.slug === sort) || defaultSort;

  const crocsSubCategories = ['crocs-nam', 'crocs-nu', 'crocs-tre-em', 'crocs-unisex'];

  // Logic lọc sản phẩm
  let products = mockProducts.filter((product) => {
    if (params.collection === "search") return true;

    if (params.collection === "co-san" || params.collection === "order") {
      return product.type === params.collection;
    }

    if (params.collection === "gd-crocs") {
      return product.category === "gd-crocs" || crocsSubCategories.includes(product.category);
    }

    return product.category === params.collection;
  });

  // Logic sắp xếp
  if (sortKey === "PRICE") {
    products.sort((a, b) => {
      const priceA = parseFloat(a.priceRange.maxVariantPrice.amount);
      const priceB = parseFloat(b.priceRange.maxVariantPrice.amount);
      return reverse ? priceB - priceA : priceA - priceB;
    });
  }

  return (
    <>
      {products.length === 0 ? (
        <p className="py-3 text-lg text-neutral-400">Không tìm thấy sản phẩm nào trong danh mục này.</p>
      ) : (
        <Grid className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          <ProductGridItems products={products as any} />
        </Grid>
      )}
    </>
  );
}