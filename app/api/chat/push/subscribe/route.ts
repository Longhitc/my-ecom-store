import { db } from 'lib/turso';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { endpoint, keys, user_id } = await request.json();

    if (!endpoint || !keys) {
      return NextResponse.json({ success: false, message: 'Thiếu thông tin subscription' }, { status: 400 });
    }

    const p256dh = keys.p256dh;
    const auth = keys.auth;
    const assignedUserId = user_id || 'admin';

    // Tạo chuỗi thời gian chuẩn GMT+7
    const now = new Date();
    const vnTime = new Date(now.getTime() + 7 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' ');

    // Kiểm tra xem endpoint này đã tồn tại trong database chưa
    const existing = await db.execute({
      sql: `SELECT id FROM push_subscriptions WHERE endpoint = ?`,
      args: [endpoint],
    });

    if (existing.rows.length > 0) {
      // Nếu đã có rồi thì cập nhật lại keys và thời gian
      await db.execute({
        sql: `UPDATE push_subscriptions SET p256dh = ?, auth = ?, created_at = ? WHERE endpoint = ?`,
        args: [p256dh, auth, vnTime, endpoint],
      });
    } else {
      // Nếu chưa có thì thêm mới hoàn toàn kèm thời gian created_at
      const subId = 'sub_' + Date.now() + Math.random().toString(36).substring(2, 7);
      await db.execute({
        sql: `INSERT INTO push_subscriptions (id, user_id, endpoint, p256dh, auth, created_at) VALUES (?, ?, ?, ?, ?, ?)`,
        args: [subId, assignedUserId, endpoint, p256dh, auth, vnTime],
      });
    }

    return NextResponse.json({ success: true, message: 'Đăng ký nhận thông báo đẩy thành công' });
  } catch (error) {
    console.error('Lỗi lưu push subscription:', error);
    return NextResponse.json({ success: false, message: 'Lỗi server' }, { status: 500 });
  }
}