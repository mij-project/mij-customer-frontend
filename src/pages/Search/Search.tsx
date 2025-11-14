import React, { useState, useEffect, useCallback } from 'react';
import BottomNavigation from '@/components/common/BottomNavigation';
import { Search as SearchIcon, X, ArrowLeft, Hash } from 'lucide-react';
import { searchContent, getSearchHistory, deleteSearchHistoryItem } from '@/api/search';
import type { SearchResponse, SearchHistoryItem } from '@/api/types/search';
import { useNavigate } from 'react-router-dom';

// Debounce用のユーティリティ関数
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default function Search() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResponse | null>(null);
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const debouncedSearchQuery = useDebounce(searchQuery, 1000);

  // 検索履歴取得
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await getSearchHistory(10);
        setSearchHistory(data.items);
      } catch (err) {
        console.error('Failed to fetch search history:', err);
      }
    };
    fetchHistory();
  }, []);

  // 検索実行
  useEffect(() => {
    const performSearch = async () => {
      if (!debouncedSearchQuery.trim()) {
        setSearchResults(null);
        setShowResults(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const data = await searchContent({
          query: debouncedSearchQuery.trim(),
          type: 'all',
          sort: 'relevance',
        });
        setSearchResults(data);
        setShowResults(true);
      } catch (err: any) {
        setError(err.response?.data?.detail || '検索に失敗しました');
        console.error('Search error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    performSearch();
  }, [debouncedSearchQuery]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults(null);
    setShowResults(false);
  };

  const handleDeleteHistory = async (historyId: string) => {
    try {
      await deleteSearchHistoryItem(historyId);
      setSearchHistory((prev) => prev.filter((item) => item.id !== historyId));
    } catch (err) {
      console.error('Failed to delete search history:', err);
    }
  };

  const renderCreatorResult = (creator: any) => (
    <div
      key={creator.id}
      className="flex items-center p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
      onClick={() => navigate(`/profile?username=${creator.username}`)}
    >
      <img
        src={creator.avatar_url || '/assets/no-image.svg'}
        alt={creator.profile_name}
        className="w-12 h-12 rounded-full object-cover mr-3"
      />
      <div className="flex-1">
        <div className="flex items-center mb-1">
          <span className="font-medium text-gray-900 text-sm">{creator.profile_name}</span>
          {creator.is_verified && <span className="text-primary text-xs ml-1">✓</span>}
        </div>
        <p className="text-xs text-gray-500">
          {creator.followers_count.toLocaleString()} フォロワー ·{' '}
          {creator.posts_count.toLocaleString()} 投稿
        </p>
      </div>
    </div>
  );

  const renderHashtagResult = (hashtag: any) => (
    <div
      key={hashtag.id}
      className="flex items-center px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
    >
      <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center mr-3">
        <Hash className="h-5 w-5 text-pink-500" />
      </div>
      <span className="text-gray-900 text-sm">{hashtag.name}</span>
    </div>
  );

  const renderPostResult = (post: any) => (
    <div
      key={post.id}
      className="flex items-center px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
      onClick={() => navigate(`/post/detail?post_id=${post.id}`)}
    >
      <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center mr-3">
        <img
          src={post.thumbnail_key || '/assets/no-image.svg'}
          alt={post.description || '無題の投稿'}
          className="w-10 h-10 object-cover"
        />
      </div>
      <div className="flex-1">
        <p className="text-gray-900 text-sm line-clamp-1">{post.description || '無題の投稿'}</p>
        <p className="text-xs text-gray-500">by {post.creator.profile_name}</p>
      </div>
    </div>
  );

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-md mx-auto pb-20">
        {/* Search Header */}
        <div className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="p-1 hover:bg-gray-100 rounded-full">
              <ArrowLeft className="h-6 w-6 text-gray-700" />
            </button>
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="検索"
                className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-gray-50"
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="px-4">
          {/* Loading State */}
          {isLoading && (
            <div className="py-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="text-gray-500 mt-4 text-sm">検索中...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="py-12 text-center">
              <p className="text-red-500 text-sm">{error}</p>
            </div>
          )}

          {/* Search Results */}
          {showResults && !isLoading && searchResults ? (
            <div>
              {/* Results found - show sections with matching data */}
              {searchResults.total_results > 0 ? (
                <>
                  {/* Freeword Search Section - Always show when there's a query */}
                  {searchQuery && (
                    <div className="mt-6">
                      <h3 className="text-xs font-medium text-gray-500 mb-3 px-2">
                        フリーワード検索
                      </h3>
                      <div className="flex items-center px-4 py-3 bg-gray-50 rounded-lg">
                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center mr-3 border border-gray-200">
                          <span className="text-gray-600 text-lg">T</span>
                        </div>
                        <span className="text-gray-900 text-sm">"{searchQuery}"</span>
                      </div>
                    </div>
                  )}

                  {/* Posts Section - Show if posts are found */}
                  {searchResults.posts && searchResults.posts.total > 0 && (
                    <div className="mt-6">
                      <h3 className="text-xs font-medium text-gray-500 mb-3 px-2">
                        投稿 ({searchResults.posts.total})
                      </h3>
                      <div className="bg-white rounded-lg overflow-hidden border border-gray-100">
                        {searchResults.posts.items.map(renderPostResult)}
                      </div>
                    </div>
                  )}

                  {/* Tags Section - Only show if hashtags are found */}
                  {searchResults.hashtags && searchResults.hashtags.total > 0 && (
                    <div className="mt-6">
                      <h3 className="text-xs font-medium text-gray-500 mb-3 px-2">タグ</h3>
                      <div className="bg-white rounded-lg overflow-hidden border border-gray-100">
                        {searchResults.hashtags.items.map(renderHashtagResult)}
                      </div>
                    </div>
                  )}

                  {/* Creators Section - Only show if creators are found */}
                  {searchResults.creators && searchResults.creators.total > 0 && (
                    <div className="mt-6 mb-6">
                      <h3 className="text-xs font-medium text-gray-500 mb-3 px-2">クリエイター</h3>
                      <div className="bg-white rounded-lg overflow-hidden border border-gray-100">
                        {searchResults.creators.items.map(renderCreatorResult)}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                // No Results
                <div className="py-16 text-center">
                  <SearchIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-sm">
                    検索に一致するものが見つかりませんでした。
                  </p>
                </div>
              )}
            </div>
          ) : !showResults && !isLoading ? (
            // Empty state - no search yet
            <div className="py-16 text-center">
              <SearchIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-sm">キーワードを入力して検索してください</p>
            </div>
          ) : null}
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
}
