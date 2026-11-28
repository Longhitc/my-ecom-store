'use client';

import { useAudio } from '@/context/AudioContext';
import { usePathname, useRouter } from 'next/navigation';

interface MiniPlayerProps {
  variant?: 'desktop' | 'mobile';
}

export default function MiniPlayer({ variant = 'desktop' }: MiniPlayerProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { currentTrack, isPlaying, hasStarted, togglePlay, handleNext, handlePrev } = useAudio();

  const isHidden = pathname === '/music' || pathname === '/admin/music' || !hasStarted || !currentTrack;

  if (variant === 'mobile') {
    if (isHidden) return null;

    return (
      <div className="flex w-full items-center gap-2 rounded-full border border-neutral-800 bg-neutral-900 px-2.5 py-1 shadow-md animate-fadeIn">
        {/* Đĩa than mini */}
        <div
          onClick={() => router.push('/music')}
          className={`relative flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full border border-neutral-700 bg-neutral-950 shadow-md ${
            isPlaying ? 'animate-spin' : ''
          }`}
          style={{ animationDuration: '2.5s' }}
          title="Bấm để mở giao diện đĩa than"
        >
          <div className="absolute top-0 right-1 h-2.5 w-1 rotate-45 rounded-full bg-gradient-to-b from-emerald-400 to-transparent" />
          <div className="absolute bottom-0 left-1 h-2.5 w-1 rotate-45 rounded-full bg-gradient-to-t from-pink-500 to-transparent" />
          <div className="z-10 flex h-2.5 w-2.5 items-center justify-center rounded-full border border-neutral-900 bg-emerald-500 shadow-inner">
            <div className="h-1 w-1 rounded-full bg-neutral-950" />
          </div>
        </div>

        {/* Thông tin bài hát trên mobile: Chạy 1 chiều nối vòng, chữ trái trôi hết thì chữ phải nối tiếp */}
        <div
          onClick={() => router.push('/music')}
          className="relative flex min-w-0 flex-1 cursor-pointer flex-col overflow-hidden"
        >
          <div className="relative flex w-full overflow-hidden whitespace-nowrap">
            <div className="inline-flex animate-mobile-relay">
              <span className="pr-44 text-[11px] font-medium leading-tight text-white">
                {currentTrack.title}
              </span>
              <span className="pr-44 text-[11px] font-medium leading-tight text-white">
                {currentTrack.title}
              </span>
            </div>
          </div>
          <span className="truncate text-[9px] leading-tight text-emerald-400">
            {currentTrack.artist}
          </span>
        </div>

        {/* Nút điều khiển */}
        <div className="flex shrink-0 items-center gap-0.5">
          <button
            type="button"
            onClick={handlePrev}
            className="p-1 text-[11px] text-neutral-400 transition-colors hover:text-white"
            title="Bài trước"
          >
            ⏮
          </button>
          <button
            type="button"
            onClick={togglePlay}
            className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[9px] font-bold text-neutral-950 transition-transform hover:bg-emerald-400 active:scale-95"
            title={isPlaying ? 'Tạm dừng' : 'Phát'}
          >
            {isPlaying ? '⏸' : '▶'}
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="p-1 text-[11px] text-neutral-400 transition-colors hover:text-white"
            title="Bài sau"
          >
            ⏭
          </button>
        </div>

        <style jsx>{`
          @keyframes mobileRelay {
            0%, 10% {
              transform: translateX(0%);
            }
            88% {
              transform: translateX(-50%);
            }
            88.01%, 100% {
              transform: translateX(0%);
            }
          }
          .animate-mobile-relay {
            display: inline-flex;
            white-space: nowrap;
            animation: mobileRelay 16s linear infinite;
          }
        `}</style>
      </div>
    );
  }

  // Thêm điều kiện loại trừ trang /music và /admin/music cho desktop
  if (isHidden) {
    return <div className="hidden w-[240px] md:block"></div>;
  }

  return (
    <div className="flex w-[260px] shrink-0 items-center gap-2 rounded-full border border-neutral-800 bg-neutral-900 px-2.5 py-1.5 shadow-lg animate-fadeIn">
      {/* Đĩa than mini */}
      <div
        onClick={() => router.push('/music')}
        className={`relative flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full border border-neutral-700 bg-neutral-950 shadow-md ${
          isPlaying ? 'animate-spin' : ''
        }`}
        style={{ animationDuration: '2.5s' }}
        title="Bấm để mở giao diện đĩa than"
      >
        <div className="absolute top-0 right-1 h-3 w-1.5 rotate-45 rounded-full bg-gradient-to-b from-emerald-400 to-transparent" />
        <div className="absolute bottom-0 left-1 h-3 w-1.5 rotate-45 rounded-full bg-gradient-to-t from-pink-500 to-transparent" />

        <div className="z-10 flex h-3 w-3 items-center justify-center rounded-full border border-neutral-900 bg-emerald-500 shadow-inner">
          <div className="h-1 w-1 rounded-full bg-neutral-950" />
        </div>
      </div>

      {/* Thông tin bài hát: Dừng đúng 1 giây ở đầu rồi chạy một chiều dứt khoát */}
      <div
        onClick={() => router.push('/music')}
        className="relative flex min-w-0 flex-1 cursor-pointer flex-col overflow-hidden"
      >
        <div className="relative flex w-full overflow-hidden whitespace-nowrap">
          <div className="inline-flex animate-one-way-marquee">
            <span className="pr-12 text-xs font-medium leading-tight text-white">
              {currentTrack.title}
            </span>
            <span className="pr-12 text-xs font-medium leading-tight text-white">
              {currentTrack.title}
            </span>
          </div>
        </div>
        <span className="truncate text-[10px] text-emerald-400">
          {currentTrack.artist}
        </span>
      </div>

      {/* Nút điều khiển */}
      <div className="flex shrink-0 items-center gap-0.5">
        <button onClick={handlePrev} className="p-1 text-xs text-neutral-400 transition-colors hover:text-white" title="Bài trước">⏮</button>
        <button
          onClick={togglePlay}
          className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-neutral-950 transition-transform hover:bg-emerald-400 active:scale-95"
          title={isPlaying ? 'Tạm dừng' : 'Phát'}
        >
          {isPlaying ? '⏸' : '▶'}
        </button>
        <button onClick={handleNext} className="p-1 text-xs text-neutral-400 transition-colors hover:text-white" title="Bài sau">⏭</button>
      </div>

      {/* CSS Keyframes: Dừng nghỉ đúng 1 giây ở 0% -> Chạy đều trái -> Nhảy về 0% tức thì */}
      <style jsx>{`
        @keyframes oneWayMarquee {
          0%, 12% {
            transform: translateX(0%);
          }
          78% {
            transform: translateX(-50%);
          }
          78.1%, 100% {
            transform: translateX(0%);
          }
        }
        .animate-one-way-marquee {
          display: inline-flex;
          white-space: nowrap;
          animation: oneWayMarquee 10s linear infinite;
        }
      `}</style>
    </div>
  );
}