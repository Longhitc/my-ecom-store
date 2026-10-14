import { db } from 'lib/turso';
import { NextResponse } from 'next/server';
import webpush from 'web-push';

// Chỉ cấu hình vapid details nếu có đủ key hợp lệ trong môi trường
if (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  try {
    webpush.setVapidDetails(
      'mailto:support@depvaxinhshop.com',
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      process.env.VAPID_PRIVATE_KEY
    );
  } catch (e) {
    console.error('Vapid setup error:', e);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { guest_session_id, customer_name, message, sender_type } = body;

    if (!guest_session_id || !message) {
      return NextResponse.json({ success: false, message: 'Thiếu dữ liệu' }, { status: 400 });
    }

    const now = new Date();
    const vnTime = new Date(now.getTime() + 7 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' ');

    const convResult = await db.execute({
      sql: `SELECT id FROM chat_conversations WHERE guest_session_id = ?`,
      args: [guest_session_id],
    });

    let conversationId = '';

    if (convResult.rows.length === 0) {
      conversationId = 'conv_' + Date.now() + Math.random().toString(36).substring(2, 7);
      await db.execute({
        sql: `INSERT INTO chat_conversations (id, guest_session_id, customer_name, status, updated_at) VALUES (?, ?, ?, 'open', ?)`,
        args: [conversationId, guest_session_id, customer_name || 'Khách vãng lai', vnTime],
      });
    } else {
      const firstRow = convResult.rows[0];
      conversationId = String(firstRow?.id || '');
      await db.execute({
        sql: `UPDATE chat_conversations SET updated_at = ? WHERE id = ?`,
        args: [vnTime, conversationId],
      });
    }

    const messageId = 'msg_' + Date.now() + Math.random().toString(36).substring(2, 7);
    await db.execute({
      sql: `INSERT INTO chat_messages (id, conversation_id, sender_type, message, is_read, created_at) VALUES (?, ?, ?, ?, 0, ?)`,
      args: [messageId, conversationId, sender_type, message, vnTime],
    });

    // Kích hoạt bắn thông báo đẩy nếu là tin nhắn từ khách (để báo cho Admin)
    // Hoặc bạn có thể bỏ điều kiện `sender_type === 'customer'` nếu muốn test mọi tin nhắn đều bắn push
    if (sender_type === 'customer') {
      try {
        const subs = await db.execute(`SELECT * FROM push_subscriptions`);
        console.log(`Tìm thấy ${subs.rows.length} thiết bị đăng ký nhận push trong Turso.`);

        const payload = JSON.stringify({
          title: `💬 Tin nhắn mới từ ${customer_name || 'Khách hàng'}`,
          body: message,
          url: '/admin/chats',
        });

        await Promise.all(
          subs.rows.map(async (sub: any) => {
            try {
              await webpush.sendNotification(
                {
                  endpoint: sub.endpoint,
                  keys: { p256dh: sub.p256dh, auth: sub.auth },
                },
                payload
              );
              console.log('Đã bắn push thành công đến endpoint:', sub.endpoint.slice(0, 30) + '...');
            } catch (err: any) {
              console.error('Lỗi gửi push cho thiết bị:', err?.body || err);
              // Nếu thiết bị hủy đăng ký (lỗi 410 hoặc 404), có thể chủ động xóa khỏi Turso ở đây nếu muốn
            }
          })
        );
      } catch (pushErr) {
        console.error('Push notification background error:', pushErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: {
        id: messageId,
        sender_type,
        message,
        created_at: vnTime,
      },
    });
  } catch (error: any) {
    console.error('Lỗi API send message:', error);
    return NextResponse.json({ success: false, message: error?.message || 'Lỗi server' }, { status: 500 });
  }
}