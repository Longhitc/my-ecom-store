'use client';

import React, { createContext, useContext, useEffect, useRef, useState } from 'react';

interface Track {
  id: string;
  title: string;
  artist: string;
  audio_url: string;
  album_title: string;
  cover_image?: string;
  track_order: number;
}

interface AudioContextType {
  tracks: Track[];
  currentIndex: number;
  currentTrack: Track | null;
  isPlaying: boolean;
  hasStarted: boolean;
  currentTime: number;
  duration: number;
  playTrack: (index: number) => void;
  togglePlay: () => void;
  handleNext: () => void;
  handlePrev: () => void;
  seekTo: (time: number) => void;
}

const AudioContext = createContext<AudioContextType | null>(null);

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    fetch('/api/music')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data.length > 0) {
          setTracks(data.data);
        }
      })
      .catch((err) => console.error('Lỗi fetch music context:', err));
  }, []);

  const currentTrack = tracks[currentIndex] || null;

  // Cập nhật Media Session API để Android Auto trên ô tô hiển thị chuẩn Spotify (hình ảnh, tên bài hát, nghệ sĩ)
  useEffect(() => {
    if (!('mediaSession' in navigator)) return;

    if (currentTrack) {
      const artworkUrl = currentTrack.cover_image && currentTrack.cover_image.startsWith('http')
        ? currentTrack.cover_image
        : 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=512&auto=format&fit=crop';

      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentTrack.title,
        artist: currentTrack.artist,
        album: currentTrack.album_title,
        artwork: [
          { src: artworkUrl, sizes: '96x96', type: 'image/jpeg' },
          { src: artworkUrl, sizes: '128x128', type: 'image/jpeg' },
          { src: artworkUrl, sizes: '192x192', type: 'image/jpeg' },
          { src: artworkUrl, sizes: '256x256', type: 'image/jpeg' },
          { src: artworkUrl, sizes: '512x512', type: 'image/jpeg' },
        ],
      });
    }

    navigator.mediaSession.setActionHandler('play', () => {
      if (audioRef.current && currentTrack?.audio_url) {
        audioRef.current.play().catch((err) => console.error('Lỗi play mediaSession:', err));
        setIsPlaying(true);
        setHasStarted(true);
      }
    });

    navigator.mediaSession.setActionHandler('pause', () => {
      if (audioRef.current) {
        audioRef.current.pause();
        setIsPlaying(false);
      }
    });

    navigator.mediaSession.setActionHandler('previoustrack', () => {
      setHasStarted(true);
      setCurrentIndex((prev) => (prev - 1 + tracks.length) % tracks.length);
      setIsPlaying(true);
    });

    navigator.mediaSession.setActionHandler('nexttrack', () => {
      setHasStarted(true);
      setCurrentIndex((prev) => (prev + 1) % tracks.length);
      setIsPlaying(true);
    });
  }, [currentTrack, tracks.length]);

  useEffect(() => {
    if (!currentTrack || !currentTrack.audio_url) return;

    if (audioRef.current) {
      audioRef.current.pause();
    }

    const audio = new Audio(currentTrack.audio_url);
    audioRef.current = audio;

    audio.onloadedmetadata = () => setDuration(audio.duration);
    audio.ontimeupdate = () => setCurrentTime(audio.currentTime);
    audio.onended = () => {
      setCurrentIndex((prev) => (prev + 1) % tracks.length);
      setIsPlaying(true);
    };

    if (isPlaying) {
      audio.play().catch((err) => console.error('Lỗi play audio:', err));
    }

    return () => {
      audio.pause();
      audioRef.current = null;
    };
  }, [currentIndex, tracks]);

  const playTrack = (index: number) => {
    setCurrentIndex(index);
    setIsPlaying(true);
    setHasStarted(true);
  };

  const togglePlay = () => {
    if (!audioRef.current || !currentTrack?.audio_url) return;
    if (!hasStarted) setHasStarted(true);

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch((err) => console.error('Lỗi play audio:', err));
      setIsPlaying(true);
    }
  };

  const handleNext = () => {
    if (!hasStarted) setHasStarted(true);
    setCurrentIndex((prev) => (prev + 1) % tracks.length);
    setIsPlaying(true);
  };

  const handlePrev = () => {
    if (!hasStarted) setHasStarted(true);
    setCurrentIndex((prev) => (prev - 1 + tracks.length) % tracks.length);
    setIsPlaying(true);
  };

  const seekTo = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  return (
    <AudioContext.Provider value={{
      tracks, currentIndex, currentTrack, isPlaying, hasStarted,
      currentTime, duration, playTrack, togglePlay, handleNext, handlePrev, seekTo
    }}>
      {children}
    </AudioContext.Provider>
  );
}

export const useAudio = () => {
  const ctx = useContext(AudioContext);
  if (!ctx) throw new Error('useAudio must be used inside AudioProvider');
  return ctx;
};