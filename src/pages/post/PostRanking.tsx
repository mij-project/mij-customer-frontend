import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/common/Header';
import BottomNavigation from '@/components/common/BottomNavigation';
import FilterSection from '@/features/postRanking/section/FilterSection';
import PostsSection from '@/components/common/PostsSection';
import { RankingResponse, TabItem } from '@/features/postRanking/types';
import { getRanking } from '@/api/endpoints/ranking';

export default function PostRanking() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('posts');
  const [activeTimePeriod, setActiveTimePeriod] = useState('all');
  const [rankingData, setRankingData] = useState<RankingResponse | null>(null);
  const [currentPosts, setCurrentPosts] = useState<any[]>([]);

  useEffect(() => {
    const fetchRanking = async () => {
      try {
        const response = await getRanking();
        setRankingData(response);
        setCurrentPosts(response.daily || []);
      } catch (error) {
        console.error('Error fetching ranking:', error);
      }
    };
    fetchRanking();
  }, []);

  // Update current posts when time period changes
  useEffect(() => {
    if (rankingData) {
      switch (activeTimePeriod) {
        case 'daily':
          setCurrentPosts(rankingData.daily || []);
          break;
        case 'weekly':
          setCurrentPosts(rankingData.weekly || []);
          break;
        case 'monthly':
          setCurrentPosts(rankingData.monthly || []);
          break;
        case 'all':
          setCurrentPosts(rankingData.all_time || []);
          break;
        default:
          setCurrentPosts(rankingData.daily || []);
      }
    }
  }, [activeTimePeriod, rankingData]);

  const tabItems: TabItem[] = [
    { id: 'posts', label: '投稿', isActive: activeTab === 'posts' },
    { id: 'creators', label: 'ユーザー', isActive: activeTab === 'creators' }
  ];

  const timePeriodTabs: TabItem[] = [
    { id: 'daily', label: '日間', isActive: activeTimePeriod === 'daily' },
    { id: 'weekly', label: '週間', isActive: activeTimePeriod === 'weekly' },
    { id: 'monthly', label: '月間', isActive: activeTimePeriod === 'monthly' },
    { id: 'all', label: '全期間', isActive: activeTimePeriod === 'all' }
  ];

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
  };

  const handleTimePeriodClick = (periodId: string) => {
    setActiveTimePeriod(periodId);
  };

  const handlePostClick = (postId: string) => {
    navigate(`/post/detail?post_id=${postId}`);
  };

  const handleCreatorClick = (username: string) => {
    navigate(`/account/profile?username=${username}`);
  };

  // Convert ranking posts to PostCardProps format
  const convertToPostCards = (posts: any[]) => {
    return posts.map(post => ({
      id: post.id,
      title: post.description || '',
      thumbnail: post.thumbnail_url || '',
      duration: '00:00',
      views: 0,
      likes: post.likes_count || 0,
      creator: {
        name: post.creator_name || '',
        username: post.username || '',
        avatar: post.creator_avatar_url || '',
        verified: false
      },
      rank: post.rank
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
        <PostsSection
          title={activeTab === 'posts' ? '総合ランキング' : 'ユーザーランキング'}
          showMoreButton={false}
          posts={convertToPostCards(currentPosts)}
          showRank={true}
          columns={2}
          onPostClick={handlePostClick}
          onCreatorClick={handleCreatorClick}
        />
        <BottomNavigation />
      </div>
    </div>
  );
}
