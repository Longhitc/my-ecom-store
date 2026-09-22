import { db } from 'lib/turso';
import { NextResponse } from 'next/server';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Await params để lấy orderId (Bắt buộc trên Next.js 15)
    const { id: orderId } = await params;

    if (!orderId) {
      return NextResponse.json({ error: 'Thiếu mã đơn hàng' }, { status: 400 });
    }

    // 2. Truy vấn thông tin tổng quan của đơn hàng
    const orderResult = await db.execute({
      sql: `SELECT id, customer_id, total_price, status, full_name, phone, address_line, city, created_at 
            FROM orders 
            WHERE id = ?`,
      args: [orderId],
    });

    if (orderResult.rows.length === 0) {
      return NextResponse.json({ error: 'Không tìm thấy đơn hàng' }, { status: 404 });
    }

    // ÉP KIỂU (as any) TẠI ĐÂY NÀY BẠN:
    const order = orderResult.rows[0] as any;

    // 3. Truy vấn danh sách sản phẩm thuộc đơn hàng này
    const itemsResult = await db.execute({
      sql: `SELECT id, product_id, product_title, price, quantity, image_url 
            FROM order_items 
            WHERE order_id = ?`,
      args: [orderId],
    });

    return NextResponse.json({
      order: {
        id: order.id,
        totalPrice: order.total_price,
        status: order.status,
        fullName: order.full_name,
        phone: order.phone,
        addressLine: order.address_line,
        city: order.city,
        createdAt: order.created_at,
        items: itemsResult.rows.map((item: any) => ({
          id: item.id,
          productId: item.product_id,
          title: item.product_title,
          price: item.price,
          quantity: item.quantity,
          imageUrl: item.image_url,
        })),
      },
    });
  } catch (error) {
    console.error('Lỗi khi lấy chi tiết đơn hàng:', error);
    return NextResponse.json({ error: 'Lỗi máy chủ' }, { status: 500 });
  }
}