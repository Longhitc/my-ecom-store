import { getCollection, getCollectionProducts } from "lib/shopify";
import { Product } from "lib/shopify/types"; // Import kiểu Product
import { Metadata } from "next";

import Grid from "components/grid";
import ProductGridItems from "components/layout/product-grid-items";
import { defaultSort, sorting } from "lib/constants";

export async function generateMetadata(props: {
  params: Promise<{ collection: string }>;
}): Promise<Metadata> {
  const params = await props.params;

  try {
    const collection = await getCollection(params.collection);
    if (!collection) return { title: "Collection" };

    return {
      title: collection.seo?.title || collection.title,
      description:
        collection.seo?.description ||
        collection.description ||
        `${collection.title} products`,
    };
  } catch (error) {
    return { title: "Collection" };
  }
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

  // Khai báo rõ kiểu Product[] để TypeScript không bắt lỗi implicit any
  let products: Product[] = [];
  try {
    products = await getCollectionProducts({
      collection: params.collection,
      sortKey,
      reverse,
    });
  } catch (error) {
    console.error("Lỗi lấy sản phẩm từ Shopify:", error);
    products = [];
  }

  return (
    <section>
      {products.length === 0 ? (
        <p className="py-3 text-lg">No products found in this collection</p>
      ) : (
        <Grid className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          <ProductGridItems products={products} />
        </Grid>
      )}
    </section>
  );
}