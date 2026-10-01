import { db } from 'lib/turso';
import Link from 'next/link';

// Hàm fetch danh sách sản phẩm trực tiếp từ Turso
async function getFeaturedProducts() {
  try {
    const result = await db.execute(
      `SELECT * FROM products ORDER BY created_at DESC LIMIT 4`
    );

    return result.rows.map((row: any) => ({
      id: String(row.id),
      handle: String(row.handle || row.id),
      title: String(row.title || row.name || 'Sản phẩm'),
      price: `${Number(row.min_price ?? row.price ?? 0).toLocaleString('vi-VN')} đ`,
      imageUrl: String(row.featured_image_url || row.image_url || ''),
    }));
  } catch (error) {
    console.error('Lỗi truy vấn sản phẩm từ Turso:', error);
    return [];
  }
}

export default async function HomePage() {
  const featuredProducts = await getFeaturedProducts();

  return (
    <div className="mx-auto max-w-screen-2xl px-4 py-2 md:px-6">
      
      {/* ----------------- PHẦN 1: 2 KHUNG DANH MỤC ----------------- */}
      <section className="mb-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          
          {/* Khung 1: Hàng Có Sẵn */}
          <Link 
            href="/search/co-san"
            className="group relative flex flex-col items-center justify-center overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/50 p-4 text-center transition-all hover:border-blue-600 dark:hover:border-blue-600 hover:shadow-lg"
          >
            <h2 className="mb-2 text-xl font-bold text-neutral-800 dark:text-white transition-transform group-hover:scale-105">
              Hàng Có Sẵn
            </h2>
            <div className="w-3/5 mx-auto">
              <div className="relative aspect-[16/10] w-full overflow-hidden rounded-lg bg-neutral-100 dark:bg-neutral-800">
                <img
                  src="https://res.cloudinary.com/dpsejpp2/image/upload/v1786934595/H%C3%ACnh_N%E1%BB%81n_Shop_1.jpg"
                  alt="Hàng Có Sẵn"
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
            </div>
          </Link>

          {/* Khung 2: Hàng Order */}
          <Link 
            href="/search/order"
            className="group relative flex flex-col items-center justify-center overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/50 p-4 text-center transition-all hover:border-blue-600 dark:hover:border-blue-600 hover:shadow-lg"
          >
            <h2 className="mb-2 text-xl font-bold text-neutral-800 dark:text-white transition-transform group-hover:scale-105">
              Hàng Order
            </h2>
            <div className="w-3/5 mx-auto">
              <div className="relative aspect-[16/10] w-full overflow-hidden rounded-lg bg-neutral-100 dark:bg-neutral-800">
                <img
                  src="https://res.cloudinary.com/dpsejpp2/image/upload/v1786934614/Hinh_Shop_2.png"
                  alt="Hàng Order"
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
            </div>
          </Link>

        </div>
      </section>

      {/* ----------------- PHẦN 2: SẢN PHẨM NỔI BẬT ----------------- */}
      <section>
        <h2 className="mb-3 text-center text-xl font-bold text-neutral-800 dark:text-white">
          Sản phẩm nổi bật
        </h2>

        {featuredProducts.length === 0 ? (
          <p className="text-center text-neutral-400 text-sm">Chưa có sản phẩm nào trong CSDL.</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {featuredProducts.map((product) => (
              <Link
                key={product.id}
                href={`/product/${product.handle}`}
                className="group flex flex-col justify-between overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black transition-all hover:border-blue-600"
              >
                {/* Ảnh sản phẩm kích thước chuẩn (70% khung) vừa vặn và cân đối */}
                <div className="w-[70%] mx-auto pt-3">
                  <div className="relative aspect-square overflow-hidden rounded-lg bg-neutral-100 dark:bg-neutral-900">
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

                {/* Thanh Tên + Giá hiển thị rõ ràng */}
                <div className="flex items-center justify-between p-3">
                  <span className="text-xs font-medium text-neutral-800 dark:text-white line-clamp-1 pr-1">
                    {product.title}
                  </span>
                  <span className="rounded-full bg-blue-600 px-2.5 py-0.5 text-xs font-semibold text-white whitespace-nowrap">
                    {product.price}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

    </div>
  );
}