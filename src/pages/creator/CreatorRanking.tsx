import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/common/Header';
import BottomNavigation from '@/components/common/BottomNavigation';
import FilterSection from '@/features/ranking/section/FilterSection';
import CreatorsSection from '@/features/top/section/CreatorsSection';
import { TabItem } from '@/features/ranking/types';
import { getCreatorsRankingOverall } from '@/api/endpoints/ranking';
import { RankingCreator, RankingCreators } from '@/api/types/creator';
import { toggleFollow } from '@/api/endpoints/social';
import { useAuth } from '@/providers/AuthContext';
import AuthDialog from '@/components/auth/AuthDialog';
import ErrorMessage from '@/components/common/ErrorMessage';
import { Creator } from '@/features/top/types';

export default function CreatorRanking() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [errorDialog, setErrorDialog] = useState<{ show: boolean, message: string }>({ show: false, message: '' });
  const [activeTimePeriod, setActiveTimePeriod] = useState('all');
  const [rankingCreators, setRankingCreators] = useState<RankingCreators | null>(null);
  const [currentRankingCreators, setCurrentRankingCreators] = useState<RankingCreator[] | []>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  useEffect(() => {
    const fetchRankingCreators = async () => {
      try {
        const response = await getCreatorsRankingOverall();
        if (response.status != 200) {
          throw new Error('Failed to fetch ranking creators');
        }
        setRankingCreators(response.data);
      } catch (error) {
        console.error('Error fetching ranking creators:', error);
      }
    };
    fetchRankingCreators();
  }, []);

  useEffect(() => {
    if (rankingCreators) {
      switch (activeTimePeriod) {
        case 'daily':
          setCurrentRankingCreators(rankingCreators.daily || []);
          break;
        case 'weekly':
          setCurrentRankingCreators(rankingCreators.weekly || []);
          break;
        case 'monthly':
          setCurrentRankingCreators(rankingCreators.monthly || []);
          break;
        case 'all':
          setCurrentRankingCreators(rankingCreators.all_time || []);
          break;
        default:
          setCurrentRankingCreators(rankingCreators.all_time || []);

      }
    }
  }, [activeTimePeriod, rankingCreators]);

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
    navigate(`/account/profile?username=${username}`);
  };

  const handleCreatorFollowClick = async (isFollowing: boolean, creatorId: string) => {
    setIsFollowing(true);
    if (!user) {
      setShowAuthDialog(true);
      setIsFollowing(false);
      return;
    }
    try {
      const response = await toggleFollow(creatorId)
      if (response.status != 200) {
        throw new Error('フォローに失敗しました');
      }
      const current = activeTimePeriod == "all" ? "all_time" : activeTimePeriod;

      if (isFollowing) {
        setRankingCreators(prev => ({
          ...prev,
          [current]: prev?.[current].map(creator => creator.id === creatorId ? { ...creator, follower_ids: creator.follower_ids.filter(id => id !== user.id) } : creator)
        }));
      } else {
        setRankingCreators(prev => ({
          ...prev,
          [current]: prev?.[current].map(creator => creator.id === creatorId ? { ...creator, follower_ids: [...creator.follower_ids, user.id] } : creator)
        }));
      }
      return
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
  }
  return (
    <div className="w-full max-w-screen-md mx-auto bg-white space-y-6 pt-16">
      <div className="min-h-screen bg-gray-50 pb-20">
        <Header />
        {errorDialog.show && <ErrorMessage message={errorDialog.message} variant="error" onClose={() => setErrorDialog({ show: false, message: '' })} />}
        <FilterSection
          tabItems={tabItems}
          timePeriodTabs={timePeriodTabs}
          onTabClick={handleTabClick}
          onTimePeriodClick={handleTimePeriodClick}
        />
        {
          user ? (
            <CreatorsSection
              title="集合ランキング"
              showMoreButton={true}
              onShowMoreClick={() => navigate('/ranking/creators/detail')}
              creators={convertCreators(currentRankingCreators)}
              showRank={true}
              onCreatorClick={handleCreatorClick}
              onFollowClick={handleCreatorFollowClick}
              isShowFollowButton={isFollowing}
              isSpecialShow={true}
            />
          ) : (
            <CreatorsSection
              title="集合ランキング"
              showMoreButton={true}
              onShowMoreClick={() => navigate('/ranking/creators/detail')}
              creators={currentRankingCreators}
              showRank={true}
              onCreatorClick={handleCreatorClick}
              onFollowClick={handleCreatorFollowClick}
              isShowFollowButton={isFollowing}
              isSpecialShow={true}
            />
          )
        }
        {showAuthDialog && <AuthDialog isOpen={showAuthDialog} onClose={() => setShowAuthDialog(false)} />}
        <BottomNavigation />
      </div>
    </div>
  );
}
