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
import AuthDialog from '@/components/auth/AuthDialog';

export default function PostRankingDetail() {
  const navigate = useNavigate();
  const location = useLocation();
  const { category, category_id } = location.state;
  const [activeTimePeriod, setActiveTimePeriod] = useState('all');
  const [posts, setPosts] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);

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
        setPage(1);
      } finally {
        setLoading(false);
      }
    },
    [activeTimePeriod, category, category_id]
  );

  useEffect(() => {
    fetchPosts(page);
  }, [page, fetchPosts]);

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
    setPage(1);
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
        <AuthDialog isOpen={showAuthDialog} onClose={() => setShowAuthDialog(false)} />
        <BottomNavigation />
      </div>
    </div>
  );
}
