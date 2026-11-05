import { createClient } from '@libsql/client'; // Hoặc thư viện client Turso anh đang dùng trong dự án
import { NextResponse } from 'next/server';

// Khởi tạo kết nối Turso (đảm bảo biến môi trường Turso URL và Auth Token đã có trong .env.local)
const db = createClient({
  url: process.env.TURSO_DATABASE_URL || '',
  authToken: process.env.TURSO_AUTH_TOKEN || '',
});

export async function GET() {
  try {
    const result = await db.execute(`
      SELECT 
        t.id,
        t.title,
        t.artist,
        t.audio_url,
        t.track_order,
        a.album_title,
        a.cover_image
      FROM tracks t
      JOIN albums a ON t.album_id = a.id
      ORDER BY t.track_order ASC
    `);

    return NextResponse.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Lỗi lấy danh sách nhạc:', error);
    return NextResponse.json({ success: false, message: 'Lỗi server khi lấy dữ liệu nhạc' }, { status: 500 });
  }
}