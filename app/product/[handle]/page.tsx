import { db } from 'lib/turso';
import type { Metadata } from 'next';
import ProductDetailClient from './ProductDetailClient';

// Hàm lấy thông tin sản phẩm từ CSDL Turso ở phía Server
async function getProductForMetadata(handle: string) {
  try {
    const result = await db.execute({
      sql: `SELECT * FROM products WHERE handle = ? OR id = ? LIMIT 1`,
      args: [handle, handle]
    });
    return result.rows[0] || null;
  } catch (error) {
    console.error('Lỗi lấy metadata sản phẩm:', error);
    return null;
  }
}

// Hàm sinh metadata động cho Zalo, Facebook (Open Graph Tags)
export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const product: any = await getProductForMetadata(resolvedParams.handle);

  if (!product) {
    return {
      title: 'Sản phẩm | Đẹp và Xinh Shop',
      description: 'Hệ thống thời trang và giày dép, phụ kiện',
    };
  }

  // Lấy ảnh sản phẩm làm hình thu nhỏ (Thumbnail) khi chia sẻ link
  let imageUrl = product.featured_image_url || product.image_url || '';
  if (!imageUrl && product.images) {
    try {
      const parsedImages = typeof product.images === 'string' ? JSON.parse(product.images) : product.images;
      if (Array.isArray(parsedImages) && parsedImages.length > 0) {
        imageUrl = parsedImages[0];
      }
    } catch (e) {
      imageUrl = '';
    }
  }

  const title = String(product.title || product.name || 'Sản phẩm mới');
  const description = String(product.description || 'Xem chi tiết sản phẩm và mua sắm tại Đẹp và Xinh Shop.');

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: imageUrl ? [{ url: imageUrl }] : [],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: imageUrl ? [imageUrl] : [],
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const resolvedParams = await params;
  return <ProductDetailClient handle={resolvedParams.handle} />;
}