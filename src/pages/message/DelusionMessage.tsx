import { useState, useEffect, useRef } from 'react';
import { useDelusionWebSocket } from '@/hooks/useDelusionWebSocket';
import { getDelusionMessages } from '@/api/endpoints/conversation';
import { getAccountInfo } from '@/api/endpoints/account';
import { MessageResponse } from '@/api/types/conversation';
import { me } from '@/api/endpoints/auth';
import convertDatetimeToLocalTimezone from '@/utils/convertDatetimeToLocalTimezone';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function DelusionMessage() {
  const navigate = useNavigate();
  const { messages: wsMessages, sendMessage, isConnected, error } = useDelusionWebSocket();
  const [allMessages, setAllMessages] = useState<MessageResponse[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 現在のユーザー情報と初期メッセージを取得
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const user = await me();
        setCurrentUserId(user.data.id);

        // メッセージ一覧を取得
        const response = await getDelusionMessages(0, 50);
        setAllMessages(response.data);
      } catch (err) {
        console.error('Failed to fetch initial data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, []);

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

  // Enterキーのハンドリング
  // PC: Ctrl/Cmd + Enter で送信、Enter で改行
  // モバイル: 送信ボタンで送信、Enter で改行
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Ctrl+Enter (Windows) または Cmd+Enter (Mac) で送信
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSendMessage();
    }
    // Enter のみの場合は改行（デフォルト動作）
  };

  // (tuỳ chọn) auto-resize đơn giản
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;

    el.style.height = "0px";

    const style = window.getComputedStyle(el);
    const lineHeight = parseFloat(style.lineHeight || "20");
    const paddingTop = parseFloat(style.paddingTop || "0");
    const paddingBottom = parseFloat(style.paddingBottom || "0");

    const maxHeight = lineHeight * 5 + paddingTop + paddingBottom;

    const nextHeight = Math.min(el.scrollHeight, maxHeight);
    el.style.height = `${nextHeight}px`;

    el.style.overflowY = el.scrollHeight > maxHeight ? "auto" : "hidden";
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
      <div className="flex items-center p-4 border-b border-gray-200 w-full fixed top-0 left-0 right-0 bg-white z-10">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className='w-10 flex justify-center'>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center w-full justify-center">
          <h1 className="text-xl font-semibold bg-white text-center">
            妄想の種
          </h1>
        </div>
        <Button variant="ghost" size="sm" onClick={() => { console.log('click'); }} className='ml-10 w-10 flex justify-center cursor-none' disabled>
        </Button>
      </div>

      {/* エラー表示 */}
      {error && (
        <div className="fixed top-16 left-0 right-0 z-10 bg-red-100 border border-red-400 text-red-700 px-4 py-2 text-sm">
          {error}
        </div>
      )}

      {/* メッセージ一覧 */}
      <div className={`flex-1 overflow-y-auto p-4 space-y-4 ${error ? 'pt-24' : 'pt-16'} pb-24`}>
        {allMessages.map((message) => {
          // システムメッセージ（sender_user_id と sender_admin_id が両方null）かどうかを判定
          const isSystemMessage = !message.sender_user_id && !message.sender_admin_id;
          // 管理者メッセージかどうかを判定
          const isAdminMessage = message.sender_admin_id != null;
          // 送信者が現在のユーザーかどうかを判定
          const isCurrentUser = currentUserId && message.sender_user_id === currentUserId;

          // システムメッセージの場合は中央に特別なスタイルで表示
          if (isSystemMessage) {
            return (
              <div key={message.id} className="flex justify-center my-6">
                <div className="max-w-[100%] bg-secondary rounded-lg p-4 shadow-sm">
                  <p className="text-gray-800 text-sm whitespace-pre-wrap">{message.body_text}</p>
                </div>
              </div>
            );
          }

          // 管理者メッセージと通常のメッセージ（両方とも左右で表示）
          return (
            <div
              key={message.id}
              className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`flex ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'} items-end max-w-[90%]`}
              >
                {/* メッセージバブル */}
                <div>
                  {/* 管理者メッセージの場合は名前を表示 */}
                  {isAdminMessage && !isCurrentUser && (
                    <div className="text-xs text-gray-500 mb-1 ml-2">運営</div>
                  )}
                  <div
                    className={`px-4 py-2 rounded-2xl ${isCurrentUser ? 'bg-primary text-white' : 'bg-white text-gray-900'
                      }`}
                  >
                    <p className="break-words whitespace-pre-wrap">{message.body_text}</p>
                  </div>

                  <div
                    className={`text-xs text-gray-400 mt-1 ${isCurrentUser ? 'text-right mr-2' : 'ml-2'
                      }`}
                  >
                    {formatTimestamp(convertDatetimeToLocalTimezone(message.created_at))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* 入力エリア */}
      {/* <div className="fixed bottom-0 left-0 right-0 z-10 bg-white border-t border-gray-200 p-4">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="メッセージを入力..."
            className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
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
      </div> */}
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
              text-black
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
