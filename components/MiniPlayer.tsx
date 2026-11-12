'use client';

import { useAudio } from '@/context/AudioContext';
import { usePathname, useRouter } from 'next/navigation';

export default function MiniPlayer() {
  const pathname = usePathname();
  const router = useRouter();
  const { currentTrack, isPlaying, hasStarted, togglePlay, handleNext, handlePrev } = useAudio();

  // Thêm điều kiện loại trừ trang /music và /admin/music
  if (pathname === '/music' || pathname === '/admin/music' || !hasStarted || !currentTrack) {
    return <div className="hidden md:block w-[240px]"></div>; 
  }

  return (
    <div className="flex items-center gap-2 bg-neutral-900 border border-neutral-800 px-2.5 py-1.5 rounded-full shadow-lg w-[260px] shrink-0 animate-fadeIn">
      
      {/* Đĩa than mini */}
      <div 
        onClick={() => router.push('/music')}
        className={`w-7 h-7 rounded-full bg-neutral-950 border border-neutral-700 shadow-md flex items-center justify-center relative cursor-pointer shrink-0 overflow-hidden ${
          isPlaying ? 'animate-spin' : ''
        }`}
        style={{ animationDuration: '2.5s' }}
        title="Bấm để mở giao diện đĩa than"
      >
        <div className="absolute top-0 right-1 w-1.5 h-3 bg-gradient-to-b from-emerald-400 to-transparent rounded-full transform rotate-45"></div>
        <div className="absolute bottom-0 left-1 w-1.5 h-3 bg-gradient-to-t from-pink-500 to-transparent rounded-full transform rotate-45"></div>

        <div className="w-3 h-3 rounded-full bg-emerald-500 border border-neutral-900 flex items-center justify-center z-10 shadow-inner">
          <div className="w-1 h-1 rounded-full bg-neutral-950"></div>
        </div>
      </div>

      {/* Thông tin bài hát: Dừng đúng 1 giây ở đầu rồi chạy một chiều dứt khoát */}
      <div 
        onClick={() => router.push('/music')}
        className="flex flex-col flex-1 min-w-0 cursor-pointer overflow-hidden relative"
      >
        <div className="w-full overflow-hidden whitespace-nowrap relative flex">
          <div className="inline-flex animate-one-way-marquee">
            <span className="text-xs text-white font-medium leading-tight pr-12">
              {currentTrack.title}
            </span>
            <span className="text-xs text-white font-medium leading-tight pr-12">
              {currentTrack.title}
            </span>
          </div>
        </div>
        <span className="text-[10px] text-emerald-400 truncate">
          {currentTrack.artist}
        </span>
      </div>

      {/* Nút điều khiển */}
      <div className="flex items-center gap-0.5 shrink-0">
        <button onClick={handlePrev} className="text-neutral-400 hover:text-white text-xs p-1 transition-colors" title="Bài trước">⏮</button>
        <button 
          onClick={togglePlay} 
          className="w-6 h-6 rounded-full bg-emerald-500 text-neutral-950 font-bold text-[10px] flex items-center justify-center hover:bg-emerald-400 transition-transform active:scale-95"
          title={isPlaying ? 'Tạm dừng' : 'Phát'}
        >
          {isPlaying ? '⏸' : '▶'}
        </button>
        <button onClick={handleNext} className="text-neutral-400 hover:text-white text-xs p-1 transition-colors" title="Bài sau">⏭</button>
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