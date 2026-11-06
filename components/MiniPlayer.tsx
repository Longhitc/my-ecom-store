'use client';

import { useAudio } from '@/context/AudioContext';
import { usePathname, useRouter } from 'next/navigation';

export default function MiniPlayer() {
  const pathname = usePathname();
  const router = useRouter();
  const { currentTrack, isPlaying, hasStarted, togglePlay, handleNext, handlePrev } = useAudio();

  if (pathname === '/music' || !hasStarted || !currentTrack) {
    return <div className="hidden md:block w-[240px]"></div>; 
  }

  return (
    <div className="flex items-center gap-2 bg-neutral-900 border border-neutral-800 px-2.5 py-1.5 rounded-full shadow-lg w-[240px] shrink-0 animate-fadeIn">
      
      {/* Đĩa than mini */}
      <div 
        onClick={() => router.push('/music')}
        className={`w-7 h-7 rounded-full bg-gradient-to-tr from-neutral-950 via-neutral-900 to-neutral-950 border border-neutral-700 shadow-md flex items-center justify-center relative cursor-pointer shrink-0 ${
          isPlaying ? 'animate-spin' : ''
        }`}
        style={{ animationDuration: '4s' }}
        title="Bấm để mở giao diện đĩa than"
      >
        <div className="absolute inset-1 rounded-full border border-neutral-800 pointer-events-none"></div>
        <div className="w-2.5 h-2.5 rounded-full bg-emerald-600 border border-neutral-900 flex items-center justify-center">
          <div className="w-1 h-1 rounded-full bg-neutral-950"></div>
        </div>
      </div>

      {/* Thông tin bài hát */}
      <div 
        onClick={() => router.push('/music')}
        className="flex flex-col flex-1 min-w-0 cursor-pointer"
      >
        <span className="text-xs text-white font-medium truncate leading-tight">
          {currentTrack.title}
        </span>
        <span className="text-[10px] text-emerald-400 truncate">
          {currentTrack.artist}
        </span>
      </div>

      {/* Nút điều khiển */}
      <div className="flex items-center gap-0.5 shrink-0">
        <button onClick={handlePrev} className="text-neutral-400 hover:text-white text-xs p-1" title="Bài trước">⏮</button>
        <button 
          onClick={togglePlay} 
          className="w-6 h-6 rounded-full bg-emerald-500 text-neutral-950 font-bold text-[10px] flex items-center justify-center hover:bg-emerald-400"
          title={isPlaying ? 'Tạm dừng' : 'Phát'}
        >
          {isPlaying ? '⏸' : '▶'}
        </button>
        <button onClick={handleNext} className="text-neutral-400 hover:text-white text-xs p-1" title="Bài sau">⏭</button>
      </div>
    </div>
  );
}