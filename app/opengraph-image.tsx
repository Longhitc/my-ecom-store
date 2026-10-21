import OpengraphImage from "components/opengraph-image";

export default async function Image() {
  try {
    const image = await OpengraphImage();
    if (!image) {
      // Fallback nếu hàm trả về rỗng
      return new Response("Not found", { status: 404 });
    }
    return image;
  } catch (error) {
    console.error("Error generating OpenGraph image:", error);
    // Trả về một Response lỗi nhẹ hoặc fallback thay vì làm sập toàn bộ build của Vercel
    return new Response("Error generating image", { status: 500 });
  }
}