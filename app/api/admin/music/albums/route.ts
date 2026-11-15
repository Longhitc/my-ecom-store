import { db } from 'lib/turso';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, album_title, cover_image } = body;

    if (!id || !album_title) {
      return NextResponse.json({ success: false, error: 'Thiếu tên album!' }, { status: 400 });
    }

    const nowGMT7 = Date.now() + 7 * 60 * 60 * 1000;
    const currentUser = 'admin';

    await db.execute({
      sql: `
        INSERT INTO albums (
          id, album_title, cover_image, 
          created_by, updated_by, created_at, updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      args: [
        id,
        album_title.trim(),
        cover_image ? cover_image.trim() : '',
        currentUser,
        currentUser,
        nowGMT7,
        nowGMT7,
      ],
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Tạo album thành công!',
      album: {
        id,
        album_title: album_title.trim(),
        cover_image: cover_image ? cover_image.trim() : '',
        created_at: nowGMT7,
        updated_at: nowGMT7,
      }
    });
  } catch (error: any) {
    console.error('Lỗi API tạo album:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}