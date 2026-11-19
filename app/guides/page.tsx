import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Hướng dẫn đăng ký tài khoản & cài app | Đẹp Và Xinh Shop',
  description:
    'Hướng dẫn chi tiết cách tạo tài khoản khách hàng và cài đặt ứng dụng Đẹp Và Xinh Shop trên điện thoại Android và iOS.',
};

export default function GuidesPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:py-8 space-y-6">
      {/* PHẦN 1: HƯỚNG DẪN ĐĂNG KÝ TÀI KHOẢN */}
      <div>
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
              <li>
                <strong>Họ và tên:</strong> Nhập đầy đủ họ tên người nhận hàng để thuận tiện khi giao nhận.
              </li>
              <li>
                <strong>Email / Số điện thoại:</strong> Dùng để đăng nhập và nhận thông báo cập nhật trạng thái đơn hàng.
              </li>
              <li>
                <strong>Mật khẩu:</strong> Đặt mật khẩu đủ mạnh (nên có cả chữ và số) và xác nhận lại mật khẩu.
              </li>
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

      {/* PHẦN 2: HƯỚNG DẪN CÀI APP TRÊN ANDROID & IOS */}
      <div>
        <div className="mb-4 flex items-center justify-between gap-2 border-b border-neutral-200 dark:border-neutral-800 pb-3">
          <h2 className="text-lg sm:text-2xl font-bold text-neutral-900 dark:text-white">
            Hướng dẫn cài ứng dụng trên điện thoại (Android & iOS)
          </h2>
        </div>

        <div className="space-y-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 sm:p-6 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300 shadow-sm">
          <p>
            Bạn có thể cài trực tiếp ứng dụng <strong>Đẹp Và Xinh Shop</strong> ra màn hình chính điện thoại để mở nhanh như app native, tiết kiệm thao tác và nhận bản cập nhật mới tự động.
          </p>

          {/* ANDROID */}
          <section className="space-y-2.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
            <h3 className="text-base font-bold text-emerald-700 dark:text-emerald-400">
              📱 Trên điện thoại Android (Chrome / Edge / Samsung Internet)
            </h3>
            <ol className="list-decimal pl-5 space-y-1.5 text-xs sm:text-sm">
              <li>
                Mở trình duyệt <strong>Google Chrome</strong> (hoặc Microsoft Edge) và truy cập website của shop.
              </li>
              <li>
                Nhấn vào biểu tượng <strong>ba chấm dọc (⋮)</strong> ở góc trên bên phải màn hình.
              </li>
              <li>
                Chọn mục <strong>Cài đặt ứng dụng</strong> hoặc <strong>Thêm vào màn hình chính</strong>.
              </li>
              <li>
                Xác nhận <strong>Cài đặt</strong> / <strong>Thêm</strong>. Biểu tượng app sẽ xuất hiện ngay trên màn hình chính điện thoại của bạn.
              </li>
            </ol>
          </section>

          {/* IOS */}
          <section className="space-y-2.5 rounded-xl border border-blue-500/20 bg-blue-500/5 p-4">
            <h3 className="text-base font-bold text-blue-700 dark:text-blue-400">
              🍏 Trên iPhone / iPad (iOS - Safari)
            </h3>
            <ol className="list-decimal pl-5 space-y-1.5 text-xs sm:text-sm">
              <li>
                Mở trình duyệt <strong>Safari</strong> trên iPhone/iPad và vào địa chỉ website của shop.
              </li>
              <li>
                Nhấn vào biểu tượng <strong>Chia sẻ</strong> (ô vuông có mũi tên hướng lên ở thanh công cụ Safari).
              </li>
              <li>
                Cuộn xuống và chọn <strong>Thêm vào Màn hình chính</strong> (<em>Add to Home Screen</em>).
              </li>
              <li>
                Nhấn <strong>Thêm</strong> ở góc trên bên phải để hoàn tất. Từ lần sau bạn có thể mở trực tiếp từ icon trên màn hình chính.
              </li>
            </ol>
          </section>

          <section className="rounded-xl bg-neutral-50 dark:bg-neutral-800/60 p-4 border border-neutral-200/70 dark:border-neutral-700/70 space-y-1">
            <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
              Mẹo nhỏ
            </h3>
            <p className="text-xs sm:text-sm">
              Khi shop có phiên bản cập nhật mới, ứng dụng sẽ tự làm mới dữ liệu khi bạn mở lại. Nếu giao diện chưa đổi ngay, bạn chỉ cần đóng hoàn toàn app rồi mở lại.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}