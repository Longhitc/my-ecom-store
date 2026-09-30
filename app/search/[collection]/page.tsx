import Grid from "components/grid";
import { defaultSort, sorting } from "lib/constants";
import { db } from 'lib/turso';
import type { Metadata } from "next";
import Link from 'next/link';

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

async function getCollectionProducts(collection: string, sort?: string) {
  try {
    const { sortKey, reverse } =
      sorting.find((item) => item.slug === sort) || defaultSort;

    // Query lấy dữ liệu từ Turso DB
    const sql = `SELECT * FROM products ORDER BY created_at DESC`;
    const result = await db.execute(sql);

    const crocsSubCategories = ['crocs-nam', 'crocs-nu', 'crocs-tre-em', 'crocs-unisex'];

    // 1. Lọc sản phẩm ẩn & Lọc theo danh mục (collection)
    let filteredRows = result.rows.filter((row: any) => {
      // Bỏ sản phẩm ẩn
      if (row.is_active !== undefined && row.is_active !== null) {
        if (Number(row.is_active) === 0 || row.is_active === false) return false;
      }
      if (row.status && (row.status === 'hidden' || row.status === 'inactive')) {
        return false;
      }

      // Lọc theo Collection
      if (collection === "search") return true;

      if (collection === "co-san" || collection === "order") {
        return row.type === collection;
      }

      if (collection === "gd-crocs") {
        return row.category === "gd-crocs" || crocsSubCategories.includes(row.category);
      }

      return row.category === collection;
    });

    // 2. Map dữ liệu chuẩn hóa UI
    let products = filteredRows.map((row: any) => {
      const rawPrice = Number(row.min_price ?? row.price ?? 0);
      const formattedPrice = `${rawPrice.toLocaleString('vi-VN')} đ`;

      let imageUrl = row.featured_image_url || row.image_url || '';

      if (!imageUrl && row.images) {
        try {
          const parsedImages = typeof row.images === 'string' ? JSON.parse(row.images) : row.images;
          if (Array.isArray(parsedImages) && parsedImages.length > 0) {
            imageUrl = parsedImages[0];
          }
        } catch (e) {
          imageUrl = '';
        }
      }

      return {
        id: String(row.id),
        handle: String(row.handle || row.id),
        title: String(row.title || row.name || 'Sản phẩm'),
        rawPrice: rawPrice,
        price: formattedPrice,
        imageUrl: imageUrl,
      };
    });

    // 3. Sắp xếp theo giá nếu có
    if (sortKey === "PRICE") {
      products.sort((a, b) => {
        return reverse ? b.rawPrice - a.rawPrice : a.rawPrice - b.rawPrice;
      });
    }

    return products;
  } catch (error) {
    console.error("Lỗi lấy sản phẩm theo danh mục:", error);
    return [];
  }
}

export default async function CategoryPage(props: {
  params: Promise<{ collection: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = (await props.searchParams) || {};
  const params = await props.params;
  const { sort } = searchParams as { [key: string]: string };

  const products = await getCollectionProducts(params.collection, sort);

  return (
    <section>
      {products.length === 0 ? (
        <p className="py-10 text-center text-neutral-400">
          Không tìm thấy sản phẩm nào trong danh mục này.
        </p>
      ) : (
        <Grid className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/product/${product.handle}`}
              className="group flex flex-col overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black transition-all hover:border-blue-600"
            >
              <div className="w-3/4 mx-auto pt-4">
                <div className="relative aspect-square overflow-hidden rounded-md bg-neutral-100 dark:bg-neutral-900">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-neutral-500">
                      Chưa có ảnh
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between p-4">
                <span className="text-sm font-medium text-neutral-800 dark:text-white line-clamp-1">
                  {product.title}
                </span>
                <span className="rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white whitespace-nowrap">
                  {product.price}
                </span>
              </div>
            </Link>
          ))}
        </Grid>
      )}
    </section>
  );
}