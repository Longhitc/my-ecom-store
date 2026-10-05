import { db } from 'lib/turso';
import { NextResponse } from 'next/server';

const AVAILABLE_MENUS = [
  { code: 'dashboard', name: 'Trang tổng quan' },
  { code: 'products', name: 'Sản phẩm' },
  { code: 'orders', name: 'Đơn hàng' },
  { code: 'customers', name: 'Khách hàng' },
  { code: 'roles', name: 'Phân quyền' },
  { code: 'settings', name: 'Cấu hình hệ thống' },
];

// 1. GET: Chỉ lấy danh sách ADMIN hiện tại + Roles + Permissions
export async function GET() {
  try {
    const results = await db.batch([
      { sql: 'SELECT * FROM roles', args: [] },
      { sql: 'SELECT * FROM role_permissions', args: [] },
      {
        sql: `
          SELECT 
            au.id as admin_id,
            au.role_id,
            au.status,
            au.created_at as assigned_at,
            c.id as customer_id,
            c.name,
            c.email,
            c.phone,
            r.name as role_name
          FROM admin_users au
          JOIN customers c ON au.customer_id = c.id
          LEFT JOIN roles r ON au.role_id = r.id
          ORDER BY au.created_at DESC
        `,
        args: [],
      },
    ]);

    const rolesRes = results[0];
    const permissionsRes = results[1];
    const adminsRes = results[2];

    return NextResponse.json({
      availableMenus: AVAILABLE_MENUS,
      roles: rolesRes?.rows || [],
      permissions: permissionsRes?.rows || [],
      adminUsers: adminsRes?.rows || [],
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Lỗi server' }, { status: 500 });
  }
}

// 2. POST: Dò tìm Customer theo SĐT/Email và Cấp quyền Admin
export async function POST(request: Request) {
  try {
    const { keyword, role_id } = await request.json();

    if (!keyword || !role_id) {
      return NextResponse.json({ error: 'Vui lòng nhập Email/SĐT và chọn Vai trò!' }, { status: 400 });
    }

    const cleanKeyword = String(keyword).trim();

    // Dò tìm tài khoản trong bảng customers
    const searchRes = await db.execute({
      sql: `SELECT id, name, email, phone, is_admin FROM customers WHERE phone = ? OR email = ? LIMIT 1`,
      args: [cleanKeyword, cleanKeyword],
    });

    if (searchRes.rows.length === 0) {
      return NextResponse.json(
        { error: 'Tài khoản này không tồn tại trong hệ thống!' },
        { status: 404 }
      );
    }

    const customer = searchRes.rows[0] as any;

    // Kiểm tra xem người này đã là admin chưa
    if (Number(customer.is_admin) === 1 || customer.is_admin === true) {
      return NextResponse.json(
        { error: `Tài khoản "${customer.name || cleanKeyword}" đã có quyền quản trị từ trước!` },
        { status: 400 }
      );
    }

    const adminId = `admin_${Date.now()}`;

    // Cập nhật is_admin = 1 và chèn vào admin_users
    await db.batch([
      {
        sql: `UPDATE customers SET is_admin = 1 WHERE id = ?`,
        args: [customer.id],
      },
      {
        sql: `INSERT INTO admin_users (id, customer_id, role_id, status) VALUES (?, ?, ?, 'active')`,
        args: [adminId, customer.id, role_id],
      },
    ]);

    return NextResponse.json({
      success: true,
      message: `Đã cấp quyền Quản trị cho tài khoản "${customer.name || customer.phone || customer.email}" thành công!`,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Lỗi server' }, { status: 500 });
  }
}

// 3. PUT: Cập nhật danh sách Menu Permission cho Role
export async function PUT(request: Request) {
  try {
    const { role_id, menu_codes } = await request.json();

    const queries: any[] = [
      { sql: `DELETE FROM role_permissions WHERE role_id = ?`, args: [role_id] },
    ];

    if (Array.isArray(menu_codes)) {
      menu_codes.forEach((code: string) => {
        queries.push({
          sql: `INSERT INTO role_permissions (role_id, menu_code) VALUES (?, ?)`,
          args: [role_id, code],
        });
      });
    }

    await db.batch(queries);
    return NextResponse.json({ success: true, message: 'Cập nhật quyền thành công' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Lỗi server' }, { status: 500 });
  }
}

// 4. DELETE: Tước quyền Admin
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const customer_id = searchParams.get('customer_id');

    if (!customer_id) {
      return NextResponse.json({ error: 'Thiếu customer_id' }, { status: 400 });
    }

    await db.batch([
      { sql: `DELETE FROM admin_users WHERE customer_id = ?`, args: [customer_id] },
      { sql: `UPDATE customers SET is_admin = 0 WHERE id = ?`, args: [customer_id] },
    ]);

    return NextResponse.json({ success: true, message: 'Đã tước quyền Admin thành công' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Lỗi server' }, { status: 500 });
  }
}