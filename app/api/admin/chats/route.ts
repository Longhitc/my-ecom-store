import { db } from 'lib/turso';
import { NextResponse } from 'next/server';

// GET: Lấy danh sách tất cả các cuộc hội thoại (sắp xếp theo tin nhắn mới nhất)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('conversation_id');

    // Nếu có truyền conversation_id thì trả về chi tiết tin nhắn của hội thoại đó
    if (conversationId) {
      const messagesResult = await db.execute({
        sql: `SELECT id, sender_type, message, created_at FROM chat_messages WHERE conversation_id = ? ORDER BY created_at ASC`,
        args: [conversationId],
      });
      return NextResponse.json({ success: true, messages: messagesResult.rows });
    }

    // Ngược lại, trả về danh sách tất cả các hội thoại với các trường thông tin chuẩn xác
    const convsResult = await db.execute(
      `SELECT id, guest_session_id, customer_name, status, updated_at FROM chat_conversations ORDER BY updated_at DESC`
    );

    return NextResponse.json({
      success: true,
      conversations: convsResult.rows,
    });
  } catch (error) {
    console.error('Lỗi API admin get chats:', error);
    return NextResponse.json({ success: false, message: 'Lỗi server' }, { status: 500 });
  }
}