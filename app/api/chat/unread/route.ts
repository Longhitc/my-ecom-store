import { db } from 'lib/turso';
import { NextResponse } from 'next/server';

// GET: Đếm số tin nhắn chưa đọc từ admin cho khách
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const guest_id = searchParams.get('guest_id');

    if (!guest_id) {
      return NextResponse.json({ success: true, unread_count: 0 });
    }

    const convResult = await db.execute({
      sql: `SELECT id FROM chat_conversations WHERE guest_session_id = ?`,
      args: [guest_id],
    });

    if (!convResult.rows || convResult.rows.length === 0) {
      return NextResponse.json({ success: true, unread_count: 0 });
    }

    const firstRow = convResult.rows[0];
    const convId = String(firstRow?.id || '');

    if (!convId) {
      return NextResponse.json({ success: true, unread_count: 0 });
    }

    // Đếm số tin nhắn từ admin mà khách chưa đọc (is_read = 0)
    const countResult = await db.execute({
      sql: `SELECT COUNT(*) as count FROM chat_messages WHERE conversation_id = ? AND sender_type = 'admin' AND is_read = 0`,
      args: [convId],
    });

    const countRow = countResult.rows?.[0];
    const unreadCount = Number(countRow?.count || 0);

    return NextResponse.json({ success: true, unread_count: unreadCount });
  } catch (error) {
    console.error('Lỗi đếm tin nhắn chưa đọc:', error);
    return NextResponse.json({ success: false, unread_count: 0 }, { status: 500 });
  }
}

// POST: Đánh dấu tất cả tin nhắn của admin thành đã đọc khi khách mở chat
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { guest_id } = body;

    if (!guest_id) {
      return NextResponse.json({ success: false });
    }

    const convResult = await db.execute({
      sql: `SELECT id FROM chat_conversations WHERE guest_session_id = ?`,
      args: [guest_id],
    });

    if (convResult.rows && convResult.rows.length > 0) {
      const firstRow = convResult.rows[0];
      const convId = String(firstRow?.id || '');
      
      if (convId) {
        await db.execute({
          sql: `UPDATE chat_messages SET is_read = 1 WHERE conversation_id = ? AND sender_type = 'admin'`,
          args: [convId],
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Lỗi đánh dấu đã đọc:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}