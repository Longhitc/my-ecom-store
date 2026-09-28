import { db } from 'lib/turso'; // Import đúng tên 'db' từ file lib/turso.ts của bạn
import Link from 'next/link';

// Hàm fetch danh sách sản phẩm trực tiếp từ Turso
async function getFeaturedProducts() {
  try {
    const result = await db.execute(
      `SELECT id, handle, title, min_price, featured_image_url FROM products ORDER BY created_at DESC LIMIT 8`
    );

    return result.rows.map((row) => ({
      id: String(row.id),
      handle: String(row.handle),
      title: String(row.title),
      // Định dạng giá tiền sang chuẩn VND (ví dụ: 295.000 đ)
      price: `${Number(row.min_price).toLocaleString('vi-VN')} đ`,
      imageUrl: String(row.featured_image_url),
    }));
  } catch (error) {
    console.error('Lỗi truy vấn sản phẩm từ Turso:', error);
    return [];
  }
}

export default async function HomePage() {
  const featuredProducts = await getFeaturedProducts();

  return (
    <div className="mx-auto max-w-screen-2xl px-4 py-4 md:px-6">
      
      {/* ----------------- PHẦN 1: 2 KHUNG DANH MỤC (TỶ LỆ 4:3) ----------------- */}
      <section className="mb-4">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          
          {/* Khung 1: Hàng Có Sẵn */}
          <Link 
            href="/search/co-san"
            className="group relative flex flex-col items-center justify-center overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900/50 p-6 text-center transition-all hover:border-neutral-700 hover:shadow-lg"
          >
            <h2 className="mb-4 text-2xl font-bold text-white transition-transform group-hover:scale-105">
              Hàng Có Sẵn
            </h2>
            <div className="w-1/2 mx-auto">
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-neutral-800">
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
            className="group relative flex flex-col items-center justify-center overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900/50 p-6 text-center transition-all hover:border-neutral-700 hover:shadow-lg"
          >
            <h2 className="mb-4 text-2xl font-bold text-white transition-transform group-hover:scale-105">
              Hàng Order
            </h2>
            <div className="w-1/2 mx-auto">
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-neutral-800">
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
        <h2 className="mb-4 text-center text-3xl font-bold text-white">
          Sản phẩm nổi bật
        </h2>

        {featuredProducts.length === 0 ? (
          <p className="text-center text-neutral-400">Chưa có sản phẩm nào trong CSDL.</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featuredProducts.map((product) => (
              <Link
                key={product.id}
                href={`/product/${product.handle}`}
                className="group flex flex-col overflow-hidden rounded-lg border border-neutral-800 bg-black transition-all hover:border-blue-600"
              >
                <div className="w-3/4 mx-auto">
                  <div className="relative aspect-square overflow-hidden bg-neutral-900">
                    <img
                      src={product.imageUrl}
                      alt={product.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-4">
                  <span className="text-sm font-medium text-white line-clamp-1">
                    {product.title}
                  </span>
                  <span className="rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white whitespace-nowrap">
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