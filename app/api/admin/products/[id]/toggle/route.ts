import { db } from 'lib/turso';
import { NextResponse } from 'next/server';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. await params để lấy id chính xác (khắc phục lỗi Next.js mới)
    const { id } = await params;
    const { is_active } = await request.json();

    // 2. Chuyển boolean sang 1 hoặc 0 phù hợp với kiểu numeric trong Turso/SQLite
    const statusValue = is_active ? 1 : 0;

    // 3. Cập nhật dữ liệu vào database
    await db.execute({
      sql: 'UPDATE products SET is_active = ? WHERE id = ?',
      args: [statusValue, id],
    });

    return NextResponse.json({ success: true, is_active });
  } catch (error) {
    console.error('Lỗi toggle trạng thái:', error);
    return NextResponse.json(
      { error: 'Cập nhật thất bại' },
      { status: 500 }
    );
  }
}