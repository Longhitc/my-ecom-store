import { createClient } from '@libsql/client';
import { NextResponse } from 'next/server';

const db = createClient({
  url: process.env.TURSO_DATABASE_URL || '',
  authToken: process.env.TURSO_AUTH_TOKEN || '',
});

// Hàm hỗ trợ tính toán min_price và max_price từ danh sách biến thể
function calculatePrices(variants: any[]) {
  if (!Array.isArray(variants) || variants.length === 0) {
    return { minPrice: 0, maxPrice: 0 };
  }

  const prices = variants
    .map((v) => Number(v.amount) || 0)
    .filter((price) => price > 0);

  if (prices.length === 0) {
    return { minPrice: 0, maxPrice: 0 };
  }

  return {
    minPrice: Math.min(...prices),
    maxPrice: Math.max(...prices),
  };
}

// 1. GET: Lấy danh sách HOẶC Lấy chi tiết 1 sản phẩm
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    // === TRƯỜNG HỢP 1: LẤY CHI TIẾT 1 SẢN PHẨM THEO ID ===
    if (id) {
      const productRes = await db.execute(
        'SELECT id, handle, title, description, category, featured_image_url, featured_image_alt, is_active FROM products WHERE id = ?',
        [id]
      );

      if (!productRes.rows.length) {
        return NextResponse.json({ error: 'Không tìm thấy sản phẩm' }, { status: 404 });
      }

      const p = productRes.rows[0] as Record<string, any>;

      // Lấy danh sách ảnh phụ
      const imagesRes = await db.execute(
        'SELECT url FROM product_images WHERE product_id = ? ORDER BY position ASC, id ASC',
        [id]
      );
      const images = imagesRes.rows.map((r) => String(r.url || ''));

      // Lấy danh sách biến thể
      const variantsRes = await db.execute(
        'SELECT id, title, amount, quantity_available FROM product_variants WHERE product_id = ?',
        [id]
      );

      const variants = await Promise.all(
        variantsRes.rows.map(async (row) => {
          const v = row as Record<string, any>;
          const attrsRes = await db.execute(
            'SELECT name, value FROM variant_attributes WHERE variant_id = ?',
            [v.id]
          );
          return {
            id: String(v.id),
            title: String(v.title || 'Mặc định'),
            amount: Number(v.amount || 0),
            quantity_available: Number(v.quantity_available || 0),
            attributes: attrsRes.rows.map((attrRow) => {
              const a = attrRow as Record<string, any>;
              return {
                name: String(a.name || ''),
                value: String(a.value || ''),
              };
            }),
          };
        })
      );

      return NextResponse.json({
        product: {
          id: String(p.id),
          handle: String(p.handle || ''),
          title: String(p.title || ''),
          description: String(p.description || ''),
          category: String(p.category || 'Thời Trang Nam'),
          featured_image_url: String(p.featured_image_url || ''),
          featured_image_alt: String(p.featured_image_alt || ''),
          is_active: p.is_active === 1 || p.is_active === true,
          images: images.length > 0 ? images : [''],
          variants:
            variants.length > 0
              ? variants
              : [
                  {
                    title: 'Mặc định',
                    amount: 0,
                    quantity_available: 0,
                    attributes: [],
                  },
                ],
        },
      });
    }

    // === TRƯỜNG HỢP 2: LẤY DANH SÁCH TẤT CẢ SẢN PHẨM ===
    const result = await db.execute(`
      SELECT 
        p.id, 
        p.handle,
        p.title, 
        p.description, 
        p.featured_image_url, 
        p.category,
        p.is_active,
        COALESCE(p.min_price, MIN(v.amount), 0) as price,
        COALESCE(SUM(v.quantity_available), 0) as stock
      FROM products p
      LEFT JOIN product_variants v ON p.id = v.product_id
      GROUP BY p.id
      ORDER BY p.id DESC
    `);

    const products = result.rows.map((row) => {
      const r = row as Record<string, any>;
      return {
        id: String(r.id),
        handle: String(r.handle || ''),
        title: String(r.title || ''),
        description: String(r.description || ''),
        price: Number(r.price || 0),
        stock: Number(r.stock || 0),
        category: String(r.category || ''),
        image_url: String(r.featured_image_url || ''),
        is_active: r.is_active === 1 || r.is_active === true,
      };
    });

    return NextResponse.json({ products });
  } catch (error: any) {
    console.error('Lỗi GET /api/admin/products:', error);
    return NextResponse.json(
      { error: 'Lỗi tải dữ liệu sản phẩm: ' + error.message },
      { status: 500 }
    );
  }
}

// 2. POST: Thêm sản phẩm
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, handle, category, featured_image_url, featured_image_alt, description, images, variants } = body;

    if (!title) {
      return NextResponse.json({ error: 'Tên sản phẩm là bắt buộc' }, { status: 400 });
    }

    const productId = `prod-${Date.now()}`;

    // Tính toán min_price & max_price từ biến thể
    const { minPrice, maxPrice } = calculatePrices(variants);

    await db.execute(
      `INSERT INTO products (id, handle, title, description, category, min_price, max_price, featured_image_url, featured_image_alt, is_active) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      [
        productId,
        handle || `slug-${Date.now()}`,
        title,
        description || '',
        category || 'Thời Trang Nam',
        minPrice,
        maxPrice,
        featured_image_url || '',
        featured_image_alt || '',
      ]
    );

    if (Array.isArray(images)) {
      for (let i = 0; i < images.length; i++) {
        if (images[i] && images[i].trim() !== '') {
          await db.execute(
            'INSERT INTO product_images (product_id, url, position) VALUES (?, ?, ?)',
            [productId, images[i].trim(), i]
          );
        }
      }
    }

    if (Array.isArray(variants)) {
      for (let i = 0; i < variants.length; i++) {
        const v = variants[i];
        const variantId = `var-${productId}-${i}`;
        await db.execute(
          'INSERT INTO product_variants (id, product_id, title, amount, quantity_available) VALUES (?, ?, ?, ?, ?)',
          [variantId, productId, v.title || 'Mặc định', Number(v.amount) || 0, Number(v.quantity_available) || 0]
        );

        if (Array.isArray(v.attributes)) {
          for (const attr of v.attributes) {
            if (attr.name && attr.value) {
              await db.execute(
                'INSERT INTO variant_attributes (variant_id, name, value) VALUES (?, ?, ?)',
                [variantId, attr.name, attr.value]
              );
            }
          }
        }
      }
    }

    return NextResponse.json({ message: 'Thêm sản phẩm thành công', id: productId }, { status: 201 });
  } catch (error: any) {
    console.error('Lỗi POST /api/admin/products:', error);
    return NextResponse.json({ error: 'Lỗi thêm sản phẩm: ' + error.message }, { status: 500 });
  }
}

// 3. PUT: Cập nhật sản phẩm
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, title, handle, category, featured_image_url, featured_image_alt, description, images, variants } = body;

    if (!id) {
      return NextResponse.json({ error: 'Thiếu ID sản phẩm' }, { status: 400 });
    }

    // Tính toán min_price & max_price từ biến thể mới
    const { minPrice, maxPrice } = calculatePrices(variants);

    await db.execute(
      `UPDATE products 
       SET title = ?, handle = ?, description = ?, category = ?, min_price = ?, max_price = ?, featured_image_url = ?, featured_image_alt = ?
       WHERE id = ?`,
      [title, handle || '', description || '', category || '', minPrice, maxPrice, featured_image_url || '', featured_image_alt || '', id]
    );

    // Xóa ảnh phụ cũ & chèn mới
    await db.execute('DELETE FROM product_images WHERE product_id = ?', [id]);
    if (Array.isArray(images)) {
      for (let i = 0; i < images.length; i++) {
        if (images[i] && images[i].trim() !== '') {
          await db.execute(
            'INSERT INTO product_images (product_id, url, position) VALUES (?, ?, ?)',
            [id, images[i].trim(), i]
          );
        }
      }
    }

    // Xóa biến thể cũ & chèn mới
    const oldVariants = await db.execute('SELECT id FROM product_variants WHERE product_id = ?', [id]);
    for (const row of oldVariants.rows) {
      const v = row as Record<string, any>;
      await db.execute('DELETE FROM variant_attributes WHERE variant_id = ?', [v.id]);
    }
    await db.execute('DELETE FROM product_variants WHERE product_id = ?', [id]);

    if (Array.isArray(variants)) {
      for (let i = 0; i < variants.length; i++) {
        const v = variants[i];
        const variantId = `var-${id}-${i}-${Date.now()}`;
        await db.execute(
          'INSERT INTO product_variants (id, product_id, title, amount, quantity_available) VALUES (?, ?, ?, ?, ?)',
          [variantId, id, v.title || 'Mặc định', Number(v.amount) || 0, Number(v.quantity_available) || 0]
        );

        if (Array.isArray(v.attributes)) {
          for (const attr of v.attributes) {
            if (attr.name && attr.value) {
              await db.execute(
                'INSERT INTO variant_attributes (variant_id, name, value) VALUES (?, ?, ?)',
                [variantId, attr.name, attr.value]
              );
            }
          }
        }
      }
    }

    return NextResponse.json({ message: 'Cập nhật sản phẩm thành công' });
  } catch (error: any) {
    console.error('Lỗi PUT /api/admin/products:', error);
    return NextResponse.json({ error: 'Lỗi cập nhật sản phẩm: ' + error.message }, { status: 500 });
  }
}

// 4. DELETE: Xóa sản phẩm
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Thiếu ID sản phẩm cần xóa' }, { status: 400 });
    }
    await db.execute(
      'DELETE FROM variant_attributes WHERE variant_id IN (SELECT id FROM product_variants WHERE product_id = ?)',
      [id]
    );
    await db.execute('DELETE FROM product_variants WHERE product_id = ?', [id]);
    await db.execute('DELETE FROM product_images WHERE product_id = ?', [id]);
    await db.execute('DELETE FROM products WHERE id = ?', [id]);

    return NextResponse.json({ message: 'Xóa sản phẩm thành công' });
  } catch (error: any) {
    console.error('Lỗi DELETE /api/admin/products:', error);
    return NextResponse.json({ error: 'Lỗi xóa sản phẩm: ' + error.message }, { status: 500 });
  }
}