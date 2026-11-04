import { createClient } from '@libsql/client';
import { NextResponse } from 'next/server';

const turso = createClient({
  url: process.env.TURSO_DATABASE_URL || '',
  authToken: process.env.TURSO_AUTH_TOKEN || '',
});

async function initTables() {
  try {
    await turso.execute(`
      CREATE TABLE IF NOT EXISTS product_likes (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          product_id TEXT NOT NULL,
          client_uuid TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(product_id, client_uuid)
      );
    `);
    await turso.execute(`
      CREATE TABLE IF NOT EXISTS product_reviews (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          product_id TEXT NOT NULL,
          customer_name TEXT NOT NULL,
          rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
          comment TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);
  } catch (e) {
    console.error("Error initializing tables:", e);
  }
}

export async function GET(request: Request) {
  await initTables();
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get('product_id');
  const clientUuid = searchParams.get('client_uuid');

  if (!productId) {
    return NextResponse.json({ success: false, error: 'Missing product_id' }, { status: 400 });
  }

  try {
    const countRes = await turso.execute({
      sql: "SELECT COUNT(*) as total FROM product_likes WHERE product_id = ?",
      args: [productId]
    });
    const likesCount = Number(countRes.rows[0]?.total ?? 0);

    let isLiked = false;
    if (clientUuid) {
      const checkRes = await turso.execute({
        sql: "SELECT 1 FROM product_likes WHERE product_id = ? AND client_uuid = ?",
        args: [productId, clientUuid]
      });
      isLiked = checkRes.rows.length > 0;
    }

    // Dùng strftime để định dạng trực tiếp dd-mm-yyyy hh:mm theo giờ VN (+7 hours)
    const reviewsRes = await turso.execute({
      sql: "SELECT id, customer_name as name, rating, comment, strftime('%d-%m-%Y %H:%M', datetime(created_at, '+7 hours')) as date FROM product_reviews WHERE product_id = ? ORDER BY id DESC",
      args: [productId]
    });

    const reviews = reviewsRes.rows.map(row => ({
      id: row.id,
      name: row.name,
      rating: row.rating,
      comment: row.comment,
      date: String(row.date || '') // Giữ nguyên chuỗi dd-mm-yyyy hh:mm trả về từ SQLite
    }));

    return NextResponse.json({
      success: true,
      likesCount,
      isLiked,
      reviews
    });
  } catch (error) {
    console.error("GET interaction error:", error);
    return NextResponse.json({ success: false, error: 'Database error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  await initTables();
  try {
    const body = await request.json();
    const { action, productId, clientUuid, customerName, rating, comment } = body;

    if (!productId) {
      return NextResponse.json({ success: false, error: 'Missing product_id' }, { status: 400 });
    }

    if (action === 'LIKE') {
      if (!clientUuid) {
        return NextResponse.json({ success: false, error: 'Missing clientUuid' }, { status: 400 });
      }

      const existing = await turso.execute({
        sql: "SELECT id FROM product_likes WHERE product_id = ? AND client_uuid = ?",
        args: [productId, clientUuid]
      });

      let isLiked = false;
      if (existing.rows.length > 0) {
        await turso.execute({
          sql: "DELETE FROM product_likes WHERE product_id = ? AND client_uuid = ?",
          args: [productId, clientUuid]
        });
        isLiked = false;
      } else {
        await turso.execute({
          sql: "INSERT INTO product_likes (product_id, client_uuid) VALUES (?, ?)",
          args: [productId, clientUuid]
        });
        isLiked = true;
      }

      const countRes = await turso.execute({
        sql: "SELECT COUNT(*) as total FROM product_likes WHERE product_id = ?",
        args: [productId]
      });
      const likesCount = Number(countRes.rows[0]?.total ?? 0);

      return NextResponse.json({ success: true, isLiked, likesCount });
    }

    if (action === 'REVIEW') {
      if (!customerName || !comment || !rating) {
        return NextResponse.json({ success: false, error: 'Missing review fields' }, { status: 400 });
      }

      await turso.execute({
        sql: "INSERT INTO product_reviews (product_id, customer_name, rating, comment) VALUES (?, ?, ?, ?)",
        args: [productId, customerName, Number(rating), comment]
      });

      const reviewsRes = await turso.execute({
        sql: "SELECT id, customer_name as name, rating, comment, strftime('%d-%m-%Y %H:%M', datetime(created_at, '+7 hours')) as date FROM product_reviews WHERE product_id = ? ORDER BY id DESC",
        args: [productId]
      });

      const reviews = reviewsRes.rows.map(row => ({
        id: row.id,
        name: row.name,
        rating: row.rating,
        comment: row.comment,
        date: String(row.date || '')
      }));

      return NextResponse.json({ success: true, reviews });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error("POST interaction error:", error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}