import { db } from '@/lib/turso';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { clientUuid } = body;

    // Lấy ngày giờ hiện tại theo múi giờ Việt Nam (GMT+7)
    const nowVn = new Date();
    const dateStr = nowVn.toLocaleDateString("sv-SE", { timeZone: "Asia/Ho_Chi_Minh" });
    const timeStr = nowVn.toLocaleString("sv-SE", { timeZone: "Asia/Ho_Chi_Minh" }).replace("T", " ");

    const visitId = `visit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    // Lưu vào bảng customer_visit_logs kèm theo client_uuid
    await db.execute({
      sql: `
        INSERT INTO customer_visit_logs (id, client_uuid, visit_date, visit_time) 
        VALUES (?, ?, ?, ?)
      `,
      args: [visitId, clientUuid || null, dateStr, timeStr],
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error('Lỗi track visit:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}