import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import Header from '@/components/common/Header';
import BottomNavigation from '@/components/common/BottomNavigation';
import FilterSection from '@/features/ranking/section/FilterSection';
import CreatorsSection from '@/features/top/section/CreatorsSection';
import { TabItem } from '@/features/ranking/types';
import { getCreatorsRankingDetail } from '@/api/endpoints/ranking';
import { RankingCreator } from '@/api/types/creator';
import { toggleFollow } from '@/api/endpoints/social';
import { useAuth } from '@/providers/AuthContext';
import AuthDialog from '@/components/auth/AuthDialog';
import ErrorMessage from '@/components/common/ErrorMessage';
import { Creator } from '@/features/top/types';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CreatorRankingDetail() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();

  // URLパラメータまたはlocation.stateからcategoryとcategory_idを取得
  const category = searchParams.get('category') || location.state?.category || '総合ランキング';
  const category_id = searchParams.get('category_id') || location.state?.category_id || '';

  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [errorDialog, setErrorDialog] = useState<{ show: boolean; message: string }>({
    show: false,
    message: '',
  });
  const [activeTimePeriod, setActiveTimePeriod] = useState('all');
  const [rankingCreators, setRankingCreators] = useState<RankingCreator[] | []>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [loading, setLoading] = useState(false);

  // URLパラメータからページを取得（デフォルト: 1）
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  const tabItems: TabItem[] = [
    { id: 'posts', label: '投稿', isActive: false, linkTo: '/ranking/posts/detail' },
    { id: 'creators', label: 'クリエイター', isActive: true, linkTo: '/ranking/creators/detail' },
  ];

  const timePeriodTabs: TabItem[] = [
    { id: 'daily', label: '日間', isActive: activeTimePeriod === 'daily' },
    { id: 'weekly', label: '週間', isActive: activeTimePeriod === 'weekly' },
    { id: 'monthly', label: '月間', isActive: activeTimePeriod === 'monthly' },
    { id: 'all', label: '全期間', isActive: activeTimePeriod === 'all' },
  ];

  const fetchPosts = useCallback(
    async (pageNum: number) => {
      try {
        setLoading(true);
        const categoryParam = !category_id ? 'overall' : category_id.toString();
        const activeTimePeriodParam = activeTimePeriod == 'all' ? 'all_time' : activeTimePeriod;
        const response = await getCreatorsRankingDetail(
          categoryParam,
          activeTimePeriodParam,
          pageNum,
          20
        );
        if (response.status != 200) {
          throw new Error('Failed to fetch ranking creators');
        }
        setRankingCreators(response.data.creators);
        setHasNext(response.data.has_next);
        setHasPrevious(response.data.has_previous);
      } catch (err) {
        console.error('Posts ranking detail fetch error:', err);
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

  const handleCreatorClick = (username: string) => {
    navigate(`/profile?username=${username}`);
  };

  const handleCreatorFollowClick = async (isFollowing: boolean, creatorId: string) => {
    setIsFollowing(true);
    if (!user) {
      setShowAuthDialog(true);
      setIsFollowing(false);
      return;
    }
    try {
      const response = await toggleFollow(creatorId);
      if (response.status != 200) {
        throw new Error('フォローに失敗しました');
      }

      if (isFollowing) {
        setRankingCreators((prev) =>
          prev.map((creator) =>
            creator.id === creatorId
              ? { ...creator, follower_ids: creator.follower_ids.filter((id) => id !== user.id) }
              : creator
          )
        );
      } else {
        setRankingCreators((prev) =>
          prev.map((creator) =>
            creator.id === creatorId
              ? { ...creator, follower_ids: [...creator.follower_ids, user.id] }
              : creator
          )
        );
      }
      return;
    } catch (error) {
      console.error(error);
      setErrorDialog({ show: true, message: 'フォローに失敗しました' });
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    } finally {
      setIsFollowing(false);
    }
  };

  const convertCreators = (creators: Creator[]) => {
    return creators.map((creator) => {
      return {
        ...creator,
        is_following: creator.follower_ids.includes(user.id),
      };
    });
  };
  return (
    <div className="w-full max-w-screen-md mx-auto bg-white space-y-6 pt-16">
      <div className="min-h-screen bg-gray-50 pb-20">
        <Header />

        {errorDialog.show && (
          <ErrorMessage
            message={errorDialog.message}
            variant="error"
            onClose={() => setErrorDialog({ show: false, message: '' })}
          />
        )}

        <FilterSection
          tabItems={tabItems}
          timePeriodTabs={timePeriodTabs}
          onTabClick={handleTabClick}
          onTimePeriodClick={handleTimePeriodClick}
        />
        {user ? (
          <CreatorsSection
            title={category}
            showMoreButton={false}
            onShowMoreClick={() => navigate('/ranking/creators/detail')}
            creators={convertCreators(rankingCreators)}
            showRank={true}
            onCreatorClick={handleCreatorClick}
            onFollowClick={handleCreatorFollowClick}
            isShowFollowButton={isFollowing}
            isSpecialShow={true}
          />
        ) : (
          <CreatorsSection
            title={category}
            showMoreButton={false}
            onShowMoreClick={() => navigate('/ranking/creators/detail')}
            creators={rankingCreators}
            showRank={true}
            onCreatorClick={handleCreatorClick}
            onFollowClick={handleCreatorFollowClick}
            isShowFollowButton={isFollowing}
            isSpecialShow={true}
          />
        )}
        {showAuthDialog && (
          <AuthDialog isOpen={showAuthDialog} onClose={() => setShowAuthDialog(false)} />
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
        <BottomNavigation />
      </div>
    </div>
  );
}
