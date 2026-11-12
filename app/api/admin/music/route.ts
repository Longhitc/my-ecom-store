import { db } from 'lib/turso';
import { NextResponse } from 'next/server';

// 1. GET: Lấy danh sách albums và tracks
export async function GET() {
  try {
    const albumsResult = await db.execute(`
      SELECT id, album_title, cover_image 
      FROM albums 
      ORDER BY created_at DESC
    `);

    const tracksResult = await db.execute(`
      SELECT t.id, t.title, t.artist, t.album_id, t.audio_url, t.track_order,
             a.album_title, a.cover_image
      FROM tracks t
      LEFT JOIN albums a ON t.album_id = a.id
      ORDER BY t.created_at DESC
    `);

    return NextResponse.json({
      success: true,
      albums: albumsResult.rows,
      tracks: tracksResult.rows,
    });
  } catch (error: any) {
    console.error('Lỗi API lấy dữ liệu nhạc:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// 2. POST: Thêm bài hát mới vào cơ sở dữ liệu
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, album_id, title, artist, audio_url, track_order } = body;

    if (!id || !title || !audio_url) {
      return NextResponse.json({ success: false, error: 'Thiếu thông tin bắt buộc!' }, { status: 400 });
    }

    const nowGMT7 = Date.now() + 7 * 60 * 60 * 1000;
    const currentUser = 'admin';

    await db.execute({
      sql: `
        INSERT INTO tracks (
          id, album_id, title, artist, audio_url, track_order, 
          created_by, updated_by, created_at, updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      args: [
        id,
        album_id || null,
        title,
        artist || '',
        audio_url,
        track_order || 1,
        currentUser,
        currentUser,
        nowGMT7,
        nowGMT7,
      ],
    });

    return NextResponse.json({ success: true, message: 'Thêm bài hát thành công!' });
  } catch (error: any) {
    console.error('Lỗi API thêm bài hát:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// 3. PUT: Cập nhật thông tin bài hát (Tên, Nghệ sĩ, Album, Thứ tự)
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, album_id, title, artist, track_order } = body;

    if (!id || !title?.trim()) {
      return NextResponse.json({ success: false, error: 'Thiếu ID hoặc Tên bài hát!' }, { status: 400 });
    }

    const nowGMT7 = Date.now() + 7 * 60 * 60 * 1000;
    const currentUser = 'admin';

    await db.execute({
      sql: `
        UPDATE tracks 
        SET album_id = ?, 
            title = ?, 
            artist = ?, 
            track_order = ?, 
            updated_by = ?, 
            updated_at = ?
        WHERE id = ?
      `,
      args: [
        album_id || null,
        title.trim(),
        (artist || '').trim(),
        Number(track_order) || 1,
        currentUser,
        nowGMT7,
        id,
      ],
    });

    return NextResponse.json({ success: true, message: 'Cập nhật bài hát thành công!' });
  } catch (error: any) {
    console.error('Lỗi API cập nhật bài hát:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}