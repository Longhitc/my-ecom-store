import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';
import { db } from '../../../../lib/turso';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: 'Vui lòng nhập đầy đủ email và mật khẩu!' },
        { status: 400 }
      );
    }

    // 1. Tìm khách hàng trong bảng customers
    const result = await db.execute({
      sql: 'SELECT id, name, phone, email, password, is_admin FROM customers WHERE email = ?',
      args: [email],
    });

    if (!result.rows.length || !result.rows[0]) {
      return NextResponse.json(
        { message: 'Email hoặc mật khẩu không chính xác!' },
        { status: 400 }
      );
    }

    const customer = result.rows[0];

    // 2. So sánh mật khẩu
    const isPasswordMatch = await bcrypt.compare(
      password,
      (customer?.password as string) || ''
    );

    if (!isPasswordMatch) {
      return NextResponse.json(
        { message: 'Email hoặc mật khẩu không chính xác!' },
        { status: 400 }
      );
    }

    // 3. Kiểm tra chính xác is_admin (Chỉ bằng 1 hoặc true)
    const isAdminUser = Number(customer.is_admin) === 1;
    let adminInfo = null;

    if (isAdminUser) {
      const adminResult = await db.execute({
        sql: `
          SELECT a.id as admin_id, a.status, r.name as role_name, rp.menu_code
          FROM admin_users a
          JOIN roles r ON a.role_id = r.id
          LEFT JOIN role_permissions rp ON r.id = rp.role_id
          WHERE a.customer_id = ? AND a.status = 'active'
        `,
        args: [String(customer.id)],
      });

      if (adminResult.rows.length > 0) {
        const firstRow = adminResult.rows[0];

        if (firstRow) {
          const allowedMenus = Array.from(
            new Set(
              adminResult.rows
                .map((row) => String(row.menu_code || ''))
                .filter(Boolean)
            )
          );

          adminInfo = {
            admin_id: String(firstRow.admin_id || ''),
            role_name: String(firstRow.role_name || ''),
            allowed_menus: allowedMenus,
          };
        }
      }
    }

    // 4. Chuẩn bị dữ liệu trả về (Bổ sung is_admin dạng boolean)
    const customerData = {
      id: String(customer.id),
      name: String(customer.name),
      email: String(customer.email),
      phone: String(customer.phone || ''),
      is_admin: isAdminUser, // true/false chuẩn xác
      admin: adminInfo,
    };

    // 5. Trả về response và ghi Cookie
    const sessionData = JSON.stringify(customerData);
    const response = NextResponse.json(
      { message: 'Đăng nhập thành công!', customer: customerData },
      { status: 200 }
    );

    response.cookies.set('customer_session', sessionData, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 ngày
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Lỗi đăng nhập:', error);
    return NextResponse.json(
      { message: 'Lỗi hệ thống, vui lòng thử lại sau!' },
      { status: 500 }
    );
  }
}