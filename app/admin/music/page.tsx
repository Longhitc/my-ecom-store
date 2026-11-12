'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

interface Album {
  id: string;
  album_title: string;
  cover_image: string;
  created_at?: number;
  updated_at?: number;
}

interface Track {
  id: string;
  title: string;
  artist: string;
  album_id: string | null;
  audio_url: string;
  track_order: number;
}

const ITEMS_PER_PAGE = 8; // Phân trang 8 bài 1 trang

export default function AdminMusicPage() {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [tracks, setTracks] = useState<(Track & { album_title?: string; cover_image?: string })[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');

  // Form State (Thêm mới)
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [albumId, setAlbumId] = useState('');
  const [trackOrder, setTrackOrder] = useState<number>(1);
  const [audioFile, setAudioFile] = useState<File | null>(null);

  // State Tạo Album Mới
  const [showNewAlbumModal, setShowNewAlbumModal] = useState(false);
  const [newAlbumTitle, setNewAlbumTitle] = useState('');
  const [newAlbumCover, setNewAlbumCover] = useState('');
  const [creatingAlbum, setCreatingAlbum] = useState(false);

  // State Chỉnh Sửa Bài Hát
  const [editingTrack, setEditingTrack] = useState<Track | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editArtist, setEditArtist] = useState('');
  const [editAlbumId, setEditAlbumId] = useState('');
  const [editTrackOrder, setEditTrackOrder] = useState<number>(1);
  const [updatingTrack, setUpdatingTrack] = useState(false);

  // Phân trang
  const [currentPage, setCurrentPage] = useState(1);

  // Quản lý trạng thái đang phát để đồng bộ đĩa xoay trong thanh player
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement | null }>({});

  // Tải danh sách Album và Tracks từ API
  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/music');
      if (res.ok) {
        const data = await res.json();
        const loadedAlbums: Album[] = data.albums || [];
        const loadedTracks: (Track & { album_title?: string; cover_image?: string })[] = data.tracks || [];

        setAlbums(loadedAlbums);

        // Sắp xếp danh sách bài hát theo track_order GIẢM DẦN
        const sortedTracks = [...loadedTracks].sort((a, b) => (b.track_order || 0) - (a.track_order || 0));
        setTracks(sortedTracks);

        // Tự động tính track_order = max(track_order) + 1
        const maxOrder = loadedTracks.length > 0 
          ? Math.max(...loadedTracks.map(t => Number(t.track_order) || 0)) 
          : 0;
        setTrackOrder(maxOrder + 1);
      }
    } catch (error) {
      console.error('Lỗi tải dữ liệu nhạc:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Xử lý upload qua API Route server-side bảo mật
  const uploadAndSaveTrack = async (file: File, trackData: { id: string; album_id: string; title: string; artist: string; track_order: number }) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('id', trackData.id);
    formData.append('album_id', trackData.album_id);
    formData.append('title', trackData.title);
    formData.append('artist', trackData.artist);
    formData.append('track_order', trackData.track_order.toString());

    setUploadProgress('Đang xử lý tải file lên Cloudinary và lưu database...');
    const res = await fetch('/api/admin/music/upload', {
      method: 'POST',
      body: formData,
    });

    const responseText = await res.text();
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      throw new Error(`Server trả về lỗi không phải JSON: ${responseText}`);
    }

    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Upload hoặc lưu dữ liệu thất bại');
    }
    return data.audio_url;
  };

  // Xử lý tạo Album mới khớp cấu trúc bảng albums
  const handleCreateAlbum = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAlbumTitle.trim()) {
      alert('Vui lòng nhập tên album!');
      return;
    }

    try {
      setCreatingAlbum(true);
      const now = Date.now();
      const newAlbumPayload = {
        id: `album-${now}`,
        album_title: newAlbumTitle.trim(),
        cover_image: newAlbumCover.trim(),
        created_at: now,
        updated_at: now,
      };

      const res = await fetch('/api/admin/music/albums', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAlbumPayload),
      });

      if (!res.ok) throw new Error('Không thể tạo album mới');

      const data = await res.json();
      const createdAlbum = data.album || newAlbumPayload;

      setAlbums((prev) => [...prev, createdAlbum]);
      setAlbumId(createdAlbum.id);
      if (editingTrack) {
        setEditAlbumId(createdAlbum.id);
      }
      
      setNewAlbumTitle('');
      setNewAlbumCover('');
      setShowNewAlbumModal(false);
      alert('Tạo album thành công! 🎉');
    } catch (error: any) {
      console.error(error);
      const now = Date.now();
      const fallbackAlbum: Album = {
        id: `album-${now}`,
        album_title: newAlbumTitle.trim(),
        cover_image: newAlbumCover.trim(),
        created_at: now,
        updated_at: now,
      };
      setAlbums((prev) => [...prev, fallbackAlbum]);
      setAlbumId(fallbackAlbum.id);
      if (editingTrack) {
        setEditAlbumId(fallbackAlbum.id);
      }
      setNewAlbumTitle('');
      setNewAlbumCover('');
      setShowNewAlbumModal(false);
    } finally {
      setCreatingAlbum(false);
    }
  };

  // Xử lý submit thêm bài hát
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!audioFile || !title) {
      alert('Vui lòng điền tên bài hát và chọn file audio (.mp3)!');
      return;
    }

    try {
      setUploading(true);

      const newTrackId = `track-${Date.now()}`;
      await uploadAndSaveTrack(audioFile, {
        id: newTrackId,
        album_id: albumId || '',
        title,
        artist,
        track_order: Number(trackOrder) || 1,
      });

      alert('Thêm bài hát thành công! 🎉');
      setTitle('');
      setArtist('');
      setAudioFile(null);
      setCurrentPage(1);
      fetchData();
    } catch (error: any) {
      console.error(error);
      alert(`Đã xảy ra lỗi: ${error.message}`);
    } finally {
      setUploading(false);
      setUploadProgress('');
    }
  };

  // Mở modal sửa bài hát
  const openEditModal = (track: Track) => {
    setEditingTrack(track);
    setEditTitle(track.title);
    setEditArtist(track.artist || '');
    setEditAlbumId(track.album_id || '');
    setEditTrackOrder(Number(track.track_order) || 1);
  };

  // Lưu thông tin cập nhật bài hát vào Turso
  const handleUpdateTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTrack || !editTitle.trim()) {
      alert('Tên bài hát không được để trống!');
      return;
    }

    try {
      setUpdatingTrack(true);
      const res = await fetch('/api/admin/music', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingTrack.id,
          album_id: editAlbumId || null,
          title: editTitle.trim(),
          artist: editArtist.trim(),
          track_order: Number(editTrackOrder) || 1,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Cập nhật thất bại');
      }

      alert('Cập nhật bài hát thành công! ✅');
      setEditingTrack(null);
      fetchData();
    } catch (error: any) {
      console.error(error);
      alert(`Lỗi khi cập nhật: ${error.message}`);
    } finally {
      setUpdatingTrack(false);
    }
  };

  // Phân trang tính toán
  const totalPages = Math.ceil(tracks.length / ITEMS_PER_PAGE) || 1;
  const paginatedTracks = tracks.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div className="mx-auto max-w-5xl px-3 sm:px-4 py-2 sm:py-3 space-y-3">
      {/* Header sát thanh Nav bar */}
      <div className="flex items-center justify-between gap-2 border-b border-neutral-200 dark:border-neutral-800 pb-2">
        <h1 className="text-sm sm:text-lg font-bold text-neutral-800 dark:text-white flex items-center gap-2">
          🎵 Quản lý Bài Hát & Album
        </h1>
        <Link
          href="/admin/store-menus"
          className="rounded-md bg-neutral-200 dark:bg-neutral-800 px-2.5 py-1 text-xs font-semibold text-neutral-800 dark:text-white transition hover:bg-neutral-300 dark:hover:bg-neutral-700 flex items-center gap-1"
        >
          ← Quay lại
        </Link>
      </div>

      {/* FORM THÊM BÀI HÁT - THU GỌN NGẮN GỌN */}
      <form onSubmit={handleSubmit} className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-3 space-y-2.5 shadow-xs">
        <div className="flex items-center justify-between">
          <h2 className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">Thêm bài hát mới</h2>
          <button
            type="button"
            onClick={() => setShowNewAlbumModal(true)}
            className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline font-medium"
          >
            + Tạo Album mới
          </button>
        </div>
        
        {/* Hàng 1: Album, Tên bài hát, Nghệ sĩ, Thứ tự */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 items-center">
          <div>
            <label className="block text-[10px] font-medium text-neutral-500 mb-0.5">Album</label>
            <select
              value={albumId}
              onChange={(e) => setAlbumId(e.target.value)}
              className="w-full rounded border border-neutral-300 dark:border-neutral-700 bg-transparent px-2 py-1.5 text-xs text-neutral-800 dark:text-white"
            >
              <option value="">-- Trống --</option>
              {albums.map((album) => (
                <option key={album.id} value={album.id} className="dark:bg-neutral-900">
                  {album.album_title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-medium text-neutral-500 mb-0.5">Tên bài hát *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full rounded border border-neutral-300 dark:border-neutral-700 bg-transparent px-2 py-1.5 text-xs text-neutral-800 dark:text-white"
              placeholder="Tên bài hát"
            />
          </div>

          <div>
            <label className="block text-[10px] font-medium text-neutral-500 mb-0.5">Nghệ sĩ</label>
            <input
              type="text"
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              className="w-full rounded border border-neutral-300 dark:border-neutral-700 bg-transparent px-2 py-1.5 text-xs text-neutral-800 dark:text-white"
              placeholder="Nghệ sĩ"
            />
          </div>

          <div>
            <label className="block text-[10px] font-medium text-neutral-500 mb-0.5">Thứ tự (Auto)</label>
            <input
              type="number"
              value={trackOrder}
              disabled
              className="w-full rounded border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-800/50 px-2 py-1.5 text-xs text-neutral-500 font-semibold cursor-not-allowed"
            />
          </div>
        </div>

        {/* Hàng 2: Chọn File MP3 và Nút Upload nằm chung 1 hàng ngang */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-end justify-between gap-2.5 pt-1">
          <div className="flex-1 min-w-0">
            <label className="block text-[10px] font-medium text-neutral-500 mb-0.5">File MP3 *</label>
            <input
              type="file"
              accept="audio/*"
              onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
              required
              className="w-full text-[11px] text-neutral-500 file:mr-2 file:py-1.5 file:px-2.5 file:rounded file:border-0 file:text-[10px] file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
            />
          </div>

          <div className="shrink-0">
            <button
              type="submit"
              disabled={uploading}
              className="w-full sm:w-auto rounded bg-blue-600 px-4 py-1.5 text-xs font-bold text-white shadow hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {uploading ? 'Đang xử lý...' : 'Upload MP3'}
            </button>
          </div>
        </div>

        {uploading && (
          <div className="text-[11px] text-blue-600 font-medium animate-pulse pt-1">
            ⏳ {uploadProgress}
          </div>
        )}
      </form>

      {/* MODAL TẠO ALBUM MỚI */}
      {showNewAlbumModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-4 space-y-3 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-800 dark:text-white">Tạo Album Mới</h3>
              <button
                type="button"
                onClick={() => setShowNewAlbumModal(false)}
                className="text-neutral-400 hover:text-neutral-600 text-xs font-bold"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleCreateAlbum} className="space-y-2.5">
              <div>
                <label className="block text-[11px] font-medium mb-1 text-neutral-600 dark:text-neutral-400">Tên Album *</label>
                <input
                  type="text"
                  value={newAlbumTitle}
                  onChange={(e) => setNewAlbumTitle(e.target.value)}
                  required
                  placeholder="VD: Top Hits 2026"
                  className="w-full rounded border border-neutral-300 dark:border-neutral-700 bg-transparent px-2.5 py-1.5 text-xs text-neutral-800 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium mb-1 text-neutral-600 dark:text-neutral-400">Link ảnh bìa (Cover Image URL)</label>
                <input
                  type="url"
                  value={newAlbumCover}
                  onChange={(e) => setNewAlbumCover(e.target.value)}
                  placeholder="https://example.com/cover.jpg"
                  className="w-full rounded border border-neutral-300 dark:border-neutral-700 bg-transparent px-2.5 py-1.5 text-xs text-neutral-800 dark:text-white"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewAlbumModal(false)}
                  className="rounded px-3 py-1 text-xs font-semibold text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={creatingAlbum}
                  className="rounded bg-blue-600 px-3.5 py-1 text-xs font-bold text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {creatingAlbum ? 'Đang tạo...' : 'Tạo Album'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CHỈNH SỬA BÀI HÁT */}
      {editingTrack && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-4 space-y-3 shadow-xl">
            <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-800 dark:text-white">
                ✏️ Chỉnh Sửa Bài Hát
              </h3>
              <button
                type="button"
                onClick={() => setEditingTrack(null)}
                className="text-neutral-400 hover:text-neutral-600 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateTrack} className="space-y-2.5">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-medium text-neutral-600 dark:text-neutral-400">Album</label>
                  <button
                    type="button"
                    onClick={() => setShowNewAlbumModal(true)}
                    className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline font-medium"
                  >
                    + Thêm Album
                  </button>
                </div>
                <select
                  value={editAlbumId}
                  onChange={(e) => setEditAlbumId(e.target.value)}
                  className="w-full rounded border border-neutral-300 dark:border-neutral-700 bg-transparent px-2.5 py-1.5 text-xs text-neutral-800 dark:text-white"
                >
                  <option value="" className="dark:bg-neutral-900">-- Chưa phân loại Album --</option>
                  {albums.map((album) => (
                    <option key={album.id} value={album.id} className="dark:bg-neutral-900">
                      {album.album_title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium mb-1 text-neutral-600 dark:text-neutral-400">Tên bài hát *</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  required
                  className="w-full rounded border border-neutral-300 dark:border-neutral-700 bg-transparent px-2.5 py-1.5 text-xs text-neutral-800 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="block text-[11px] font-medium mb-1 text-neutral-600 dark:text-neutral-400">Nghệ sĩ</label>
                  <input
                    type="text"
                    value={editArtist}
                    onChange={(e) => setEditArtist(e.target.value)}
                    className="w-full rounded border border-neutral-300 dark:border-neutral-700 bg-transparent px-2.5 py-1.5 text-xs text-neutral-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium mb-1 text-neutral-600 dark:text-neutral-400">Thứ tự</label>
                  <input
                    type="number"
                    value={editTrackOrder}
                    onChange={(e) => setEditTrackOrder(Number(e.target.value))}
                    className="w-full rounded border border-neutral-300 dark:border-neutral-700 bg-transparent px-2.5 py-1.5 text-xs text-neutral-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingTrack(null)}
                  className="rounded px-3 py-1.5 text-xs font-semibold text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={updatingTrack}
                  className="rounded bg-blue-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {updatingTrack ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DANH SÁCH BÀI HÁT */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
            Danh sách bài hát ({tracks.length})
          </h2>
          {totalPages > 1 && (
            <span className="text-[11px] text-neutral-400">
              Trang {currentPage} / {totalPages}
            </span>
          )}
        </div>
        
        {loading ? (
          <p className="text-xs text-neutral-400">Đang tải danh sách...</p>
        ) : tracks.length === 0 ? (
          <p className="text-xs text-neutral-400 border border-dashed rounded-lg p-5 text-center dark:border-neutral-800">Chưa có bài hát nào.</p>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-1.5">
              {paginatedTracks.map((track) => {
                const isPlaying = playingTrackId === track.id;

                return (
                  <div key={track.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-2 py-1 shadow-2xs">
                    
                    {/* 1. KHUNG BÊN TRÁI: ẢNH ALBUM VUÔNG NGUYÊN BẢN */}
                    <div className="flex items-center gap-2.5 min-w-0">
                      {track.cover_image ? (
                        <img src={track.cover_image} alt={track.album_title} className="w-8 h-8 rounded object-cover shrink-0" />
                      ) : (
                        <div className="w-8 h-8 rounded bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center text-xs shrink-0">🎵</div>
                      )}
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-neutral-800 dark:text-white truncate">
                          {track.track_order}. {track.title}
                        </div>
                        <div className="text-[10px] text-neutral-400 truncate">
                          {track.artist || 'Không rõ'} • <span className="text-blue-500">{track.album_title || 'Chưa phân loại Album'}</span>
                        </div>
                      </div>
                    </div>

                    {/* 2. KHUNG BÊN PHẢI: PLAYER + NÚT SỬA */}
                    <div className="flex items-center gap-1.5 w-full sm:w-auto shrink-0 justify-between sm:justify-end">
                      <div className="flex items-center gap-2 bg-neutral-100 dark:bg-neutral-800/80 px-2.5 py-1 rounded-md flex-1 sm:flex-initial justify-between">
                        {/* Đĩa than mini có 2 vệt sáng xanh - hồng */}
                        <div 
                          className={`w-7 h-7 rounded-full bg-neutral-950 border border-neutral-700 shadow-sm flex items-center justify-center relative shrink-0 overflow-hidden ${
                            isPlaying ? 'animate-spin' : ''
                          }`}
                          style={{ animationDuration: '2.5s' }}
                        >
                          <div className="absolute top-0 right-1 w-1.5 h-3 bg-gradient-to-b from-emerald-400 to-transparent rounded-full transform rotate-45"></div>
                          <div className="absolute bottom-0 left-1 w-1.5 h-3 bg-gradient-to-t from-pink-500 to-transparent rounded-full transform rotate-45"></div>

                          <div className="w-3 h-3 rounded-full bg-emerald-500 border border-neutral-900 flex items-center justify-center z-10 shadow-inner">
                            <div className="w-1 h-1 rounded-full bg-neutral-950"></div>
                          </div>
                        </div>

                        {/* Thanh audio controls kích thước chuẩn gốc */}
                        <audio
                          ref={(el) => { audioRefs.current[track.id] = el; }}
                          controls
                          src={track.audio_url}
                          className="h-7 w-[180px] sm:w-44 shrink-0"
                          onPlay={() => {
                            Object.keys(audioRefs.current).forEach((id) => {
                              if (id !== track.id && audioRefs.current[id]) {
                                audioRefs.current[id]?.pause();
                              }
                            });
                            setPlayingTrackId(track.id);
                          }}
                          onPause={() => {
                            if (playingTrackId === track.id) {
                              setPlayingTrackId(null);
                            }
                          }}
                          onEnded={() => {
                            if (playingTrackId === track.id) {
                              setPlayingTrackId(null);
                            }
                          }}
                        />
                      </div>

                      {/* Nút Sửa */}
                      <button
                        type="button"
                        onClick={() => openEditModal(track)}
                        className="rounded-md border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 px-2.5 py-1.5 text-[11px] font-semibold text-neutral-700 dark:text-neutral-200 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 dark:hover:bg-blue-950/50 dark:hover:text-blue-400 transition shrink-0"
                        title="Chỉnh sửa thông tin bài hát"
                      >
                        Sửa
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>

            {/* Thanh điều hướng phân trang */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-1.5 pt-2">
                <button
                  type="button"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="rounded px-2.5 py-1 text-xs font-semibold border border-neutral-200 dark:border-neutral-800 disabled:opacity-40 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
                >
                  ← Trước
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    type="button"
                    onClick={() => setCurrentPage(page)}
                    className={`rounded px-2.5 py-1 text-xs font-semibold transition ${
                      currentPage === page
                        ? 'bg-blue-600 text-white'
                        : 'border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="rounded px-2.5 py-1 text-xs font-semibold border border-neutral-200 dark:border-neutral-800 disabled:opacity-40 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
                >
                  Sau →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}