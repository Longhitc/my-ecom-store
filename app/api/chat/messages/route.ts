import { db } from 'lib/turso';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const guestId = searchParams.get('guest_id');

    if (!guestId) {
      return NextResponse.json({ success: false, message: 'Thiếu guest_id' }, { status: 400 });
    }

    // 1. Tìm conversation của khách này
    const convResult = await db.execute({
      sql: `SELECT id FROM chat_conversations WHERE guest_session_id = ?`,
      args: [guestId],
    });

    let conversationId = '';

    if (convResult.rows.length === 0) {
      // Nếu chưa có hội thoại, tự động tạo mới
      conversationId = 'conv_' + Date.now() + Math.random().toString(36).substring(2, 7);
      
      const now = new Date();
      const vnTime = new Date(now.getTime() + 7 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' ');

      await db.execute({
        sql: `INSERT INTO chat_conversations (id, guest_session_id, customer_name, status, updated_at) VALUES (?, ?, ?, 'open', ?)`,
        args: [conversationId, guestId, `Khách (${guestId.slice(-4)})`, vnTime],
      });
    } else {
      // Dùng optional chaining và ép kiểu an toàn để trị dứt điểm lỗi undefined
      const firstRow = convResult.rows[0];
      conversationId = String(firstRow?.id || '');
    }

    // 2. Lấy danh sách tin nhắn của hội thoại này
    const messagesResult = await db.execute({
      sql: `SELECT id, sender_type, message, created_at FROM chat_messages WHERE conversation_id = ? ORDER BY created_at ASC`,
      args: [conversationId],
    });

    return NextResponse.json({
      success: true,
      messages: messagesResult.rows,
    });
  } catch (error) {
    console.error('Lỗi API get messages:', error);
    return NextResponse.json({ success: false, message: 'Lỗi server' }, { status: 500 });
  }
}