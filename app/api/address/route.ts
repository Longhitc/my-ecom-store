import { createClient } from "@libsql/client";
import { NextResponse } from "next/server";

const db = createClient({
  url: process.env.TURSO_DATABASE_URL || "",
  authToken: process.env.TURSO_AUTH_TOKEN || "",
});

// GET: Lấy danh sách tất cả địa chỉ của Customer
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "Thiếu userId" }, { status: 400 });
    }

    const result = await db.execute({
      sql: "SELECT * FROM addresses WHERE customer_id = ? ORDER BY is_default DESC, created_at DESC",
      args: [userId],
    });

    const addresses = result.rows || [];
    return NextResponse.json({ addresses });
  } catch (error) {
    console.error("Lỗi lấy danh sách địa chỉ:", error);
    return NextResponse.json({ error: "Lỗi hệ thống" }, { status: 500 });
  }
}

// POST: Thêm địa chỉ mới cho Customer
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

    const isDefault = checkExist.rows.length === 0 ? 1 : 0;
    const newId = `addr_${Date.now()}`;
    const now = Date.now();

    await db.execute({
      sql: `INSERT INTO addresses (id, customer_id, full_name, phone, address_line, city, is_default, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [newId, userId, fullName, phone, addressLine, city, isDefault, now],
    });

    return NextResponse.json({
      success: true,
      message: "Thêm địa chỉ mới thành công",
      newAddress: {
        id: newId,
        customer_id: userId,
        full_name: fullName,
        phone,
        address_line: addressLine,
        city,
        is_default: isDefault,
      },
    });
  } catch (error) {
    console.error("Lỗi thêm địa chỉ:", error);
    return NextResponse.json({ error: "Lỗi hệ thống khi thêm địa chỉ" }, { status: 500 });
  }
}

// PUT: Cập nhật thông tin 1 địa chỉ hiện có
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { addressId, userId, fullName, phone, addressLine, city } = body;

    if (!addressId || !userId || !fullName || !phone || !addressLine || !city) {
      return NextResponse.json(
        { error: "Vui lòng nhập đầy đủ thông tin địa chỉ" },
        { status: 400 }
      );
    }

    await db.execute({
      sql: `UPDATE addresses 
            SET full_name = ?, phone = ?, address_line = ?, city = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ? AND customer_id = ?`,
      args: [fullName, phone, addressLine, city, addressId, userId],
    });

    return NextResponse.json({ success: true, message: "Cập nhật địa chỉ thành công" });
  } catch (error) {
    console.error("Lỗi cập nhật địa chỉ:", error);
    return NextResponse.json({ error: "Lỗi hệ thống khi sửa địa chỉ" }, { status: 500 });
  }
}

// PATCH: Thiết lập địa chỉ mặc định mới
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { userId, addressId } = body;

    if (!userId || !addressId) {
      return NextResponse.json({ error: "Thiếu userId hoặc addressId" }, { status: 400 });
    }

    await db.execute({
      sql: "UPDATE addresses SET is_default = 0 WHERE customer_id = ?",
      args: [userId],
    });

    await db.execute({
      sql: "UPDATE addresses SET is_default = 1 WHERE id = ? AND customer_id = ?",
      args: [addressId, userId],
    });
    return NextResponse.json({ success: true, message: "Đã cập nhật địa chỉ mặc định" });
  } catch (error) {
    console.error("Lỗi cập nhật địa chỉ mặc định:", error);
    return NextResponse.json({ error: "Lỗi hệ thống khi thiết lập địa chỉ mặc định" }, { status: 500 });
  }
}