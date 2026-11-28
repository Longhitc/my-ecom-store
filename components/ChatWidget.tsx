'use client';

import { useAuth } from '@/context/auth-context';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

interface Message {
  id: string;
  sender_type: 'customer' | 'admin';
  message: string;
  created_at: string;
}

interface Position {
  x: number;
  y: number;
}

const ICON_SIZE = 36;

export default function ChatWidget() {
  const [isMounted, setIsMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [guestId, setGuestId] = useState<string>('');
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [position, setPosition] = useState<Position | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<HTMLDivElement>(null);
  const dragStateRef = useRef<{
    pointerId: number | null;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
    moved: boolean;
  }>({
    pointerId: null,
    startX: 0,
    startY: 0,
    originX: 0,
    originY: 0,
    moved: false,
  });

  const pathname = usePathname();
  const auth = useAuth() as any;
  const customer = auth?.customer || auth?.user;

  // Lấy trực tiếp cờ is_admin từ API/database trả về qua customer object
  const isAdmin = Number(customer?.is_admin) === 1 || customer?.is_admin === true;
  const isAdminRoute = pathname?.startsWith('/admin');

  const getBottomRightPosition = (): Position => {
    if (typeof window === 'undefined') return { x: 16, y: 16 };
    const isMobile = window.innerWidth < 768;
    const rightOffset = isMobile ? 14 : 20;
    const bottomOffset = isMobile ? 76 : 20;

    return {
      x: Math.max(12, window.innerWidth - ICON_SIZE - rightOffset),
      y: Math.max(12, window.innerHeight - ICON_SIZE - bottomOffset),
    };
  };

  useEffect(() => {
    setIsMounted(true);
    let storedId = localStorage.getItem('chat_guest_id');
    if (!storedId) {
      storedId = 'guest_' + Math.random().toString(36).substring(2, 15) + Date.now();
      localStorage.setItem('chat_guest_id', storedId);
    }
    setGuestId(storedId);

    // Xóa tọa độ cũ nếu có để luôn khởi đầu ở góc dưới bên phải
    localStorage.removeItem('chat_widget_pos');
    setPosition(getBottomRightPosition());
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    const handleViewportChange = () => {
      setPosition(getBottomRightPosition());
    };
    window.addEventListener('resize', handleViewportChange);
    window.addEventListener('orientationchange', handleViewportChange);
    return () => {
      window.removeEventListener('resize', handleViewportChange);
      window.removeEventListener('orientationchange', handleViewportChange);
    };
  }, [isMounted]);

  // Kiểm tra số tin nhắn chưa đọc từ admin
  useEffect(() => {
    if (!guestId || isAdmin || isAdminRoute) return;

    const checkUnread = async () => {
      try {
        const res = await fetch(`/api/chat/unread?guest_id=${guestId}`);
        const data = await res.json();
        if (data.success && data.unread_count > 0) {
          setUnreadCount(data.unread_count);
        }
      } catch (error) {
        console.error('Lỗi kiểm tra tin chưa đọc:', error);
      }
    };

    checkUnread();
  }, [guestId, isAdmin, isAdminRoute]);

  const fetchMessages = async (currentGuestId: string) => {
    try {
      const res = await fetch(`/api/chat/messages?guest_id=${currentGuestId}`);
      const data = await res.json();
      if (data.success) {
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error('Lỗi tải tin nhắn:', error);
    }
  };

  const handleOpenChat = async () => {
    setIsOpen(true);
    setUnreadCount(0);

    if (guestId) {
      fetchMessages(guestId);

      try {
        await fetch('/api/chat/unread', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ guest_id: guestId }),
        });
      } catch (error) {
        console.error('Lỗi cập nhật trạng thái đã đọc:', error);
      }
    }
  };

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !guestId) return;

    const textToSend = inputMessage;
    setInputMessage('');

    try {
      const res = await fetch('/api/chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guest_session_id: guestId,
          customer_name: `Khách (${guestId.slice(-4)})`,
          message: textToSend,
          sender_type: 'customer',
        }),
      });

      const data = await res.json();
      if (data.success && data.message) {
        setMessages((prev) => [...prev, data.message]);
      }
    } catch (error) {
      console.error('Lỗi gửi tin nhắn:', error);
    }
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    const currentPos = position || getBottomRightPosition();
    e.currentTarget.setPointerCapture(e.pointerId);
    dragStateRef.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      originX: currentPos.x,
      originY: currentPos.y,
      moved: false,
    };
    setIsDragging(true);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!isDragging || dragStateRef.current.pointerId !== e.pointerId) return;

    const dx = e.clientX - dragStateRef.current.startX;
    const dy = e.clientY - dragStateRef.current.startY;

    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
      dragStateRef.current.moved = true;
    }

    const maxX = Math.max(12, window.innerWidth - ICON_SIZE - 12);
    const maxY = Math.max(12, window.innerHeight - ICON_SIZE - 12);

    const nextX = Math.min(Math.max(12, dragStateRef.current.originX + dx), maxX);
    const nextY = Math.min(Math.max(12, dragStateRef.current.originY + dy), maxY);

    setPosition({ x: nextX, y: nextY });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (dragStateRef.current.pointerId !== e.pointerId) return;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }

    const wasMoved = dragStateRef.current.moved;
    setIsDragging(false);
    dragStateRef.current.pointerId = null;

    if (!wasMoved) {
      handleOpenChat();
    }
  };

  // Nếu đang ở route /admin HOẶC customer có is_admin == 1 -> Trả về null ẩn ngay lập tức
  if (!isMounted || isAdminRoute || isAdmin) {
    return null;
  }

  const activePos = position || getBottomRightPosition();
  const chatWidth = typeof window !== 'undefined' ? Math.min(350, window.innerWidth - 32) : 350;
  const chatHeight = 450;
  const openLeft =
    typeof window !== 'undefined'
      ? Math.min(Math.max(16, activePos.x + ICON_SIZE - chatWidth), window.innerWidth - chatWidth - 16)
      : 16;
  const openTop =
    typeof window !== 'undefined'
      ? Math.min(Math.max(16, activePos.y - chatHeight - 10), window.innerHeight - chatHeight - 16)
      : 16;

  return (
    <div ref={widgetRef} className="z-[999]">
      <style jsx>{`
        @keyframes chat3dBlink {
          0%, 100% {
            transform: translateY(0px) scale(1);
            box-shadow:
              0 4px 0 #1d4ed8,
              0 7px 14px rgba(37, 99, 235, 0.42),
              inset 0 1.5px 3px rgba(255, 255, 255, 0.65);
          }
          50% {
            transform: translateY(-1.5px) scale(1.05);
            box-shadow:
              0 5px 0 #1e40af,
              0 9px 18px rgba(59, 130, 246, 0.68),
              inset 0 1.5px 4px rgba(255, 255, 255, 0.9);
          }
        }

        @keyframes chatRingBlink {
          0% {
            transform: scale(0.96);
            opacity: 0.7;
          }
          70% {
            transform: scale(1.24);
            opacity: 0;
          }
          100% {
            transform: scale(1.24);
            opacity: 0;
          }
        }

        .chat-3d-btn {
          animation: chat3dBlink 1.8s ease-in-out infinite;
        }

        .chat-3d-ring {
          animation: chatRingBlink 1.8s cubic-bezier(0.24, 0, 0.38, 1) infinite;
        }
      `}</style>

      {!isOpen && (
        <div
          style={{ left: `${activePos.x}px`, top: `${activePos.y}px` }}
          className="fixed z-[999] select-none"
        >
          <button
            type="button"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            style={{ touchAction: 'none' }}
            className={`chat-3d-btn relative flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-b from-sky-400 via-blue-600 to-indigo-700 text-white border border-white/40 transition-transform focus:outline-none ${
              isDragging ? 'cursor-grabbing scale-105' : 'cursor-grab hover:brightness-110'
            }`}
            title="Kéo để di chuyển hoặc bấm để chat với shop"
            aria-label="Hỗ trợ trực tuyến"
          >
            {/* Vòng nháy sáng 3D thu hút chú ý */}
            <span className="chat-3d-ring pointer-events-none absolute inset-0 rounded-full border-2 border-sky-400" />

            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 z-10 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white shadow-md animate-bounce">
                {unreadCount}
              </span>
            )}

            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="relative z-10 h-4 w-4 drop-shadow-[0_1.5px_1.5px_rgba(0,0,0,0.35)]"
            >
              <path
                fillRule="evenodd"
                d="M4.848 2.771A49.144 49.144 0 0 1 12 2.25c2.43 0 4.817.178 7.152.52 1.978.292 3.348 2.024 3.348 3.97v6.02c0 1.946-1.37 3.678-3.348 3.97a48.901 48.901 0 0 1-3.476.383.39.39 0 0 0-.297.17l-2.755 4.133a.75.75 0 0 1-1.248 0l-2.755-4.133a.39.39 0 0 0-.297-.17 48.9 48.9 0 0 1-3.476-.384c-1.978-.29-3.348-2.024-3.348-3.97V6.741c0-1.946 1.37-3.68 3.348-3.97ZM6.75 8.25a.75.75 0 0 1 .75-.75h9a.75.75 0 0 1 0 1.5h-9a.75.75 0 0 1-.75-.75Zm.75 2.25a.75.75 0 0 0 0 1.5H12a.75.75 0 0 0 0-1.5H7.5Z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      )}

      {isOpen && (
        <div
          style={{ left: `${openLeft}px`, top: `${openTop}px`, width: `${chatWidth}px` }}
          className="fixed z-[999] flex h-[450px] flex-col rounded-2xl border border-neutral-200 bg-white shadow-2xl dark:border-neutral-800 dark:bg-neutral-900"
        >
          <div className="flex items-center justify-between border-b border-neutral-200 bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 rounded-t-2xl text-white">
            <div className="flex items-center space-x-2">
              <span className="h-3 w-3 rounded-full bg-green-400 animate-pulse"></span>
              <span className="font-semibold text-sm">Hỗ trợ trực tuyến Shop</span>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-neutral-200 focus:outline-none text-lg font-bold cursor-pointer"
            >
              &times;
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-neutral-50 dark:bg-neutral-950 text-sm">
            {messages.length === 0 ? (
              <div className="text-center text-neutral-400 mt-16 text-xs">
                Xin chào! Bạn cần shop tư vấn sản phẩm gì ạ? Hãy nhắn cho chúng mình nhé.
              </div>
            ) : (
              messages.map((msg, index) => (
                <div
                  key={`${msg.id}-${index}`}
                  className={`flex ${msg.sender_type === 'customer' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[75%] rounded-2xl px-3.5 py-2 text-xs shadow-sm ${
                      msg.sender_type === 'customer'
                        ? 'bg-blue-600 text-white rounded-br-none'
                        : 'bg-white text-neutral-800 border border-neutral-200 dark:bg-neutral-800 dark:text-white dark:border-neutral-700 rounded-bl-none'
                    }`}
                  >
                    {msg.message}
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
          <form
            onSubmit={handleSendMessage}
            className="flex items-center border-t border-neutral-200 p-2 bg-white dark:bg-neutral-900 rounded-b-2xl dark:border-neutral-800"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Nhập nội dung cần hỏi..."
              className="flex-1 rounded-lg border border-neutral-300 bg-transparent px-3 py-2 text-xs text-neutral-800 focus:border-blue-600 focus:outline-none dark:border-neutral-700 dark:text-white"
            />
            <button
              type="submit"
              className="ml-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-blue-700 cursor-pointer"
            >
              Gửi
            </button>
          </form>
        </div>
      )}
    </div>
  );
}