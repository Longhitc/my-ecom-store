import Grid from "components/grid";
import { db } from 'lib/turso';
import type { Metadata } from "next";
import Link from 'next/link';

export const metadata: Metadata = {
  title: "Search",
  description: "Search for products in the store.",
};

async function getProducts(query?: string) {
  try {
    const nowVn = new Date().toLocaleString("sv-SE", { timeZone: "Asia/Ho_Chi_Minh" }).replace(" ", "T");

    // Lấy tất cả sản phẩm, kết hợp thông tin khuyến mãi đang hoạt động chuẩn GMT+7
    let sql = `
      SELECT p.*, 
             MIN(pi.promo_price) as promo_price, 
             MAX(pi.discount_value) as discount_value, 
             MAX(pi.discount_type) as discount_type,
             MAX(CASE WHEN prm.status = 'active' AND prm.start_date <= ? AND prm.end_date >= ? THEN 1 ELSE 0 END) as is_promoted
      FROM products p
      LEFT JOIN promotion_items pi ON p.id = pi.product_id
      LEFT JOIN promotions prm ON pi.promotion_id = prm.id
    `;
    
    const params: any[] = [nowVn, nowVn];

    if (query) {
      sql += ` WHERE p.title LIKE ? OR p.name LIKE ?`;
      params.push(`%${query}%`, `%${query}%`);
    }

    sql += ` GROUP BY p.id ORDER BY p.created_at DESC`;

    const result = await db.execute({ sql, args: params });

    return result.rows
      .filter((row: any) => {
        if (row.is_active !== undefined && row.is_active !== null) {
          if (Number(row.is_active) === 0 || row.is_active === false) return false;
        }
        if (row.status && (row.status === 'hidden' || row.status === 'inactive')) {
          return false;
        }
        return true;
      })
      .map((row: any) => {
        const rawPrice = Number(row.min_price ?? row.price ?? 0);
        // Chỉ bật cờ khuyến mãi khi is_promoted = 1 và có giá sale nhỏ hơn giá gốc
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
          originalPrice: originalPriceFormatted,
          promoPrice: promoPriceFormatted,
          hasPromo,
          discount: discountText,
          imageUrl: imageUrl,
        };
      });
  } catch (error) {
    console.error('Lỗi truy vấn sản phẩm từ Turso:', error);
    return [];
  }
}

export default async function SearchPage(props: {
  searchParams?: Promise<{ q?: string; sort?: string; page?: string }>;
}) {
  const searchParams = await props.searchParams;
  const query = searchParams?.q;
  const currentPage = Number(searchParams?.page) || 1;
  const pageSize = 18; // Cố định đúng 18 sản phẩm mỗi trang

  const allProducts = await getProducts(query);
  
  const totalProducts = allProducts.length;
  const totalPages = Math.ceil(totalProducts / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const currentProducts = allProducts.slice(startIndex, startIndex + pageSize);

  const createPageUrl = (pageNumber: number) => {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    params.set('page', String(pageNumber));
    return `/search?${params.toString()}`;
  };

  return (
    <section className="mx-auto max-w-screen-2xl px-4 py-4 md:px-6 space-y-6">
      {currentProducts.length === 0 ? (
        <p className="py-12 text-center text-neutral-400 text-sm">Không tìm thấy sản phẩm nào.</p>
      ) : (
        <>
          <Grid className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentProducts.map((product) => (
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

          {/* HỆ THỐNG PHÂN TRANG HOÀN CHỈNH */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6 border-t border-neutral-200 dark:border-neutral-800">
              {currentPage > 1 ? (
                <Link
                  href={createPageUrl(currentPage - 1)}
                  className="px-3 py-1.5 rounded border border-neutral-300 dark:border-neutral-700 text-xs font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                >
                  ← Trang trước
                </Link>
              ) : (
                <span className="px-3 py-1.5 rounded border border-neutral-200 dark:border-neutral-800 text-xs font-medium text-neutral-300 dark:text-neutral-700 cursor-not-allowed">
                  ← Trang trước
                </span>
              )}

              <div className="flex items-center gap-1 px-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <Link
                    key={p}
                    href={createPageUrl(p)}
                    className={`w-8 h-8 flex items-center justify-center rounded text-xs font-bold transition-colors ${
                      p === currentPage
                        ? 'bg-blue-600 text-white shadow'
                        : 'border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                    }`}
                  >
                    {p}
                  </Link>
                ))}
              </div>

              {currentPage < totalPages ? (
                <Link
                  href={createPageUrl(currentPage + 1)}
                  className="px-3 py-1.5 rounded border border-neutral-300 dark:border-neutral-700 text-xs font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                >
                  Trang sau →
                </Link>
              ) : (
                <span className="px-3 py-1.5 rounded border border-neutral-200 dark:border-neutral-800 text-xs font-medium text-neutral-300 dark:text-neutral-700 cursor-not-allowed">
                  Trang sau →
                </span>
              )}
            </div>
          )}
        </>
      )}
    </section>
  );
}