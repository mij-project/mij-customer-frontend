import React, { useState, useEffect, use, useCallback } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import Header from '@/components/common/Header';
import BottomNavigation from '@/components/common/BottomNavigation';
import FilterSection from '@/features/ranking/section/FilterSection';
import PostsSection from '@/components/common/PostsSection';
import { RankingOverallResponse, TabItem } from '@/features/ranking/types';
import { getPostsRankingDetail } from '@/api/endpoints/ranking';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import AuthDialog from '@/components/auth/AuthDialog';

export default function PostRankingDetail() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  // URLパラメータまたはlocation.stateからcategoryとcategory_idを取得
  const category = searchParams.get('category') || location.state?.category || '総合ランキング';
  const category_id = searchParams.get('category_id') || location.state?.category_id || '';

  const [activeTimePeriod, setActiveTimePeriod] = useState('all');
  const [posts, setPosts] = useState<any[]>([]);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);

  // URLパラメータからページを取得（デフォルト: 1）
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  const fetchPosts = useCallback(
    async (pageNum: number) => {
      try {
        setLoading(true);
        const category_param = !category_id ? 'overall' : category_id.toString();
        const term_param = activeTimePeriod === 'all' ? 'all_time' : activeTimePeriod;
        const data = await getPostsRankingDetail(category_param, term_param, pageNum, 20);
        setPosts(data.posts);
        setHasNext(data.has_next);
        setHasPrevious(data.has_previous);
      } catch (err) {
        console.error('Posts ranking detail fetch error:', err);
        setPosts([]);
        setHasNext(false);
        setHasPrevious(false);
      } finally {
        setLoading(false);
      }
    },
    [activeTimePeriod, category, category_id]
  );

  useEffect(() => {
    fetchPosts(currentPage);
  }, [currentPage, fetchPosts]);

  const tabItems: TabItem[] = [
    { id: 'posts', label: '投稿', isActive: true },
    { id: 'creators', label: 'クリエイター', isActive: false, linkTo: '/ranking/creators/detail' },
  ];

  const timePeriodTabs: TabItem[] = [
    { id: 'daily', label: '日間', isActive: activeTimePeriod === 'daily' },
    { id: 'weekly', label: '週間', isActive: activeTimePeriod === 'weekly' },
    { id: 'monthly', label: '月間', isActive: activeTimePeriod === 'monthly' },
    { id: 'all', label: '全期間', isActive: activeTimePeriod === 'all' },
  ];

  const handleTabClick = (tabId: string) => {
    const tabLink = tabItems.find((tab) => tab.id === tabId)?.linkTo;
    if (tabLink) {
      navigate(tabLink, { state: { category: category, category_id: category_id } });
    }
  };

  const handleTimePeriodClick = (periodId: string) => {
    const params: Record<string, string> = { page: '1' };
    if (category) params.category = category;
    if (category_id) params.category_id = category_id;
    setSearchParams(params);
    setActiveTimePeriod(periodId);
  };

  const handlePageChange = (newPage: number) => {
    const params: Record<string, string> = { page: newPage.toString() };
    if (category) params.category = category;
    if (category_id) params.category_id = category_id;
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ページネーションボタンを生成（最大5ページ分）
  const getPageNumbers = () => {
    const pages: number[] = [];
    const maxPages = 5;

    // 現在のページを中心に5ページ分を計算
    let startPage = Math.max(1, currentPage - Math.floor(maxPages / 2));
    let endPage = startPage + maxPages - 1;

    // has_nextがfalseの場合、それより先のページは表示しない
    if (!hasNext && currentPage > 0) {
      endPage = Math.min(endPage, currentPage);
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

  // Convert ranking posts to PostCardProps format
  const convertToPostCards = (posts: any[]) => {
    return posts.map((post) => ({
      id: post.id,
      post_type: post.post_type || 1,
      title: post.description || '',
      thumbnail: post.thumbnail_url || '',
      duration: post.duration || '00:00',
      views: 0,
      likes: post.likes_count || 0,
      creator: {
        name: post.creator_name || '',
        username: post.username || '',
        avatar: post.creator_avatar_url || '',
        verified: false,
        official: post.official,
      },
      rank: post.rank,
      is_time_sale: post.is_time_sale || false,
    }));
  };

  return (
    <div className="w-full max-w-screen-md mx-auto bg-white space-y-6 pt-16">
      <div className="min-h-screen bg-white pb-20">
        <Header />
        <FilterSection
          tabItems={tabItems}
          timePeriodTabs={timePeriodTabs}
          onTabClick={handleTabClick}
          onTimePeriodClick={handleTimePeriodClick}
        />
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <PostsSection
            title={category}
            showMoreButton={false}
            posts={convertToPostCards(posts)}
            showRank={true}
            columns={2}
            onPostClick={handlePostClick}
            onCreatorClick={handleCreatorClick}
            onAuthRequired={() => setShowAuthDialog(true)}
          />
        )}

        {/* pagination section*/}
        <div className="max-w-screen-md mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-center space-x-2 items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={loading || !hasPrevious}
            aria-label="前のページ"
            className={!hasPrevious ? "invisible" : ""}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {/* {getPageNumbers().map((pageNum) => (
            <Button
              key={pageNum}
              variant={pageNum === currentPage ? "default" : "outline"}
              size="sm"
              onClick={() => handlePageChange(pageNum)}
              disabled={loading}
              className="min-w-[40px]"
            >
              {pageNum}
            </Button>
          ))} */}

          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={loading || !hasNext}
            aria-label="次のページ"
            className={!hasNext ? "invisible" : ""}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <AuthDialog isOpen={showAuthDialog} onClose={() => setShowAuthDialog(false)} />
        <BottomNavigation />
      </div>
    </div>
  );
}
