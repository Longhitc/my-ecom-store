import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { db } from '../../../../lib/turso'; // Điều chỉnh đường dẫn dẫn đến file turso.ts của bạn nếu khác

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('customer_session');

    if (!sessionCookie || !sessionCookie.value) {
      return NextResponse.json({ customer: null }, { status: 200 });
    }

    // Đọc thông tin khách hàng từ Cookie
    const basicCustomer = JSON.parse(sessionCookie.value);

    // Truy vấn dữ liệu Admin & Quyền (Menu) từ Database Turso
    const adminResult = await db.execute({
      sql: `
        SELECT 
          au.role_id,
          r.name as role_name,
          rp.menu_code
        FROM admin_users au
        JOIN roles r ON au.role_id = r.id
        LEFT JOIN role_permissions rp ON r.id = rp.role_id
        WHERE au.customer_id = ? AND au.status = 'active'
      `,
      args: [basicCustomer.id]
    });

    let adminData = null;

    if (adminResult.rows.length > 0) {
      if (adminResult.rows.length > 0) {
      // Ép kiểu cho dòng đầu tiên
      const firstRow = adminResult.rows[0] as Record<string, any>;

      // Tách lấy danh sách các menu_code được cấp quyền
      const allowed_menus = adminResult.rows
        .map((row) => (row as Record<string, any>).menu_code as string)
        .filter(Boolean);

      adminData = {
        role_id: firstRow.role_id as string,
        role_name: firstRow.role_name as string,
        allowed_menus: allowed_menus
      };
    }
    }

    // Ghép object admin vào dữ liệu customer
    const customer = {
      ...basicCustomer,
      admin: adminData
    };

    return NextResponse.json({ customer }, { status: 200 });
  } catch (error) {
    console.error('Lỗi lấy thông tin session:', error);
    return NextResponse.json({ customer: null }, { status: 200 });
  }
}