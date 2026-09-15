import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';
import { db } from '../../../../lib/turso';

export async function POST(request: Request) {
  try {
    const { name, phone, email, password } = await request.json();

    if (!name || !phone || !email || !password) {
      return NextResponse.json(
        { message: 'Vui lòng nhập đầy đủ tất cả thông tin!' },
        { status: 400 }
      );
    }

    // 1. Kiểm tra email đã tồn tại trong bảng customers chưa
    const existingCustomer = await db.execute({
      sql: 'SELECT id FROM customers WHERE email = ?',
      args: [email],
    });

    if (existingCustomer.rows.length > 0) {
      return NextResponse.json(
        { message: 'Email này đã được đăng ký tài khoản!' },
        { status: 400 }
      );
    }

    // 2. Băm mật khẩu bằng bcryptjs
    const hashedPassword = await bcrypt.hash(password, 10);
    const customerId = crypto.randomUUID();

    // 3. Thêm khách hàng mới vào bảng customers
    await db.execute({
      sql: 'INSERT INTO customers (id, name, phone, email, password) VALUES (?, ?, ?, ?, ?)',
      args: [customerId, name, phone, email, hashedPassword],
    });

    return NextResponse.json(
      { message: 'Đăng ký tài khoản thành công!' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Lỗi đăng ký:', error);
    return NextResponse.json(
      { message: 'Lỗi hệ thống, vui lòng thử lại sau!' },
      { status: 500 }
    );
  }
}