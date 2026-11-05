'use client';

import { useEffect, useRef, useState } from 'react';

interface Track {
  id: string;
  title: string;
  artist: string;
  audio_url: string;
  album_title: string;
  cover_image?: string;
  track_order: number;
}

export default function MusicPage() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(true);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Gọi API lấy dữ liệu nhạc từ Turso
  useEffect(() => {
    fetch('/api/music')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data.length > 0) {
          setTracks(data.data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Lỗi fetch API music:', err);
        setLoading(false);
      });
  }, []);

  const currentTrack = tracks[currentIndex];

  // Quản lý phát nhạc HTML5 Audio
  useEffect(() => {
    if (!currentTrack) return;

    audioRef.current = new Audio(currentTrack.audio_url);
    
    audioRef.current.onended = () => {
      handleNext();
    };

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [currentIndex, tracks]);

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch((err) => console.error('Lỗi phát audio:', err));
      setIsPlaying(true);
    }
  };

  const handleNext = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setIsPlaying(false);
    setCurrentIndex((prev) => (prev + 1) % tracks.length);
  };

  const handlePrev = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setIsPlaying(false);
    setCurrentIndex((prev) => (prev - 1 + tracks.length) % tracks.length);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 min-h-[75vh] flex items-center justify-center text-emerald-400 font-serif">
        <div className="animate-pulse tracking-widest">Đang tải giai điệu...</div>
      </div>
    );
  }

  if (tracks.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12 min-h-[75vh] flex items-center justify-center text-emerald-400 font-serif">
        <div>Chưa có bài hát nào trong cơ sở dữ liệu.</div>
      </div>
    );
  }

  // Fallback ảnh bìa nếu link trong CSDL trống hoặc lỗi
  const albumCover = currentTrack?.cover_image && currentTrack.cover_image.startsWith('http')
    ? currentTrack.cover_image 
    : 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop';

  return (
    <div className="container mx-auto px-3 py-6 min-h-[80vh] flex flex-col items-center justify-center">
      
      {/* Khung chính lọt thỏm chuẩn max-w-xl */}
      <div className="w-full max-w-xl bg-neutral-900 border border-neutral-800 rounded-3xl p-4 sm:p-6 shadow-2xl flex flex-col items-center">
        
        {/* Tiêu đề trên cùng */}
        <div className="flex items-center gap-2 mb-4 sm:mb-6 w-full justify-center">
          <span className="text-emerald-400 text-sm">🎵</span>
          <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.2em] sm:tracking-[0.25em] text-emerald-400 font-semibold">
            VINTAGE VINYL EXPERIENCE
          </span>
        </div>

        {/* Bố cục 2 cột cân đối: Trái Ảnh bìa, Phải Đĩa than */}
        <div className="grid grid-cols-2 gap-3 sm:gap-5 items-center w-full px-1">
          
          {/* Cột 1: Ảnh bìa Album */}
          <div className="w-full aspect-square rounded-2xl overflow-hidden shadow-lg border border-neutral-800 bg-neutral-950 relative">
            <img 
              src={albumCover} 
              alt={currentTrack?.album_title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Cột 2: Đĩa than xoay tròn */}
          <div className="relative w-full aspect-square flex items-center justify-center">
            <div 
              className={`w-36 h-36 sm:w-44 sm:h-44 rounded-full bg-gradient-to-tr from-neutral-950 via-neutral-900 to-neutral-950 border-[4px] sm:border-[5px] border-neutral-950 shadow-2xl flex items-center justify-center relative transition-transform duration-500 ${
                isPlaying ? 'animate-spin' : ''
              }`}
              style={{ animationDuration: '4s' }}
            >
              {/* Rãnh đĩa than */}
              <div className="absolute inset-3 rounded-full border border-neutral-800/60 pointer-events-none"></div>
              <div className="absolute inset-6 rounded-full border border-neutral-800/40 pointer-events-none"></div>
              <div className="absolute inset-9 rounded-full border border-neutral-800/30 pointer-events-none"></div>

              {/* Nhãn đĩa tâm màu xanh lá */}
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-emerald-600 border-2 border-neutral-900 flex flex-col items-center justify-center shadow-inner text-center p-0.5">
                <span className="text-[7px] font-bold text-white uppercase tracking-tighter truncate w-full px-1">
                  {currentTrack?.album_title || 'VINYL'}
                </span>
                <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-neutral-950 mt-0.5"></div>
              </div>
            </div>
          </div>

        </div>

        {/* Thông tin bài hát chính: Cho phép xuống dòng full tên, không bị cụt đuôi */}
        <div className="text-center mt-5 mb-4 w-full px-2">
          <h1 className="text-sm sm:text-base font-bold text-white px-2 tracking-wide leading-snug break-words">
            {currentTrack?.title}
          </h1>
          <div className="flex items-center justify-center gap-1.5 text-xs text-neutral-400 mt-2 px-2 flex-wrap">
            <span className="text-emerald-400 font-medium">
              {currentTrack?.artist}
            </span> 
            <span className="text-neutral-600">•</span> 
            <span>
              {currentTrack?.album_title}
            </span>
          </div>
        </div>

        {/* Bộ điều khiển (Controls) */}
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

        {/* Danh sách bài hát (Playlist) bên dưới: Tách tên bài hát 1 dòng, tên ca sĩ 1 dòng riêng biệt */}
        <div className="w-full mt-4 sm:mt-5 border-t border-neutral-800/80 pt-3 sm:pt-4">
          <h3 className="text-[10px] sm:text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-2.5 px-1">
            Danh sách phát tuần tự trong Album
          </h3>
          <ul className="space-y-2 max-h-44 overflow-y-auto pr-1">
            {tracks.map((t, idx) => (
              <li 
                key={t.id}
                onClick={() => {
                  if (audioRef.current) audioRef.current.pause();
                  setIsPlaying(false);
                  setCurrentIndex(idx);
                }}
                className={`text-xs p-3 rounded-xl cursor-pointer transition-colors flex items-center gap-3 ${
                  currentIndex === idx 
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                    : 'hover:bg-neutral-800/60 text-neutral-300'
                }`}
              >
                <span className="text-[11px] text-neutral-500 font-mono shrink-0 font-bold">
                  {idx < 9 ? `0${idx + 1}` : idx + 1}
                </span>
                
                {/* Tách tên bài hát và tên ca sĩ thành 2 dòng rõ ràng */}
                <div className="flex flex-col flex-1 min-w-0">
                  <span className={`font-semibold text-xs tracking-wide leading-snug break-words ${currentIndex === idx ? 'text-emerald-400' : 'text-white'}`}>
                    {t.title}
                  </span>
                  <span className="text-[10px] text-neutral-400 mt-0.5 truncate">
                    {t.artist}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}