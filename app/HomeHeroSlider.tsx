'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

interface SlideItem {
  title: string;
  subtitle?: string;
  badgeText?: string;
  bgGradient?: string;
  image?: string;
  link: string;
  isGuideCard?: boolean;
}

const slides: SlideItem[] = [
  {
    title: 'Hướng dẫn đăng ký tài khoản và cài app',
    subtitle: 'Tạo tài khoản nhanh chóng để theo dõi đơn hàng và cài đặt ứng dụng.',
    badgeText: 'Hỗ trợ khách hàng',
    link: '/guides',
    isGuideCard: true,
  },
  {
    title: 'Nghe nhạc khi mua sắm',
    subtitle: 'Vừa chọn giày dép, thời trang vừa nghe nhạc thư giãn.',
    badgeText: '🎵 Giải trí',
    bgGradient: 'from-[#f7d8cc] via-[#f5e1d8] to-neutral-100 dark:to-neutral-800',
    image: 'https://res.cloudinary.com/dpsejpp2/image/upload/v1786934595/H%C3%ACnh_N%E1%BB%81n_Shop_1.jpg',
    link: '/music',
  },
  {
    title: 'Bộ Sưu Tập Mới Nhất 2026',
    subtitle: 'Đặt hàng online nhanh chóng, giao tận nơi toàn quốc.',
    badgeText: '🔥 Mới về',
    bgGradient: 'from-[#fbe3c5] via-[#fdf0df] to-neutral-100 dark:to-neutral-800',
    image: 'https://res.cloudinary.com/dpsejpp2/image/upload/v1786934614/Hinh_Shop_2.png',
    link: '/search',
  },
];

export default function HomeHeroSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [currentIndex]);

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  const currentSlide = slides[currentIndex] || slides[0]!;

  return (
    <div className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/50 p-3 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <Link href={currentSlide.link} className="text-xs text-blue-600 hover:underline font-semibold">
          Khám phá →
        </Link>
      </div>

      {/* Khung slider chính */}
      <div className="relative aspect-[21/9] w-full overflow-hidden rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
        {currentSlide.isGuideCard ? (
          <Link
            href={currentSlide.link}
            className="flex h-full w-full flex-col justify-center bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 px-10 sm:px-14 py-3 text-white transition hover:brightness-105"
          >
            {currentSlide.badgeText && (
              <span className="inline-flex w-fit items-center rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-semibold">
                {currentSlide.badgeText}
              </span>
            )}
            <h2 className="mt-1 text-sm sm:text-lg font-bold leading-snug tracking-tight">
              {currentSlide.title}
            </h2>
            {currentSlide.subtitle && (
              <p className="mt-0.5 text-[11px] sm:text-xs text-white/90 line-clamp-1">
                {currentSlide.subtitle}
              </p>
            )}
          </Link>
        ) : (
          <Link
            href={currentSlide.link}
            className={`flex h-full w-full items-center justify-center gap-3 sm:gap-6 bg-gradient-to-r ${
              currentSlide.bgGradient || 'from-[#f7d8cc] via-[#f5e1d8] to-neutral-100 dark:to-neutral-800'
            } pl-8 pr-8 sm:px-14 text-neutral-900 transition hover:brightness-[0.99]`}
          >
            <img
              src={currentSlide.image}
              alt={currentSlide.title}
              className="h-[84%] w-auto max-w-[38%] sm:max-w-[45%] rounded-md object-contain transition-all duration-500"
            />
            <div className="flex flex-col items-start justify-center text-left min-w-0">
              {currentSlide.badgeText && (
                <span className="inline-flex w-fit items-center rounded-full bg-neutral-900/10 px-2 py-0.5 text-[9px] sm:text-[10px] font-semibold text-neutral-800 whitespace-nowrap">
                  {currentSlide.badgeText}
                </span>
              )}
              <h2 className="mt-1 text-xs sm:text-lg font-bold leading-snug tracking-tight text-neutral-900 whitespace-nowrap">
                {currentSlide.title}
              </h2>
              {currentSlide.subtitle && (
                <p className="mt-0.5 hidden sm:block text-xs text-neutral-600 line-clamp-1">
                  {currentSlide.subtitle}
                </p>
              )}
            </div>
          </Link>
        )}

        {/* Nút quay lại (trái) */}
        <button
          type="button"
          onClick={prevSlide}
          aria-label="Slide trước"
          className="absolute left-0 top-1/2 z-20 -translate-y-1/2 flex h-10 w-7 sm:h-12 sm:w-8 items-center justify-center rounded-r-lg bg-black/35 text-white/90 backdrop-blur-[2px] transition hover:bg-black/60 hover:text-white active:scale-95 cursor-pointer"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Nút đi tới (phải) */}
        <button
          type="button"
          onClick={nextSlide}
          aria-label="Slide tiếp theo"
          className="absolute right-0 top-1/2 z-20 -translate-y-1/2 flex h-10 w-7 sm:h-12 sm:w-8 items-center justify-center rounded-l-lg bg-black/35 text-white/90 backdrop-blur-[2px] transition hover:bg-black/60 hover:text-white active:scale-95 cursor-pointer"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>

        <div className="absolute bottom-1.5 left-1/2 z-20 flex -translate-x-1/2 gap-1.5 rounded-full bg-black/25 px-2 py-1 backdrop-blur-[2px]">
          {slides.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentIndex(idx)}
              aria-label={`Chuyển đến slide ${idx + 1}`}
              className={`h-1.5 rounded-full transition-all cursor-pointer ${
                currentIndex === idx ? 'w-4 bg-white' : 'w-1.5 bg-white/55 hover:bg-white/80'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}