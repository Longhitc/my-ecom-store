import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
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
      sql: 'SELECT id, name, phone, email, password FROM customers WHERE email = ?',
      args: [email],
    });

    if (!result.rows.length || !result.rows[0]) {
      return NextResponse.json(
        { message: 'Email hoặc mật khẩu không chính xác!' },
        { status: 400 }
      );
    }

    const customer = result.rows[0];

    // 2. So sánh mật khẩu (Sửa customer?.password để tránh lỗi TypeScript)
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

    // 3. Chuẩn bị dữ liệu trả về
    const customerData = {
      id: customer.id as string,
      name: customer.name as string,
      email: customer.email as string,
      phone: (customer.phone as string) || '',
    };

    // 4. Set Cookie session
    const cookieStore = await cookies();
    cookieStore.set('customer_session', JSON.stringify(customerData), {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
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