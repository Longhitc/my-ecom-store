import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('customer_session');

    if (!sessionCookie || !sessionCookie.value) {
      return NextResponse.json({ customer: null }, { status: 200 });
    }

    // Đọc thông tin khách hàng từ Cookie
    const customer = JSON.parse(sessionCookie.value);
    return NextResponse.json({ customer }, { status: 200 });
  } catch (error) {
    console.error('Lỗi lấy thông tin session:', error);
    return NextResponse.json({ customer: null }, { status: 200 });
  }
}