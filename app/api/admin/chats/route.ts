import { db } from 'lib/turso';
import { NextResponse } from 'next/server';

// GET: Lấy danh sách tất cả các cuộc hội thoại hoặc chi tiết tin nhắn
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

// DELETE: Xóa cuộc hội thoại và toàn bộ tin nhắn liên quan
export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { conversation_id } = body;

    if (!conversation_id) {
      return NextResponse.json({ success: false, message: 'Thiếu conversation_id' }, { status: 400 });
    }

    // Xóa tin nhắn thuộc hội thoại trước để tránh ràng buộc khóa ngoại
    await db.execute({
      sql: `DELETE FROM chat_messages WHERE conversation_id = ?`,
      args: [conversation_id],
    });

    // Xóa hội thoại chính
    await db.execute({
      sql: `DELETE FROM chat_conversations WHERE id = ?`,
      args: [conversation_id],
    });

    return NextResponse.json({ success: true, message: 'Đã xóa hội thoại thành công' });
  } catch (error) {
    console.error('Lỗi API xóa hội thoại:', error);
    return NextResponse.json({ success: false, message: 'Lỗi server khi xóa' }, { status: 500 });
  }
}