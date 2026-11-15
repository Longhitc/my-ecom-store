import { db } from 'lib/turso';
import type { Metadata } from 'next';
import ProductDetailClient from './ProductDetailClient';

// QUAN TRỌNG: Cache lại metadata trong 1 giờ để Zalo Bot quét phản hồi trong tích tắc, không bị timeout
export const revalidate = 3600;

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

  const baseUrl = 'https://depvaxinhshop.vercel.app';
  if (imageUrl && !imageUrl.startsWith('http')) {
    imageUrl = `${baseUrl}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
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