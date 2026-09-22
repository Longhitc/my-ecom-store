import { db } from 'lib/turso';
import { NextResponse } from 'next/server';

// 1. HAM GET: Lấy danh sách đơn hàng theo customerId
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const customerId = searchParams.get('customerId');

    if (!customerId) {
      return NextResponse.json({ error: 'Thiếu customerId' }, { status: 400 });
    }

    const result = await db.execute({
      sql: `SELECT id, total_price, status, created_at 
            FROM orders 
            WHERE customer_id = ? 
            ORDER BY created_at DESC`,
      args: [customerId],
    });

    const orders = result.rows.map((row: any) => ({
      id: row.id,
      total: row.total_price,
      status: row.status,
      createdAt: row.created_at,
    }));

    return NextResponse.json({ orders });
  } catch (error) {
    console.error('Lỗi lấy danh sách đơn hàng:', error);
    return NextResponse.json({ error: 'Không thể tải danh sách đơn hàng.' }, { status: 500 });
  }
}

// 2. HAM POST: Tạo đơn hàng mới
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { customerId, fullName, phone, addressLine, city, items } = body;

    if (!customerId || !items || items.length === 0) {
      return NextResponse.json({ error: 'Thông tin đơn hàng không hợp lệ.' }, { status: 400 });
    }

    if (!fullName || !phone || !addressLine || !city) {
      return NextResponse.json({ error: 'Vui lòng cung cấp đầy đủ thông tin giao hàng.' }, { status: 400 });
    }

    // Tính tổng giá trị đơn hàng
    const totalPrice = items.reduce((acc: number, item: any) => {
      const price = parseFloat(item.cost?.totalAmount?.amount || item.price || 0);
      const quantity = item.quantity || 1;
      return acc + price * quantity;
    }, 0);

    const orderId = crypto.randomUUID();

    // Insert vào bảng orders
    await db.execute({
      sql: `INSERT INTO orders (id, customer_id, total_price, status, full_name, phone, address_line, city)
            VALUES (?, ?, ?, 'pending', ?, ?, ?, ?)`,
      args: [orderId, customerId, totalPrice, fullName, phone, addressLine, city],
    });

    // Insert các mặt hàng vào bảng order_items
    for (const item of items) {
      const itemId = crypto.randomUUID();
      const productTitle = item.merchandise?.product?.title || item.title || 'Sản phẩm';
      const price = parseFloat(item.cost?.totalAmount?.amount || item.price || 0);
      const quantity = item.quantity || 1;
      
      const imageUrl = item.merchandise?.product?.featuredImage?.url || item.imageUrl || item.image || '';
      const productId = item.merchandise?.product?.id || item.id || item.productId || '';

      await db.execute({
        sql: `INSERT INTO order_items (id, order_id, product_id, product_title, price, quantity, image_url)
              VALUES (?, ?, ?, ?, ?, ?, ?)`,
        args: [itemId, orderId, productId, productTitle, price, quantity, imageUrl],
      });
    }

    return NextResponse.json({ success: true, orderId });
  } catch (error) {
    console.error('Lỗi khi tạo đơn hàng:', error);
    return NextResponse.json({ error: 'Không thể tạo đơn hàng. Vui lòng thử lại.' }, { status: 500 });
  }
}