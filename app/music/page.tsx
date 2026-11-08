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

  const [currentTab, setCurrentTab] = useState<'player' | 'home' | 'search' | 'library' | 'create'>('player');
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

  // Lấy danh sách các album độc nhất từ data tracks
  const uniqueAlbums = Array.from(
    new Map(tracks.map(t => [t.album_title || 'Tuyển tập', { title: t.album_title || 'Tuyển tập', cover: t.cover_image || albumCover }])).values()
  );

  return (
    <div className="container mx-auto px-3 py-2 min-h-[80vh] flex flex-col items-center justify-start">
      
      {/* Khung đen cố định chiều cao h-[630px] chuẩn player */}
      <div className="w-full max-w-xl h-[630px] bg-neutral-900 border border-neutral-800 rounded-3xl p-4 sm:p-7 shadow-2xl flex flex-col items-center relative overflow-hidden">
        
        {/* NỘI DUNG BÊN TRONG KHUNG ĐEN */}
        <div className="w-full h-full flex flex-col relative overflow-hidden">
          
          {/* 1. GIAO DIỆN PLAYER */}
          {currentTab === 'player' && (
            <div className="w-full h-full flex flex-col items-center animate-fadeIn justify-between pb-2">
              <div className="w-full flex flex-col items-center">
                
                {/* Thanh "Đang phát từ Album" và nút mũi tên quay về trang chủ */}
                <div className="flex items-center justify-between mb-3 w-full px-1">
                  <button 
                    onClick={() => setCurrentTab('home')}
                    className="text-neutral-300 hover:text-white p-1 rounded-full hover:bg-neutral-800 transition-colors flex items-center"
                    title="Quay lại màn hình chính"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  <div className="text-center flex flex-col items-center">
                    <span className="text-[9px] uppercase tracking-wider text-neutral-400 font-medium">
                      Đang phát từ Album
                    </span>
                    <span className="text-xs font-bold text-white tracking-wide truncate max-w-[220px]">
                      {currentTrack?.album_title || 'Tuyển tập'}
                    </span>
                  </div>

                  <div className="w-5"></div>
                </div>

                {/* Tiêu đề VINTAGE VINYL EXPERIENCE */}
                <div className="flex items-center gap-2 mb-3.5 w-full justify-center">
                  <span className="text-emerald-400 text-sm">🎵</span>
                  <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.2em] sm:tracking-[0.25em] text-emerald-400 font-semibold">
                    VINTAGE VINYL EXPERIENCE
                  </span>
                </div>

                {/* Bố cục 2 cột Trái/Phải */}
                <div className="grid grid-cols-2 gap-4 sm:gap-5 items-center w-full px-1">
                  <div className="w-full aspect-square rounded-2xl overflow-hidden shadow-lg border border-neutral-800 bg-neutral-950 relative max-h-[185px] mx-auto">
                    <img 
                      src={albumCover} 
                      alt={currentTrack?.album_title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="relative w-full aspect-square flex items-center justify-center max-h-[185px]">
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

                {/* Thông tin bài hát & Tên ca sĩ (Tĩnh, không chạy chữ) */}
                <div className="text-center mt-4 mb-2 w-full px-4">
                  <h1 className="text-sm sm:text-base font-bold text-white px-2 tracking-wide leading-snug break-words">
                    {currentTrack?.title}
                  </h1>

                  <div className="w-full flex justify-center mt-1 px-4">
                    <span className="text-xs font-medium text-emerald-400 truncate max-w-[280px] sm:max-w-[320px]">
                      {currentTrack?.artist}
                    </span>
                  </div>
                </div>

                {/* Thanh tiến trình chuẩn Spotify */}
                <div className="w-full px-3 mt-2 mb-2">
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

                  <div className="flex justify-between items-center text-[11px] font-mono text-neutral-400 mt-1">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>

                {/* Bộ điều khiển */}
                <div className="flex items-center justify-center gap-4 sm:gap-5 my-2">
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

                {/* Danh sách phát tuần tự trong album */}
                <div className="w-full mt-3.5 border-t border-neutral-800/80 pt-3">
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
                    <div className="text-xs p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-3">
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

                  <ul className="space-y-2 overflow-y-auto flex-1 pr-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
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
          )}

          {/* 2. MÀN HÌNH TRANG CHỦ (HOME) - TẤT CẢ */}
          {currentTab === 'home' && (
            <div className="w-full h-full flex flex-col animate-fadeIn p-1 text-white pb-16 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              <div className="flex items-center justify-between w-full mb-3 px-1 sticky top-0 bg-neutral-900/95 backdrop-blur py-1 z-10">
                <h2 className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Tất Cả</h2>
                <button onClick={() => setCurrentTab('player')} className="text-[10px] bg-neutral-800 px-2.5 py-1 rounded-full text-emerald-400 font-semibold hover:bg-neutral-700">
                  🎵 Mở Player
                </button>
              </div>

              <h3 className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider w-full text-left mb-1.5 px-1">Albums</h3>
              <div className="grid grid-cols-2 gap-2.5 w-full mb-3">
                {uniqueAlbums.map((album, idx) => (
                  <div 
                    key={idx}
                    onClick={() => {
                      const firstTrackIdx = tracks.findIndex(t => t.album_title === album.title);
                      if (firstTrackIdx !== -1) playTrack(firstTrackIdx);
                      setCurrentTab('player');
                    }}
                    className="bg-neutral-800/80 hover:bg-neutral-800 p-2 rounded-xl cursor-pointer flex items-center gap-2 transition-colors border border-neutral-700/50"
                  >
                    <img src={album.cover} alt={album.title} className="w-9 h-9 rounded-lg object-cover" />
                    <div className="flex flex-col min-w-0">
                      <span className="text-[11px] font-bold truncate text-white">{album.title}</span>
                      <span className="text-[9px] text-emerald-400 truncate">Album tuyển tập</span>
                    </div>
                  </div>
                ))}
              </div>

              <h3 className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider w-full text-left mb-1.5 px-1">Đề xuất gần đây</h3>
              <div className="w-full space-y-1.5 pr-1">
                {tracks.map((t, idx) => (
                  <div 
                    key={t.id}
                    onClick={() => { playTrack(idx); setCurrentTab('player'); }}
                    className="flex items-center justify-between p-1.5 rounded-xl hover:bg-neutral-800 cursor-pointer text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-neutral-500 font-mono text-[10px]">{idx + 1}</span>
                      <div className="truncate">
                        <p className="font-semibold text-white text-[11px] truncate">{t.title}</p>
                        <p className="text-[9px] text-neutral-400">{t.artist}</p>
                      </div>
                    </div>
                    <span className="text-emerald-400 text-[10px]">Phát ▶</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. MÀN HÌNH TÌM KIẾM (SEARCH) */}
          {currentTab === 'search' && (
            <div className="w-full h-full flex flex-col animate-fadeIn p-1 text-white pb-16 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              <h2 className="text-xs font-bold mb-3 text-emerald-400 uppercase tracking-widest sticky top-0 bg-neutral-900/95 py-1 z-10">Tìm Kiếm</h2>
              <input 
                type="text" 
                placeholder="Bạn muốn nghe bài gì, nghệ sĩ nào?" 
                className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 mb-3"
              />
              <div className="w-full text-left">
                <p className="text-[10px] text-neutral-400 mb-2">Duyệt tìm tất cả</p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-gradient-to-br from-pink-600 to-purple-700 p-2.5 rounded-xl font-bold text-xs">Nhạc Việt</div>
                  <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-2.5 rounded-xl font-bold text-xs">TikTok Hits</div>
                  <div className="bg-gradient-to-br from-emerald-600 to-teal-700 p-2.5 rounded-xl font-bold text-xs">Ballad Buồn</div>
                  <div className="bg-gradient-to-br from-amber-600 to-orange-700 p-2.5 rounded-xl font-bold text-xs">Remix Sôi Động</div>
                </div>
              </div>
            </div>
          )}

          {/* 4. MÀN HÌNH THƯ VIỆN (LIBRARY) */}
          {currentTab === 'library' && (
            <div className="w-full h-full flex flex-col animate-fadeIn p-1 text-white pb-16 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              <div className="flex items-center justify-between w-full mb-3 px-1 sticky top-0 bg-neutral-900/95 backdrop-blur py-1 z-10">
                <h2 className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Thư Viện</h2>
              </div>
              <div className="grid grid-cols-2 gap-2.5 w-full">
                {uniqueAlbums.map((album, idx) => (
                  <div 
                    key={idx}
                    onClick={() => {
                      const firstTrackIdx = tracks.findIndex(t => t.album_title === album.title);
                      if (firstTrackIdx !== -1) playTrack(firstTrackIdx);
                      setCurrentTab('player');
                    }}
                    className="bg-neutral-800/80 hover:bg-neutral-800 p-2.5 rounded-xl cursor-pointer flex items-center gap-2.5 transition-colors border border-neutral-700/50"
                  >
                    <img src={album.cover} alt={album.title} className="w-10 h-10 rounded-lg object-cover" />
                    <div className="flex flex-col min-w-0">
                      <span className="text-[11px] font-bold truncate text-white">{album.title}</span>
                      <span className="text-[9px] text-emerald-400 truncate">Album tuyển tập</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 5. MÀN HÌNH TẠO ALBUM (CREATE ALBUM) */}
          {currentTab === 'create' && (
            <div className="w-full h-full flex flex-col animate-fadeIn p-2 text-white text-center pb-16 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              <h2 className="text-xs font-bold mb-3 text-emerald-400 uppercase tracking-widest sticky top-0 bg-neutral-900/95 py-1 z-10">Tạo Album Mới</h2>
              <div className="w-full space-y-2.5 text-left">
                <div>
                  <label className="text-[9px] text-neutral-400 uppercase font-semibold">Tên Album</label>
                  <input type="text" placeholder="Nhập tên album của bạn..." className="w-full bg-neutral-800 border border-neutral-700 rounded-xl p-2 text-xs text-white mt-1 focus:outline-none focus:border-emerald-500" />
                </div>
                <div>
                  <label className="text-[9px] text-neutral-400 uppercase font-semibold">Mô tả / Tuyển tập</label>
                  <input type="text" placeholder="Nhập mô tả album..." className="w-full bg-neutral-800 border border-neutral-700 rounded-xl p-2 text-xs text-white mt-1 focus:outline-none focus:border-emerald-500" />
                </div>
                <button onClick={() => alert('Đã tạo album thành công!')} className="w-full py-2.5 bg-emerald-500 text-neutral-950 font-bold rounded-xl text-xs hover:bg-emerald-400 transition-colors mt-2">
                  Lưu & Tạo Album
                </button>
              </div>
            </div>
          )}

        </div>

        {/* THANH MENU DƯỚI CÙNG: NẰM GỌN TRONG ĐÁY KHUNG ĐEN KHI KHÔNG Ở PLAYER */}
        {currentTab !== 'player' && (
          <div className="absolute bottom-0 left-0 right-0 bg-neutral-950/95 backdrop-blur-md border-t border-neutral-800/80 py-2.5 px-6 z-30 flex justify-around items-center rounded-b-3xl">
            <button 
              onClick={() => setCurrentTab('home')}
              className={`flex flex-col items-center gap-0.5 transition-colors ${currentTab === 'home' ? 'text-emerald-400 font-bold' : 'text-neutral-400 hover:text-white'}`}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 3L2 12h3v8h6v-6h2v6h6v-8h3L12 3z"/>
              </svg>
              <span className="text-[9px]">Trang chủ</span>
            </button>

            <button 
              onClick={() => setCurrentTab('search')}
              className={`flex flex-col items-center gap-0.5 transition-colors ${currentTab === 'search' ? 'text-emerald-400 font-bold' : 'text-neutral-400 hover:text-white'}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
              <span className="text-[9px]">Tìm kiếm</span>
            </button>

            <button 
              onClick={() => setCurrentTab('library')}
              className={`flex flex-col items-center gap-0.5 transition-colors ${currentTab === 'library' ? 'text-emerald-400 font-bold' : 'text-neutral-400 hover:text-white'}`}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0-2-.9-2-2V4c0-1.1-.9-2-2-2zm0 14H8V4h12v12z"/>
              </svg>
              <span className="text-[9px]">Thư viện</span>
            </button>

            <button 
              onClick={() => setCurrentTab('create')}
              className={`flex flex-col items-center gap-0.5 transition-colors ${currentTab === 'create' ? 'text-emerald-400 font-bold' : 'text-neutral-400 hover:text-white'}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/>
              </svg>
              <span className="text-[9px]">Tạo Album</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
}