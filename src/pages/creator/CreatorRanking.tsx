import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/common/Header';
import BottomNavigation from '@/components/common/BottomNavigation';
import FilterSection from '@/features/ranking/section/FilterSection';
import CreatorsSection from '@/features/top/section/CreatorsSection';
import { TabItem } from '@/features/ranking/types';
import { getCreatorsRankingCategories, getCreatorsRankingOverall } from '@/api/endpoints/ranking';
import { RankingCreator, RankingCreatorCategories, RankingCreators, RankingCreatorsCategories } from '@/api/types/creator';
import { toggleFollow } from '@/api/endpoints/social';
import { useAuth } from '@/providers/AuthContext';
import AuthDialog from '@/components/auth/AuthDialog';
import ErrorMessage from '@/components/common/ErrorMessage';
import { Creator } from '@/features/top/types';

export default function CreatorRanking() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [errorDialog, setErrorDialog] = useState<{ show: boolean; message: string }>({
    show: false,
    message: '',
  });
  const [activeTimePeriod, setActiveTimePeriod] = useState('all');
  const [rankingCreatorsOverall, setRankingCreatorsOverall] = useState<RankingCreators | null>(null);
  const [rankingCreatorsCategories, setRankingCreatorsCategories] = useState<RankingCreatorsCategories | null>(null);
  const [currentRankingCreatorsOverall, setCurrentRankingCreatorsOverall] = useState<RankingCreator[] | []>([]);
  const [currentRankingCreatorsCategories, setCurrentRankingCreatorsCategories] = useState<RankingCreatorCategories[] | []>([]);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    const fetchRankingCreators = async () => {
      try {
        // const response = await getCreatorsRankingOverall();
        const [overallResponse, categoriesResponse] = await Promise.all([
          getCreatorsRankingOverall(),
          getCreatorsRankingCategories(),
        ]);
        setRankingCreatorsOverall(overallResponse.data);
        setRankingCreatorsCategories(categoriesResponse.data);
      } catch (error) {
        console.log('Error fetching ranking creators:', error);
      }
    };
    fetchRankingCreators();
  }, []);

  useEffect(() => {
    if (rankingCreatorsOverall) {
      switch (activeTimePeriod) {
        case 'daily':
          setCurrentRankingCreatorsOverall(rankingCreatorsOverall.daily || []);
          setCurrentRankingCreatorsCategories(rankingCreatorsCategories.daily || []);
          break;
        case 'weekly':
          setCurrentRankingCreatorsOverall(rankingCreatorsOverall.weekly || []);
          setCurrentRankingCreatorsCategories(rankingCreatorsCategories.weekly || []);
          break;
        case 'monthly':
          setCurrentRankingCreatorsOverall(rankingCreatorsOverall.monthly || []);
          setCurrentRankingCreatorsCategories(rankingCreatorsCategories.monthly || []);
          break;
        case 'all':
          setCurrentRankingCreatorsOverall(rankingCreatorsOverall.all_time || []);
          setCurrentRankingCreatorsCategories(rankingCreatorsCategories.all_time || []);
          break;
        default:
          setCurrentRankingCreatorsOverall(rankingCreatorsOverall.all_time || []);
          setCurrentRankingCreatorsCategories(rankingCreatorsCategories.all_time || []);
      }
    }
  }, [activeTimePeriod, rankingCreatorsOverall]);

  const tabItems: TabItem[] = [
    { id: 'posts', label: '投稿', isActive: false, linkTo: '/ranking/posts' },
    { id: 'creators', label: 'クリエイター', isActive: true, linkTo: '/ranking/creators' },
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
      navigate(tabLink);
    }
  };

  const handleTimePeriodClick = (periodId: string) => {
    setActiveTimePeriod(periodId);
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
        setRankingCreatorsOverall((prev) => ({
          ...prev,
          ["all_time"]: prev?.["all_time"]?.length > 0 ? prev?.["all_time"].map((creator) =>
            creator.id === creatorId
              ? { ...creator, follower_ids: creator.follower_ids.filter((id) => id !== user.id) }
              : creator
          ) : [],
          ["daily"]: prev?.["daily"]?.length > 0 ? prev?.["daily"].map((creator) =>
            creator.id === creatorId
              ? { ...creator, follower_ids: creator.follower_ids.filter((id) => id !== user.id) }
              : creator
          ) : [],
          ["weekly"]: prev?.["weekly"]?.length > 0 ? prev?.["weekly"].map((creator) =>
            creator.id === creatorId
              ? { ...creator, follower_ids: creator.follower_ids.filter((id) => id !== user.id) }
              : creator
          ) : [],
          ["monthly"]: prev?.["monthly"]?.length > 0 ? prev?.["monthly"].map((creator) =>
            creator.id === creatorId
              ? { ...creator, follower_ids: creator.follower_ids.filter((id) => id !== user.id) }
              : creator
          ) : [],
        }));
        setRankingCreatorsCategories((prev) => (
          {
            ...prev,
            ["all_time"]: prev?.["all_time"]?.map((category) => (
              {
                ...category,
                creators: category.creators.map((creator) =>
                  creator.id === creatorId
                    ? { ...creator, follower_ids: creator.follower_ids.filter((id) => id !== user.id) }
                    : creator
                )
              }
            )),
            ["daily"]: prev?.["daily"].map((category) => (
              {
                ...category,
                creators: category.creators.map((creator) =>
                  creator.id === creatorId
                    ? { ...creator, follower_ids: creator.follower_ids.filter((id) => id !== user.id) }
                    : creator
                )
              }
            )),
            ["weekly"]: prev?.["weekly"].map((category) => (
              {
                ...category,
                creators: category.creators.map((creator) =>
                  creator.id === creatorId
                    ? { ...creator, follower_ids: creator.follower_ids.filter((id) => id !== user.id) }
                    : creator
                )
              }
            )),
            ["monthly"]: prev?.["monthly"].map((category) => (
              {
                ...category,
                creators: category.creators.map((creator) =>
                  creator.id === creatorId
                    ? { ...creator, follower_ids: creator.follower_ids.filter((id) => id !== user.id) }
                    : creator
                )
              }
            )),
          }
        ));
      } else {
        setRankingCreatorsOverall((prev) => ({
          ...prev,
          ["all_time"]: prev?.["all_time"].map((creator) =>
            creator.id === creatorId
              ? { ...creator, follower_ids: [...creator.follower_ids, user.id] }
              : creator
          ),
          ["daily"]: prev?.["daily"].map((creator) =>
            creator.id === creatorId
              ? { ...creator, follower_ids: [...creator.follower_ids, user.id] }
              : creator
          ),
          ["weekly"]: prev?.["weekly"].map((creator) =>
            creator.id === creatorId
              ? { ...creator, follower_ids: [...creator.follower_ids, user.id] }
              : creator
          ),
          ["monthly"]: prev?.["monthly"].map((creator) =>
            creator.id === creatorId
              ? { ...creator, follower_ids: [...creator.follower_ids, user.id] }
              : creator
          ),
        }));
        setRankingCreatorsCategories((prev) => (
          {
            ...prev,
            ["all_time"]: prev?.["all_time"]?.map((category) => (
              {
                ...category,
                creators: category.creators.map((creator) =>
                  creator.id === creatorId
                    ? { ...creator, follower_ids: [...creator.follower_ids, user.id] }
                    : creator
                )
              }
            )),
            ["daily"]: prev?.["daily"].map((category) => (
              {
                ...category,
                creators: category.creators.map((creator) =>
                  creator.id === creatorId
                    ? { ...creator, follower_ids: [...creator.follower_ids, user.id] }
                    : creator
                )
              }
            )),
            ["weekly"]: prev?.["weekly"].map((category) => (
              {
                ...category,
                creators: category.creators.map((creator) =>
                  creator.id === creatorId
                    ? { ...creator, follower_ids: [...creator.follower_ids, user.id] }
                    : creator
                )
              }
            )),
            ["monthly"]: prev?.["monthly"].map((category) => (
              {
                ...category,
                creators: category.creators.map((creator) =>
                  creator.id === creatorId
                    ? { ...creator, follower_ids: [...creator.follower_ids, user.id] }
                    : creator
                )
              }
            )),
          }
        ));
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
          <>
            <CreatorsSection
              key="overall"
              title="総合ランキング"
              showMoreButton={true}
              onShowMoreClick={() => navigate('/ranking/creators/detail', { state: { category: '総合ランキング', category_id: 'overall' } })}
              creators={convertCreators(currentRankingCreatorsOverall)}
              showRank={true}
              onCreatorClick={handleCreatorClick}
              onFollowClick={handleCreatorFollowClick}
              isShowFollowButton={isFollowing}
              isSpecialShow={true}
            />
            {
              currentRankingCreatorsCategories && currentRankingCreatorsCategories.map((category) => (
                <CreatorsSection
                  key={category.category_id}
                  title={category.category_name}
                  showMoreButton={true}
                  onShowMoreClick={() => navigate('/ranking/creators/detail', { state: { category: category.category_name, category_id: category.category_id } })}
                  creators={convertCreators(category.creators)}
                  showRank={true}
                  onCreatorClick={handleCreatorClick}
                  onFollowClick={handleCreatorFollowClick}
                  isShowFollowButton={isFollowing}
                  isSpecialShow={true}
                />
              ))
            }
          </>
        ) : (
          <>
            <CreatorsSection
              key="overall"
              title="総合ランキング"
              showMoreButton={true}
              onShowMoreClick={() => navigate('/ranking/creators/detail', { state: { category: '総合ランキング', category_id: 'overall' } })}
              creators={currentRankingCreatorsOverall}
              showRank={true}
              onCreatorClick={handleCreatorClick}
              onFollowClick={handleCreatorFollowClick}
              isShowFollowButton={isFollowing}
              isSpecialShow={true}
            />
            {
              currentRankingCreatorsCategories && currentRankingCreatorsCategories.map((category) => (
                <CreatorsSection
                  key={category.category_id}
                  title={category.category_name}
                  showMoreButton={true}
                  onShowMoreClick={() => navigate('/ranking/creators/detail', { state: { category: category.category_name, category_id: category.category_id } })}
                  creators={category.creators}
                  showRank={true}
                  onCreatorClick={handleCreatorClick}
                  onFollowClick={handleCreatorFollowClick}
                  isShowFollowButton={isFollowing}
                  isSpecialShow={true}
                />
              ))
            }
          </>
        )}
        {showAuthDialog && (
          <AuthDialog isOpen={showAuthDialog} onClose={() => setShowAuthDialog(false)} />
        )}
        <BottomNavigation />
      </div>
    </div>
  );
}
