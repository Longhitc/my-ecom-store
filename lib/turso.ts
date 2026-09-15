import { createClient } from '@libsql/client';

if (!process.env.TURSO_DATABASE_URL || !process.env.TURSO_AUTH_TOKEN) {
  throw new Error('Thiếu cấu hình TURSO_DATABASE_URL hoặc TURSO_AUTH_TOKEN trong .env.local');
}

export const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});