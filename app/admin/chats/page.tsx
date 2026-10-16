'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

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

interface ConversationsResponse {
  success?: boolean;
  conversations?: Conversation[];
  message?: string;
}

interface MessagesResponse {
  success?: boolean;
  messages?: Message[];
  message?: string;
}

export default function AdminChatPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [replyText, setReplyText] = useState('');
  const [showMobileChat, setShowMobileChat] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [pageError, setPageError] = useState('');
  const [messageError, setMessageError] = useState('');

  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const selectedConvIdRef = useRef<string | null>(null);
  const shouldScrollToBottomRef = useRef(true);
  const lastMessageIdRef = useRef<string | null>(null);

  // Keep a ref in sync so an older network response cannot replace the active chat.
  useEffect(() => {
    selectedConvIdRef.current = selectedConvId;
  }, [selectedConvId]);

  const fetchConversations = useCallback(async (signal?: AbortSignal) => {
    try {
      const res = await fetch('/api/admin/chats', {
        method: 'GET',
        cache: 'no-store',
        signal,
      });

      if (!res.ok) {
        throw new Error(`Không tải được danh sách khách hàng (HTTP ${res.status}).`);
      }

      const data: ConversationsResponse = await res.json();
      if (data.success && Array.isArray(data.conversations)) {
        setConversations(data.conversations);
        setPageError('');
      } else {
        setPageError(data.message || 'Dữ liệu danh sách hội thoại không hợp lệ.');
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      console.error('Lỗi tải danh sách hội thoại:', error);
      setPageError('Không tải được danh sách khách hàng. Anh thử bấm “Làm mới danh sách”.');
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void fetchConversations(controller.signal);
    return () => controller.abort();
  }, [fetchConversations]);

  // Poll only the selected conversation. Abort the previous request/interval when selection changes.
  useEffect(() => {
    if (!selectedConvId) {
      setMessages([]);
      setLoadingMessages(false);
      return;
    }

    const conversationId = selectedConvId;
    const controller = new AbortController();
    let disposed = false;
    let firstLoad = true;

    const loadMessages = async () => {
      try {
        if (firstLoad) setLoadingMessages(true);

        const res = await fetch(
          `/api/admin/chats?conversation_id=${encodeURIComponent(conversationId)}`,
          {
            method: 'GET',
            cache: 'no-store',
            signal: controller.signal,
          }
        );

        if (!res.ok) {
          throw new Error(`Không tải được tin nhắn (HTTP ${res.status}).`);
        }

        const data: MessagesResponse = await res.json();

        // Guard against stale responses even if a request finishes while selection changes.
        if (
          disposed ||
          controller.signal.aborted ||
          selectedConvIdRef.current !== conversationId
        ) {
          return;
        }

        if (data.success && Array.isArray(data.messages)) {
          setMessages(data.messages);
          setMessageError('');
        } else {
          setMessageError(data.message || 'Dữ liệu tin nhắn không hợp lệ.');
        }
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return;
        if (!disposed && selectedConvIdRef.current === conversationId) {
          console.error('Lỗi tải tin nhắn:', error);
          setMessageError('Không tải được tin nhắn. Đang thử lại tự động.');
        }
      } finally {
        firstLoad = false;
        if (!disposed && selectedConvIdRef.current === conversationId) {
          setLoadingMessages(false);
        }
      }
    };

    void loadMessages();
    const intervalId = window.setInterval(() => {
      void loadMessages();
    }, 3000);

    return () => {
      disposed = true;
      controller.abort();
      window.clearInterval(intervalId);
    };
  }, [selectedConvId]);

  // Scroll to bottom when the conversation changes or genuinely new messages arrive.
  useEffect(() => {
    if (!selectedConvId || messages.length === 0) {
      lastMessageIdRef.current = null;
      return;
    }

    const latestMessage = messages[messages.length - 1];
    const latestId = latestMessage?.id ?? null;
    const isNewLastMessage = latestId !== lastMessageIdRef.current;
    lastMessageIdRef.current = latestId;

    if (shouldScrollToBottomRef.current && isNewLastMessage) {
      requestAnimationFrame(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
      });
    }
  }, [messages, selectedConvId]);

  const handleMessagesScroll = () => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const distanceFromBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight;

    // If the admin is reading older messages, do not force-scroll them to the bottom.
    shouldScrollToBottomRef.current = distanceFromBottom < 100;
  };

  const activeConv = conversations.find((conversation) => conversation.id === selectedConvId);

  const handleSelectConversation = (id: string) => {
    if (id === selectedConvId) {
      setShowMobileChat(true);
      return;
    }

    // Immediately invalidate the previous conversation before its request can finish.
    selectedConvIdRef.current = id;
    lastMessageIdRef.current = null;
    shouldScrollToBottomRef.current = true;
    setSelectedConvId(id);
    setShowMobileChat(true);
    setMessages([]);
    setMessageError('');
    setReplyText('');
  };

  const handleDeleteConversation = async () => {
    if (!selectedConvId) return;
    if (!window.confirm('Bạn có chắc chắn muốn xóa hội thoại này không?')) return;

    const deletingId = selectedConvId;

    try {
      const res = await fetch('/api/admin/chats', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversation_id: deletingId }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || data.success === false) {
        window.alert('Xóa thất bại: ' + (data.message || `HTTP ${res.status}`));
        return;
      }

      setConversations((previous) => previous.filter((conversation) => conversation.id !== deletingId));

      if (selectedConvIdRef.current === deletingId) {
        selectedConvIdRef.current = null;
        setSelectedConvId(null);
        setShowMobileChat(false);
        setMessages([]);
        setReplyText('');
      }
    } catch (error) {
      console.error('Lỗi xóa hội thoại:', error);
      window.alert('Không thể kết nối tới server để xóa hội thoại.');
    }
  };

  const sendAdminMessage = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const text = replyText.trim();
    const conversationId = selectedConvId;
    const conversation = activeConv;

    if (!text || !conversationId || !conversation || sending) return;

    setSending(true);
    setMessageError('');

    try {
      const res = await fetch('/api/chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guest_session_id: conversation.guest_session_id,
          customer_name: conversation.customer_name,
          message: text,
          sender_type: 'admin',
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.success) {
        setMessageError(data.message || 'Gửi tin nhắn thất bại. Nội dung vẫn được giữ lại.');
        return;
      }

      // Do not append a response to another conversation if the admin switched chats meanwhile.
      if (selectedConvIdRef.current === conversationId && data.message) {
        setMessages((previous) => {
          const newMessage = data.message as Message;
          return previous.some((item) => item.id === newMessage.id)
            ? previous
            : [...previous, newMessage];
        });
        setReplyText('');
        shouldScrollToBottomRef.current = true;
      }

      void fetchConversations();
    } catch (error) {
      console.error('Lỗi gửi tin nhắn:', error);
      setMessageError('Không gửi được tin nhắn do lỗi kết nối. Anh thử lại nhé.');
    } finally {
      setSending(false);
    }
  };

  return (
    /* ĐÃ SẢU CHIỀU CAO Ở ĐÂY: Dùng h-[calc(100vh-140px)] hoặc h-[720px] max-h-[calc(100vh-120px)] để ôm gọn trong 1 màn hình, tuyệt đối không bị tràn cuộn trang */
    <main className="mx-auto box-border flex h-[calc(100vh-140px)] min-h-[500px] w-full max-w-screen-2xl flex-col px-2 py-2 sm:px-4 sm:py-3">
      <header className="mb-2 flex shrink-0 items-center justify-between gap-3">
        <h1 className="min-w-0 truncate text-lg font-bold text-neutral-800 dark:text-white sm:text-xl">
          Quản Trị Tin Nhắn
        </h1>
        <button
          type="button"
          onClick={() => void fetchConversations()}
          className="shrink-0 rounded-xl bg-neutral-200 px-3 py-1.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-300 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
        >
          🔄 Làm mới danh sách
        </button>
      </header>

      {pageError && (
        <p role="alert" className="mb-2 shrink-0 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700 dark:bg-red-950/40 dark:text-red-300">
          {pageError}
        </p>
      )}

      {/* Desktop: two real grid columns. Mobile: switch between list and chat panels. */}
      <section className="relative grid min-h-0 min-w-0 flex-1 grid-cols-1 overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900 md:grid-cols-[minmax(260px,1fr)_minmax(0,2fr)]">
        {/* Customer list */}
        <aside
          className={[
            'absolute inset-0 z-10 flex min-h-0 min-w-0 flex-col bg-white dark:bg-neutral-900',
            'md:relative md:inset-auto md:z-auto md:col-start-1 md:row-start-1',
            showMobileChat ? '-translate-x-full md:translate-x-0' : 'translate-x-0',
            'transition-transform duration-200',
          ].join(' ')}
          aria-label="Danh sách khách hàng"
          aria-hidden={showMobileChat}
        >
          <div className="flex shrink-0 items-center justify-between border-b border-neutral-200 bg-neutral-50 p-3 text-xs font-semibold dark:border-neutral-800 dark:bg-neutral-950 sm:text-sm">
            <span>Khách hàng ({conversations.length})</span>
          </div>

          <div className="min-h-0 min-w-0 flex-1 divide-y divide-neutral-100 overflow-x-hidden overflow-y-auto overscroll-contain dark:divide-neutral-800">
            {conversations.length === 0 ? (
              <div className="p-6 text-center text-xs text-neutral-400">
                Chưa có cuộc trò chuyện nào.
              </div>
            ) : (
              conversations.map((conversation) => {
                const isSelected = selectedConvId === conversation.id;

                return (
                  <button
                    type="button"
                    key={conversation.id}
                    onClick={() => handleSelectConversation(conversation.id)}
                    aria-pressed={isSelected}
                    className={[
                      'block w-full min-w-0 cursor-pointer border-l-4 p-3 text-left transition-colors',
                      isSelected
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/40'
                        : 'border-transparent hover:bg-neutral-50 dark:hover:bg-neutral-800/50',
                    ].join(' ')}
                  >
                    <span className="mb-1 flex min-w-0 items-center justify-between gap-2">
                      <span className="min-w-0 truncate text-xs font-semibold text-neutral-800 dark:text-white sm:text-sm">
                        {conversation.customer_name || 'Khách hàng'}
                      </span>
                      <span className="shrink-0 text-[10px] text-neutral-400">
                        {conversation.updated_at
                          ? new Date(conversation.updated_at).toLocaleTimeString('vi-VN', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : ''}
                      </span>
                    </span>
                    <span className="block truncate text-[11px] text-neutral-500 dark:text-neutral-400">
                      Bấm để xem tin nhắn...
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </aside>

        {/* Chat detail */}
        <section
          className={[
            'absolute inset-0 z-20 flex min-h-0 min-w-0 flex-col bg-neutral-50 dark:bg-neutral-950',
            'md:relative md:inset-auto md:z-auto md:col-start-2 md:row-start-1',
            showMobileChat ? 'translate-x-0' : 'translate-x-full md:translate-x-0',
            'transition-transform duration-200',
          ].join(' ')}
          aria-label="Chi tiết hội thoại"
          aria-hidden={!showMobileChat && !selectedConvId}
        >
          {selectedConvId ? (
            <>
              {/* Fixed chat header */}
              <header className="flex shrink-0 items-center justify-between gap-2 border-b border-neutral-200 bg-white p-3 text-xs font-semibold shadow-sm dark:border-neutral-800 dark:bg-neutral-900 sm:text-sm">
                <div className="flex min-w-0 items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowMobileChat(false)}
                    className="shrink-0 rounded-lg p-1 text-neutral-600 dark:text-neutral-300 md:hidden"
                    aria-label="Quay lại danh sách khách hàng"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <span className="min-w-0 truncate">
                    Đang chat:{' '}
                    <strong className="text-blue-600">
                      {activeConv?.customer_name || 'Khách hàng'}
                    </strong>
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => void handleDeleteConversation()}
                  className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-red-50 px-2.5 py-1.5 text-[11px] font-medium text-red-600 hover:bg-red-100 dark:bg-red-950/30 dark:text-red-300"
                >
                  <span aria-hidden="true">🗑️</span>
                  <span className="hidden sm:inline">Xóa hội thoại</span>
                  <span className="sm:hidden">Xóa</span>
                </button>
              </header>

              {/* This is the only vertically scrollable chat region. */}
              <div
                ref={messagesContainerRef}
                onScroll={handleMessagesScroll}
                className="flex min-h-0 min-w-0 flex-1 flex-col gap-3 overflow-x-hidden overflow-y-auto overscroll-contain p-3 sm:p-4"
                role="log"
                aria-live="polite"
                aria-label="Nội dung hội thoại"
              >
                {loadingMessages && messages.length === 0 && (
                  <p className="m-auto text-xs text-neutral-400">Đang tải tin nhắn...</p>
                )}

                {!loadingMessages && messages.length === 0 && !messageError && (
                  <p className="m-auto text-center text-xs text-neutral-400">
                    Chưa có tin nhắn trong hội thoại này.
                  </p>
                )}

                {messages.map((message) => {
                  const isAdmin = message.sender_type === 'admin';

                  return (
                    <div
                      key={message.id}
                      className={`flex w-full min-w-0 ${isAdmin ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={[
                          'min-w-0 max-w-[85%] break-words rounded-2xl px-3.5 py-2.5 text-xs shadow-sm sm:max-w-[70%]',
                          isAdmin
                            ? 'rounded-br-none bg-blue-600 text-white'
                            : 'rounded-bl-none border border-neutral-200 bg-white text-neutral-800 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white',
                        ].join(' ')}
                      >
                        <p className="whitespace-pre-wrap break-words leading-relaxed">
                          {message.message}
                        </p>
                        <span
                          className={`mt-1 block text-right text-[9px] ${
                            isAdmin ? 'text-blue-100' : 'text-neutral-400'
                          }`}
                        >
                          {message.created_at
                            ? new Date(message.created_at).toLocaleTimeString('vi-VN', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : ''}
                        </span>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} className="h-px shrink-0" />
              </div>

              {messageError && (
                <p role="alert" className="shrink-0 border-t border-red-100 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
                  {messageError}
                </p>
              )}

              {/* Fixed reply box */}
              <form
                onSubmit={sendAdminMessage}
                className="flex shrink-0 items-center gap-2 border-t border-neutral-200 bg-white p-2 dark:border-neutral-800 dark:bg-neutral-900 sm:p-2.5"
              >
                <input
                  type="text"
                  value={replyText}
                  onChange={(event) => setReplyText(event.target.value)}
                  placeholder="Nhập nội dung phản hồi khách hàng..."
                  autoComplete="off"
                  className="min-w-0 flex-1 rounded-xl border border-neutral-300 bg-transparent px-3 py-2 text-xs text-neutral-800 outline-none focus:border-blue-600 dark:border-neutral-700 dark:text-white"
                />
                <button
                  type="submit"
                  disabled={!replyText.trim() || sending}
                  className="shrink-0 cursor-pointer rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 sm:px-5"
                >
                  {sending ? 'Đang gửi...' : 'Gửi'}
                </button>
              </form>
            </>
          ) : (
            <div className="flex min-h-0 flex-1 items-center justify-center p-4 text-center text-xs text-neutral-400">
              Chọn một khách hàng trong danh sách bên trái để bắt đầu trò chuyện.
            </div>
          )}
        </section>
      </section>
    </main>
  );
}