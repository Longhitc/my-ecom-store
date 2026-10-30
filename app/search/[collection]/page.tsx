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

    // Chuẩn hóa thời gian thực theo chuẩn GMT+7 (Asia/Ho_Chi_Minh)
    const nowVn = new Date().toLocaleString("sv-SE", { timeZone: "Asia/Ho_Chi_Minh" }).replace(" ", "T");

    let baseSelect = `
      SELECT p.*, 
             MIN(pi.promo_price) as promo_price, 
             MAX(pi.discount_value) as discount_value, 
             MAX(pi.discount_type) as discount_type,
             MAX(CASE WHEN prm.status = 'active' AND prm.start_date <= ? AND prm.end_date >= ? THEN 1 ELSE 0 END) as is_promoted
      FROM products p
      LEFT JOIN promotion_items pi ON p.id = pi.product_id
      LEFT JOIN promotions prm ON pi.promotion_id = prm.id
    `;

    let sql = '';
    let args: any[] = [nowVn, nowVn];

    if (collection === "search") {
      sql = `
        ${baseSelect}
        GROUP BY p.id
        ORDER BY p.created_at DESC
      `;
    } else if (collection === "co-san" || collection === "order") {
      sql = `
        ${baseSelect}
        WHERE p.type = ?
        GROUP BY p.id
        ORDER BY p.created_at DESC
      `;
      args.push(collection);
    } else if (collection === "gd-crocs") {
      sql = `
        ${baseSelect}
        INNER JOIN product_categories pc ON p.id = pc.product_id
        WHERE pc.category_code = 'gd-crocs' OR pc.category_code IN ('crocs-nam', 'crocs-nu', 'crocs-tre-em', 'crocs-unisex')
        GROUP BY p.id
        ORDER BY p.created_at DESC
      `;
    } else {
      sql = `
        ${baseSelect}
        INNER JOIN product_categories pc ON p.id = pc.product_id
        WHERE pc.category_code = ?
        GROUP BY p.id
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
      
      // Logic kiểm tra khuyến mãi chuẩn GMT+7
      const hasPromo = Number(row.is_promoted) === 1 && 
                       row.promo_price !== null && 
                       row.promo_price !== undefined && 
                       Number(row.promo_price) < rawPrice;
      
      const originalPriceFormatted = `${rawPrice.toLocaleString('vi-VN')} đ`;
      const promoPriceFormatted = hasPromo ? `${Number(row.promo_price).toLocaleString('vi-VN')} đ` : originalPriceFormatted;

      let discountText = '';
      if (hasPromo) {
        if (row.discount_type === 'percent') {
          discountText = `-${row.discount_value}%`;
        } else if (row.discount_value) {
          discountText = `-${Number(row.discount_value).toLocaleString('vi-VN')}đ`;
        } else {
          const calcPercent = Math.round(((rawPrice - Number(row.promo_price)) / rawPrice) * 100);
          discountText = `-${calcPercent}%`;
        }
      }

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
        rawPrice: hasPromo ? Number(row.promo_price) : rawPrice,
        originalPrice: originalPriceFormatted,
        promoPrice: promoPriceFormatted,
        hasPromo,
        discount: discountText,
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
          <Grid className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((product) => (
              <Link
                key={product.id}
                href={`/product/${product.handle}`}
                className="group relative flex flex-col justify-between overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black transition-all hover:border-blue-600 p-3"
              >
                {product.hasPromo && product.discount && (
                  <span className="absolute top-3 left-3 z-10 rounded bg-red-600 px-1.5 py-0.5 text-[10px] font-bold text-white shadow">
                    {product.discount}
                  </span>
                )}

                <div className="w-3/4 mx-auto pt-2">
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

                <div className="mt-2 flex flex-col gap-1">
                  <span className="text-sm font-medium text-neutral-800 dark:text-white line-clamp-1">
                    {product.title}
                  </span>
                  
                  {product.hasPromo ? (
                    <div className="flex items-center justify-end gap-2">
                      <span className="text-xs text-neutral-400 line-through">
                        {product.originalPrice}
                      </span>
                      <span className="text-sm font-extrabold text-red-600">
                        {product.promoPrice}
                      </span>
                    </div>
                  ) : (
                    <div className="flex justify-end">
                      <span className="rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white whitespace-nowrap shadow-sm">
                        {product.originalPrice}
                      </span>
                    </div>
                  )}
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