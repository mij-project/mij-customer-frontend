import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '@/components/common/Header';
import BottomNavigation from '@/components/common/BottomNavigation';
import FilterSection from '@/features/ranking/section/FilterSection';
import PostsSection from '@/components/common/PostsSection';
import {
  RankingCategoriesResponse,
  RankingOverallResponse,
  TabItem,
} from '@/features/ranking/types';
import { getPostsRankingOverall, getPostsRankingCategories } from '@/api/endpoints/ranking';
import AuthDialog from '@/components/auth/AuthDialog';

export default function PostRanking() {
  const navigate = useNavigate();
  const [activeTimePeriod, setActiveTimePeriod] = useState('all');
  const [rankingOverallData, setRankingOverallData] = useState<RankingOverallResponse | null>(null);
  const [currentOverallPosts, setCurrentOverallPosts] = useState<any[]>([]);
  const [rankingCategoriesData, setRankingCategoriesData] =
    useState<RankingCategoriesResponse | null>(null);
  const [currentCategoriesData, setCurrentCategoriesData] = useState<any[]>([]);
  const [showAuthDialog, setShowAuthDialog] = useState(false);

  useEffect(() => {
    const fetchRanking = async () => {
      try {
        // const response = await getPostsRankingOverall();
        const [overAllResponse, categoriesResponse] = await Promise.all([
          getPostsRankingOverall(),
          getPostsRankingCategories(),
        ]);
        setRankingOverallData(overAllResponse);
        setCurrentOverallPosts(overAllResponse.all_time || []);
        setRankingCategoriesData(categoriesResponse);
        setCurrentCategoriesData(categoriesResponse.all_time || []);
      } catch (error) {
        console.error('Error fetching ranking:', error);
      }
    };
    fetchRanking();
  }, []);

  // Update current posts when time period changes
  useEffect(() => {
    if (rankingOverallData) {
      switch (activeTimePeriod) {
        case 'daily':
          setCurrentOverallPosts(rankingOverallData.daily || []);
          setCurrentCategoriesData(rankingCategoriesData.daily || []);
          break;
        case 'weekly':
          setCurrentOverallPosts(rankingOverallData.weekly || []);
          setCurrentCategoriesData(rankingCategoriesData.weekly || []);
          break;
        case 'monthly':
          setCurrentOverallPosts(rankingOverallData.monthly || []);
          setCurrentCategoriesData(rankingCategoriesData.monthly || []);
          break;
        case 'all':
          setCurrentOverallPosts(rankingOverallData.all_time || []);
          setCurrentCategoriesData(rankingCategoriesData.all_time || []);
          break;
        default:
          setCurrentOverallPosts(rankingOverallData.daily || []);
          setCurrentCategoriesData(rankingCategoriesData.daily || []);
      }
    }
  }, [activeTimePeriod, rankingOverallData, rankingCategoriesData]);

  const tabItems: TabItem[] = [
    { id: 'posts', label: '投稿', isActive: true, linkTo: '/ranking/posts' },
    { id: 'creators', label: 'クリエイター', isActive: false, linkTo: '/ranking/creators' },
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
      views: post.views_count || 0,
      likes: post.likes_count || 0,
      creator: {
        name: post.creator_name || '',
        username: post.username || '',
        avatar: post.creator_avatar_url || '',
        verified: false,
      },
      rank: post.rank,
    }));
  };

  return (
    <div className="w-full max-w-screen-md mx-auto bg-white space-y-6 pt-16">
      <div className="min-h-screen bg-gray-50 pb-20">
        <Header />
        <FilterSection
          tabItems={tabItems}
          timePeriodTabs={timePeriodTabs}
          onTabClick={handleTabClick}
          onTimePeriodClick={handleTimePeriodClick}
        />
        {/* Overall ranking section */}
        <PostsSection
          title={'総合ランキング'}
          showMoreButton={true}
          onMoreClick={() => {
            navigate('/ranking/posts/overall', {
              state: { category: '総合ランキング', category_id: '' },
            });
          }}
          posts={convertToPostCards(currentOverallPosts)}
          showRank={true}
          columns={2}
          onPostClick={handlePostClick}
          onCreatorClick={handleCreatorClick}
          onAuthRequired={() => setShowAuthDialog(true)}
        />
        {/* Categories ranking section  */}
        {currentCategoriesData &&
          currentCategoriesData.map((category) => (
            <PostsSection
              key={category.category_id}
              title={category.category_name}
              showMoreButton={true}
              onMoreClick={() => {
                navigate(`/ranking/posts/detail`, {
                  state: { category: category.category_name, category_id: category.category_id },
                });
              }}
              posts={convertToPostCards(category.posts)}
              showRank={true}
              columns={2}
              onPostClick={handlePostClick}
              onCreatorClick={handleCreatorClick}
              onAuthRequired={() => setShowAuthDialog(true)}
            />
          ))}
        <AuthDialog isOpen={showAuthDialog} onClose={() => setShowAuthDialog(false)} />
        <BottomNavigation />
      </div>
    </div>
  );
}
