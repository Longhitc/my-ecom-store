import { db } from 'lib/turso';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { endpoint, keys, user_id } = await request.json();

    if (!endpoint || !keys) {
      return NextResponse.json({ success: false, message: 'Thiếu thông tin subscription' }, { status: 400 });
    }

    const subId = 'sub_' + Date.now() + Math.random().toString(36).substring(2, 7);
    const p256dh = keys.p256dh;
    const auth = keys.auth;

    // Lưu vào bảng push_subscriptions đã có sẵn trên Turso
    await db.execute({
      sql: `INSERT OR REPLACE INTO push_subscriptions (id, user_id, endpoint, p256dh, auth) VALUES (?, ?, ?, ?, ?)`,
      args: [subId, user_id || 'admin', endpoint, p256dh, auth],
    });

    return NextResponse.json({ success: true, message: 'Đăng ký nhận thông báo đẩy thành công' });
  } catch (error) {
    console.error('Lỗi lưu push subscription:', error);
    return NextResponse.json({ success: false, message: 'Lỗi server' }, { status: 500 });
  }
}