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
    // Chỉ SELECT * đơn giản, không cố WHERE vào các cột chưa chắc tồn tại
    let sql = `SELECT * FROM products`;
    const params: any[] = [];

    if (query) {
      sql += ` WHERE title LIKE ? OR name LIKE ?`;
      params.push(`%${query}%`, `%${query}%`);
    }

    sql += ` ORDER BY created_at DESC`;

    const result = await db.execute({ sql, args: params });

    return result.rows
      // 1. LỌC SẢN PHẨM ẨN BẰNG JAVASCRIPT (An toàn 100% không sợ lỗi SQL)
      .filter((row: any) => {
        // Nếu có cột is_active thì phải bằng 1
        if (row.is_active !== undefined && row.is_active !== null) {
          if (Number(row.is_active) === 0 || row.is_active === false) return false;
        }
        // Nếu có cột status thì không được là hidden/inactive
        if (row.status && (row.status === 'hidden' || row.status === 'inactive')) {
          return false;
        }
        return true;
      })
      // 2. MAPPING DỮ LIỆU SẢN PHẨM
      .map((row: any) => {
        // Lấy giá trị min_price hoặc price
        const rawPrice = Number(row.min_price ?? row.price ?? 0);
        const formattedPrice = `${rawPrice.toLocaleString('vi-VN')} đ`;

        // Lấy ảnh từ featured_image_url, image_url hoặc mảng JSON images
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
  searchParams?: Promise<{ q?: string; sort?: string }>;
}) {
  // Await searchParams đúng chuẩn Next.js 15
  const searchParams = await props.searchParams;
  const query = searchParams?.q;
  const products = await getProducts(query);
  return (
    <section>
      {products.length === 0 ? (
        <p className="py-10 text-center text-neutral-400">Không tìm thấy sản phẩm nào.</p>
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