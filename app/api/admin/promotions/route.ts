import { db } from 'lib/turso';
import { NextResponse } from 'next/server';

// 1. HÀM GET: Lấy danh sách promotions kèm theo thông tin chi tiết sản phẩm
export async function GET() {
  try {
    const promoResult = await db.execute(`
      SELECT p.*, pi.product_id, pi.variant_id, pi.promo_price, pi.discount_value, pi.discount_type,
             prod.title as product_title, prod.featured_image_url as product_image, prod.id as product_code
      FROM promotions p
      LEFT JOIN promotion_items pi ON p.id = pi.promotion_id
      LEFT JOIN products prod ON pi.product_id = prod.id
    `);

    return NextResponse.json({
      success: true,
      promotions: promoResult.rows,
    });
  } catch (error: any) {
    console.error('Lỗi khi lấy danh sách promotions:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// 2. HÀM POST: Tạo mới chương trình khuyến mãi
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, start_date, end_date, items } = body;

    if (!name || !start_date || !end_date || !items || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Vui lòng điền đầy đủ thông tin và chọn sản phẩm khuyến mãi!' },
        { status: 400 }
      );
    }

    const promotionId = 'promo_' + Date.now();
    const now = new Date().toISOString();
    const status = 'active';

    await db.execute({
      sql: `INSERT INTO promotions (id, name, start_date, end_date, status, created_at) VALUES (?, ?, ?, ?, ?, ?)`,
      args: [promotionId, name, start_date, end_date, status, now],
    });

    for (const prod of items) {
      if (prod.variants && prod.variants.length > 0) {
        for (const v of prod.variants) {
          const itemId = 'item_' + Math.random().toString(36).substring(2, 9) + Date.now();
          await db.execute({
            sql: `INSERT INTO promotion_items (id, promotion_id, product_id, variant_id, discount_type, discount_value, promo_price, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            args: [
              itemId,
              promotionId,
              prod.id,
              v.id,
              v.discount_type || prod.discount_type || 'percent',
              v.discount_value || prod.discount_value || 0,
              v.promo_price || 0,
              now,
            ],
          });
        }
      } else {
        const itemId = 'item_' + Math.random().toString(36).substring(2, 9) + Date.now();
        await db.execute({
          sql: `INSERT INTO promotion_items (id, promotion_id, product_id, variant_id, discount_type, discount_value, promo_price, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          args: [
            itemId,
            promotionId,
            prod.id,
            null,
            prod.discount_type || 'percent',
            prod.discount_value || 0,
            prod.promo_price || 0,
            now,
          ],
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Đã tạo chương trình khuyến mãi thành công!',
    });
  } catch (error: any) {
    console.error('Lỗi khi lưu promotion:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Lỗi server nội bộ' },
      { status: 500 }
    );
  }
}

// 3. HÀM PUT: Cập nhật / Gia hạn thời gian hoặc Dừng chương trình khuyến mãi sớm
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, end_date, status } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Thiếu ID chương trình khuyến mãi!' }, { status: 400 });
    }

    if (status === 'stop') {
      const now = new Date().toISOString();
      await db.execute({
        sql: `UPDATE promotions SET end_date = ?, status = 'expired' WHERE id = ?`,
        args: [now, id],
      });
    } else if (end_date) {
      await db.execute({
        sql: `UPDATE promotions SET end_date = ?, status = 'active' WHERE id = ?`,
        args: [end_date, id],
      });
    }

    return NextResponse.json({ success: true, message: 'Cập nhật chương trình thành công!' });
  } catch (error: any) {
    console.error('Lỗi cập nhật promotion:', error);
    return NextResponse.json({ success: false, error: error.message || 'Lỗi server nội bộ' }, { status: 500 });
  }
}