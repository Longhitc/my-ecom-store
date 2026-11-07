import { db } from '@/lib/turso';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { clientUuid, customerId } = body;

    if (!clientUuid) {
      return NextResponse.json({ success: false, error: 'Missing clientUuid' }, { status: 400 });
    }

    // Lấy chuỗi User-Agent từ headers
    const headersList = await headers();
    const userAgent = headersList.get('user-agent') || '';

    // Nhận diện nhanh OS
    let os = 'Unknown OS';
    if (userAgent.includes('Windows')) os = 'Windows';
    else if (userAgent.includes('Android')) os = 'Android';
    else if (userAgent.includes('iPhone') || userAgent.includes('iPad')) os = 'iOS';
    else if (userAgent.includes('Macintosh')) os = 'macOS';
    else if (userAgent.includes('Linux')) os = 'Linux';

    // Nhận diện nhanh Browser
    let browser = 'Unknown Browser';
    if (userAgent.includes('Edg/')) browser = 'Edge';
    else if (userAgent.includes('SamsungBrowser/')) browser = 'Samsung Internet';
    else if (userAgent.includes('Chrome/')) browser = 'Chrome';
    else if (userAgent.includes('Safari/')) browser = 'Safari';
    else if (userAgent.includes('Firefox/')) browser = 'Firefox';

    // Lấy ngày giờ theo múi giờ Việt Nam (GMT+7)
    const nowVn = new Date();
    const dateStr = nowVn.toLocaleDateString("sv-SE", { timeZone: "Asia/Ho_Chi_Minh" });
    const timeStr = nowVn.toLocaleString("sv-SE", { timeZone: "Asia/Ho_Chi_Minh" }).replace("T", " ");

    const visitId = `visit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    // Lưu vào cơ sở dữ liệu chỉ với 2 cột os và browser
    await db.execute({
      sql: `
        INSERT INTO customer_visit_logs (id, client_uuid, customer_id, visit_date, visit_time, os, browser) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      args: [visitId, clientUuid, customerId || null, dateStr, timeStr, os, browser],
    });

    // Tự động dọn dẹp log cũ hơn 7 ngày
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