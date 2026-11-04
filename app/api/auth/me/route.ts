import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { db } from '../../../../lib/turso';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('customer_session');
    
    // 1. Lấy client_uuid từ cookie, nếu chưa có thì tự sinh ngay lập tức ở server
    let clientUuid = cookieStore.get('shop_client_uuid')?.value;
    let newGeneratedUuid = false;
    if (!clientUuid) {
      clientUuid = 'client_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
      newGeneratedUuid = true;
    }

    if (!sessionCookie || !sessionCookie.value) {
      const res = NextResponse.json({ customer: null }, { status: 200 });
      if (newGeneratedUuid) {
        res.cookies.set('shop_client_uuid', clientUuid, { path: '/', maxAge: 31536000 });
      }
      return res;
    }

    // Đọc thông tin khách hàng từ Cookie
    const basicCustomer = JSON.parse(sessionCookie.value);

    // ==========================================
    // GHI NHẬN LOG TRUY CẬP (VISIT LOG) & DỌN DẸP 7 NGÀY
    // ==========================================
    if (basicCustomer && basicCustomer.id) {
      try {
        const now = new Date();
        const todayVn = now.toLocaleDateString("sv-SE", { timeZone: "Asia/Ho_Chi_Minh" });

        // Ghi nhận lượt visit kèm theo clientUuid chắc chắn không bị NULL
        const logId = `visit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        await db.execute({
          sql: `INSERT INTO customer_visit_logs (id, customer_id, client_uuid, visit_date, visit_time) VALUES (?, ?, ?, ?, datetime('now', '+7 hours'))`,
          args: [logId, basicCustomer.id, clientUuid, todayVn]
        });

        // Tự động xóa các log cũ hơn 7 ngày trước
        const d7DaysAgo = new Date();
        d7DaysAgo.setDate(d7DaysAgo.getDate() - 7);
        const cutoffDateStr = d7DaysAgo.toLocaleDateString("sv-SE", { timeZone: "Asia/Ho_Chi_Minh" });

        await db.execute({
          sql: `DELETE FROM customer_visit_logs WHERE visit_date < ?`,
          args: [cutoffDateStr]
        });
      } catch (logError) {
        console.error('Lỗi ghi log visit:', logError);
      }
    }
    // ==========================================

    // Truy vấn dữ liệu Admin & Quyền (Menu) từ Database Turso
    const adminResult = await db.execute({
      sql: `
        SELECT 
          au.role_id,
          r.name as role_name,
          rp.menu_code
        FROM admin_users au
        JOIN roles r ON au.role_id = r.id
        LEFT JOIN role_permissions rp ON r.id = rp.role_id
        WHERE au.customer_id = ? AND au.status = 'active'
      `,
      args: [basicCustomer.id]
    });

    let adminData = null;

    if (adminResult.rows.length > 0) {
      const firstRow = adminResult.rows[0] as Record<string, any>;
      const allowed_menus = adminResult.rows
        .map((row) => (row as Record<string, any>).menu_code as string)
        .filter(Boolean);

      adminData = {
        role_id: firstRow.role_id as string,
        role_name: firstRow.role_name as string,
        allowed_menus: allowed_menus
      };
    }

    const customer = {
      ...basicCustomer,
      admin: adminData
    };

    const response = NextResponse.json({ customer }, { status: 200 });
    
    // Nếu vừa tự sinh uuid ở server thì gán ngược lại cookie cho trình duyệt
    if (newGeneratedUuid) {
      response.cookies.set('shop_client_uuid', clientUuid, { path: '/', maxAge: 31536000 });
    }

    return response;
  } catch (error) {
    console.error('Lỗi lấy thông tin session:', error);
    return NextResponse.json({ customer: null }, { status: 200 });
  }
}