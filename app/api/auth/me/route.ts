import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { db } from '../../../../lib/turso';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('customer_session');
    const clientUuid = cookieStore.get('shop_client_uuid')?.value;
    
    let generatedUuid = clientUuid;
    let newGeneratedUuid = false;
    if (!generatedUuid) {
      generatedUuid = 'client_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
      newGeneratedUuid = true;
    }

    if (!sessionCookie || !sessionCookie.value) {
      const res = NextResponse.json({ customer: null }, { status: 200 });
      if (newGeneratedUuid) {
        res.cookies.set('shop_client_uuid', generatedUuid, { path: '/', maxAge: 31536000 });
      }
      return res;
    }

    // Đọc thông tin khách hàng từ Cookie
    const basicCustomer = JSON.parse(sessionCookie.value);

    // ==========================================
    // CẬP NHẬT CUSTOMER_ID VÀO VISIT LOG NẾU ĐANG NULL
    // ==========================================
    if (basicCustomer && basicCustomer.id && generatedUuid) {
      try {
        const now = new Date();
        const todayVn = now.toLocaleDateString("sv-SE", { timeZone: "Asia/Ho_Chi_Minh" });

        // Cập nhật customer_id vào các dòng log trong ngày của client_uuid này đang bị NULL
        await db.execute({
          sql: `
            UPDATE customer_visit_logs 
            SET customer_id = ? 
            WHERE client_uuid = ? AND visit_date = ? AND (customer_id IS NULL OR customer_id = '')
          `,
          args: [basicCustomer.id, generatedUuid, todayVn]
        });
      } catch (updateError) {
        console.error('Lỗi update customer_id vào visit log:', updateError);
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
    
    if (newGeneratedUuid) {
      response.cookies.set('shop_client_uuid', generatedUuid, { path: '/', maxAge: 31536000 });
    }

    return response;
  } catch (error) {
    console.error('Lỗi lấy thông tin session:', error);
    return NextResponse.json({ customer: null }, { status: 200 });
  }
}