"use client";

import { useState } from 'react';

interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  coverUrl: string;
  audioUrl: string;
}

const sampleTracks: Track[] = [
  {
    id: '1',
    title: 'Giai Nhân Kỳ Án (Lofi Version)',
    artist: 'Vintage Sound',
    album: 'Retro Collection Vol. 1',
    coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&auto=format&fit=crop&q=80',
    audioUrl: '',
  },
  {
    id: '2',
    title: 'Hoài Niệm Xưa',
    artist: 'Classic Band',
    album: 'Retro Collection Vol. 1',
    coverUrl: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=300&auto=format&fit=crop&q=80',
    audioUrl: '',
  }
];

export default function VinylPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Đảm bảo luôn lấy được phần tử đầu tiên nếu mảng có dữ liệu, tránh undefined
  const currentTrack = sampleTracks[currentIndex] || sampleTracks[0];

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % sampleTracks.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + sampleTracks.length) % sampleTracks.length);
  };

  if (!currentTrack) return null;

  return (
    <div className="mx-auto max-w-md rounded-2xl border border-neutral-800 bg-neutral-900 p-6 text-white shadow-2xl">
      <h2 className="text-center text-xs font-bold uppercase tracking-widest text-emerald-400 mb-6">
        🎶 Vintage Vinyl Experience
      </h2>

      {/* Khu vực Đĩa quay và Bìa Album */}
      <div className="relative flex items-center justify-center h-64 mb-6">
        <div className="absolute left-4 w-48 h-48 rounded-lg overflow-hidden shadow-xl border border-neutral-700 z-10">
          <img 
            src={currentTrack.coverUrl} 
            alt={currentTrack.album} 
            className="w-full h-full object-cover"
          />
        </div>

        <div 
          className={`absolute right-6 w-52 h-52 rounded-full bg-neutral-950 border-4 border-neutral-800 shadow-2xl flex items-center justify-center transition-all duration-700 ${
            isPlaying ? 'translate-x-4 rotate-180 animate-spin-slow' : 'translate-x-0'
          }`}
          style={{ animationDuration: '6s' }}
        >
          <div className="absolute w-44 h-44 rounded-full border border-neutral-800/60"></div>
          <div className="absolute w-36 h-36 rounded-full border border-neutral-800/60"></div>
          <div className="absolute w-28 h-28 rounded-full border border-neutral-800/60"></div>
          
          <div className="w-16 h-16 rounded-full bg-emerald-600 border-2 border-white flex items-center justify-center overflow-hidden shadow-inner">
            <span className="text-[8px] font-bold text-white uppercase text-center px-1 truncate">
              {currentTrack.artist}
            </span>
          </div>
        </div>
      </div>

      <div className="text-center space-y-1 mb-6">
        <h3 className="text-base font-bold truncate">{currentTrack.title}</h3>
        <p className="text-xs text-neutral-400">{currentTrack.artist} • <span className="text-emerald-400">{currentTrack.album}</span></p>
      </div>

      <div className="flex items-center justify-center gap-6">
        <button 
          onClick={handlePrev}
          className="p-3 rounded-full bg-neutral-800 hover:bg-neutral-700 transition text-neutral-200"
        >
          ⏮
        </button>

        <button 
          onClick={() => setIsPlaying(!isPlaying)}
          className="p-4 rounded-full bg-emerald-500 hover:bg-emerald-400 transition text-black font-bold shadow-lg shadow-emerald-500/20"
        >
          {isPlaying ? '⏸' : '▶'}
        </button>

        <button 
          onClick={handleNext}
          className="p-3 rounded-full bg-neutral-800 hover:bg-neutral-700 transition text-neutral-200"
        >
          ⏭
        </button>
      </div>
    </div>
  );
}