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
    let sql = `SELECT * FROM products`;
    const params: any[] = [];

    if (query) {
      sql += ` WHERE title LIKE ? OR name LIKE ?`;
      params.push(`%${query}%`, `%${query}%`);
    }

    sql += ` ORDER BY created_at DESC`;

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
          price: formattedPrice,
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
  const pageSize = 18; // 18 sản phẩm mỗi trang

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
                  <span className="rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white whitespace-nowrap shadow-sm">
                    {product.price}
                  </span>
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