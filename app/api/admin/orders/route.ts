import { db } from 'lib/turso';
import { NextResponse } from 'next/server';

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { orderId, status } = body;

    // 1. Kiểm tra đầu vào
    if (!orderId || !status) {
      return NextResponse.json(
        { error: 'Thiếu thông tin orderId hoặc status' },
        { status: 400 }
      );
    }

    // 2. Cập nhật trạng thái và updated_at trong database Turso
    const result = await db.execute({
      sql: `UPDATE orders 
            SET status = ?, updated_at = CURRENT_TIMESTAMP 
            WHERE id = ?`,
      args: [status, orderId],
    });

    if (result.rowsAffected === 0) {
      return NextResponse.json(
        { error: 'Không tìm thấy đơn hàng để cập nhật' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Cập nhật trạng thái đơn hàng thành công',
    });
  } catch (error) {
    console.error('Lỗi khi cập nhật trạng thái đơn hàng:', error);
    return NextResponse.json(
      { error: 'Lỗi server khi cập nhật trạng thái' },
      { status: 500 }
    );
  }
}