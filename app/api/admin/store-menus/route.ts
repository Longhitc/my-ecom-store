import { db } from 'lib/turso';
import { NextResponse } from 'next/server';

// 1. Lấy toàn bộ danh sách menu cho trang quản trị (kể cả menu đang ẩn)
export async function GET() {
  try {
    const result = await db.execute(`
      SELECT * FROM navigation_menus 
      ORDER BY parent_id IS NOT NULL, parent_id ASC, sort_order ASC
    `);
    return NextResponse.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Failed to fetch menus:', error);
    return NextResponse.json({ success: false, error: 'Lỗi tải danh sách menu' }, { status: 500 });
  }
}

// 2. Thêm mới menu hoặc sub-menu
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, path, parent_id, sort_order, is_active } = body;

    if (!title || !path) {
      return NextResponse.json({ success: false, error: 'Thiếu tên tiêu đề hoặc đường dẫn' }, { status: 400 });
    }

    const result = await db.execute({
      sql: `INSERT INTO navigation_menus (title, path, parent_id, sort_order, is_active, modified_at) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      args: [
        title, 
        path, 
        parent_id === '' || parent_id === null || parent_id === 0 ? null : Number(parent_id), 
        sort_order ? Number(sort_order) : 0, 
        is_active !== undefined ? Number(is_active) : 1
      ]
    });

    return NextResponse.json({ success: true, message: 'Thêm menu thành công', id: result.lastInsertRowid });
  } catch (error) {
    console.error('Failed to create menu:', error);
    return NextResponse.json({ success: false, error: 'Lỗi khi thêm menu' }, { status: 500 });
  }
}

// 3. Cập nhật menu
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, title, path, parent_id, sort_order, is_active } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Thiếu ID menu' }, { status: 400 });
    }

    await db.execute({
      sql: `
        UPDATE navigation_menus 
        SET title = ?, path = ?, parent_id = ?, sort_order = ?, is_active = ?, modified_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `,
      args: [
        title, 
        path, 
        parent_id === '' || parent_id === null || parent_id === 0 ? null : Number(parent_id), 
        sort_order ? Number(sort_order) : 0, 
        is_active !== undefined ? Number(is_active) : 1, 
        Number(id)
      ]
    });

    return NextResponse.json({ success: true, message: 'Cập nhật menu thành công' });
  } catch (error) {
    console.error('Failed to update menu:', error);
    return NextResponse.json({ success: false, error: 'Lỗi khi cập nhật menu' }, { status: 500 });
  }
}

// 4. Xóa menu
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Thiếu ID menu cần xóa' }, { status: 400 });
    }

    // Do đã có ON DELETE CASCADE, xóa menu cha sẽ tự động xóa các sub-menu con bên trong
    await db.execute({
      sql: `DELETE FROM navigation_menus WHERE id = ?`,
      args: [Number(id)]
    });

    return NextResponse.json({ success: true, message: 'Đã xóa menu thành công' });
  } catch (error) {
    console.error('Failed to delete menu:', error);
    return NextResponse.json({ success: false, error: 'Lỗi khi xóa menu' }, { status: 500 });
  }
}