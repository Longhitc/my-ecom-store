'use client';

import { useEffect, useRef, useState } from 'react';

interface Message {
  id: string;
  sender_type: 'customer' | 'admin';
  message: string;
  created_at: string;
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [guestId, setGuestId] = useState<string>('');
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Khởi tạo hoặc lấy guest_session_id từ localStorage khi load trang
  useEffect(() => {
    let storedId = localStorage.getItem('chat_guest_id');
    if (!storedId) {
      storedId = 'guest_' + Math.random().toString(36).substring(2, 15) + Date.now();
      localStorage.setItem('chat_guest_id', storedId);
    }
    setGuestId(storedId);
  }, []);

  // 1. Kiểm tra số tin nhắn chưa đọc từ admin (chạy định kỳ nhẹ nhàng khi chat ĐÓNG)
  useEffect(() => {
    if (!guestId) return;

    const fetchUnread = async () => {
      try {
        const res = await fetch(`/api/chat/unread?guest_id=${guestId}`);
        const data = await res.json();
        if (data.success) {
          setUnreadCount(data.unread_count);
        }
      } catch (error) {
        console.error('Lỗi kiểm tra tin chưa đọc:', error);
      }
    };

    fetchUnread();
    const interval = setInterval(fetchUnread, 5000); // 5 giây kiểm tra 1 lần khi đóng chat
    return () => clearInterval(interval);
  }, [guestId]);

  // 2. Tải tin nhắn chi tiết (CHỈ CHẠY KHI KHUNG CHAT ĐANG MỞ để tiết kiệm tài nguyên)
  useEffect(() => {
    if (!guestId || !isOpen) return;

    const fetchMessages = async () => {
      try {
        const res = await fetch(`/api/chat/messages?guest_id=${guestId}`);
        const data = await res.json();
        if (data.success) {
          setMessages(data.messages);
        }
      } catch (error) {
        console.error('Lỗi tải tin nhắn:', error);
      }
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 3000); // 3 giây cập nhật khi đang mở chat
    return () => clearInterval(interval);
  }, [guestId, isOpen]);

  // Khi khách bấm mở khung chat -> Đánh dấu đã đọc tất cả tin nhắn của admin
  const handleOpenChat = async () => {
    setIsOpen(true);
    setUnreadCount(0); // Ẩn badge ngay lập tức

    if (guestId) {
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

  // Cuộn xuống tin nhắn mới nhất
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Gửi tin nhắn từ khách hàng
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
      if (data.success) {
        setMessages((prev) => [...prev, data.message]);
      }
    } catch (error) {
      console.error('Lỗi gửi tin nhắn:', error);
    }
  };

  return (
    <div className="fixed bottom-20 right-4 z-[999] md:bottom-5 md:right-5">
      {/* Nút Bong bóng chat nổi kèm Huy hiệu số lượng */}
      {!isOpen && (
        <button
          onClick={handleOpenChat}
          className="relative flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-xl transition-transform hover:scale-110 focus:outline-none"
          title="Hỗ trợ trực tuyến"
        >
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-[11px] font-bold text-white shadow-md animate-bounce">
              {unreadCount}
            </span>
          )}
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-7 w-7">
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.35 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-1.421-1.409C17.25 6 12 6 12 6s-5.25 0-6.825.385c-.604.15-1.122.652-1.42 1.405C3.5 9.22 3.5 10.5 3.5 10.5s0 1.28.255 2.71c.298.753.816 1.255 1.42 1.405 1.575.385 6.825.385 6.825.385a41.528 41.528 0 014.28-.22l2.72 2.72v-3.085c.34-.02.68-.045 1.02-.072 1.133-.093 1.98-1.057 1.98-2.193z" />
          </svg>
        </button>
      )}

      {/* Khung chat Box */}
      {isOpen && (
        <div className="flex h-[450px] w-[calc(100vw-32px)] sm:w-[350px] flex-col rounded-2xl border border-neutral-200 bg-white shadow-2xl dark:border-neutral-800 dark:bg-neutral-900">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-neutral-200 bg-blue-600 px-4 py-3 rounded-t-2xl text-white">
            <div className="flex items-center space-x-2">
              <span className="h-3 w-3 rounded-full bg-green-400 animate-pulse"></span>
              <span className="font-semibold text-sm">Hỗ trợ trực tuyến Shop</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-neutral-200 focus:outline-none text-lg font-bold"
            >
              &times;
            </button>
          </div>

          {/* Danh sách tin nhắn */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-neutral-50 dark:bg-neutral-950 text-sm">
            {messages.length === 0 ? (
              <div className="text-center text-neutral-400 mt-16 text-xs">
                Xin chào! Bạn cần shop tư vấn sản phẩm gì ạ? Hãy nhắn cho chúng mình nhé.
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
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

          {/* Ô nhập tin nhắn */}
          <form onSubmit={handleSendMessage} className="flex items-center border-t border-neutral-200 p-2 bg-white dark:bg-neutral-900 rounded-b-2xl dark:border-neutral-800">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Nhập nội dung cần hỏi..."
              className="flex-1 rounded-lg border border-neutral-300 bg-transparent px-3 py-2 text-xs text-neutral-800 focus:border-blue-600 focus:outline-none dark:border-neutral-700 dark:text-white"
            />
            <button
              type="submit"
              className="ml-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-blue-700"
            >
              Gửi
            </button>
          </form>
        </div>
      )}
    </div>
  );
}