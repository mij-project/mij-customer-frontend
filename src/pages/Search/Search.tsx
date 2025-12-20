import React, { useState, useEffect, useCallback, useRef } from 'react';
import BottomNavigation from '@/components/common/BottomNavigation';
import PostGrid from '@/components/common/PostGrid';
import CreatorSearchCard from '@/components/search/CreatorSearchCard';
import { Search as SearchIcon, X, ArrowLeft } from 'lucide-react';
import { searchContent } from '@/api/search';
import type { SearchResponse } from '@/api/types/search';
import { useNavigate } from 'react-router-dom';
import type { PostCardProps } from '@/components/common/PostCard';

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

type TabType = 'posts' | 'creators' | 'paid_posts';

// SessionStorageのキー
const STORAGE_KEYS = {
  SEARCH_QUERY: 'search_query',
  ACTIVE_TAB: 'search_active_tab',
  SEARCH_RESULTS: 'search_results',
  SHOW_RESULTS: 'search_show_results',
};

export default function Search() {
  const navigate = useNavigate();

  // SessionStorageから初期値を復元
  const [searchQuery, setSearchQuery] = useState(() => {
    const saved = sessionStorage.getItem(STORAGE_KEYS.SEARCH_QUERY);
    return saved || '';
  });

  const [activeTab, setActiveTab] = useState<TabType>(() => {
    const saved = sessionStorage.getItem(STORAGE_KEYS.ACTIVE_TAB);
    return (saved as TabType) || 'posts';
  });

  const [searchResults, setSearchResults] = useState<SearchResponse | null>(() => {
    const saved = sessionStorage.getItem(STORAGE_KEYS.SEARCH_RESULTS);
    return saved ? JSON.parse(saved) : null;
  });

  const [showResults, setShowResults] = useState(() => {
    const saved = sessionStorage.getItem(STORAGE_KEYS.SHOW_RESULTS);
    return saved === 'true';
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isInitialMount = useRef(true); // 初回マウント判定用

  const debouncedSearchQuery = useDebounce(searchQuery, 1000);

  // 検索クエリをsessionStorageに保存
  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEYS.SEARCH_QUERY, searchQuery);
  }, [searchQuery]);

  // アクティブタブをsessionStorageに保存
  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEYS.ACTIVE_TAB, activeTab);
  }, [activeTab]);

  // 検索結果をsessionStorageに保存
  useEffect(() => {
    if (searchResults) {
      sessionStorage.setItem(STORAGE_KEYS.SEARCH_RESULTS, JSON.stringify(searchResults));
    } else {
      sessionStorage.removeItem(STORAGE_KEYS.SEARCH_RESULTS);
    }
  }, [searchResults]);

  // showResultsをsessionStorageに保存
  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEYS.SHOW_RESULTS, String(showResults));
  }, [showResults]);

  // 検索実行
  useEffect(() => {
    // 初回マウント時かつsessionStorageに結果がある場合はスキップ
    if (isInitialMount.current) {
      const savedResults = sessionStorage.getItem(STORAGE_KEYS.SEARCH_RESULTS);
      if (savedResults && searchQuery.trim()) {
        isInitialMount.current = false;
        return; // sessionStorageから復元済みなので検索をスキップ
      }
      isInitialMount.current = false;
    }

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
          type: activeTab === 'creators' ? 'creators' : activeTab === 'paid_posts' ? 'posts' : 'all',
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
  }, [debouncedSearchQuery, activeTab]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults(null);
    setShowResults(false);
    // SessionStorageもクリア
    sessionStorage.removeItem(STORAGE_KEYS.SEARCH_QUERY);
    sessionStorage.removeItem(STORAGE_KEYS.SEARCH_RESULTS);
    sessionStorage.removeItem(STORAGE_KEYS.SHOW_RESULTS);
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
  };

  const handlePostClick = (postId: string) => {
    navigate(`/post/detail?post_id=${postId}`);
  };

  const handleCreatorClick = (username: string) => {
    navigate(`/profile?username=${username}`);
  };

  // PostGridに渡すデータを変換
  const convertPostsToGridFormat = (posts: any[]): PostCardProps[] => {
    return posts.map((post) => ({
      id: post.id,
      post_type: post.post_type,
      thumbnail_url: post.thumbnail_key,
      description: post.description,
      video_duration: post.video_duration,
      created_at: post.created_at,
      likes: post.likes_count,
      views: post.views_count,
      variant: 'simple' as const,
      showTitle: true,
      showDate: true,
      creator: {
        name: post.creator.profile_name,
        username: post.creator.username,
        avatar: post.creator.avatar_url,
        verified: post.creator.is_verified || false,
        official: post.official,
      },
    }));
  };

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
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                autoFocus={false}
                placeholder="検索"
                className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-full text-base focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-gray-50"
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

        {/* Tab Navigation */}
        <div className="px-4 py-3 bg-white max-w-md mx-auto border-b border-gray-200 sticky top-[60px] z-10">
          <div className="flex bg-gray-100 rounded-full p-1.5 gap-2">
            <button
              onClick={() => handleTabChange('posts')}
              className={`flex-1 px-6 py-2 text-center text-xs font-semibold rounded-full transition-all whitespace-nowrap ${
                activeTab === 'posts'
                  ? 'bg-primary text-white shadow-lg'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              投稿
            </button>
            <button
              onClick={() => handleTabChange('creators')}
              className={`flex-1 px-6 py-2 text-center text-xs font-semibold rounded-full transition-all whitespace-nowrap ${
                activeTab === 'creators'
                  ? 'bg-primary text-white shadow-lg'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              クリエイター
            </button>
            <button
              onClick={() => handleTabChange('paid_posts')}
              className={`flex-1 px-6 py-2 text-center text-xs font-semibold rounded-full transition-all whitespace-nowrap ${
                activeTab === 'paid_posts'
                  ? 'bg-primary text-white shadow-lg'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              単品販売
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="px-4 py-4">
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
              {searchResults.total_results > 0 ? (
                <>
                  {/* 投稿タブ */}
                  {activeTab === 'posts' &&
                    searchResults.posts &&
                    searchResults.posts.total > 0 && (
                      <div>
                        <h3 className="text-base font-bold text-gray-900 mb-4">
                          最近の投稿 ({searchResults.posts.total.toLocaleString()}件)
                        </h3>
                        <PostGrid
                          posts={convertPostsToGridFormat(searchResults.posts.items)}
                          columns={2}
                          onPostClick={handlePostClick}
                          onCreatorClick={handleCreatorClick}
                          className="-mx-3 sm:-mx-5 lg:-mx-7"
                        />
                      </div>
                    )}

                  {/* クリエイタータブ */}
                  {activeTab === 'creators' &&
                    searchResults.creators &&
                    searchResults.creators.total > 0 && (
                      <div>
                        <h3 className="text-base font-bold text-gray-900 mb-4">
                          クリエイター ({searchResults.creators.total.toLocaleString()}件)
                        </h3>
                        <div className="bg-white rounded-lg overflow-hidden border border-gray-100">
                          {searchResults.creators.items.map((creator: any) => (
                            <CreatorSearchCard
                              key={creator.id}
                              id={creator.id}
                              avatar_url={creator.avatar_url}
                              profile_name={creator.profile_name}
                              username={creator.username}
                              bio={creator.bio}
                              is_verified={creator.is_verified}
                              official={creator.official}
                              followers_count={creator.followers_count}
                              posts_count={creator.posts_count}
                              recent_posts={creator.recent_posts}
                              onClick={handleCreatorClick}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                  {/* 単品販売タブ */}
                  {activeTab === 'paid_posts' &&
                    searchResults.posts &&
                    searchResults.posts.total > 0 && (
                      <div>
                        <h3 className="text-base font-bold text-gray-900 mb-4">
                          単品販売 ({searchResults.posts.total.toLocaleString()}件)
                        </h3>
                        <PostGrid
                          posts={convertPostsToGridFormat(searchResults.posts.items)}
                          columns={2}
                          onPostClick={handlePostClick}
                          onCreatorClick={handleCreatorClick}
                        />
                      </div>
                    )}

                  {/* No Results for specific tab */}
                  {((activeTab === 'posts' &&
                    (!searchResults.posts || searchResults.posts.total === 0)) ||
                    (activeTab === 'creators' &&
                      (!searchResults.creators || searchResults.creators.total === 0)) ||
                    (activeTab === 'paid_posts' &&
                      (!searchResults.posts || searchResults.posts.total === 0))) && (
                    <div className="py-16 text-center">
                      <SearchIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 text-sm">
                        {activeTab === 'posts' && '投稿が見つかりませんでした'}
                        {activeTab === 'creators' && 'クリエイターが見つかりませんでした'}
                        {activeTab === 'paid_posts' && '単品販売の投稿が見つかりませんでした'}
                      </p>
                    </div>
                  )}
                </>
              ) : (
                // No Results at all
                <div className="py-16 text-center">
                  <SearchIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-sm">
                    検索に一致するものが見つかりませんでした。
                  </p>
                </div>
              )}
            </div>
          ) : (
            !showResults &&
            !isLoading && (
              // Empty state - no search yet
              <div className="py-16 text-center">
                <SearchIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-sm">キーワードを入力して検索してください</p>
              </div>
            )
          )}
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
}
