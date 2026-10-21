import { db } from 'lib/turso';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const keyword = searchParams.get('keyword') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const offset = (page - 1) * limit;

    let whereConditions: string[] = [];
    let args: any[] = [];

    if (keyword.trim()) {
      whereConditions.push(`(title LIKE ? OR handle LIKE ?)`);
      const term = `%${keyword.trim()}%`;
      args.push(term, term);
    }

    const whereSql = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // 1. Lấy tổng số lượng sản phẩm
    const countRes = await db.execute({
      sql: `SELECT COUNT(*) as total FROM products ${whereSql}`,
      args,
    });
    const total = Number(countRes.rows[0]?.total || 0);

    // 2. Lấy danh sách sản phẩm khớp với cấu trúc bảng products thực tế
    const productsRes = await db.execute({
      sql: `
        SELECT id, title as name, handle, featured_image_url as image, min_price as price
        FROM products
        ${whereSql}
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?
      `,
      args: [...args, limit, offset],
    });

    const products = productsRes.rows || [];
    const productIds = products.map((p: any) => String(p.id));

    let variantsMap: Record<string, any[]> = {};

    if (productIds.length > 0) {
      try {
        const placeholders = productIds.map(() => '?').join(',');
        
        // 3. Lấy danh sách biến thể từ bảng product_variants
        const variantsRes = await db.execute({
          sql: `SELECT id, product_id, title, amount as price, quantity_available as stock FROM product_variants WHERE product_id IN (${placeholders})`,
          args: productIds,
        });

        const variants = variantsRes.rows || [];
        const variantIds = variants.map((v: any) => String(v.id));

        // 4. Lấy thuộc tính chi tiết (Size/Màu) từ variant_attributes
        let attributesMap: Record<string, any[]> = {};
        if (variantIds.length > 0) {
          const attrPlaceholders = variantIds.map(() => '?').join(',');
          const attrRes = await db.execute({
            sql: `SELECT variant_id, name, value FROM variant_attributes WHERE variant_id IN (${attrPlaceholders})`,
            args: variantIds,
          });

          (attrRes.rows || []).forEach((attr: any) => {
            const vId = String(attr.variant_id);
            if (!attributesMap[vId]) attributesMap[vId] = [];
            attributesMap[vId].push(attr);
          });
        }

        // Gộp thuộc tính vào từng biến thể
        variants.forEach((v: any) => {
          const vId = String(v.id);
          const attrs = attributesMap[vId] || [];
          // Tạo tên hiển thị cho biến thể (Ví dụ: "Đỏ / L" hoặc lấy title gốc)
          const attrString = attrs.map((a: any) => `${a.name}: ${a.value}`).join(' - ');
          
          const variantItem = {
            ...v,
            name: attrString ? `${v.title || ''} (${attrString})` : (v.title || 'Mặc định'),
          };

          const pId = String(v.product_id);
          if (!variantsMap[pId]) variantsMap[pId] = [];
          variantsMap[pId].push(variantItem);
        });

      } catch (err) {
        console.error('Lỗi khi truy vấn biến thể sản phẩm:', err);
      }
    }

    const items = products.map((p: any) => {
      const pId = String(p.id);
      return {
        ...p,
        stock: variantsMap[pId]?.reduce((acc, curr) => acc + (Number(curr.stock) || 0), 0) || 0,
        variants: variantsMap[pId] || [],
      };
    });

    return NextResponse.json({
      success: true,
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error: any) {
    console.error('API Error (search-for-promo):', error);
    return NextResponse.json({ error: error.message || 'Lỗi server' }, { status: 500 });
  }
}