import { db } from '@/lib/turso';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Tạo danh sách 7 ngày gần nhất theo chuẩn giờ GMT+7 (Asia/Ho_Chi_Minh)
    const daysList: string[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString("sv-SE", { timeZone: "Asia/Ho_Chi_Minh" });
      daysList.push(dateStr);
    }

    const startDate = daysList[0] as string;
    const endDate = daysList[daysList.length - 1] as string;

    // Truy vấn dữ liệu từ bảng customer_visit_logs
    const result = await db.execute({
      sql: `
        SELECT 
          visit_date, 
          COUNT(id) as total_visits,
          COUNT(DISTINCT customer_id) as unique_customers
        FROM customer_visit_logs
        WHERE visit_date >= ? AND visit_date <= ?
        GROUP BY visit_date
      `,
      args: [startDate, endDate],
    });

    // Map dữ liệu khớp đủ 7 ngày (ngày nào không có khách truy cập thì gán bằng 0)
    const statsMap = new Map();
    result.rows.forEach((row: any) => {
      statsMap.set(row.visit_date, {
        totalVisits: Number(row.total_visits || 0),
        uniqueCustomers: Number(row.unique_customers || 0),
      });
    });

    const chartData = daysList.map((date) => {
      const data = statsMap.get(date) || { totalVisits: 0, uniqueCustomers: 0 };
      return {
        date: date.split('-').reverse().join('/'),
        ...data,
      };
    });

    return NextResponse.json({ success: true, data: chartData }, { status: 200 });
  } catch (error: any) {
    console.error('Lỗi API thống kê visits:', error);
    return NextResponse.json({ error: error.message || 'Lỗi server' }, { status: 500 });
  }
}