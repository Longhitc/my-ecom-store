import { db } from 'lib/turso';
import { NextResponse } from 'next/server';

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

    // 1. Lưu thông tin chung vào bảng `promotions`
    await db.execute({
      sql: `INSERT INTO promotions (id, name, start_date, end_date, status, created_at) VALUES (?, ?, ?, ?, ?, ?)`,
      args: [promotionId, name, start_date, end_date, status, now],
    });

    // 2. Duyệt qua từng sản phẩm và các biến thể để lưu vào bảng `promotion_items`
    for (const prod of items) {
      if (prod.variants && prod.variants.length > 0) {
        // Nếu sản phẩm có các biến thể (size/màu), lưu từng biến thể
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
        // Nếu sản phẩm không có biến thể
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