import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useConversationWebSocket } from '@/hooks/useConversationWebSocket';
import { getConversationMessages } from '@/api/endpoints/conversation';
import { getUserConversations } from '@/api/endpoints/conversation';
import { MessageResponse } from '@/api/types/conversation';
import { me } from '@/api/endpoints/auth';
import convertDatetimeToLocalTimezone from '@/utils/convertDatetimeToLocalTimezone';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function Conversation() {
  const navigate = useNavigate();
  const location = useLocation();
  const { conversationId } = useParams<{ conversationId: string }>();
  const { messages: wsMessages, sendMessage, isConnected, error } = useConversationWebSocket(conversationId || '');

  const [allMessages, setAllMessages] = useState<MessageResponse[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [partnerName, setPartnerName] = useState<string>('');
  const [partnerAvatar, setPartnerAvatar] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const [errorHeight, setErrorHeight] = useState(0);
  const [headerHeight, setHeaderHeight] = useState(64);

  // 初期データを取得
  useEffect(() => {
    const fetchInitialData = async () => {
      if (!conversationId) {
        navigate('/message');
        return;
      }

      try {
        // 現在のユーザー情報を取得
        const user = await me();
        setCurrentUserId(user.data.id);

        // メッセージ一覧を取得
        const messagesResponse = await getConversationMessages(conversationId, 0, 50);
        setAllMessages(messagesResponse.data);

        // 会話リストから相手の情報を取得
        const conversationsResponse = await getUserConversations({ skip: 0, limit: 100 });
        const conversation = conversationsResponse.data.data.find(c => c.id === conversationId);

        if (conversation) {
          setPartnerName(conversation.partner_name);
          setPartnerAvatar(conversation.partner_avatar);
        } else {
          // 会話が見つからない場合、location.stateから取得を試みる
          const state = location.state as { conversationId?: string } | null;
          if (state?.conversationId) {
            // TODO: 個別の会話詳細APIがあれば、そこから取得
            setPartnerName('相手');
          }
        }
      } catch (err) {
        console.error('Failed to fetch initial data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, [conversationId, navigate, location]);

  // WebSocketから新しいメッセージが来たら追加
  useEffect(() => {
    if (wsMessages.length > 0) {
      setAllMessages((prev) => {
        // 重複を避ける
        const newMessages = wsMessages.filter((wsMsg) => !prev.some((msg) => msg.id === wsMsg.id));
        return [...prev, ...newMessages];
      });
    }
  }, [wsMessages]);

  // ヘッダーの高さを取得
  useEffect(() => {
    const updateHeaderHeight = () => {
      if (headerRef.current) {
        const height = headerRef.current.offsetHeight;
        setHeaderHeight(height);
      }
    };

    updateHeaderHeight();

    const resizeObserver = new ResizeObserver(() => {
      updateHeaderHeight();
    });

    if (headerRef.current) {
      resizeObserver.observe(headerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // エラー表示の高さを取得
  useEffect(() => {
    const updateErrorHeight = () => {
      if (errorRef.current) {
        const height = errorRef.current.offsetHeight;
        setErrorHeight(height);
      } else {
        setErrorHeight(0);
      }
    };

    updateErrorHeight();

    const resizeObserver = new ResizeObserver(() => {
      updateErrorHeight();
    });

    if (errorRef.current) {
      resizeObserver.observe(errorRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [error]);

  // メッセージが更新されたら最下部にスクロール
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [allMessages]);

  // メッセージ送信
  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    sendMessage(inputText);
    setInputText('');
  };

  // タイムスタンプをフォーマット
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('ja-JP', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // 日付と曜日をフォーマット
  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // 日付を比較（時刻を除く）
    const messageDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const yesterdayDate = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());

    if (messageDate.getTime() === todayDate.getTime()) {
      return '今日';
    } else if (messageDate.getTime() === yesterdayDate.getTime()) {
      return '昨日';
    } else {
      const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
      const month = date.getMonth() + 1;
      const day = date.getDate();
      const weekday = weekdays[date.getDay()];
      return `${month}/${day}(${weekday})`;
    }
  };

  // 同じ日付かどうかを判定
  const isSameDate = (date1: string, date2: string) => {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  };

  // Enterキーのハンドリング
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Ctrl+Enter (Windows) または Cmd+Enter (Mac) で送信
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // テキストエリアの自動リサイズ
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;

    el.style.height = '0px';

    const style = window.getComputedStyle(el);
    const lineHeight = parseFloat(style.lineHeight || '20');
    const paddingTop = parseFloat(style.paddingTop || '0');
    const paddingBottom = parseFloat(style.paddingBottom || '0');

    const maxHeight = lineHeight * 5 + paddingTop + paddingBottom;

    const nextHeight = Math.min(el.scrollHeight, maxHeight);
    el.style.height = `${nextHeight}px`;

    el.style.overflowY = el.scrollHeight > maxHeight ? 'auto' : 'hidden';
  }, [inputText]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-500">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* ヘッダー */}
      <div
        ref={headerRef}
        className="flex items-center p-4 border-b border-gray-200 w-full fixed top-0 left-0 right-0 bg-white z-10"
      >
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="w-10 flex justify-center"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center flex-1 justify-center gap-3">
          {partnerAvatar && (
            <img
              src={partnerAvatar}
              alt={partnerName}
              className="w-8 h-8 rounded-full object-cover"
            />
          )}
          <h1 className="text-xl font-semibold">{partnerName || '会話'}</h1>
        </div>
        <div className="w-10" />
      </div>

      {/* エラー表示 */}
      {error && (
        <div
          ref={errorRef}
          className="fixed left-0 right-0 z-10 bg-red-100 border border-red-400 text-red-700 px-4 py-2 text-sm"
          style={{ top: `${headerHeight}px` }}
        >
          {error}
        </div>
      )}

      {/* メッセージ一覧 */}
      <div
        className="flex-1 overflow-y-auto p-4 space-y-4 pb-24"
        style={{ paddingTop: `${headerHeight + errorHeight + 16}px` }}
      >
        {allMessages.map((message, index) => {
          // 送信者が現在のユーザーかどうかを判定
          const isCurrentUser = currentUserId && message.sender_user_id === currentUserId;

          // 前のメッセージと日付が異なる場合は日付を表示
          const showDateSeparator =
            index === 0 ||
            !isSameDate(message.created_at, allMessages[index - 1].created_at);

          return (
            <div key={message.id}>
              {/* 日付セパレーター */}
              {showDateSeparator && (
                <div className="flex items-center justify-center my-4">
                  <div className="text-xs text-gray-500 bg-gray-200 px-3 py-1 rounded-full">
                    {formatDate(message.created_at)}
                  </div>
                </div>
              )}

              <div
                className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`flex ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'} items-start gap-2 max-w-[95%]`}
                >
                  {/* アバター（相手のメッセージの場合のみ表示） */}
                  {!isCurrentUser && partnerAvatar && (
                    <img
                      src={partnerAvatar}
                      alt={partnerName}
                      className="w-8 h-8 rounded-full object-cover flex-shrink-0 mt-1"
                    />
                  )}

                  {/* メッセージバブル */}
                  <div className="flex-1">
                    {/* 相手のメッセージの場合は名前を表示 */}
                    {!isCurrentUser && (
                      <div className="text-md text-gray-500 mb-1">{partnerName}</div>
                    )}
                    <div className={`flex ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'} items-end gap-1`}>
                      <div
                        className={`px-4 py-2 rounded-2xl ${
                          isCurrentUser ? 'bg-primary text-white' : 'bg-white text-gray-900'
                        }`}
                      >
                        <p className="break-words whitespace-pre-wrap">{message.body_text}</p>
                      </div>
                      <div className="text-xs text-gray-400 whitespace-nowrap">
                        {formatTimestamp(convertDatetimeToLocalTimezone(message.created_at))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* 入力エリア */}
      <div className="fixed bottom-0 left-0 right-0 z-10 bg-white border-t border-gray-200 p-4">
        <div className="flex items-end space-x-2">
          <textarea
            ref={textareaRef}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="メッセージを入力"
            rows={1}
            className="
              flex-1 border border-gray-300
              bg-transparent text-gray-900
              rounded-2xl px-4 py-2
              focus:outline-none focus:ring-2 focus:ring-primary
              resize-none overflow-hidden
            "
            disabled={!isConnected}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputText.trim() || !isConnected}
            className="bg-primary text-white px-6 py-2 rounded-full font-semibold hover:bg-primary/90 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
          >
            送信
          </button>
        </div>
      </div>
    </div>
  );
}
