import { db } from 'lib/turso';
import { NextResponse } from 'next/server';

// 1. GET: Lấy danh sách khách hàng kèm địa chỉ mặc định
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('id');

    // Nếu truyền id -> Lấy chi tiết 1 khách hàng + tất cả địa chỉ của họ
    if (customerId) {
      const customerRes = await db.execute({
        sql: `SELECT * FROM customers WHERE id = ?`,
        args: [customerId],
      });

      if (customerRes.rows.length === 0) {
        return NextResponse.json({ error: 'Không tìm thấy khách hàng' }, { status: 404 });
      }

      const addressesRes = await db.execute({
        sql: `SELECT * FROM addresses WHERE customer_id = ? ORDER BY is_default DESC, created_at DESC`,
        args: [customerId],
      });

      return NextResponse.json({
        customer: customerRes.rows[0],
        addresses: addressesRes.rows,
      });
    }

    // Lấy toàn bộ danh sách khách hàng kèm số lượng đơn hàng / địa chỉ mặc định
    const result = await db.execute(`
      SELECT 
        c.id,
        c.name,
        c.email,
        c.phone,
        c.created_at,
        c.updated_at,
        a.address_line,
        a.city,
        a.phone AS address_phone
      FROM customers c
      LEFT JOIN addresses a ON c.id = a.customer_id AND a.is_default = 1
      ORDER BY c.created_at DESC
    `);

    return NextResponse.json({ customers: result.rows });
  } catch (error: any) {
    console.error('Lỗi API Get Customers:', error);
    return NextResponse.json({ error: error.message || 'Lỗi server' }, { status: 500 });
  }
}

// 2. PUT: Cập nhật thông tin khách hàng
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, name, email, phone } = body;

    if (!id) {
      return NextResponse.json({ error: 'Thiếu ID khách hàng' }, { status: 400 });
    }

    await db.execute({
      sql: `UPDATE customers SET name = ?, email = ?, phone = ? WHERE id = ?`,
      args: [name, email, phone, id],
    });

    return NextResponse.json({ success: true, message: 'Cập nhật thành công' });
  } catch (error: any) {
    console.error('Lỗi API Update Customer:', error);
    return NextResponse.json({ error: error.message || 'Lỗi server' }, { status: 500 });
  }
}

// 3. DELETE: Xóa khách hàng
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Thiếu ID khách hàng' }, { status: 400 });
    }

    await db.execute({
      sql: `DELETE FROM customers WHERE id = ?`,
      args: [id],
    });

    return NextResponse.json({ success: true, message: 'Đã xóa khách hàng' });
  } catch (error: any) {
    console.error('Lỗi API Delete Customer:', error);
    return NextResponse.json({ error: error.message || 'Lỗi server' }, { status: 500 });
  }
}