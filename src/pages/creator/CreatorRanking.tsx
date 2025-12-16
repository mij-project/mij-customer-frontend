import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/common/Header';
import BottomNavigation from '@/components/common/BottomNavigation';
import FilterSection from '@/features/ranking/section/FilterSection';
import CreatorsSection from '@/features/top/section/CreatorsSection';
import { TabItem } from '@/features/ranking/types';
import { getCreatorsRankingCategories, getCreatorsRankingOverall } from '@/api/endpoints/ranking';
import {
  RankingCreator,
  RankingCreatorCategories,
  RankingCreators,
  RankingCreatorsCategories,
} from '@/api/types/creator';
import { toggleFollow } from '@/api/endpoints/social';
import { useAuth } from '@/providers/AuthContext';
import AuthDialog from '@/components/auth/AuthDialog';
import ErrorMessage from '@/components/common/ErrorMessage';
import { Creator } from '@/features/top/types';

type TimePeriod = 'daily' | 'weekly' | 'monthly' | 'all';

function pickCreatorsByPeriod(
  period: TimePeriod,
  overall: RankingCreators | null
): RankingCreator[] {
  if (!overall) return [];
  switch (period) {
    case 'daily':
      return overall.daily || [];
    case 'weekly':
      return overall.weekly || [];
    case 'monthly':
      return overall.monthly || [];
    case 'all':
    default:
      return overall.all_time || [];
  }
}

function pickCategoriesByPeriod(
  period: TimePeriod,
  categories: RankingCreatorsCategories | null
): RankingCreatorCategories[] {
  if (!categories) return [];
  switch (period) {
    case 'daily':
      return categories.daily || [];
    case 'weekly':
      return categories.weekly || [];
    case 'monthly':
      return categories.monthly || [];
    case 'all':
    default:
      return categories.all_time || [];
  }
}

function toggleFollowerIds(args: {
  followerIds?: string[] | null;
  userId: string;
  currentlyFollowing: boolean;
}): string[] {
  const current = args.followerIds || [];
  if (args.currentlyFollowing) {
    return current.filter((id) => id !== args.userId);
  }
  // tránh duplicate
  if (current.includes(args.userId)) return current;
  return [...current, args.userId];
}

function updateCreatorsArray(args: {
  creators: RankingCreator[] | undefined;
  creatorId: string;
  userId: string;
  currentlyFollowing: boolean;
}): RankingCreator[] {
  const list = args.creators || [];
  return list.map((c) =>
    c.id === args.creatorId
      ? {
        ...c,
        follower_ids: toggleFollowerIds({
          followerIds: c.follower_ids,
          userId: args.userId,
          currentlyFollowing: args.currentlyFollowing,
        }),
      }
      : c
  );
}

function updateCategoriesArray(args: {
  categories: RankingCreatorCategories[] | undefined;
  creatorId: string;
  userId: string;
  currentlyFollowing: boolean;
}): RankingCreatorCategories[] {
  const list = args.categories || [];
  return list.map((cat) => ({
    ...cat,
    creators: cat.creators.map((c) =>
      c.id === args.creatorId
        ? {
          ...c,
          follower_ids: toggleFollowerIds({
            followerIds: c.follower_ids,
            userId: args.userId,
            currentlyFollowing: args.currentlyFollowing,
          }),
        }
        : c
    ),
  }));
}

export default function CreatorRanking() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [errorDialog, setErrorDialog] = useState<{ show: boolean; message: string }>({
    show: false,
    message: '',
  });

  const [activeTimePeriod, setActiveTimePeriod] = useState<TimePeriod>('all');

  const [rankingCreatorsOverall, setRankingCreatorsOverall] = useState<RankingCreators | null>(
    null
  );
  const [rankingCreatorsCategories, setRankingCreatorsCategories] =
    useState<RankingCreatorsCategories | null>(null);

  const [isFollowLoading, setIsFollowLoading] = useState(false);

  useEffect(() => {
    const ac = new AbortController();

    const fetchRankingCreators = async () => {
      try {
        const [overallResponse, categoriesResponse] = await Promise.all([
          getCreatorsRankingOverall(ac.signal),
          getCreatorsRankingCategories(ac.signal),
        ]);
        setRankingCreatorsOverall(overallResponse.data);
        setRankingCreatorsCategories(categoriesResponse.data);
      } catch (err: any) {
        if (err?.name === 'CanceledError' || err?.name === 'AbortError') return;
        console.log('Error fetching ranking creators:', err);
      }
    };

    fetchRankingCreators();
    return () => ac.abort();
  }, []);

  const tabItems: TabItem[] = useMemo(
    () => [
      { id: 'posts', label: '投稿', isActive: false, linkTo: '/ranking/posts' },
      { id: 'creators', label: 'クリエイター', isActive: true, linkTo: '/ranking/creators' },
    ],
    []
  );

  const timePeriodTabs: TabItem[] = useMemo(
    () => [
      { id: 'daily', label: '日間', isActive: activeTimePeriod === 'daily' },
      { id: 'weekly', label: '週間', isActive: activeTimePeriod === 'weekly' },
      { id: 'monthly', label: '月間', isActive: activeTimePeriod === 'monthly' },
      { id: 'all', label: '全期間', isActive: activeTimePeriod === 'all' },
    ],
    [activeTimePeriod]
  );

  const currentOverall = useMemo(
    () => pickCreatorsByPeriod(activeTimePeriod, rankingCreatorsOverall),
    [activeTimePeriod, rankingCreatorsOverall]
  );

  const currentCategories = useMemo(
    () => pickCategoriesByPeriod(activeTimePeriod, rankingCreatorsCategories),
    [activeTimePeriod, rankingCreatorsCategories]
  );

  const convertCreators = (creators: Creator[]) => {
    const uid = user?.id;
    return creators.map((creator) => ({
      ...creator,
      is_following: uid ? (creator.follower_ids || []).includes(uid) : false,
    }));
  };

  const handleTabClick = (tabId: string) => {
    const tabLink = tabItems.find((tab) => tab.id === tabId)?.linkTo;
    if (tabLink) navigate(tabLink);
  };

  const handleTimePeriodClick = (periodId: string) => {
    setActiveTimePeriod(periodId as TimePeriod);
  };

  const handleCreatorClick = (username: string) => {
    navigate(`/profile?username=${username}`);
  };

  const handleCreatorFollowClick = async (currentlyFollowing: boolean, creatorId: string) => {
    if (!user) {
      setShowAuthDialog(true);
      return;
    }

    setIsFollowLoading(true);

    try {
      const response = await toggleFollow(creatorId);
      if (response.status !== 200) throw new Error('フォローに失敗しました');

      const userId = user.id;

      setRankingCreatorsOverall((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          all_time: updateCreatorsArray({
            creators: prev.all_time,
            creatorId,
            userId,
            currentlyFollowing,
          }),
          daily: updateCreatorsArray({
            creators: prev.daily,
            creatorId,
            userId,
            currentlyFollowing,
          }),
          weekly: updateCreatorsArray({
            creators: prev.weekly,
            creatorId,
            userId,
            currentlyFollowing,
          }),
          monthly: updateCreatorsArray({
            creators: prev.monthly,
            creatorId,
            userId,
            currentlyFollowing,
          }),
        };
      });

      setRankingCreatorsCategories((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          all_time: updateCategoriesArray({
            categories: prev.all_time,
            creatorId,
            userId,
            currentlyFollowing,
          }),
          daily: updateCategoriesArray({
            categories: prev.daily,
            creatorId,
            userId,
            currentlyFollowing,
          }),
          weekly: updateCategoriesArray({
            categories: prev.weekly,
            creatorId,
            userId,
            currentlyFollowing,
          }),
          monthly: updateCategoriesArray({
            categories: prev.monthly,
            creatorId,
            userId,
            currentlyFollowing,
          }),
        };
      });
    } catch (error) {
      console.error(error);
      setErrorDialog({ show: true, message: 'フォローに失敗しました' });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsFollowLoading(false);
    }
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

        <CreatorsSection
          key="overall"
          title="総合ランキング"
          showMoreButton={true}
          onShowMoreClick={() =>
            navigate('/ranking/creators/detail?category=総合ランキング&category_id=overall')
          }
          creators={convertCreators(currentOverall as unknown as Creator[])}
          showRank={true}
          onCreatorClick={handleCreatorClick}
          onFollowClick={handleCreatorFollowClick}
          isShowFollowButton={isFollowLoading}
          isSpecialShow={true}
        />

        {currentCategories.map((category) => (
          <CreatorsSection
            key={category.category_id}
            title={category.category_name}
            showMoreButton={true}
            onShowMoreClick={() =>
              navigate(
                `/ranking/creators/detail?category=${encodeURIComponent(
                  category.category_name
                )}&category_id=${category.category_id}`
              )
            }
            creators={convertCreators(category.creators as unknown as Creator[])}
            showRank={true}
            onCreatorClick={handleCreatorClick}
            onFollowClick={handleCreatorFollowClick}
            isShowFollowButton={isFollowLoading}
            isSpecialShow={true}
          />
        ))}

        <AuthDialog isOpen={showAuthDialog} onClose={() => setShowAuthDialog(false)} />
        <BottomNavigation />
      </div>
    </div>
  );
}
