import { db } from 'lib/turso';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const id = formData.get('id') as string;
    const album_id = formData.get('album_id') as string;
    const title = formData.get('title') as string;
    const artist = (formData.get('artist') as string) || '';
    const track_order = parseInt((formData.get('track_order') as string) || '1', 10);

    if (!file || !id || !album_id || !title) {
      return NextResponse.json({ success: false, error: 'Thiếu thông tin bắt buộc hoặc file MP3!' }, { status: 400 });
    }

    // Gửi trực tiếp lên Cloudinary dùng Unsigned Preset 'my_music_preset' (cloud name: r9iziwqa)
    const cloudinaryFormData = new FormData();
    cloudinaryFormData.append('file', file);
    cloudinaryFormData.append('upload_preset', 'my_music_preset');

    const cloudinaryRes = await fetch(`https://api.cloudinary.com/v1_1/r9iziwqa/video/upload`, {
      method: 'POST',
      body: cloudinaryFormData,
    });

    const cloudinaryData = await cloudinaryRes.json();

    if (!cloudinaryRes.ok) {
      throw new Error(cloudinaryData.error?.message || 'Upload Cloudinary thất bại');
    }

    const audio_url = cloudinaryData.secure_url;
    
    // Thời gian chuẩn GMT+7 dạng số timestamp (numeric)
    const nowGMT7 = Date.now() + 7 * 60 * 60 * 1000;
    const currentUser = 'admin';

    // Insert khớp chuẩn 10 cột trong cơ sở dữ liệu Turso
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
        artist,
        audio_url,
        track_order,
        currentUser,
        currentUser,
        nowGMT7,
        nowGMT7,
      ],
    });

    return NextResponse.json({
      success: true,
      message: 'Upload và lưu Turso thành công!',
      audio_url,
    });
  } catch (error: any) {
    console.error('Lỗi API upload music:', error);
    return NextResponse.json({ success: false, error: error.message || 'Lỗi server nội bộ' }, { status: 500 });
  }
}