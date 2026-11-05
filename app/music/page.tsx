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
    <div className="container mx-auto px-4 py-8 min-h-[80vh] flex flex-col items-center justify-center">
      
      {/* Khung chính lọt thỏm, chuẩn max-w-xl y hệt ảnh mẫu của anh */}
      <div className="w-full max-w-xl bg-neutral-900 border border-neutral-800 rounded-3xl p-6 shadow-2xl flex flex-col items-center">
        
        {/* Tiêu đề trên cùng */}
        <div className="flex items-center gap-2 mb-6 w-full justify-center">
          <span className="text-emerald-400 text-sm">🎵</span>
          <span className="text-[11px] uppercase tracking-[0.25em] text-emerald-400 font-semibold">
            VINTAGE VINYL EXPERIENCE
          </span>
        </div>

        {/* Bố cục 2 cột cân đối: Trái Ảnh bìa, Phải Đĩa than */}
        <div className="grid grid-cols-2 gap-5 items-center w-full px-2">
          
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
              className={`w-40 h-40 sm:w-44 sm:h-44 rounded-full bg-gradient-to-tr from-neutral-950 via-neutral-900 to-neutral-950 border-[5px] border-neutral-950 shadow-2xl flex items-center justify-center relative transition-transform duration-500 ${
                isPlaying ? 'animate-spin' : ''
              }`}
              style={{ animationDuration: '4s' }}
            >
              {/* Rãnh đĩa than */}
              <div className="absolute inset-3 rounded-full border border-neutral-800/60 pointer-events-none"></div>
              <div className="absolute inset-6 rounded-full border border-neutral-800/40 pointer-events-none"></div>
              <div className="absolute inset-9 rounded-full border border-neutral-800/30 pointer-events-none"></div>

              {/* Nhãn đĩa tâm màu xanh lá */}
              <div className="w-14 h-14 rounded-full bg-emerald-600 border-2 border-neutral-900 flex flex-col items-center justify-center shadow-inner text-center p-0.5">
                <span className="text-[7px] font-bold text-white uppercase tracking-tighter truncate w-full">
                  {currentTrack?.album_title || 'VINYL'}
                </span>
                <div className="w-2.5 h-2.5 rounded-full bg-neutral-950 mt-0.5"></div>
              </div>
            </div>
          </div>

        </div>

        {/* Thông tin bài hát & Album */}
        <div className="text-center mt-6 mb-5 w-full px-2">
          <h1 className="text-base font-bold text-white truncate">{currentTrack?.title}</h1>
          <p className="text-xs text-neutral-400 mt-1">
            <span className="text-emerald-400 font-medium">{currentTrack?.artist}</span> 
            <span className="mx-1.5">•</span> 
            <span>{currentTrack?.album_title}</span>
          </p>
        </div>

        {/* Bộ điều khiển (Controls): Nút lùi, Play tròn xanh ở giữa, Nút tiến */}
        <div className="flex items-center justify-center gap-5 my-2">
          <button 
            onClick={handlePrev}
            className="w-10 h-10 rounded-full bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center text-white text-sm transition-all transform active:scale-95 shadow-md"
            title="Bài trước"
          >
            ⏮
          </button>

          <button 
            onClick={togglePlay}
            className="w-14 h-14 rounded-full bg-emerald-500 hover:bg-emerald-400 flex items-center justify-center text-neutral-950 font-bold transition-all transform active:scale-95 shadow-lg shadow-emerald-500/20 text-lg"
            title={isPlaying ? 'Tạm dừng' : 'Phát nhạc'}
          >
            {isPlaying ? '⏸' : '▶'}
          </button>
          
          <button 
            onClick={handleNext}
            className="w-10 h-10 rounded-full bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center text-white text-sm transition-all transform active:scale-95 shadow-md"
            title="Bài tiếp"
          >
            ⏭
          </button>
        </div>

        {/* Danh sách bài hát (Playlist) bên dưới */}
        <div className="w-full mt-5 border-t border-neutral-800/80 pt-4">
          <h3 className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-2.5">Danh sách phát tuần tự trong Album</h3>
          <ul className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
            {tracks.map((t, idx) => (
              <li 
                key={t.id}
                onClick={() => {
                  if (audioRef.current) audioRef.current.pause();
                  setIsPlaying(false);
                  setCurrentIndex(idx);
                }}
                className={`text-xs p-2.5 rounded-xl cursor-pointer transition-colors flex justify-between items-center ${
                  currentIndex === idx 
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                    : 'hover:bg-neutral-800/60 text-neutral-300'
                }`}
              >
                <div className="flex items-center gap-2 truncate pr-2">
                  <span className="text-[10px] text-neutral-500 font-mono">0{idx + 1}</span>
                  <span className="truncate font-medium">{t.title}</span>
                </div>
                <span className="text-[10px] text-neutral-500">{t.artist}</span>
              </li>
            ))}
          </ul>
        </div>

      </div>
    </div>
  );
}