import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserConversations } from '@/api/endpoints/conversation';
import { UserConversation } from '@/api/types/conversation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Search, X, Send } from 'lucide-react';
import convertDatetimeToLocalTimezone from '@/utils/convertDatetimeToLocalTimezone';
import { useDebounce } from '@/hooks/useDebounce';
import Header from '@/components/common/Header';
import BottomNavigation from '@/components/common/BottomNavigation';
import { useAuth } from '@/providers/AuthContext';
import { UserRole } from '@/utils/userRole';

export default function ConversationList() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [conversations, setConversations] = useState<UserConversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);
  const [skip, setSkip] = useState(0);
  const [searchValue, setSearchValue] = useState('');
  const [sortValue, setSortValue] = useState('last_message_desc');
  const [unreadOnly, setUnreadOnly] = useState(false);
  const debouncedSearchValue = useDebounce(searchValue, 500);

  const observerTarget = useRef<HTMLDivElement>(null);
  const commonHeaderRef = useRef<HTMLDivElement>(null);
  const searchHeaderRef = useRef<HTMLDivElement>(null);
  const [commonHeaderHeight, setCommonHeaderHeight] = useState(0);
  const [searchHeaderHeight, setSearchHeaderHeight] = useState(0);
  const totalHeaderHeight = commonHeaderHeight + searchHeaderHeight;

  const limit = 20;

  // ヘッダーの高さを取得
  useEffect(() => {
    const updateHeaderHeight = () => {
      const commonHeight = commonHeaderRef.current?.offsetHeight || 0;
      const searchHeight = searchHeaderRef.current?.offsetHeight || 0;
      setCommonHeaderHeight(commonHeight);
      setSearchHeaderHeight(searchHeight);
    };

    // 初回実行
    updateHeaderHeight();

    // 少し遅延させて再計算（初回レンダリング後に正確な高さを取得）
    const timer = setTimeout(updateHeaderHeight, 100);

    const resizeObserver = new ResizeObserver(() => {
      updateHeaderHeight();
    });

    if (commonHeaderRef.current) {
      resizeObserver.observe(commonHeaderRef.current);
    }
    if (searchHeaderRef.current) {
      resizeObserver.observe(searchHeaderRef.current);
    }

    return () => {
      clearTimeout(timer);
      resizeObserver.disconnect();
    };
  }, []);

  // 会話リストを取得
  const fetchConversations = useCallback(
    async (resetList = false) => {
      try {
        if (resetList) {
          setIsLoading(true);
          setSkip(0);
        } else {
          setIsLoadingMore(true);
        }

        const currentSkip = resetList ? 0 : skip;

        const response = await getUserConversations({
          skip: currentSkip,
          limit,
          search: debouncedSearchValue || undefined,
          sort: sortValue,
          unread_only: unreadOnly,
        });

        const newConversations = response.data.data;

        if (resetList) {
          setConversations(newConversations);
          setSkip(newConversations.length);
        } else {
          setConversations((prev) => [...prev, ...newConversations]);
          setSkip((prevSkip) => prevSkip + newConversations.length);
        }

        setTotal(response.data.total);
        setHasMore(newConversations.length === limit);
      } catch (error) {
        console.error('Failed to fetch conversations:', error);
        // エラー時も空配列を設定
        if (resetList) {
          setConversations([]);
        }
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    // skipを依存配列から除外して無限ループを防ぐ
    [debouncedSearchValue, sortValue, unreadOnly, limit]
  );

  // 初回読み込みと検索・フィルター・ソート変更時
  useEffect(() => {
    fetchConversations(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchValue, sortValue, unreadOnly]);

  // 無限スクロール
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore && !isLoading) {
          fetchConversations(false);
        }
      },
      { threshold: 1.0 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [hasMore, isLoadingMore, isLoading, fetchConversations]);

  // タイムスタンプをフォーマット
  const formatTimestamp = (timestamp: string | null) => {
    if (!timestamp) return '';

    const date = new Date(convertDatetimeToLocalTimezone(timestamp));
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = diffInMs / (1000 * 60 * 60);
    const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('ja-JP', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } else if (diffInDays < 7) {
      return `${Math.floor(diffInDays)}日前`;
    } else {
      return date.toLocaleDateString('ja-JP', {
        month: 'numeric',
        day: 'numeric',
      });
    }
  };

  // メッセージ内容を短縮表示
  const truncateMessage = (text: string | null) => {
    if (!text) return '';
    return text.length > 50 ? `${text.substring(0, 50)}...` : text;
  };

  const handleConversationClick = (conversationId: string) => {
    navigate(`/message/conversation/${conversationId}`, { state: { conversationId } });
  };

  const handleSearchClear = () => {
    setSearchValue('');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-500">読み込み中...</div>
      </div>   
    );
  }

  return (
    <div className="flex flex-col h-screen bg-white">
      <div ref={commonHeaderRef}>
        <Header />
      </div>
      {/* 検索バー */}
      <div
        ref={searchHeaderRef}
        className="flex flex-col border-b border-gray-200 w-full fixed left-0 right-0 bg-white z-10"
        style={{ top: `${commonHeaderHeight}px` }}
      >
        {/* タイトル行 */}
        <div className="flex items-center p-4">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="w-10 flex justify-center">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center w-full justify-center">
            <h1 className="text-xl font-semibold text-center">メッセージ</h1>
          </div>
          <div className="w-10" />
        </div>

        {/* 検索バー */}
        <div className="px-4 pb-3 pt-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="会話を検索"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="pl-10 pr-10 bg-gray-100 border-none rounded-full"
            />
            {searchValue && (
              <button
                onClick={handleSearchClear}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

        {/* フィルター・ソートボタン */}
        <div className="flex items-center gap-2 px-4 pb-3">
          <button
            onClick={() => setUnreadOnly(!unreadOnly)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
              unreadOnly
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            未読のみ
          </button>
          <button
            onClick={() =>
              setSortValue(sortValue === 'last_message_desc' ? 'last_message_asc' : 'last_message_desc')
            }
            className="px-4 py-1.5 rounded-full text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
          >
            {sortValue === 'last_message_desc' ? '新しい順' : '古い順'}
          </button>
        </div>
      </div>

      {/* 会話リスト */}
      <div
        className="flex-1 overflow-y-auto"
        style={{ paddingTop: `${totalHeaderHeight}px` }}
      >
        {conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <p className="text-center">DMの会話履歴がありません</p>
            {searchValue && (
              <p className="text-sm text-gray-400 mt-2">検索条件を変更してください</p>
            )}
          </div>
        ) : (
          <>
            {conversations.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => handleConversationClick(conversation.id)}
                className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 transition"
              >
                {/* アバター */}
                <div className="flex-shrink-0">
                  {conversation.partner_avatar ? (
                    <img
                      src={conversation.partner_avatar}
                      alt={conversation.partner_name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center">
                      <span className="text-lg font-medium text-gray-700">
                        {conversation.partner_name[0]?.toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>

                {/* メッセージ内容 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900 truncate">
                        {conversation.partner_name}
                      </span>
                      {conversation.unread_count > 0 && (
                        <span className="bg-primary text-white text-xs font-medium px-2 py-0.5 rounded-full">
                          {conversation.unread_count}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-500 flex-shrink-0">
                      {formatTimestamp(conversation.last_message_at)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 truncate">
                    {truncateMessage(conversation.last_message_text)}
                  </p>
                </div>
              </div>
            ))}

            {/* 無限スクロール トリガー */}
            <div ref={observerTarget} className="h-4" />

            {/* ローディング表示 */}
            {isLoadingMore && (
              <div className="flex items-center justify-center py-4">
                <div className="text-gray-500 text-sm">読み込み中...</div>
              </div>
            )}            
          </>
        )}
      </div>

      {/* 一斉送信ボタン (クリエイター専用) */}
      {user?.role === UserRole.CREATOR && (
        <button
          onClick={() => navigate('/message/bulk-send-email')}
          className="fixed bottom-20 right-4 z-20 bg-primary hover:bg-primary/90 text-white rounded-full px-6 py-3 shadow-lg flex items-center gap-2 transition-all hover:shadow-xl"
        >
          <Send className="h-5 w-5" />
          <span className="font-medium">一斉送信</span>
        </button>
      )}

      <BottomNavigation />
    </div>
  );
}
