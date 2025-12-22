import React, { useState, useEffect, useCallback, useRef } from 'react';
import BottomNavigation from '@/components/common/BottomNavigation';
import PostGrid from '@/components/common/PostGrid';
import CreatorSearchCard from '@/components/search/CreatorSearchCard';
import { Search as SearchIcon, X, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { searchContent } from '@/api/search';
import type { SearchResponse, SearchCategoryResponse } from '@/api/types/search';
import { useNavigate } from 'react-router-dom';
import type { PostCardProps } from '@/components/common/PostCard';
import { getSearchCategories } from '@/api/search';
import { Button } from '@/components/ui/button';

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
  CURRENT_PAGE: 'search_current_page',
};

export default function Search() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<SearchCategoryResponse[] | null>(null);
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
  const [currentPage, setCurrentPage] = useState(() => {
    const saved = sessionStorage.getItem(STORAGE_KEYS.CURRENT_PAGE);
    return saved ? parseInt(saved, 10) : 1;
  });
  const inputRef = useRef<HTMLInputElement>(null);
  const isInitialMount = useRef(true); // 初回マウント判定用
  const categoriesFetched = useRef(false); // カテゴリ取得済みフラグ
  const prevDebouncedQuery = useRef<string>(''); // 前回の検索クエリ
  const prevActiveTab = useRef<TabType>('posts'); // 前回のタブ

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

  // 現在のページをsessionStorageに保存
  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEYS.CURRENT_PAGE, currentPage.toString());
  }, [currentPage]);

  // タブ切り替え時または検索クエリ変更時にページを1にリセット
  useEffect(() => {
    // 初回マウント時は前回の値を設定してスキップ
    if (isInitialMount.current) {
      prevDebouncedQuery.current = debouncedSearchQuery;
      prevActiveTab.current = activeTab;
      return;
    }

    // 実際にタブまたは検索クエリが変更された場合のみリセット
    if (prevDebouncedQuery.current !== debouncedSearchQuery || prevActiveTab.current !== activeTab) {
      setCurrentPage(1);
      sessionStorage.setItem(STORAGE_KEYS.CURRENT_PAGE, '1');
      prevDebouncedQuery.current = debouncedSearchQuery;
      prevActiveTab.current = activeTab;
    }
  }, [debouncedSearchQuery, activeTab]);

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
        // タブに応じて検索タイプを設定
        const searchType = 
          activeTab === 'creators' ? 'creators' :
          activeTab === 'paid_posts' ? 'posts' :
          'posts'; // postsタブの場合は投稿のみ検索
        
        const data = await searchContent({
          query: debouncedSearchQuery.trim(),
          type: searchType,
          sort: 'relevance',
          page: currentPage,
          per_page: 10,
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
  }, [debouncedSearchQuery, activeTab, currentPage]);


  useEffect(() => {
    // 既に取得済み、または取得中の場合は再取得しない
    if (categoriesFetched.current || categories !== null) {
      return;
    }

    const fetchCategories = async () => {
      try {
        categoriesFetched.current = true; // 取得開始前にフラグを設定
        const response = await getSearchCategories();
          // レスポンスのitemsプロパティからカテゴリー配列を取得
        setCategories(response.items || []);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
        // エラーが発生しても無限ループを防ぐため、フラグは維持
        categoriesFetched.current = true;
      }
    };
    
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 依存配列を空にして、マウント時に1回だけ実行


  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults(null);
    setShowResults(false);
    setCurrentPage(1);
    // SessionStorageもクリア
    sessionStorage.removeItem(STORAGE_KEYS.SEARCH_QUERY);
    sessionStorage.removeItem(STORAGE_KEYS.SEARCH_RESULTS);
    sessionStorage.removeItem(STORAGE_KEYS.SHOW_RESULTS);
    sessionStorage.setItem(STORAGE_KEYS.CURRENT_PAGE, '1');
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setCurrentPage(1); // タブ切り替え時にページをリセット
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 現在のタブの総件数を取得
  const getTotalCount = (): number => {
    if (!searchResults) return 0;
    if (activeTab === 'posts' && searchResults.posts) {
      return searchResults.posts.total;
    }
    if (activeTab === 'creators' && searchResults.creators) {
      return searchResults.creators.total;
    }
    if (activeTab === 'paid_posts' && searchResults.posts) {
      return searchResults.posts.total;
    }
    return 0;
  };

  // 現在のタブのhas_more状態を取得
  const getHasNext = (): boolean => {
    if (!searchResults) return false;
    if (activeTab === 'posts' && searchResults.posts) {
      return searchResults.posts.has_more;
    }
    if (activeTab === 'creators' && searchResults.creators) {
      return searchResults.creators.has_more;
    }
    if (activeTab === 'paid_posts' && searchResults.posts) {
      return searchResults.posts.has_more;
    }
    return false;
  };

  const totalCount = getTotalCount();
  const itemsPerPage = 10;
  const totalPages = Math.ceil(totalCount / itemsPerPage);
  const hasNext = getHasNext();
  const hasPrevious = currentPage > 1;

  // ページネーションボタンを生成（総ページ数に応じて表示）
  const getPageNumbers = () => {
    const pages: number[] = [];
    
    if (totalPages === 0) return pages;

    const maxVisiblePages = 7; // 表示する最大ページ数
    let startPage = 1;
    let endPage = totalPages;

    if (totalPages <= maxVisiblePages) {
      // 総ページ数が少ない場合はすべて表示
      startPage = 1;
      endPage = totalPages;
    } else {
      // 現在のページを中心に表示
      const halfVisible = Math.floor(maxVisiblePages / 2);
      
      if (currentPage <= halfVisible) {
        // 最初の方のページ
        startPage = 1;
        endPage = maxVisiblePages;
      } else if (currentPage >= totalPages - halfVisible) {
        // 最後の方のページ
        startPage = totalPages - maxVisiblePages + 1;
        endPage = totalPages;
      } else {
        // 中間のページ
        startPage = currentPage - halfVisible;
        endPage = currentPage + halfVisible;
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  const handlePostClick = (postId: string) => {
    navigate(`/post/detail?post_id=${postId}`);
  };

  const handleCreatorClick = (username: string) => {
    navigate(`/profile?username=${username}`);
  };

  const handleCategoryClick = (category: SearchCategoryResponse) => {
    navigate(`/ranking/posts/detail?category=${encodeURIComponent(category.name)}&category_id=${category.id}`);
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

                  {/* Pagination Section */}
                  {totalPages > 1 && (
                    <div className="mt-6 mb-4 flex justify-center items-center gap-2 flex-wrap">
                      {/* 前へボタン */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={isLoading || !hasPrevious}
                        aria-label="前のページ"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>

                      {/* 最初のページが表示範囲外の場合は最初のページと省略記号を表示 */}
                      {getPageNumbers().length > 0 && getPageNumbers()[0] > 1 && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(1)}
                            disabled={isLoading}
                            className="min-w-[40px]"
                          >
                            1
                          </Button>
                          {getPageNumbers()[0] > 2 && (
                            <span className="px-2 text-gray-500">...</span>
                          )}
                        </>
                      )}

                      {/* ページ番号ボタン */}
                      {getPageNumbers().map((pageNum) => (
                        <Button
                          key={pageNum}
                          variant={pageNum === currentPage ? "default" : "outline"}
                          size="sm"
                          onClick={() => handlePageChange(pageNum)}
                          disabled={isLoading}
                          className="min-w-[40px]"
                        >
                          {pageNum}
                        </Button>
                      ))}

                      {/* 最後のページが表示範囲外の場合は省略記号と最後のページを表示 */}
                      {getPageNumbers().length > 0 && getPageNumbers()[getPageNumbers().length - 1] < totalPages && (
                        <>
                          {getPageNumbers()[getPageNumbers().length - 1] < totalPages - 1 && (
                            <span className="px-2 text-gray-500">...</span>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(totalPages)}
                            disabled={isLoading}
                            className="min-w-[40px]"
                          >
                            {totalPages}
                          </Button>
                        </>
                      )}

                      {/* 次へボタン */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={isLoading || !hasNext}
                        aria-label="次のページ"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
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
              <div>
                {/* Empty state message */}
                <div className="py-4 text-center">
                  <SearchIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-sm">キーワードを入力して検索してください</p>
                </div>
              </div>
            )
          )}

          {/* おすすめカテゴリー */}
          {categories && categories.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-bold text-gray-900 mb-4">人気検索</h2>
              <div className="grid grid-cols-4 gap-x-2 gap-y-4">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryClick(category)}
                    className="px-2 py-2 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-full text-sm font-medium transition-all duration-200 border border-primary/20 hover:border-primary text-center"
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
}
