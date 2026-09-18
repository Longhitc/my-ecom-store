import { createClient } from "@libsql/client";
import { NextResponse } from "next/server";

const db = createClient({
  url: process.env.TURSO_DATABASE_URL || "",
  authToken: process.env.TURSO_AUTH_TOKEN || "",
});

// GET: Lấy địa chỉ giao hàng của User
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "Thiếu userId" }, { status: 400 });
    }

    const result = await db.execute({
      sql: "SELECT * FROM addresses WHERE customer_id = ? ORDER BY is_default DESC, created_at DESC LIMIT 1",
      args: [userId],
    });

    const address = result.rows[0] || null;
    return NextResponse.json({ address });
  } catch (error) {
    console.error("Lỗi lấy địa chỉ:", error);
    return NextResponse.json({ error: "Lỗi hệ thống" }, { status: 500 });
  }
}

// POST: Lưu hoặc cập nhật địa chỉ giao hàng
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, fullName, phone, addressLine, city } = body;

    if (!userId || !fullName || !phone || !addressLine || !city) {
      return NextResponse.json(
        { error: "Vui lòng nhập đầy đủ Tên, SĐT, Địa chỉ và Tỉnh/Thành phố" },
        { status: 400 }
      );
    }

    const checkExist = await db.execute({
      sql: "SELECT id FROM addresses WHERE customer_id = ? LIMIT 1",
      args: [userId],
    });

    if (checkExist.rows.length > 0) {
      await db.execute({
        sql: `UPDATE addresses 
              SET full_name = ?, phone = ?, address_line = ?, city = ?, updated_at = CURRENT_TIMESTAMP
              WHERE customer_id = ?`,
        args: [fullName, phone, addressLine, city, userId],
      });
    } else {
      const newId = `addr_${Date.now()}`;
      await db.execute({
        sql: `INSERT INTO addresses (id, customer_id, full_name, phone, address_line, city, is_default)
              VALUES (?, ?, ?, ?, ?, ?, 1)`,
        args: [newId, userId, fullName, phone, addressLine, city],
      });
    }

    return NextResponse.json({ success: true, message: "Lưu địa chỉ thành công" });
  } catch (error) {
    console.error("Lỗi lưu địa chỉ:", error);
    return NextResponse.json({ error: "Lỗi hệ thống khi lưu địa chỉ" }, { status: 500 });
  }
}