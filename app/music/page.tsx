'use client';

import { useAudio } from '@/context/AudioContext';
import { useState } from 'react';

export default function MusicPage() {
  const {
    tracks,
    currentIndex,
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    playTrack,
    togglePlay,
    handleNext,
    handlePrev,
    seekTo,
  } = useAudio();

  const [showPlaylist, setShowPlaylist] = useState(false);

  const formatTime = (timeInSeconds: number) => {
    if (isNaN(timeInSeconds)) return '0:00';
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const percentage = Math.max(0, Math.min(1, clickX / width));
    seekTo(percentage * duration);
  };

  if (tracks.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12 min-h-[75vh] flex items-center justify-center text-emerald-400 font-serif">
        <div className="animate-pulse tracking-widest">Đang tải giai điệu...</div>
      </div>
    );
  }

  const albumCover = currentTrack?.cover_image && currentTrack.cover_image.startsWith('http')
    ? currentTrack.cover_image 
    : 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop';

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="container mx-auto px-3 py-6 min-h-[80vh] flex flex-col items-center justify-center">
      
      <div className="w-full max-w-xl bg-neutral-900 border border-neutral-800 rounded-3xl p-4 sm:p-6 shadow-2xl flex flex-col items-center relative overflow-hidden">
        
        {/* Tiêu đề trên cùng */}
        <div className="flex items-center gap-2 mb-4 sm:mb-6 w-full justify-center">
          <span className="text-emerald-400 text-sm">🎵</span>
          <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.2em] sm:tracking-[0.25em] text-emerald-400 font-semibold">
            VINTAGE VINYL EXPERIENCE
          </span>
        </div>

        {/* Bố cục 2 cột Trái/Phải */}
        <div className="grid grid-cols-2 gap-3 sm:gap-5 items-center w-full px-1">
          <div className="w-full aspect-square rounded-2xl overflow-hidden shadow-lg border border-neutral-800 bg-neutral-950 relative">
            <img 
              src={albumCover} 
              alt={currentTrack?.album_title}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="relative w-full aspect-square flex items-center justify-center">
            <div 
              className={`w-36 h-36 sm:w-44 sm:h-44 rounded-full bg-gradient-to-tr from-neutral-950 via-neutral-900 to-neutral-950 border-[4px] sm:border-[5px] border-neutral-950 shadow-2xl flex items-center justify-center relative transition-transform duration-500 ${
                isPlaying ? 'animate-spin' : ''
              }`}
              style={{ animationDuration: '4s' }}
            >
              <div className="absolute inset-3 rounded-full border border-neutral-800/60 pointer-events-none"></div>
              <div className="absolute inset-6 rounded-full border border-neutral-800/40 pointer-events-none"></div>
              <div className="absolute inset-9 rounded-full border border-neutral-800/30 pointer-events-none"></div>

              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-emerald-600 border-2 border-neutral-900 flex flex-col items-center justify-center shadow-inner text-center p-0.5">
                <span className="text-[7px] font-bold text-white uppercase tracking-tighter truncate w-full px-1">
                  {currentTrack?.album_title || 'VINYL'}
                </span>
                <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-neutral-950 mt-0.5"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Thông tin bài hát */}
        <div className="text-center mt-5 mb-2 w-full px-2">
          <h1 className="text-sm sm:text-base font-bold text-white px-2 tracking-wide leading-snug break-words">
            {currentTrack?.title}
          </h1>
          <div className="flex items-center justify-center gap-1.5 text-xs text-neutral-400 mt-1.5 px-2 flex-wrap">
            <span className="text-emerald-400 font-medium">
              {currentTrack?.artist}
            </span> 
            <span className="text-neutral-600">•</span> 
            <span>
              {currentTrack?.album_title}
            </span>
          </div>
        </div>

        {/* Thanh tiến trình chuẩn Spotify */}
        <div className="w-full px-3 mt-3 mb-1">
          <div 
            onClick={handleProgressBarClick}
            className="w-full h-1.5 bg-neutral-700/80 rounded-full cursor-pointer relative group flex items-center"
          >
            <div 
              className="h-full bg-emerald-400 rounded-full relative pointer-events-none transition-all duration-100"
              style={{ width: `${progressPercent}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
          </div>

          <div className="flex justify-between items-center text-[11px] font-mono text-neutral-400 mt-1.5">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Bộ điều khiển */}
        <div className="flex items-center justify-center gap-4 sm:gap-5 my-1 sm:my-2">
          <button 
            onClick={handlePrev}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center text-white text-xs sm:text-sm transition-all transform active:scale-95 shadow-md"
            title="Bài trước"
          >
            ⏮
          </button>

          <button 
            onClick={togglePlay}
            className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-emerald-500 hover:bg-emerald-400 flex items-center justify-center text-neutral-950 font-bold transition-all transform active:scale-95 shadow-lg shadow-emerald-500/20 text-base sm:text-lg"
            title={isPlaying ? 'Tạm dừng' : 'Phát nhạc'}
          >
            {isPlaying ? '⏸' : '▶'}
          </button>
          
          <button 
            onClick={handleNext}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center text-white text-xs sm:text-sm transition-all transform active:scale-95 shadow-md"
            title="Bài tiếp"
          >
            ⏭
          </button>
        </div>

        {/* Phần bên dưới: Tiêu đề + Icon mở Playlist */}
        <div className="w-full mt-4 sm:mt-5 border-t border-neutral-800/80 pt-3 sm:pt-4">
          <div className="flex items-center justify-between w-full mb-2.5 px-1">
            <h3 className="text-[10px] sm:text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
              Danh sách phát tuần tự trong Album
            </h3>
            
            <button
              onClick={() => setShowPlaylist(true)}
              className="p-1.5 rounded-lg bg-neutral-800 hover:bg-emerald-500/20 hover:text-emerald-400 text-neutral-300 transition-colors flex items-center justify-center"
              title="Mở danh sách phát"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="5" y="4" width="14" height="4" rx="2" fill="currentColor" />
                <line x1="5" y1="12" x2="19" y2="12" strokeLinecap="round" />
                <line x1="5" y1="17" x2="19" y2="17" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          {currentTrack && (
            <div className="text-xs p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-3">
              <span className="text-[11px] text-neutral-500 font-mono shrink-0 font-bold">
                {currentIndex < 9 ? `0${currentIndex + 1}` : currentIndex + 1}
              </span>
              <div className="flex flex-col flex-1 min-w-0">
                <span className="font-semibold text-xs tracking-wide leading-snug break-words text-emerald-400">
                  {currentTrack.title}
                </span>
                <span className="text-[10px] text-neutral-400 mt-0.5 truncate">
                  {currentTrack.artist}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Popup Playlist */}
        {showPlaylist && (
          <div className="absolute inset-0 bg-neutral-950/95 backdrop-blur-md z-20 p-4 sm:p-6 flex flex-col rounded-3xl animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800 mb-3">
              <div className="flex items-center gap-2">
                <span className="text-emerald-400">📋</span>
                <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                  Danh sách bài hát
                </h3>
              </div>
              <button
                onClick={() => setShowPlaylist(false)}
                className="w-8 h-8 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-300 flex items-center justify-center font-bold text-sm transition-colors"
              >
                ✕
              </button>
            </div>

            <ul className="space-y-2 overflow-y-auto flex-1 pr-1">
              {tracks.map((t, idx) => (
                <li 
                  key={t.id}
                  onClick={() => {
                    playTrack(idx);
                    setShowPlaylist(false);
                  }}
                  className={`text-xs p-3 rounded-xl cursor-pointer transition-colors flex items-center gap-3 ${
                    currentIndex === idx 
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold' 
                      : 'hover:bg-neutral-800/80 text-neutral-300 border border-transparent'
                  }`}
                >
                  <span className="text-[11px] text-neutral-500 font-mono shrink-0 font-bold">
                    {idx < 9 ? `0${idx + 1}` : idx + 1}
                  </span>
                  
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className={`font-semibold text-xs tracking-wide leading-snug break-words ${currentIndex === idx ? 'text-emerald-400' : 'text-white'}`}>
                      {t.title}
                    </span>
                    <span className="text-[10px] text-neutral-400 mt-0.5 truncate">
                      {t.artist}
                    </span>
                  </div>

                  {currentIndex === idx && (
                    <span className="text-xs text-emerald-400 font-bold shrink-0">▶</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

      </div>
    </div>
  );
}