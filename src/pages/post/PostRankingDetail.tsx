import React, { useState, useEffect, use, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '@/components/common/Header';
import BottomNavigation from '@/components/common/BottomNavigation';
import FilterSection from '@/features/ranking/section/FilterSection';
import PostsSection from '@/components/common/PostsSection';
import { RankingOverallResponse, TabItem } from '@/features/ranking/types';
import { getPostsRankingDetail } from '@/api/endpoints/ranking';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function PostRankingDetail() {
  const navigate = useNavigate();
  const location = useLocation();
  const { genre, genre_id } = location.state;
  const [activeTimePeriod, setActiveTimePeriod] = useState('all');
  const [posts, setPosts] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchPosts = useCallback(
    async (pageNum: number) => {
      try {
        setLoading(true);
        const genre_param = !genre_id ? 'overall' : genre_id.toString();
        const term_param = activeTimePeriod === 'all' ? 'all_time' : activeTimePeriod;
        const data = await getPostsRankingDetail(genre_param, term_param, pageNum, 20);
        setPosts(data.posts);
        setHasNext(data.has_next);
        setHasPrevious(data.has_previous);
      } catch (err) {
        console.error('Posts ranking detail fetch error:', err);
        setPosts([]);
        setHasNext(false);
        setHasPrevious(false);
        setPage(1);
      } finally {
        setLoading(false);
      }
    },
    [activeTimePeriod, genre, genre_id]
  );

  useEffect(() => {
    fetchPosts(1);
  }, [fetchPosts]);

  useEffect(() => {
    if (page > 1) {
      fetchPosts(page);
    }
  }, [page, fetchPosts]);

  const tabItems: TabItem[] = [
    { id: 'posts', label: '投稿', isActive: true },
    // { id: 'creators', label: 'ユーザー', isActive: false, linkTo: '/ranking/creators' },
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
    setPage(1);
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
    return posts.map((post) => ({
      id: post.id,
      post_type: post.post_type || 1,
      title: post.description || '',
      thumbnail: post.thumbnail_url || '',
      duration: '00:00',
      views: 0,
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
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <PostsSection
            title={genre}
            showMoreButton={false}
            posts={convertToPostCards(posts)}
            showRank={true}
            columns={2}
            onPostClick={handlePostClick}
            onCreatorClick={handleCreatorClick}
          />
        )}

        {/* pagination section*/}
        <div className="max-w-screen-md mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-center gap-2">
          {hasPrevious && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((prev) => prev - 1)}
              disabled={loading}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          )}
          {hasNext && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((prev) => prev + 1)}
              disabled={loading}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>
        <BottomNavigation />
      </div>
    </div>
  );
}
