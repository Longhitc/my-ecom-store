import { db } from 'lib/turso';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// Kiểm tra quyền Admin
async function checkAdminAuth() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('customer_session')?.value;
  if (!sessionCookie) return false;

  try {
    const user = JSON.parse(sessionCookie);
    return user?.is_admin === true || Number(user?.is_admin) === 1;
  } catch {
    return false;
  }
}

// GET: Lấy danh sách đơn hàng cho Admin
export async function GET() {
  const isAdmin = await checkAdminAuth();
  if (!isAdmin) {
    return NextResponse.json({ message: 'Bạn không có quyền truy cập!' }, { status: 403 });
  }

  try {
    // 1. Lấy danh sách đơn hàng
    const ordersResult = await db.execute(`
      SELECT 
        id, 
        customer_id, 
        total_price, 
        status, 
        full_name,
        phone,
        address_line,
        city,
        created_at
      FROM orders
      ORDER BY created_at DESC
    `);

    if (ordersResult.rows.length === 0) {
      return NextResponse.json({ orders: [] });
    }

    // 2. Lấy danh sách sản phẩm trong các đơn hàng
    const orderIds = ordersResult.rows.map((r: any) => r.id);
    const placeholders = orderIds.map(() => '?').join(',');

    const itemsResult = await db.execute({
      sql: `
        SELECT 
          id,
          order_id,
          product_id,
          product_title,
          quantity,
          price,
          image_url
        FROM order_items
        WHERE order_id IN (${placeholders})
      `,
      args: orderIds,
    });

    // Nhóm sản phẩm theo order_id
    const itemsByOrder: Record<string, any[]> = {};
    itemsResult.rows.forEach((item: any) => {
      const orderId = String(item.order_id);
      if (!itemsByOrder[orderId]) {
        itemsByOrder[orderId] = [];
      }
      itemsByOrder[orderId].push({
        product_id: item.product_id,
        title: item.product_title, // Khớp với Frontend item.title
        price: item.price,
        quantity: item.quantity,
        image_url: item.image_url, // Khớp với Frontend item.image_url
      });
    });

    // Format kết quả trả về khớp 100% với Interface Order ở Frontend
    const orders = ordersResult.rows.map((order: any) => ({
      id: order.id,
      customer_name: order.full_name || 'Khách vãng lai',
      customer_email: '',
      customer_phone: order.phone || '',
      total_price: Number(order.total_price) || 0,
      status: order.status,
      shipping_address: [order.address_line, order.city].filter(Boolean).join(', '),
      created_at: order.created_at,
      items: itemsByOrder[String(order.id)] || [],
    }));

    return NextResponse.json({ orders }, { status: 200 });
  } catch (error) {
    console.error('Lỗi khi lấy danh sách đơn hàng Admin:', error);
    return NextResponse.json({ message: 'Lỗi máy chủ khi tải đơn hàng' }, { status: 500 });
  }
}

// PATCH: Cập nhật trạng thái đơn hàng
export async function PATCH(request: Request) {
  const isAdmin = await checkAdminAuth();
  if (!isAdmin) {
    return NextResponse.json({ message: 'Bạn không có quyền truy cập!' }, { status: 403 });
  }

  try {
    const { orderId, status } = await request.json();

    if (!orderId || !status) {
      return NextResponse.json({ message: 'Thiếu thông tin đơn hàng hoặc trạng thái!' }, { status: 400 });
    }

    await db.execute({
      sql: 'UPDATE orders SET status = ? WHERE id = ?',
      args: [status, orderId],
    });

    return NextResponse.json({ message: 'Cập nhật trạng thái thành công!' }, { status: 200 });
  } catch (error) {
    console.error('Lỗi khi cập nhật trạng thái đơn hàng:', error);
    return NextResponse.json({ message: 'Lỗi máy chủ khi cập nhật đơn hàng' }, { status: 500 });
  }
}