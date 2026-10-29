import Grid from "components/grid";
import { defaultSort, sorting } from "lib/constants";
import { db } from 'lib/turso';
import type { Metadata } from "next";
import Link from 'next/link';

// Cố định đúng 18 sản phẩm mỗi trang (6 hàng x 3 cột)
const PAGE_SIZE = 18;

export async function generateMetadata(props: {
  params: Promise<{ collection: string }>;
}): Promise<Metadata> { 
  const params = await props.params;

  const titles: Record<string, string> = {
    "co-san": "Hàng Có Sẵn",
    "order": "Hàng Order",
    "tt-namnu": "Thời Trang Nam Nữ",
    "tt-nam": "Thời Trang Nam",
    "tt-nu": "Thời Trang Nữ",
    "tt-te": "Thời Trang Trẻ Em",
    "gd-crocs": "Giày Dép Crocs",
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

async function getCollectionProducts(collection: string, sort?: string, page: number = 1) {
  try {
    const { sortKey, reverse } =
      sorting.find((item) => item.slug === sort) || defaultSort;

    let sql = '';
    let args: any[] = [];

    if (collection === "search") {
      sql = `
        SELECT DISTINCT p.* FROM products p
        ORDER BY p.created_at DESC
      `;
    } else if (collection === "co-san" || collection === "order") {
      sql = `
        SELECT DISTINCT p.* FROM products p
        WHERE p.type = ?
        ORDER BY p.created_at DESC
      `;
      args.push(collection);
    } else if (collection === "gd-crocs") {
      sql = `
        SELECT DISTINCT p.* FROM products p
        INNER JOIN product_categories pc ON p.id = pc.product_id
        WHERE pc.category_code = 'gd-crocs' OR pc.category_code IN ('crocs-nam', 'crocs-nu', 'crocs-tre-em', 'crocs-unisex')
        ORDER BY p.created_at DESC
      `;
    } else {
      sql = `
        SELECT DISTINCT p.* FROM products p
        INNER JOIN product_categories pc ON p.id = pc.product_id
        WHERE pc.category_code = ?
        ORDER BY p.created_at DESC
      `;
      args.push(collection);
    }

    const result = await db.execute({ sql, args });

    let filteredRows = result.rows.filter((row: any) => {
      if (row.is_active !== undefined && row.is_active !== null) {
        if (Number(row.is_active) === 0 || row.is_active === false) return false;
      }
      if (row.status && (row.status === 'hidden' || row.status === 'inactive')) {
        return false;
      }
      return true;
    });

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

    if (sortKey === "PRICE") {
      products.sort((a, b) => {
        return reverse ? b.rawPrice - a.rawPrice : a.rawPrice - b.rawPrice;
      });
    }

    const totalProducts = products.length;
    const totalPages = Math.ceil(totalProducts / PAGE_SIZE) || 1;
    
    // Cắt mảng lấy chính xác 18 sản phẩm cho trang hiện tại
    const startIndex = (page - 1) * PAGE_SIZE;
    const paginatedProducts = products.slice(startIndex, startIndex + PAGE_SIZE);

    return {
      products: paginatedProducts,
      totalPages,
      currentPage: page,
      totalProducts
    };
  } catch (error) {
    console.error("Lỗi lấy sản phẩm theo danh mục:", error);
    return { products: [], totalPages: 1, currentPage: 1, totalProducts: 0 };
  }
}

export default async function CategoryPage(props: {
  params: Promise<{ collection: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = (await props.searchParams) || {};
  const params = await props.params;
  const { sort, page: pageParam } = searchParams as { [key: string]: string };

  const currentPage = Number(pageParam) || 1;
  const { products, totalPages } = await getCollectionProducts(params.collection, sort, currentPage);

  const createPageUrl = (pageNumber: number) => {
    const paramsObj = new URLSearchParams();
    if (sort) paramsObj.set('sort', sort);
    paramsObj.set('page', pageNumber.toString());
    return `?${paramsObj.toString()}`;
  };

  return (
    <section className="pb-12">
      {products.length === 0 ? (
        <p className="py-10 text-center text-neutral-400">
          Không tìm thấy sản phẩm nào trong danh mục này.
        </p>
      ) : (
        <>
          {/* Ép cứng lưới hiển thị chuẩn 3 cột */}
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

          {/* Thanh phân trang chuyển trang */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-10">
              {currentPage > 1 ? (
                <Link
                  href={createPageUrl(currentPage - 1)}
                  className="px-4 py-2 text-sm font-medium bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200"
                >
                  Trang trước
                </Link>
              ) : (
                <span className="px-4 py-2 text-sm font-medium bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg text-neutral-400 cursor-not-allowed">
                  Trang trước
                </span>
              )}

              <span className="px-4 py-2 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                Trang {currentPage} / {totalPages}
              </span>

              {currentPage < totalPages ? (
                <Link
                  href={createPageUrl(currentPage + 1)}
                  className="px-4 py-2 text-sm font-medium bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200"
                >
                  Trang sau
                </Link>
              ) : (
                <span className="px-4 py-2 text-sm font-medium bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg text-neutral-400 cursor-not-allowed">
                  Trang sau
                </span>
              )}
            </div>
          )}
        </>
      )}
    </section>
  );
}