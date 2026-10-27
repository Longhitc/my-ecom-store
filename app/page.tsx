import { db } from 'lib/turso';
import Link from 'next/link';
import HomeHeroSlider from './HomeHeroSlider';

// Hàm fetch danh sách sản phẩm đang khuyến mãi (Đã lọc bỏ các chương trình hết hạn hoặc đã dừng)
async function getPromoProducts() {
  try {
    const result = await db.execute(`
      SELECT p.id, p.handle, p.title, p.featured_image_url as image_url, 
             MIN(p.min_price) as original_price,
             MIN(pi.promo_price) as promo_price, 
             pi.discount_value, pi.discount_type
      FROM promotion_items pi
      JOIN promotions prm ON pi.promotion_id = prm.id
      JOIN products p ON pi.product_id = p.id
      WHERE prm.status = 'active' AND prm.end_date >= datetime('now')
      GROUP BY p.id
      ORDER BY pi.created_at DESC
      LIMIT 10
    `);

    return result.rows.map((row: any) => ({
      id: String(row.id),
      handle: String(row.handle || row.id),
      title: String(row.title || 'Sản phẩm'),
      originalPrice: `${Number(row.original_price ?? 0).toLocaleString('vi-VN')} đ`,
      promoPrice: `${Number(row.promo_price ?? 0).toLocaleString('vi-VN')} đ`,
      imageUrl: String(row.image_url || ''),
      discount: row.discount_type === 'percent' ? `-${row.discount_value}%` : `-${Number(row.discount_value || 0).toLocaleString('vi-VN')}đ`,
    }));
  } catch (error) {
    console.error('Lỗi truy vấn sản phẩm khuyến mãi:', error);
    return [];
  }
}

// Hàm fetch sản phẩm nổi bật (Đã loại trừ các sản phẩm đang nằm trong Khuyến Mãi Hot)
async function getFeaturedProducts(excludeIds: string[]) {
  try {
    let query = `SELECT * FROM products`;
    if (excludeIds.length > 0) {
      const idsString = excludeIds.map(id => `'${id}'`).join(',');
      query += ` WHERE id NOT IN (${idsString})`;
    }
    query += ` ORDER BY created_at DESC LIMIT 4`;

    const result = await db.execute(query);

    return result.rows.map((row: any) => ({
      id: String(row.id),
      handle: String(row.handle || row.id),
      title: String(row.title || row.name || 'Sản phẩm'),
      price: `${Number(row.min_price ?? row.price ?? 0).toLocaleString('vi-VN')} đ`,
      imageUrl: String(row.featured_image_url || row.image_url || ''),
    }));
  } catch (error) {
    console.error('Lỗi truy vấn sản phẩm nổi bật:', error);
    return [];
  }
}

export default async function HomePage() {
  const promoProducts = await getPromoProducts();
  const promoIds = promoProducts.map(p => p.id);
  const featuredProducts = await getFeaturedProducts(promoIds);

  return (
    <div className="mx-auto max-w-screen-2xl px-4 py-2 md:px-6 space-y-3">
      
      {/* PHẦN 1: 2 KHUNG CẢI TIẾN */}
      <section>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          
          <HomeHeroSlider />

          {/* Khung Khuyến Mãi Hot */}
          <div className="relative flex flex-col justify-between overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/50 p-3 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-bold text-neutral-800 dark:text-white flex items-center gap-1.5">
                🔥 Khuyến Mãi Hot
              </h2>
              <Link href="/search" className="text-xs text-blue-600 hover:underline font-semibold">
                Xem tất cả →
              </Link>
            </div>

            {promoProducts.length === 0 ? (
              <div className="flex-1 flex items-center justify-center py-8 text-neutral-400 text-xs text-center border border-dashed rounded-lg dark:border-neutral-800">
                Chưa có chương trình khuyến mãi nào đang chạy.
              </div>
            ) : (
              <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-neutral-300 dark:scrollbar-thumb-neutral-700 snap-x snap-mandatory">
                {promoProducts.map((item) => (
                  <Link
                    key={item.id}
                    href={`/product/${item.handle}`}
                    className="group relative flex flex-col justify-between overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-black/40 p-2 transition-all hover:border-blue-600 shrink-0 w-[calc(50%-5px)] snap-start"
                  >
                    <span className="absolute top-2 left-2 z-10 rounded bg-red-600 px-1 py-0.2 text-[9px] font-bold text-white shadow">
                      {item.discount}
                    </span>

                    <div className="w-[70%] mx-auto pt-0.5">
                      <div className="relative aspect-square overflow-hidden rounded-md bg-white dark:bg-neutral-900">
                        <img
                          src={item.imageUrl || 'https://via.placeholder.com/150'}
                          alt={item.title}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>
                    </div>

                    <div className="mt-1.5 flex flex-col gap-0.5">
                      <span className="text-[11px] font-medium text-neutral-800 dark:text-white line-clamp-1">
                        {item.title}
                      </span>
                      <div className="flex items-center justify-end gap-2">
                        <span className="text-xs text-neutral-400 line-through">
                          {item.originalPrice}
                        </span>
                        <span className="text-sm font-extrabold text-red-600">
                          {item.promoPrice}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

        </div>
      </section>

      {/* PHẦN 2: SẢN PHẨM NỔI BẬT */}
      <section>
        <h2 className="mb-2 text-center text-base font-bold text-neutral-800 dark:text-white">
          Sản phẩm nổi bật
        </h2>

        {featuredProducts.length === 0 ? (
          <p className="text-center text-neutral-400 text-xs">Chưa có sản phẩm nào khác trong CSDL.</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {featuredProducts.map((product) => (
              <Link
                key={product.id}
                href={`/product/${product.handle}`}
                className="group flex flex-col justify-between overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black transition-all hover:border-blue-600 p-2"
              >
                <div className="w-[70%] mx-auto pt-1">
                  <div className="relative aspect-square overflow-hidden rounded-lg bg-neutral-100 dark:bg-neutral-900">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[10px] text-neutral-500">
                        Chưa có ảnh
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-1 pt-2 text-left">
                  <span className="text-xs font-medium text-neutral-800 dark:text-white line-clamp-1">
                    {product.title}
                  </span>
                  <div className="flex justify-end">
                    <span className="inline-block rounded-full bg-blue-600 px-3 py-1 text-xs font-bold text-white whitespace-nowrap shadow-sm">
                      {product.price}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}