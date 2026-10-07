import crypto from 'crypto';
import { NextResponse } from 'next/server';

function getPublicIdFromUrl(url: string): string | null {
  try {
    const parts = url.split('/upload/');
    if (parts.length < 2) return null;
    const pathAfterUpload = parts[1];
    if (!pathAfterUpload) return null;
    const pathWithoutVersion = pathAfterUpload.replace(/^v\d+\//, '');
    const publicId = pathWithoutVersion.substring(0, pathWithoutVersion.lastIndexOf('.'));
    return publicId;
  } catch (err) {
    return null;
  }
}

export async function POST(request: Request) {
  try {
    const { imageUrl } = await request.json();

    if (!imageUrl) {
      return NextResponse.json({ error: 'Chưa cung cấp URL ảnh' }, { status: 400 });
    }

    const publicId = getPublicIdFromUrl(imageUrl);
    if (!publicId) {
      return NextResponse.json({ error: 'URL Cloudinary không hợp lệ' }, { status: 400 });
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    const cloudName = 'dpsejpp2';

    if (!apiKey || !apiSecret) {
      return NextResponse.json({ error: 'Thiếu API Key/Secret trong env' }, { status: 500 });
    }

    // Tạo chữ ký bảo mật SHA-1 chuẩn của Cloudinary
    const stringToSign = `public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;
    const signature = crypto.createHash('sha1').update(stringToSign).digest('hex');

    const formData = new URLSearchParams();
    formData.append('public_id', publicId);
    formData.append('api_key', apiKey);
    formData.append('timestamp', timestamp.toString());
    formData.append('signature', signature);

    // Gọi API REST xóa ảnh bằng fetch thuần
    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`, {
      method: 'POST',
      body: formData,
    });

    const result = await res.json();

    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    console.error('Lỗi khi xóa ảnh Cloudinary:', error);
    return NextResponse.json({ error: error.message || 'Xóa ảnh thất bại' }, { status: 500 });
  }
}