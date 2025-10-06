import { useState, useEffect, useRef } from "react";
import { useDelusionWebSocket } from "@/hooks/useDelusionWebSocket";
import { getDelusionMessages } from "@/api/endpoints/conversation";
import { getAccountInfo } from "@/api/endpoints/account";
import { MessageResponse } from "@/api/types/conversation";

export default function DelusionMessage() {
  const { messages: wsMessages, sendMessage, isConnected, error } = useDelusionWebSocket();
  const [allMessages, setAllMessages] = useState<MessageResponse[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 現在のユーザー情報と初期メッセージを取得
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // 現在のユーザー情報を取得
        const accountInfo = await getAccountInfo();
        setCurrentUserId(accountInfo.profile_info.username);

        // メッセージ一覧を取得
        const response = await getDelusionMessages(0, 50);
        setAllMessages(response.data);
      } catch (err) {
        console.error("Failed to fetch initial data:", err);
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
        const newMessages = wsMessages.filter(
          (wsMsg) => !prev.some((msg) => msg.id === wsMsg.id)
        );
        return [...prev, ...newMessages];
      });
    }
  }, [wsMessages]);

  // メッセージが更新されたら最下部にスクロール
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [allMessages]);

  // メッセージ送信
  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    sendMessage(inputText);
    setInputText("");
  };

  // Enterキーで送信
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // タイムスタンプをフォーマット
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("ja-JP", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

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
      <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-gray-300 rounded-full mr-3 flex items-center justify-center">
            <span className="text-white font-bold">管</span>
          </div>
          <div>
            <h1 className="font-bold text-lg">妄想の間</h1>
            <p className="text-xs text-gray-500">
              {isConnected ? (
                <span className="text-green-500">● オンライン</span>
              ) : (
                <span className="text-red-500">● オフライン</span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* エラー表示 */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 text-sm">
          {error}
        </div>
      )}

      {/* メッセージ一覧 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {allMessages.map((message) => {
          // 送信者が現在のユーザーかどうかを判定
          const isCurrentUser = currentUserId && message.sender_user_id === currentUserId;

          return (
            <div
              key={message.id}
              className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`flex ${isCurrentUser ? "flex-row-reverse" : "flex-row"} items-end max-w-[70%]`}
              >
                {/* アバター */}
                {!isCurrentUser && (
                  <div className="w-8 h-8 bg-gray-300 rounded-full mr-2 flex-shrink-0 flex items-center justify-center">
                    {message.sender_avatar ? (
                      <img
                        src={message.sender_avatar}
                        alt={message.sender_username || "Admin"}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-white text-xs">管</span>
                    )}
                  </div>
                )}

                {/* メッセージバブル */}
                <div>
                  {!isCurrentUser && (
                    <div className="text-xs text-gray-500 mb-1 ml-2">
                      {message.sender_profile_name || message.sender_username || "管理人"}
                    </div>
                  )}

                  <div
                    className={`px-4 py-2 rounded-2xl ${
                      isCurrentUser
                        ? "bg-green-500 text-white"
                        : "bg-white text-gray-900"
                    }`}
                  >
                    <p className="break-words whitespace-pre-wrap">
                      {message.body_text}
                    </p>
                  </div>

                  <div
                    className={`text-xs text-gray-400 mt-1 ${
                      isCurrentUser ? "text-right mr-2" : "ml-2"
                    }`}
                  >
                    {formatTimestamp(message.created_at)}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* 入力エリア */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="メッセージを入力..."
            className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            disabled={!isConnected}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputText.trim() || !isConnected}
            className="bg-green-500 text-white px-6 py-2 rounded-full font-semibold hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
          >
            送信
          </button>
        </div>
      </div>
    </div>
  );
}