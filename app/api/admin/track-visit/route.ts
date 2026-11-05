import { db } from '@/lib/turso';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { clientUuid, customerId } = body;

    if (!clientUuid) {
      return NextResponse.json({ success: false, error: 'Missing clientUuid' }, { status: 400 });
    }

    // Lấy ngày giờ hiện tại theo múi giờ Việt Nam (GMT+7)
    const nowVn = new Date();
    const dateStr = nowVn.toLocaleDateString("sv-SE", { timeZone: "Asia/Ho_Chi_Minh" });
    const timeStr = nowVn.toLocaleString("sv-SE", { timeZone: "Asia/Ho_Chi_Minh" }).replace("T", " ");

    const visitId = `visit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    // Luôn luôn INSERT một dòng log mới cho mỗi lần truy cập
    await db.execute({
      sql: `
        INSERT INTO customer_visit_logs (id, client_uuid, customer_id, visit_date, visit_time) 
        VALUES (?, ?, ?, ?, ?)
      `,
      args: [visitId, clientUuid, customerId || null, dateStr, timeStr],
    });

    // Tự động dọn dẹp các log cũ hơn 7 ngày trước
    const d7DaysAgo = new Date();
    d7DaysAgo.setDate(d7DaysAgo.getDate() - 7);
    const cutoffDateStr = d7DaysAgo.toLocaleDateString("sv-SE", { timeZone: "Asia/Ho_Chi_Minh" });

    await db.execute({
      sql: `DELETE FROM customer_visit_logs WHERE visit_date < ?`,
      args: [cutoffDateStr]
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error('Lỗi track visit:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}