'use client';

import { useEffect, useRef, useState } from 'react';

interface Conversation {
  id: string;
  customer_name: string;
  updated_at: string;
  guest_session_id?: string;
}

interface Message {
  id: string;
  sender_type: 'customer' | 'admin';
  message: string;
  created_at: string;
}

export default function AdminChatPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [replyText, setReplyText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. Tải danh sách các cuộc hội thoại
  const fetchConversations = async () => {
    try {
      const res = await fetch('/api/admin/chats');
      const data = await res.json();
      if (data.success) {
        setConversations(data.conversations);
        if (!selectedConvId && data.conversations.length > 0) {
          setSelectedConvId(data.conversations[0].id);
        }
      }
    } catch (error) {
      console.error('Lỗi tải danh sách hội thoại:', error);
    }
  };

  useEffect(() => {
    fetchConversations();
    const interval = setInterval(fetchConversations, 4000);
    return () => clearInterval(interval);
  }, []);

  // 2. Tải tin nhắn chi tiết của cuộc hội thoại đang chọn
  useEffect(() => {
    if (!selectedConvId) return;

    const fetchMessages = async () => {
      try {
        const res = await fetch(`/api/admin/chats?conversation_id=${selectedConvId}`);
        const data = await res.json();
        if (data.success) {
          setMessages(data.messages);
        }
      } catch (error) {
        console.error('Lỗi tải tin nhắn:', error);
      }
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [selectedConvId]);

  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.length]);

  // Hàm yêu cầu quyền nhận Web Push Notification khi bấm nút (Không còn alert rườm rà)
  const handleEnablePush = async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      alert('Trình duyệt của bạn không hỗ trợ Web Push Notification.');
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        alert('Bạn chưa cấp quyền nhận thông báo!');
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      
      const publicVapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || 'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYUH5NjhAE';
      const convertedVapidKey = urlBase64ToUint8Array(publicVapidKey);

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey,
      });

      const res = await fetch('/api/chat/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription),
      });

      const data = await res.json();
      if (data.success) {
        alert('✅ Đã bật thông báo đẩy thành công!');
      } else {
        alert('Lưu đăng ký thất bại: ' + (data.message || ''));
      }
    } catch (error: any) {
      console.error('Lỗi đăng ký push:', error);
      alert('Lỗi khi bật thông báo: ' + (error?.message || error));
    }
  };

  // Helper chuyển đổi VAPID key
  function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  // Hàm gửi phản hồi chuẩn qua API /api/chat/send
  const sendAdminMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedConvId) return;

    const activeConv: any = conversations.find((c) => c.id === selectedConvId);
    if (!activeConv) return;

    const text = replyText;
    setReplyText('');

    try {
      const res = await fetch('/api/chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guest_session_id: activeConv.guest_session_id,
          customer_name: activeConv.customer_name,
          message: text,
          sender_type: 'admin',
        }),
      });

      const data = await res.json();
      if (data.success) {
        setMessages((prev) => [...prev, data.message]);
      }
    } catch (error) {
      console.error('Lỗi gửi tin nhắn admin:', error);
    }
  };

  return (
    <div className="mx-auto max-w-screen-2xl px-4 py-6">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-neutral-800 dark:text-white">
          Quản Trị Tin Nhắn Trực Tuyến
        </h1>
        <button
          onClick={handleEnablePush}
          className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2 text-xs font-semibold text-white shadow transition-colors hover:bg-amber-600"
        >
          <span>🔔</span> Bật thông báo đẩy
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 h-[75vh] rounded-2xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900 overflow-hidden">
        
        {/* CỘT TRÁI: DANH SÁCH KHÁCH HÀNG */}
        <div className="border-r border-neutral-200 dark:border-neutral-800 overflow-y-auto flex flex-col">
          <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 font-semibold text-sm bg-neutral-50 dark:bg-neutral-950">
            Danh sách khách hàng ({conversations.length})
          </div>

          {conversations.length === 0 ? (
            <div className="p-6 text-center text-xs text-neutral-400">Chưa có cuộc trò chuyện nào.</div>
          ) : (
            <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {conversations.map((conv: any) => (
                <div
                  key={conv.id}
                  onClick={() => setSelectedConvId(conv.id)}
                  className={`p-4 cursor-pointer transition-colors ${
                    selectedConvId === conv.id
                      ? 'bg-blue-50 dark:bg-blue-950/40 border-l-4 border-blue-600'
                      : 'hover:bg-neutral-50 dark:hover:bg-neutral-800/50'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-sm text-neutral-800 dark:text-white">
                      {conv.customer_name}
                    </span>
                    <span className="text-[10px] text-neutral-400">{conv.updated_at?.slice(11, 16)}</span>
                  </div>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                    Bấm để xem lịch sử trò chuyện...
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* CỘT PHẢI: KHUNG CHAT CHI TIẾT */}
        <div className="col-span-2 flex flex-col bg-neutral-50/50 dark:bg-neutral-950/50">
          {selectedConvId ? (
            <>
              <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 font-semibold text-sm flex items-center justify-between">
                <span>Đang trò chuyện với khách hàng</span>
                <span className="text-xs text-green-500 font-normal flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span> Trực tuyến
                </span>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender_type === 'admin' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-2xl px-4 py-2.5 text-xs shadow-sm ${
                        msg.sender_type === 'admin'
                          ? 'bg-blue-600 text-white rounded-br-none'
                          : 'bg-white text-neutral-800 border border-neutral-200 dark:bg-neutral-800 dark:text-white dark:border-neutral-700 rounded-bl-none'
                      }`}
                    >
                      <p className="leading-relaxed">{msg.message}</p>
                      <span className={`block text-[9px] mt-1 text-right ${msg.sender_type === 'admin' ? 'text-blue-100' : 'text-neutral-400'}`}>
                        {msg.created_at?.slice(11, 16)}
                      </span>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <form onSubmit={sendAdminMessage} className="p-3 bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800 flex items-center gap-2">
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Nhập nội dung phản hồi khách hàng..."
                  className="flex-1 rounded-xl border border-neutral-300 bg-transparent px-4 py-2.5 text-xs text-neutral-800 focus:border-blue-600 focus:outline-none dark:border-neutral-700 dark:text-white"
                />
                <button
                  type="submit"
                  className="rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-blue-700"
                >
                  Gửi phản hồi
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-xs text-neutral-400">
              Chọn một khách hàng bên cột trái để bắt đầu chat.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}