import { ImageResponse } from 'next/og';

export default async function OpengraphImage(options?: { title?: string }) {
  try {
    // Nếu có tham số title thì dùng, không thì dùng tên Shop
    const title = options?.title || process.env.SITE_NAME || 'Đẹp và Xinh Shop';

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'black',
            color: 'white',
            fontSize: 60,
            fontWeight: 700
          }}
        >
          <div>{title}</div>
        </div>
      ),
      {
        width: 1200,
        height: 630
      }
    );
  } catch (e) {
    // Nếu có bất kỳ lỗi gì xảy ra, trả về response ảnh trống thay vì crash build
    return new Response(`Failed to generate the image`, {
      status: 500
    });
  }
}