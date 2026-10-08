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

// 1. POST: Xử lý Tạo đơn hàng mới từ Trang Checkout
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { customerId, fullName, phone, addressLine, city, items } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Giỏ hàng của bạn đang trống.' },
        { status: 400 }
      );
    }

    if (!customerId) {
      return NextResponse.json(
        { error: 'Chưa đăng nhập hoặc thiếu ID khách hàng.' },
        { status: 401 }
      );
    }

    // Tính tổng tiền
    const totalAmount = items.reduce((sum: number, item: any) => {
      const price = Number(item.price) || 0;
      const quantity = Number(item.quantity) || 1;
      return sum + price * quantity;
    }, 0);

    const orderId = `DH-${Date.now()}`;

    // Lưu vào bảng orders
    await db.execute({
      sql: `INSERT INTO orders (id, customer_id, full_name, phone, address_line, city, total_price, status, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', CURRENT_TIMESTAMP)`,
      args: [
        orderId,
        customerId,
        fullName || '',
        phone || '',
        addressLine || '',
        city || '',
        totalAmount,
      ],
    });

    // Lưu từng sản phẩm vào bảng order_items
    for (const item of items) {
      const itemId = `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const itemImageUrl = item.imageUrl || item.image_url || item.image || '';

      let fullTitle = item.title || item.name || 'Sản phẩm';
      if (item.style || item.size) {
        const optionDetails = [item.style, item.size].filter(Boolean).join(' / ');
        if (optionDetails && !fullTitle.includes(optionDetails)) {
          fullTitle = `${fullTitle} (${optionDetails})`;
        }
      }

      await db.execute({
        sql: `INSERT INTO order_items (id, order_id, product_id, product_title, price, quantity, image_url)
              VALUES (?, ?, ?, ?, ?, ?, ?)`,
        args: [
          itemId,
          orderId,
          item.id || item.productId || item.product_id || '',
          fullTitle,
          Number(item.price) || 0,
          Number(item.quantity) || 1,
          itemImageUrl,
        ],
      });
    }

    return NextResponse.json(
      { success: true, orderId, message: 'Tạo đơn hàng thành công!' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Lỗi khi tạo đơn hàng (POST /api/orders):', error);
    return NextResponse.json(
      { error: `Lỗi Server: ${error?.message || 'Không thể ghi đơn hàng vào cơ sở dữ liệu'}` },
      { status: 500 }
    );
  }
}

// 2. GET: Lấy danh sách đơn hàng cho Admin (ĐÃ JOIN LẤY KHÁCH HÀNG & NGƯỜI NHẬN BÀI BẢN)
export async function GET() {
  const isAdmin = await checkAdminAuth();
  if (!isAdmin) {
    return NextResponse.json({ message: 'Bạn không có quyền truy cập!' }, { status: 403 });
  }

  try {
    const ordersResult = await db.execute(`
      SELECT 
        o.id, 
        o.customer_id, 
        o.total_price, 
        o.status, 
        o.full_name AS recipient_name,
        o.phone AS recipient_phone,
        o.address_line,
        o.city,
        o.created_at,
        c.name AS customer_name,
        c.phone AS customer_phone,
        c.email AS customer_email
      FROM orders o
      LEFT JOIN customers c ON o.customer_id = c.id
      ORDER BY o.created_at DESC
    `);

    if (ordersResult.rows.length === 0) {
      return NextResponse.json({ orders: [] });
    }

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

    const itemsByOrder: Record<string, any[]> = {};
    itemsResult.rows.forEach((item: any) => {
      const orderId = String(item.order_id);
      if (!itemsByOrder[orderId]) {
        itemsByOrder[orderId] = [];
      }
      itemsByOrder[orderId].push({
        product_id: item.product_id,
        title: item.product_title,
        price: item.price,
        quantity: item.quantity,
        image_url: item.image_url,
      });
    });

    const orders = ordersResult.rows.map((order: any) => ({
      id: order.id,
      // TÀI KHOẢN KHÁCH HÀNG
      customer_name: order.customer_name || 'Tài khoản không tên',
      customer_email: order.customer_email || '',
      customer_phone: order.customer_phone || '',
      // NGƯỜI NHẬN HÀNG (Võ Tuyết Vân)
      recipient_name: order.recipient_name || 'Chưa có tên',
      recipient_phone: order.recipient_phone || '',
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

// 3. PATCH: Cập nhật trạng thái đơn hàng
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