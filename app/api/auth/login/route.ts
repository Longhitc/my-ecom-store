import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { db } from '../../../../lib/turso'; // Dùng đúng file turso bạn đã kết nối

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: 'Vui lòng nhập đầy đủ email và mật khẩu!' },
        { status: 400 }
      );
    }

    // 1. Tìm khách hàng trong bảng `customers` theo email
    const result = await db.execute({
      sql: 'SELECT id, name, phone, email, password FROM customers WHERE email = ?',
      args: [email],
    });

    if (result.rows.length === 0) {
      return NextResponse.json(
        { message: 'Email hoặc mật khẩu không chính xác!' },
        { status: 400 }
      );
    }

    const customer = result.rows[0];

    // 2. So sánh mật khẩu bằng bcryptjs
    const isPasswordMatch = await bcrypt.compare(
      password,
      customer.password as string
    );

    if (!isPasswordMatch) {
      return NextResponse.json(
        { message: 'Email hoặc mật khẩu không chính xác!' },
        { status: 400 }
      );
    }

    // 3. Lấy đúng cột `name` từ bảng `customers` trong Turso
    const customerData = {
      id: customer.id as string,
      name: customer.name as string, // Lấy đúng tên đăng ký
      email: customer.email as string,
      phone: (customer.phone as string) || '',
    };

    // 4. Set Cookie chứa thông tin vừa query từ Turso
    const cookieStore = await cookies();
    cookieStore.set('customer_session', JSON.stringify(customerData), {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // Lưu session 7 ngày
      path: '/',
    });

    return NextResponse.json(
      { message: 'Đăng nhập thành công!', customer: customerData },
      { status: 200 }
    );
  } catch (error) {
    console.error('Lỗi đăng nhập:', error);
    return NextResponse.json(
      { message: 'Lỗi hệ thống, vui lòng thử lại sau!' },
      { status: 500 }
    );
  }
}