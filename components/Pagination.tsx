import Link from 'next/link';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  baseUrl: string; // Đường dẫn cơ sở, ví dụ: "/search" hoặc "/admin/products"
}

export default function Pagination({ currentPage, totalPages, baseUrl }: PaginationProps) {
  if (totalPages <= 1) return null;

  // Hàm tính toán các trang cần hiển thị (có dấu ... thông minh)
  const getPageNumbers = () => {
    const delta = 1; // Số trang hiển thị bên cạnh trang hiện tại
    const range: (number | string)[] = [];
    const rangeWithDots: (number | string)[] = [];

    range.push(1);

    for (let i = currentPage - delta; i <= currentPage + delta; i++) {
      if (i < totalPages && i > 1) {
        range.push(i);
      }
    }

    range.push(totalPages);

    let l: number | undefined;
    for (let i of range) {
      if (typeof i === 'number') {
        if (l) {
          if (i - l === 2) {
            rangeWithDots.push(l + 1);
          } else if (i - l > 2) {
            rangeWithDots.push('...');
          }
        }
        rangeWithDots.push(i);
        l = i;
      }
    }

    return rangeWithDots;
  };

  const pages = getPageNumbers();

  return (
    <div className="flex items-center justify-center gap-1.5 py-4">
      {/* Nút Trang trước */}
      {currentPage > 1 ? (
        <Link
          href={`${baseUrl}?page=${currentPage - 1}`}
          className="px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 text-xs font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
        >
          ← Trang trước
        </Link>
      ) : (
        <span className="px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 text-xs font-medium text-neutral-400 cursor-not-allowed">
          ← Trang trước
        </span>
      )}

      {/* Các nút số trang */}
      {pages.map((page, index) => {
        if (page === '...') {
          return (
            <span key={`dots-${index}`} className="px-3 py-1.5 text-xs text-neutral-400">
              ...
            </span>
          );
        }

        const isCurrent = page === currentPage;
        return (
          <Link
            key={page}
            href={`${baseUrl}?page=${page}`}
            className={`min-w-[32px] h-[32px] flex items-center justify-center rounded-lg border text-xs font-semibold transition ${
              isCurrent
                ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                : 'border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200'
            }`}
          >
            {page}
          </Link>
        );
      })}

      {/* Nút Trang sau */}
      {currentPage < totalPages ? (
        <Link
          href={`${baseUrl}?page=${currentPage + 1}`}
          className="px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 text-xs font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
        >
          Trang sau →
        </Link>
      ) : (
        <span className="px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 text-xs font-medium text-neutral-400 cursor-not-allowed">
          Trang sau →
        </span>
      )}
    </div>
  );
}