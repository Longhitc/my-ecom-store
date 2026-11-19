import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Hướng dẫn đăng ký tài khoản | Đẹp Và Xinh Shop',
  description: 'Hướng dẫn chi tiết cách tạo và đăng nhập tài khoản khách hàng tại Đẹp Và Xinh Shop.',
};
export default function GuidesPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:py-8">
      <div className="mb-4 flex items-center justify-between gap-2 border-b border-neutral-200 dark:border-neutral-800 pb-3">
        <h1 className="text-lg sm:text-2xl font-bold text-neutral-900 dark:text-white">
          Hướng dẫn đăng ký tài khoản
        </h1>
        <Link
          href="/"
          className="rounded-lg bg-neutral-100 dark:bg-neutral-800 px-3 py-1.5 text-xs font-semibold text-neutral-700 dark:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition"
        >
          ← Trang chủ
        </Link>
      </div>

      <div className="space-y-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 sm:p-6 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300 shadow-sm">
        <p>
          Chào mừng bạn đến với <strong>Đẹp Và Xinh Shop</strong>. Việc đăng ký tài khoản giúp bạn theo dõi đơn hàng nhanh chóng, lưu địa chỉ giao hàng mặc định và nhận các chương trình ưu đãi dành riêng cho thành viên.
        </p>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-neutral-900 dark:text-white">
            Bước 1: Truy cập trang đăng ký
          </h2>
          <p>
            Trên thanh điều hướng phía trên cùng của website, nhấn vào biểu tượng tài khoản (hình người) hoặc chọn mục <strong>Đăng ký</strong> để mở biểu mẫu tạo tài khoản mới.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-neutral-900 dark:text-white">
            Bước 2: Nhập thông tin cá nhân
          </h2>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Họ và tên:</strong> Nhập đầy đủ họ tên người nhận hàng để thuận tiện khi giao nhận.</li>
            <li><strong>Email / Số điện thoại:</strong> Dùng để đăng nhập và nhận thông báo cập nhật trạng thái đơn hàng.</li>
            <li><strong>Mật khẩu:</strong> Đặt mật khẩu đủ mạnh (nên có cả chữ và số) và xác nhận lại mật khẩu.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-neutral-900 dark:text-white">
            Bước 3: Hoàn tất tạo tài khoản
          </h2>
          <p>
            Kiểm tra kỹ thông tin đã điền, nhấn nút <strong>Đăng ký</strong>. Sau khi hệ thống xác nhận thành công, bạn có thể đăng nhập ngay và bắt đầu mua sắm.
          </p>
        </section>

        <section className="rounded-xl bg-neutral-50 dark:bg-neutral-800/60 p-4 border border-neutral-200/70 dark:border-neutral-700/70 space-y-1.5">
          <h2 className="text-sm font-bold text-neutral-900 dark:text-white">
            Lưu ý & Hỗ trợ
          </h2>
          <p className="text-xs sm:text-sm">
            Nếu gặp sự cố khi tạo tài khoản hoặc quên mật khẩu, vui lòng liên hệ trực tiếp với đội ngũ hỗ trợ của shop qua mục <strong>Chat</strong> trên website để được hỗ trợ kịp thời.
          </p>
        </section>
      </div>
    </div>
  );
}