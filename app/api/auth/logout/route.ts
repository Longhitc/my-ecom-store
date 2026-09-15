import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete('customer_session');
  return NextResponse.json({ message: 'Đã đăng xuất' });
}