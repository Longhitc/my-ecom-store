'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

interface SlideItem {
  title: string;
  image: string;
  link: string;
}

const slides: SlideItem[] = [
  {
    title: 'Hàng Có Sẵn - Giao Ngay Lập Tức',
    image: 'https://res.cloudinary.com/dpsejpp2/image/upload/v1786934595/H%C3%ACnh_N%E1%BB%81n_Shop_1.jpg',
    link: '/search/co-san',
  },
  {
    title: 'Bộ Sưu Tập Mới Nhất 2026',
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
  }, []);

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

      {/* Dùng object-contain để hiện trọn vẹn bức ảnh không bị cắt góc */}
      <div className="relative aspect-[21/9] w-full overflow-hidden rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
        <img
          src={currentSlide.image}
          alt={currentSlide.title}
          className="h-full w-full object-contain transition-all duration-500"
        />

        <button
          onClick={prevSlide}
          className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-black/70 cursor-pointer text-xs"
        >
          ❮
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-black/70 cursor-pointer text-xs"
        >
          ❯
        </button>

        <div className="absolute bottom-1.5 left-1/2 flex -translate-x-1/2 gap-1">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`h-1 rounded-full transition-all cursor-pointer ${
                currentIndex === idx ? 'w-4 bg-white' : 'w-1 bg-white/50'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}